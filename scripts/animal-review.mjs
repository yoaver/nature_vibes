// Browser-only review board, injected by capture-preview; never shipped to the site.
export async function maleSeaLionReview() {
 const {drawSeaLionModel}=await import('/assets/scenes/bay/wildlife.js');
 const c=document.createElement('canvas');c.width=1400;c.height=940;
 c.style.cssText='position:fixed;left:20px;top:20px;width:1400px;height:940px;z-index:40';document.body.append(c);
 const ctx=c.getContext('2d');ctx.fillStyle='#c7ccba';ctx.fillRect(0,0,c.width,c.height);
 ['resting','sitting','standing','shuffle','low-pull'].forEach((pose,row)=>{
  ctx.fillStyle='#263b37';ctx.font='18px sans-serif';ctx.fillText(`Adult male — ${pose}`,18,30+row*184);
  for(let col=0;col<4;col++) {
   ctx.save();ctx.translate(200+col*315,155+row*184);ctx.scale(3,3);
   drawSeaLionModel(ctx,{pose:row>2?'walking':pose,male:2,time:col*7,phase:col/4,style:row>2?pose:'shuffle'});
   ctx.restore();
  }
 });
}
export async function animalReview({silhouette=false}={}) {
 const {sebaBatArt}=await import('/assets/scenes/jungle/bat-models.js');
 const board=document.createElement('div');board.id='animal-review';
 board.style.cssText='position:fixed;inset:18px;z-index:40;background:#d9dacb;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:230px;gap:8px;padding:10px;color:#243b35;font:15px system-ui;overflow:hidden';
 document.body.append(board);
 const add=(label,selector,custom)=>{
  const tile=document.createElement('div');tile.style.cssText='position:relative;background:#c4c9b7;overflow:hidden;border-radius:6px';
  const title=document.createElement('div');title.textContent=label;title.style.cssText='position:absolute;top:8px;left:10px;z-index:3';tile.append(title);board.append(tile);
  const source=selector?document.querySelector(selector):null;
  if(!source&&!custom){tile.append('Model missing');return;}
  const clone=source?source.cloneNode(true):document.createElement('div');
  if(source) {
   const originals=[source,...source.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
   originals.forEach((node,i)=>{
    const style=getComputedStyle(node);
    for(const property of style)copies[i].style.setProperty(property,style.getPropertyValue(property));
    copies[i].style.animation='none';copies[i].style.transition='none';
   });
  } else {clone.innerHTML=custom;clone.style.width='160px';clone.style.height='100px';const svg=clone.querySelector('svg');if(svg){svg.style.width='100%';svg.style.height='100%';}}
  const width=source?.offsetWidth||160,height=source?.offsetHeight||100,scale=Math.min(260/width,155/height);
  Object.assign(clone.style,{position:'absolute',left:'50%',top:'56%',right:'auto',bottom:'auto',margin:'0',width:`${width}px`,height:`${height}px`,transform:`translate(-50%,-50%) scale(${scale})`,transformOrigin:'center',filter:silhouette?'brightness(0)':'none',visibility:'visible',opacity:'1',display:'block',pointerEvents:'none'});
  tile.append(clone);
 };
 add('Capybara — adult','.river-capybara:not(.baby)');
 add('Capybara — young','.river-capybara.baby');
 add('Spectacled caiman — bank','.river-caiman:not(.water-caiman-bank)');
 add('Spectacled caiman — swimming','.submerged-caiman');
 add('Squirrel monkey — walking','.capuchin-monkey[data-pose=walk]');
 add('Squirrel monkey — hanging','.capuchin-monkey[data-pose=hang]');
 add('Scarlet macaw','.perched-macaw.scarlet');
 add('Hyacinth macaw','.perched-macaw.hyacinth');
 add('Toco toucan','.toucan-roost[data-active=true]');
 add('Three-banded armadillo','.armadillo');
 add('Seba’s short-tailed bat',null,sebaBatArt);
 add('Morpho butterfly',null,document.querySelector('.morpho-butterfly').innerHTML);
 board.querySelectorAll('.morpho-wing').forEach(wing=>{wing.style.animation='none';wing.style.transform='none';});
}
