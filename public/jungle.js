// CSS draws the forest. Canvas retains the river, nearby foliage, and fireflies.
const backdrop = document.querySelector('#jungle-backdrop');
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
  {
   const crown = shape('div', 'css-crown', tree);
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
}
shape('div', 'forest-haze', forestScene);
shape('div', 'jungle-ground', forestScene);
for (let shrub = 0; shrub < 10; shrub++) {
 const seed = 2000 + shrub * 19;
 const large = shrub % 3 === 0;
 const bush = shape('div', 'bank-bush', forestScene, {
  x: `${seeded(seed) * 100}%`, width: `${(large ? 9 : 5) + seeded(seed + 1) * 8}vw`,
  height: `${(large ? 8 : 4) + seeded(seed + 2) * 5}%`, duration: `${11 + seeded(seed + 3) * 7}s`,
  shade: shrub % 3 ? '#4c7b55' : '#638b5c',
 });
 // Mix rounded shrubs with open leafy shoots along the bank.
 if (shrub % 3 === 0) {
  bush.classList.add('rounded-bush');
  for (const [lobe, [x, y, width, height]] of [[-4,38,48,59],[24,8,48,87],[52,29,50,67],[18,54,66,44]].entries()) {
   shape('span', 'bush-lobe', bush, {
    cx: `${x}%`, cy: `${y + seeded(seed + lobe + 40) * 9}%`, cw: `${width}%`, ch: `${height}%`,
    turn: `${(seeded(seed + lobe + 50) - .5) * 14}deg`,
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
 const clump = shape('div', 'bank-plant', forestScene, { x: `${seeded(plant + 1400) * 100}%`, width: 'clamp(22px, 3.5vw, 65px)', height: `${4 + seeded(plant + 1450) * 8}%`, duration: `${8 + seeded(plant + 1500) * 6}s` });
 for (let blade = 0; blade < 5; blade++) shape('span', '', clump, { angle: `${-65 + blade * 29 + seeded(plant + blade + 1600) * 12}deg`, length: `${55 + seeded(plant + blade + 1700) * 45}%` });
}
export function drawJungle(ctx, { w, h, time, night, cloudCover, rainfall, mix, random }) {
 const gradient = (top, bottom, colors) => {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  return g;
 };



 // Lighting is shared with the CSS forest; the river remains on Canvas.
 backdrop.style.setProperty('--night', night);
 backdrop.style.setProperty('--overcast', cloudCover);
 backdrop.style.setProperty('--rain', rainfall);
 const sunshine = (1 - night) * (1 - cloudCover);
 document.body.style.setProperty('--jungle-sun', sunshine);
 // Side-facing view from a boat: the water continues all the way to the frame.
 const farBank = x => h * (.816 + Math.sin(x / w * 5 + .4) * .007);
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
 ctx.restore();

 // Waterline anchors the visible opposite bank above the foreground water.
 ctx.strokeStyle = mix('#2b4c36', '#102e30'); ctx.lineWidth = h * .004;
 ctx.beginPath(); for (let x = 0; x <= w + 8; x += 8) { if (!x) ctx.moveTo(x, farBank(x)); else ctx.lineTo(x, farBank(x)); } ctx.stroke();
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
