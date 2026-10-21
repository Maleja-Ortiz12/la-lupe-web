import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const usage = 'Usage: npm run test:cart -- "<Chromium browser executable>" [http://127.0.0.1:3000] [capture-label]\nRequires an existing local Chromium browser and a running frontend. Writes screenshots and metrics to .preview/.';
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
const label = process.argv[4] || 'cart';
assert.match(label, /^[a-zA-Z0-9_-]+$/, 'Capture label must contain only letters, numbers, underscores or hyphens');
const output = fileURLToPath(new URL('../.preview/', import.meta.url));
mkdirSync(output, { recursive: true });
const child = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--remote-debugging-port=0',
  `--user-data-dir=${path.join(output, `cart-profile-${process.pid}`)}`, 'about:blank',
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
  const errors = [];
  socket.addEventListener('message', ({ data }) => { const m = JSON.parse(data); if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails); });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const wait = condition => evaluate(`new Promise((resolve,reject) => { const end=performance.now()+5000; const check=()=>{if(${condition}) return resolve(true); if(performance.now()>end) return reject(new Error('Unmet cart condition')); requestAnimationFrame(check);}; check(); })`);
  const query = label => JSON.stringify(label === 'Agregar más productos' ? '.cart-continue' : label === 'Ver carrito' ? '.cart-jump' : `[aria-label=${JSON.stringify(label)}]`);
  const click = async label => {
    const point = await evaluate(`(()=>{const e=document.querySelector(${query(label)});if(!e)throw new Error('Missing control: '+${JSON.stringify(label)});e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,disabled:e.disabled};})()`);
    assert.equal(point.disabled,false,label);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  };
  const subtotal = value => wait(`document.querySelector('.cart-subtotal strong').textContent===${JSON.stringify(value)}`);
  const capture = async (width,suffix) => {
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    const {cssContentSize}=await cdp('Page.getLayoutMetrics');
    const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:Math.ceil(cssContentSize.height),scale:1}});
    writeFileSync(path.join(output,`${label}-${width}-${suffix}.png`),Buffer.from(image.data,'base64'));
  };
  const observations=[];
  for(const width of [1440,1122,375]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===375});
    const loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));
    await cdp('Page.navigate',{url:new URL('/menu',target).href});await loaded;
    await evaluate(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));})()`);
    await subtotal('$0');
    assert.equal(await evaluate(`document.querySelector('.cart-panel').hidden`), true);
    await capture(width, 'catalog');
    await click('Ver carrito');
    await wait(`!document.querySelector('.cart-panel').hidden && document.activeElement.id === 'cart-title'`);
    await click('Agregar más productos');
    await wait(`document.querySelector('.cart-panel').hidden && document.activeElement.classList.contains('menu-products')`);
    assert.equal(await evaluate(`document.querySelector('.cart-checkout').disabled`),true);
    assert.equal(await evaluate(`document.querySelector(${query('Reducir cantidad de Entradas “X2”')}).disabled`),true);
    await click('Aumentar cantidad de Entradas “X2”');
    await wait(`document.querySelector(${query('Unidades de Entradas “X2”')}).textContent==='2'`);
    await click('Agregar Entradas “X2”');await subtotal('$45.000');
    await wait(`!document.querySelector('.cart-panel').hidden && document.activeElement.id === 'cart-title'`);
    const cartInView = await evaluate(`document.querySelector('#cart-title').getBoundingClientRect().top`);
    assert.ok(cartInView >= 0 && cartInView < 150, 'Adding must bring the cart heading into view');
    await click('Agregar más productos');
    await wait(`document.querySelector('.cart-panel').hidden && document.activeElement.getAttribute('aria-label') === 'Agregar Entradas “X2”'`);
    await subtotal('$45.000');
    await click('Agregar Entradas “X2”');await subtotal('$90.000');
    assert.equal(await evaluate(`document.querySelectorAll('.cart-line').length`),1);
    await click('Reducir cantidad de carrito: Entradas “X2”');await subtotal('$67.500');
    await click('Quitar Entradas “X2”');await subtotal('$0');
    await click('Reducir cantidad de Entradas “X2”');
    await wait(`document.querySelector(${query('Unidades de Entradas “X2”')}).textContent==='1'`);
    await click('Agregar Entradas “X2”');await subtotal('$22.500');
    await click('Agregar Fajitas De Pollo (1/2 Orden)');await subtotal('$53.000');
    const reference=await evaluate(`({subtotal:document.querySelector('.cart-subtotal strong').textContent,lines:[...document.querySelectorAll('.cart-line')].map(e=>({name:e.querySelector('h3').textContent,quantity:e.querySelector('output').textContent,total:e.querySelector('.cart-line-total').textContent}))})`);
    await capture(width,'reference');
    await click('Aumentar cantidad de carrito: Fajitas De Pollo (1/2 Orden)');await subtotal('$83.500');
    await click('Reducir cantidad de carrito: Fajitas De Pollo (1/2 Orden)');await subtotal('$53.000');
    await evaluate(`(()=>{const e=document.querySelector(${query('Porción de Fajitas De Pollo')});e.value='full';e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await wait(`Boolean(document.querySelector(${query('Agregar Fajitas De Pollo (Full Orden)')}))`);
    await click('Agregar Fajitas De Pollo (Full Orden)');await subtotal('$111.000');
    assert.equal(await evaluate(`document.querySelectorAll('.cart-line').length`),3);
    await click('Agregar Taquiza 6 per. (40 T)');await subtotal('$231.000');
    const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};return {width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,panel:rect(document.querySelector('.cart-panel')),products:rect(document.querySelector('.menu-products')),disabled:document.querySelector('.cart-checkout').disabled,href:document.querySelector('.cart-checkout').getAttribute('href'),lines:document.querySelectorAll('.cart-line').length,floats:document.querySelectorAll('.whatsapp-float').length,url:location.href,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0)}})()`);
    assert.equal(state.lines,4);assert.equal(state.floats,1);assert.equal(state.disabled,true);assert.equal(state.href,null);
    assert.ok(state.url.endsWith('/menu'));
    assert.ok(state.scrollWidth<=state.width&&state.panel.left>=0&&state.panel.right<=state.width,JSON.stringify(state));
    assert.ok(state.images,'Cart images not loaded');
    if(width===375) {
      assert.ok(state.panel.top>=state.products.bottom,'Mobile cart must stack');
      assert.equal(await evaluate(`[...document.querySelectorAll('.menu-table-scroll')].every(e => e.scrollWidth <= e.clientWidth + 1)`), true, 'Mobile options must fit without horizontal scrolling');
      assert.equal(await evaluate(`[...document.querySelectorAll('.cart-stepper button,.cart-add,.cart-continue')].filter(e => e.getClientRects().length).every(e => e.getBoundingClientRect().height >= 44)`), true, 'Mobile controls must be at least 44px high');
    }
    else assert.ok(state.panel.left>=state.products.right,'Desktop cart must sit beside products');
    await capture(width,'variants');
    for(const name of ['Entradas “X2”','Fajitas De Pollo (1/2 Orden)','Fajitas De Pollo (Full Orden)','Taquiza 6 per. (40 T)'])await click('Quitar '+name);
    await subtotal('$0');assert.equal(await evaluate(`document.querySelectorAll('.cart-line').length`),0);
    await click('Agregar Entradas “X2”');await subtotal('$22.500');
    const reloaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.reload',{ignoreCache:true});await reloaded;await subtotal('$0');
    assert.equal(await evaluate(`document.querySelector('.cart-panel').hidden`), true);
    assert.equal(errors.length,0,JSON.stringify(errors));
    observations.push({viewport:width,reference,state,emptyAfterReload:true});
    writeFileSync(path.join(output,`${label}-results.json`),JSON.stringify(observations,null,2));
    console.log(`PASS ${width}px: reveal on add, add-more preserves cart/focus, quantities, variants, $53.000 reference, removal, reset, responsive spacing`);
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
