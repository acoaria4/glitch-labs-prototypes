import * as THREE from '../vendor/three.module.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';

const edition=document.body.dataset.edition;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const control=document.querySelector('.motion-control');
const lifetime=new AbortController();
let wanted=true,cleanup=()=>{},bookTween=null,generation=0;
try{wanted=localStorage.getItem('glitch-v3-round02-motion')!=='off';}catch{}
const moving=()=>wanted&&!reduce.matches;

function roundedPath(width,height,radius){
  const shape=new THREE.Shape(),x=-width/2,y=-height/2,w=width,h=height,r=radius;
  shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
  shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
  shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);return shape;
}
function frameGeometry(w,h,r,edge,depth,bevel){
  const shape=roundedPath(w,h,r);
  const inner=roundedPath(w-edge*2,h-edge*2,Math.max(.01,r-edge));
  shape.holes.push(new THREE.Path(inner.getPoints(40).reverse()));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,steps:1,bevelSegments:3,bevelSize:bevel,bevelThickness:bevel,curveSegments:32});
  geometry.translate(0,0,-depth/2);return geometry;
}
function addMesh(parent,geometry,material,x=0,y=0,z=0){
  const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;
}

function buildNocturne(scene){
  const group=new THREE.Group();scene.add(group);
  const black=new THREE.MeshStandardMaterial({color:'#111310',metalness:.6,roughness:.32,envMapIntensity:.65});
  const silver=new THREE.MeshStandardMaterial({color:'#b9b7ad',metalness:1,roughness:.27,envMapIntensity:1.4});
  const brass=new THREE.MeshStandardMaterial({color:'#807052',metalness:.95,roughness:.27,envMapIntensity:1});
  addMesh(group,new RoundedBoxGeometry(7.2,7.2,.44,5,.46),black,0,0,-.32);
  addMesh(group,frameGeometry(6.55,6.55,.95,.085,.14,.035),silver,0,0,.01);
  addMesh(group,frameGeometry(7.12,7.12,.5,.018,.28,.012),brass,0,0,-.31);
  const profile=[new THREE.Vector2(0,-.12),new THREE.Vector2(.16,-.12),new THREE.Vector2(.19,-.075),new THREE.Vector2(.19,.08),new THREE.Vector2(.145,.14),new THREE.Vector2(0,.145)];
  const studGeometry=new THREE.LatheGeometry(profile,32);studGeometry.rotateX(Math.PI/2);
  const studs=[];
  for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){
    if(Math.abs(x)>[0,2,3,3,3,2,0][y+3])continue;
    const size=.45+Math.max(0,1-Math.sqrt(x*x+y*y)/3.3)*.9+(x===0||y===0?.3:0);
    const stud=addMesh(group,studGeometry,silver,x*.72,y*.72,.18);
    stud.scale.set(size,size,size);stud.userData.phase=(x+y)*.5;studs.push(stud);
  }
  const key=new THREE.DirectionalLight('#ffe0ac',5.5);key.position.set(-5,7,8);scene.add(key);
  const rim=new THREE.DirectionalLight('#e1e7f5',3);rim.position.set(6,2,1);scene.add(rim);
  scene.add(new THREE.HemisphereLight('#f6ead4','#080909',.35));
  let lightTarget=0,lightCurrent=0;
  return {group,
    action(){lightTarget+=Math.PI*.72;},
    update(time,dt,pointer,scroll,phone){
      lightCurrent=THREE.MathUtils.damp(lightCurrent,lightTarget,3,dt);
      key.position.set(-5+Math.sin(lightCurrent+time*.12)*7,6+Math.cos(lightCurrent)*2,7);
      rim.intensity=2.4+Math.sin(lightCurrent)*.7;
      group.rotation.set(-.1+pointer.y*.07,-.48+pointer.x*.15+scroll*.3,-.2+Math.sin(time*.15)*.025);
      group.position.set(phone?0:3.7,phone?-2.8:-.15-scroll*.8,0);
      group.scale.setScalar(phone?.48:1);
      studs.forEach(stud=>{stud.position.z=.18+scroll*.75*(1+Math.sin(stud.userData.phase+time*.4)*.15);});
    }
  };
}

function buildChroma(scene){
  const group=new THREE.Group();scene.add(group);
  const back=new THREE.ShaderMaterial({depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;void main(){vec3 c=vec3(.824,.855,.881);float a=exp(-14.*length(vUv-vec2(.68,.58)));float b=exp(-12.*length(vUv-vec2(.4,.38)));c+=vec3(.08,-.025,.07)*a+vec3(-.03,.075,-.015)*b;gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'});
  // A real background inside the transmission pass gives the glass something
  // to refract. Its neutral edge matches the surrounding pearl page.
  addMesh(scene,new THREE.PlaneGeometry(65,44),back,0,0,-10);
  const mint=new THREE.MeshPhysicalMaterial({color:'#effff9',metalness:0,roughness:.055,transmission:1,thickness:1.8,attenuationColor:'#58a895',attenuationDistance:1.1,ior:1.5,iridescence:.65,iridescenceIOR:1.3,iridescenceThicknessRange:[180,440],clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.8});
  const violet=mint.clone();violet.color.set('#f0eaff');violet.attenuationColor.set('#7651c2');violet.attenuationDistance=.85;violet.thickness=1.8;
  const clear=mint.clone();clear.color.set('#ffffff');clear.attenuationColor.set('#a1b4be');clear.attenuationDistance=1.8;clear.iridescence=1;clear.thickness=.7;
  const one=addMesh(group,frameGeometry(4.3,6.1,1.9,.69,.7,.18),mint,-.5,.1,0);
  one.rotation.set(.08,.25,.52);
  const two=addMesh(group,frameGeometry(4.1,5.7,1.7,.63,.7,.18),violet,1.3,-.2,-.6);
  two.rotation.set(-.12,-.85,-.6);
  const three=addMesh(group,frameGeometry(3.8,5.1,1.55,.42,.52,.14),clear,-1.25,-.1,.2);
  three.rotation.set(.1,.75,-.42);
  const key=new THREE.DirectionalLight('#ffffff',3);key.position.set(-3,7,10);scene.add(key);
  const side=new THREE.DirectionalLight('#e3d7ff',2);side.position.set(7,1,3);scene.add(side);
  scene.add(new THREE.HemisphereLight('#ffffff','#a5b6ae',1.5));
  let target=0,turn=0;
  return {group,
    action(){target+=Math.PI*.55;},
    update(time,dt,pointer,scroll,phone){
      turn=THREE.MathUtils.damp(turn,target,3,dt);
      group.position.set(phone?0:2.8,phone?-2.7:-1.3-scroll*.6,0);
      group.scale.setScalar(phone?.5:1.03);
      group.rotation.set(-.1+pointer.y*.09,.12+pointer.x*.2+turn+scroll*.65,-.08+Math.sin(time*.15)*.025);
      one.position.x=-.5-scroll*.4;two.position.x=1.3+scroll*.6;
      three.rotation.y=.75+Math.sin(time*.2)*.08;
    }
  };
}

function setupScene(signal,onTick){
  const canvas=document.querySelector('.hero-canvas');
  if(!canvas)return ()=>{};
  let renderer,scene,target,observer,visibility,part;
  const note=document.querySelector('.render-note');
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000,0);scene=new THREE.Scene();
    const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    if(edition==='chroma'){
      // Negative fill cards produce dark optical edges beside the softboxes.
      const card=new THREE.MeshBasicMaterial({color:'#07131c',side:THREE.DoubleSide});
      const left=addMesh(room,new THREE.PlaneGeometry(8,25),card,-7,5,2);left.rotation.y=Math.PI/2;
      const right=addMesh(room,new THREE.PlaneGeometry(5,22),card,8,4,0);right.rotation.y=-Math.PI/2;
    }
    target=generator.fromScene(room,.04);scene.environment=target.texture;generator.dispose();room.dispose();
    const camera=new THREE.PerspectiveCamera(38,1,.5,100);camera.position.set(0,0,18.5);
    part=edition==='nocturne'?buildNocturne(scene):buildChroma(scene);
    const pointer=new THREE.Vector2(),follow=new THREE.Vector2();
    let visible=true,lost=false,phone=innerWidth<700;
    const host=canvas.parentElement;
    function resize(){
      const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
      phone=innerWidth<700;camera.aspect=width/height;
      // Fit narrow phones without shrinking the desktop art direction.
      camera.position.z=phone?Math.max(18.5,4.5/(2*Math.tan(THREE.MathUtils.degToRad(19))*camera.aspect)):18.5;
      camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,phone?1.25:1.5));renderer.setSize(width,height,false);
    }
    observer=new ResizeObserver(resize);observer.observe(host);resize();
    visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'});visibility.observe(host);
    host.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch')return;
      const rect=host.getBoundingClientRect();pointer.set((event.clientX/rect.width-.5)*2,-((event.clientY-rect.top)/rect.height-.5)*2);
    },{signal});
    host.addEventListener('pointerleave',()=>pointer.set(0,0),{signal});
    const action=host.querySelector('[data-scene-action]');
    action.hidden=false;action.addEventListener('click',()=>part.action(),{signal});
    const tick=(time,dt)=>{
      if(!visible||lost||document.hidden)return;
      follow.x=THREE.MathUtils.damp(follow.x,pointer.x,4,dt);follow.y=THREE.MathUtils.damp(follow.y,pointer.y,4,dt);
      const scroll=THREE.MathUtils.clamp(-host.getBoundingClientRect().top/host.clientHeight,0,1);
      part.update(time,dt,follow,scroll,phone);renderer.render(scene,camera);
    };
    onTick(tick);tick(0,1);document.body.classList.add('webgl-ready');note.textContent='';
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;document.body.classList.remove('webgl-ready');action.hidden=true;note.textContent='Still view. Explore the collection below.';},{signal});
  }catch(error){
    document.body.classList.remove('webgl-ready');note.textContent='Still view. Explore the collection below.';
  }
  return ()=>{
    document.body.classList.remove('webgl-ready');
    document.querySelector('[data-scene-action]')?.setAttribute('hidden','');
    observer?.disconnect();visibility?.disconnect();
    if(scene){
      const geometries=new Set(),materials=new Set();
      scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);const list=Array.isArray(object.material)?object.material:[object.material];list.filter(Boolean).forEach(material=>materials.add(material));});
      geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());
    }
    target?.dispose();renderer?.dispose();
  };
}

const leaves=[
 {name:'Expenses',image:'expenses-symbol.svg',heading:'A little less<br>keeping track.',copy:'Personal spending and shared tabs. A clearer picture of where it all goes.',status:'Life, a little clearer.'},
 {name:'AURA',image:'aura-symbol.svg',heading:'A different<br>perspective.',copy:'Vedic charts, Porutham, and the Tamil calendar. A thoughtful space for tradition.',status:'Tradition, thoughtfully presented.'},
 {name:'Lumen',image:'lumen-symbol.svg',heading:'A little more<br>understanding.',copy:'Quiz-based school revision for grades 9–12, with clear explanations and room to grow.',status:'Coming soon'},
 {name:'Afterlight',image:'afterlight-logo.png',heading:'Hold the<br>last light.',copy:'A dark fantasy tower-defense roguelite. Build your defenses as the haunted woodland unfolds.',status:'In development'}
];
function setupBook(){
  const button=document.querySelector('.book-turn');if(!button)return;
  button.hidden=false;
  let index=-1;
  const book=document.querySelector('.book'),cover=book.querySelector('.book-cover'),leaf=book.querySelector('.book-leaf'),counter=document.querySelector('.book-counter');
  function content(i){
    const item=leaves[i];leaf.removeAttribute('aria-hidden');leaf.querySelector('[data-leaf-name]').textContent=`0${i+1} / ${item.name}`;
    const image=leaf.querySelector('.leaf-logo');image.src='../assets/images/'+item.image;image.alt=item.name+' logo';
    leaf.querySelector('.leaf-heading').innerHTML=item.heading;leaf.querySelector('.leaf-description').textContent=item.copy;leaf.querySelector('.leaf-bottom').textContent=item.status;
    counter.textContent=`0${i+1} / 04 — ${item.name}${i===3?' · In development':''}`;
  }
  button.addEventListener('click',()=>{
    bookTween?.kill();index=(index+1)%4;
    const outgoing=index===0&&!cover.hidden?cover:leaf.cloneNode(true);
    if(outgoing!==cover){outgoing.setAttribute('aria-hidden','true');outgoing.classList.add('turning-leaf');outgoing.style.transform='translateZ(2px)';book.append(outgoing);}
    content(index);button.disabled=true;
    button.textContent=index===3?'Back to Expenses ↻':'Turn the page ↗';button.setAttribute('aria-label',index===3?'Turn to Expenses':`Turn to ${leaves[index+1].name}`);
    const done=()=>{if(outgoing===cover)cover.hidden=true;else outgoing.remove();button.disabled=false;};
    if(moving()&&window.gsap){bookTween=gsap.to(outgoing,{rotationY:-153,opacity:0,duration:.95,ease:'power3.inOut',onComplete:done});}
    else done();
  },{signal:lifetime.signal});
}

async function configure(){
  const ticket=++generation;
  cleanup();cleanup=()=>{};
  bookTween?.progress(1);
  const active=moving();control.hidden=false;control.disabled=reduce.matches;
  control.textContent=reduce.matches?'Motion reduced':active?'Motion on':'Motion off';control.setAttribute('aria-pressed',String(!active));
  if(!active)return;
  await document.fonts.ready;
  if(ticket!==generation||!moving()||lifetime.signal.aborted)return;
  const events=new AbortController();let lenis,context,sceneTick=()=>{},disposeScene=()=>{},previous=0,raf=0,closed=false;
  const tick=time=>{
    if(closed||document.hidden){previous=0;return;}
    const dt=Math.min(.05,previous?time-previous:1/60);previous=time;lenis?.raf(time*1000);sceneTick(time,dt);
  };
  if(window.gsap&&window.ScrollTrigger&&window.Lenis){
    gsap.registerPlugin(ScrollTrigger);
    lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false,anchors:true});lenis.on('scroll',ScrollTrigger.update);
    context=gsap.context(()=>{
      gsap.from('.hero-content>.eyebrow,.hero-content>h1,.hero-subtitle,.hero-content>.text-link',{y:26,opacity:0,stagger:.1,duration:1.1,ease:'power3.out',clearProps:'transform,opacity'});
      gsap.utils.toArray('[data-reveal],.work-heading h2,.studio-note h2,.edition-closing h2').forEach(element=>gsap.from(element,{y:35,opacity:0,duration:.9,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:element,start:'top 93%',once:true}}));
      gsap.utils.toArray('[data-art]').forEach(element=>{
        const image=element.querySelector('img');
        gsap.from(image,{y:35,rotation:edition==='folio'?-6:0,scale:.94,duration:1.3,ease:'power3.out',clearProps:'transform',scrollTrigger:{trigger:element,start:'top 90%',once:true}});
      });
      if(edition==='folio')gsap.from('.book',{y:45,rotationZ:-14,opacity:0,duration:1.5,ease:'power3.out',clearProps:'opacity'});
    });
    gsap.ticker.add(tick);
  }else{
    const loop=t=>{tick(t/1000);raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);
  }
  if(edition!=='folio')disposeScene=setupScene(events.signal,callback=>{sceneTick=callback;});
  const refresh=()=>window.ScrollTrigger?.refresh();
  document.querySelectorAll('details').forEach(element=>element.addEventListener('toggle',refresh,{signal:events.signal}));
  document.querySelectorAll('img').forEach(image=>{if(!image.complete)image.addEventListener('load',refresh,{once:true,signal:events.signal});});
  document.addEventListener('visibilitychange',()=>{previous=0;if(document.hidden)lenis?.stop();else lenis?.start();},{signal:events.signal});
  cleanup=()=>{closed=true;events.abort();cancelAnimationFrame(raf);window.gsap?.ticker.remove(tick);context?.revert();lenis?.destroy();disposeScene();};
}

setupBook();
control.addEventListener('click',()=>{
  wanted=!wanted;try{localStorage.setItem('glitch-v3-round02-motion',wanted?'on':'off');}catch{}
  configure();
},{signal:lifetime.signal});
reduce.addEventListener('change',configure,{signal:lifetime.signal});
document.addEventListener('keydown',event=>{
  if(parent===window||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable||event.metaKey||event.ctrlKey||event.altKey)return;
  if(/^[0-9]$/.test(event.key)||['ArrowLeft','ArrowRight','r','R'].includes(event.key)){
    event.preventDefault();parent.postMessage({type:'prototype-key',key:event.key},location.origin);
  }
},{signal:lifetime.signal});
window.addEventListener('pagehide',()=>{cleanup();bookTween?.kill();lifetime.abort();},{once:true});
configure();
