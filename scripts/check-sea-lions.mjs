import assert from 'node:assert/strict';
import { seaLionActivity, seaLionWalkingPose } from '../public/assets/scenes/bay/wildlife.js';

const swimmingGroups=new Set();
for(let id=0;id<16;id++) {
 const states=new Set();
 let previous=seaLionActivity(id,0);
 for(let tick=1;tick<=36000;tick++) {
  const current=seaLionActivity(id,tick/100);
  states.add(current.state);
  assert.equal(current.id,id);
  assert.ok(Math.hypot(...current.position.map((v,i)=>v-previous.position[i]))<.002,`Sea lion ${id} teleported at ${tick/100}s`);
  previous=current;
 }
 for(const state of ['resting','walking','entering','swimming','leaving'])assert.ok(states.has(state),`Sea lion ${id} never ${state}`);
 for(const t of [0,45,120,250])assert.equal(seaLionActivity(id,t,1).state,'resting');
 assert.ok(Array.from({length:1500},(_,t)=>seaLionActivity(id,t)).some(a=>a.habitat==='sand'&&a.state==='resting'),`Sea lion ${id} never visits the sand`);
}
for(const t of [0,30,60,100,150])swimmingGroups.add(Array.from({length:16},(_,id)=>seaLionActivity(id,t)).filter(a=>a.state==='swimming').map(a=>a.id).join(','));
assert.ok(swimmingGroups.size>=4,'Swimming group did not change');
for(const aspect of [.6,1.44,2])for(let id=0;id<16;id++)for(let t=0;t<360;t+=.2) {
 const a=seaLionActivity(id,t,0,aspect);
 if(a.state!=='walking')continue;
 const planted=seaLionActivity(id,t-(a.gait%1)*a.strideDuration,0,aspect);
 const stride=Math.hypot((a.position[0]-planted.position[0])*aspect,a.position[1]-planted.position[1])/(Math.min(aspect,1)*.001*a.scale);
 assert.ok(stride<16,`Sea lion ${id} overstretched its planted flippers (${stride})`);
}
for(const style of ['shuffle','low-pull','amble','bound']) {
 const poses=Array.from({length:40},(_,i)=>seaLionWalkingPose(style,i/40));
 for(const joint of [1,3,5])assert.ok(Math.max(...poses.map(p=>p[joint]))-Math.min(...poses.map(p=>p[joint]))>2,`${style} does not move pelvis, chest, and head together`);
 assert.deepEqual(seaLionWalkingPose(style,0),seaLionWalkingPose(style,1));
}
console.log('All 16 sea lions complete continuous shore/water routines, rotate groups, and rest ashore at night.');
