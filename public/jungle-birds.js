// Daytime wildlife is drawn with local vector shapes and CSS, without image files.
const groups = Array.from({length:3},(_,i)=>({roosts:[],flights:[],home:i===2?1:0,start:i===2?1:0,generation:0}));
const butterflies = [], landingAnimations = new Set();
const butterflyHomes=new Map();
const perchedMacaws=[];
let landingGeneration = 0, landingIndex = 0;
let rainSheltered=false;
const groupSpecies=[5,6,8].map(count=>Array.from({length:count},(_,i)=>i%3===1?'hyacinth':'scarlet'));
let paused = false;
const layer = document.createElement('div');
layer.className = 'day-jungle-wildlife';
layer.setAttribute('aria-hidden','true');
document.body.append(layer);

function birdArt(kind, flying = false) {
 const blue = kind === 'hyacinth';
 const body = blue ? '#305bb9' : '#ce5041', wing = blue ? '#244995' : '#d2ad4e';
 if (flying) return `<svg viewBox="0 0 95 60">
 <path d="M43 35 L2 41 L32 31Z" fill="${blue ? '#284f9d' : '#b2453f'}"/>
 <ellipse cx="49" cy="33" rx="17" ry="7" fill="${body}"/>
 <path class="macaw-wing" d="M54 32 Q43 10 15 4 Q24 21 35 35Z" fill="${wing}"/>
 ${blue ? '' : '<path class="macaw-wing" d="M36 31 Q21 20 15 4 Q26 10 31 14 L45 34Z" fill="#2e72ae"/>'}
 <circle cx="68" cy="27" r="9" fill="${body}"/>
 <ellipse cx="72" cy="26" rx="3.6" ry="4.8" fill="${blue ? '#d9bd55' : '#e8dcc4'}"/>
 <circle cx="73" cy="25" r="1.3" fill="#252b2b"/>
 <path d="M76 22 Q88 23 83 33 L78 30 L79 26Z" fill="#373d40"/>
 </svg>`;
 return `<svg viewBox="0 0 35 75">
 <path d="M12 37 L11 73 L20 68 L24 38Z" fill="${blue ? '#284c98' : '#b94a40'}"/>
 <ellipse cx="17" cy="31" rx="10" ry="18" fill="${body}"/>
 <path d="M11 20 Q3 27 10 48 L19 41 L21 24Z" fill="${wing}"/>
 ${blue ? '' : '<path d="M10 33 L10 48 L19 41 L21 34Z" fill="#3476af"/>'}
 <circle cx="19" cy="14" r="9" fill="${body}"/>
 <g class="macaw-face"><ellipse cx="23" cy="14" rx="4" ry="5" fill="${blue ? '#dbbf53' : '#e8ddc7'}"/>
 <circle cx="24" cy="12" r="1.2" fill="#202b2e"/>
 <path d="M27 10 Q37 12 30 23 L26 18 L29 15Z" fill="#343a3e"/></g>
 <path d="M15 44 L15 49 L20 49 M21 43 L22 49 L26 49" stroke="#62604d" stroke-width="1.6" fill="none"/>
 </svg>`;
}
function update(group, busy = false) {
 group.roosts.forEach((roost,index) => {
  roost.dataset.macawActive = String(index === group.home);
  roost.disabled = busy || index !== group.home;
  roost.setAttribute('aria-busy',String(busy));
 });
}
export function resetDayWildlife() {
 for(const group of groups) {
  group.generation++;
  for(const flight of group.flights)flight.cancel();
  for(const roost of group.roosts) { delete roost.dataset.arriving;roost.querySelectorAll('.perched-macaw').forEach(bird=>bird.style.visibility=''); }
  group.flights.length=0;group.home=group.start;update(group);
 }
 document.querySelectorAll('.flying-macaw').forEach(bird=>bird.remove());
 resetLandings();
}
export function pauseDayWildlife(value) {
 paused = value;
 for (const group of groups) for (const flight of group.flights) value ? flight.pause() : flight.play();
 for(const animation of landingAnimations)value?animation.pause():animation.play();
}
async function transfer(groupId,source) {
 const group=groups[groupId],roosts=group.roosts,flights=group.flights;
 if (source !== group.home || flights.length || roosts.length !== 2 || document.body.dataset.time !== 'day') return;
 const token = ++group.generation, destination = 1-source;
 const from = roosts[source].getBoundingClientRect(), to = roosts[destination].getBoundingClientRect();
 const x0=from.x+from.width/2, y0=from.y+from.height/2;
 const x1=to.x+to.width/2, y1=to.y+to.height/2;
 const direction = x1>x0 ? 1 : -1;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const plane=groupId===1?roosts[0].closest('.forest-depth'):null;
 const bounds=plane?.getBoundingClientRect(),scale=plane?bounds.width/plane.clientWidth:1;
 update(group,true);
 roosts[destination].dataset.arriving='true';
 roosts[destination].querySelectorAll('.perched-macaw').forEach(bird=>bird.style.visibility='hidden');
 for (const [index,kind] of groupSpecies[groupId].entries()) {
  const takeoffDelay=reduced?0:[0,450,950,200,1400,700,1650,1150][index];
  const perched=roosts[source].querySelectorAll('.perched-macaw')[index];
  const startPerch=perched.getBoundingClientRect(),endPerch=roosts[destination].querySelectorAll('.perched-macaw')[index].getBoundingClientRect();
  const sx=startPerch.x+startPerch.width/2,sy=startPerch.y+startPerch.height*.4;
  const ex=endPerch.x+endPerch.width/2,ey=endPerch.y+endPerch.height*.4;
  const departure=perched.animate([{visibility:'hidden'},{visibility:'hidden'}],{duration:1,delay:takeoffDelay,fill:'forwards'});
  flights.push(departure);if(paused)departure.pause();
  const bird=document.createElement('div'); bird.className=`flying-macaw ${kind}`; bird.dataset.group=groupId;
  bird.style.setProperty('--facing',direction); bird.style.setProperty('--flap',`${.39+index*.025}s`);
  bird.innerHTML=birdArt(kind,true); (plane||layer).append(bird);
  const frames=Array.from({length:25},(_,step)=>{
   const t=step/24, arc=Math.sin(t*Math.PI);
   const x=sx+(ex-sx)*t+arc*direction*[30,-50,60,-25,12,-35,45,-15][index];
   const y=sy+(ey-sy)*t-arc*[65,145,35,190,105,80,155,50][index]*(plane?.75:1)+Math.sin(t*7+index)*arc*9;
   return {transform:`translate(${(x-(bounds?.x||0))/scale}px,${(y-(bounds?.y||0))/scale}px) translate(-50%,-50%) scale(${plane?.75:1})`,opacity:step===0?0:1};
  });
  const flight=bird.animate(frames,{duration:reduced?1:[3100,2700,3600,2950,3300,2850,3450,3000][index],delay:takeoffDelay,fill:'both',easing:'linear'});
  flight.finished.then(()=>{
   if(token!==group.generation)return;
   roosts[destination].querySelectorAll('.perched-macaw')[index].style.visibility='visible';bird.remove();
  }).catch(()=>{});
  flights.push(flight); if(paused)flight.pause();
 }
 await Promise.all(flights.map(flight=>flight.finished.catch(()=>{})));
 if(token!==group.generation)return;
 document.querySelectorAll('.flying-macaw[data-group="'+groupId+'"]').forEach(bird=>bird.remove());
 for(const animation of flights)animation.cancel();
 delete roosts[destination].dataset.arriving;
 for(const roost of roosts)roost.querySelectorAll('.perched-macaw').forEach(bird=>bird.style.visibility='');
 flights.length=0; group.home=destination; update(group);
}
export function addMacawRoost(crown,groupId=0) {
 const group=groups[groupId];
 const variant=groupId*2+group.roosts.length;
 const forks=[
  [[[8,50],[54,43]],[[75,75],[126,67]],[[45,100],[86,94]]],
  [[[14,38],[70,49]],[[69,81],[128,70]],[[36,97],[83,103]]],
  [[[0,68],[48,47]],[[79,48],[131,56]],[[39,94],[95,88]]],
  [[[9,48],[60,38]],[[73,68],[125,83]],[[20,100],[70,94]]],
  [[[4,57],[57,67]],[[68,40],[127,49]],[[55,99],[110,89]]],
  [[[10,40],[62,49]],[[64,78],[130,62]],[[20,95],[71,102]]],
 ][variant];
 const distribution=[[2,2,1],[2,2,2],[3,3,2]][groupId];
 const perchPoints=forks.flatMap(([a,b],i)=>Array.from({length:distribution[i]},(_,j)=>{const t=distribution[i]===1?.6:.15+j*.7/(distribution[i]-1);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}));
 const roost=document.createElement('button'); roost.className='macaw-roost'; roost.type='button';
 roost.dataset.group=groupId;
 roost.style.setProperty('--roost-x',groupId===1?(group.roosts.length===0?'35%':'38%'):group.roosts.length===0?'65%':'40%');
 roost.style.setProperty('--roost-y',groupId===1?(group.roosts.length===0?'22%':'9%'):group.roosts.length===0?'8%':'28%');
 if(groupId===2) {
  roost.style.setProperty('--roost-x',group.roosts.length===0?'15%':'-25%');
  roost.style.setProperty('--roost-y',group.roosts.length===0?'22%':'16%');
 }
 roost.setAttribute('aria-label','Watch the macaws fly to the other tree'); roost.title='Watch the macaws';
 for(const [index,kind] of groupSpecies[groupId].entries()) {
  const bird=document.createElement('span'); bird.className=`perched-macaw ${kind}`;
  if(index%4===2)bird.classList.add('turned-away');
  bird.style.setProperty('--bird-facing',index%2? -1:1); bird.style.setProperty('--delay',`${-index*1.2}s`);
  bird.style.setProperty('--perch-x',`${(perchPoints[index][0]-11)/135*100}%`);
  bird.style.setProperty('--perch-y',`${(perchPoints[index][1]-38)/110*100}%`);
  bird.innerHTML=birdArt(kind); roost.append(bird);
  perchedMacaws.push({bird,index,groupId,facing:index%2?-1:1});
 }
 const branches=document.createElementNS('http://www.w3.org/2000/svg','svg');
 branches.classList.add('macaw-branches');branches.setAttribute('viewBox','0 0 135 110');branches.setAttribute('preserveAspectRatio','none');
 // Only the quiet outer perches show through the canopy; no exposed framework.
 branches.innerHTML=forks.map(([a,b])=>`<path d="M${a.join(' ')} Q${(a[0]+b[0])/2} ${(a[1]+b[1])/2+1.5} ${b.join(' ')}"/>`).join('');
 branches.style.strokeWidth=String([2,1.8,1.7,1.9,2.1,1.8][variant]);
 roost.append(branches);
 crown.append(roost);const index=group.roosts.length;group.roosts.push(roost);
 roost.addEventListener('click',()=>transfer(groupId,index));update(group);
}
for(let index=0;index<7;index++) {
 const butterfly=document.createElement('div');butterfly.className='morpho-butterfly';
 butterfly.style.setProperty('--x',`${[17,38,55,72,86,29,63][index]}%`);
 butterfly.style.setProperty('--y',`${[58,64,54,68,61,57,65][index]}%`);
 butterfly.style.setProperty('--wander',`${[24,41,29,53,34,46,31][index]}s`);
 butterfly.style.setProperty('--delay',`${[-3,-17,-8,-31,-5,-25,-13][index]}s`);
 butterfly.style.setProperty('--flutter',`${[.28,.45,.33,.52,.38,.31,.43][index]}s`);
 butterfly.style.setProperty('--flutter-delay',`${-index*.137}s`);
 butterfly.style.setProperty('--sway-x',`${[1.8,3.8,2.4,1.2,3,2.1,3.4][index]}vw`);
 butterfly.style.setProperty('--sway-y',`${[.9,1.8,1.2,1.5,.8,1.9,1.1][index]}vh`);
 butterfly.style.setProperty('--drift-sign',index%2 ? -1 : 1);
 butterfly.style.setProperty('--glide',['ease-in-out','cubic-bezier(.4,0,.2,1)','ease','cubic-bezier(.6,0,.3,1)','ease-in-out','ease','cubic-bezier(.3,0,.7,1)'][index]);
 if(index===3||index===5) {
  butterfly.style.setProperty('--excursion',`morpho-excursion ${index===3?97:139}s ${index===3?-24:-79}s ease-in-out infinite`);
  butterfly.style.setProperty('--excursion-y',index===3?'20vh':'-29vh');
 }
 butterfly.innerHTML=`<svg viewBox="0 0 36 32"><path class="morpho-wing left" d="M18 16 Q5 -3 2 5 Q-1 14 12 18 Q0 18 7 27 Q13 31 18 19Z" fill="#489ce1" stroke="#213c48" stroke-width="2"/><path class="morpho-wing right" d="M18 16 Q31 -3 34 5 Q37 14 24 18 Q36 18 29 27 Q23 31 18 19Z" fill="#489ce1" stroke="#213c48" stroke-width="2"/><path d="M18 10 L18 23" stroke="#24352f" stroke-width="2"/></svg>`;
 layer.append(butterfly);
 butterflies.push(butterfly);
}
export function placeButterfliesInDepth(forest) {
 for(const [index,depth] of [[1,'middle'],[2,'far'],[4,'middle']]) {
  const butterfly=butterflies[index],plane=forest.querySelector(`.forest-depth.${depth}`);
  butterfly.style.setProperty('--x',`${(parseFloat(butterfly.style.getPropertyValue('--x'))+5)/1.1}%`);
  butterfly.style.setProperty('--y',`${(parseFloat(butterfly.style.getPropertyValue('--y'))+8.3)/.913}%`);
  butterfly.dataset.depth=depth;plane.append(butterfly);butterflyHomes.set(butterfly,plane);
 }
}
function restoreButterfly(butterfly) {
 (butterflyHomes.get(butterfly)||layer).append(butterfly);
 butterfly.classList.remove('landing','landed','weather-settled');
 for(const name of ['left','top','transform'])butterfly.style.removeProperty(name);
 delete butterfly.dataset.landingState;delete butterfly.dataset.landingOn;
}
export function updateDayWildlifeWeather() {
 const rain=document.body.dataset.weather==='rainy';
 if(rain&&!rainSheltered)resetLandings();
 if(!rain&&rainSheltered)butterflies.forEach(restoreButterfly);
 rainSheltered=rain;
 if(rain) {
  const bushes=[...document.querySelectorAll('.bank-bush:not(.armadillo-home)')];
  butterflies.forEach((butterfly,index)=>{
   if(butterfly.classList.contains('weather-settled')||!bushes.length)return;
   bushes[(index*3)%bushes.length].append(butterfly);
   butterfly.classList.add('weather-settled');butterfly.style.left=`${25+index%3*15}%`;butterfly.style.top='22%';
  });
 }
}
export function updatePerchedMacaws(time) {
 const rain=document.body.dataset.weather==='rainy',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const {bird,index,groupId,facing} of perchedMacaws) {
  const pose=rain?2:reduced?index%4:Math.floor((time+index*7.1+groupId*13)/(21+index%3*6))%4;
  const posture=['watching','preening','settled','turned'][pose];
  if(bird.dataset.posture===posture)continue;
  bird.dataset.posture=posture;
  bird.classList.toggle('turned-away',pose===3);
  bird.style.setProperty('--bird-facing',pose===1?-facing:facing);
 }
}
function resetLandings() {
 landingGeneration++;
 for(const animation of landingAnimations)animation.cancel();
 landingAnimations.clear();
 butterflies.forEach(restoreButterfly);
}
async function animateLanding(butterfly,frames,options) {
 const animation=butterfly.animate(frames,{...options,fill:'both'});
 landingAnimations.add(animation);if(paused)animation.pause();
 try { await animation.finished; }
 finally { landingAnimations.delete(animation);animation.cancel(); }
}
function center(rect) {return{x:rect.x+rect.width/2,y:rect.y+rect.height/2};}
function landingPath(from,to) {
 return Array.from({length:17},(_,step)=>{
  const t=step/16,arc=Math.sin(t*Math.PI);
  return {transform:`translate(${from.x+(to.x-from.x)*t+Math.sin(t*8)*arc*7}px,${from.y+(to.y-from.y)*t-arc*22}px) translate(-50%,-50%)`};
 });
}
export async function beginButterflyLanding() {
 if(paused||document.body.dataset.weather==='rainy'||document.body.dataset.environment!=='jungle'||document.body.dataset.time!=='day'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const butterfly=butterflies.find(b=>!b.dataset.depth&&!b.dataset.landingState);
 if(!butterfly||butterflies.filter(b=>b.dataset.landingState).length>=2)return;
 const visit=landingIndex++, capy=visit%2===0;
 const hosts=[...document.querySelectorAll(capy?'.river-capybara':'.river-caiman')];
 const host=hosts[Math.floor(visit/2)%hosts.length];if(!host)return;
 const body=host.querySelector('.capy-body')||host.querySelector('svg');
 const box=body.getBoundingClientRect();
 const destination={x:box.x+box.width*(capy?.52:.56),y:box.y+box.height*(capy?.12:.32)};
 const from=center(butterfly.getBoundingClientRect()),token=landingGeneration;
 butterfly.dataset.landingState='approaching';butterfly.dataset.landingOn=capy?'capybara':'caiman';
 butterfly.classList.add('landing');butterfly.style.left='0';butterfly.style.top='0';
 try {
  await animateLanding(butterfly,landingPath(from,destination),{duration:2600,easing:'ease-in-out'});
  if(token!==landingGeneration)return;
  const hostBox=host.getBoundingClientRect();host.append(butterfly);
  butterfly.classList.add('landed');butterfly.dataset.landingState='landed';
  butterfly.style.left=`${(destination.x-hostBox.x)/hostBox.width*100}%`;
  butterfly.style.top=`${(destination.y-hostBox.y)/hostBox.height*100}%`;
  butterfly.style.transform='translate(-50%,-50%)';
  await animateLanding(butterfly,[{opacity:1},{opacity:1}],{duration:4800+visit%3*700});
  if(token!==landingGeneration)return;
  const departure=center(butterfly.getBoundingClientRect());
  const ghost=butterfly.cloneNode(true);ghost.classList.remove('landing','landed');
  for(const name of ['left','top','transform'])ghost.style.removeProperty(name);
  ghost.style.opacity='0';layer.append(ghost);const home=center(ghost.getBoundingClientRect());ghost.remove();
  layer.append(butterfly);butterfly.classList.remove('landed');butterfly.dataset.landingState='departing';
  butterfly.style.left='0';butterfly.style.top='0';
  await animateLanding(butterfly,landingPath(departure,home),{duration:2500,easing:'ease-in-out'});
 } catch { /* Changing environment or time cancels a visit cleanly. */ }
 finally { if(token===landingGeneration)restoreButterfly(butterfly); }
}
setInterval(()=>beginButterflyLanding(),19000);
export function addAmbientMacaws(plane) {
 for(let index=0;index<3;index++) {
  const bird=document.createElement('div');bird.className='ambient-macaw';bird.setAttribute('aria-hidden','true');
  bird.style.setProperty('--height',`${[27,42,34][index]}%`);
  bird.style.setProperty('--flight-duration',`${[32,47,39][index]}s`);
  bird.style.setProperty('--flight-delay',`${[-4,-25,-15][index]}s`);
  bird.style.setProperty('--flap',`${.42+index*.04}s`);
  bird.innerHTML=birdArt(index===1?'hyacinth':'scarlet',true);plane.append(bird);
 }
}
addEventListener('resize',resetDayWildlife);
