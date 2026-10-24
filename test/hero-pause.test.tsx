import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

type Slide = { props: { className: string; src: string } };
type HeroTree = { props: {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  children: [Slide[], { props: { onFocus: () => void; onBlur: () => void } }];
} };

// Execute the production component with deterministic hooks and time, without changing its event handlers.
function mountHero() {
  const values: unknown[] = [];
  const effects: { deps: unknown[]; cleanup?: () => void }[] = [];
  let cursor = 0;
  let effectCursor = 0;
  let timer: (() => void) | undefined;
  const pending: (() => void)[] = [];
  const react = {
    useState(initial: unknown) {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [values[index], (next: unknown) => { values[index] = typeof next === 'function' ? next(values[index]) : next; }];
    },
    useEffect(callback: () => (() => void) | void, deps: unknown[]) {
      const index = effectCursor++;
      const previous = effects[index];
      if (!previous || deps.some((dep, i) => dep !== previous.deps[i])) pending.push(() => {
        previous?.cleanup?.();
        effects[index] = { deps, cleanup: callback() || undefined };
      });
    },
  };
  const jsx = (type: unknown, props: unknown) => ({ type, props });
  const source = readFileSync('src/features/presentation/components/hero-dish-slides.tsx', 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports: Record<string, () => HeroTree> = {};
  const nativeRequire = createRequire(import.meta.url);
  runInNewContext(output, {
    exports,
    require: (id: string) => id === 'react' ? react : id === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : id === 'next/image' ? { default: 'img' } : nativeRequire(id),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    document: { visibilityState: 'visible' },
    setInterval: (callback: () => void) => { timer = callback; return 1; },
    clearInterval: () => { timer = undefined; },
  });
  let tree: HeroTree;
  const render = () => { cursor = 0; effectCursor = 0; tree = exports.HeroDishSlides(); pending.splice(0).forEach(effect => effect()); return tree; };
  render();
  return {
    enter() { tree.props.onPointerEnter(); render(); },
    leave() { tree.props.onPointerLeave(); render(); },
    focus() { tree.props.children[1].props.onFocus(); render(); },
    blur() { tree.props.children[1].props.onBlur(); render(); },
    tick() { timer?.(); render(); },
    active() { return tree.props.children[0].find((slide: Slide) => slide.props.className.includes('is-active'))!.props.src; },
  };
}

for (const remaining of ['focus', 'hover'] as const) {
  test(`hero stays paused while ${remaining} remains after overlapping hover and focus`, () => {
    const hero = mountHero();
    const first = hero.active();
    hero.enter();
    hero.focus();
    if (remaining === 'focus') hero.leave(); else hero.blur();
    hero.tick();
    assert.equal(hero.active(), first);
    if (remaining === 'focus') hero.blur(); else hero.leave();
    hero.tick();
    assert.notEqual(hero.active(), first, 'rotation resumes only once both interactions end');
  });
}
