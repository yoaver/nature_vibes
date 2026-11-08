// Small coastal visitors; time comes from the scene's pause-aware clock.
const seaLionColony=[
 [.04,.734,.95,1,0],[.12,.753,1.15,-1,2],[.18,.765,.72,-1,0],
 [.025,.802,.9,1,0],[.102,.827,.75,-1,0],[.047,.869,.86,1,1],
 [.117,.911,.8,-1,0],[.065,.972,.92,-1,1],
 [.074,.744,.42,-1,0,true],[.127,.835,.4,1,0,true],[.145,.925,.45,1,0,true],
 [.065,.792,.8,1,0],[.075,.859,.7,-1,0],[.027,.937,.74,1,0],
 [.105,.953,.65,-1,0],[.155,.786,.93,-1,1],
];
const interpolate=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function effortProgress(t,steps) {
 const stride=Math.min(steps,t*steps),whole=Math.floor(stride),phase=stride-whole;
 const push=Math.max(0,Math.min(1,(phase-.38)/.44));
 return (whole+push*push*(3-2*push))/steps;
}
function surfaceRoute(home,bend,edge,t,aspect) {
 const first=Math.hypot((bend[0]-home[0])*aspect,bend[1]-home[1]);
 const second=Math.hypot((edge[0]-bend[0])*aspect,edge[1]-bend[1]);
 const split=first/(first+second||1);
 return t<split?interpolate(home,bend,t/(split||1)):interpolate(bend,edge,(t-split)/(1-split||1));
}
function walkingRoute(home,t,aspect=1.44) {
 const bend=[.10,.784],edge=[.185,.775];
 return surfaceRoute(home,bend,edge,t,aspect);
}
function landSteps(points,scale,aspect) {
 const distance=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot((p[0]-points[i][0])*aspect,p[1]-points[i][1]),0);
 return Math.max(10,Math.ceil(distance/(Math.min(aspect,1)*.001*scale*14)));
}
export function seaLionActivity(id,time,night=0,aspect=1.44) {
 const [x,y,scale,facing,male,pup]=seaLionColony[id],home=[x,y];
 const rest=180+id%4*19,swim=57+id%5*8,walk=23,hop=.85,total=rest+2*(walk+hop)+swim;
 const elapsed=(time+id*19)%total;
 const base={id,scale,facing,male,pup,local:time+id*6,outing:Math.floor((time+id*19)/total)};
 const steps=landSteps([home,[.10,.784],[.185,.775]],scale,aspect);
 if(night>.5)return {...base,state:'resting',position:home};
 if(elapsed<rest) {
  const visit=(Math.floor((time+id*19)/total)+id)%3===0;
  if(visit&&elapsed>=48&&elapsed<132) {
   const sand=[.224+id%4*.018,.943+id%3*.012],bend=[.11,.918];
   const route=t=>surfaceRoute(home,bend,sand,t,aspect);
   if(elapsed>=66&&elapsed<114)return {...base,state:'resting',position:sand,habitat:'sand',restElapsed:elapsed-66};
   const outward=elapsed<66,t=outward?(elapsed-48)/18:1-(elapsed-114)/18;
   const sandSteps=landSteps([home,bend,sand],scale,aspect);
   const progress=outward?effortProgress(t,sandSteps):1-effortProgress(1-t,sandSteps);
   const position=route(progress),next=route(Math.max(0,Math.min(1,progress+(outward?.001:-.001))));
   return {...base,state:'walking',position,facing:next[0]>=position[0]?1:-1,habitat:'sand',gait:(outward?t:1-t)*sandSteps,strideDuration:18/sandSteps};
  }
  return {...base,state:'resting',position:home,restElapsed:visit&&elapsed>=132?elapsed-132:elapsed};
 }
 let t=elapsed-rest;
 if(t<walk) {
  const progress=effortProgress(t/walk,steps),position=walkingRoute(home,progress,aspect),next=walkingRoute(home,Math.min(1,progress+.001),aspect);
  return {...base,state:'walking',position,facing:next[0]>=position[0]?1:-1,gait:t/walk*steps,strideDuration:walk/steps};
 }
 t-=walk;
 const edge=walkingRoute(home,1,aspect),water=[.245,.782];
 if(t<hop)return {...base,state:'entering',position:interpolate(edge,water,t/hop),progress:t/hop,facing:1};
 t-=hop;
 if(t<swim) {
  const motion=playClock(t,31+id%4*3),end=playClock(swim,31+id%4*3).clock;
  const phase=motion.clock/end*Math.PI*2;
  return {...base,state:'swimming',position:[water[0]+.085*(1-Math.cos(phase)),water[1]+Math.sin(phase)*(.013+id%3*.006)],facing:Math.sin(phase)>=0?1:-1,swimTime:t,motion};
 }
 t-=swim;
 if(t<hop)return {...base,state:'leaving',position:interpolate(water,edge,t/hop),progress:t/hop,facing:-1};
 t-=hop;
 const progress=effortProgress(Math.min(1,t/walk),steps),position=walkingRoute(home,1-progress,aspect),next=walkingRoute(home,Math.max(0,1-progress-.001),aspect);
 return {...base,state:'walking',position,facing:next[0]>=position[0]?1:-1,gait:t/walk*steps,strideDuration:walk/steps};
}
// Integrate a smooth burst of speed without teleporting at the cycle boundary.
function playClock(t,period) {
 const loops=Math.floor(t/period),cycle=t-loops*period,span=4;
 const u=Math.min(cycle,span),integral=u/2-span*Math.sin(2*Math.PI*u/span)/(4*Math.PI);
 return {cycle,clock:t+8*(loops*span/2+integral),speed:1+(cycle<span?8*Math.sin(Math.PI*cycle/span)**2:0)};
}
export function drawLighthouseWalkway(ctx,{w,h,mix}) {
 ctx.save();ctx.scale(w,h);
 ctx.beginPath();ctx.moveTo(1.04,.91);ctx.bezierCurveTo(.96,.83,.87,.74,.815,.62);
 ctx.lineTo(.839,.609);ctx.bezierCurveTo(.9,.72,1.01,.78,1.05,.81);ctx.closePath();
 ctx.fillStyle=mix('#596d65','#293f4a');ctx.fill();
 ctx.beginPath();ctx.moveTo(1.04,.876);ctx.bezierCurveTo(.96,.8,.87,.70,.818,.609);
 ctx.quadraticCurveTo(.823,.602,.837,.606);ctx.bezierCurveTo(.9,.70,1.01,.76,1.05,.79);ctx.closePath();
 ctx.fillStyle=mix('#8a9077','#465b60');ctx.fill();
 ctx.restore();
 for(let i=0;i<33;i++) {
  const t=i/32,scatter=Math.sin(i*17.7),x=w*(.826+.21*t**.9+scatter*(.004+t*.013)),y=h*(.62+.21*t+Math.cos(i*8.3)*.006*t),r=(3+t*13)*( .8+.3*Math.sin(i*4.7))*Math.min(w,h)/1000;
  ctx.fillStyle=mix(i%2?'#747e6d':'#979b81',i%2?'#344b52':'#52666a');
  ctx.beginPath();ctx.moveTo(x-r,y+r*.3);ctx.lineTo(x-r*.7,y-r*.4);ctx.lineTo(x+r*.35,y-r*.5);ctx.lineTo(x+r,y+r*.15);ctx.lineTo(x+r*.3,y+r*.5);ctx.closePath();ctx.fill();
 }
}
export function drawBeachWaterWildlife(ctx,{w,h,time,night,mix}) {
 const center=.49+Math.sin(time*.028)*.19;
 for(let i=0;i<6;i++) {
  const motion=playClock(time+i*6.7,34+i*6),cycle=motion.cycle,jump=cycle>=1.45&&cycle<2.4,u=Math.max(0,Math.min(1,(cycle-1.45)/.95));
  const diving=cycle>=2.4&&cycle<3.05,dive=(cycle-2.4)/.65;
  const show=jump||diving?1:cycle>=3.05&&cycle<5?0:Math.max(0,Math.sin(time*.65+i*1.7));
  const launchTime=time-cycle,eventDirection=Math.cos(launchTime*.028)>=0?1:-1;
  const t=cycle<4?cycle/4:(cycle-4)/(34+i*6-4),smooth=t*t*(3-2*t);
  const surge=eventDirection*.1*(cycle<4?smooth:1-smooth);
  const surgeSpeed=eventDirection*.1*6*t*(1-t)*(cycle<4?1/4:-1/(34+i*6-4));
  const x=w*(center+[-.105,-.065,-.022,.023,.069,.108][i]+surge);
  const velocity=.19*.028*Math.cos(time*.028)+surgeSpeed;
  const facing=cycle<4?eventDirection:velocity>=0?1:-1;
  const y=h*(.602+(i%3)*.011),size=Math.min(w,h)*[.027,.03,.022,.028,.025,.021][i];
  ctx.save();
  if(show>.1){ctx.fillStyle=mix('#4899a5','#24495d');ctx.beginPath();ctx.ellipse(x,y+1,size*1.1,3,0,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle=`rgba(206,229,219,${(.14+show*.23)*(1-night*.4)})`;ctx.lineWidth=.8;
  ctx.beginPath();ctx.ellipse(x-size*.1,y+2,size*(.8+show*.15),2,0,0,Math.PI);ctx.stroke();
  if(show>.04) {
   ctx.save();
   if(!jump){ctx.beginPath();ctx.rect(x-size*1.4,y-size,size*2.8,size+1);ctx.clip();}
   ctx.translate(x,y-(jump?Math.sin(u*Math.PI)*h*.027:diving?-dive*size*1.5:-(1-show)*size*.18));ctx.scale(facing,1);
   if(jump||diving)ctx.rotate(diving?1.05:-1.05*Math.cos(u*Math.PI));
   ctx.globalAlpha=(jump?1:show)*(1-night*.35);ctx.fillStyle=mix('#607e82','#3b565d');
   ctx.beginPath();ctx.moveTo(-size*.68,0);
   ctx.bezierCurveTo(-size*.4,-size*.19,size*.18,-size*.28,size*.42,-size*.15);
   ctx.quadraticCurveTo(size*.56,-size*.11,size*.56,-size*.045);ctx.lineTo(size*.83,-size*.01);
   ctx.quadraticCurveTo(size*.87,size*.035,size*.73,size*.045);ctx.lineTo(size*.51,size*.035);
   ctx.quadraticCurveTo(size*.22,size*.22,-size*.13,size*.15);ctx.quadraticCurveTo(-size*.44,size*.08,-size*.68,0);ctx.fill();
   ctx.fillStyle=mix('#93a5a0','#5c7479');ctx.beginPath();ctx.moveTo(-size*.54,size*.025);
   ctx.quadraticCurveTo(size*.08,size*.17,size*.51,size*.035);ctx.quadraticCurveTo(size*.12,size*.24,-size*.54,size*.025);ctx.fill();
   ctx.fillStyle=mix('#607e82','#3b565d');
   ctx.beginPath();ctx.moveTo(-size*.12,-size*.15);ctx.quadraticCurveTo(-size*.13,-size*.3,-size*.23,-size*.4);ctx.quadraticCurveTo(size*.02,-size*.32,size*.17,-size*.15);ctx.fill();
   if(jump||diving){
    ctx.beginPath();ctx.moveTo(-size*.63,0);ctx.lineTo(-size*.95,-size*.12);ctx.quadraticCurveTo(-size*.86,0,-size*.96,size*.14);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(size*.24,size*.05);ctx.quadraticCurveTo(size*.12,size*.39,-size*.05,size*.37);ctx.lineTo(size*.08,size*.1);ctx.fill();
   }
   ctx.fillStyle=mix('#293e42','#24383e');ctx.beginPath();ctx.arc(size*.48,-size*.065,Math.max(.55,size*.019),0,Math.PI*2);ctx.fill();
   ctx.restore();
  }
  if(diving){const splash=dive;ctx.globalAlpha=1-splash;ctx.beginPath();ctx.ellipse(x,y+2,size*(.4+splash),2+splash*2,0,0,Math.PI*2);ctx.stroke();for(let drop=0;drop<5;drop++){ctx.beginPath();ctx.arc(x+(drop-2)*size*.2*splash,y-Math.sin(splash*Math.PI)*size*(.3+(drop%2)*.25),.8,0,Math.PI*2);ctx.fillStyle='#d9eae1';ctx.fill();}}
  ctx.restore();
 }
}
function drawSeaLionColony(ctx,{w,h,time,night,mix}) {
 const unit=Math.min(w,h)/1000;
 for(let id=0;id<seaLionColony.length;id++) {
  const animal=seaLionActivity(id,time,night,w/h),{state,position,scale,facing,male,pup,local}=animal;
  const x=position[0]*w,y=position[1]*h,size=unit*scale;
  const coat=mix(male?'#67563f':pup?'#655c48':id%2?'#8d7756':'#a18b65',male?'#344642':'#4b5b51');
  if(state==='resting'||state==='walking') {
   const settledFor=animal.restElapsed??0;
   const pose=state==='walking'?'walking':night>.5||settledFor<55?'resting':['resting','sitting','lounging','standing','resting'][(Math.floor((settledFor-55)/70)+id*2)%5];
   let gaitStyle=['shuffle','low-pull','amble','bound'][(id+animal.outing)%4];
   if(gaitStyle==='bound'&&!pup&&male!==1)gaitStyle='shuffle';
   let plantOffset=null;
   if(state==='walking') {
    const planted=seaLionActivity(id,time-(animal.gait%1)*animal.strideDuration,night,w/h).position;
    plantOffset=[(position[0]-planted[0])*w/(size*facing),(position[1]-planted[1])*h/size];
   }
   seaLion(ctx,x,y,size,pose==='sitting',facing,coat,local,false,male,pup,pose,animal.gait,gaitStyle,plantOffset);
   continue;
  }
  const transfer=state==='entering'||state==='leaving';
  const cycle=animal.motion?.cycle??0;
  const breach=!transfer&&cycle>=1.4&&cycle<2.35;
  const dive=!transfer&&cycle>=2.35&&cycle<3.05;
  const underwater=!transfer&&cycle>=3.05&&cycle<22;
  const u=transfer?animal.progress:(cycle-1.4)/.95;
  ctx.save();ctx.translate(x,y);
  if(!transfer) {
   ctx.fillStyle=mix('#4899a5','#24495d');ctx.beginPath();ctx.ellipse(0,1,27*size,3,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=`rgba(217,235,224,${.24-night*.08})`;ctx.lineWidth=.9;
   ctx.beginPath();ctx.ellipse(0,0,30*size,2,0,0,Math.PI*2);ctx.stroke();
  }
  if(!transfer&&!underwater){ctx.beginPath();ctx.rect(-80*size,-70*size,160*size,70*size);ctx.clip();}
  const height=transfer?-Math.sin(u*Math.PI)*h*.019:breach?size*(5-Math.sin(u*Math.PI)*12):dive?size*(5+(cycle-2.35)*25):underwater?h*.009:4*size;
  ctx.translate(0,height);ctx.scale(facing,1);
  ctx.rotate(transfer?-.5*Math.cos(u*Math.PI):breach?-.85*Math.cos(u*Math.PI):dive?1.05:Math.sin(local*.8)*.08);
  ctx.globalAlpha=underwater?.22:1;
  seaLion(ctx,0,0,size,false,1,coat,animal.motion?.clock??local,true,male,pup);
  ctx.restore();
  const splash=transfer?(u>.76?(u-.76)/.24:-1):dive?(cycle-2.35)/.7:-1;
  if(splash>=0&&splash<=1) {
   ctx.save();ctx.globalAlpha=(1-splash)*.6;ctx.strokeStyle='#d5e6dc';ctx.lineWidth=1;
   ctx.beginPath();ctx.ellipse(x,y,15*size+24*size*splash,2+splash*3,0,0,Math.PI*2);ctx.stroke();
   for(let d=0;d<4;d++){ctx.fillStyle='#d5e6dc';ctx.beginPath();ctx.arc(x+(d-1.5)*12*size*splash,y-Math.sin(splash*Math.PI)*(6+d%2*6)*size,.8*size,0,Math.PI*2);ctx.fill();}ctx.restore();
  }
 }
}
const gaitFrames={
 shuffle:[[-25,-3,1,-22,7,-37],[-25,-4,7,-17,20,-27],[-19,-8,9,-15,24,-23],[-22,-5,2,-23,9,-38],[-25,-3,1,-22,7,-37]],
 'low-pull':[[-27,-3,3,-18,13,-31],[-27,-4,6,-19,18,-30],[-22,-7,7,-17,20,-28],[-24,-4,9,-14,23,-23],[-27,-3,3,-18,13,-31]],
 amble:[[-24,-7,1,-24,7,-39],[-25,-8,6,-20,17,-32],[-21,-10,9,-17,23,-27],[-21,-8,3,-25,10,-40],[-24,-7,1,-24,7,-39]],
 bound:[[-26,-4,8,-12,23,-21],[-23,-11,3,-20,17,-30],[-17,-15,8,-17,22,-26],[-22,-7,14,-10,28,-18],[-26,-4,8,-12,23,-21]],
};
export function seaLionWalkingPose(style,phase) {
 const frames=gaitFrames[style]??gaitFrames.shuffle,raw=((phase%1)+1)%1;
 const p=(raw<.25?0:(raw-.25)/.75)*4,k=Math.floor(p),f=p-k;
 const pose=interpolate(frames[k],frames[k+1],f*f*(3-2*f));
 return style==='bound'?pose:interpolate(frames[0],pose,.7);
}
export function seaLionWalkingRig(style,phase) {
 // The rear initiates the push; motion passes forward through the torso.
 const chestPose=seaLionWalkingPose(style,phase-.09),rearPose=seaLionWalkingPose(style,phase+.10);
 const bellyPose=seaLionWalkingPose(style,phase-.025),abdomenPose=seaLionWalkingPose(style,phase+.045),headPose=seaLionWalkingPose(style,phase-.13);
 const tailPose=seaLionWalkingPose(style,phase+.14),angle=phase*Math.PI*2;
 const stride=((phase%1)+1)%1,carry=Math.max(0,Math.min(1,(stride-.25)/.43));
 const rearLift=Math.sin(carry*Math.PI)**2*(style==='low-pull'?1.2:2);
 const pelvis=[rearPose[0]+rearLift*.35,rearPose[1]-rearLift],chest=[chestPose[2],chestPose[3]];
 const belly=[bellyPose[0]*.38+bellyPose[2]*.62,bellyPose[1]*.38+bellyPose[3]*.62+Math.sin(angle-.4)*.7];
 const abdomen=[abdomenPose[0]*.72+abdomenPose[2]*.28+rearLift*.15,abdomenPose[1]*.72+abdomenPose[3]*.28+Math.sin(angle-1)*.8-rearLift*.65];
 const head=[headPose[4],headPose[5]],neck=[chest[0]+(head[0]-chest[0])*.55+Math.sin(angle+.8)*1.5,chest[1]+(head[1]-chest[1])*.55];
 const tail=[pelvis[0]-7,pelvis[1]+3+(tailPose[1]-pelvis[1])*.25+Math.sin(angle-1.5)*.5];
 return {pelvis,abdomen,belly,chest,neck,head,tail,rearLift};
}
export function drawWalkingSeaLion(ctx,{style='shuffle',phase=0,coat='#8d7756',male=0,plantOffset=null}) {
 const {pelvis,abdomen,belly,chest,neck,head,tail,rearLift}=seaLionWalkingRig(style,phase);
 const [rx,ry]=pelvis,[cx,cy]=chest,[hx,hy]=head;
 const angle=phase*Math.PI*2;
 const flippers=far=>{
  const shift=far?.12:0;
  const step=((phase+(far?.018:0))%1+1)%1,planted=step<.82;
  const recovery=planted?0:(step-.82)/.18,ease=recovery*recovery*(3-2*recovery);
  const load=Math.max(0,Math.min(1,(step-.38)/.44));
  const startChest=seaLionWalkingRig(style,Math.floor(phase)).chest[0];
  const plantedX=plantOffset?startChest+11-plantOffset[0]:cx+11-load*17;
  const plantedY=plantOffset?7-plantOffset[1]:7;
  const fx=planted?plantedX:plantedX+(cx+11-plantedX)*ease,fy=planted?plantedY:plantedY+(7-plantedY)*ease-Math.sin(recovery*Math.PI)*6;
  ctx.save();ctx.globalAlpha=far?.45:1;ctx.fillStyle=coat;
  ctx.beginPath();ctx.moveTo(cx-5,cy+6);ctx.quadraticCurveTo(cx-5,cy+11,fx-1,fy-2);
  ctx.quadraticCurveTo(fx+1,fy+1,fx+5,fy);ctx.quadraticCurveTo(fx+7,fy-1,fx+3,fy-3);
  ctx.quadraticCurveTo(cx+5,cy+12,cx+3,cy+7);ctx.closePath();ctx.fill();
  const tuck=Math.max(0,Math.min(1,(step-.08)/.22));
  const rearX=rx+3-Math.sin(angle+shift)*4,rearY=6-Math.sin(tuck*Math.PI)**2*3;
  ctx.beginPath();ctx.moveTo(rx-3,ry+3);ctx.quadraticCurveTo(rx-5,ry+7,rearX-3,rearY);
  ctx.lineTo(rearX+7,rearY+1);ctx.lineTo(rearX+9,rearY-1);ctx.quadraticCurveTo(rx+4,ry+6,rx+3,ry+2);ctx.closePath();ctx.fill();ctx.restore();
 };
 flippers(true);
 ctx.fillStyle=coat;
 // One smooth skin envelope surrounds the articulated spine; joints stay internal.
 const spine=[tail,pelvis,abdomen,belly,chest,neck,[hx,hy+2]],radii=[.5,6.5,male>=2?9:8.6,male>=2?10.5:10,male>=2?11:10.5,male?7:6.8,male?4.4:4.2];
 const upper=[],lower=[];
 spine.forEach((p,i)=>{
  const a=spine[Math.max(0,i-1)],b=spine[Math.min(spine.length-1,i+1)];
  const length=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/length,ny=(b[0]-a[0])/length;
  upper.push([p[0]-nx*radii[i],p[1]-ny*radii[i]]);
  lower.push([p[0]+nx*radii[i],p[1]+ny*radii[i]]);
 });
 const skin=[...upper,...lower.reverse()];
 ctx.beginPath();ctx.moveTo(...skin[0]);
 for(let i=0;i<skin.length;i++) {
  const a=skin[(i+skin.length-1)%skin.length],b=skin[i],c=skin[(i+1)%skin.length],d=skin[(i+2)%skin.length];
  ctx.bezierCurveTo(b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6,c[0]-(d[0]-b[0])/6,c[1]-(d[1]-b[1])/6,c[0],c[1]);
 }
 ctx.closePath();ctx.fill();
 ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle='#e1c99e';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(rx,ry+3);ctx.quadraticCurveTo(belly[0],belly[1]+4,cx+1,cy+4);ctx.stroke();ctx.restore();
 flippers(false);
 ctx.save();ctx.translate(hx,hy);ctx.rotate(Math.sin(angle+.6)*.15);
 ctx.fillStyle=coat;ctx.beginPath();ctx.moveTo(-5,3);ctx.quadraticCurveTo(-7,-3,-3,male>=2?-7:-5);
 ctx.quadraticCurveTo(1,male>=2?-8:-6,5,-2);ctx.lineTo(9,0);ctx.quadraticCurveTo(10,3,5,3);ctx.quadraticCurveTo(0,6,-5,3);ctx.fill();
 ctx.beginPath();ctx.ellipse(-4,1,1.1,2,-.3,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#27332f';ctx.beginPath();ctx.arc(1,-2,.65,0,Math.PI*2);ctx.arc(9,.5,.8,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#b6a58a';ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(6,3);ctx.lineTo(12,4);ctx.moveTo(6,3.5);ctx.lineTo(11,5.5);ctx.stroke();ctx.restore();
}
export function drawSeaLionModel(ctx,{pose='resting',male=0,time=0,phase=0,style='shuffle',coat='#79684c'}={}) {
 seaLion(ctx,0,0,1,pose==='sitting',1,coat,time,false,male,false,pose,phase,style);
}
function seaLion(ctx,x,y,size,upright,flip,coat,time=0,swimming=false,male=false,pup=false,pose='lounging',gait=0,gaitStyle='shuffle',plantOffset=null) {
 ctx.save();ctx.translate(x,y);ctx.scale(size*flip,size);ctx.fillStyle=coat;
 if(pose==='walking'){drawWalkingSeaLion(ctx,{style:gaitStyle,phase:gait,coat,male,plantOffset});ctx.restore();return;}
 const standing=!swimming&&pose==='standing',resting=!swimming&&pose==='resting',lift=standing?5:0;

 ctx.translate(0,-lift);
 if(!swimming)ctx.scale(1,1+Math.sin(time*1.4)*.012);
 ctx.beginPath();ctx.moveTo(-29,1);
 if(upright&&male>=2){ctx.bezierCurveTo(-21,-2,-13,-9,-11,-20);ctx.quadraticCurveTo(-11,-29,-5,-31);ctx.quadraticCurveTo(2,-33,8,-29);ctx.bezierCurveTo(12,-22,8,-14,13,-6);ctx.quadraticCurveTo(17,0,12,2);}
 else if(upright){ctx.bezierCurveTo(-23,-2,-13,-8,-10,-17);ctx.bezierCurveTo(-8,-22,-9,-31,-3,-33);ctx.quadraticCurveTo(4,-37,8,-30);ctx.bezierCurveTo(11,-24,7,-17,11,-9);ctx.quadraticCurveTo(14,-3,13,0);}
 else {ctx.bezierCurveTo(-20,-3,-15,-10,-1,-10);ctx.bezierCurveTo(9,-10,13,-6,20,-6);ctx.lineTo(24,-1);ctx.quadraticCurveTo(9,4,-3,4);}
 ctx.quadraticCurveTo(-19,5,-29,1);ctx.fill();
 ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#e1c99e';ctx.beginPath();
 if(upright){ctx.moveTo(-9,-13);ctx.quadraticCurveTo(-2,-16,5,-28);ctx.quadraticCurveTo(4,-8,9,-3);ctx.quadraticCurveTo(-2,-5,-9,-13);}
 else{ctx.ellipse(-4,-6,17,2.2,-.08,0,Math.PI*2);}ctx.fill();ctx.restore();
 // Long foreflippers and paired rear flippers, rather than seal-like stubs.
 const stroke=swimming?Math.sin(time*3)*8:lift+Math.max(0,Math.sin(time*.55))*(resting?.6:pup?7:4);
  ctx.beginPath();ctx.moveTo(upright?3:8,-5);ctx.bezierCurveTo(8,-1,10,4+stroke,19,6+stroke);ctx.quadraticCurveTo(20,9+stroke,12,8+stroke);ctx.quadraticCurveTo(3,5,0,-1);ctx.fill();
  ctx.beginPath();ctx.moveTo(-23,0);ctx.lineTo(-36,-3+stroke*.3+lift);ctx.lineTo(-32,2+lift);ctx.lineTo(-36,5+lift);ctx.lineTo(-22,3);ctx.fill();
 const stretch=Math.max(0,Math.sin(time*.21))**6;
 const headX=(upright?2:18)+stretch*(upright?1:2),headY=(upright?(male>=2?-34:-30):-7)+(resting?4:-stretch*(upright?3:2));
 // Blend the neck into one skull outline rather than layering a second crest/head.
 const neckBaseX=upright?1:11,neckBaseY=upright?-19:-4;
 ctx.beginPath();ctx.moveTo(neckBaseX-5,neckBaseY+3);
 ctx.quadraticCurveTo(neckBaseX-4,(neckBaseY+headY)/2,headX-4,headY);
 ctx.quadraticCurveTo(headX,headY-2,headX+3,headY+1);ctx.lineTo(headX+4,headY+4);
 ctx.quadraticCurveTo(neckBaseX+6,neckBaseY+5,neckBaseX+4,neckBaseY+6);
 ctx.quadraticCurveTo(neckBaseX,neckBaseY+7,neckBaseX-5,neckBaseY+3);ctx.closePath();ctx.fill();
 ctx.save();ctx.translate(headX,headY);ctx.rotate(resting?.12:Math.sin(time*.48)*.16-stretch*.1);
 ctx.scale(male>=2?1.05:pup?1.08:1,1);
 ctx.beginPath();ctx.moveTo(-5,3);ctx.quadraticCurveTo(-7,-3,-3,male>=2?-7:-5);ctx.quadraticCurveTo(1,male>=2?-8:-6,5,-3);ctx.lineTo(9,-1);ctx.quadraticCurveTo(11,0,9,2);ctx.lineTo(4,3);ctx.quadraticCurveTo(1,6,-5,3);ctx.fill();
 ctx.beginPath();ctx.ellipse(-4,1,1.2,2,-.3,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#27332f';ctx.beginPath();if(!resting)ctx.arc(1,-2,.65,0,Math.PI*2);ctx.arc(9,0,.8,0,Math.PI*2);ctx.fill();
 if(resting){ctx.strokeStyle='#27332f';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(-.3,-2);ctx.quadraticCurveTo(1,-1,2.3,-2);ctx.stroke();}
 ctx.strokeStyle='#b6a58a';ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(6,3);ctx.lineTo(13,3);ctx.moveTo(6,3.7);ctx.lineTo(12,5);ctx.stroke();ctx.restore();
 ctx.restore();
}
export function drawSeaLionRock(ctx,{w,h,time,night,mix}) {
 const unit=Math.min(w,h)/1000;
 const outline=[[-.02,.752],[.025,.727],[.085,.72],[.145,.735],[.19,.755],[.205,.778],[.165,.794],[.149,.812],[.177,.84],[.145,.856],[.129,.879],[.159,.901],[.164,.926],[.133,.941],[.146,.972],[.17,1.02],[-.02,1.02]];
 const trace=points=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath();};
 trace(outline);ctx.fillStyle=mix('#817f70','#35494e');ctx.fill();
 ctx.save();ctx.clip();
 // Broad joined sandstone planes with shallow eroded ledges.
 const planes=[
  [[[-.02,.723],[.11,.718],[.205,.763],[.171,.778],[.08,.762],[-.02,.779]],'#aaa18a'],
  [[[-.02,.787],[.061,.773],[.154,.803],[.177,.839],[.087,.825],[-.02,.844]],'#999580'],
  [[[-.02,.852],[.072,.838],[.143,.86],[.128,.883],[.16,.905],[.045,.888],[-.02,.907]],'#a39b83'],
  [[[-.02,.918],[.061,.904],[.164,.927],[.125,.944],[.148,.972],[.046,.96],[-.02,.979]],'#94917d'],
  [[[-.02,.989],[.08,.975],[.17,1.018],[-.02,1.03]],'#a09a83'],
 ];
 for(const [points,shade] of planes){trace(points);ctx.fillStyle=mix(shade,'#4c6063');ctx.fill();}
 ctx.strokeStyle=mix('#645f50','#2d4147');ctx.lineWidth=.8*unit;ctx.globalAlpha=.32;
 for(const seam of [ [[.055,.733],[.074,.757],[.062,.769],[.091,.791]],[[.132,.751],[.121,.772],[.142,.783]],[[.026,.802],[.05,.824],[.039,.842]],[[.103,.84],[.091,.865],[.113,.883]],[[.065,.908],[.087,.931],[.078,.947],[.101,.964]] ]) {
  ctx.beginPath();seam.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.stroke();
 }
 for(let i=0;i<140;i++) {
  const x=(Math.sin(i*37.7)*.5+.5)*w*.21,y=h*(.72+(Math.cos(i*61.9)*.5+.5)*.3);
  ctx.globalAlpha=.04;ctx.fillStyle=i%2?'#f0ddbd':'#323d36';ctx.fillRect(x,y,(1+i%5)*unit,unit*.6);
 }
 ctx.restore();
 drawSeaLionColony(ctx,{w,h,time,night,mix});
 ctx.strokeStyle=`rgba(220,236,222,${.2-night*.08})`;ctx.lineWidth=1;
 for(const [px,py,span] of [[.12,.784,.055],[.19,.846,.027],[.161,.956,.025]]) {
  ctx.beginPath();ctx.ellipse(px*w,py*h,span*w,2+Math.sin(time*.6)*.7,0,0,Math.PI);ctx.stroke();
 }
}
