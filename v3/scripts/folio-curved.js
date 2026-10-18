import {createCurvedBook} from './folio-paper.js?v=folio-large-3';
const section=document.querySelector('.folio-sequence');
const camera=document.querySelector('.folio-camera');
const volume=document.querySelector('.folio-volume');
const intro=document.querySelector('.folio-intro');
const cover=document.querySelector('.cover-sheet');
const leaves=[...document.querySelectorAll('.entity-sheet')];
const links=[...document.querySelectorAll('[data-page-jump]')];
const caption=document.querySelector('.folio-caption');
const control=document.querySelector('.motion-control');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const lifetime=new AbortController();
const names=['Expenses','AURA','Lumen','Afterlight'];
const sequence={open:[.025,.20],turns:[[.355,.435],[.575,.655],[.795,.875]],read:[.27,.49,.71,.95],stops:[.18,.405,.625,.845]};
let wanted=true,cleanup=()=>{},navigate=null,goTo=null,generation=0,current=-1,progress=0;
try{wanted=localStorage.getItem('glitch-v3-round02-motion')!=='off';}catch{}
const moving=()=>wanted&&!reduce.matches;

function pageAt(value){
  let index=-1;sequence.stops.forEach((stop,i)=>{if(value>=stop)index=i;});return index;
}
function access(index){
  const settled=document.querySelector('.folio-stage').dataset.paperState!=='turning';
  leaves.forEach((leaf,i)=>{leaf.inert=i!==index||!settled;});
  if(index===current)return;current=index;
  intro.inert=index>=0;intro.setAttribute('aria-hidden',String(index>=0));
  cover.querySelector('.cover-front').setAttribute('aria-hidden',String(index>=0));
  leaves.forEach((leaf,i)=>{
    leaf.inert=i!==index||!settled;leaf.setAttribute('aria-hidden',String(i!==index));
    if(i===index)links[i].setAttribute('aria-current','page');else links[i].removeAttribute('aria-current');
  });
  caption.textContent=index<0?'The cover / Four projects within':`0${index+1} / 04 — ${names[index]}${index===2?' · Coming soon':index===3?' · In development':''}`;
  section.dataset.page=index<0?'cover':names[index].toLowerCase();
}

async function configure(restore=false){
  const ticket=++generation;
  const enhanced=document.body.classList.contains('scroll-book-ready');
  const visiblePages=leaves.map((leaf,index)=>{const rect=leaf.getBoundingClientRect();return {index,rect,distance:Math.abs((rect.top+rect.bottom)/2-innerHeight*.5)};}).filter(({rect})=>rect.top<innerHeight*.8&&rect.bottom>110).sort((a,b)=>a.distance-b.distance);
  const visiblePage=visiblePages[0]?.index??-1;
  const wasReading=restore&&(enhanced?progress>=sequence.stops[0]:visiblePage>=0)&&section.getBoundingClientRect().bottom>0&&section.getBoundingClientRect().top<innerHeight;
  const selected=enhanced?Math.max(0,current):Math.max(0,visiblePage);
  cleanup();cleanup=()=>{};navigate=null;goTo=null;
  control.hidden=false;control.disabled=reduce.matches;
  control.textContent=reduce.matches?'Motion reduced':wanted?'Motion on':'Motion off';control.setAttribute('aria-pressed',String(!moving()));
  if(!moving()||!window.gsap||!window.ScrollTrigger){
    if(wasReading)leaves[selected].scrollIntoView({block:'center',behavior:'instant'});
    return;
  }
  await document.fonts.ready;
  if(ticket!==generation||!moving()||lifetime.signal.aborted)return;
  const {gsap,ScrollTrigger}=window;gsap.registerPlugin(ScrollTrigger);gsap.ticker.lagSmoothing(0);
  const events=new AbortController();let timeline,trigger,lenis,closed=false,navigating=false,navigationTarget=null,resizeHold=null,resizeTimer=0,restoreFrame=0,layoutWidth=innerWidth,layoutHeight=innerHeight;
  const savedStyle=new Map([camera,volume,intro,cover,caption,...leaves,...document.querySelectorAll('.page-turn-shade')].map(element=>[element,element.getAttribute('style')]));
  let book;
  try{book=await createCurvedBook(document.querySelector('.folio-stage'),events.signal);}catch(error){events.abort();control.textContent='Static view';control.disabled=true;return;}
  if(ticket!==generation||!moving()||lifetime.signal.aborted){book.dispose();events.abort();return;}
  document.body.classList.add('scroll-book-ready','curved-ready');current=-2;
  function makeTimeline(){
    timeline?.kill();
    book.resize();
    gsap.set(intro,{opacity:1,y:0});gsap.set(caption,{opacity:0});
    timeline=gsap.timeline({paused:true,defaults:{ease:'none'}});
    timeline.to(intro,{opacity:0,y:-18,duration:.10},.035)
      .to(caption,{opacity:1,duration:.055},.15)
      .to({hold:0},{hold:1,duration:.795},.205);
    timeline.progress(progress);
  }
  function scheduleResize(){
    if(!navigating&&progress>0&&progress<1)resizeHold??=progress;
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      resizeTimer=0;if(closed)return;
      const value=resizeHold;
      ScrollTrigger.refresh();
      cancelAnimationFrame(restoreFrame);
      restoreFrame=requestAnimationFrame(()=>{
        if(closed)return;
        lenis?.resize();
        if(value!==null){
          const y=trigger.start+(trigger.end-trigger.start)*value;
          lenis?.scrollTo(y,{immediate:true,force:true});
          window.scrollTo({top:y,behavior:'instant'});
        }
        resizeHold=null;ScrollTrigger.update();render(value??trigger.progress);
        section.dataset.viewport=layoutWidth+'x'+layoutHeight;
        // Lenis refreshes its dimensions during a viewport change. Continue an
        // explicit chapter jump if that refresh interrupted the smooth scroll.
        if(navigating&&navigationTarget&&lenis){
          const {target,ratio}=navigationTarget;
          lenis.scrollTo(ratio===null?target:trigger.start+(trigger.end-trigger.start)*ratio,{duration:.8,onComplete:()=>{navigating=false;navigationTarget=null;}});
        }
      });
    },320);
  }
  function render(value){
    // Hold the authored page position while responsive measurements settle.
    if(layoutWidth!==innerWidth||layoutHeight!==innerHeight){scheduleResize();return;}
    if(resizeHold!==null)return;
    progress=Math.min(1,Math.max(0,value));timeline?.progress(progress);book.setProgress(progress);access(pageAt(progress));
    section.dataset.progress=progress.toFixed(3);
  }
  makeTimeline();
  if(window.Lenis){
    // Page anchors target authored reading stops, not the transformed sheet's
    // current DOM bounds. A second automatic anchor handler would override them.
    lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false,anchors:false});lenis.on('scroll',ScrollTrigger.update);
    lenis.on('virtual-scroll',()=>{navigating=false;navigationTarget=null;});
  }
  const tick=time=>{if(!closed&&!document.hidden){lenis?.raf(time*1000);book.draw();}};gsap.ticker.add(tick);
  trigger=ScrollTrigger.create({trigger:section,start:'top top',end:'bottom bottom',invalidateOnRefresh:true,onUpdate:self=>render(self.progress),onRefresh:self=>render(self.progress)});
  const refresh=()=>{
    layoutWidth=innerWidth;layoutHeight=innerHeight;makeTimeline();
  };
  ScrollTrigger.addEventListener('refreshInit',refresh);
  window.addEventListener('resize',scheduleResize,{signal:events.signal});
  function settleLayout(){
    if(!resizeTimer&&resizeHold===null&&layoutWidth===innerWidth&&layoutHeight===innerHeight)return;
    clearTimeout(resizeTimer);cancelAnimationFrame(restoreFrame);resizeTimer=0;resizeHold=null;
    ScrollTrigger.refresh();lenis?.resize();
  }
  goTo=(target,instant=false)=>{
    settleLayout();
    if(lenis){
      navigating=!instant;navigationTarget={target,ratio:typeof target==='number'?(target-trigger.start)/(trigger.end-trigger.start):null};
      lenis.scrollTo(target,{immediate:instant,duration:1.25,onComplete:()=>{navigating=false;navigationTarget=null;}});
    }
    else {const y=typeof target==='number'?target:document.querySelector(target).getBoundingClientRect().top+scrollY;window.scrollTo({top:y,behavior:instant?'instant':'smooth'});}
  };
  navigate=(index,instant=false)=>{settleLayout();goTo(trigger.start+(trigger.end-trigger.start)*sequence.read[index],instant);};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)lenis?.stop();else lenis?.start();},{signal:events.signal});
  cleanup=()=>{
    closed=true;events.abort();clearTimeout(resizeTimer);cancelAnimationFrame(restoreFrame);gsap.ticker.remove(tick);ScrollTrigger.removeEventListener('refreshInit',refresh);trigger?.kill();timeline?.kill();lenis?.destroy();
    book.dispose();document.body.classList.remove('scroll-book-ready','curved-ready');
    savedStyle.forEach((style,element)=>{if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);});
    [intro,...leaves].forEach(element=>{element.inert=false;element.removeAttribute('aria-hidden');});
    cover.querySelector('.cover-front').removeAttribute('aria-hidden');links.forEach(link=>link.removeAttribute('aria-current'));
    caption.textContent='The cover / Four projects within';delete section.dataset.page;delete section.dataset.progress;delete section.dataset.viewport;
  };
  ScrollTrigger.refresh();render(trigger.progress);section.dataset.viewport=layoutWidth+'x'+layoutHeight;
  const hashIndex=leaves.findIndex(leaf=>'#'+leaf.id===location.hash);
  if(wasReading)navigate(selected,true);else if(hashIndex>=0)navigate(hashIndex,true);
}

links.forEach((link,index)=>link.addEventListener('click',event=>{
  if(!navigate)return;event.preventDefault();history.replaceState(null,'',link.getAttribute('href'));navigate(index);
},{signal:lifetime.signal}));
document.querySelectorAll('[data-open-book]').forEach(link=>link.addEventListener('click',event=>{if(navigate){event.preventDefault();navigate(0);}},{signal:lifetime.signal}));
document.querySelector('.skip').addEventListener('click',event=>{if(navigate){event.preventDefault();navigate(0);}},{signal:lifetime.signal});
document.querySelectorAll('a[href="#home"],a[href="#studio"]').forEach(link=>link.addEventListener('click',event=>{if(goTo){event.preventDefault();history.replaceState(null,'',link.getAttribute('href'));goTo(link.getAttribute('href'));}},{signal:lifetime.signal}));
control.addEventListener('click',()=>{wanted=!wanted;try{localStorage.setItem('glitch-v3-round02-motion',wanted?'on':'off');}catch{}configure(true);},{signal:lifetime.signal});
reduce.addEventListener('change',()=>configure(true),{signal:lifetime.signal});
document.addEventListener('folio-render-unavailable',()=>{wanted=false;configure(true);},{signal:lifetime.signal});
document.addEventListener('keydown',event=>{
  if(parent===window||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable||event.metaKey||event.ctrlKey||event.altKey)return;
  if(/^[1-6]$/.test(event.key)||['ArrowLeft','ArrowRight','r','R'].includes(event.key)){event.preventDefault();parent.postMessage({type:'prototype-key',key:event.key},location.origin);}
},{signal:lifetime.signal});
window.addEventListener('pagehide',()=>{generation++;cleanup();lifetime.abort();},{once:true});
configure();
