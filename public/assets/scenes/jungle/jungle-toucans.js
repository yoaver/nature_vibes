// Three solitary toco toucans, each with its own pair of canopy perches.
const birds=Array.from({length:3},()=>({roosts:[],home:1,generation:0,flight:null,flyer:null}));
let paused=false;
let ambientToucan=null;
export function addAmbientToucan(plane) {
 ambientToucan=document.createElement('div');ambientToucan.className='ambient-toucan';
 ambientToucan.setAttribute('aria-hidden','true');ambientToucan.innerHTML=art(true);plane.append(ambientToucan);
}
export function updatePerchedToucans(time) {
 if(ambientToucan&&!paused) {
  const cycle=Math.floor(time/147),phase=time%147-43;
  const visible=phase>=0&&phase<17&&document.body.dataset.time==='day'&&document.body.dataset.weather!=='rainy'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  ambientToucan.hidden=!visible;
  if(visible) {
   const t=phase/17,direction=cycle%2?-1:1;
   ambientToucan.style.left=`${direction===1?-8+t*116:108-t*116}%`;
   ambientToucan.style.top=`${[43,54,36][cycle%3]+Math.sin(t*Math.PI*2)*1.1}%`;
   ambientToucan.style.setProperty('--toucan-facing',direction);
  }
 }
 if(paused||document.body.dataset.time!=='day')return;
 const poses=['watching','horizontal','raised','settled','preening','horizontal','watching','settled'];
 birds.forEach((bird,id)=>{
  const beat=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.floor((time+id*11)/(24+id*5));
  bird.roosts.forEach((roost,index)=>{
   roost.dataset.pose=document.body.dataset.weather==='rainy'?'settled':poses[(beat+id)%poses.length];
   roost.style.setProperty('--toucan-facing',(beat+id)%2===0?-1:1);
  });
 });
}
function head() {
 return `<path class="toucan-skull" d="M-14 10 Q-16 -2 -10 -9 Q-5 -15 4 -12 Q10 -10 12 -4 L9 10 Q0 17 -14 10Z" fill="#252e29"/><path d="M-6 -7 Q0 -10 8 -8 L10 3 Q10 10 3 12 Q-5 12 -9 6 Q-11 -1 -6 -7Z" fill="#e0dfca"/><g class="toucan-bill" transform="translate(7 0) scale(1.2 1) translate(-7 0)"><path d="M7 -9 Q23 -16 34 -10 Q43 -6 43 1 Q28 6 8 3Z" fill="#dfa044"/><path d="M8 3 Q25 6 43 1 Q37 8 10 7Z" fill="#dca34b"/><path d="M34 -10 Q43 -6 43 1 L37 3 Q33 -1 34 -10Z" fill="#30372e"/><path d="M9 3 Q26 5 42 1" fill="none" stroke="#9c7938" stroke-width=".6"/></g><ellipse cx="0" cy="-3" rx="4.1" ry="4.5" fill="#d9943e"/><circle cx="0" cy="-3" r="2.7" fill="#7891ab"/><circle cx=".5" cy="-3" r="1.3" fill="#252925"/>`;
}
function art(flying=false) {
 if(flying)return `<svg viewBox="0 0 100 55" aria-hidden="true"><path d="M31 29 L4 38 L25 37 L39 34Z" fill="#303a32"/><ellipse cx="43" cy="31" rx="19.5" ry="8.2" fill="#252e29"/><path d="M49 24 Q55 17 62 18 L68 27 Q62 34 53 34Z" fill="#252e29"/><path d="M60 24 L68 25 Q66 32 57 33 L54 30Z" fill="#e0dfca"/><path class="toucan-wing" d="M44 29 Q27 8 8 6 Q16 27 34 36Z" fill="#354137"/><g transform="translate(63 21) scale(.85)">${head()}</g></svg>`;
 return `<svg viewBox="0 0 90 90" aria-hidden="true">
  <g class="toucan-posture">
  <path d="M25 45 L9 80 Q15 84 23 79 L37 51Z" fill="#303a32"/>
  <path d="M33 26 Q25 29 23 39 Q19 49 27 56 Q35 62 43 54 Q49 47 47 37 L43 28Z" fill="#252e29"/>
  <path class="toucan-neck" d="M29 34 Q31 24 32 15 Q33 8 40 8 L51 16 Q53 23 48 31 L44 40 Q35 42 29 34Z" fill="#252e29"/>
  <path d="M44 19 Q49 18 51 21 Q51 25 47 27 L43 27 Q41 24 44 19Z" fill="#e0dfca"/>
  <path d="M29 54 Q32 61 36 59 L39 54Z" fill="#9f5140"/>
  <path d="M32 29 Q23 35 24 46 Q24 54 29 53 Q37 47 41 35 Q37 30 32 29Z" fill="#354137"/>
  <g transform="translate(46 12)"><g class="toucan-head"><g class="toucan-head-motion">${head()}</g></g></g>
  </g>
  <path d="M30 54 L27 60 L30 65 L36 67 M38 53 L34 60 L37 65 L42 67 M30 65 L26 67 M37 65 L33 67" fill="none" stroke="#74785a" stroke-width="1.6" stroke-linecap="round"/>
 </svg>`;
}
function refresh(bird) {
 bird.roosts.forEach((roost,i)=>{roost.dataset.active=String(i===bird.home&&!bird.flight);roost.disabled=!!bird.flight||i!==bird.home;});
}
export function addToucanRoost(crown,id) {
 const bird=birds[id],index=bird.roosts.length;
 const roost=document.createElement('button');roost.className='toucan-roost';roost.dataset.toucan=String(id);
 const places=[[[55,55],[22,28]],[[18,68],[55,55]],[[52,8],[30,50]]][id];
 roost.style.left=`${places[index][0]}%`;roost.style.top=`${places[index][1]}%`;
 roost.style.setProperty('--toucan-facing',index?1:-1);roost.style.setProperty('--toucan-delay',`${-id*8-index*3}s`);
 roost.style.setProperty('--head-period',`${11.3+id*2.1}s`);roost.style.setProperty('--head-offset',`${-id*4.7-index*2.3}s`);
 roost.type='button';roost.title='Watch the toco toucan fly';roost.setAttribute('aria-label','Watch this toco toucan fly to its other branch');
 roost.innerHTML=art();crown.append(roost);bird.roosts.push(roost);refresh(bird);
 roost.addEventListener('click',()=>fly(id,index));
}
async function fly(id,source) {
 const bird=birds[id];
 if(paused||bird.flight||source!==bird.home||bird.roosts.length!==2||document.body.dataset.time!=='day'||document.body.dataset.weather==='rainy')return;
 const destination=1-source,token=++bird.generation;
 const a=bird.roosts[source].getBoundingClientRect(),b=bird.roosts[destination].getBoundingClientRect();
 const flyer=document.createElement('div');flyer.className='flying-toucan';flyer.dataset.toucan=String(id);flyer.innerHTML=art(true);
 flyer.style.setProperty('--toucan-facing',b.x>a.x?1:-1);document.body.append(flyer);bird.flyer=flyer;
 const frames=Array.from({length:25},(_,i)=>{const t=i/24;return{transform:`translate(${a.x+a.width/2+(b.x-a.x)*t}px,${a.y+a.height*.4+(b.y-a.y)*t-Math.sin(t*Math.PI)*55}px) translate(-50%,-50%)`,opacity:i===0?0:1};});
 bird.flight=flyer.animate(frames,{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.max(1500,Math.hypot(b.x-a.x,b.y-a.y)/180*1000),fill:'both',easing:'linear'});refresh(bird);
 try {await bird.flight.finished;if(token===bird.generation)bird.home=destination;}
 catch { /* A time or environment change cancels the trip. */ }
 finally {if(token===bird.generation){bird.flight=null;flyer.remove();bird.flyer=null;refresh(bird);}}
}
export function resetToucans() {
 for(const bird of birds){bird.generation++;bird.flight?.cancel();bird.flyer?.remove();bird.flight=null;bird.flyer=null;bird.home=1;refresh(bird);}
}
export function pauseToucans(value) {paused=value;for(const bird of birds)if(bird.flight)value?bird.flight.pause():bird.flight.play();}
addEventListener('resize',resetToucans);
