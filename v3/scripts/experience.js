import * as THREE from '../vendor/three.module.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { SVGLoader } from '../vendor/SVGLoader.js';

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
  { name:'Afterlight', label:'04 / Afterlight', color:'#263b32', ink:'#f0d7a4', image:'afterlight-logo.png', heading:'Keep the last<br>light alive.', copy:'A dark fantasy tower-defense roguelite. Build your defenses as the haunted woodland unfolds.', link:null }
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
  image.alt = item.name + (selected===3?' — The Hollow March logo':' app mark');
  document.querySelector('.fallback-title').textContent=item.name.toUpperCase();
  document.body.dataset.selected = String(selected);
  currentScene?.select?.(selected,fromDrag);
}
document.querySelectorAll('[data-select]').forEach((button,i)=>{button.disabled=false;button.addEventListener('click',()=>choose(i));});
document.querySelector('.disrupt')?.addEventListener('click',()=>currentScene?.disrupt?.());

function disposeGraph(scene) {
  const geometries=new Set(), materials=new Set(), textures=new Set();
  (scene.userData.logoTextures||[]).forEach(texture=>textures.add(texture));
  scene.traverse(object=>{
    if(object.geometry) geometries.add(object.geometry);
    if(object.isReflector) object.getRenderTarget().dispose();
    const list=Array.isArray(object.material)?object.material:[object.material];
    list.filter(Boolean).forEach(material=>{materials.add(material); for(const value of Object.values(material))if(value?.isTexture)textures.add(value);});
  });
  geometries.forEach(item=>item.dispose()); materials.forEach(item=>item.dispose()); textures.forEach(item=>item.dispose());
  scene.userData.freeEnvironment?.();
}

function addEnvironment(scene,renderer) {
  const generator=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const target=generator.fromScene(room,0.04);
  scene.environment=target.texture;
  room.dispose(); generator.dispose();
  let freed=false;
  const free=()=>{if(!freed){freed=true;target.dispose();}};
  scene.userData.freeEnvironment=free;
  return free;
}

function mesh(geometry,material,parent,x=0,y=0,z=0) {
  const object=new THREE.Mesh(geometry,material);
  object.position.set(x,y,z);
  parent.add(object);
  return object;
}

// Preserve the original faces; derive icon bodies from their alpha silhouettes.
function iconSilhouette(image) {
  const surface=document.createElement('canvas');
  const width=surface.width=image.naturalWidth,height=surface.height=image.naturalHeight;
  const ctx=surface.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,width,height).data;
  const left=[],right=[],center=Math.floor(width/2);
  // The icons have opaque, convex bodies. Scan outward from their center column
  // to ignore detached glints and transparent padding in the original artwork.
  const opaque=(x,y)=>pixels[(y*width+x)*4+3]>=220;
  for(let y=0;y<height;y+=4) {
    if(!opaque(center,y))continue;
    let lo=center,hi=center;
    while(lo>0&&opaque(lo-1,y))lo--;
    while(hi<width-1&&opaque(hi+1,y))hi++;
    left.push(new THREE.Vector2((lo/width-.5)*3.8*.982,(.5-y/height)*3.8*.982));
    right.push(new THREE.Vector2((hi/width-.5)*3.8*.982,(.5-y/height)*3.8*.982));
  }
  const points=left.concat(right.reverse());
  if(points.length<8)throw new Error('Icon silhouette unavailable');
  const shape=new THREE.Shape();
  const midpoint=(a,b)=>a.clone().add(b).multiplyScalar(.5);
  const start=midpoint(points.at(-1),points[0]);shape.moveTo(start.x,start.y);
  points.forEach((point,i)=>{
    const next=midpoint(point,points[(i+1)%points.length]);
    shape.quadraticCurveTo(point.x,point.y,next.x,next.y);
  });
  shape.closePath();return shape;
}

async function loadLogoAssets(scene,controller) {
  const textures=[];
  try {
    const images=await Promise.all(projects.map(async item=>{
      const response=await fetch('../assets/images/'+item.image,{signal:controller.signal});
      if(!response.ok)throw new Error('Logo unavailable: '+item.name);
      const blob=await response.blob();
      const url=URL.createObjectURL(blob);
      try {
        const image=new Image();image.src=url;await image.decode();return image;
      } finally {URL.revokeObjectURL(url);}
    }));
    const response=await fetch('../assets/images/afterlight-emblem.svg',{signal:controller.signal});
    if(!response.ok)throw new Error('Afterlight emblem unavailable');
    const emblem=new SVGLoader().parse(await response.text());
    if(controller.signal.aborted)throw new DOMException('Aborted','AbortError');
    images.slice(0,3).forEach(image=>{
      const texture=new THREE.Texture(image);texture.needsUpdate=true;
      texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;textures.push(texture);
    });
    const wordmark=document.createElement('canvas');wordmark.width=1536;wordmark.height=369;
    const art=images[3];
    wordmark.getContext('2d').drawImage(art,0,art.height*.64,art.width,art.height*.36,0,0,1536,369);
    const title=new THREE.CanvasTexture(wordmark);title.colorSpace=THREE.SRGBColorSpace;title.anisotropy=4;textures.push(title);
    // Own all textures even if teardown happens before objects are attached.
    scene.userData.logoTextures=textures;
    return {textures,emblem,silhouettes:images.slice(0,3).map(iconSilhouette)};
  } catch(error) {textures.forEach(texture=>texture.dispose());throw error;}
}

function logoObject(index,assets) {
  const group=new THREE.Group();group.userData.index=index;
  if(index<3) {
    const sides=new THREE.MeshStandardMaterial({color:index===0?'#222322':index===1?'#bc8f4d':'#bd305a',metalness:.7,roughness:.25});
    const body=new THREE.ExtrudeGeometry(assets.silhouettes[index],{
      depth:.28,steps:1,curveSegments:1,bevelEnabled:true,bevelSegments:2,bevelSize:.018,bevelThickness:.018
    });
    mesh(body,sides,group,0,0,-.25);
    const front=new THREE.MeshBasicMaterial({map:assets.textures[index],transparent:true,alphaTest:.02,toneMapped:false,side:THREE.DoubleSide});
    mesh(new THREE.PlaneGeometry(3.8,3.8),front,group,0,0,.08);
  } else {
    // SVG coordinates are transformed as a group, preserving the source paths.
    const crest=new THREE.Group();crest.scale.set(.015,-.015,.015);crest.position.set(-1.92,2.4,0);group.add(crest);
    const metal=new THREE.MeshStandardMaterial({color:'#d6ad70',metalness:.78,roughness:.28});
    const edge=new THREE.MeshStandardMaterial({color:'#785229',metalness:.8,roughness:.32});
    assets.emblem.paths.forEach(path=>{
      const style=path.userData.style;
      if(style.fill&&style.fill!=='none') {
        const face=style.fill==='#d6ad70'?metal:new THREE.MeshStandardMaterial({color:style.fill,metalness:.3,roughness:.3,emissive:style.fill,emissiveIntensity:.16});
        SVGLoader.createShapes(path).forEach(shape=>mesh(new THREE.ExtrudeGeometry(shape,{depth:12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:1.1,bevelThickness:1}),[face,edge],crest));
      }
      if(style.stroke&&style.stroke!=='none')path.subPaths.forEach(subpath=>{
        const geometry=SVGLoader.pointsToStroke(subpath.getPoints(32),style);
        if(geometry)mesh(geometry,metal,crest,0,0,8);
      });
    });
    mesh(new THREE.PlaneGeometry(4.55,1.1),new THREE.MeshBasicMaterial({map:assets.textures[3],transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}),group,0,-1.9,.1);
  }
  return group;
}

async function portalWorld(scene,camera,renderer,mobile,controller) {
  const assets=await loadLogoAssets(scene,controller);
  // The fixed landscape is the backdrop for every frame, not a loading poster.
  scene.background=null;
  scene.fog=new THREE.Fog('#724234',35,140);
  const freeEnvironment=addEnvironment(scene,renderer);
  scene.add(new THREE.HemisphereLight('#eee0cc','#47302a',1.9));
  const daylight=new THREE.DirectionalLight('#e5d8c8',2.6);
  daylight.position.set(-6,12,14);scene.add(daylight);
  const sunset=new THREE.DirectionalLight('#ff783c',4.5);
  sunset.position.set(16,7,-40);scene.add(sunset);
  const basalt=new THREE.TextureLoader().load('../assets/images/basalt.png');
  basalt.colorSpace=THREE.SRGBColorSpace;basalt.wrapS=basalt.wrapT=THREE.RepeatWrapping;
  const stone=new THREE.MeshStandardMaterial({color:'#91877e',map:basalt,bumpMap:basalt,bumpScale:.12,roughness:.86,metalness:.06,envMapIntensity:.45});
  const bronze=new THREE.MeshStandardMaterial({color:'#9e7149',metalness:.8,roughness:.3,envMapIntensity:.9});
  const rounded=(w,h,d)=>{
    const geometry=new RoundedBoxGeometry(w,h,d,4,.045);
    const positions=geometry.attributes.position,normals=geometry.attributes.normal,uv=geometry.attributes.uv;
    // Keep the rock grain at a consistent physical scale on lintels and columns.
    for(let i=0;i<positions.count;i++) {
      const x=Math.abs(normals.getX(i)),y=Math.abs(normals.getY(i)),z=Math.abs(normals.getZ(i));
      if(x>y&&x>z)uv.setXY(i,positions.getZ(i)*.55,positions.getY(i)*.55);
      else if(y>z)uv.setXY(i,positions.getX(i)*.55,positions.getZ(i)*.55);
      else uv.setXY(i,positions.getX(i)*.55,positions.getY(i)*.55);
    }
    return geometry;
  };
  const shade=document.createElement('canvas');shade.width=shade.height=256;
  const paint=shade.getContext('2d');
  const gradient=paint.createRadialGradient(128,128,12,128,128,128);
  gradient.addColorStop(0,'rgba(0,0,0,.6)');gradient.addColorStop(1,'rgba(0,0,0,0)');
  paint.fillStyle=gradient;paint.fillRect(0,0,256,256);
  const shadowTexture=new THREE.CanvasTexture(shade);
  const bays=[];
  for(let i=0;i<5;i++) {
    const bay=new THREE.Group();bay.position.set(0,0,-14*i);scene.add(bay);
    const gate=new THREE.Group();bay.add(gate);
    const gateStone=stone.clone(),gateBronze=bronze.clone();
    const trim=new THREE.MeshBasicMaterial({color:'#ff733f',toneMapped:false});
    for(const side of [-1,1]) {
      mesh(rounded(.8,7.8,1.2),gateStone,gate,side*2.75,3.9,0);
      mesh(rounded(.055,7.8,.055),gateBronze,gate,side*3.13,3.9,.56);
      mesh(new THREE.BoxGeometry(.035,7.15,.035),trim,gate,side*2.34,3.95,.62);
    }
    mesh(rounded(6.3,.55,1.2),gateStone,gate,0,8.0,0);
    mesh(rounded(6.65,.14,1.9),gateStone,gate,0,.07,.05);
    mesh(new THREE.BoxGeometry(4.72,.035,.035),trim,gate,0,7.51,.62);
    const lamp=new THREE.PointLight('#ff8a50',9,14,2);lamp.position.set(0,3.7,1.8);bay.add(lamp);
    let focal=null;
    if(i>0) {
      focal=logoObject(i-1,assets);focal.name='project-logo';
      focal.position.set(0,4.6,-1.9);focal.scale.setScalar(i===4?.95:1.1);gate.add(focal);
    }
    // Only these local, translucent reflections cover the photographed ground.
    // There is no full-screen ground mesh or opaque reflection render target.
    const reflected=gate.clone(true);reflected.scale.y=-1;bay.add(reflected);
    const reflectedFocal=reflected.getObjectByName('project-logo');
    const reflectionMaterials=new Map();
    reflected.traverse(object=>{
      if(!object.isMesh)return;
      const copy=material=>{
        if(!reflectionMaterials.has(material)) {
          const reflectedMaterial=material.clone();
          reflectedMaterial.transparent=true;reflectedMaterial.opacity=material.isMeshBasicMaterial?.2:.1;
          reflectedMaterial.depthWrite=false;
          reflectedMaterial.onBeforeCompile=shader=>{
            shader.vertexShader='varying float reflectionDepth;\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nreflectionDepth=max(0.0,-(modelMatrix*vec4(transformed,1.0)).y);');
            shader.fragmentShader='varying float reflectionDepth;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a*=1.0-smoothstep(0.0,3.0,reflectionDepth);\n#include <opaque_fragment>');
          };
          reflectedMaterial.customProgramCacheKey=()=> 'portal-ground-reflection-v1';
          reflectionMaterials.set(material,reflectedMaterial);
        }
        return reflectionMaterials.get(material);
      };
      object.material=Array.isArray(object.material)?object.material.map(copy):copy(object.material);
    });
    const shadow=mesh(new THREE.PlaneGeometry(10,4.5),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.5,toneMapped:false}),bay,0,.015,.3);
    shadow.rotation.x=-Math.PI/2;
    const materials=new Set(),focalMaterials=new Set();
    focal?.traverse(object=>{
      const list=Array.isArray(object.material)?object.material:[object.material];
      list.filter(Boolean).forEach(material=>focalMaterials.add(material));
    });
    gate.traverse(object=>{
      const list=Array.isArray(object.material)?object.material:[object.material];
      list.filter(Boolean).forEach(material=>{material.transparent=true;materials.add(material);});
    });
    bays.push({bay,gate,focal,reflectedFocal,materials,focalMaterials,reflectionMaterials,lamp,shadow});
  }
  stone.dispose();bronze.dispose();
  const sections=[...document.querySelectorAll('[data-chapter]')];
  const stage=canvas.parentElement;
  const image=new Image();image.src='../assets/images/portal-environment.png';
  await image.decode();
  if(controller.signal.aborted)throw new DOMException('Aborted','AbortError');
  const imageAspect=image.naturalWidth/image.naturalHeight;
  const pointer=new THREE.Vector2(),drift=new THREE.Vector2();
  const links=[...document.querySelectorAll('.chapter-nav a')];
  let anchors=[],progress=0,exact=0;
  const measure=()=>{anchors=sections.map(section=>section.getBoundingClientRect().top+scrollY);};
  measure();
  window.addEventListener('resize',measure,{signal:controller.signal});
  window.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch')return;
    pointer.set((event.clientX/innerWidth-.5)*.28,(event.clientY/innerHeight-.5)*.1);
  },{signal:controller.signal});
  document.addEventListener('pointerleave',()=>pointer.set(0,0),{signal:controller.signal});
  window.addEventListener('blur',()=>pointer.set(0,0),{signal:controller.signal});
  function resize() {
    measure();
    const width=stage.clientWidth,height=stage.clientHeight;
    const paintedHeight=Math.max(height,width/imageAspect);
    // CSS positions the source vanishing point at 76% / 72% for every ratio.
    // Match the frustum to the same covered image, including ultrawide screens.
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(21))*height/paintedHeight));
    camera.setViewOffset(width,height,-width*.26,-height*.22,width,height);
    camera.updateProjectionMatrix();
  }
  return {
    resize,
    update(time,dt) {
      const y=scrollY;exact=0;
      for(let i=0;i<anchors.length-1;i++)if(y>=anchors[i])exact=i+THREE.MathUtils.clamp((y-anchors[i])/(anchors[i+1]-anchors[i]),0,1);
      if(y>=anchors.at(-1))exact=4;
      progress=THREE.MathUtils.damp(progress,exact,6,dt);
      drift.x=THREE.MathUtils.damp(drift.x,pointer.x,4,dt);
      drift.y=THREE.MathUtils.damp(drift.y,pointer.y,4,dt);
      camera.position.set(1.3+drift.x,2+drift.y,18-progress*14);
      camera.lookAt(camera.position.x,camera.position.y,camera.position.z-100);
      bays.forEach(({bay,focal,reflectedFocal,materials,focalMaterials,reflectionMaterials,lamp,shadow},i)=>{
        const relative=i-progress;
        const visibility=THREE.MathUtils.smoothstep(relative,-.75,-.08);
        bay.visible=visibility>.003;
        const focus=1-THREE.MathUtils.smoothstep(relative,.1,.75);
        materials.forEach(material=>{material.opacity=visibility*(focalMaterials.has(material)?focus:1);material.depthWrite=material.opacity>.98;});
        reflectionMaterials.forEach((material,source)=>{material.opacity=visibility*(focalMaterials.has(source)?focus:1)*(material.isMeshBasicMaterial?.2:.1);});
        shadow.material.opacity=.5*visibility;lamp.intensity=9*visibility;
        if(focal) {
          focal.scale.setScalar(innerWidth<700?(i===4?1.15:1.3):(i===4?.95:1.1));
          reflectedFocal.scale.copy(focal.scale);
          focal.position.y=4.6+Math.sin(time*.55+i)*.055;
          focal.rotation.set(Math.sin(time*.25+i)*.025,Math.sin(time*.22+i)*.1+drift.x*.2,Math.sin(time*.18+i)*.015);
          focal.visible=focus>.003;
          reflectedFocal.position.copy(focal.position);reflectedFocal.rotation.copy(focal.rotation);reflectedFocal.visible=focal.visible;
        }
      });
      links.forEach((link,i)=>{if(Math.round(exact)-1===i)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    },
    dispose:freeEnvironment
  };
}

function signalWorld(scene,camera,renderer,mobile,controller) {
  scene.add(new THREE.HemisphereLight('#fff1db','#35140c',3));
  const key=new THREE.DirectionalLight('#fff5e5',5);key.position.set(-5,8,12);scene.add(key);
  const rim=new THREE.DirectionalLight('#ffad8c',3);rim.position.set(6,-4,3);scene.add(rim);
  const mask=document.createElement('canvas');mask.width=1600;mask.height=360;
  const painter=mask.getContext('2d',{willReadFrequently:true});
  painter.fillStyle='#fff';painter.font='600 250px Space';painter.textAlign='center';painter.textBaseline='middle';painter.fillText('gLitCh Labs.',800,182);
  const pixels=painter.getImageData(0,0,1600,360).data;
  const origins=[],folded=[];
  const fullWidth=painter.measureText('gLitCh Labs.').width,firstWidth=painter.measureText('gLitCh ').width;
  const textStart=800-fullWidth/2,splitX=textStart+firstWidth;
  const leftCenter=textStart+firstWidth/2,rightCenter=splitX+(fullWidth-firstWidth)/2;
  for(let y=6;y<354;y+=6)for(let x=6;x<1594;x+=6)if(pixels[(y*1600+x)*4+3]>100){
    origins.push((x-800)/60,(180-y)/60,0);
    const first=x<splitX;folded.push((x-(first?leftCenter:rightCenter))/60,(180-y)/60+(first?2.4:-2.4),0);
  }
  const count=origins.length/3;
  const geometry=new THREE.BoxGeometry(.079,.079,.2);
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
    const width=(phone?Math.max(firstWidth,fullWidth-firstWidth):fullWidth)/60*1.4*1.12;
    const height=phone?13:7;
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

async function orbitWorld(scene,camera,renderer,mobile,controller) {
  const assets=await loadLogoAssets(scene,controller);
  scene.background=new THREE.Color('#1937d8');
  scene.fog=new THREE.Fog('#1937d8',16,45);
  const freeEnvironment=addEnvironment(scene,renderer);
  scene.add(new THREE.HemisphereLight('#ffffff','#0c1762',2.4));
  const key=new THREE.DirectionalLight('#fffbe8',4.2);key.position.set(-4,10,10);scene.add(key);
  const fill=new THREE.DirectionalLight('#95b4ff',3);fill.position.set(8,5,-5);scene.add(fill);
  const rig=new THREE.Group();rig.position.set(0,2.9,-4);scene.add(rig);
  const surfaces=[],cards=[];
  projects.forEach((project,index)=>{
    const angle=index*Math.PI/2;
    const card=new THREE.Group();card.position.set(Math.sin(angle)*3.3,0,Math.cos(angle)*3.3);
    const logo=logoObject(index,assets);card.add(logo);
    logo.traverse(object=>{if(object.isMesh){object.userData.index=index;surfaces.push(object);}});
    cards.push(card);rig.add(card);
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
      raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(surfaces.filter(object=>cards[object.userData.index].visible));
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
      cards.forEach((card,index)=>{
        const facing=(Math.cos(index*Math.PI/2+current)+1)/2;
        card.visible=facing>.15;
        card.scale.setScalar(.56+.44*facing*facing);
        card.position.y=Math.sin(time*.55+index)*.085;card.lookAt(camera.position);
        card.rotateY(Math.sin(time*.32+index)*.08);card.rotateZ((index%2?1:-1)*.045);
      });
    },
    dispose:freeEnvironment
  };
}

function signalLogos(controller) {
  if(kind!=='signal'||!window.gsap)return ()=>{};
  const {gsap}=window;
  const controls=[];
  const context=gsap.context(()=>{
    document.querySelectorAll('.logo-stage').forEach((stage,index)=>{
      const button=stage.querySelector('button'),object=stage.querySelector('.logo-object');
      button.disabled=false;controls.push(button);
      const xTo=gsap.quickTo(object,'rotationX',{duration:.65,ease:'power3.out'});
      const yTo=gsap.quickTo(object,'rotationY',{duration:.65,ease:'power3.out'});
      const zTo=gsap.quickTo(object,'rotationZ',{duration:.65,ease:'power3.out'});
      const reset=()=>{xTo(0);yTo(0);zTo(0);};
      button.addEventListener('pointermove',event=>{
        if(event.pointerType==='touch')return;
        nudge?.kill();
        const rect=button.getBoundingClientRect();
        xTo(-((event.clientY-rect.top)/rect.height-.5)*20);
        yTo(((event.clientX-rect.left)/rect.width-.5)*28);
        zTo(((event.clientX-rect.left)/rect.width-.5)*3);
      },{signal:controller.signal});
      button.addEventListener('pointerleave',reset,{signal:controller.signal});
      button.addEventListener('blur',reset,{signal:controller.signal});
      let nudge;
      button.addEventListener('click',()=>{
        nudge?.kill();
        nudge=gsap.timeline().to(object,{rotationY:index%2?-22:22,rotationX:-7,duration:.45,ease:'power3.out'}).to(object,{rotationY:0,rotationX:0,duration:.8,ease:'power3.out'});
      },{signal:controller.signal});
      controller.signal.addEventListener('abort',()=>nudge?.kill(),{once:true});
      gsap.from(object,{rotationY:index%2?22:-22,rotationX:8,y:35,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:stage,start:'top 92%',once:true}});
    });
  });
  return ()=>{context.revert();controls.forEach(button=>button.disabled=true);};
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
  let renderer,scene,part,lenis,context,freeResize=()=>{},freeLogos=()=>{},disposed=false;
  function cleanup() {
    if(disposed)return;disposed=true;controller.abort();freeResize();freeLogos();
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
    part.update(time,dt);
    renderer.render(scene,camera);
    if(++frame%120===0){canvas.dataset.calls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);}
  }
  let camera;
  try {
    await document.fonts.ready;
    if(ticket!==generation||disposed)return;
    const mobile=innerWidth<700;
    renderer=new THREE.WebGLRenderer({canvas,alpha:kind!=='orbit',antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
    if(kind!=='orbit')renderer.setClearColor(0x000000,0);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.05,240);
    part=kind==='portal'?await portalWorld(scene,camera,renderer,mobile,controller):kind==='signal'?signalWorld(scene,camera,renderer,mobile,controller):await orbitWorld(scene,camera,renderer,mobile,controller);
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
      freeLogos=signalLogos(controller);
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
    cleanup();if(ticket!==generation)return;currentScene=null;
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
