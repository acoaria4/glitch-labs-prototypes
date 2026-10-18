// Stable query indices include eight archived treatments; the main picker shows current styles only.
const variants=[
  {group:'portal',name:'Landscape',file:'portal'},
  {group:'signal',name:'Red',file:'signal'},
  {group:'orbit',name:'Cobalt / Earlier 3D',file:'orbit',archived:true},
  {group:'signal',name:'Titanium',file:'signal-titanium'},
  {group:'orbit',name:'Gallery / Earlier 3D',file:'orbit-gallery',archived:true},
  {group:'signal',name:'Warm Ivory',file:'signal-ivory'},
  {group:'signal',name:'Deep Plum',file:'signal-plum'},
  {group:'signal',name:'Acid Yellow',file:'signal-acid'},
  {group:'orbit',name:'Midnight / Earlier 3D',file:'orbit-midnight',archived:true},
  {group:'orbit',name:'Dark Gallery / Earlier 3D',file:'orbit-gallery-dark',archived:true},
  {group:'nocturne',name:'Original artwork',file:'nocturne'},
  {group:'folio',name:'Original print',file:'folio'},
  {group:'chroma',name:'Glass loops',file:'chroma'},
  {group:'nocturne',name:'Earlier 3D',file:'nocturne-3d',archived:true},
  {group:'folio',name:'Earlier 3D',file:'folio-3d',archived:true},
  {group:'chroma',name:'Earlier studio metal',file:'chroma-studio',archived:true},
  {group:'portal',name:'Earlier 3D',file:'portal-3d',archived:true},
  {group:'orbit',name:'Cobalt',file:'orbit-sculpture'},
  {group:'orbit',name:'Midnight',file:'orbit-midnight-sculpture'},
  {group:'orbit',name:'Gallery',file:'orbit-gallery-sculpture'},
  {group:'orbit',name:'Dark Gallery',file:'orbit-gallery-dark-sculpture'},
  {group:'portal',name:'Warm Metal',file:'portal-atelier'},
  {group:'nocturne',name:'Burnished metal',file:'nocturne-atelier'},
  {group:'folio',name:'Print & foil',file:'folio-print'},
  {group:'chroma',name:'Cast glass',file:'chroma-glass'}
];
const titles={portal:'Portal',signal:'Signal',orbit:'Orbit',nocturne:'Nocturne',folio:'Folio',chroma:'Chroma'};
const remembered={portal:21,signal:1,orbit:17,nocturne:22,folio:23,chroma:24};
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
  current=index;const item=variants[index];if(!item.archived)remembered[item.group]=index;picker.dataset.group=item.group;
  groups.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.group===item.group)));
  const options=variants.flatMap((variant,i)=>variant.group===item.group&&!variant.archived?[new Option(variant.name,String(i))]:[]);
  // An old link remains usable without returning superseded drafts to the menu.
  if(item.archived){const draft=document.createElement('optgroup');draft.label='Archived draft';draft.append(new Option(item.name,String(index)));options.push(draft);}
  select.replaceChildren(...options);select.value=String(index);
  select.setAttribute('aria-label',`${titles[item.group]} style`);
  label.hidden=options.length===1;picker.dataset.single=String(options.length===1);
  const url=new URL(location);url.searchParams.set('v',index+1);history.replaceState(null,'',url);mount();
}
function cycle(direction){
  const family=variants.flatMap((variant,index)=>variant.group===variants[current].group&&!variant.archived?[index]:[]);
  const position=family.indexOf(current);
  if(family.length)setActive(position<0?family[direction>0?0:family.length-1]:family[(position+direction+family.length)%family.length]);
}
function shortcut(key){
  if(/^[1-6]$/.test(key))setActive(remembered[groups[Number(key)-1].dataset.group]);
  else if(key==='ArrowRight')cycle(1);
  else if(key==='ArrowLeft')cycle(-1);
  else if(key.toLowerCase()==='r')mount();
}
groups.forEach((button,index)=>{button.setAttribute('aria-keyshortcuts',String(index+1));button.addEventListener('click',()=>setActive(remembered[button.dataset.group]));});
select.addEventListener('change',()=>setActive(Number(select.value)));
picker.querySelector('.proto-picker-replay').addEventListener('click',mount);
document.addEventListener('keydown',event=>{
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable||event.metaKey||event.ctrlKey||event.altKey)return;
  if(/^[1-6]$/.test(event.key)||['ArrowLeft','ArrowRight','r','R'].includes(event.key)){event.preventDefault();shortcut(event.key);}
});
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==stage.querySelector('iframe')?.contentWindow||event.data?.type!=='prototype-key'||typeof event.data.key!=='string')return;
  shortcut(event.data.key);
});
const requested=Number(new URLSearchParams(location.search).get('v'));
setActive(Number.isInteger(requested)&&requested>=1&&requested<=variants.length?requested-1:17);
