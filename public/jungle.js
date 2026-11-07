import { addBatRoost, resetBats, pauseBats, addCaimans, addCapybaras, resetBankReactions, addAmbientBats, updateGrazingCapybaras } from './jungle-wildlife.js';
import { addMacawRoost, resetDayWildlife, pauseDayWildlife, addAmbientMacaws, placeButterfliesInDepth, updateDayWildlifeWeather, updatePerchedMacaws } from './jungle-birds.js';
import { addSquirrelMonkeys, updateSquirrelMonkeys } from './jungle-monkeys.js';
// CSS draws the forest. Canvas retains the river, nearby foliage, and fireflies.
const backdrop = document.querySelector('#jungle-backdrop');
export const jungleRiverTop = (x, w, h) => {
 const u=x/w;
 return h*(.814+Math.sin(u*5+.4)*.006+.033*Math.exp(-(((u-.26)/.115)**2))+.044*Math.exp(-(((u-.61)/.14)**2))+.022*Math.exp(-(((u-.9)/.09)**2))+.0008*Math.sin(u*87)+.0005*Math.sin(u*143));
};
const resetAnimals = [];
export function resetJungleAnimal() { resetAnimals.forEach(reset=>reset()); resetBats(); resetDayWildlife(); resetBankReactions(); }
export function setJunglePaused(paused) { pauseBats(paused); pauseDayWildlife(paused); }
function seeded(seed) { const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); }
function shape(tag, className, parent, variables = {}) {
 const node = document.createElement(tag);
 node.className = className;
 for (const [name, value] of Object.entries(variables)) node.style.setProperty(`--${name}`, value);
 parent.append(node);
 return node;
}
const nightSky = shape('div', 'jungle-night-sky', backdrop);
for (let star = 0; star < 85; star++) shape('i', '', nightSky, {
 x: `${seeded(star + 2300) * 100}%`, top: `${seeded(star + 2400) * 70}%`,
 size: `${.7 + seeded(star + 2500) * 1.2}px`,
 duration: `${4 + seeded(star + 2550) * 7}s`, delay: `${-seeded(star + 2600) * 10}s`,
});
shape('div', 'jungle-rain-sky', backdrop);
// Cloud cover lives behind the forest, with opacity driven by the weather blend.
const clouds = shape('div', 'jungle-clouds', backdrop);
for (let cloud = 0; cloud < 7; cloud++) {
 const group = shape('div', 'jungle-cloud', clouds, {
  x: `${cloud / 6 * 110 - 12}%`, top: `${5 + seeded(cloud + 2700) * 22}%`,
  width: `${21 + seeded(cloud + 2750) * 16}vw`, height: `${5 + seeded(cloud + 2800) * 5}vh`,
  duration: `${65 + seeded(cloud + 2850) * 40}s`,
 });
 for (let lobe = 0; lobe < 4; lobe++) shape('span', '', group, {
  cx: `${lobe * 21}%`, cy: `${seeded(cloud + lobe + 2900) * 25}%`,
  cw: `${40 + seeded(cloud + lobe + 2950) * 18}%`, ch: `${55 + seeded(cloud + lobe + 2970) * 35}%`,
 });
}
// Low, muted silhouettes fill the interior without competing with tree crowns.
const forestScene = shape('div', 'jungle-forest', backdrop);
const interior = shape('div', 'forest-interior', forestScene);
for (let mass = 0; mass < 22; mass++) {
 shape('span', '', interior, {
  x: `${mass / 21 * 110 - 5}%`, top: `${57 + seeded(mass + 3000) * 8}%`,
  width: `${7 + seeded(mass + 3100) * 6}%`, height: '43%',
  shade: ['#476b59', '#4c715d', '#466a57'][mass % 3],
 });
}
for (const [depth, count] of [['far', 15], ['middle', 10], ['front', 5]]) {
 const layer = shape('div', `forest-depth ${depth}`, forestScene);
 for (let i = 0; i < count; i++) {
  const seed = i * 31 + (depth === 'far' ? 700 : depth === 'middle' ? 900 : 1100);
  const height = depth === 'far' ? 33 + seeded(seed) * 35
   : depth === 'middle' ? 41 + seeded(seed) * 34
   : 49 + seeded(seed) * 35;
  const base = depth === 'far' ? 9 + seeded(seed + 6) * 3
   : depth === 'middle' ? 5 + seeded(seed + 6) * 3
   : 2 + seeded(seed + 6) * 2;
  const profiles = [
   [[-15,36,75,39],[40,34,72,40],[8,9,70,55],[25,3,62,46]],
   [[8,29,61,55],[32,22,53,52],[17,0,54,60],[16,53,62,30]],
   [[-8,38,58,43],[47,29,64,49],[1,4,56,56],[32,13,54,52],[16,51,72,35]],
   [[-18,29,70,50],[36,24,81,51],[0,0,76,63],[27,6,65,55],[7,53,82,32]],
  ];
  const profile = (i + (depth === 'middle' ? 1 : 0)) % profiles.length;
  const tree = shape('div', 'css-tree broadleaf', layer, {
   x: `${(i + .3 + seeded(seed + 1) * .4) / count * 100}%`, height: `${height}%`,
   width: `${(depth === 'far' ? 4.5 : depth === 'middle' ? 6.5 : 10) + seeded(seed + 5) * (depth === 'far' ? 3 : 5)}vw`,
   foliage: (depth === 'far' ? ['#88aaa0', '#93b0a3', '#7e9f95'] : depth === 'middle' ? ['#527f6a', '#608b70', '#4e7860'] : ['#356d50', '#427658', '#39684d'])[i % 3],
   bottom: `${base}%`, 'trunk-width': depth === 'far' ? '1.8%' : depth === 'middle' ? '3%' : '4.5%',
   lean: `${(seeded(seed + 2) - .5) * 12}deg`, duration: `${9 + seeded(seed + 3) * 8}s`,
   'crown-bottom': `${[37, 23, 31, 43][profile]}%`,
  });
  shape('span', 'css-trunk', tree);
  if(depth==='front'&&(i===1||i===2||i===4)) {
   const plant=shape('span','trunk-epiphyte',tree,{ 'plant-bottom':i===2?'28%':'43%' });
   for(let leaf=0;leaf<4;leaf++)shape('i','',plant,{'leaf-turn':`${-55+leaf*31}deg`});
  }
  {
   const crown = shape('div', 'css-crown', tree);
   // Open a narrow view into the left background troop's tree.
   if(depth==='front'&&i===0)crown.style.right='12%';
   if(depth==='front'&&i===1)crown.style.left='16%';
   // Both ends start inside the crown and share its motion, never in open air.
   if (depth !== 'far' && i % 3 !== 1) {
    shape('span', 'liana', crown, {
     'vine-x': '35%', 'vine-y': '25%',
     'vine-width': `${20 + seeded(seed + 62) * 10}%`,
     'vine-length': `${65 + seeded(seed + 63) * 25}%`,
    });
   }
   for (const [j, [x, y, width, height]] of profiles[profile].entries()) {
    shape('span', '', crown, {
     cx: `${x}%`, cy: `${y}%`, cw: `${width}%`, ch: `${height}%`,
     turn: `${(seeded(seed + j + 20) - .5) * 20}deg`,
     blob: `${37 + seeded(seed + j + 30) * 25}% ${42 + seeded(seed + j + 31) * 20}% ${33 + seeded(seed + j + 32) * 30}% ${48 + seeded(seed + j + 33) * 20}% / ${40 + seeded(seed + j + 34) * 25}% ${45 + seeded(seed + j + 35) * 25}% ${35 + seeded(seed + j + 36) * 25}% ${40 + seeded(seed + j + 37) * 25}%`,
    });
   }
   if (depth === 'front' && (i === 1 || i === 3)) addBatRoost(crown);
   if (depth === 'front' && (i === 0 || i === 3)) addMacawRoost(crown);
   if (depth === 'middle' && (i === 2 || i === 7)) addBatRoost(crown,1);
   if (depth==='front'&&(i===0||i===4))addBatRoost(crown,2);
   if (depth === 'middle' && (i === 1 || i === 6)) addMacawRoost(crown,1);
   if (depth === 'front' && (i === 1 || i === 4)) addMacawRoost(crown,2);
   if (depth === 'middle' && i === 2) addSquirrelMonkeys(tree,7,true);
   if (depth === 'front' && i === 2) addSquirrelMonkeys(tree);
  }
 }
 // Low foliage hides distant roots; nearer trunks overlap it instead of sharing a baseline.
 if (depth !== 'front') {
  for (let patch = 0; patch < 13; patch++) shape('span', 'depth-undergrowth', layer, {
   x: `${patch / 12 * 105 - 5}%`, width: `${8 + seeded(patch + 4100) * 6}%`,
   height: `${3 + seeded(patch + 4200) * 4}%`,
   bottom: depth === 'far' ? '8%' : '4%',
   shade: depth === 'far' ? '#6b8e79' : '#4c765a',
  });
 }
 if(depth==='middle') { addAmbientBats(layer);addAmbientMacaws(layer); }
}
shape('div', 'forest-haze', forestScene);
shape('div', 'jungle-ground', forestScene);
for (let shrub = 0; shrub < 12; shrub++) {
 const seed = 2000 + shrub * 19;
 const large = shrub % 3 === 0;
 const feature = shrub >= 10;
 const animalHome = shrub === 3 || shrub === 6;
 const secondHome = shrub === 6;
 const homeX = secondHome ? '17%' : '56%';
 const homeWidth=secondHome?'max(9vw, 64px)':'max(8vw, 58px)';
 let shrubX = seeded(seed) * 100;
 if (!feature && !animalHome && shrubX > 33 && shrubX < 70) shrubX = shrub % 2 ? 14 + seeded(seed + 9) * 10 : 82 + seeded(seed + 9) * 8;
 if (!feature && !animalHome && shrubX > 15 && shrubX < 31) shrubX=87+seeded(seed+10)*7;
 const bush = shape('div', 'bank-bush', forestScene, {
  x: animalHome ? homeX : feature ? (shrub === 10 ? '2%' : '77%') : `${shrubX}%`,
  width: animalHome ? homeWidth : feature ? (shrub === 10 ? '13vw' : '16vw') : `${(large ? 9 : 5) + seeded(seed + 1) * 8}vw`,
  height: animalHome ? (secondHome?'9%':'11%') : feature ? (shrub === 10 ? '17%' : '20%') : `${(large ? 8 : 4) + seeded(seed + 2) * 5}%`,
  duration: `${11 + seeded(seed + 3) * 7}s`,
  shade: secondHome?'#567e50':feature ? (shrub === 10 ? '#547e52' : '#48734e') : shrub % 3 ? '#4c7b55' : '#638b5c',
 });
 // Mix rounded shrubs with open leafy shoots along the bank.
 if (feature || animalHome || shrub % 3 === 0) {
  bush.classList.add('rounded-bush');
  const lobes=secondHome?[[-3,45,43,52],[12,24,43,72],[40,10,37,86],[65,38,38,60],[24,57,63,42]]:[[-4,38,48,59],[24,8,48,87],[52,29,50,67],[18,54,66,44]];
  for (const [lobe, [x, y, width, height]] of lobes.entries()) {
   shape('span', 'bush-lobe', bush, {
    cx: `${x}%`, cy: `${y + seeded(seed + lobe + 40) * 9}%`, cw: `${width}%`, ch: `${height}%`,
    turn: `${(seeded(seed + lobe + 50) - .5) * 14}deg`,
   });
  }
  if (animalHome) {
   bush.classList.add('armadillo-home');
   if(!secondHome)bush.classList.add('moonlit-bush');
   const eyes = shape('button', 'hidden-animal', bush);
   eyes.dataset.animal=secondHome?'1':'0';
   eyes.type = 'button';
   eyes.setAttribute('aria-label', 'Watch the armadillo explore');
   eyes.title = 'Watch the armadillo explore';
   const pair = shape('div', 'animal-eye-pair', eyes);
   shape('i', 'animal-eye', pair);
   shape('i', 'animal-eye', pair);
   // The animal occupies a layer behind the bushes, so foliage hides its emergence.
   const track = shape('div', 'armadillo-track', forestScene, {
    'home-x': homeX, 'home-width': homeWidth,
    ...(secondHome ? {walk:'clamp(-75px, -4vw, -45px)','initial-facing':-1,outing:'19s'} : {}),
   });
   track.setAttribute('aria-hidden', 'true');
   track.dataset.animal=secondHome?'1':'0';
   const animal = shape('div', 'armadillo', track);
   shape('i', 'armadillo-tail', animal);
   shape('i', 'armadillo-leg rear', animal);
   shape('i', 'armadillo-leg fore', animal);
   shape('i', 'armadillo-leg rear far', animal);
   shape('i', 'armadillo-leg fore far', animal);
   const shell = shape('div', 'armadillo-shell', animal);
   for (let band = 0; band < 3; band++) shape('i', 'armadillo-band', shell, { band });
   const head = shape('div', 'armadillo-head', animal);
   shape('i', 'armadillo-ear', head);
   shape('i', 'armadillo-ear far', head);
   shape('i', 'armadillo-eye', head);
   let reducedTimer;
   let outingVersion = 0;
   const resetAnimal = () => {
    outingVersion++;
    clearTimeout(reducedTimer);
    bush.classList.remove('animal-out');
    track.classList.remove('is-exploring');
    eyes.disabled = false;
    eyes.setAttribute('aria-busy', 'false');
   };
   resetAnimals.push(resetAnimal);
   eyes.addEventListener('click', () => {
    if (eyes.disabled || document.body.dataset.time !== 'night') return;
    bush.classList.add('animal-out');
    track.classList.add('is-exploring');
    eyes.disabled = true;
    eyes.setAttribute('aria-busy', 'true');
    const version = ++outingVersion;
    const outing = track.getAnimations().find(animation => animation.animationName === 'armadillo-explore');
    outing?.finished.then(() => { if (version === outingVersion) resetAnimal(); }).catch(() => {});
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) reducedTimer = setTimeout(resetAnimal, 1600);
   });
   track.addEventListener('animationend', event => {
    if (event.target === track && event.animationName === 'armadillo-explore') resetAnimal();
   });
  }
  continue;
 }
 for (let shoot = 0; shoot < 6; shoot++) {
  const stem = shape('div', 'bush-shoot', bush, {
   'shoot-x': `${7 + shoot * 13}%`,
   'shoot-height': `${48 + seeded(seed + shoot + 4) * 50}%`,
   lean: `${(shoot - 2.5) * 7 + (seeded(seed + shoot + 12) - .5) * 9}deg`,
  });
  for (let node = 0; node < 4; node++) {
   for (const side of [-1, 1]) shape('span', 'bush-leaf', stem, {
    'leaf-top': `${8 + node * 21 + (side < 0 ? 5 : 0)}%`,
    'leaf-length': `${67 + seeded(seed + shoot * 11 + node) * 28}%`,
    'leaf-angle': `${side < 0 ? -153 : -31}deg`,
    'leaf-shade': node % 3 === 0 ? (shrub % 3 ? '#658e5f' : '#7b9b68') : 'var(--shade)',
   });
  }
 }
}
for (let plant = 0; plant < 17; plant++) {
 let plantX = seeded(plant + 1400) * 100;
 if (plantX > 36 && plantX < 70) plantX = plant % 2 ? 29 + seeded(plant + 1455) * 3 : 72 + seeded(plant + 1455) * 3;
 if(plantX>16&&plantX<31)plantX=5+seeded(plant+1456)*7;
 // A smaller, narrower fern stays beside the mother without crossing her muzzle.
 const besideCapybara=plantX>=31&&plantX<38;
 if(besideCapybara)plantX=33;
 const clump = shape('div', 'bank-plant', forestScene, { x: `${plantX}%`, width: besideCapybara?'clamp(18px, 2vw, 36px)':'clamp(22px, 3.5vw, 65px)', height: besideCapybara?'5.5%':`${4 + seeded(plant + 1450) * 8}%`, duration: `${8 + seeded(plant + 1500) * 6}s` });
 for (let blade = 0; blade < 5; blade++) shape('span', '', clump, { angle: `${-65 + blade * 29 + seeded(plant + blade + 1600) * 12}deg`, length: `${55 + seeded(plant + blade + 1700) * 45}%` });
}
addCaimans(forestScene);
addCapybaras(forestScene);
placeButterfliesInDepth(forestScene);
// Foreground bank and rain clipping share the river's shoreline curve.
const nearBank=shape('div','jungle-near-bank',document.body);
const nearGround=shape('div','jungle-ground near-bank-ground',nearBank);
const shoreDetails=document.createElementNS('http://www.w3.org/2000/svg','svg');
shoreDetails.classList.add('shore-details');nearBank.append(shoreDetails);
const nearerAnimals=[
 [forestScene.querySelectorAll('.river-caiman')[1],.49],
 [forestScene.querySelectorAll('.river-caiman')[2],.23],
 [forestScene.querySelectorAll('.river-caiman')[3],.57],
 [forestScene.querySelectorAll('.river-capybara')[3],.67],
 [forestScene.querySelectorAll('.river-capybara')[4],.76],
 [forestScene.querySelectorAll('.river-capybara')[7],.81],
 [forestScene.querySelectorAll('.river-capybara')[8],.905],
 [forestScene.querySelectorAll('.river-capybara')[9],.875],
];
for(const [animal,x] of nearerAnimals) {
 animal.classList.add('near-bank-animal');animal.style.setProperty('--x',`${x*100}%`);nearBank.append(animal);
}
function placeNearBank() {
 const w=innerWidth,h=innerHeight;
 const edge=Array.from({length:101},(_,i)=>`${i}% ${jungleRiverTop(i/100*w,w,h)/h*100}%`);
 nearGround.style.clipPath=`polygon(0 81.4%,100% 81.4%,${edge.reverse().join(',')})`;
 shoreDetails.setAttribute('viewBox',`0 0 ${w} ${h}`);shoreDetails.setAttribute('preserveAspectRatio','none');
 let marks='';
 for(const u of [.085,.48,.79,.93]) {
  const x=u*w,y=jungleRiverTop(x,w,h)-h*.004;
  marks+=`<path class="shore-root" d="M${x-11} ${y-11} Q${x-6} ${y-2} ${x+12} ${y} M${x-3} ${y-5} Q${x+5} ${y-8} ${x+18} ${y-3}"/>`;
 }
 for(let i=0;i<23;i++) {
  const x=seeded(i+6100)*w,y=jungleRiverTop(x,w,h)-h*(.004+seeded(i+6200)*.009);
  marks+=`<path class="shore-leaf" d="M${x} ${y} q4 -4 7 -1 q-2 4 -7 1" opacity="${.22+seeded(i+6300)*.2}"/>`;
 }
 shoreDetails.innerHTML=marks;
 for(const [animal,x] of nearerAnimals)if(!animal.dataset.sleepGroup)animal.style.bottom=`${100-jungleRiverTop(x*w,w,h)/h*100+.6}%`;
}
addEventListener('resize',placeNearBank);placeNearBank();
export function drawJungle(ctx, { w, h, time, night, cloudCover, rainfall, mix, random }) {
 updateSquirrelMonkeys(time,night);
 updateGrazingCapybaras(time);
 updateDayWildlifeWeather();
 updatePerchedMacaws(time);
 const gradient = (top, bottom, colors) => {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  return g;
 };



 // Lighting is shared with the CSS forest; the river remains on Canvas.
 backdrop.style.setProperty('--night', night);
 backdrop.style.setProperty('--overcast', cloudCover);
 backdrop.style.setProperty('--rain', rainfall);
 const moon=document.body.dataset.weather==='clear'?night*Math.max(0,1-cloudCover/.8)**2:0;
 backdrop.style.setProperty('--moon',moon);
 nearBank.style.setProperty('--night',night);
 nearBank.style.setProperty('--moon',moon);
 const sunshine = (1 - night) * (1 - cloudCover);
 document.body.style.setProperty('--jungle-sun', sunshine);
 // Side-facing view from a boat: the water continues all the way to the frame.
 const farBank = x => jungleRiverTop(x, w, h);
 ctx.fillStyle = gradient(h * .816, h, [mix('#a5c6a1', '#172e25'), mix('#5a9a80', '#10251e'), mix('#427d65', '#0b1c17')]);
 ctx.beginPath(); ctx.moveTo(0, farBank(0));
 for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, farBank(x));
 ctx.lineTo(w, h); ctx.lineTo(0, h);
 ctx.closePath();
 ctx.fill(); ctx.save(); ctx.clip();
 // Reflections break into short horizontal fragments on the moving surface.
 for (let i = 0; i < 35; i++) {
  const x = random(i + 7500) * w;
  const reach = h * (.025 + random(i + 7520) * .05);
  for (let fragment = 0; fragment < 9; fragment++) {
   const depth = fragment / 9;
   const y = farBank(x) + depth * reach;
   const drift = Math.sin(time * .45 + i + fragment * .7) * w * .003;
   const width = w * (.003 + random(i * 9 + fragment + 7540) * .009);
   ctx.strokeStyle = `rgba(21,61,41,${(.08 + random(i + 7510) * .08) * (1 - depth)})`;
   ctx.lineWidth = .8;
   ctx.beginPath(); ctx.moveTo(x + drift - width, y);
   ctx.quadraticCurveTo(x + drift, y + .6, x + drift + width, y); ctx.stroke();
  }
 }
 for (let i = 0; i < 150; i++) {
  const depth = random(i + 7600);
  const y = h * (.816 + depth * .19) + Math.sin(time * .6 + i) * h * .0008;
  const length = w * (.008 + random(i + 7900) * .05);
  const speed = w * (.008 + depth * .009);
  const x = ((random(i + 7700) * (w + length * 2) + time * speed) % (w + length * 2)) - length;
  ctx.strokeStyle = `rgba(188,218,193,${(.05 + random(i + 7800) * .14) * (1 - night * .78)})`;
  ctx.lineWidth = .6 + depth * .7;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + length * .5, y - h * .001, x + length, y); ctx.stroke();
 }
 // Broken reflections follow the localized moonlight on the bank.
 for (let i = 0; i < 45; i++) {
  const depth = random(i + 4600);
  const x = w * .67 + (random(i + 4700) - .5) * w * (.025 + depth * .13);
  const y = farBank(x) + depth * (h - farBank(x));
  ctx.fillStyle = `rgba(193,216,211,${moon * (.035 + random(i + 4800) * .055)})`;
  ctx.fillRect(x + Math.sin(time * .4 + i) * 3, y, 3 + depth * 20, .7 + depth * .5);
 }
 ctx.restore();

 // Waterline anchors the visible opposite bank above the foreground water.
 ctx.strokeStyle = mix('#45664b', '#18362f'); ctx.lineWidth = h * .002;
 ctx.beginPath(); for (let x = 0; x <= w + 8; x += 4) { if (Math.floor(x/31)%4===0)ctx.moveTo(x,farBank(x));else ctx.lineTo(x,farBank(x)); } ctx.stroke();
 // Each firefly wanders independently and flashes briefly, then goes fully dark.
 for (let i = 0; i < 22; i++) {
  const period = 2.3 + random(i + 8600) * 3.3;
  const phase = (time / period + random(i + 8700)) % 1;
  const flash = phase < .2 ? Math.sin(phase / .2 * Math.PI) ** 2 : 0;
  const brightness = night * (1 - rainfall * .8) * flash;
  if (brightness < .005) continue;
  const speed = .13 + random(i + 8800) * .13;
  const drift = time * speed;
  const x = (random(i + 8400) * .72 + .14) * w
   + Math.sin(drift + i * 2.4) * w * .045
   + Math.sin(drift * .47 + i) * w * .025;
  const y = h * (.36 + random(i + 8500) * .47)
   + Math.cos(drift * .73 + i * 1.7) * h * .035
   + Math.sin(drift * 1.31 + i) * h * .012;
  const radius = 1 + random(i + 8900) * .6;
  ctx.save(); ctx.globalAlpha = brightness;
  const halo = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
  halo.addColorStop(0, 'rgba(212,244,128,.65)');
  halo.addColorStop(.35, 'rgba(190,231,100,.18)');
  halo.addColorStop(1, 'rgba(190,231,100,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, radius * 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f1ffbc';
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
 }
 const vignette = ctx.createRadialGradient(w * .55, h * .48, h * .1, w * .55, h * .48, Math.max(w, h) * .7);
 vignette.addColorStop(0, 'rgba(4,24,18,0)'); vignette.addColorStop(1, `rgba(4,24,18,${.14 - sunshine * .09 + night * .36 + cloudCover * .07 * (1 - night)})`);
 ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
}
