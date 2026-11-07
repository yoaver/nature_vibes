import { sebaBatArt } from './bat-models.js';
// Seba's short-tailed bats use local vector shapes and browser animations.
const groups = Array.from({length:3},(_,i)=>({roosts:[],flights:[],home:i===2?1:0,start:i===2?1:0,generation:0}));
let paused = false;
const bankReactions = new Map();
const grazers=[];
function capyLeg(x,y,hind=false,far=false) {
 return `<g class="capy-leg ${hind?'hind':'fore'}${far?' far':''}" data-hip-x="${x}" data-hip-y="${y}" fill="none" stroke="${far?'#746c56':'#99876a'}" stroke-linecap="round" stroke-linejoin="round"><path class="capy-upper-leg" stroke-width="6.5"/><path class="capy-lower-leg" stroke-width="4.5"/><path class="capy-foot" stroke-width="3"/><path class="capy-toes" stroke="#665d47" stroke-width=".7"/></g>`;
}
function poseCapyLegs(animal,time,walking) {
 if(!walking&&animal.lastWalking===false)return;
 animal.lastWalking=walking;
 animal.limbs??=[...animal.node.querySelectorAll('.capy-leg')];
 animal.limbs.forEach((leg,i)=>{
  const hipX=Number(leg.dataset.hipX),hipY=Number(leg.dataset.hipY);
  const phase=((time*.65+[0,.5,.75,.25][i])%1+1)%1;
  const swing=phase>.68?(phase-.68)/.32:0;
  const stride=walking?(phase<.68?-2+phase/.68*4:2-swing*4):0;
  const lift=walking?Math.sin(swing*Math.PI)*1.6:0;
  const footX=hipX-1+stride,footY=69-lift;
  const dx=footX-hipX,dy=footY-hipY,upper=12,lower=14;
  const reach=Math.min(upper+lower-.1,Math.hypot(dx,dy));
  const bend=Math.acos(Math.max(-1,Math.min(1,(upper*upper+reach*reach-lower*lower)/(2*upper*reach))));
  const angle=Math.atan2(dy,dx)+(leg.classList.contains('hind')?bend:-bend);
  const jointX=hipX+Math.cos(angle)*upper,jointY=hipY+Math.sin(angle)*upper;
  leg.querySelector('.capy-upper-leg').setAttribute('d',`M${hipX} ${hipY} L${jointX} ${jointY}`);
  leg.querySelector('.capy-lower-leg').setAttribute('d',`M${jointX} ${jointY} L${footX} ${footY-2}`);
  leg.querySelector('.capy-foot').setAttribute('d',`M${footX} ${footY-2} Q${footX-1} ${footY} ${footX-4} ${footY}`);
  leg.querySelector('.capy-toes').setAttribute('d',`M${footX-3} ${footY-1} l0 2 M${footX-1.5} ${footY-1} l0 2`);
 });
}
export function updateGrazingCapybaras(time) {
 const asleep=document.body.dataset.time==='night',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const animal of grazers) {
  const {node,index,facing}=animal;
  animal.home??={parent:node.parentElement,left:node.style.left,bottom:node.style.bottom};
  if(asleep!==!!animal.sleeping) {
   if(asleep) {
    document.querySelector('.jungle-near-bank').append(node);
    const right=[3,4,7,8,9].includes(index);
    node.style.left=`${[1.5,3,6,78,82.5,8,11.5,85.5,91,88.5][index]}%`;
    node.style.bottom=right?'16.6%':'18.2%';
    node.dataset.sleepGroup=right?'right':'left';
    node.style.setProperty('--facing',facing);
   } else { animal.home.parent.append(node);node.style.left=animal.home.left;node.style.bottom=animal.home.bottom;delete node.dataset.sleepGroup; }
   animal.sleeping=asleep;
  }
  const phase=((reduced?0:time)+index*13.7)%(73+index*4)/(73+index*4);
  const walking=phase>.2&&phase<.28||phase>.7&&phase<.78;
  const pose=phase<.2||phase>=.78?'grazing':walking?'standing':phase<.48?'sitting':'resting';
  if(!asleep)for(const name of ['grazing','standing','sitting','resting'])node.classList.toggle(name,name===pose);
  const distance=asleep||reduced?0:phase<.2?0:phase<.28?(phase-.2)/.08:phase<.7?1:phase<.78?1-(phase-.7)/.08:0;
  node.style.translate=`${distance*10*-facing}px 0`;
  node.classList.toggle('stepping',!asleep&&!reduced&&walking&&!node.classList.contains('playing'));
  poseCapyLegs(animal,time,!asleep&&!reduced&&(walking||node.classList.contains('playing')));
  if(!asleep)node.style.setProperty('--facing',phase>.66?-facing:facing);
 }
}
export function resetBankReactions() {
 for(const [animal,animation] of bankReactions) { animation.cancel();animal.classList.remove('playing','annoyed'); }
 bankReactions.clear();
}
function bankReaction(animal,className,frames,duration) {
 if(bankReactions.has(animal))return;
 animal.classList.add(className);
 const animation=animal.animate(frames,{duration,fill:'both',easing:'ease-in-out'});
 bankReactions.set(animal,animation);if(paused)animation.pause();
 animation.finished.catch(()=>{}).then(()=>{
  if(bankReactions.get(animal)!==animation)return;
  bankReactions.delete(animal);animal.classList.remove(className);animation.cancel();
 });
}
function makeClickable(animal,label,action) {
 animal.tabIndex=0;animal.setAttribute('role','button');animal.setAttribute('aria-label',label);
 animal.addEventListener('click',action);
 animal.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();action();}});
}
const flock = document.createElement('div');
flock.className = 'flying-fox-flock';
flock.setAttribute('aria-hidden', 'true');
document.body.append(flock);

function updateRoosts(group, busy = false) {
 group.roosts.forEach((eyes, index) => {
  eyes.dataset.roostActive = String(!busy && index === group.home);
  eyes.disabled = busy || index !== group.home;
  eyes.setAttribute('aria-busy', String(busy));
 });
}
export function resetBats() {
 for(const group of groups) {
  group.generation++;
  for(const animation of group.flights)animation.cancel();
  group.flights.length=0;group.home=group.start;updateRoosts(group);
 }
 flock.replaceChildren();
 document.querySelectorAll('.forest-depth .flying-fox').forEach(bat=>bat.remove());
}
export function pauseBats(value) {
 paused = value;
 for (const group of groups) for (const animation of group.flights) value ? animation.pause() : animation.play();
 for(const animation of bankReactions.values())value?animation.pause():animation.play();
}
function makeBat(index, direction) {
 const bat = document.createElement('div');
 bat.className = 'flying-fox';
 bat.dataset.species='seba';
 bat.style.setProperty('--flap', `${.22 + index%7 * .011}s`);
 bat.style.setProperty('--facing', direction);
 bat.innerHTML = sebaBatArt;
 flock.append(bat);
 return bat;
}
async function flyFrom(groupId, source) {
 const group=groups[groupId],roosts=group.roosts,flights=group.flights;
 if (source !== group.home || flights.length || document.body.dataset.time !== 'night' || roosts.length !== 2) return;
 const token = ++group.generation;
 const destination = 1 - source;
 const from = roosts[source].getBoundingClientRect();
 const to = roosts[destination].getBoundingClientRect();
 const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
 const end = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const plane=groupId===1?roosts[0].closest('.forest-depth'):null;
 const bounds=plane?.getBoundingClientRect();
 const scale=plane?bounds.width/plane.clientWidth:1;
 updateRoosts(group,true);
 for (let index = 0; index < [14,18,22][groupId]; index++) {
  const direction = end.x >= start.x ? 1 : -1;
  const bat = makeBat(index, direction);
  bat.dataset.group=groupId;
  if(plane)plane.append(bat);
  const lift = [50,95,28,75,110,40][index%6]+Math.floor(index/6)*9;
  const spacing = [-14,8,18,-7,12,-18][index%6];
  let length=0,previous;const distances=[];
  const frames = Array.from({ length: 33 }, (_, step) => {
   const t = step / 32;
   const arc = Math.sin(t * Math.PI);
   const x = start.x + (end.x - start.x) * t + Math.sin(t * 7 + index * 1.9) * arc * 8
    + arc * direction * [25,-20,40,-30,12,-8][index%6];
   const y = start.y + (end.y - start.y) * t - arc * lift*(plane?.6:1) + Math.sin(t * 8 + index * 2.1) * arc * 6 + spacing * arc;
   const bank = Math.sin(t * 7 + index) * 9;
   if(previous)length+=Math.hypot(x-previous.x,y-previous.y);
   previous={x,y};distances.push(length);
   return { transform: `translate(${(x-(bounds?.x||0))/scale}px, ${(y-(bounds?.y||0))/scale}px) translate(-50%, -50%) rotate(${bank}deg) scale(${[.85,1,.7,.92,.78,1.05][index%6]*(plane?.75:1)})`, opacity: step === 0 || step === 32 ? 0 : 1 };
  });
  frames.forEach((frame,i)=>frame.offset=length?distances[i]/length:i/32);
  const speed=Math.max(100,innerWidth*.13)*(1+Math.sin(index*2.3)*.035);
  bat.dataset.flightDistance=String(length);bat.dataset.flightSpeed=String(speed);
  const flight = bat.animate(frames, { duration: reduced ? 1 : length/speed*1000, delay: reduced ? 0 : [0,180,60,310,120,240][index%6]+Math.floor(index/6)*330, fill: 'both', easing: 'linear' });
  flights.push(flight);
  if (paused) flight.pause();
 }
 await Promise.all(flights.map(animation => animation.finished.catch(() => {})));
 if (token !== group.generation) return;
 document.querySelectorAll('.flying-fox[data-group="'+groupId+'"]').forEach(bat=>bat.remove());
 flights.length = 0;
 group.home = destination;
 updateRoosts(group);
}
export function addBatRoost(crown, groupId=0) {
 const group=groups[groupId];
 const eyes = document.createElement('button');
 eyes.className = 'tree-eyes';
 eyes.dataset.group=groupId;
 if(groupId===2) {
  eyes.style.top=group.roosts.length===0?'30%':'36%';
  eyes.style.left=group.roosts.length===0?'35%':'12%';
 }
 eyes.type = 'button';
 eyes.title = 'Watch the bats';
 eyes.setAttribute('aria-label', 'Watch the bats move to the other tree');
 const eyeSpots=Array.from({length:[14,18,22][groupId]},(_,i)=>[5+((i*.618033+groupId*.17)%1)*65,8+((i*.414214+groupId*.13)%1)*77]);
 for (const [index, [x,y]] of eyeSpots.entries()) {
  const pair = document.createElement('span');
  pair.className = 'roost-pair';
  const variation=Math.sin((index+1)*17.3+groupId*9.1);
  pair.style.setProperty('--pair-x', `${Math.max(2,x+variation*3)}%`); pair.style.setProperty('--pair-y', `${Math.max(2,y+Math.cos(index*7.7+groupId)*4)}%`);
  pair.style.setProperty('--blink', `${5.2+(variation+1)*3.1}s`); pair.style.setProperty('--delay', `${-index*1.37-groupId*2.1}s`);
  pair.style.opacity=String(.6+(variation+1)*.2);
  for (let eye = 0; eye < 2; eye++) pair.append(document.createElement('i'));
  eyes.append(pair);
 }
 crown.append(eyes);
 const index = group.roosts.length;
 group.roosts.push(eyes);
 eyes.addEventListener('click', () => flyFrom(groupId,index));
 updateRoosts(group);
}
addEventListener('resize', resetBats);
export function addAmbientBats(plane) {
 for(let index=0;index<4;index++) {
  const bat=makeBat(index,-1);bat.className='ambient-bat';bat.setAttribute('aria-hidden','true');
  bat.style.setProperty('--height',`${[32,58,68,75][index]}%`);
  bat.style.setProperty('--flight-duration',`${[29,41,34,46][index]}s`);
  bat.style.setProperty('--flight-delay',`${[-6,-21,-12,-32][index]}s`);
  plane.append(bat);
 }
}

export function addCaimans(parent) {
 const swimmers = document.createElement('div'); swimmers.className = 'river-swimmers'; swimmers.setAttribute('aria-hidden','true'); document.body.append(swimmers);
 for (const [index, [x, width, facing]] of [[30,5,1],[86,5,-1],[19,7,1],[54,7,1],[63,8,-1]].entries()) {
  const caiman = document.createElement('div');
  caiman.className = `river-caiman${index >= 2 ? ' water-caiman-bank' : ''}`;
  caiman.setAttribute('aria-hidden', 'true');
  caiman.style.setProperty('--x', `${x}%`);
  caiman.style.setProperty('--size', `clamp(70px, ${width * 1.15}vw, 153px)`);
  caiman.style.setProperty('--facing', facing);
  caiman.style.setProperty('--blink', `${6.8 + index * 1.7}s`);
  caiman.style.setProperty('--delay', `${-index * 2.3}s`);
  caiman.innerHTML = `<svg viewBox="0 0 170 44">
   <path class="caiman-tail" d="M65 16 C41 8 35 28 3 34 Q33 39 62 31Z" fill="#4a694b"/>
   <path d="M59 28 Q48 33 48 38 L65 39 L67 34 M111 28 Q125 31 125 37 L109 38 L104 32" fill="#5c7953"/>
   <path d="M50 25 Q55 15 73 15 L102 17 Q117 21 121 28 L113 34 L66 34 Q53 33 50 25Z" fill="#60694b"/>
   <path class="caiman-neck" d="M99 19 Q112 16 125 19 L128 29 Q115 34 99 31Z" fill="#697255"/>
   <path d="M105 24 L117 29 L118 36 L123 38 L113 39 L110 32 L101 29Z" fill="#687454"/>
   <g class="caiman-head">
   <path d="M111 18 Q124 11 136 18 L164 22 Q170 26 163 30 L126 31 L110 30Z" fill="#5b7953"/>
   <path d="M123 29 L162 28" fill="none" stroke="#304c36" stroke-width="1.2"/>
   <path d="M121 18 Q128 11 135 17 L140 19" fill="none" stroke="#8d9c6c" stroke-width="2.2"/>
   <ellipse cx="159" cy="23" rx="1.4" ry=".9" fill="#2c4532"/>
   <ellipse class="caiman-eye-open caiman-eyeshine" cx="129" cy="17.6" rx="2.4" ry="1.8" fill="#c0b478"/>
   <ellipse class="caiman-eye-open" cx="129" cy="17.6" rx=".65" ry="1.6" fill="#243d2c"/>
   <path class="caiman-eye-closed" d="M126 18 Q129 20 132 18" fill="none" stroke="#2c4532" stroke-width="1.3"/>
   </g>
   <path d="M55 18 L61 14 L66 17 L73 13 L78 16 L85 13 L90 16 L97 14 L102 18 L110 18" fill="#444d36"/>
   <path d="M64 22 L103 22 M63 27 L101 27" stroke="#89906a" stroke-width=".8" stroke-dasharray="2 4"/>
   <path d="M30 27 L33 32 M41 19 L45 27 M51 17 L54 23" stroke="#3f4935" stroke-width="1.5"/>
  </svg>`;
  parent.append(caiman);
  caiman.removeAttribute('aria-hidden');
  makeClickable(caiman,'Wake the resting caiman',()=>{
   if(document.body.dataset.time!=='night'&&index<2)return;
   bankReaction(caiman,'annoyed',[{transform:'translateX(0)'},{transform:'translateX(-2px) rotate(-1deg)',offset:.1},{transform:'translateX(1px)',offset:.22},{transform:'translateX(0)',offset:.35},{transform:'translateX(0)'}],6500);
  });
  if (index >= 2) {
   const swimming = document.createElement('div');
   swimming.className = `submerged-caiman${index === 4 ? ' reverse' : ''}`;
   swimming.style.setProperty('--water-y', ['84.5%','87%','89.5%'][index-2]);
   swimming.style.setProperty('--swim-duration', ['97s','73s','89s'][index-2]);
   swimming.style.setProperty('--swim-delay', ['-68s','-21s','-46s'][index-2]);
   swimming.innerHTML = caiman.innerHTML;
   swimmers.append(swimming);
  }
 }
}

export function addCapybaras(parent) {
 const family = [
  {x:36,size:6,facing:1,baby:false,pose:'grazing'},
  {x:43,size:3.1,facing:1,baby:true,pose:'resting'},
  {x:47,size:2.8,facing:-1,baby:true,pose:'standing'},
  {x:74,size:6.5,facing:-1,baby:false,pose:'resting'},
  {x:82,size:3.2,facing:-1,baby:true,pose:'grazing'},
  {x:10,size:6,facing:-1,baby:false,pose:'resting'},
  {x:15,size:2.9,facing:1,baby:true,pose:'standing'},
  {x:81,size:5.8,facing:1,baby:false,pose:'resting'},
  {x:90.5,size:6,facing:-1,baby:false,pose:'grazing'},
  {x:87.5,size:2.8,facing:-1,baby:true,pose:'standing'},
 ];
 for (const [index, member] of family.entries()) {
  const capy = document.createElement('div');
  capy.className = `river-capybara ${member.pose}${member.baby ? ' baby' : ''}`;
  capy.dataset.family=String({1:0,2:0,4:3,6:5,9:7}[index]??index);
  capy.dataset.member=String(index);
  capy.setAttribute('aria-hidden','true');
  capy.style.setProperty('--x', `${member.x}%`);
  capy.style.setProperty('--size', `clamp(${member.baby ? 30 : 54}px, ${member.size * 1.12}vw, ${member.baby ? 53 : 105}px)`);
  capy.style.setProperty('--facing', member.facing);
  capy.style.setProperty('--blink', `${7.5 + index * 1.3}s`);
  capy.style.setProperty('--delay', `${-index * 1.9}s`);
  grazers.push({node:capy,index,facing:member.facing});
  capy.innerHTML = `<svg viewBox="0 0 120 75">
   <g class="capy-legs" fill="#746c56">
    ${capyLeg(46,44,false,true)}
    ${capyLeg(90,44,true,true)}
   </g>
   <path class="capy-body" d="M34 26 Q45 18 66 19 Q91 16 101 29 Q108 44 99 54 Q91 60 76 58 L49 57 Q34 55 32 40Z" fill="${member.baby ? '#b2a07e' : '#9e8a6b'}"/>
   <g class="capy-legs" fill="#99876a">
    ${capyLeg(39,44)}
    ${capyLeg(84,44,true)}
   </g>
   <g class="capy-sitting-feet" fill="#99876a">
    <path d="M39 48 L43 49 L41 65 L45 68 L44 70 L35 70 L35 66Z M78 55 Q93 54 96 63 L92 68 L79 69 L75 65Z"/>
    <path d="M37 68 L38 70 M40 68 L41 70 M83 67 L84 69 M87 66 L88 68" stroke="#625b46" stroke-width=".8"/>
   </g>
   <g class="capy-head">
    <path d="M12 26 Q16 23 24 23 Q31 19 38 20 Q46 21 47 30 L46 38 Q42 44 32 43 L15 41 Q9 40 9 35 L9 30 Q9 27 12 26Z" fill="${member.baby ? '#b8a583' : '#a59172'}"/>
    <ellipse class="capy-ear" cx="39" cy="18" rx="2.5" ry="3" fill="#806b50"/>
    <ellipse cx="39" cy="18" rx="1.1" ry="1.7" fill="#b09a7c"/>
    <path d="M11 30 l1.5 -.4 M12 37 Q16 38 20 37.5" stroke="#716249" stroke-width=".8" stroke-linecap="round" fill="none"/>
    <path d="M34 38 Q40 39 43 35 M21 28 l2 -1 M24 30 l2 -1" stroke="#c0ac88" stroke-width=".65" opacity=".45" fill="none"/>
    <path class="capy-eye-open" d="M28.5 26 Q30 25.5 31.5 26 Q30 28 28.5 26Z" fill="#433c2d"/>
    <path class="capy-eye-closed" d="M28 25 Q30 27 32 25" stroke="#57452f" stroke-width="1.1" fill="none"/>
   </g>
   <path d="M48 27 L47 31 M54 23 L53 27 M62 25 L61 29 M72 23 L71 28 M83 25 L82 30 M93 29 L92 34 M59 43 L58 47 M76 45 L75 49" stroke="#b0a080" stroke-width=".8" opacity=".65"/>
  </svg>`;
  parent.append(capy);
  if(member.baby) {
   capy.removeAttribute('aria-hidden');
   makeClickable(capy,'Watch the baby capybara play',()=>{
    if(document.body.dataset.time!=='day')return;
    const hop=matchMedia('(prefers-reduced-motion: reduce)').matches?0:2;
    bankReaction(capy,'playing',[{transform:'translate(0,0)'},{transform:`translate(5px,${-hop}px)`,offset:.15},{transform:'translate(9px,0)',offset:.25},{transform:`translate(15px,${-hop}px)`,offset:.4},{transform:'translate(18px,0)',offset:.5},{transform:'translate(18px,0)',offset:.68},{transform:'translate(0,0)'}],5700);
   });
  }
 }
}
