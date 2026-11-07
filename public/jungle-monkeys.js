// A small troop with separate four-limbed walking, crouching, and hanging models.
const troops=[];
const branches=[{y:.38,slope:-.06,left:.03,right:.94},{y:.51,slope:.045,left:.1,right:1.04},{y:.66,slope:-.035,left:.28,right:.78},{y:.98,slope:0,left:.12,right:.88}];
const branchY=(branch,x)=>branches[branch].y+(x-.51)*branches[branch].slope+(branch===3?0:.05*(x-.51)**2);
const positions=[{x:.08,branch:0,hang:true},{x:.34,branch:0},{x:.83,branch:0,hang:true},{x:.99,branch:1,hang:true},{x:.5,branch:2},{x:.17,branch:3},{x:.65,branch:3},{x:.85,branch:3},{x:.67,branch:1},{x:.15,branch:1,hang:true}].map(p=>({...p,y:branchY(p.branch,p.x)}));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export function addSquirrelMonkeys(parent,count=10,background=false) {
 const monkeys=[],colony=document.createElement('div');colony.className=`capuchin-colony${background?' background-colony':''}`;colony.dataset.troop=String(troops.length);colony.setAttribute('aria-hidden','true');parent.append(colony);
 troops.push({monkeys,offset:background?11:0});
 const supports=document.createElementNS('http://www.w3.org/2000/svg','svg');
 supports.classList.add('monkey-supports');supports.setAttribute('viewBox','0 0 100 100');supports.setAttribute('preserveAspectRatio','none');
 supports.innerHTML=branches.slice(0,3).map((b,i)=>{const mid=(b.left+b.right)/2,control=2*branchY(i,mid)-(branchY(i,b.left)+branchY(i,b.right))/2;return `<path d="M${b.left*100} ${branchY(i,b.left)*100} Q${mid*100} ${control*100} ${b.right*100} ${branchY(i,b.right)*100}"/>`;}).join('');
 colony.append(supports);
 parent.style.setProperty('--lean','0deg');
 for(const [x,y,w,h] of [[40,35,23,10],[48,47,26,9],[36,62,19,8]]) {
  const leaves=document.createElement('span');leaves.className='monkey-leaf-cluster';
  Object.assign(leaves.style,{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`});colony.append(leaves);
 }
 for(let index=0;index<count;index++) {
  const monkey=document.createElement('div');monkey.className='capuchin-monkey';
  monkey.style.setProperty('--idle-delay',`${-index*.7}s`);
  monkey.style.setProperty('--facing',index%3===0?-1:1);
  monkey.style.setProperty('--monkey-size',index%4===0?.84:1);
  const head=(x,y,turn=0)=>`<g transform="translate(${x} ${y}) rotate(${turn})"><circle cx="0" cy="0" r="7.4" fill="#69704d"/><circle cx="-6" cy="1" r="2.8" fill="#c4b580"/><path d="M0 -5 Q6 -6 7 0 L9 4 Q5 8 0 5 Q-4 1 0 -5Z" fill="#e3d9b4"/><ellipse cx="5" cy="0" rx="1.1" ry="1.3" fill="#292e25"/><ellipse cx="7" cy="4" rx="2" ry="1.3" fill="#494b36"/></g>`;
  monkey.innerHTML=`<svg viewBox="0 0 90 60">
   <g class="squirrel-awake">
    <g class="monkey-pose monkey-walk">
     <path class="capuchin-tail" d="M31 29 Q14 35 9 44 Q3 51 1 44" fill="none" stroke="#737550" stroke-width="3" stroke-linecap="round"/>
     <path class="monkey-far-limbs" d="M37 32 L34 42 L29 44 M55 30 L59 41 L64 42" fill="none" stroke="#95894f" stroke-width="3" stroke-linecap="round"/>
     <path d="M29 30 Q29 19 43 20 L59 23 Q65 27 59 33 Q44 36 29 30" fill="#8b9060"/>
     <path class="monkey-near-limbs" d="M33 30 Q27 35 30 43 L25 45 M57 30 L54 42 L60 44" fill="none" stroke="#c3a65c" stroke-width="3.2" stroke-linecap="round"/>
     ${head(64,22,-8)}
    </g>
    <g class="monkey-pose monkey-climb">
     <path class="capuchin-tail" d="M34 38 Q20 49 24 56" fill="none" stroke="#737550" stroke-width="3" stroke-linecap="round"/>
     <path class="monkey-far-limbs" d="M37 22 L44 13 L48 15 M36 37 L47 39 L48 46" fill="none" stroke="#95894f" stroke-width="3" stroke-linecap="round"/>
     <ellipse cx="34" cy="30" rx="8" ry="14" fill="#8b9060"/>
     <path class="monkey-near-limbs" d="M35 22 L45 20 L48 15 M34 37 L43 46 L48 43" fill="none" stroke="#c3a65c" stroke-width="3" stroke-linecap="round"/>
     ${head(36,14,-25)}
    </g>
    <g class="monkey-pose monkey-crouch">
     <path class="capuchin-tail" d="M34 35 Q14 35 12 46 Q14 52 23 49" fill="none" stroke="#737550" stroke-width="3" stroke-linecap="round"/>
     <path d="M37 29 Q29 23 32 38 L29 43 M53 27 L58 41 L63 42" fill="none" stroke="#95894f" stroke-width="3" stroke-linecap="round"/>
     <path d="M31 35 Q29 19 42 18 Q54 17 58 30 L54 37Z" fill="#8b9060"/>
     <path d="M39 32 Q30 39 38 43 L43 43 M55 29 L52 42 L57 44" fill="none" stroke="#c3a65c" stroke-width="3.2" stroke-linecap="round"/>
     ${head(59,21,12)}
    </g>
    <g class="monkey-pose monkey-hang">
     <path class="capuchin-tail" d="M43 42 Q25 52 20 43 Q18 39 22 36" fill="none" stroke="#737550" stroke-width="3" stroke-linecap="round"/>
     <path d="M46 38 Q36 40 37 48 L32 49 M50 39 Q57 44 53 49 L58 50" fill="none" stroke="#c3a65c" stroke-width="3" stroke-linecap="round"/>
     <path d="M40 30 Q37 22 46 21 Q56 23 56 34 Q55 44 45 43Z" fill="#8b9060"/>
     <path d="M42 26 Q34 15 37 3 L41 2 M53 26 Q60 14 59 4 L63 3" fill="none" stroke="#c3a65c" stroke-width="3" stroke-linecap="round"/>
     ${head(53,21,-20)}
    </g>
   </g>
   <g class="squirrel-asleep">
    <path d="M28 40 Q27 24 43 25 Q58 24 63 37 Q65 45 55 47 L36 47 Q29 47 28 40" fill="#8b9060"/>
    <path d="M32 40 Q19 46 29 51 Q45 55 59 46" fill="none" stroke="#737550" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M48 36 Q55 32 61 36 Q67 41 61 46 Q53 50 47 44Z" fill="#d8cfab"/>
    <path d="M47 37 Q51 30 58 34 L61 37" fill="none" stroke="#69704d" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M55 41 Q57 43 60 41 M37 42 Q41 45 48 44" fill="none" stroke="#655f42" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="62" cy="44" rx="1.8" ry="1" fill="#494b36"/>
   </g>
  </svg>`;
  colony.append(monkey);monkeys.push(monkey);
 }
}
function pointOnRoute(from,to,t) {
 const knots=from.branch===to.branch?[from,to]:[from,{x:.51,y:branches[from.branch].y,branch:from.branch},{x:.51,y:branches[to.branch].y,branch:to.branch},to];
 const lengths=knots.slice(1).map((p,i)=>Math.hypot(p.x-knots[i].x,p.y-knots[i].y));
 let distance=t*lengths.reduce((a,b)=>a+b,0),stage=0;
 while(stage<lengths.length-1&&distance>lengths[stage])distance-=lengths[stage++];
 const a=knots[stage],b=knots[stage+1],u=lengths[stage]?distance/lengths[stage]:0;
 const x=a.x+(b.x-a.x)*u,climbing=Math.abs(b.x-a.x)<.001&&Math.abs(b.y-a.y)>.01;
 return{x,y:climbing?a.y+(b.y-a.y)*u:branchY(a.branch,x),climbing,facing:b.x>=a.x?1:-1};
}
export function updateSquirrelMonkeys(time,night) {
 const asleep=document.body.dataset.time==='night';
 const sheltered=document.body.dataset.weather==='rainy'&&!asleep;
 for(const troop of troops)troop.monkeys.forEach((monkey,index)=>{
  const clock=reduced.matches?0:time+index*2.7+troop.offset;
  const cycle=Math.floor(clock/27),phase=clock%27,slot=(index+cycle)%positions.length;
  const current=positions[slot],next=positions[(slot+1)%positions.length];
  const moving=phase>20&&!sheltered;
  const routeProgress=moving?(phase-20)/7:0;
  const day=moving?pointOnRoute(current,next,routeProgress):current;
  const climbing=moving&&day.climbing;
  const [sx,sleepBranch,turn,scale,dy]=[[.35,0,-10,.92,0],[.42,0,8,1,-.008],[.48,0,-6,.85,.003],[.38,0,12,.9,-.013],[.45,0,-12,1.05,-.018],[.6,1,7,.86,0],[.67,1,-9,.87,-.006],[.73,1,10,.83,.002],[.63,1,-11,.82,-.013],[.7,1,5,.88,-.015]][index];
  const sleep={x:sx,y:branchY(sleepBranch,sx)+dy};
  const {x,y}=asleep||sheltered?sleep:day;
  monkey.style.left=`${x*100}%`;monkey.style.top=`${y*100}%`;
  monkey.style.setProperty('--sleep-turn',`${asleep?turn:0}deg`);
  monkey.style.setProperty('--sleep-scale',asleep?scale:1);
  monkey.classList.toggle('hanging',!moving&&!sheltered&&!!current.hang);
  monkey.classList.toggle('climbing',climbing);
  monkey.classList.toggle('walking',moving&&!climbing&&!asleep);
  if(moving)monkey.style.setProperty('--facing',climbing?1:day.facing);
  monkey.dataset.pose=sheltered?'crouch':climbing?'climb':!moving&&current.hang?'hang':!moving&&slot%3===1?'crouch':'walk';
 });
}
