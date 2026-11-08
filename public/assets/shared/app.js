import { drawJungle, jungleRiverTop, resetJungleAnimal, setJunglePaused } from '../scenes/jungle/jungle.js';
import { drawBay } from '../scenes/bay/scene.js';

let environment = 'bay';
try { const saved=localStorage.getItem('nature-vibes-environment');if(['jungle','bay'].includes(saved))environment=saved; } catch {}
const requestedEnvironment=new URLSearchParams(location.search).get('environment');
if(['bay','jungle'].includes(requestedEnvironment))environment=requestedEnvironment;

// Change these palettes to give the beach a new look.
const scenes = {
 day: {sky:['#559cab','#b7d8cf','#f7e4bb'],sea:['#4b9eab','#338e9b','#78b6b2'],sand:['#d4bd96','#efe0bd'],name:'The quiet coast',detail:'DAYLIGHT Â· ENDLESS SUMMER'},
 night: {sky:['#08152e','#183653','#647385'],sea:['#28475f','#1a4256','#406575'],sand:['#687879','#89948c'],name:'Under the same moon',detail:'MOONLIGHT Â· A QUIETER WORLD'}
};
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let w,h,time=0,night=0,target=0,paused=reduced.matches,previous=0,mode='day';
try {mode=localStorage.getItem('nature-vibes-scene')==='night'?'night':'day';} catch {}
night=target=mode==='night'?1:0;
const weatherPresets = {
 clear: { cloud: 0, rain: 0 },
 cloudy: { cloud: .8, rain: 0 },
 rainy: { cloud: 1, rain: 1 },
};
let weather = 'clear', cloudCover = 0, rainfall = 0;
try {
 const saved = localStorage.getItem('nature-vibes-weather');
 if (Object.hasOwn(weatherPresets, saved)) weather = saved;
} catch {}
cloudCover = weatherPresets[weather].cloud;
rainfall = weatherPresets[weather].rain;

// All landscape and weather details are procedural canvas shapes.
function drawSailboats(horizon) {
 const boats = [
  { x: .18, depth: .075, size: .037, speed: .0018, direction: 1 },
  { x: .49, depth: .025, size: .023, speed: .0011, direction: -1 },
  { x: .65, depth: .13, size: .05, speed: .0014, direction: -1 },
 ];
 for (const [i, boat] of boats.entries()) {
  // Travel stays on open water, well clear of the headland.
  const travel = ((boat.x + time * boat.speed * boat.direction) % .82 + .82) % .82;
  const x = (travel - .035) * w, y = horizon + h * boat.depth + Math.sin(time * .7 + i * 3) * h * .0015;
  const size = Math.min(w, h) * boat.size;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * .5 + i) * .025);
  ctx.strokeStyle = `rgba(218,238,231,${.23 - night * .1})`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-size * .8, size * .18); ctx.lineTo(size * .8, size * .18); ctx.stroke();
  ctx.fillStyle = mix('#f7edd5', '#a1b2bc');
  ctx.beginPath(); ctx.moveTo(-1, -size * 1.55); ctx.lineTo(-1, -size * .15); ctx.lineTo(-size * .73, -size * .15); ctx.closePath(); ctx.fill();
  ctx.fillStyle = mix('#dddece', '#718b9b');
  ctx.beginPath(); ctx.moveTo(2, -size * 1.3); ctx.lineTo(size * .53, -size * .18); ctx.lineTo(2, -size * .18); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = mix('#5d655e', '#354d5c');
  ctx.beginPath(); ctx.moveTo(0, -size * 1.6); ctx.lineTo(0, 0); ctx.stroke();
  ctx.fillStyle = mix('#695c4d', '#283f50');
  ctx.beginPath(); ctx.moveTo(-size * .8, 0); ctx.lineTo(size * .72, 0); ctx.lineTo(size * .48, size * .2); ctx.lineTo(-size * .52, size * .2); ctx.closePath(); ctx.fill();
  ctx.restore();
 }
}
function drawBirds() {
 if (mode === 'night' || weather === 'rainy') return;
 ctx.save(); ctx.globalAlpha = (1 - night) * (1 - rainfall);
 ctx.strokeStyle = mix('#4c6871', '#8b9ca9'); ctx.lineCap = 'round';
 for (let i = 0; i < 9; i++) {
  const x = ((.12 + random(i + 5000) * .65 + time * (.003 + random(i + 5100) * .001)) % 1.2 - .1) * w;
  const y = h * (.20 + random(i + 5200) * .17) + Math.sin(time * .3 + i) * h * .008;
  const span = Math.min(w, h) * (.006 + random(i + 5300) * .007);
  const flap = Math.sin(time * (2.3 + random(i + 5400)) + i * 2) * span * .45;
  ctx.lineWidth = Math.max(.7, span * .14);
  ctx.beginPath(); ctx.moveTo(x - span, y - flap);
  ctx.quadraticCurveTo(x - span * .45, y - span * .35, x, y);
  ctx.quadraticCurveTo(x + span * .45, y - span * .35, x + span, y - flap); ctx.stroke();
 }
 ctx.restore();
}
function drawCloud(x, y, width, height, opacity, seed) {
 ctx.save(); ctx.translate(x, y); ctx.globalAlpha = opacity;
 // One continuous silhouette avoids visible overlapping circles and gradient boxes.
 const top = mix(rainfall > .5 ? '#bdc8ca' : '#fff9e9', '#65778c');
 const bottom = mix(rainfall > .5 ? '#738b98' : '#c8d9dc', '#35495e');
 ctx.fillStyle = gradient(-height, height * .15, [top, bottom]);
 ctx.shadowColor = mix('#e4ece8', '#40556a'); ctx.shadowBlur = Math.min(10, width * .025);
 ctx.beginPath(); ctx.moveTo(-width * .5, 0);
 ctx.bezierCurveTo(-width * .57, -height * .2, -width * .44, -height * .5, -width * .32, -height * .38);
 ctx.bezierCurveTo(-width * .35, -height * .84, -width * .15, -height * .95, -width * .06, -height * .7);
 ctx.bezierCurveTo(width * .01, -height * (1.2 + random(seed) * .25), width * .23, -height * 1.05, width * .25, -height * .55);
 ctx.bezierCurveTo(width * .39, -height * .72, width * .47, -height * .39, width * .43, -height * .24);
 ctx.bezierCurveTo(width * .6, -height * .2, width * .58, height * .04, width * .44, height * .08);
 ctx.bezierCurveTo(width * .2, height * .13, -width * .3, height * .14, -width * .5, 0);
 ctx.closePath(); ctx.fill(); ctx.restore();
}
function drawWeatherClouds() {
 // Distant smaller clouds sit low; nearer banks drift slowly across the upper sky.
 ctx.save();
 ctx.fillStyle = `rgba(37,57,76,${cloudCover * (.12 + rainfall * .13)})`;
 ctx.fillRect(0, 0, w, h * .49);
 ctx.restore();
 for (let i = 0; i < 10; i++) {
  const distant = i < 4;
  const width = w * (distant ? .13 : .22 + random(i + 3200) * .15);
  const x = ((random(i + 3300) * (w + width * 2) + time * (distant ? 1.3 : 3)) % (w + width * 2)) - width;
  const y = h * (distant ? .36 + random(i + 3400) * .055 : .13 + random(i + 3400) * .15);
  const opacity = (distant ? .3 : .76) * (i < 3 ? 1 : cloudCover) * (1 - night * .35);
  drawCloud(x, y, width, Math.min(h * .1, width * .22) * (distant ? .5 : 1), opacity, i + 3500);
 }
}
function drawRain(horizon, riverTop = null) {
 if (rainfall < .001) return;
 ctx.save(); ctx.globalAlpha = rainfall;
 for (let i = 0; i < Math.min(470, Math.round(w * .33)); i++) {
  const depth = .12 + random(i + 3600) * .88;
  ctx.strokeStyle=`rgba(204,225,231,${(.075+depth*.19)*(1-night*.35)})`;
  ctx.lineWidth=.35+depth*.65;ctx.beginPath();
  const y = (random(i + 3700) * h + time * (260 + depth * 330)) % (h + 30) - 20;
  const x = (random(i + 3800) * (w + 100) - time * 65 * depth % (w + 100) + w + 100) % (w + 100) - 50;
  ctx.moveTo(x, y); ctx.lineTo(x - 3 * depth, y + 4+14 * depth);ctx.stroke();
 }
 if (riverTop) {
  // Clip splash rings to the exact same curved boundary as the river fill.
  ctx.beginPath(); ctx.moveTo(0, riverTop(0));
  for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, riverTop(x));
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.clip();
 }
 for (let i = 0; i < 65; i++) {
  const phase = (time * .8 + random(i + 4000)) % 1;
  const x = random(i + 4200) * w;
  const top = riverTop ? riverTop(x) : horizon;
  const y = riverTop ? top + 3 + random(i + 4100) * Math.max(0, h - top - 6)
   : horizon + h * (.03 + random(i + 4100) * .29);
  ctx.strokeStyle = `rgba(211,233,234,${(1 - phase) * .2})`;
  ctx.beginPath(); ctx.ellipse(x, y, 1 + phase * 8, .5 + phase * 1.5, 0, 0, Math.PI * 2); ctx.stroke();
 }
 ctx.restore();
}
function random(seed){const x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function mix(a,b){const aa=a.match(/\w\w/g).map(x=>parseInt(x,16)),bb=b.match(/\w\w/g).map(x=>parseInt(x,16));return `rgb(${aa.map((x,i)=>Math.round(x+(bb[i]-x)*night)).join(',')})`;}
function color(group,i){return mix(scenes.day[group][i],scenes.night[group][i]);}
function gradient(y1,y2,colors){const g=ctx.createLinearGradient(0,y1,0,y2);colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c));return g;}
function resize(){w=innerWidth;h=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=w*ratio;canvas.height=h*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);render();}
function render(){
 if(!w||!h)return;
 if (environment === 'jungle') {
  ctx.clearRect(0, 0, w, h);
  drawJungle(ctx, { w, h, time, night, cloudCover, rainfall, mix, random });
  drawRain(h * .816, x => jungleRiverTop(x, w, h));
  return;
 }
 const horizon=h*.49;
 ctx.fillStyle=gradient(0,horizon,[color('sky',0),color('sky',1),color('sky',2)]);ctx.fillRect(0,0,w,h);
 for(let i=0;i<140;i++){
  ctx.globalAlpha=night*(.25+.6*random(i+30))*(.8+.2*Math.sin(time*.4+i));ctx.fillStyle='#f3f5e6';
  ctx.beginPath();ctx.arc(random(i+1)*w,random(i+200)*horizon*.9,.5+random(i+400),0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;
 const ox=w*.74,oy=h*.235,radius=Math.min(w,h)*.043;
 const glow=ctx.createRadialGradient(ox,oy,radius*.3,ox,oy,radius*8);
 glow.addColorStop(0,`rgba(255,241,197,${.24-night*.12})`);glow.addColorStop(1,'rgba(255,241,197,0)');
 ctx.fillStyle=glow;ctx.fillRect(0,0,w,horizon);
 ctx.fillStyle='#fff4cf';ctx.shadowColor='#fff2c9';ctx.shadowBlur=16;
 ctx.beginPath();ctx.arc(ox,oy,radius,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 drawWeatherClouds();
 drawBirds();
 drawBay(ctx,{w,h,time,night,mix,color,gradient,random,horizon,cloudCover,drawSailboats,drawRain});
}
function updateDescription() {
 if (environment === 'jungle') {
  canvas.setAttribute('aria-label', `${mode === 'day' ? 'Daytime' : 'Nighttime'} jungle viewed sideways from a boat, with flowing water in the foreground and a close view of trees, lianas and bushes on the opposite bank, in ${weather} weather`);
  return;
 }
 canvas.setAttribute('aria-label', `${mode === 'day' ? 'Sunlit' : 'Moonlit'} beach, sailboats, seabirds, distant islands and a lighthouse on a nearby offshore outcrop, with ${weather} weather`);
}
function setEnvironment(next) {
 if (!['bay', 'jungle'].includes(next)) return;
 environment = next;
 if (next !== 'jungle') resetJungleAnimal();
 document.body.dataset.environment = next;
 document.querySelectorAll('[data-environment]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.environment === next)));
 try { localStorage.setItem('nature-vibes-environment', next); } catch {}
 updateDescription(); render();
}
document.querySelectorAll('[data-environment]').forEach(button => button.addEventListener('click', () => setEnvironment(button.dataset.environment)));
function setWeather(next) {
 if (!Object.hasOwn(weatherPresets, next)) return;
 weather = next;
 document.body.dataset.weather=next;
 document.querySelectorAll('[data-weather]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.weather === next)));
 try { localStorage.setItem('nature-vibes-weather', next); } catch {}
 if (reduced.matches || paused) {
  cloudCover = weatherPresets[next].cloud;
  rainfall = weatherPresets[next].rain;
  render();
 }
 updateDescription();
}
document.querySelectorAll('[data-weather]').forEach(button => button.addEventListener('click', () => setWeather(button.dataset.weather)));
function setMode(next){
 mode=next;target=next==='night'?1:0;
 document.body.dataset.time = next;
 resetJungleAnimal();
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));
 updateDescription();
 try{localStorage.setItem('nature-vibes-scene',next);}catch{}
 if(reduced.matches){night=target;render();}
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
const pauseButton=document.querySelector('#pause');
function updatePause(){pauseButton.textContent=paused?'\u25b7':'\u2161';pauseButton.title=paused?'Resume animation':'Pause animation';pauseButton.setAttribute('aria-label',pauseButton.title);document.body.classList.toggle('paused', paused);setJunglePaused(paused);}
pauseButton.addEventListener('click',()=>{paused=!paused;updatePause();});
reduced.addEventListener('change',()=>{paused=reduced.matches;updatePause();});
addEventListener('resize',resize);
function frame(now){
 const delta=Math.min((now-(previous||now))/1000,.05);previous=now;
 const preset = weatherPresets[weather];
 const transitioning=Math.abs(night-target)>.001 || Math.abs(cloudCover-preset.cloud)>.001 || Math.abs(rainfall-preset.rain)>.001;
 if(!paused)time+=delta;
 if(transitioning) {
  const blend = Math.min(1, delta * 2.5);
  night += (target-night)*blend;
  cloudCover += (preset.cloud-cloudCover)*blend;
  rainfall += (preset.rain-rainfall)*blend;
 } else { night=target; cloudCover=preset.cloud; rainfall=preset.rain; }
 if((!paused&&!document.hidden)||transitioning)render();
 requestAnimationFrame(frame);
}
setMode(mode);setWeather(weather);setEnvironment(environment);updatePause();resize();requestAnimationFrame(frame);

// Reload open tabs when the local server detects a saved public file.
const reloadEvents = new EventSource('/__reload');
reloadEvents.onmessage = event => { if (event.data === 'reload') location.reload(); };

