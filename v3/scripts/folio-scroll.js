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
  if(index===current)return;current=index;
  intro.inert=index>=0;intro.setAttribute('aria-hidden',String(index>=0));
  cover.querySelector('.cover-front').setAttribute('aria-hidden',String(index>=0));
  leaves.forEach((leaf,i)=>{
    leaf.inert=i!==index;leaf.setAttribute('aria-hidden',String(i!==index));
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
  const {gsap,ScrollTrigger}=window;gsap.registerPlugin(ScrollTrigger);
  const events=new AbortController();let timeline,trigger,lenis,closed=false,resizeHold=null,resizeTimer=0,restoreFrame=0,layoutWidth=innerWidth,layoutHeight=innerHeight;
  const savedStyle=new Map([camera,volume,intro,cover,caption,...leaves,...document.querySelectorAll('.page-turn-shade')].map(element=>[element,element.getAttribute('style')]));
  document.body.classList.add('scroll-book-ready');current=-2;
  function makeTimeline(){
    timeline?.kill();
    const phone=innerWidth<=700;
    gsap.set(camera,{x:0,xPercent:phone?-75:-50,yPercent:-50,y:innerHeight*(phone?.065:.015)});
    gsap.set(volume,{x:phone?innerWidth*.11:0,scale:phone?.74:1,rotationX:phone?8:9,rotationY:phone?-14:-24,rotationZ:phone?-5:-8});
    gsap.set(intro,{opacity:1,y:0});
    gsap.set(caption,{opacity:0});
    const sheets=[cover,...leaves];
    sheets.forEach((sheet,i)=>gsap.set(sheet,{rotationY:0,rotationZ:0,skewY:0,z:12-i*3}));
    gsap.set('.page-turn-shade',{opacity:0,xPercent:0});
    timeline=gsap.timeline({paused:true,defaults:{ease:'none'}});
    timeline.to(camera,{y:innerHeight*(phone?-.03:0),duration:.20},.015)
      .to(volume,{x:0,scale:1,rotationX:phone?3:6,rotationY:0,rotationZ:0,duration:.20},.015)
      .to(intro,{opacity:0,y:-18,duration:.10},.035)
      .to(caption,{opacity:1,duration:.055},.15);
    const flips=[sequence.open,...sequence.turns];
    flips.forEach(([start,end],i)=>{
      const sheet=sheets[i],duration=end-start,shade=sheet.querySelectorAll('.page-turn-shade');
      timeline.to(sheet,{rotationY:-179.65,z:-3+i,duration},start)
        .to(sheet,{skewY:-2.4,rotationZ:.7,duration:duration/2},start)
        .to(sheet,{skewY:0,rotationZ:0,duration:duration/2},start+duration/2)
        .to(shade,{opacity:.7,xPercent:-20,duration:duration/2},start)
        .to(shade,{opacity:0,xPercent:10,duration:duration/2},start+duration/2);
    });
    // End with a generous reading hold on Afterlight before releasing the stage.
    timeline.to({hold:0},{hold:1,duration:.125},.875);
    timeline.progress(progress);
  }
  function scheduleResize(){
    if(progress>0&&progress<1)resizeHold??=progress;
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      if(closed)return;
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
      });
    },320);
  }
  function render(value){
    // Hold the authored page position while responsive measurements settle.
    if(layoutWidth!==innerWidth||layoutHeight!==innerHeight){scheduleResize();return;}
    if(resizeHold!==null)return;
    progress=Math.min(1,Math.max(0,value));timeline?.progress(progress);access(pageAt(progress));
    section.dataset.progress=progress.toFixed(3);
  }
  makeTimeline();
  if(window.Lenis){
    // Page anchors target authored reading stops, not the transformed sheet's
    // current DOM bounds. A second automatic anchor handler would override them.
    lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false,anchors:false});lenis.on('scroll',ScrollTrigger.update);
  }
  const tick=time=>{if(!closed&&!document.hidden)lenis?.raf(time*1000);};gsap.ticker.add(tick);
  trigger=ScrollTrigger.create({trigger:section,start:'top top',end:'bottom bottom',invalidateOnRefresh:true,onUpdate:self=>render(self.progress),onRefresh:self=>render(self.progress)});
  const refresh=()=>{
    layoutWidth=innerWidth;layoutHeight=innerHeight;makeTimeline();
  };
  ScrollTrigger.addEventListener('refreshInit',refresh);
  window.addEventListener('resize',scheduleResize,{signal:events.signal});
  goTo=(target,instant=false)=>{
    if(lenis)lenis.scrollTo(target,{immediate:instant,duration:1.25});
    else {const y=typeof target==='number'?target:document.querySelector(target).getBoundingClientRect().top+scrollY;window.scrollTo({top:y,behavior:instant?'instant':'smooth'});}
  };
  navigate=(index,instant=false)=>goTo(trigger.start+(trigger.end-trigger.start)*sequence.read[index],instant);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)lenis?.stop();else lenis?.start();},{signal:events.signal});
  cleanup=()=>{
    closed=true;events.abort();clearTimeout(resizeTimer);cancelAnimationFrame(restoreFrame);gsap.ticker.remove(tick);ScrollTrigger.removeEventListener('refreshInit',refresh);trigger?.kill();timeline?.kill();lenis?.destroy();
    document.body.classList.remove('scroll-book-ready');
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
document.addEventListener('keydown',event=>{
  if(parent===window||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable||event.metaKey||event.ctrlKey||event.altKey)return;
  if(/^[1-6]$/.test(event.key)||['ArrowLeft','ArrowRight','r','R'].includes(event.key)){event.preventDefault();parent.postMessage({type:'prototype-key',key:event.key},location.origin);}
},{signal:lifetime.signal});
window.addEventListener('pagehide',()=>{generation++;cleanup();lifetime.abort();},{once:true});
configure();
