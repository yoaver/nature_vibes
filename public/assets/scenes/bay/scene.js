import { drawBeachWaterWildlife, drawSeaLionRock, drawLighthouseWalkway } from './wildlife.js';
export function drawBay(ctx,{w,h,time,night,mix,color,gradient,random,horizon,cloudCover,drawSailboats,drawRain}) {
 const ox=w*.74;
function drawIslands(horizon) {
 const islands = [
  { x: .06, width: .25, height: .045, tint: ['#719a99', '#263e54'] },
  { x: .36, width: .17, height: .028, tint: ['#83a6a2', '#31495d'] },
  { x: .79, width: .25, height: .065, tint: ['#547e7d', '#1b3348'] },
 ];
 for (const [i, island] of islands.entries()) {
  const x = island.x * w, span = island.width * w, height = island.height * h;
  ctx.beginPath(); ctx.moveTo(x, horizon + 2);
  ctx.bezierCurveTo(x + span * .13, horizon - height * .18, x + span * .2, horizon - height * .9, x + span * .36, horizon - height * .65);
  ctx.bezierCurveTo(x + span * .52, horizon - height * 1.4, x + span * .68, horizon - height * .2, x + span * .8, horizon - height * .25);
  ctx.quadraticCurveTo(x + span * .92, horizon - height * .08, x + span, horizon + 2);
  ctx.closePath(); ctx.fillStyle = mix(...island.tint); ctx.fill();
  ctx.fillStyle = `rgba(195,219,213,${.08 * (1 - night)})`;
  ctx.fillRect(x + span * .1, horizon + 3 + i, span * .8, 1);
 }
}
function drawLighthouse() {
 // Mid-distance: the rock sits below the island horizon, with open water to shore.
 const scale = Math.min(h * .16, w * .25) / 105;
 const x = w * .82, base = h * .60;
 const rockWidth = Math.min(w * .09, h * .07);
 const rockHeight = h * .024;
 ctx.save(); ctx.translate(x, base);
 ctx.fillStyle = gradient(-rockHeight * .15, rockHeight, [mix('#7e8b7a', '#3e5560'), mix('#526c68', '#263f50')]);
 ctx.beginPath(); ctx.moveTo(-rockWidth, rockHeight * .9);
 ctx.bezierCurveTo(-rockWidth * .8, rockHeight * .45, -rockWidth * .7, 0, -rockWidth * .4, -rockHeight * .12);
 ctx.quadraticCurveTo(0, -rockHeight * .3, rockWidth * .4, 0);
 ctx.bezierCurveTo(rockWidth * .7, rockHeight * .15, rockWidth * .85, rockHeight * .8, rockWidth, rockHeight);
 ctx.quadraticCurveTo(0, rockHeight * 1.2, -rockWidth, rockHeight * .9);
 ctx.closePath(); ctx.fill();
 // Short, quiet foam at the waterline anchors the outcrop in the sea.
 ctx.strokeStyle = `rgba(224,241,230,${.25 - night * .1})`;
 ctx.lineWidth = 1;
 ctx.beginPath(); ctx.ellipse(0, rockHeight * 1.05, rockWidth * 1.08, rockHeight * .2, 0, 0, Math.PI); ctx.stroke();
 ctx.restore();
 ctx.save(); ctx.translate(x, base); ctx.scale(scale, scale);
 // Stone base and tapered ivory tower.
 ctx.fillStyle = mix('#526c65', '#142b3b');
 ctx.beginPath(); ctx.ellipse(0, 2, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
 ctx.fillStyle = gradient(-88, 0, [mix('#f6ebcf', '#abb8ad'), mix('#d2cbb4', '#647c80')]);
 ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-8, -78); ctx.lineTo(8, -78); ctx.lineTo(13, 0); ctx.closePath(); ctx.fill();
 ctx.fillStyle = mix('#b96953', '#644954');
 ctx.beginPath(); ctx.moveTo(-10, -54); ctx.lineTo(10, -54); ctx.lineTo(11, -40); ctx.lineTo(-11, -40); ctx.closePath(); ctx.fill();
 ctx.fillStyle = '#273e49'; ctx.fillRect(-2, -66, 4, 7); ctx.fillRect(-3, -15, 6, 15);
 const beamStrength = night * (.8 + cloudCover * .15);
 const sweep = Math.sin(time * .35);
 const reach = 260 * sweep;
 const beam = ctx.createLinearGradient(0, -88, reach || 1, -88);
 beam.addColorStop(0, `rgba(255,239,180,${beamStrength * .35})`);
 beam.addColorStop(1, 'rgba(255,239,180,0)');
 ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(0, -88); ctx.lineTo(reach, -112); ctx.lineTo(reach, -61); ctx.closePath(); ctx.fill();
 ctx.fillStyle = '#30434b'; ctx.fillRect(-13, -80, 26, 3);
 ctx.fillStyle = mix('#91b4be', '#ffe4a0'); ctx.shadowColor = '#ffe5a6'; ctx.shadowBlur = night * 20; ctx.fillRect(-7, -94, 14, 13); ctx.shadowBlur = 0;
 ctx.strokeStyle = '#30434b'; ctx.lineWidth = 2;
 ctx.strokeRect(-9, -95, 18, 15); ctx.beginPath(); ctx.moveTo(0, -95); ctx.lineTo(0, -80); ctx.stroke();
 ctx.fillStyle = mix('#a65342', '#493846'); ctx.beginPath(); ctx.moveTo(-13, -95); ctx.lineTo(0, -105); ctx.lineTo(13, -95); ctx.closePath(); ctx.fill();
 ctx.restore();
}
 ctx.fillStyle=gradient(horizon,h,[color('sea',0),color('sea',1),color('sea',2)]);ctx.fillRect(0,horizon,w,h-horizon);
 drawIslands(horizon);
 for(let i=0;i<260;i++){
  const depth=(i+1)/261,y=horizon+depth*depth*h*.43,x=random(i+600)*w+Math.sin(time*.2+i)*12*depth;
  ctx.strokeStyle=`rgba(220,245,234,${(.07+random(i+800)*.15)*(1-night*.45)})`;ctx.lineWidth=.5+depth;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+depth*depth*w*.12*random(i+700),y);ctx.stroke();
 }
 for(let i=0;i<100;i++){
  const depth=i/100,y=horizon+depth*h*.33,x=ox+(random(i+1000)-.5)*(20+depth*w*.25);
  ctx.fillStyle=`rgba(255,239,195,${(.08+.17*random(i+1100))*(1-depth)*(1-cloudCover*.85)})`;ctx.fillRect(x,y,2+random(i+1200)*(8+depth*35),1+depth);
 }
 // Render every water effect before any foreground land or lighthouse geometry.
 const shore = x => h * (.82 + .075 * Math.sin(x / w * 2.8 + .3)) + Math.sin(x / w * 7) * h * .006;
 for(let layer=0;layer<5;layer++){
  const phase=(time*.035+layer/5)%1,offset=(1-phase)*h*.23,alpha=Math.sin(phase*Math.PI)*(1-night*.4);
  ctx.beginPath();
  for(let x=0;x<=w+6;x+=6){const y=shore(x)-offset+Math.sin(x*.012+time*.3+layer)*(2+phase*4);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.strokeStyle=`rgba(227,249,237,${alpha*.18})`;ctx.lineWidth=16*phase+2;ctx.stroke();
  ctx.strokeStyle=`rgba(244,253,239,${alpha*.6})`;ctx.lineWidth=1+phase*2;ctx.stroke();
 }
 drawBeachWaterWildlife(ctx,{w,h,time,night,mix});
 drawSailboats(horizon);
 // Foreground beach stays separate from the offshore lighthouse.
 ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w+8;x+=8)ctx.lineTo(x,shore(x));ctx.lineTo(w,h);ctx.closePath();
 ctx.fillStyle=gradient(h*.78,h,[color('sand',0),color('sand',1)]);ctx.fill();
 ctx.save();ctx.clip();
 // Broad wind-smoothed variations and fine shallow grain keep the sand quiet.
 const sandLight=ctx.createRadialGradient(w*.64,h*.98,0,w*.64,h*.98,w*.6);
 sandLight.addColorStop(0,mix('#fff0cf','#a2aaa0'));sandLight.addColorStop(1,'rgba(239,224,189,0)');
 ctx.globalAlpha=.2;ctx.fillStyle=sandLight;ctx.fillRect(0,h*.78,w,h*.22);ctx.globalAlpha=1;
 for(let ridge=0;ridge<9;ridge++) {
  const y=h*(.885+ridge*.017),x=w*random(ridge+8700);
  ctx.strokeStyle=`rgba(134,113,77,${.025+ridge*.0015})`;ctx.lineWidth=.7+ridge*.14;
  ctx.beginPath();ctx.moveTo(x-w*.16,y);ctx.bezierCurveTo(x-w*.06,y-h*.004,x+w*.06,y+h*.004,x+w*.2,y-h*.001);ctx.stroke();
 }
 ctx.restore();
 for(let i=0;i<550;i++){
  const x=random(i+1500)*w,y=h*(.82+random(i+2100)*.18);if(y<shore(x)+14)continue;
  ctx.fillStyle=`rgba(92,77,53,${.04+random(i+2700)*.07})`;ctx.fillRect(x,y,1,1);
 }
 drawLighthouse();
 drawLighthouseWalkway(ctx,{w,h,mix});
 drawSeaLionRock(ctx,{w,h,time,night,mix});
 drawRain(horizon);
}
