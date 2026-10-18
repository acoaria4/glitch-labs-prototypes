import * as THREE from '../vendor/three.module.js';
import {SVGLoader} from '../vendor/SVGLoader.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';

const names=['Expenses','AURA','Lumen','Afterlight'];
const finishes={
  nocturne:{gold:'#c2a16b',roughness:.24,metalness:.96,edge:'#49331e',key:'#ffe0b1',power:3.8,fill:'#c6d2ed',fillPower:.65,ambient:.65,ground:'#211a11'},
  folio:{gold:'#b28d53',roughness:.34,metalness:.9,edge:'#50371e',key:'#fff2d7',power:3.2,fill:'#e9efff',fillPower:.65,ambient:.75,ground:'#665542'},
  chroma:{gold:'#cbb681',roughness:.22,metalness:.96,edge:'#4b463f',key:'#f4fff9',power:3.5,fill:'#c9b7ff',fillPower:1.15,ambient:.7,ground:'#687579'}
};

function mesh(parent,geometry,material,x=0,y=0,z=0){
  const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;
}
export async function loadSculptedAssets(signal){
  const loader=new SVGLoader();
  const paths=await Promise.all(['expenses-symbol.svg','aura-symbol.svg','lumen-symbol.svg','afterlight-emblem.svg'].map(async file=>{
    const response=await fetch('../assets/images/'+file+'?v=sculpted-1',{signal});
    if(!response.ok)throw new Error('Logo unavailable');return loader.parse(await response.text());
  }));
  const response=await fetch('../assets/images/afterlight-logo.png',{signal});
  if(!response.ok)throw new Error('Afterlight title unavailable');
  const url=URL.createObjectURL(await response.blob());
  const image=new Image();
  try{image.src=url;await image.decode();}finally{URL.revokeObjectURL(url);}
  if(signal.aborted)throw new DOMException('Aborted','AbortError');
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=369;
  canvas.getContext('2d').drawImage(image,0,image.height*.64,image.width,image.height*.36,0,0,1536,369);
  const title=new THREE.CanvasTexture(canvas);title.colorSpace=THREE.SRGBColorSpace;title.anisotropy=4;
  return {paths,title};
}
function pair(color,finish,paper=false,enamel=false){
  const face=new THREE.MeshPhysicalMaterial({color,metalness:paper?.18:enamel?.62:finish.metalness,roughness:paper?.42:enamel?.28:finish.roughness,envMapIntensity:paper?.7:1.05,clearcoat:enamel?.35:.18,clearcoatRoughness:.25});
  const edge=new THREE.MeshStandardMaterial({color:enamel?new THREE.Color(color).multiplyScalar(.24):finish.edge,metalness:.9,roughness:.35,envMapIntensity:.6});
  return [face,edge];
}
function symbol(index,data,finish){
  const group=new THREE.Group(),shapeGroup=new THREE.Group(),unit=index===2?.0158:.0175;
  shapeGroup.scale.set(unit,-unit,unit);shapeGroup.position.set(-128*unit,128*unit,0);group.add(shapeGroup);
  const materials=new Map();
  data.paths[index].paths.forEach(path=>{
    const {node,style}=path.userData;if(!style.fill||style.fill==='none')return;
    const paper=node.getAttribute('data-metal')==='paper';
    const key=style.fill+(paper?'paper':'metal');
    if(!materials.has(key))materials.set(key,pair(index<2?finish.gold:style.fill,finish,paper,index===2));
    const material=materials.get(key);
    if(node.getAttribute('data-orb')==='true'){
      const orb=mesh(shapeGroup,new THREE.SphereGeometry(Number(node.getAttribute('r')),40,24),material[0],Number(node.getAttribute('cx')),Number(node.getAttribute('cy')),8);orb.scale.z=.72;return;
    }
    // Preserve Lumen's separated sheet depths, including bevel clearance.
    const relief=index===2?2.5:1;
    const depth=Number(node.getAttribute('data-depth')||node.parentElement.getAttribute('data-depth')||7)*(index<2?1.45:relief);
    const z=Number(node.getAttribute('data-z')||node.parentElement.getAttribute('data-z')||0)*relief;
    const bevel=index===2?.65:1.4;
    SVGLoader.createShapes(path).forEach(shape=>mesh(shapeGroup,new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:index===2?2:3,bevelSize:bevel,bevelThickness:bevel,curveSegments:index===2?20:24}),material,0,0,z));
  });
  return group;
}
function afterlight(data,finish){
  const group=new THREE.Group(),crest=new THREE.Group();crest.scale.set(.015,-.015,.015);crest.position.set(-1.92,2.4,0);group.add(crest);
  const gold=pair(finish.gold,finish),orange=pair('#f49259',finish,false,true),ivory=pair('#e9e3d5',finish,true);
  orange[0].metalness=.12;orange[0].emissive.set('#f49259');orange[0].emissiveIntensity=.09;
  data.paths[3].paths.forEach(path=>{
    const style=path.userData.style;
    if(style.fill&&style.fill!=='none'){
      const core=style.fill==='#e9e3d5',flame=style.fill==='#f49259';
      const material=core?ivory:flame?orange:gold;
      const depth=core?2:flame?5:20,z=core?29:flame?22.5:0,bevel=core?.3:flame?.45:1.1;
      SVGLoader.createShapes(path).forEach(shape=>mesh(crest,new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:bevel,bevelThickness:bevel,curveSegments:24}),material,0,0,z));
    }
    if(style.stroke&&style.stroke!=='none')path.subPaths.forEach(subpath=>{
      const points=subpath.getPoints(32),left=[],right=[];if(points.length<2)return;
      points.forEach((point,i)=>{
        const tangent=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize();
        const normal=new THREE.Vector2(-tangent.y,tangent.x).multiplyScalar((style.strokeWidth||8)/2);
        left.push(point.clone().add(normal));right.push(point.clone().sub(normal));
      });
      const shape=new THREE.Shape(left.concat(right.reverse()));shape.closePath();
      mesh(crest,new THREE.ExtrudeGeometry(shape,{depth:3,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.35,bevelThickness:.35}),gold,0,0,10);
    });
  });
  // The supplied title is retained as a printed inscription beneath the solid crest.
  mesh(group,new THREE.PlaneGeometry(4.55,1.1),new THREE.MeshBasicMaterial({map:data.title,transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}),0,-1.9,.1);
  return group;
}
function normalize(object){
  const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  object.position.sub(center);const root=new THREE.Group();root.add(object);root.scale.setScalar(4.5/Math.max(size.x,size.y));return root;
}
export function createSculptedLogo(index,data,edition='nocturne'){
  const finish=finishes[edition]||finishes.nocturne;
  return index<3?symbol(index,data,finish):afterlight(data,finish);
}
function litScene(model,finish,environment){
  const scene=new THREE.Scene();scene.environment=environment;
  const pivot=new THREE.Group();pivot.add(model.clone(true));scene.add(pivot);
  pivot.traverse(object=>{if(object.isMesh){const list=Array.isArray(object.material)?object.material:[object.material];object.castShadow=!list.some(material=>material.isMeshBasicMaterial);}});
  const key=new THREE.DirectionalLight(finish.key,finish.power);key.position.set(-5,7,8);scene.add(key);
  key.castShadow=true;key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:24});key.shadow.bias=-.0002;key.shadow.normalBias=.025;
  const floor=mesh(scene,new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:'#21170c',opacity:.17}),0,-2.6,0);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
  const fill=new THREE.DirectionalLight(finish.fill,finish.fillPower);fill.position.set(7,3,-3);scene.add(fill);
  scene.add(new THREE.HemisphereLight('#ffffff',finish.ground,finish.ambient));
  return {scene,pivot};
}
function environment(renderer){
  const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(room,.04);room.dispose();generator.dispose();return target;
}
function rendererFor(canvas,book=false){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:book});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0x000000,0);return renderer;
}
function cameraFor(rect,book=false){
  const aspect=rect.width/rect.height,camera=new THREE.PerspectiveCamera(35,aspect,.5,60);
  const distance=Math.max(4.5/(2*Math.tan(THREE.MathUtils.degToRad(17.5))),4.5/(2*Math.tan(THREE.MathUtils.degToRad(17.5))*aspect))*(book?1.18:1.24);
  camera.position.set(0,.25,distance);camera.lookAt(0,0,0);return camera;
}

// One scissored renderer serves all four collection figures; Folio has one
// additional small renderer inside the physically transformed book page.
export function createSculptedLogos(edition,signal){
  const finish=finishes[edition],figures=[...document.querySelectorAll('[data-art]')];
  const canvas=document.createElement('canvas');canvas.className='app-world';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
  let renderer,env,bookRenderer,bookEnv,data,models=[],views=[],bookViews=[],bookCamera,bookCanvas,bookHost;
  let ready=false,closed=false,lost=false,bookLost=false,painted=false,size={width:0,height:0},bookSize={width:0,height:0},selected=Number(document.querySelector('.book-leaf')?.dataset.logoIndex||0);
  const cameras=new Map(),records=[];
  function release(){
    if(closed)return;closed=true;ready=false;
    const geometries=new Set(),materials=new Set();
    models.forEach(model=>model.traverse(object=>{if(object.geometry)geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).filter(Boolean).forEach(material=>materials.add(material));}));
    [...views,...bookViews].forEach(view=>view.scene.traverse(object=>{object.shadow?.dispose();if(object.geometry)geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).filter(Boolean).forEach(material=>materials.add(material));}));
    geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());data?.title.dispose();env?.dispose();bookEnv?.dispose();renderer?.dispose();bookRenderer?.dispose();canvas.remove();bookCanvas?.remove();
    figures.forEach(figure=>figure.classList.remove('model-ready'));bookHost?.classList.remove('model-ready');records.forEach(record=>record.button.remove());
  }
  async function load(){
    try{
      data=await loadSculptedAssets(signal);if(closed||signal.aborted){data.title.dispose();return;}
      renderer=rendererFor(canvas);renderer.autoClear=false;env=environment(renderer);
      models=names.map((name,i)=>normalize(createSculptedLogo(i,data,edition)));
      views=models.map(model=>litScene(model,finish,env.texture));
      figures.forEach((figure,index)=>{
        const button=document.createElement('button');button.type='button';button.className='logo-turn';button.setAttribute('aria-label','Turn '+names[index]+' logo');button.innerHTML='<span>Turn ↗</span>';figure.append(button);
        const record={figure,index,button,x:0,y:0,dx:0,dy:0,turn:0,target:0};records.push(record);
        button.addEventListener('pointermove',event=>{
          if(event.pointerType==='touch')return;const rect=figure.getBoundingClientRect();record.x=(event.clientX-rect.left)/rect.width*2-1;record.y=(event.clientY-rect.top)/rect.height*2-1;
        },{signal});
        button.addEventListener('pointerleave',()=>{record.x=record.y=0;},{signal});
        button.addEventListener('blur',()=>{record.x=record.y=0;},{signal});
        button.addEventListener('click',()=>{record.target=record.target>.1?-.34:.42;},{signal});
      });
      bookHost=document.querySelector('.leaf-art');
      if(bookHost){
        bookCanvas=document.createElement('canvas');bookCanvas.className='leaf-world';bookCanvas.setAttribute('aria-hidden','true');bookHost.append(bookCanvas);
        bookRenderer=rendererFor(bookCanvas,true);bookEnv=environment(bookRenderer);bookViews=models.map(model=>litScene(model,finish,bookEnv.texture));
      }
      canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;figures.forEach(figure=>figure.classList.remove('model-ready'));},{signal});
      bookCanvas?.addEventListener('webglcontextlost',event=>{event.preventDefault();bookLost=true;bookHost.classList.remove('model-ready');},{signal});
      ready=true;
    }catch(error){if(!signal.aborted){canvas.dataset.state='still';}release();}
  }
  document.addEventListener('folio-select',event=>{selected=event.detail.index;},{signal});
  load();
  return {
    update(time,dt){
      if(!ready||closed||signal.aborted||document.hidden)return;
      const width=document.documentElement.clientWidth,height=innerHeight;
      if(size.width!==width||size.height!==height){size={width,height};renderer.setPixelRatio(Math.min(devicePixelRatio,width<700?1.25:1.5));renderer.setSize(width,height,false);}
      if(!lost){
        const visible=records.filter(record=>{const rect=record.figure.getBoundingClientRect();record.rect=rect;return rect.bottom>0&&rect.top<height&&rect.right>0&&rect.left<width&&rect.width&&rect.height;});
        if(visible.length||painted){renderer.setScissorTest(false);renderer.clear();}
        renderer.setScissorTest(true);const shown=[];
        visible.forEach(record=>{
          const {figure,index,rect}=record;
          const key=rect.width+'x'+rect.height;
          if(!cameras.has(key))cameras.set(key,cameraFor(rect));
          record.dx=THREE.MathUtils.damp(record.dx,record.x,4,dt);record.dy=THREE.MathUtils.damp(record.dy,record.y,4,dt);record.turn=THREE.MathUtils.damp(record.turn,record.target,4,dt);
          const view=views[index];view.pivot.rotation.set(-.045+record.dy*.1,(index%2?.2:-.23)+record.dx*.25+record.turn+(edition==='nocturne'?Math.sin(time*.25+index)*.025:0),edition==='chroma'?-.045:0);
          renderer.setViewport(rect.left,height-rect.bottom,rect.width,rect.height);
          renderer.setScissor(Math.max(0,rect.left),Math.max(0,height-rect.bottom),Math.min(width,rect.right)-Math.max(0,rect.left),Math.min(height,rect.bottom)-Math.max(0,rect.top));
          renderer.clearDepth();renderer.render(view.scene,cameras.get(key));figure.classList.add('model-ready');shown.push(String(index));
        });
        renderer.setScissorTest(false);painted=shown.length>0;
        const rendered=shown.join(',');if(canvas.dataset.rendered!==rendered)canvas.dataset.rendered=rendered;
      }
      if(bookRenderer&&!bookLost&&bookHost&&document.querySelector('.book-leaf').dataset.logoIndex!==undefined){
        const rect=bookHost.getBoundingClientRect(),w=bookHost.clientWidth,h=bookHost.clientHeight;
        if(rect.bottom>0&&rect.top<height&&w&&h){
          if(bookSize.width!==w||bookSize.height!==h){bookSize={width:w,height:h};bookRenderer.setPixelRatio(Math.min(devicePixelRatio,1.5));bookRenderer.setSize(w,h,false);bookCamera=cameraFor({width:w,height:h},true);}
          const view=bookViews[selected];view.pivot.rotation.set(-.04,-.2+Math.sin(time*.2)*.025,0);bookRenderer.render(view.scene,bookCamera);bookHost.classList.add('model-ready');bookCanvas.dataset.project=names[selected];
        }
      }
    },dispose:release
  };
}
