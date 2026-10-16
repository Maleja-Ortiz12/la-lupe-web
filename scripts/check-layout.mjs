import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const usage = 'Usage: npm run test:layout -- "<Chromium browser executable>" [http://127.0.0.1:3000] [capture-label]\nRequires an existing local Chromium browser and a running frontend. Writes screenshots and metrics to .preview/.';
if (process.argv.includes('--help')) {
  console.log(usage);
  process.exit(0);
}
const browser = process.argv[2];
if (!browser) {
  console.error(usage);
  process.exit(1);
}
const target = process.argv[3] || 'http://127.0.0.1:3000';
const label = process.argv[4] || 'layout';
assert.match(label, /^[a-zA-Z0-9_-]+$/, 'Capture label must contain only letters, numbers, underscores or hyphens');
const output = fileURLToPath(new URL('../.preview/', import.meta.url));
mkdirSync(output, { recursive: true });
const child = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--remote-debugging-port=0',
  `--user-data-dir=${path.join(output, 'layout-profile')}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
const deadline = setTimeout(() => {
  console.error('Layout verification exceeded 45 seconds');
  child.kill();
  process.exit(1);
}, 45000);

try {
  const endpoint = await new Promise((resolve, reject) => {
    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) resolve(match[1]);
    });
    child.once('error', reject);
    child.once('exit', code => reject(new Error(`Browser exited before startup: ${code}`)));
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const requests = new Map();
  const events = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    const request = requests.get(message.id);
    if (request) {
      requests.delete(message.id);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
    const event = events.get(message.method);
    if (event) { events.delete(message.method); event(message.params); }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++sequence;
    requests.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const cdp = (method, params) => send(method, params, sessionId);
  await cdp('Page.enable');
  const observations = [];
  for (const [name, width, height] of [['wide', 1920, 1080], ['laptop', 1440, 900], ['reference', 1122, 1402], ['mobile', 375, 812]]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: name === 'mobile' });
    const loaded = new Promise(resolve => events.set('Page.loadEventFired', resolve));
    await cdp('Page.navigate', { url: target });
    await loaded;
    const result = await cdp('Runtime.evaluate', {
      expression: `(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(async image => {
          image.loading = 'eager';
          if (!image.complete) await new Promise(resolve => { image.onload = resolve; image.onerror = resolve; });
          await image.decode().catch(() => {});
        }));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const rect = element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
        return {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          frame: [...document.querySelectorAll('.demo-bar,.site-header,#contenido,.site-footer')].map(element => ({ name: element.id || element.className, ...rect(element) })),
          sections: [...document.querySelectorAll('main > section')].map(element => ({ id: element.id, ...rect(element) })),
          buttons: [...document.querySelectorAll('.hero-actions .button')].map(rect),
          imagesLoaded: [...document.images].every(image => image.complete && image.naturalWidth > 0),
          headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
          bodyFont: getComputedStyle(document.body).fontFamily,
          heroFontReady: Boolean(getComputedStyle(document.documentElement).getPropertyValue('--font-hero').trim()),
          readingFontReady: Boolean(getComputedStyle(document.documentElement).getPropertyValue('--font-reading').trim()),
          paragraphSize: parseFloat(getComputedStyle(document.querySelector('.card-copy > p')).fontSize),
          paragraphLineHeight: parseFloat(getComputedStyle(document.querySelector('.card-copy > p')).lineHeight),
          motion: (() => { const button = document.querySelector('.whatsapp-float-button'); const style = getComputedStyle(button), halo = getComputedStyle(button, '::before'); return { name: style.animationName, duration: style.animationDuration, iterations: style.animationIterationCount, halo: halo.animationName, haloDuration: halo.animationDuration, haloIterations: halo.animationIterationCount }; })(),
          headingAngle: (() => { const transform = getComputedStyle(document.querySelector('h1')).transform; if (transform === 'none') return 0; const matrix = new DOMMatrix(transform); return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI; })(),
          garnishCount: document.querySelectorAll('.flourish-garnish').length,
          floating: (() => { const element = document.querySelector('.whatsapp-float'); if (!element) return null; const button = element.querySelector('.whatsapp-float-button'); return { ...rect(element), position: getComputedStyle(element).position, disabled: button.disabled, destination: element.querySelector('a')?.href || null }; })(),
          viewportHeight: innerHeight,
          corner: (() => { const leaves = document.querySelector('.corner-leaves'), side = document.querySelector('.hero-side-textile'), hero = document.querySelector('#inicio'); if (!leaves || !side) return null; const l = rect(leaves), s = rect(side), h = rect(hero); return { leavesLeft: l.left, leavesTop: l.top + scrollY, leavesVisible: getComputedStyle(leaves).display !== 'none' && l.width > 20, sideLeft: s.left, sideWidth: s.width, sideCoversHero: s.top <= h.top + 2 && s.bottom >= h.bottom - 2, sideBg: getComputedStyle(side).backgroundImage }; })(),
          logoCount: document.querySelectorAll('img[src*="la-lupe"],img[srcset*="la-lupe"]').length
        };
      })()`,
      awaitPromise: true, returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    const details = result.result.value;
    const observation = { name, viewport: width, ...details };
    observations.push(observation);
    const { cssContentSize } = await cdp('Page.getLayoutMetrics');
    const screenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.ceil(cssContentSize.height), scale: 1 } });
    writeFileSync(path.join(output, `${label}-${name}.png`), Buffer.from(screenshot.data, 'base64'));
    writeFileSync(path.join(output, `${label}-metrics.json`), JSON.stringify(observations, null, 2));
    for (const frame of details.frame) {
      assert.ok(Math.abs(frame.left) < 1, `${name}: ${frame.name} leaves ${frame.left.toFixed(1)}px outside design`);
      assert.ok(Math.abs(frame.right - details.clientWidth) < 1, `${name}: ${frame.name} does not reach the right edge`);
    }
    assert.ok(details.scrollWidth <= details.clientWidth, `${name}: horizontal overflow`);
    assert.ok(details.imagesLoaded, `${name}: image failed to load`);
    assert.equal(details.logoCount, 3, `${name}: original logos missing`);
    assert.ok(!details.headingFont.includes('Trebuchet'), `${name}: brush font missing`);
    assert.equal(details.sections.map(section => section.id).join(','), 'inicio,carta,nosotros,contacto');
    assert.ok(details.heroFontReady && details.readingFontReady && details.motion.name === 'whatsapp-float' && details.motion.halo === 'whatsapp-halo', `${name}: requested typography/animation missing ${JSON.stringify({ hero: details.heroFontReady, reading: details.readingFontReady, motion: details.motion })}`);
    assert.equal(details.motion.duration, '3.6s');
    assert.equal(details.motion.iterations, 'infinite');
    assert.ok(parseFloat(details.motion.haloDuration) * Number(details.motion.haloIterations) <= 5, `${name}: halo must remain brief`);
    assert.ok(details.paragraphSize >= 16 && details.paragraphLineHeight / details.paragraphSize >= 1.35, `${name}: paragraphs too small or tight`);
    assert.ok(details.headingAngle < -1 && details.headingAngle > -4, `${name}: reference title tilt missing (${details.headingAngle})`);
    assert.ok(!details.bodyFont.includes('Trebuchet'), `${name}: reference body font missing`);
    assert.equal(details.garnishCount, 4, `${name}: reference flourishes missing`);
    assert.ok(details.floating && details.floating.position === 'fixed', `${name}: floating WhatsApp missing`);
    assert.ok(details.floating.disabled && !details.floating.destination, `${name}: demo WhatsApp must not navigate`);
    assert.ok(details.floating.left >= 0 && details.floating.right <= details.clientWidth && details.floating.top >= 0 && details.floating.bottom <= details.viewportHeight, `${name}: WhatsApp outside viewport`);
    for (const button of details.buttons) assert.ok(button.height >= 44, `${name}: button too short`);
    assert.ok(details.corner, `${name}: top-left reference details missing`);
    assert.ok(details.corner.leavesVisible && details.corner.leavesLeft <= 1 && details.corner.leavesTop <= 30, `${name}: palm leaves not anchored to the top-left corner`);
    assert.ok(Math.abs(details.corner.sideLeft) < 1 && details.corner.sideWidth >= (name === 'mobile' ? 10 : 14) && details.corner.sideCoversHero && details.corner.sideBg.includes('hero-side-textile'), `${name}: side textile border missing ${JSON.stringify(details.corner)}`);
    const controls = await cdp('Runtime.evaluate', {
      expression: `(async () => {
        const toggle = document.querySelector('.motion-toggle');
        if (!toggle) return { missing: true };
        const button = document.querySelector('.whatsapp-float-button'), initialURL = location.href;
        const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        toggle.click(); await frame();
        const paused = { pressed: toggle.getAttribute('aria-pressed'), state: getComputedStyle(button).animationPlayState, label: toggle.getAttribute('aria-label') };
        toggle.click(); await frame();
        const resumed = { pressed: toggle.getAttribute('aria-pressed'), state: getComputedStyle(button).animationPlayState };
        window.scrollTo(0, document.documentElement.scrollHeight); await frame();
        const rect = element => element.getBoundingClientRect();
        const overlap = (a, b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
        const occupied = [rect(button), rect(toggle)];
        const footerCovered = [...document.querySelectorAll('.site-footer a')].some(link => occupied.some(r => overlap(r, rect(link))));
        window.scrollTo(0,0); await frame();
        return { paused, resumed, footerCovered, noNavigation: location.href === initialURL, stillDisabled: button.disabled };
      })()`, awaitPromise: true, returnByValue: true,
    });
    observation.controls = controls.result.value;
    assert.equal(observation.controls.paused?.pressed, 'true', `${name}: pause control missing or inactive`);
    assert.equal(observation.controls.paused.state, 'paused');
    assert.equal(observation.controls.paused.label, 'Reanudar animación de WhatsApp');
    assert.deepEqual(observation.controls.resumed, { pressed: 'false', state: 'running' });
    assert.ok(observation.controls.noNavigation && observation.controls.stillDisabled, `${name}: pause must not enable contact`);
    assert.equal(observation.controls.footerCovered, false, `${name}: floating controls cover footer links`);
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const reduced = await cdp('Runtime.evaluate', { expression: `({ button: getComputedStyle(document.querySelector('.whatsapp-float-button')).animationName, halo: getComputedStyle(document.querySelector('.whatsapp-float-button'), '::before').animationName, control: getComputedStyle(document.querySelector('.motion-toggle')).display })`, returnByValue: true });
    assert.deepEqual(reduced.result.value, { button: 'none', halo: 'none', control: 'none' }, `${name}: reduced motion must disable animation and hide its control`);
    observation.reducedMotion = reduced.result.value;
    writeFileSync(path.join(output, `${label}-metrics.json`), JSON.stringify(observations, null, 2));
    await cdp('Emulation.setEmulatedMedia', { features: [] });
    console.log(`PASS ${name} (${width}px): full width, typography, disabled animated WhatsApp and reduced motion checked`);
  }
  await send('Browser.close');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  if (socket) socket.close();
  child.kill();
}
