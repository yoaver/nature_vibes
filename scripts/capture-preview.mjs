import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { animalReview, maleSeaLionReview } from './animal-review.mjs';

const screenshotDir=resolve('screenshots');
await mkdir(screenshotDir,{recursive:true});
const output = join(screenshotDir,basename(process.argv[2] || 'jungle-preview.png'));
const profile = await mkdtemp(join(tmpdir(), 'nature-vibes-preview-'));
const server = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '3092' }, stdio: 'ignore' });
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless', '--disable-gpu', '--disable-extensions', '--no-first-run',
  '--no-default-browser-check', '--disable-background-networking',
  '--remote-debugging-port=9331', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { const response = await fetch('http://localhost:9331/json/version'); if (response.ok) { ready = true; break; } } catch {}
    await delay(100);
  }
  if (!ready) throw Error('Headless Chrome did not expose its debugging endpoint');
  const target = await (await fetch('http://localhost:9331/json/new?about:blank', { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
      if (message.error) reject(Error(message.error.message)); else resolve(message.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); socket.send(JSON.stringify({ id: next, method, params })); });
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: 'http://localhost:3092/?environment=jungle' });
  for (let i = 0; i < 50; i++) {
    const result = await call('Runtime.evaluate', { expression: "document.body?.dataset.environment === 'jungle' && document.querySelectorAll('.css-tree').length > 0", returnByValue: true });
    if (result.result.value) break;
    await delay(100);
  }
  await delay(800);
  if(process.argv.includes('--bay')) {
    await call('Runtime.evaluate',{expression:"document.querySelector('[data-environment=bay]').click()"});
    await delay(300);
  }
  if (process.argv.includes('--rainy')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('[data-weather=rainy]').click()" });
    await delay(3000);
  }
  if (process.argv.includes('--cloudy')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('[data-weather=cloudy]').click()" });
    await delay(3000);
  }
  if (process.argv.includes('--night')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('[data-mode=night]').click()" });
    await delay(3000);
  }
  if (process.argv.includes('--animal')) {
    const target = await call('Runtime.evaluate', { expression: "(() => { const eyes=document.querySelector('.hidden-animal'); const r=eyes.getBoundingClientRect(); const x=r.x+r.width/2,y=r.y+r.height/2; return {x,y,hit:document.elementFromPoint(x,y)?.className}; })()", returnByValue: true });
    const { x, y, hit } = target.result.value;
    console.log('Eye click hit target:', hit);
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await delay(2800);
    const state = await call('Runtime.evaluate', { expression: "document.querySelector('.animal-out') !== null && document.querySelector('.hidden-animal').disabled", returnByValue: true });
    if (!state.result.value) throw Error('Armadillo did not leave its bush');
    const behavior = await call('Runtime.evaluate', { expression: "(() => { const track=document.querySelector('.armadillo-track'); track.getAnimations().forEach(animation => { animation.currentTime=Number(animation.effect.getTiming().duration)*.5; }); const style=getComputedStyle(track); const distance=Math.abs(new DOMMatrix(style.transform).m41); const stopped=Number(style.getPropertyValue('--armadillo-stride')) < .1; return {distance,stopped}; })()", returnByValue: true });
    if (behavior.result.value.distance < 140 || !behavior.result.value.stopped) throw Error('Armadillo distance or sniffing rest failed');
    console.log('Longer exploration and stationary sniffing passed:', behavior.result.value);
    await call('Runtime.evaluate', { expression: "document.querySelector('.armadillo-track').getAnimations({subtree:true}).forEach(animation => { if(Number(animation.effect.getTiming().duration)>1000)animation.currentTime=Number(animation.effect.getTiming().duration)*.31; })" });
  }
  const clickRoost = async () => {
    const point = await call('Runtime.evaluate', { expression: "(() => {const r=document.querySelector('.tree-eyes[data-roost-active=true]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()", returnByValue: true });
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', ...point.result.value, button: 'left', clickCount: 1 });
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point.result.value, button: 'left', clickCount: 1 });
  };
  if (process.argv.includes('--bats')) {
    await clickRoost();
    await delay(900);
    const started = await call('Runtime.evaluate', { expression: "document.querySelectorAll('.flying-fox').length === 6 && !document.querySelector('.tree-eyes[data-roost-active=true]')", returnByValue: true });
    if (!started.result.value) throw Error('Flying foxes did not leave the roost');
  }
  const clickMacaws = async () => {
    const point=await call('Runtime.evaluate',{expression:"(()=>{const r=document.querySelector('.macaw-roost[data-macaw-active=true]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height*.35}})()",returnByValue:true});
    await call('Input.dispatchMouseEvent',{type:'mousePressed',...point.result.value,button:'left',clickCount:1});
    await call('Input.dispatchMouseEvent',{type:'mouseReleased',...point.result.value,button:'left',clickCount:1});
  };
  if(process.argv.includes('--macaws')) {
    const placement=await call('Runtime.evaluate',{expression:"(()=>{const birds=document.querySelector('.macaw-roost[data-macaw-active=true]').getBoundingClientRect(),bar=document.querySelector('.environment-bar').getBoundingClientRect();const insects=[...document.querySelectorAll('.morpho-butterfly')];const speeds=new Set(insects.map(b=>getComputedStyle(b).animationDuration));const controls=document.querySelector('.controls').getBoundingClientRect();const controlHit=document.elementFromPoint(controls.x+controls.width/2,controls.y+controls.height/2)?.closest('.controls');return {clearOfSidebar:birds.right<bar.left||birds.left>bar.right||birds.bottom<bar.top||birds.top>bar.bottom,independent:speeds.size===insects.length,controlsClickable:!!controlHit,low:insects.every(b=>{const r=b.getBoundingClientRect();return r.top>innerHeight*.49&&r.bottom<innerHeight*.73})}})()",returnByValue:true});
    if(!Object.values(placement.result.value).every(Boolean))throw Error('Daytime wildlife placement failed: '+JSON.stringify(placement.result.value));
    await clickMacaws();await delay(1000);
    const started=await call('Runtime.evaluate',{expression:"document.querySelectorAll('.flying-macaw').length===5 && document.querySelectorAll('.morpho-butterfly').length===7",returnByValue:true});
    if(!started.result.value)throw Error('Macaws did not respond to mouse click');
  }
  if (process.argv.includes('--river-wildlife')) {
    const counts = await call('Runtime.evaluate', { expression: "({caimans:document.querySelectorAll('.river-caiman').length,adults:document.querySelectorAll('.river-capybara:not(.baby)').length,babies:document.querySelectorAll('.river-capybara.baby').length})", returnByValue: true });
    if (counts.result.value.caimans!==5 || counts.result.value.adults!==5 || counts.result.value.babies!==5) throw Error('River wildlife counts are wrong');
    const expected = process.argv.includes('--night') ? 'night' : 'day';
    for (const mode of ['day','night']) {
      await call('Runtime.evaluate', { expression: `document.querySelector('[data-mode=${mode}]').click()` });
      const sleep = await call('Runtime.evaluate', { expression: "[...document.querySelectorAll('.river-caiman,.river-capybara')].every(animal=>{const open=animal.querySelector('.caiman-eye-open,.capy-eye-open'),closed=animal.querySelector('.caiman-eye-closed,.capy-eye-closed');return document.body.dataset.time==='night' || animal.classList.contains('water-caiman-bank') ? getComputedStyle(open).display==='none' && getComputedStyle(closed).display!=='none' : getComputedStyle(open).display!=='none' && getComputedStyle(closed).display==='none'})", returnByValue: true });
      if (!sleep.result.value) throw Error('Wildlife eye state incorrect in '+mode);
      const split=await call('Runtime.evaluate',{expression:"({shore:[...document.querySelectorAll('.river-caiman')].filter(e=>getComputedStyle(e).display!=='none').length,sleepers:document.querySelectorAll('.water-caiman-bank').length,swimmers:document.querySelectorAll('.submerged-caiman').length})",returnByValue:true});
      if(split.result.value.shore!==(mode==='night'?2:5)||split.result.value.sleepers!==3||split.result.value.swimmers!==3)throw Error('Caiman day/night split incorrect');
    }
    await call('Runtime.evaluate', { expression: "document.querySelector('#pause').click()" });
    const paused = await call('Runtime.evaluate', { expression: "[...document.querySelectorAll('.river-caiman,.river-capybara')].every(animal=>animal.getAnimations({subtree:true}).every(a=>a.playState==='paused'))", returnByValue: true });
    if (!paused.result.value) throw Error('River wildlife did not pause');
    await call('Runtime.evaluate', { expression: `document.querySelector('#pause').click();document.querySelector('[data-mode=${expected}]').click()` });
    await delay(3000);
    const poses=await call('Runtime.evaluate',{expression:"(()=>{const night=document.body.dataset.time==='night';return [...document.querySelectorAll('.river-capybara')].every(capy=>{const tucked=getComputedStyle(capy.querySelector('.capy-legs')).display==='none';return tucked===(night||capy.classList.contains('resting')||capy.classList.contains('sitting'))})&&getComputedStyle(document.querySelector('.river-swimmers')).display===(night?'block':'none')&&getComputedStyle(document.querySelector('.day-jungle-wildlife')).display===(night?'none':'block')})()",returnByValue:true});
    if(!poses.result.value)throw Error('Sleeping capybara pose or day/night wildlife visibility is incorrect');
    if(expected==='night') {
      const bounded=await call('Runtime.evaluate',{expression:"[...document.querySelectorAll('.submerged-caiman')].every(caiman=>{const a=caiman.getAnimations()[0],saved=a.currentTime,timing=a.effect.getTiming();let valid=true;for(const phase of [0,.25,.47,.7,.97]){a.currentTime=Number(timing.duration)*(1+phase)+Number(timing.delay);const r=caiman.getBoundingClientRect();valid=valid&&r.x>=0&&r.right<=innerWidth+1}a.currentTime=saved;return valid})",returnByValue:true});
      if(!bounded.result.value)throw Error('A swimming caiman escaped the viewport');
    }
    console.log('Caiman day/night split, three swimmers, five adult/five baby capybaras; lighting, sleep and pause checks passed.');
  }
  if(process.argv.includes('--ecology')) {
    const evaluate=async expression=>{
      const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
      return result.result.value;
    };
    const click=async selector=>{
      const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height*.4}})()`);
      await call('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
      await call('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
    };
    const finish=async selector=>{await evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).forEach(e=>e.getAnimations().filter(a=>!a.animationName).forEach(a=>a.finish()))`);await delay(120);};
    const finishCSS=async selector=>{await evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).forEach(e=>e.getAnimations().forEach(a=>a.finish()))`);await delay(120);};
    for(const mode of ['day','night']) {
      await evaluate(`document.querySelector('[data-mode=${mode}]').click()`);await delay(200);
      const prefix=mode==='day'?'macaw':'bat',button=mode==='day'?'.macaw-roost':'.tree-eyes',attribute=mode==='day'?'data-macaw-active':'data-roost-active',flyer=mode==='day'?'.flying-macaw':'.flying-fox',count=mode==='day'?5:6;
      for(const group of [0,1,2]) {
        for(let trip=0;trip<2;trip++) {
          await click(`${button}[data-group="${group}"][${attribute}=true]`);await delay(100);
          const nodes=await evaluate(`document.querySelectorAll('${flyer}[data-group="${group}"]').length`);
          if(nodes!==(mode==='day'?[5,6,8][group]:[14,18,22][group]))throw Error(prefix+' group '+group+' click failed');
          if(mode==='night'&&!await evaluate(`[...document.querySelectorAll('.flying-fox[data-group="${group}"]')].every(b=>{const a=b.getAnimations().find(a=>!a.animationName);return b.dataset.species==='seba'&&Math.abs(Number(b.dataset.flightDistance)/(Number(a.effect.getTiming().duration)/1000)-Number(b.dataset.flightSpeed))<.01})`))throw Error('Bat species or distance-based flight speed is incorrect');
          if(group===1&&!await evaluate(`[...document.querySelectorAll('${flyer}[data-group="1"]')].every(e=>!!e.closest('.forest-depth.middle'))`))throw Error('Rear flights are not behind the front trees');
          if(mode==='day') {
            if(!await evaluate(`[...document.querySelectorAll('.macaw-roost[data-group="${group}"][data-macaw-active=true] .perched-macaw')].filter(e=>getComputedStyle(e).visibility==='visible').length>=3`))throw Error('Waiting macaws disappeared before takeoff');
            await evaluate(`document.querySelector('.flying-macaw[data-group="${group}"]').getAnimations().filter(a=>!a.animationName).forEach(a=>a.finish())`);await delay(80);
            if(!await evaluate(`document.querySelectorAll('.macaw-roost[data-group="${group}"][data-arriving=true] .perched-macaw')[0].style.visibility==='visible'`))throw Error('First macaw disappeared on landing');
            await finish(`.macaw-roost[data-group="${group}"] .perched-macaw`);
          }
          await finish(`${flyer}[data-group="${group}"]`);
          const home=group===2?(trip===0?0:1):(trip===0?1:0);
          if(!await evaluate(`document.querySelectorAll('${button}[data-group="${group}"]')[${home}].getAttribute('${attribute}')==='true'`))throw Error(prefix+' group did not arrive');
        }
      }
    }
    console.log('All three macaw and bat groups passed real-click round trips; rear flight layering verified.');
    for(const animal of [0,1])await click(`.hidden-animal[data-animal="${animal}"]`);
    if(await evaluate("document.querySelectorAll('.armadillo-track.is-exploring').length")!==2)throw Error('Both armadillos were not clickable');
    await finishCSS('.armadillo-track[data-animal="0"]');
    if(await evaluate("document.querySelectorAll('.armadillo-track.is-exploring').length")!==1)throw Error('Armadillo routes are not independent');
    await finishCSS('.armadillo-track[data-animal="1"]');
    if(await evaluate("document.querySelectorAll('.hidden-animal:disabled').length")!==0)throw Error('Armadillo eyes did not return');
    await click('.river-caiman:not(.water-caiman-bank)');
    if(!await evaluate("!!document.querySelector('.river-caiman.annoyed')"))throw Error('Sleeping night caiman did not wake');
    await finish('.river-caiman.annoyed');
    if(await evaluate("document.querySelectorAll('.river-caiman.annoyed').length")!==0)throw Error('Caiman did not settle');
    await evaluate("document.querySelector('[data-mode=day]').click()");
    await delay(150);
    await click('.river-capybara.baby');
    if(!await evaluate("!!document.querySelector('.river-capybara.playing')"))throw Error('Baby did not play: '+JSON.stringify(await evaluate("(()=>{const e=document.querySelector('.river-capybara.baby'),r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height*.4);return {member:e.dataset.member,rect:r.toJSON(),hit:hit?.outerHTML.slice(0,250)}})()")));
    await finish('.river-capybara.playing');
    await click('.water-caiman-bank');
    if(!await evaluate("!!document.querySelector('.water-caiman-bank.annoyed')"))throw Error('Sleeping day caiman did not wake');
    await finish('.water-caiman-bank.annoyed');
    console.log('Both armadillos, baby capybara play, and daytime/nighttime caiman waking passed.');
    if(await evaluate("document.querySelectorAll('.toucan-roost[data-active=true]').length")!==3)throw Error('Expected three solitary toucans');
    for(const id of [0,1,2]) {
      for(let trip=0;trip<2;trip++) {
        await click(`.toucan-roost[data-toucan="${id}"][data-active=true]`);await delay(80);
        if(await evaluate(`document.querySelectorAll('.flying-toucan[data-toucan="${id}"]').length`)!==1)throw Error('Toucan click did not start its solitary flight');
        await finish(`.flying-toucan[data-toucan="${id}"]`);
        if(!await evaluate(`document.querySelectorAll('.toucan-roost[data-toucan="${id}"]')[${trip===0?0:1}].dataset.active==='true'`))throw Error('Toucan did not reach its branch');
      }
    }
    console.log('All three solitary toucans passed real-click round trips.');
    await evaluate("import('/assets/scenes/jungle/jungle-birds.js').then(m=>{m.beginButterflyLanding();return true})");await delay(80);
    await evaluate("import('/assets/scenes/jungle/jungle-birds.js').then(m=>{m.beginButterflyLanding();return true})");await delay(80);
    await finish('.morpho-butterfly[data-landing-state=approaching]');
    if(!await evaluate("document.querySelectorAll('.morpho-butterfly.landed').length===2 && new Set([...document.querySelectorAll('.morpho-butterfly.landed')].map(e=>e.dataset.landingOn)).size===2"))throw Error('Butterflies did not land on both animal types');
    await finish('.morpho-butterfly[data-landing-state=landed]');
    await finish('.morpho-butterfly[data-landing-state=departing]');
    if(await evaluate("document.querySelectorAll('.morpho-butterfly.landing').length")!==0)throw Error('Butterflies did not resume flight');
    const monkeys=await evaluate("import('/assets/scenes/jungle/jungle-monkeys.js').then(m=>{const troops=[...document.querySelectorAll('.capuchin-colony')],nodes=[...document.querySelectorAll('.capuchin-monkey')];m.updateSquirrelMonkeys(0,0);const before=nodes.map(e=>e.style.left+e.style.top);m.updateSquirrelMonkeys(38,0);return nodes.length===17&&troops.some(e=>e.querySelectorAll('.capuchin-monkey').length===7)&&troops.some(e=>e.querySelectorAll('.capuchin-monkey').length===10)&&nodes.some((e,i)=>e.style.left+e.style.top!==before[i])})");
    if(!monkeys)throw Error('Monkey count or rotation failed');
    const capyStates=await evaluate("import('/assets/scenes/jungle/jungle-wildlife.js').then(m=>{const nodes=[...document.querySelectorAll('.river-capybara')],states=nodes.map(()=>new Set());for(let t=0;t<230;t+=3){m.updateGrazingCapybaras(t);nodes.forEach((n,i)=>states[i].add(['grazing','sitting','resting','standing'].find(c=>n.classList.contains(c))))}return states.every(s=>s.size===4)})");
    if(!capyStates)throw Error('Capybara daytime routines failed');
    await evaluate("document.querySelector('[data-mode=night]').click()");await delay(1500);
    if(!await evaluate("[...document.querySelectorAll('.capuchin-monkey')].every(e=>getComputedStyle(e.querySelector('.squirrel-awake')).display==='none'&&getComputedStyle(e.querySelector('.squirrel-asleep')).display!=='none')"))throw Error('Monkeys did not lie down to sleep');
    if(!await evaluate("[...document.querySelectorAll('.river-capybara.baby')].every(b=>{const m=document.querySelector('.river-capybara[data-member=\"'+b.dataset.family+'\"]');const a=b.getBoundingClientRect(),r=m.getBoundingClientRect();return b.parentElement===m.parentElement&&Math.abs(a.x-r.x)<r.width*1.3&&Math.abs(a.bottom-r.bottom)<25})"))throw Error('Baby capybaras did not sleep beside their mothers');
    if(!await evaluate("[...document.querySelectorAll('.river-capybara .capy-sitting-feet,.river-capybara .capy-legs')].every(e=>getComputedStyle(e).display==='none')"))throw Error('Sleeping capybara has exposed sitting or walking legs');
    console.log('Butterfly landings on capybara/caiman, departure, and both monkey troops climbing/sleeping passed.');
    if(!process.argv.includes('--night')){await evaluate("document.querySelector('[data-mode=day]').click()");await delay(1500);}
  }
  if(process.argv.includes('--habitat')) {
    const evaluate=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
    const saved=await evaluate('({time:document.body.dataset.time,weather:document.body.dataset.weather})');
    await evaluate("document.querySelector('[data-mode=day]').click();document.querySelector('[data-weather=rainy]').click()");await delay(350);
    if(!await evaluate("document.querySelectorAll('.morpho-butterfly.weather-settled').length===7&&[...document.querySelectorAll('.capuchin-monkey')].every(e=>e.dataset.pose==='crouch')&&[...document.querySelectorAll('.ambient-macaw,.ambient-bat')].every(e=>getComputedStyle(e).opacity==='0')"))throw Error('Rain sheltering failed');
    await evaluate("import('/assets/scenes/jungle/jungle-birds.js').then(m=>m.beginButterflyLanding())");
    if(await evaluate("document.querySelectorAll('.morpho-butterfly.landing').length"))throw Error('Butterfly took off during rain');
    await evaluate("document.querySelector('[data-mode=night]').click();document.querySelector('[data-weather=cloudy]').click()");await delay(2300);
    if(!await evaluate("Number(getComputedStyle(document.querySelector('#jungle-backdrop')).getPropertyValue('--moon'))<.001"))throw Error('Cloudy night has direct moonlight');
    await evaluate("document.querySelector('[data-mode=day]').click();document.querySelector('[data-weather=clear]').click()");await delay(250);
    if(!await evaluate("document.querySelectorAll('.weather-settled').length===0&&document.querySelectorAll('.forest-depth.middle .morpho-butterfly').length===2&&document.querySelectorAll('.forest-depth.far .morpho-butterfly').length===1"))throw Error('Butterflies lost their depth layers after rain');
    if(!await evaluate("import('/assets/scenes/jungle/jungle-birds.js').then(m=>{const birds=[...document.querySelectorAll('.perched-macaw')];m.updatePerchedMacaws(0);const before=birds.map(b=>b.dataset.posture);m.updatePerchedMacaws(81);return birds.some((b,i)=>b.dataset.posture!==before[i])})"))throw Error('Perched macaws never change posture');
    await evaluate(`document.querySelector('[data-mode=${saved.time}]').click();document.querySelector('[data-weather=${saved.weather}]').click()`);await delay(2300);
    console.log('Rain sheltering, cloudy moonlight, butterfly depth restoration, and perched macaw posture changes passed.');
  }
  if(process.argv.includes('--autonomy')) {
    const evaluate=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
    const saved=await evaluate('({time:document.body.dataset.time,weather:document.body.dataset.weather})');
    for(const [mode,module,reset,update,pause,flyer] of [['day','jungle-birds','resetDayWildlife','updateAutomaticMacaws','pauseDayWildlife','flying-macaw'],['night','jungle-wildlife','resetBats','updateAutomaticBats','pauseBats','flying-fox']]) {
      await evaluate(`document.querySelector('[data-mode=${mode}]').click();document.querySelector('[data-weather=clear]').click()`);
      const result=await evaluate(`import('/assets/scenes/jungle/${module}.js').then(m=>{m.${reset}();m.${update}(0);m.${pause}(true);m.${update}(200);const held=document.querySelectorAll('.${flyer}').length===0;m.${pause}(false);m.${update}(200);m.${update}(201);const groups=new Set([...document.querySelectorAll('.${flyer}')].map(e=>e.dataset.group));m.${reset}();return held&&groups.size===1})`);
      if(!result)throw Error(mode+' automatic flocks were not staggered or pause-aware');
      await evaluate(`document.querySelector('[data-weather=rainy]').click()`);
      if(!await evaluate(`import('/assets/scenes/jungle/${module}.js').then(m=>{m.${reset}();m.${update}(0);m.${update}(200);const quiet=document.querySelectorAll('.${flyer}').length===0;m.${reset}();return quiet})`))throw Error('Automatic flock departed in rain');
    }
    await evaluate(`document.querySelector('[data-mode=${saved.time}]').click();document.querySelector('[data-weather=${saved.weather}]').click()`);await delay(1800);
    console.log('Macaw and bat automatic departures are staggered, pause-aware, and quiet in rain.');
  }
  if(process.argv.includes('--roost-layout')) {
    const layout=await call('Runtime.evaluate',{expression:"[...document.querySelectorAll('.macaw-roost')].map(b=>{const r=b.getBoundingClientRect(),c=b.parentElement.getBoundingClientRect();return{group:b.dataset.group,active:b.dataset.macawActive,rect:{x:r.x,y:r.y,w:r.width,h:r.height},crown:{x:c.x,y:c.y,w:c.width,h:c.height}}})",returnByValue:true});
    console.log('Roost positions:',JSON.stringify(layout.result.value));
  }
  if(process.argv.includes('--rear-destination')) {
    await call('Runtime.evaluate',{expression:"document.querySelector('.macaw-roost[data-group=\"1\"][data-macaw-active=true]').click()"});await delay(100);
    await call('Runtime.evaluate',{expression:"document.querySelectorAll('.flying-macaw[data-group=\"1\"]').forEach(b=>b.getAnimations().forEach(a=>a.finish()))"});await delay(150);
  }
  if(process.argv.includes('--left-armadillo')) {
    const outing=await call('Runtime.evaluate',{expression:"(()=>{document.querySelector('.hidden-animal[data-animal=\"1\"]').click();const e=document.querySelector('.armadillo-track[data-animal=\"1\"]'),a=e.getAnimations().find(a=>a.animationName==='armadillo-explore');if(!a)return false;a.currentTime=Number(a.effect.getTiming().duration)*.52;document.querySelector('#pause').click();return Math.abs(new DOMMatrix(getComputedStyle(e).transform).m41)>70})()",returnByValue:true});
    if(!outing.result.value)throw Error('Left armadillo did not reach its extended route');
  }
  if(process.argv.includes('--ambient-toucan')) {
    const result=await call('Runtime.evaluate',{expression:`import('/assets/scenes/jungle/jungle-toucans.js').then(m=>{document.querySelector('#pause').click();m.pauseToucans(false);m.updatePerchedToucans(51);const bird=document.querySelector('.ambient-toucan');const visible=!bird.hidden&&!!bird.closest('.forest-depth.middle');m.updatePerchedToucans(70);const quiet=bird.hidden;m.updatePerchedToucans(51);m.pauseToucans(true);return visible&&quiet})`,returnByValue:true});
    if(!result.result.value)throw Error('Background toucan crossing or quiet interval failed');
  }
  if(process.argv.includes('--sea-lion-gaits')) {
    await call('Runtime.evaluate',{expression:`import('/assets/scenes/bay/wildlife.js').then(({drawWalkingSeaLion})=>{const c=document.createElement('canvas');c.width=1200;c.height=680;c.style.cssText='position:fixed;left:100px;top:80px;width:1200px;height:680px;z-index:30';document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#c3c6b6';ctx.fillRect(0,0,c.width,c.height);['shuffle','low-pull','amble','bound'].forEach((style,row)=>{ctx.fillStyle='#263b37';ctx.font='18px sans-serif';ctx.fillText(style,20,42+row*160);for(let col=0;col<5;col++){ctx.save();ctx.translate(190+col*205,132+row*160);ctx.strokeStyle='#a1a998';ctx.beginPath();ctx.moveTo(-100,20);ctx.lineTo(110,20);ctx.stroke();ctx.scale(2.7,2.7);drawWalkingSeaLion(ctx,{style,phase:col/5,coat:'#79684c'});ctx.restore();}})})`,awaitPromise:true});
  }
  if(process.argv.includes('--animal-review')||process.argv.includes('--animal-silhouettes'))await call('Runtime.evaluate',{expression:`(${animalReview.toString()})({silhouette:${process.argv.includes('--animal-silhouettes')}})`,awaitPromise:true});
  if(process.argv.includes('--male-sea-lion-poses'))await call('Runtime.evaluate',{expression:`(${maleSeaLionReview.toString()})()`,awaitPromise:true});
  const frame = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(output, Buffer.from(frame.data, 'base64'));
  if(process.argv.includes('--bay-motion')) {
    for(const [label,wait] of [['breach',850],['entry',950]]) {
      await delay(wait);
      const action=await call('Page.captureScreenshot',{format:'png'});
      await writeFile(output.replace(/\.png$/,`-${label}.png`),Buffer.from(action.data,'base64'));
    }
  }
  if(process.argv.includes('--toucan-detail')) {
    const bounds=await call('Runtime.evaluate',{expression:"(()=>{const r=document.querySelector('.toucan-roost[data-active=true]').getBoundingClientRect();return{x:r.x-8,y:r.y-8,width:r.width+16,height:r.height+16,scale:4}})()",returnByValue:true});
    const close=await call('Page.captureScreenshot',{format:'png',clip:bounds.result.value});
    await writeFile(output.replace(/\.png$/,'-detail.png'),Buffer.from(close.data,'base64'));
  }
  if(process.argv.includes('--macaws')) {
    await call('Runtime.evaluate',{expression:"document.querySelector('#pause').click()"});
    const paused=await call('Runtime.evaluate',{expression:"[...document.querySelectorAll('.flying-macaw')].every(bird=>bird.getAnimations().every(a=>a.playState==='paused'))",returnByValue:true});
    if(!paused.result.value)throw Error('Macaws did not pause');
    await call('Runtime.evaluate',{expression:"document.querySelector('#pause').click();document.querySelectorAll('.flying-macaw').forEach(bird=>bird.getAnimations().forEach(a=>a.finish()))"});await delay(150);
    const arrived=await call('Runtime.evaluate',{expression:"document.querySelectorAll('.macaw-roost')[1].dataset.macawActive==='true'",returnByValue:true});
    if(!arrived.result.value)throw Error('Macaws did not reach their new tree');
    await clickMacaws();await delay(100);
    await call('Runtime.evaluate',{expression:"document.querySelectorAll('.flying-macaw').forEach(bird=>bird.getAnimations().forEach(a=>a.finish()))"});await delay(150);
    const returned=await call('Runtime.evaluate',{expression:"document.querySelectorAll('.macaw-roost')[0].dataset.macawActive==='true' && document.querySelectorAll('.flying-macaw').length===0",returnByValue:true});
    if(!returned.result.value)throw Error('Macaws did not return to their first tree');
    await call('Runtime.evaluate',{expression:"document.querySelector('[data-mode=night]').click()"});
    const hidden=await call('Runtime.evaluate',{expression:"[...document.querySelectorAll('.macaw-roost')].every(b=>getComputedStyle(b).visibility==='hidden')&&getComputedStyle(document.querySelector('.day-jungle-wildlife')).display==='none'",returnByValue:true});
    if(!hidden.result.value)throw Error('Daytime wildlife remained visible at night');
    console.log('Macaw real clicks, both flights, pause/resume, morphos, and nighttime hiding passed.');
  }
  if (process.argv.includes('--animal')) {
    const bounds = await call('Runtime.evaluate', { expression: "(() => {const r=document.querySelector('.armadillo-track').getBoundingClientRect();return {x:Math.max(0,r.x-15),y:Math.max(0,r.y-18),width:r.width+30,height:r.height+32,scale:3}})()", returnByValue: true });
    const detail = await call('Page.captureScreenshot', {format:'png',clip:bounds.result.value});
    await writeFile(output.replace('.png','-detail.png'),Buffer.from(detail.data,'base64'));
  }
  if (process.argv.includes('--bats')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('#pause').click()" });
    const paused = await call('Runtime.evaluate', { expression: "[...document.querySelectorAll('.flying-fox')].every(bat=>bat.getAnimations().every(a=>a.playState==='paused'))", returnByValue: true });
    if (!paused.result.value) throw Error('Flying foxes failed to pause');
    await call('Runtime.evaluate', { expression: "document.querySelector('#pause').click();document.querySelectorAll('.flying-fox').forEach(bat=>bat.getAnimations().forEach(a=>a.finish()))" });
    await delay(150);
    const arrived = await call('Runtime.evaluate', { expression: "document.querySelectorAll('.flying-fox').length===0 && document.querySelectorAll('.tree-eyes')[1].dataset.roostActive==='true'", returnByValue: true });
    if (!arrived.result.value) throw Error('Eyes did not transfer to destination tree');
    await clickRoost();
    await delay(100);
    await call('Runtime.evaluate', { expression: "document.querySelectorAll('.flying-fox').forEach(bat=>bat.getAnimations().forEach(a=>a.finish()))" });
    await delay(150);
    const returned = await call('Runtime.evaluate', { expression: "document.querySelectorAll('.flying-fox').length===0 && document.querySelectorAll('.tree-eyes')[0].dataset.roostActive==='true'", returnByValue: true });
    if (!returned.result.value) throw Error('Flying foxes failed to return to first tree');
    console.log('Flying fox mouse clicks, pause/resume, destination eyes, and return trip passed.');
  }
  if (process.argv.includes('--animal')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('#pause').click()" });
    const paused = await call('Runtime.evaluate', { expression: "document.querySelector('.armadillo-track').getAnimations().every(animation => animation.playState === 'paused')", returnByValue: true });
    if (!paused.result.value) throw Error('Armadillo did not pause with the scene');
    await call('Runtime.evaluate', { expression: "document.querySelector('#pause').click(); document.querySelector('.armadillo-track').getAnimations().forEach(animation => animation.finish())" });
    await delay(150);
    const returned = await call('Runtime.evaluate', { expression: "({out:!!document.querySelector('.animal-out'),disabled:document.querySelector('.hidden-animal').disabled,visibility:getComputedStyle(document.querySelector('.hidden-animal')).visibility,track:document.querySelector('.armadillo-track').className,animations:document.querySelector('.armadillo-track').getAnimations().map(a=>({name:a.animationName,state:a.playState,time:a.currentTime}))})", returnByValue: true });
    console.log('Armadillo return state:', returned.result.value);
    if (returned.result.value.out || returned.result.value.disabled || returned.result.value.visibility !== 'visible') throw Error('Armadillo failed to return and restore eyes');
    await call('Runtime.evaluate', { expression: "document.querySelector('[data-mode=day]').click()" });
    const hidden = await call('Runtime.evaluate', { expression: "getComputedStyle(document.querySelector('.hidden-animal')).visibility === 'hidden'", returnByValue: true });
    if (!hidden.result.value) throw Error('Animal eyes remained visible during day');
    console.log('Armadillo outing, pause/resume, return, restored eyes, and daytime hiding passed.');
  }
  if (process.argv.includes('--rainy')&&!process.argv.includes('--bay')) {
    await call('Runtime.evaluate', { expression: "import('/assets/scenes/jungle/jungle.js').then(({jungleRiverTop})=>{window.splashChecks=[];window.originalEllipse=CanvasRenderingContext2D.prototype.ellipse;CanvasRenderingContext2D.prototype.ellipse=function(x,y,rx,ry,...rest){window.splashChecks.push(y-ry >= jungleRiverTop(x,innerWidth,innerHeight));return window.originalEllipse.call(this,x,y,rx,ry,...rest)}})",awaitPromise:true });
    await delay(500);
    const splashes = await call('Runtime.evaluate', { expression: "CanvasRenderingContext2D.prototype.ellipse=window.originalEllipse; window.splashChecks.length>0 && window.splashChecks.every(Boolean)", returnByValue: true });
    if (!splashes.result.value) throw Error('Rain splash escaped the river boundary');
    console.log('Rain splashes stayed inside the river.');
  }
  console.log(JSON.stringify({ screenshot: output, browserErrors: errors }));
  await call('Browser.close').catch(() => {});
} finally {
  socket?.close(); browser.kill(); server.kill();
}
