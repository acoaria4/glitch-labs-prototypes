import * as THREE from '../vendor/three.module.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { Reflector } from '../vendor/Reflector.js';

const kind = document.body.dataset.experience;
const canvas = document.querySelector('#world');
const motionControl = document.querySelector('.motion-control');
const media = matchMedia('(prefers-reduced-motion: reduce)');
const status = document.querySelector('.render-state');
const TAU = Math.PI * 2;
const projects = [
  { name:'Expenses', label:'01 / Expenses', color:'#d9e1bc', ink:'#233529', image:'expenses.webp', heading:'A little less<br>keeping track.', copy:'Personal spending and shared tabs. A clearer picture of where it all goes.', link:'https://theglitchlabs.com/expenses/' },
  { name:'AURA', label:'02 / AURA', color:'#e9d8b5', ink:'#573e2c', image:'aura.webp', heading:'A different<br>perspective.', copy:'Vedic charts, Porutham, and the Tamil calendar. Tradition, thoughtfully presented.', link:'https://theglitchlabs.com/aura/' },
  { name:'Lumen', label:'03 / Lumen', color:'#f1bacb', ink:'#4d2e46', image:'lumen.webp', heading:'A little more<br>understanding.', copy:'Quiz-based revision for grades 9–12, with clear explanations and room to grow. Coming soon.', link:'https://theglitchlabs.com/lumen/' },
  { name:'Afterlight', label:'04 / Afterlight', color:'#263b32', ink:'#f0d7a4', image:'afterlight-frontier.png', heading:'Keep the last<br>light alive.', copy:'A dark fantasy tower-defense roguelite. Build your defenses as the haunted woodland unfolds.', link:null }
];
let selected = 0;
let wanted = true;
try { wanted = localStorage.getItem('glitch-v3-round02-motion') !== 'off'; } catch {}
let stop = () => {};
let currentScene = null;
let generation = 0;

function choose(index, fromDrag=false) {
  selected = ((index % 4) + 4) % 4;
  const item = projects[selected];
  document.querySelectorAll('[data-select]').forEach((button,i) => button.setAttribute('aria-pressed', String(i===selected)));
  if (kind !== 'orbit') return;
  document.querySelector('.selected-index').textContent = item.label;
  document.querySelector('.selected-heading').innerHTML = item.heading;
  document.querySelector('.selected-description').textContent = item.copy;
  const link = document.querySelector('.selected-action');
  link.hidden = !item.link;
  if (item.link) { link.href=item.link; link.textContent=`Explore ${item.name} ↗`; }
  document.querySelector('.selected-development').hidden = Boolean(item.link);
  document.querySelector('.fallback-label').textContent = item.label;
  const image = document.querySelector('.fallback-image');
  image.src = '../assets/images/'+item.image;
  image.alt = item.name + (selected===3?' development capture':' app mark');
  document.querySelector('.fallback-title').textContent=item.name.toUpperCase();
  document.body.dataset.selected = String(selected);
  currentScene?.select?.(selected,fromDrag);
}
document.querySelectorAll('[data-select]').forEach((button,i)=>{button.disabled=false;button.addEventListener('click',()=>choose(i));});
document.querySelector('.disrupt')?.addEventListener('click',()=>currentScene?.disrupt?.());

function disposeGraph(scene) {
  const geometries=new Set(), materials=new Set(), textures=new Set();
  scene.traverse(object=>{
    if(object.geometry) geometries.add(object.geometry);
    if(object.isReflector) object.getRenderTarget().dispose();
    const list=Array.isArray(object.material)?object.material:[object.material];
    list.filter(Boolean).forEach(material=>{materials.add(material); for(const value of Object.values(material))if(value?.isTexture)textures.add(value);});
  });
  geometries.forEach(item=>item.dispose()); materials.forEach(item=>item.dispose()); textures.forEach(item=>item.dispose());
}

function addEnvironment(scene,renderer) {
  const generator=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const target=generator.fromScene(room,0.04);
  scene.environment=target.texture;
  room.dispose(); generator.dispose();
  return ()=>target.dispose();
}

function mesh(geometry,material,parent,x=0,y=0,z=0) {
  const object=new THREE.Mesh(geometry,material);
  object.position.set(x,y,z);
  parent.add(object);
  return object;
}

function portalWorld(scene,camera,renderer,mobile,controller) {
  scene.background=new THREE.Color('#100d0d');
  scene.fog=new THREE.FogExp2('#100d0d',0.028);
  const freeEnvironment=addEnvironment(scene,renderer);
  scene.add(new THREE.HemisphereLight('#d6d3ca','#130c0a',1.4));
  const key=new THREE.DirectionalLight('#e7e2d7',4);
  key.position.set(-8,15,12); scene.add(key);
  const rim=new THREE.DirectionalLight('#ff5a32',3.5);
  rim.position.set(8,8,-20); scene.add(rim);
  const basalt=new THREE.TextureLoader().load('../assets/images/basalt.png');
  basalt.colorSpace=THREE.SRGBColorSpace;basalt.wrapS=basalt.wrapT=THREE.RepeatWrapping;
  const stone=new THREE.MeshStandardMaterial({color:'#b4b0ac',map:basalt,bumpMap:basalt,bumpScale:.075,roughness:0.73,metalness:0.12,envMapIntensity:0.6});
  const darkStone=new THREE.MeshStandardMaterial({color:'#171413',roughness:0.72,metalness:0.1});
  const floorGeometry=new THREE.PlaneGeometry(120,180);
  const floorMaterial=new THREE.MeshStandardMaterial({color:'#141111',roughness:0.22,metalness:0.75});
  const floor=mesh(floorGeometry,floorMaterial,scene,3,-0.04,-45);
  floor.rotation.x=-Math.PI/2;
  if(!mobile) {
    const mirror=new Reflector(new THREE.PlaneGeometry(90,170),{color:0x363636,textureWidth:512,textureHeight:512,clipBias:0.003});
    mirror.rotation.x=-Math.PI/2; mirror.position.set(3,0,-40); scene.add(mirror);
  }
  const sun=mesh(new THREE.CircleGeometry(6.5,96),new THREE.MeshBasicMaterial({color:'#eb6339',fog:false}),scene,3.2,7,-105);
  const innerColors=['#ff6844','#e8d9bc','#d7aa60','#f0b0c7','#ef9350'];
  const groups=[];
  const rounded=(w,h,d,r=.07)=>new RoundedBoxGeometry(w,h,d,3,r);
  const materialMetal=new THREE.MeshStandardMaterial({color:'#a6aaa8',metalness:0.93,roughness:0.18,envMapIntensity:1.4});
  const cream=new THREE.MeshStandardMaterial({color:'#dedbcc',roughness:0.4,metalness:0.15});
  const gold=new THREE.MeshStandardMaterial({color:'#a88446',metalness:0.88,roughness:0.23});
  for(let i=0;i<5;i++) {
    const gate=new THREE.Group(); gate.position.set(3.2,0,-18*i); scene.add(gate);
    for(const side of [-1,1]) {
      for(let segment=0;segment<6;segment++) mesh(rounded(.78,1.29,1.55),stone,gate,side*2.76,.74+segment*1.3,0);
      mesh(rounded(.24,7.8,.24,.03),materialMetal,gate,side*3.11,3.99,-.5);
    }
    mesh(rounded(6.3,.6,1.55),stone,gate,0,8.05,0);
    mesh(rounded(6.8,.18,2.3),darkStone,gate,0,.09,.2);
    const lightMaterial=new THREE.MeshBasicMaterial({color:innerColors[i],toneMapped:false});
    for(const side of [-1,1]) mesh(new THREE.BoxGeometry(.035,7.1,.035),lightMaterial,gate,side*2.35,3.95,.82);
    mesh(new THREE.BoxGeometry(4.73,.035,.035),lightMaterial,gate,0,7.51,.82);
    const lamp=new THREE.PointLight(innerColors[i],18,15,2); lamp.position.set(0,4.6,2); gate.add(lamp);
    if(i===0) continue;
    const focal=new THREE.Group(); focal.position.set(0,5,-2.5); gate.add(focal); groups.push(focal);
    if(i===1) {
      for(let j=0;j<3;j++) {
        const plate=mesh(rounded(2.65,1.25,.15,.055),j===1?cream:materialMetal,focal,0,(j-1)*.48,(j-1)*.4);
        plate.rotation.set(-.18,.2,(j-1)*.14);
        for(let row=0;row<4;row++)mesh(new THREE.BoxGeometry(1.7-row*.2,.014,.006),darkStone,plate,0,.28-row*.15,.08);
      }
    } else if(i===2) {
      for(let j=0;j<4;j++) {
        const ring=mesh(new THREE.TorusGeometry(1.6-j*.12,.023,8,100),gold,focal);
        ring.rotation.set(j*.73,j*.6,j*.4);
      }
      mesh(new THREE.SphereGeometry(.42,32,24),cream,focal);
      mesh(new THREE.SphereGeometry(.16,24,16),materialMetal,focal,1.4,.5,.15);
    } else if(i===3) {
      const pink=new THREE.MeshStandardMaterial({color:'#eebec7',metalness:.3,roughness:.25});
      for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++) {
        const cube=mesh(rounded(.59,.59,.59,.06),(x+y+z)%2?pink:cream,focal,x*.65,y*.65,z*.65);
        cube.userData.home=cube.position.clone();
      }
      focal.rotation.set(.4,.5,.15);
    } else {
      const texture=new THREE.TextureLoader().load('../assets/images/afterlight-frontier.png'); texture.colorSpace=THREE.SRGBColorSpace;
      mesh(rounded(4.7,3.07,.25,.06),stone,focal);
      mesh(new THREE.PlaneGeometry(4.48,2.8),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),focal,0,0,.14);
    }
  }
  const sections=[...document.querySelectorAll('[data-chapter]')];
  let anchors=[];
  const pointer=new THREE.Vector2();
  const viewTarget=new THREE.Vector3();
  let progress=0,exact=0;
  function measure(){anchors=sections.map(section=>section.getBoundingClientRect().top+window.scrollY);}
  measure();
  window.addEventListener('resize',measure,{signal:controller.signal});
  window.addEventListener('pointermove',event=>{pointer.x=(event.clientX/innerWidth-.5)*.45;pointer.y=(event.clientY/innerHeight-.5)*.18;},{signal:controller.signal});
  window.addEventListener('blur',()=>pointer.set(0,0),{signal:controller.signal});
  const links=[...document.querySelectorAll('.chapter-nav a')];
  return {
    resize(){measure();camera.fov=innerWidth<700?52:42;camera.updateProjectionMatrix();},
    update(time,dt){
      const y=window.scrollY;
      exact=0;
      for(let i=0;i<anchors.length-1;i++) if(y>=anchors[i]) exact=i+THREE.MathUtils.clamp((y-anchors[i])/(anchors[i+1]-anchors[i]),0,1);
      if(y>=anchors.at(-1)) exact=4;
      progress=THREE.MathUtils.damp(progress,exact,6,dt);
      const x=innerWidth<700?3.2:1.4+Math.min(progress,1)*1.8;
      camera.position.set(x+pointer.x,3.15+pointer.y,15-progress*18);
      viewTarget.set(3.2,4.0,-60-progress*18);camera.lookAt(viewTarget);
      groups.forEach((group,i)=>{
        if(i===0)group.rotation.y=Math.sin(time*.2)*.14;
        if(i===1)group.rotation.set(time*.08,time*.06,0);
        if(i===2) {
          group.rotation.y=.5+Math.sin(time*.18)*.17;
          const spread=1+Math.sin(time*.7)*.045;
          group.children.forEach(object=>object.position.copy(object.userData.home).multiplyScalar(spread));
        }
      });
      const index=Math.round(exact)-1;
      links.forEach((link,i)=>{if(index===i)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
      sun.rotation.z=0;
    },
    dispose:freeEnvironment
  };
}

function signalWorld(scene,camera,renderer,mobile,controller) {
  scene.add(new THREE.HemisphereLight('#fff1db','#35140c',3));
  const key=new THREE.DirectionalLight('#fff5e5',5);key.position.set(-5,8,12);scene.add(key);
  const rim=new THREE.DirectionalLight('#ffad8c',3);rim.position.set(6,-4,3);scene.add(rim);
  const mask=document.createElement('canvas');mask.width=960;mask.height=280;
  const painter=mask.getContext('2d',{willReadFrequently:true});
  painter.fillStyle='#fff';painter.font='400 280px Bebas';painter.textAlign='center';painter.textBaseline='middle';painter.fillText('GLITCH',480,151);
  const pixels=painter.getImageData(0,0,960,280).data;
  const origins=[],folded=[];
  const fullWidth=painter.measureText('GLITCH').width,firstWidth=painter.measureText('GLI').width;
  const textStart=480-fullWidth/2,splitX=textStart+firstWidth;
  const leftCenter=textStart+firstWidth/2,rightCenter=splitX+(fullWidth-firstWidth)/2;
  for(let y=12;y<270;y+=5)for(let x=10;x<950;x+=5)if(pixels[(y*960+x)*4+3]>100){
    origins.push((x-480)/50,(140-y)/50,0);
    const first=x<splitX;folded.push((x-(first?leftCenter:rightCenter))/50,(140-y)/50+(first?3:-3),0);
  }
  const count=Math.min(origins.length/3,5500);
  const geometry=new THREE.BoxGeometry(.075,.075,.2);
  const material=new THREE.MeshStandardMaterial({color:'#201710',roughness:.34,metalness:.42});
  const letters=new THREE.InstancedMesh(geometry,material,count);letters.frustumCulled=false;letters.scale.setScalar(1.4);scene.add(letters);
  const current=new Float32Array(origins.slice(0,count*3));
  const object=new THREE.Object3D();
  const pointer=new THREE.Vector2(99,99);
  let pulse=0;
  let halfW=10,halfH=3;
  const stage=canvas.parentElement;
  function resize() {
    const aspect=stage.clientWidth/stage.clientHeight;
    const phone=innerWidth<700;
    const width=phone?Math.max(firstWidth,fullWidth-firstWidth)/50*1.4*1.18:18.5;
    const height=phone?14.8:7;
    const tangent=2*Math.tan(THREE.MathUtils.degToRad(17.5));
    camera.fov=35;camera.position.set(0,0,Math.max(10,width/(tangent*aspect),height/tangent));
    camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    halfH=Math.tan(THREE.MathUtils.degToRad(17.5))*camera.position.z;halfW=halfH*aspect;
  }
  resize();
  window.addEventListener('pointermove',event=>{
    const rect=stage.getBoundingClientRect();
    pointer.set(((event.clientX-rect.left)/rect.width*2-1)*halfW/1.4,-((event.clientY-rect.top)/rect.height*2-1)*halfH/1.4);
  },{signal:controller.signal});
  document.addEventListener('pointerleave',()=>pointer.set(99,99),{signal:controller.signal});
  window.addEventListener('blur',()=>pointer.set(99,99),{signal:controller.signal});
  return {
    resize,
    disrupt(){pulse=1;},
    update(time,dt){
      const rect=stage.getBoundingClientRect();
      const scroll=THREE.MathUtils.clamp(-rect.top/innerHeight,0,1);
      const spread=scroll*scroll*1.4;
      const damping=1-Math.exp(-dt*9);
      pulse*=Math.exp(-dt*1.6);
      const source=innerWidth<700?folded:origins;
      for(let i=0;i<count;i++) {
        const at=i*3, ox=source[at],oy=source[at+1];
        const dx=ox-pointer.x,dy=oy-pointer.y;
        const distance=Math.sqrt(dx*dx+dy*dy)+.01;
        const influence=Math.max(0,1-distance/2.25);
        const phase=i*2.399;
        const burst=pulse*(.3+Math.sin(phase)*.3);
        const tx=ox*(1+spread+burst)+dx/distance*influence*.8;
        const ty=oy*(1+spread+burst)+dy/distance*influence*.8;
        const tz=influence*1.8+Math.sin(phase)*pulse*4+Math.sin(i*.73)*spread*6+Math.sin(ox*.7+time*.5)*.12;
        current[at]+=(tx-current[at])*damping;current[at+1]+=(ty-current[at+1])*damping;current[at+2]+=(tz-current[at+2])*damping;
        object.position.set(current[at],current[at+1],current[at+2]);
        object.rotation.set((influence+pulse)*Math.sin(phase), (influence+pulse)*Math.cos(phase),pulse*.5);
        object.updateMatrix();letters.setMatrixAt(i,object.matrix);
      }
      letters.instanceMatrix.needsUpdate=true;
      letters.rotation.x=.10;letters.rotation.y=Math.sin(time*.13)*.025;
    }
  };
}

async function posterTexture(item,index) {
  const surface=document.createElement('canvas');surface.width=768;surface.height=1024;
  const ctx=surface.getContext('2d');
  ctx.fillStyle=item.color;ctx.fillRect(0,0,768,1024);
  ctx.fillStyle=item.ink;ctx.font='500 23px Space';ctx.fillText('gLitCh Labs',48,57);
  ctx.textAlign='right';ctx.fillText(item.label.split(' / ')[0],720,57);ctx.textAlign='left';
  ctx.fillRect(48,82,672,2);
  const image=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src='../assets/images/'+item.image;});
  if(index<3) ctx.drawImage(image,124,205,520,520);
  else {
    const sh=image.naturalHeight,sw=sh*1.2;
    ctx.drawImage(image,(image.naturalWidth-sw)/2,0,sw,sh,48,160,672,560);
  }
  ctx.fillStyle=item.ink;ctx.font=`400 ${index===3?126:145}px Bebas`;ctx.fillText(item.name.toUpperCase(),42,893);
  ctx.font='400 22px Space';ctx.fillText(index===3?'A world in the making. In development.':index===2?'A little more understanding. Coming soon.':index===1?'A different perspective.':'Life, a little clearer.',48,956);
  const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}

async function orbitWorld(scene,camera,renderer,mobile,controller) {
  scene.background=new THREE.Color('#1937d8');
  scene.fog=new THREE.Fog('#1937d8',16,45);
  const freeEnvironment=addEnvironment(scene,renderer);
  scene.add(new THREE.HemisphereLight('#ffffff','#0c1762',2.4));
  const key=new THREE.DirectionalLight('#fffbe8',4.2);key.position.set(-4,10,10);scene.add(key);
  const fill=new THREE.DirectionalLight('#95b4ff',3);fill.position.set(8,5,-5);scene.add(fill);
  const rig=new THREE.Group();rig.position.set(0,2.9,-4);scene.add(rig);
  const surfaces=[],cards=[];
  const textures=await Promise.all(projects.map(posterTexture));
  textures.forEach((texture,index)=>{
    const angle=index*Math.PI/2;
    const card=new THREE.Group();card.position.set(Math.sin(angle)*4.2,0,Math.cos(angle)*4.2);
    const shell=mesh(new RoundedBoxGeometry(3.76,5.12,.16,3,.08),new THREE.MeshStandardMaterial({color:projects[index].color,roughness:.48,metalness:.05}),card);
    shell.userData.index=index;
    const front=mesh(new THREE.PlaneGeometry(3.61,4.97),new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:THREE.DoubleSide}),card,0,0,.09);
    front.userData.index=index; surfaces.push(front);cards.push(card);rig.add(card);
  });
  let target=-selected*Math.PI/2,current=target,dragging=false,lastX=0,downX=0,downY=0;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function select(index,fromDrag){
    if(fromDrag)return;
    const base=-index*Math.PI/2;
    target=base+Math.round((target-base)/TAU)*TAU;
  }
  function resize(){const phone=innerWidth<700;camera.fov=phone?38:34;camera.position.set(0,3.3,phone?11.3:10.5);camera.lookAt(0,2.9,-2);camera.updateProjectionMatrix();}
  resize();
  canvas.addEventListener('pointerdown',event=>{dragging=true;lastX=downX=event.clientX;downY=event.clientY;canvas.setPointerCapture(event.pointerId);},{signal:controller.signal});
  canvas.addEventListener('pointermove',event=>{
    if(!dragging)return;
    const delta=event.clientX-lastX;
    target+=delta*.006;lastX=event.clientX;
  },{signal:controller.signal});
  const finish=event=>{
    if(!dragging)return;dragging=false;
    if(event.type!=='pointercancel'&&Math.hypot(event.clientX-downX,event.clientY-downY)<7) {
      const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
      raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(surfaces);
      if(hits.length){choose(hits[0].object.userData.index);return;}
    }
    const index=((Math.round(-target/(Math.PI/2))%4)+4)%4;
    target=-Math.round(-target/(Math.PI/2))*Math.PI/2;choose(index,true);
  };
  canvas.addEventListener('pointerup',finish,{signal:controller.signal});canvas.addEventListener('pointercancel',finish,{signal:controller.signal});
  return {
    select,resize,
    update(time,dt){
      current=THREE.MathUtils.damp(current,target,6,dt);rig.rotation.y=current;
      rig.updateWorldMatrix(true,true);
      cards.forEach((card,index)=>{card.position.y=Math.sin(time*.55+index)*.085;card.lookAt(camera.position);card.rotateZ((index%2?1:-1)*.045);});
    },
    dispose:freeEnvironment
  };
}

async function configure() {
  const ticket=++generation;
  stop();stop=()=>{};currentScene=null;
  document.body.classList.remove('has-webgl','has-motion');
  const active=wanted&&!media.matches;
  motionControl.hidden=false;motionControl.disabled=media.matches;
  motionControl.textContent=media.matches?'Motion reduced':active?'Motion on':'Motion off';
  motionControl.setAttribute('aria-pressed',String(!active));
  const disrupt=document.querySelector('.disrupt');if(disrupt)disrupt.disabled=true;
  if(!active)return;
  const controller=new AbortController();
  let renderer,scene,part,lenis,context,freeResize=()=>{},disposed=false;
  const geometries=[];
  function cleanup() {
    if(disposed)return;disposed=true;controller.abort();freeResize();
    context?.revert();lenis?.destroy();
    window.gsap?.ticker.remove(ticker);
    part?.dispose?.();
    if(scene)disposeGraph(scene);
    renderer?.dispose();
    document.body.classList.remove('has-webgl','has-motion');
  }
  stop=cleanup;
  let previous=0,inView=true,frame=0;
  function ticker(time) {
    if(disposed||document.hidden)return;
    lenis?.raf(time*1000);
    const dt=Math.min(.05,previous?time-previous:1/60);previous=time;
    if(!renderer||!part||!inView)return;
    if(kind==='portal'&&document.querySelector('main').getBoundingClientRect().bottom<=0)return;
    part.update(time,dt);
    renderer.render(scene,camera);
    if(++frame%120===0){canvas.dataset.calls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);}
  }
  let camera;
  try {
    await document.fonts.ready;
    if(ticket!==generation||disposed)return;
    const mobile=innerWidth<700;
    renderer=new THREE.WebGLRenderer({canvas,alpha:kind==='signal',antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
    if(kind==='signal')renderer.setClearColor(0x000000,0);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.05,240);
    part=kind==='portal'?portalWorld(scene,camera,renderer,mobile,controller):kind==='signal'?signalWorld(scene,camera,renderer,mobile,controller):await orbitWorld(scene,camera,renderer,mobile,controller);
    if(ticket!==generation||disposed){part?.dispose?.();if(scene)disposeGraph(scene);renderer.dispose();return;}
    currentScene=part;
    const host=canvas.parentElement;
    function resize(){
      const width=host.clientWidth,height=host.clientHeight;
      if(!width||!height)return;
      renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.5));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();part.resize?.();
      window.ScrollTrigger?.refresh();
    }
    const observer=new ResizeObserver(resize);observer.observe(host);freeResize=()=>observer.disconnect();resize();
    if(kind!=='portal') {
      const visibility=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{rootMargin:'100px'});
      visibility.observe(host);const previousCleanup=freeResize;freeResize=()=>{previousCleanup();visibility.disconnect();};
    }
    if(window.gsap&&window.ScrollTrigger&&window.Lenis) {
      const {gsap,ScrollTrigger,Lenis}=window;
      gsap.registerPlugin(ScrollTrigger);
      lenis=new Lenis({lerp:.09,smoothWheel:true,syncTouch:false,anchors:true});lenis.on('scroll',ScrollTrigger.update);
      context=gsap.context(()=>{
        gsap.from('.topbar,.threshold .kicker,.threshold h1,.signal-topline,.orbit-copy>h1',{y:22,opacity:0,stagger:.1,duration:1,ease:'power3.out',clearProps:'transform,opacity'});
        gsap.utils.toArray('.signal-project,.index-title,.orbit-index article,.closing h2').forEach(element=>{
          gsap.from(element,{y:35,opacity:0,duration:.8,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:element,start:'top 94%',once:true}});
        });
      });
      gsap.ticker.add(ticker);
    }
    part.update(0,1);renderer.render(scene,camera);
    canvas.dataset.calls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);
    document.body.classList.add('has-webgl','has-motion');canvas.dataset.scene=kind;status.textContent='';
    if(disrupt)disrupt.disabled=false;
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cleanup();currentScene=null;status.textContent='Still view. Explore the collection below.';},{signal:controller.signal});
    document.addEventListener('visibilitychange',()=>{previous=0;if(document.hidden)lenis?.stop();else lenis?.start();},{signal:controller.signal});
    document.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>window.ScrollTrigger?.refresh(),{signal:controller.signal}));
  } catch(error) {
    cleanup();currentScene=null;
    status.textContent='Still view. The collection is ready to explore.';
    motionControl.textContent='Still view';motionControl.disabled=true;
    // A failed enhancement keeps the complete semantic document and its links.
    canvas.dataset.fallback=error instanceof Error?error.message:'Live view unavailable';
  }
}

motionControl.addEventListener('click',()=>{wanted=!wanted;try{localStorage.setItem('glitch-v3-round02-motion',wanted?'on':'off');}catch{}configure();});
media.addEventListener('change',configure);
window.addEventListener('pagehide',()=>{generation++;stop();});
window.addEventListener('pageshow',event=>{if(event.persisted)configure();});
document.addEventListener('keydown',event=>{
  if(parent===window||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable||event.metaKey||event.ctrlKey||event.altKey)return;
  if(/^[1-3]$/.test(event.key)||['ArrowLeft','ArrowRight','r','R'].includes(event.key)){event.preventDefault();parent.postMessage({type:'prototype-key',key:event.key},location.origin);}
});
if(kind==='orbit')choose(0);
configure();
