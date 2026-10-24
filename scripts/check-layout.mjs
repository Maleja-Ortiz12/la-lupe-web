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
          headerSurface: (() => { const header = document.querySelector('.site-header'); const style = getComputedStyle(header); return { image: style.backgroundImage, color: style.backgroundColor, contentColor: getComputedStyle(document.querySelector('#contenido')).backgroundColor, shadow: style.boxShadow, border: parseFloat(style.borderBottomWidth), innerColor: getComputedStyle(header.querySelector('.header-inner')).backgroundColor, woodOpacity: getComputedStyle(header.querySelector('.corner-wood')).opacity, cornerImage: getComputedStyle(header.querySelector('.corner-wood')).backgroundImage, layers: style.backgroundSize.split(',').map(size => size.trim()), repeats: style.backgroundRepeat.split(',').map(repeat => repeat.trim()), cornerBottomGap: header.getBoundingClientRect().bottom - header.querySelector('.corner-wood').getBoundingClientRect().bottom }; })(),
          heroFontReady: Boolean(getComputedStyle(document.documentElement).getPropertyValue('--font-hero').trim()),
          readingFontReady: Boolean(getComputedStyle(document.documentElement).getPropertyValue('--font-reading').trim()),
          paragraphSize: parseFloat(getComputedStyle(document.querySelector('.card-copy > p')).fontSize),
          paragraphLineHeight: parseFloat(getComputedStyle(document.querySelector('.card-copy > p')).lineHeight),
          motion: (() => { const button = document.querySelector('.whatsapp-float-button'); const style = getComputedStyle(button), halo = getComputedStyle(button, '::before'); return { name: style.animationName, duration: style.animationDuration, iterations: style.animationIterationCount, halo: halo.animationName, haloDuration: halo.animationDuration, haloIterations: halo.animationIterationCount }; })(),
          headingAngle: (() => { const transform = getComputedStyle(document.querySelector('h1')).transform; if (transform === 'none') return 0; const matrix = new DOMMatrix(transform); return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI; })(),
          garnishCount: document.querySelectorAll('.flourish-garnish').length,
          floating: (() => { const element = document.querySelector('.whatsapp-float'); if (!element) return null; const button = element.querySelector('.whatsapp-float-button'); return { ...rect(element), position: getComputedStyle(element).position, disabled: Boolean(button.disabled), destination: element.querySelector('a')?.href || null, target: element.querySelector('a')?.target || null }; })(),
          viewportHeight: innerHeight,
          corner: (() => { const leaves = document.querySelector('.corner-leaves'), side = document.querySelector('.hero-side-textile'), hero = document.querySelector('#inicio'); if (!leaves || !side) return null; const l = rect(leaves), s = rect(side), h = rect(hero); return { leavesLeft: l.left, leavesTop: l.top + scrollY, leavesVisible: getComputedStyle(leaves).display !== 'none' && l.width > 20, sideLeft: s.left, sideWidth: s.width, sideCoversHero: s.top <= h.top + 2 && s.bottom >= h.bottom - 2, sideBg: getComputedStyle(side).backgroundImage }; })(),
          essenceStory: (() => { const section = document.querySelector('#nosotros'); return { demoFree: !/Historia de ejemplo|historia imaginada|Imagen de referencia/.test(section.textContent), cards: [...section.querySelectorAll('.essence-story-card')].map(rect), captions: section.querySelectorAll('.essence-story-card figcaption').length }; })(),
          logoCount: document.querySelectorAll('img[alt^="Logotipo original de La Lupe"]').length
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
    assert.ok(details.headerSurface.image.includes('header-wood.svg'), `${name}: reference header must have a visible vector wooden frame`);
    assert.ok(details.headerSurface.cornerImage.includes('header-wood.svg'), `${name}: original brown corner must retain the wood surface`);
    assert.ok(!/\.(?:png|jpe?g|webp)/i.test(details.headerSurface.image + details.headerSurface.cornerImage), `${name}: wooden frame must not introduce raster textures`);
    assert.ok(Math.abs(details.headerSurface.cornerBottomGap) <= .5, `${name}: corner wood must cover the bottom edge`);
    assert.equal(details.headerSurface.woodOpacity, '1', `${name}: corner wood must show its pronounced natural grain`);
    assert.equal(details.headerSurface.color, details.headerSurface.contentColor, `${name}: preserve the existing warm base color`);
    assert.ok(details.headerSurface.border >= 1 && details.headerSurface.shadow !== 'none', `${name}: header must separate visibly from the page`);
    assert.notEqual(details.headerSurface.innerColor, 'rgba(0, 0, 0, 0)', `${name}: reference needs a distinct light navigation strip inside the wood frame`);
    assert.ok(details.imagesLoaded, `${name}: image failed to load`);
    assert.equal(details.logoCount, 3, `${name}: original logos missing`);
    assert.equal(details.essenceStory.cards.length, 0, `${name}: full story belongs on its own page`);
    assert.ok(!details.headingFont.includes('Trebuchet'), `${name}: brush font missing`);
    assert.equal(details.sections.map(section => section.id).join(','), 'inicio,carta,catering,nosotros,contacto');
    assert.ok(details.heroFontReady && details.readingFontReady && details.motion.name === 'whatsapp-float' && details.motion.halo === 'whatsapp-halo', `${name}: requested typography/animation missing ${JSON.stringify({ hero: details.heroFontReady, reading: details.readingFontReady, motion: details.motion })}`);
    assert.equal(details.motion.duration, '3.6s');
    assert.equal(details.motion.iterations, 'infinite');
    assert.ok(parseFloat(details.motion.haloDuration) * Number(details.motion.haloIterations) <= 5, `${name}: halo must remain brief`);
    assert.ok(details.paragraphSize >= 16 && details.paragraphLineHeight / details.paragraphSize >= 1.35, `${name}: paragraphs too small or tight`);
    assert.ok(details.headingAngle < -1 && details.headingAngle > -4, `${name}: reference title tilt missing (${details.headingAngle})`);
    assert.ok(!details.bodyFont.includes('Trebuchet'), `${name}: reference body font missing`);
    // Specialties, essence and the catering heading carry two decorative leaves each.
    assert.equal(details.garnishCount, 6, `${name}: reference flourishes missing`);
    assert.ok(details.floating && details.floating.position === 'fixed', `${name}: floating WhatsApp missing`);
    assert.ok(!details.floating.disabled && details.floating.destination?.startsWith('https://wa.me/573116341836?text=') && details.floating.target === '_blank', `${name}: floating WhatsApp must open the order number in a new tab (${details.floating.destination})`);
    assert.ok(details.floating.left >= 0 && details.floating.right <= details.clientWidth && details.floating.top >= 0 && details.floating.bottom <= details.viewportHeight, `${name}: WhatsApp outside viewport`);
    for (const button of details.buttons) assert.ok(button.height >= 44, `${name}: button too short`);
    assert.ok(details.corner, `${name}: top-left reference details missing`);
    assert.ok(details.corner.leavesVisible && details.corner.leavesLeft <= 1 && details.corner.leavesTop <= 30, `${name}: palm leaves not anchored to the top-left corner`);
    assert.ok(Math.abs(details.corner.sideLeft) < 1 && details.corner.sideWidth >= (name === 'mobile' ? 10 : 14) && details.corner.sideCoversHero && details.corner.sideBg.includes('hero-side-textile'), `${name}: side textile border missing ${JSON.stringify(details.corner)}`);
    const controls = await cdp('Runtime.evaluate', {
      expression: `(async () => {
        const toggle = document.querySelector('.motion-toggle');
        const button = document.querySelector('.whatsapp-float-button'), initialURL = location.href;
        const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        window.scrollTo(0, document.documentElement.scrollHeight); await frame();
        const rect = element => element.getBoundingClientRect();
        const overlap = (a, b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
        const occupied = [rect(button)];
        const footerCovered = [...document.querySelectorAll('.site-footer a')].some(link => occupied.some(r => overlap(r, rect(link))));
        window.scrollTo(0,0); await frame();
        return { pauseAbsent: !toggle, footerCovered, noNavigation: location.href === initialURL, sameDestination: button.getAttribute('href') };
      })()`, awaitPromise: true, returnByValue: true,
    });
    observation.controls = controls.result.value;
    assert.equal(observation.controls.pauseAbsent, true, `${name}: WhatsApp pause control must be absent`);
    assert.ok(observation.controls.noNavigation && observation.controls.sameDestination?.startsWith('https://wa.me/573116341836'), `${name}: layout probe must not navigate or change the WhatsApp destination`);
    assert.equal(observation.controls.footerCovered, false, `${name}: floating controls cover footer links`);
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const reduced = await cdp('Runtime.evaluate', { expression: `({ button: getComputedStyle(document.querySelector('.whatsapp-float-button')).animationName, halo: getComputedStyle(document.querySelector('.whatsapp-float-button'), '::before').animationName, control: Boolean(document.querySelector('.motion-toggle')) })`, returnByValue: true });
    assert.deepEqual(reduced.result.value, { button: 'none', halo: 'none', control: false }, `${name}: reduced motion must disable animation and hide its control`);
    observation.reducedMotion = reduced.result.value;
    writeFileSync(path.join(output, `${label}-metrics.json`), JSON.stringify(observations, null, 2));
    await cdp('Emulation.setEmulatedMedia', { features: [] });
    const essenceLoaded = new Promise(resolve => events.set('Page.loadEventFired', resolve));
    await cdp('Page.navigate', { url: new URL('/nuestra-esencia', target).href });
    await essenceLoaded;
    const essence = await cdp('Runtime.evaluate', {
      expression: `(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(async image => { image.loading = 'eager'; await image.decode().catch(() => {}); }));
        const cards = [...document.querySelectorAll('.essence-story-card')].map(element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; });
        return {
          cards, width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
          images: [...document.images].every(image => image.complete && image.naturalWidth > 0),
          current: document.querySelector('.site-header [aria-current="page"]')?.getAttribute('href'),
          contact: document.querySelector('.site-header .button-small')?.getAttribute('href'),
          demoFree: !/Historia de ejemplo|historia imaginada|Imagen de referencia/.test(document.querySelector('#nosotros').textContent),
          headingCount: document.querySelectorAll('h1').length
        };
      })()`, awaitPromise: true, returnByValue: true,
    });
    if (essence.exceptionDetails) throw new Error(JSON.stringify(essence.exceptionDetails));
    const story = essence.result.value;
    assert.equal(story.current, '/nuestra-esencia');
    assert.equal(story.contact, '/menu');
    assert.equal(story.headingCount, 1);
    assert.ok(story.images && story.demoFree && story.scrollWidth <= story.width, `${name}: essence images, demo-free copy or width failed`);
    assert.equal(story.cards.length, 3);
    for (const card of story.cards) assert.ok(card.left >= 0 && card.right <= story.width, `${name}: essence card outside viewport`);
    if (name === 'mobile') assert.ok(story.cards[1].top >= story.cards[0].bottom && story.cards[2].top >= story.cards[1].bottom, 'mobile: essence cards must stack');
    observation.essencePage = story;
    const essenceMetrics = await cdp('Page.getLayoutMetrics');
    const essenceScreenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.ceil(essenceMetrics.cssContentSize.height), scale: 1 } });
    writeFileSync(path.join(output, `${label}-essence-${name}.png`), Buffer.from(essenceScreenshot.data, 'base64'));
    writeFileSync(path.join(output, `${label}-metrics.json`), JSON.stringify(observations, null, 2));
    const visitLoaded = new Promise(resolve => events.set('Page.loadEventFired', resolve));
    await cdp('Page.navigate', { url: new URL('/visitanos', target).href });
    await visitLoaded;
    const visit = await cdp('Runtime.evaluate', {
      expression: `(async () => {
        await document.fonts.ready;
        const map = document.querySelector('.visit-map');
        map.scrollIntoView({ block: 'center' });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const r = map.getBoundingClientRect();
        return {
          address: document.querySelector('address').textContent,
          current: document.querySelector('.site-header [aria-current="page"]')?.getAttribute('href'),
          width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
          map: { left: r.left, right: r.right, width: r.width, height: r.height, src: map.src },
          directions: document.querySelector('.visit-info .button').href,
          fallback: Boolean(document.querySelector('.visit-map-link'))
        };
      })()`, awaitPromise: true, returnByValue: true,
    });
    if (visit.exceptionDetails) throw new Error(JSON.stringify(visit.exceptionDetails));
    const visitDetails = visit.result.value;
    assert.equal(visitDetails.address, 'Cl. 2 #11-80, Chía, Cundinamarca');
    assert.equal(visitDetails.current, '/visitanos');
    assert.ok(visitDetails.scrollWidth <= visitDetails.width && visitDetails.map.left >= 0 && visitDetails.map.right <= visitDetails.width, `${name}: visit map overflow`);
    assert.ok(visitDetails.map.height >= 340 && visitDetails.map.width > 200 && visitDetails.fallback, `${name}: visit map or fallback missing`);
    assert.ok(visitDetails.directions.includes('destination=4.8533766%2C-74.0645729'));
    observation.visitPage = visitDetails;
    const visitMetrics = await cdp('Page.getLayoutMetrics');
    const visitScreenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.ceil(visitMetrics.cssContentSize.height), scale: 1 } });
    writeFileSync(path.join(output, `${label}-visit-${name}.png`), Buffer.from(visitScreenshot.data, 'base64'));
    writeFileSync(path.join(output, `${label}-metrics.json`), JSON.stringify(observations, null, 2));
    console.log(`PASS ${name} (${width}px): home, essence and visit page, map layout, address and route link checked`);
  }
  // Footer: one compact row on desktop, no long gaps, larger ornament, WhatsApp float never covering text.
  {
    const evaluate = async expression => { const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  for (const width of [1920, 1440, 1122, 800, 375]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<=600});
    const loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.navigate',{url:new URL('/',target).href});await loaded;
    await evaluate(`document.fonts.ready`);
    await evaluate(`window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})`);
    await new Promise(resolve=>setTimeout(resolve,300));
    const m = await evaluate(`(()=>{const r=e=>e.getBoundingClientRect();const f=document.querySelector('.site-footer');const rows=list=>new Set(list.map(e=>Math.round(r(e).top))).size;const links=[...f.querySelectorAll('nav a')];const phones=[...f.querySelectorAll('.footer-phones li')];const p=f.querySelector('.footer-inner > p');const lh=parseFloat(getComputedStyle(p).lineHeight);const orn=f.querySelector('.mexican-ornament');const wa=document.querySelector('.whatsapp-float-button');const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;return {footer:Math.round(r(f).height),linkRows:rows(links),phoneRows:rows(phones),paragraphLines:Math.round(r(p).height/lh),ornament:Math.round(r(orn).width),linkGap:links.length>1?Math.round(r(links[1]).left-r(links[0]).right):0,waCoversContent:[...f.querySelectorAll('a,li,.footer-inner > p,.footer-note')].some(e=>{const range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()].some(box=>overlap(box,r(wa)))}),maxGap:(()=>{const blocks=[...f.querySelectorAll('.brand,.footer-inner > p,.footer-links,.footer-phones')].map(r).filter(b=>b.height>0).sort((a,b)=>a.top-b.top);let gap=0,bottom=blocks[0].bottom;for(const b of blocks.slice(1)){gap=Math.max(gap,b.top-bottom);bottom=Math.max(bottom,b.bottom)}return Math.round(gap)})(),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
    const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`footer-desktop-${width}.png`),Buffer.from(shot.data,'base64'));
        assert.equal(m.overflow, false, `${width}: no horizontal overflow`);
    assert.equal(m.waCoversContent, false, `${width}: floating WhatsApp leaves footer content uncovered`);
    assert.equal(m.linkRows, 1, `${width}: quick links on one line`);
    assert.equal(m.phoneRows, width <= 600 ? m.phoneRows : 1, `${width}: phone numbers on one line`);
    if (width > 950) {
      assert.ok(m.paragraphLines <= 2, `${width}: footer text keeps its two lines (${m.paragraphLines})`);
      // One row from 1280px; laptops use two rows (phones centered below) so nothing wraps.
      assert.ok(m.footer <= (width >= 1280 ? 190 : 240), `${width}: compact footer height (${m.footer}px)`);
    }
    assert.ok(m.ornament >= (width <= 600 ? 200 : 220), `${width}: larger footer ornament (${m.ornament}px)`);
    assert.ok(m.maxGap <= 32, `${width}: no long empty gap between footer blocks (${m.maxGap}px)`);
    console.log(`PASS ${width}px footer: links one row, ornament ${m.ornament}px, height ${m.footer}px`);
  }
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
