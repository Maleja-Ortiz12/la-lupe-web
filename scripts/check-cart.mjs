import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const usage = 'Usage: npm run test:cart -- "<Chromium browser executable>" [http://127.0.0.1:3000] [capture-label]\nChecks unified product-card popups, Entrada mixta X2/X4/X6 prices, portions/flavors, exact multi-picks, quantities, cart and WhatsApp on desktop and mobile. Requires an existing local Chromium browser and a running frontend. Writes screenshots and metrics to .preview/.';
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
  console.error('Cart verification exceeded 150 seconds');
  child.kill();
  process.exit(1);
}, 150000);

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
  const subtotal = value => (process.env.CART_TRACE && console.log('  subtotal', value), wait(`document.querySelector('.cart-subtotal strong').textContent===${JSON.stringify(value)}`));
  const observations=[];
  const tap = async selector => {
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'center',inline:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,disabled:e.disabled}})()`);
    assert.ok(point.w>0&&!point.disabled,'Visible enabled control: '+selector);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  };
  const choose = async (name, checkbox=false) => {
    const point=await evaluate(`(()=>{const label=[...document.querySelectorAll('#opciones-producto label')].find(l=>l.querySelector('input[type=${checkbox?'checkbox':'radio'}]')&&l.textContent.trim().startsWith(${JSON.stringify(name)}));if(!label)throw Error('Missing choice '+${JSON.stringify(name)});label.scrollIntoView({block:'center',behavior:'instant'});const r=label.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,disabled:label.querySelector('input').disabled}})()`);
    assert.equal(point.disabled,false,name);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  };
  const escape = async () => {
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  };
  const ready = () => wait(`(()=>{const e=document.querySelector('.cart-jump');return e&&Object.keys(e).some(k=>k.startsWith('__reactProps'))})()`);
  for(const width of [1440,1122,375,742]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width===375});
    const loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.navigate',{url:new URL('/menu',target).href});await loaded;
    await ready();await evaluate(`document.fonts.ready`);
    const card = id => width>760?`#plato-${id}`:`.menu-section:not(#platos-estrella) .m-card[data-item="${id}"]`;
    const entry = id => card(id)+(width>760?' .dish-options':' .m-add');
    const open = async id => {await tap(entry(id));await wait(`document.querySelector('#opciones-producto').open&&Boolean(document.querySelector('#opciones-producto .sheet-actions'))`);};
    const add = async () => {await tap('#opciones-producto .sheet-actions .cart-add');await wait(`!document.querySelector('#opciones-producto').open`);};
    const geometry=()=>evaluate(`(()=>{const r=document.querySelector('.menu-products').getBoundingClientRect();return {x:r.x,w:r.width,scroll:scrollY}})()`);
    await subtotal('$0');
    assert.equal(await evaluate(`document.querySelector('.cart-panel').open`),false);
    // The same five Entradas remain five products, not seven cards split by size.
    assert.equal(await evaluate(`document.querySelectorAll('${width>760?'#entradas .dish-card':'#entradas .m-card'}').length`),5);
    for(const [size,price] of [['X2','$40.900'],['X4','$81.900'],['X6','$112.900']]){
      await open('entrada-mixta');
      assert.equal(await evaluate(`document.activeElement.id`),'opciones-title');
      const labels=await evaluate(`[...document.querySelectorAll('#opciones-producto .sheet-group label')].map(l=>l.textContent)`);
      for(const text of ['X2$40.900','X4$81.900','X6$112.900'])assert.ok(labels.includes(text),'complete size/price list: '+text);
      await choose(size);
      await wait(`document.querySelector('#opciones-producto .sheet-actions .cart-add').textContent.includes('${price}')`);
      await add();
      assert.equal(await evaluate(`document.activeElement===document.querySelector(${JSON.stringify(entry('entrada-mixta'))})`),true,'return focus to Agregar');
    }
    await subtotal('$235.700');
    // Direct products still add without opening a modal, scrolling, or changing catalog width.
    const nachos=card('nachos-grandes')+(width>760?' .cart-add':' .m-add');
    await evaluate(`document.querySelector(${JSON.stringify(nachos)}).scrollIntoView({block:'center',inline:'center',behavior:'instant'})`);
    const before=await geometry();await tap(nachos);await subtotal('$274.600');
    assert.deepEqual(await geometry(),before,'simple Add leaves catalog geometry stable');
    assert.equal(await evaluate(`document.querySelector('.cart-panel').open||document.querySelector('#opciones-producto').open`),false);
    await wait(`document.querySelector('.cart-feedback').textContent==='Agregado al carrito con éxito'`);
    // Fajitas: both portions/prices plus proteins in the dialog, not an inline price table.
    await open('fajitas-famosas');
    await escape();await wait(`!document.querySelector('#opciones-producto').open`);
    assert.equal(await evaluate(`document.activeElement===document.querySelector(${JSON.stringify(entry('fajitas-famosas'))})`),true,'Escape restores focus');
    await open('fajitas-famosas');await choose('Pollo');await choose('1/2 Orden');await add();await subtotal('$360.500');
    await open('fajitas-famosas');await choose('Carne');await choose('Full Orden');
    await tap('#opciones-producto .sheet-actions .cart-stepper button:last-child');
    await wait(`document.querySelector('#opciones-producto .sheet-actions .cart-add').textContent.includes('$231.800')`);
    const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`${label}-${width}-fajitas-popup.png`),Buffer.from(shot.data,'base64'));
    await add();await subtotal('$592.300');
    await open('enchiladas');await choose('Salsa Mole');await add();await subtotal('$635.200');
    await open('tacos');await choose('Carnitas');await add();await subtotal('$676.100');
    // Taquiza and Churros still reject incomplete choices and preserve their exact-count requirements.
    await open('taquiza');assert.equal(await evaluate(`document.querySelector('#opciones-producto .sheet-actions .cart-add').disabled`),true);
    await choose('4 personas');
    for(const meat of ['Al Pastor','Pescado','Camarón'])await choose(meat,true);
    assert.equal(await evaluate(`document.querySelectorAll('#opciones-producto input[type=checkbox]:disabled').length`),4);
    await add();await subtotal('$832.000');
    await open('churros');await choose('2 toppings');
    assert.equal(await evaluate(`document.querySelector('#opciones-producto .sheet-actions .cart-add').disabled`),true);
    await choose('Arequipe',true);assert.equal(await evaluate(`document.querySelector('#opciones-producto .sheet-actions .cart-add').disabled`),true);
    await choose('Helado',true);await add();await subtotal('$856.900');
    await open('te-o-soda-hatsu');await choose('Soda');await add();await subtotal('$870.800');
    await tap(card('mojito')+(width>760?' .cart-add':' .m-add'));await subtotal('$870.800');
    // Cart shows each complete selection and preserves manual WhatsApp ordering, including pending prices.
    const beforeCart=await geometry();await tap('.cart-jump');await wait(`document.querySelector('.cart-panel').open`);
    const afterCart=await geometry();assert.equal(afterCart.x,beforeCart.x);assert.equal(afterCart.w,beforeCart.w);
    const expected=['Entrada mixta (X2)','Entrada mixta (X4)','Entrada mixta (X6)','Fajitas Famosas (1/2 Orden · Pollo)','Fajitas Famosas (Full Orden · Carne)','Enchiladas (Salsa Mole)','Tacos (X5 · Carnitas)','Taquiza (4 personas · Al Pastor + Pescado + Camarón)','Churros (2 toppings · Arequipe + Helado)','Té o Soda Hatsu (Soda)','Mojito'];
    const lines=await evaluate(`document.querySelector('.cart-lines').textContent`);
    for(const text of expected)assert.ok(lines.includes(text),text);
    const href=await evaluate(`document.querySelector('.cart-checkout').getAttribute('href')`);
    const message=new URL(href).searchParams.get('text');
    for(const text of expected)assert.ok(message.includes(text),text+' in WhatsApp');
    assert.ok(message.includes('$870.800'));
    assert.ok(await evaluate(`document.querySelector('.cart-pending-note').textContent.includes('no incluye')`));
    assert.equal(await evaluate(`document.querySelectorAll('.cart-line-no-photo img').length`),0);
    await tap('.cart-panel [aria-label="Quitar Nachos grandes"]');await subtotal('$831.900');
    await tap('.cart-panel [aria-label="Reducir cantidad de carrito: Fajitas Famosas (Full Orden · Carne)"]');await subtotal('$716.000');
    await escape();await wait(`!document.querySelector('.cart-panel').open`);
    assert.equal(await evaluate(`document.activeElement===document.querySelector('.cart-jump')`),true);
    await tap('.cart-jump');await wait(`document.querySelector('.cart-panel').open`);await tap('.cart-continue');await wait(`!document.querySelector('.cart-panel').open`);
    assert.equal(await evaluate(`document.documentElement.scrollWidth>document.documentElement.clientWidth`),false);
    const reloaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.reload');await reloaded;await ready();await subtotal('$0');
    assert.equal(await evaluate(`document.querySelector('.cart-count').textContent`),'0');
    observations.push({width,passed:true,entrySizes:["X2","X4","X6"],confirmedSubtotal:870800});
    console.log(`PASS ${width}px: one-card products, EntradaX2/X4/X6 prices, Fajitas proteins/portions, Tacos, Taquiza3/7, Churros,Hatsu,quantity,cart,WhatsApp,Escape/focus/reload`);
  }
  assert.deepEqual(errors, [], "No browser runtime exceptions");
  writeFileSync(path.join(output,`${label}-metrics.json`),JSON.stringify(observations,null,2));
  await send('Browser.close');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  if (socket) socket.close();
  child.kill();
}
