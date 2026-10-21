import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const usage = 'Usage: npm run test:whatsapp -- "<Chromium browser executable>" [http://127.0.0.1:3000] [capture-label]\nRequires an existing local Chromium browser and a running frontend. Writes screenshots and metrics to .preview/.';
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
const label = process.argv[4] || 'whatsapp';
assert.match(label, /^[a-zA-Z0-9_-]+$/, 'Capture label must contain only letters, numbers, underscores or hyphens');
const output = fileURLToPath(new URL('../.preview/', import.meta.url));
mkdirSync(output, { recursive: true });
const child = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--remote-debugging-port=0',
  `--user-data-dir=${path.join(output, `whatsapp-profile-${process.pid}`)}`, 'about:blank',
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

  await cdp('Runtime.enable');
  await cdp('Network.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  const runtimeErrors = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
  });
  const clickToggle = async expected => {
    const position = await cdp('Runtime.evaluate', {
      expression: `(() => { const r = document.querySelector('.motion-toggle').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`, returnByValue: true,
    });
    const { x, y } = position.result.value;
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    const result = await cdp('Runtime.evaluate', {
      expression: `new Promise((resolve, reject) => {
        const deadline = performance.now() + 5000;
        const observe = () => {
          const toggle = document.querySelector('.motion-toggle'), button = document.querySelector('.whatsapp-float-button');
          const state = { pressed: toggle.getAttribute('aria-pressed'), label: toggle.getAttribute('aria-label'), motion: document.querySelector('.whatsapp-float').dataset.motion, button: getComputedStyle(button).animationPlayState, halo: getComputedStyle(button, '::before').animationPlayState };
          const paused = ${JSON.stringify(expected)};
          if (state.pressed === String(paused) && state.motion === (paused ? 'paused' : 'running') && state.button === (paused ? 'paused' : 'running') && state.halo === state.button && state.label === (paused ? 'Reanudar animación de WhatsApp' : 'Pausar animación de WhatsApp')) return resolve(state);
          if (performance.now() >= deadline) return reject(new Error('Toggle state did not settle: ' + JSON.stringify(state)));
          requestAnimationFrame(observe);
        };
        observe();
      })`, awaitPromise: true, returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  for (const width of [1440, 375]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
    for (const route of ['/', '/menu', '/nuestra-esencia', '/visitanos']) {
      const ready = new Promise(resolve => events.set('Page.loadEventFired', resolve));
      await cdp('Page.navigate', { url: new URL(route, target).href });
      await ready;
      const pausedState = await clickToggle(true);
      const resumedState = await clickToggle(false);
      const result = await cdp('Runtime.evaluate', {
        expression: `(async () => {
          await document.fonts.ready;
          const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          await frame();
          const floats = [...document.querySelectorAll('.whatsapp-float')];
          const button = document.querySelector('.whatsapp-float-button');
          const toggle = document.querySelector('.motion-toggle');
          const rect = element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; };
          const initial = rect(button);

          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); await frame();
          const occupied = [rect(button), rect(toggle)];
          const overlap = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
          const footerCovered = [...document.querySelectorAll('.site-footer a')].some(link => occupied.some(r => overlap(r,rect(link))));
          const orderButtons = [...document.querySelectorAll('a,button')].filter(element => element.textContent.trim() === 'Pedir carrito por WhatsApp');
          window.scrollTo({ top: 0, behavior: 'instant' }); await frame();
          return { count: floats.length, disabled: button.disabled, destination: button.getAttribute('href'), footerCovered, initial, width: document.documentElement.clientWidth, orderCount: orderButtons.length, finalOrder: orderButtons.length === 1 && Boolean(orderButtons[0].closest('.cart-panel')) };
        })()`, awaitPromise: true, returnByValue: true,
      });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      const detail = result.result.value;
      assert.equal(pausedState.pressed, 'true');
      assert.equal(resumedState.pressed, 'false');
      assert.equal(detail.count, 1);
      assert.equal(runtimeErrors.length, 0, JSON.stringify(runtimeErrors));
      assert.ok(detail.disabled && !detail.destination && !detail.footerCovered, JSON.stringify({ route, width, detail }));
      assert.ok(detail.initial.left >= 0 && detail.initial.right <= detail.width && detail.initial.top >= 0 && detail.initial.bottom <= 900);
      if (route === '/menu') assert.ok(detail.orderCount === 1 && detail.finalOrder);
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      const reduced = await cdp('Runtime.evaluate', { expression: `({ animation: getComputedStyle(document.querySelector('.whatsapp-float-button')).animationName, control: getComputedStyle(document.querySelector('.motion-toggle')).display })`, returnByValue: true });
      assert.deepEqual(reduced.result.value, { animation: 'none', control: 'none' });
      await cdp('Emulation.setEmulatedMedia', { features: [] });
      const shot = await cdp('Page.captureScreenshot', { format: 'png' });
      writeFileSync(path.join(output, label + '-' + width + '-' + (route.slice(1) || 'home') + '.png'), Buffer.from(shot.data,'base64'));
      writeFileSync(path.join(output, label + '-' + width + '-' + (route.slice(1) || 'home') + '.json'), JSON.stringify({ route, width, pausedState, resumedState, detail }, null, 2));
      console.log('PASS ' + route + ' ' + width + 'px: one float, pause/resume, reduced motion, no footer overlap; order CTA count=' + detail.orderCount);
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
