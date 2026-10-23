import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const usage = 'Usage: npm run test:mobile -- "<Chromium browser executable>" [http://127.0.0.1:3000] [capture-label]\nChecks the phone hamburger header, cart above WhatsApp, brand name in the bar, the 5-second infinite home specialties slider and the /menu carousels with the options sheet. Requires an existing local Chromium browser and a running frontend. Writes screenshots to .preview/.';
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
  `--user-data-dir=${path.join(output, `mobile-profile-${process.pid}`)}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
const deadline = setTimeout(() => {
  console.error('Mobile verification exceeded 240 seconds');
  child.kill();
  process.exit(1);
}, 240000);

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
  // Phone header: hamburger toggle (odd/tasks/mobile-menu-carousel.md S2).
  for (const width of [375, 742, 1440]) {
    for (const route of ['/', '/menu']) {
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width===375});
      const loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.navigate',{url:new URL(route,target).href});await loaded;
      await evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+10000;const check=()=>{const e=document.querySelector('.nav-toggle');if(e&&Object.keys(e).some(k=>k.startsWith('__reactProps')))return resolve(true);if(performance.now()>end)return reject(Error('Hydration unavailable'));requestAnimationFrame(check)};check()})`);
      const state = () => evaluate(`(()=>{const t=document.querySelector('.nav-toggle'),n=document.querySelector('#site-nav'),r=e=>e.getBoundingClientRect();const links=[...n.querySelectorAll('a')].map(a=>({w:r(a).width,h:r(a).height,right:r(a).right,bottom:r(a).bottom}));const cart=document.querySelector('.cart-jump');return {toggleVisible:r(t).width>0,toggle:{w:r(t).width,h:r(t).height,right:r(t).right,top:r(t).top},expanded:t.getAttribute('aria-expanded'),navVisible:r(n).height>0,links,active:document.activeElement===t,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,cta:document.querySelector('.header-order')?r(document.querySelector('.header-order')).width:0,cart:cart?{left:r(cart).left,top:r(cart).top,bottom:r(cart).bottom}:null}})()`);
      let s = await state();
      assert.equal(s.overflow, false, `${width}${route} overflow`);
      if (width > 700) {
        assert.equal(s.toggleVisible, false, `${width}: no hamburger on tablet/desktop`);
        assert.ok(s.navVisible && s.links.length === 4 && s.links.every(l => l.w > 0), `${width}: inline nav visible`);
        assert.ok(s.cta > 0, `${width}: Hacer pedido visible`);
      } else {
        assert.ok(s.toggleVisible && s.toggle.w >= 44 && s.toggle.h >= 44, 'hamburger visible with 44px target');
        assert.equal(s.navVisible, false, 'nav collapsed initially');
        assert.equal(s.expanded, 'false');
        if (s.cart) assert.ok(s.toggle.right <= s.cart.left - 2 || s.toggle.top >= s.cart.bottom || s.toggle.top + s.toggle.h <= s.cart.top, 'hamburger does not overlap the floating cart');
        await evaluate(`document.querySelector('.nav-toggle').click()`);
        await wait(`document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='true'`);
        s = await state();
        assert.ok(s.navVisible && s.links.length === 4 && s.links.every(l => l.h >= 44 && l.right <= width), 'open menu shows 4 tappable links inside viewport');
        const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`hamburger-${width}${route === '/' ? '-home' : '-menu'}-open.png`),Buffer.from(shot.data,'base64'));
        await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await wait(`document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='false'`);
        s = await state();
        assert.ok(!s.navVisible && s.active, 'Escape closes and returns focus to toggle');
        await evaluate(`document.querySelector('.nav-toggle').click()`);
        await wait(`document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='true'`);
        await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:width/2,y:700,button:'left',clickCount:1});
        await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:width/2,y:700,button:'left',clickCount:1});
        await wait(`document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='false'`);
      }
      const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`hamburger-${width}${route === '/' ? '-home' : '-menu'}.png`),Buffer.from(shot.data,'base64'));
      console.log(`PASS ${width}px ${route}: ${width > 700 ? 'inline nav + CTA, no hamburger' : 'hamburger 44px, open/Escape/focus/outside click'}`);
    }
  }

  // Phone cart above WhatsApp and brand name in the bar (odd/tasks/mobile-polish-real-app.md S1-S2).
  for (const width of [375, 600, 742, 1440]) {
    for (const route of ['/', '/menu']) {
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width<=600});
      const loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.navigate',{url:new URL(route,target).href});await loaded;
      await evaluate(`document.fonts.ready`);
      const m = await evaluate(`(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return b.width?{top:b.top,bottom:b.bottom,left:b.left,right:b.right,cy:b.top+b.height/2,w:b.width,h:b.height}:null};const name=document.querySelector('.site-header .brand-name');return {cart:r('.cart-jump'),wa:r('.whatsapp-float-button'),inner:r('.header-inner'),logo:r('.header-inner .brand-logo-frame'),name:r('.site-header .brand-name'),nameText:name&&name.getBoundingClientRect().width?name.innerText.replace(/\\s+/g,' ').trim():'',title:r('.site-header .brand-name > span:first-child'),tag:r('.site-header .brand-name small'),toggle:r('.nav-toggle'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
      assert.equal(m.overflow, false, `${width}${route} overflow`);
      if (route === '/menu') {
        if (width <= 700) {
          assert.ok(m.cart && m.wa, 'cart and WhatsApp visible');
          assert.ok(m.cart.bottom <= m.wa.top - 4 && m.wa.top - m.cart.bottom <= 24, `cart sits just above WhatsApp: ${JSON.stringify([m.cart, m.wa])}`);
          assert.ok(Math.abs((m.cart.left + m.cart.right) / 2 - (m.wa.left + m.wa.right) / 2) <= 4, 'cart centered over WhatsApp');
        } else assert.ok(m.cart.top < 60 && m.cart.right > width - 60, `${width}: cart stays top-right`);
      }
      if (width <= 700) {
        assert.match(m.nameText, /^La Lupe Cocina mexicana$/i, `${width}${route}: brand name with tagline`);
        assert.ok(m.tag.top >= m.title.bottom - 2, 'tagline below name');
        assert.ok(Math.abs(m.name.cy - m.toggle.cy) <= 4, `name and ☰ vertically aligned ${m.name.cy} ${m.toggle.cy}`);
        assert.ok(Math.abs(m.logo.cy - m.toggle.cy) <= 6, `logo and ☰ vertically aligned ${m.logo.cy} ${m.toggle.cy}`);
        assert.ok(m.inner.right - m.toggle.right <= 16, '☰ right-aligned in the bar');
        assert.ok(m.name.left >= m.logo.right - 4 && m.toggle.left - m.name.right >= 8, 'logo | name | ☰ order without overlap');
      } else assert.equal(m.name, null, `${width}: header name hidden on tablet/desktop`);
      await evaluate(`window.scrollTo(0,0)`);
      const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`phone-chrome-${width}${route === '/' ? '-home' : '-menu'}.png`),Buffer.from(shot.data,'base64'));
      console.log(`PASS ${width}px ${route}: ${width <= 700 ? 'cart above WhatsApp (menu), name + tagline, logo/name/☰ aligned' : 'cart top-right, no header name'}`);
    }
  }

  // Home specialties: one-row infinite slider, 3 cards from 761px (1 on phones), autoplay every 5s.
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const dishes = ['Taquiza', 'Carne a la tampiqueña', 'Nachos grandes', 'Combo "mero mero"', 'Flautas', 'Fajitas Quesadillas', 'Tacos (X5)'];
  const openHome = async (width, reduced = false) => {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:860,deviceScaleFactor:1,mobile:width<=600});
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
    const loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.navigate',{url:new URL('/',target).href});await loaded;
    // The loop clones appear only after hydration; wait for them before measuring.
    await evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+10000;const check=()=>{if(document.querySelectorAll('.specialty-grid > [data-clone]').length)return resolve(true);if(performance.now()>end)return reject(Error('Infinite slider clones never appeared'));requestAnimationFrame(check)};check()})`);
    await evaluate(`document.fonts.ready`);
    await evaluate(`Promise.all([...document.querySelectorAll('.specialty-grid img')].map(i=>{i.loading='eager';return Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,3000))])}))`);
    // Keep the pointer off the slider so hover never pauses it.
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});
    await evaluate(`document.querySelector('.section-heading').scrollIntoView({block:'start',behavior:'instant'})`);
  };
  // Fully visible card titles, left to right.
  const state = () => evaluate(`(()=>{const g=document.querySelector('.specialty-grid');const r=g.getBoundingClientRect();const cards=[...g.children];const visible=cards.filter(c=>{const b=c.getBoundingClientRect();return b.left>=r.left-2&&b.right<=r.right+2}).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left).map(c=>c.querySelector('h3').textContent.trim());const real=cards.filter(c=>!c.hasAttribute('data-clone'));const clones=cards.filter(c=>c.hasAttribute('data-clone'));const b=document.querySelector('.carousel-pause');const first=cards.reduce((best,c)=>Math.abs(c.getBoundingClientRect().left-r.left)<Math.abs(best.getBoundingClientRect().left-r.left)?c:best,cards[0]);return {visible,real:real.length,clones:clones.length,clonesHidden:clones.every(c=>c.getAttribute('aria-hidden')==='true'&&c.inert),firstIsClone:first.hasAttribute('data-clone'),rows:new Set(cards.map(c=>Math.round(c.getBoundingClientRect().top))).size,ratio:real[0].getBoundingClientRect().width/r.width,button:b?b.getBoundingClientRect().height:0,buttonW:b?b.getBoundingClientRect().width:0,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
  const waitFirst = (title, ms) => evaluate(`new Promise((resolve,reject)=>{const g=document.querySelector('.specialty-grid');const end=performance.now()+${ms};const check=()=>{const r=g.getBoundingClientRect();const v=[...g.children].filter(c=>{const b=c.getBoundingClientRect();return b.left>=r.left-2&&b.right<=r.right+2}).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);if(v[0]&&v[0].querySelector('h3').textContent.trim()===${JSON.stringify(title)})return resolve(true);if(performance.now()>end)return reject(new Error('first visible '+(v[0]&&v[0].querySelector('h3').textContent.trim())+' instead of '+${JSON.stringify(title)}));requestAnimationFrame(check)};check()})`);
  // Instantly park the slider on a real (non-clone) card.
  const parkAt = index => evaluate(`(()=>{const g=document.querySelector('.specialty-grid');const cards=[...g.children];const card=cards.filter(c=>!c.hasAttribute('data-clone'))[${index}];g.style.scrollBehavior='auto';g.scrollLeft=card.offsetLeft-cards[0].offsetLeft;g.style.scrollBehavior='';})()`);
  for (const [width, perView, step] of [[1440, 3, 2], [800, 3, 2], [375, 1, 1]]) {
    await openHome(width);
    let s = await state();
    assert.equal(s.overflow, false, `${width}: no page overflow`);
    assert.equal(s.rows, 1, `${width}: a single horizontal row`);
    assert.equal(s.real, 7, `${width}: seven real specialties`);
    assert.ok(s.clones >= 7 && s.clonesHidden, `${width}: loop clones are hidden from assistive tech and keyboard`);
    assert.equal(s.firstIsClone, false, `${width}: starts on the real first card`);
    assert.deepEqual(s.visible, dishes.slice(0, perView), `${width}: ${perView} card(s) per view starting with Taquiza`);
    if (perView === 1) assert.ok(s.ratio > .75 && s.ratio < .95, `${width}: one large card with the next peeking (${s.ratio})`);
    assert.ok(s.button >= 44 && s.buttonW >= 44, `${width}: visible 44px pause control`);
    const t0 = Date.now();
    await sleep(3800);
    assert.deepEqual((await state()).visible, dishes.slice(0, perView), `${width}: no move before 5 seconds`);
    await waitFirst(dishes[step], 4000);
    const elapsed = Date.now() - t0;
    assert.ok(elapsed >= 4500 && elapsed <= 7500, `${width}: advances by ${step} after ~5s (${elapsed}ms)`);
    const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`home-slider-${width}.png`),Buffer.from(shot.data,'base64'));
    // Infinite: from the last real card it keeps moving forward into Taquiza, then stays on real cards.
    await parkAt(6);
    await sleep(400);
    s = await state();
    assert.deepEqual(s.visible, [...dishes, ...dishes].slice(6, 6 + perView), `${width}: the row wraps seamlessly after Tacos`);
    await waitFirst(dishes[(6 + step) % 7], 6500);
    await sleep(600);
    assert.equal((await state()).firstIsClone, false, `${width}: after wrapping the slider re-anchors on real cards`);
    // Pause stops the autoplay.
    await evaluate(`document.querySelector('.carousel-pause').click()`);
    await wait(`document.querySelector('.carousel-pause').textContent.startsWith('Reanudar')`);
    const pausedAt = (await state()).visible;
    await sleep(6500);
    assert.deepEqual((await state()).visible, pausedAt, `${width}: paused slider stays put`);
    console.log(`PASS ${width}px: one row, ${perView} per view, advances ${step} at ~${elapsed}ms, infinite wrap, pause holds`);
  }
  for (const width of [375, 1440]) {
    await openHome(width, true);
    const reduced = await state();
    assert.equal(reduced.button, 0, `${width}: no pause control when reduced motion disables autoplay`);
    await sleep(6000);
    assert.equal((await state()).visible[0], 'Taquiza', `${width}: reduced motion: no autoplay`);
    console.log(`PASS ${width}px reduced motion: swipe only, no autoplay`);
  }

  // /menu carousels, Ver más, direct + and options sheet (mobile-menu-carousel S3-S7).
  const tap = async selector => {
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'center',inline:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width}})()`);
    assert.ok(point.w > 0, 'visible: ' + selector);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  };
  const key = async name => { const code = { Escape: 27 }[name]; await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code}); await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code}); };
  const hydrated = () => evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+10000;const check=()=>{const e=document.querySelector('.cart-jump');if(e&&Object.keys(e).some(k=>k.startsWith('__reactProps')))return resolve(true);if(performance.now()>end)return reject(Error('Hydration unavailable'));requestAnimationFrame(check)};check()})`);
  for (const width of [375, 742, 1122]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:820,deviceScaleFactor:1,mobile:width===375});
    let loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.navigate',{url:new URL('/menu',target).href});await loaded;
    await hydrated(); await evaluate(`document.fonts.ready`);
    await evaluate(`Promise.all([...document.querySelectorAll('.m-carousel img')].map(i=>{i.loading='eager';return Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,3000))])}))`);
    const layout = await evaluate(`(()=>{const r=e=>e.getBoundingClientRect();const carousels=[...document.querySelectorAll('.m-carousel')];return {overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,visible:carousels.filter(c=>r(c).height>0).length,total:carousels.length,gridsVisible:[...document.querySelectorAll('.menu-products .dish-grid,.menu-products .star-grid')].filter(g=>r(g).height>0).length,scrollable:carousels.filter(c=>c.scrollWidth>c.clientWidth+10).length,snap:carousels[0]&&getComputedStyle(carousels[0]).scrollSnapType,cardRatio:carousels[1]?r(carousels[1].querySelector('.m-card')).width/r(carousels[1]).width:0,badPhotos:[...document.querySelectorAll('.m-carousel img:not(.dish-logo)')].filter(i=>{const b=r(i);return !i.naturalWidth||Math.abs(b.width/b.height-i.naturalWidth/i.naturalHeight)>.03}).length,beverageImgs:document.querySelectorAll('#bebidas .m-carousel img,#cocteles-y-chelas .m-carousel img').length,smallTargets:[...document.querySelectorAll('.m-add,.m-more')].filter(b=>r(b).height>0&&(r(b).height<44||r(b).width<44)).length}})()`);
    assert.equal(layout.overflow, false, `${width}: page overflow`);
    if (width > 760) {
      assert.equal(layout.visible, 0, `${width}: carousels hidden on desktop`);
      assert.ok(layout.gridsVisible > 5, `${width}: desktop grids intact`);
      console.log(`PASS ${width}px: desktop boards unchanged, no carousels`);
      continue;
    }
    assert.equal(layout.visible, layout.total, 'every carousel visible');
    assert.equal(layout.gridsVisible, 0, 'desktop grids hidden on phones');
    assert.ok(layout.scrollable >= layout.total - 2, 'carousels scroll horizontally: ' + layout.scrollable);
    assert.match(layout.snap, /x/);
    assert.ok(layout.cardRatio > .7 && layout.cardRatio < .95, 'one large card with next peeking: ' + layout.cardRatio);
    assert.equal(layout.badPhotos, 0); assert.equal(layout.beverageImgs, 0); assert.equal(layout.smallTargets, 0, 'touch targets ≥44px');
    // Ver más appears only on clamped descriptions and expands them.
    await wait(`[...document.querySelectorAll('.menu-section:not(#platos-estrella) .m-card')].filter(c=>c.querySelector('.m-desc')).every(c=>{const d=c.querySelector('.m-desc');return (d.scrollHeight>d.clientHeight+1)===Boolean(c.querySelector('.m-more'))})`).catch(()=>{});
    const clampedState = await evaluate(`[...document.querySelectorAll('.menu-section:not(#platos-estrella) .m-card')].filter(c=>c.querySelector('.m-desc')).map(c=>{const d=c.querySelector('.m-desc');return {id:c.dataset.item,hidden:d.scrollHeight>d.clientHeight+1,button:Boolean(c.querySelector('.m-more'))}})`);
    assert.deepEqual(clampedState.filter(c=>c.hidden!==c.button), [], 'Ver más exactly where text is cut');
    const longDish = clampedState.find(c=>c.button);
    assert.ok(longDish, 'at least one long description');
    const more = `.menu-section:not(#platos-estrella) .m-card[data-item="${longDish.id}"] .m-more`;
    const descHeight = () => evaluate(`document.querySelector(${JSON.stringify(more)}).previousElementSibling.getBoundingClientRect().height`);
    const before = await descHeight();
    await tap(more);
    await wait(`document.querySelector(${JSON.stringify(more)}).getAttribute('aria-expanded')==='true'`);
    const after = await descHeight();
    assert.ok(after > before + 10, `Ver más expands ${longDish.id} ${before}→${after}`);
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(more)}).textContent`), 'Ver menos');
    // Direct + for single dishes.
    await subtotal('$0');
    await tap('#entradas .m-card[data-item="nachos-grandes"] .m-add');
    await subtotal('$38.900');
    assert.equal(await evaluate(`document.querySelector('.cart-panel').open`), false, '+ must not open cart');
    await wait(`document.querySelector('.cart-feedback').textContent.includes('Agregado')`);
    // + of an option dish opens the sheet.
    const trigger = '#fajitas .m-card[data-item="fajitas-famosas"] .m-add';
    await tap(trigger);
    await wait(`document.querySelector('#opciones-producto').open`);
    assert.equal(await evaluate(`document.activeElement.id`), 'opciones-title', 'focus moves into sheet');
    const shotSheet=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`carousel-${width}-sheet.png`),Buffer.from(shotSheet.data,'base64'));
    await key('Escape');
    await wait(`!document.querySelector('#opciones-producto').open`);
    assert.equal(await evaluate(`document.activeElement===document.querySelector(${JSON.stringify(trigger)})`), true, 'Escape returns focus to +');
    await tap(trigger);
    await wait(`document.querySelector('#opciones-producto').open`);
    await evaluate(`(()=>{const s=document.querySelector('#opciones-producto');[...s.querySelectorAll('label')].find(l=>l.textContent.trim()==='Carne').querySelector('input').click();[...s.querySelectorAll('label')].find(l=>l.textContent.startsWith('Full Orden')).querySelector('input').click();})()`);
    await tap('#opciones-producto [aria-label="Aumentar cantidad de Fajitas Famosas (Full Orden · Carne)"]');
    await wait(`document.querySelector('#opciones-producto [aria-label="Agregar Fajitas Famosas (Full Orden · Carne)"]').textContent.includes('$231.800')`);
    await tap('#opciones-producto [aria-label="Agregar Fajitas Famosas (Full Orden · Carne)"]');
    await wait(`!document.querySelector('#opciones-producto').open`);
    await subtotal('$270.700');
    assert.equal(await evaluate(`document.activeElement===document.querySelector(${JSON.stringify(trigger)})`), true, 'add returns focus to +');
    await tap('.cart-jump');
    await wait(`document.querySelector('.cart-panel').open`);
    assert.ok(await evaluate(`document.querySelector('.cart-lines').textContent.includes('Fajitas Famosas (Full Orden · Carne)')`), 'cart line with chosen options');
    await key('Escape');
    for (const selector of ['#platos-estrella', '#entradas', '#bebidas']) {
      await evaluate(`document.querySelector('${selector}').scrollIntoView({block:'start',behavior:'instant'})`);
      const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(output,`carousel-${width}-${selector.slice(1)}.png`),Buffer.from(shot.data,'base64'));
    }
    // Home links /menu#plato-<id> reach the dish inside its carousel.
    loaded=new Promise(resolve=>events.set('Page.loadEventFired',resolve));await cdp('Page.navigate',{url:new URL('/menu?enlace=home#plato-taquiza',target).href});await loaded;
    await hydrated();
    await wait(`(()=>{const r=document.querySelector('#tacos-y-taquiza .m-card[data-item="taquiza"]').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+200&&r.left>=-1&&r.right<=innerWidth+1})()`);
    console.log(`PASS ${width}px: carousels, complete photos, Ver más, direct +, options sheet (Escape/focus/add), cart line, #plato- deep link`);
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
