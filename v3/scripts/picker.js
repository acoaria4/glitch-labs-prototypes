// Existing query indices are stable; new Orbit treatments are appended.
const variants=[
  {group:'portal',name:'Landscape',file:'portal'},
  {group:'signal',name:'Red',file:'signal'},
  {group:'orbit',name:'Cobalt',file:'orbit'},
  {group:'signal',name:'Titanium',file:'signal-titanium'},
  {group:'orbit',name:'Gallery',file:'orbit-gallery'},
  {group:'signal',name:'Warm Ivory',file:'signal-ivory'},
  {group:'signal',name:'Deep Plum',file:'signal-plum'},
  {group:'signal',name:'Acid Yellow',file:'signal-acid'},
  {group:'orbit',name:'Midnight',file:'orbit-midnight'},
  {group:'orbit',name:'Dark Gallery',file:'orbit-gallery-dark'},
  {group:'studies',name:'Nocturne',file:'nocturne'},
  {group:'studies',name:'Folio',file:'folio'},
  {group:'studies',name:'Chroma',file:'chroma'},
  {group:'studies',name:'Nocturne / 3D',file:'nocturne-3d'},
  {group:'studies',name:'Folio / 3D',file:'folio-3d'},
  {group:'studies',name:'Chroma / Studio 3D',file:'chroma-studio'},
  {group:'portal',name:'Sculpted / 3D',file:'portal-3d'},
  {group:'orbit',name:'Cobalt / Sculpture',file:'orbit-sculpture'},
  {group:'orbit',name:'Midnight / Sculpture',file:'orbit-midnight-sculpture'},
  {group:'orbit',name:'Gallery / Sculpture',file:'orbit-gallery-sculpture'},
  {group:'orbit',name:'Dark Gallery / Sculpture',file:'orbit-gallery-dark-sculpture'},
  {group:'portal',name:'Warm Metal',file:'portal-atelier'},
  {group:'studies',name:'Nocturne / Burnished',file:'nocturne-atelier'},
  {group:'studies',name:'Folio / Print & Foil',file:'folio-print'},
  {group:'studies',name:'Chroma / Cast Glass',file:'chroma-glass'}
];
const titles={portal:'Portal',signal:'Signal',orbit:'Orbit',studies:'New studies'};
const remembered={portal:21,signal:1,orbit:17,studies:22};
const stage=document.getElementById('stage');
const picker=document.querySelector('.proto-picker');
const groups=[...picker.querySelectorAll('[data-group]')];
const select=picker.querySelector('select');
const label=picker.querySelector('.proto-variant-label');
let current=0,pending=0;
function mount(){
  cancelAnimationFrame(pending);stage.replaceChildren();
  const item=variants[current];
  pending=requestAnimationFrame(()=>{
    const frame=document.createElement('iframe');frame.src=`prototypes/${item.file}.html`;
    frame.title=`${titles[item.group]} / ${item.name}`;stage.replaceChildren(frame);
  });
}
function setActive(index){
  if(!Number.isInteger(index)||index<0||index>=variants.length)return;
  current=index;const item=variants[index];remembered[item.group]=index;picker.dataset.group=item.group;
  groups.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.group===item.group)));
  const options=variants.flatMap((variant,i)=>variant.group===item.group?[new Option(variant.name,String(i))]:[]);
  select.replaceChildren(...options);select.value=String(index);
  select.setAttribute('aria-label',`${titles[item.group]} variant`);
  label.hidden=options.length===1;picker.dataset.single=String(options.length===1);
  const url=new URL(location);url.searchParams.set('v',index+1);history.replaceState(null,'',url);mount();
}
function cycle(direction){
  const family=variants.flatMap((variant,index)=>variant.group===variants[current].group?[index]:[]);
  if(family.length>1)setActive(family[(family.indexOf(current)+direction+family.length)%family.length]);
}
function shortcut(key){
  if(/^[0-9]$/.test(key))setActive(key==='0'?9:Number(key)-1);
  else if(key==='ArrowRight')cycle(1);
  else if(key==='ArrowLeft')cycle(-1);
  else if(key.toLowerCase()==='r')mount();
}
groups.forEach(button=>button.addEventListener('click',()=>setActive(remembered[button.dataset.group])));
select.addEventListener('change',()=>setActive(Number(select.value)));
picker.querySelector('.proto-picker-replay').addEventListener('click',mount);
document.addEventListener('keydown',event=>{
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable||event.metaKey||event.ctrlKey||event.altKey)return;
  if(/^[0-9]$/.test(event.key)||['ArrowLeft','ArrowRight','r','R'].includes(event.key)){event.preventDefault();shortcut(event.key);}
});
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==stage.querySelector('iframe')?.contentWindow||event.data?.type!=='prototype-key'||typeof event.data.key!=='string')return;
  shortcut(event.data.key);
});
const requested=Number(new URLSearchParams(location.search).get('v'));
setActive(Number.isInteger(requested)&&requested>=1&&requested<=variants.length?requested-1:17);
