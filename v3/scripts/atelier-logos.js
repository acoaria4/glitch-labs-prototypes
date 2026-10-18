import * as THREE from '../vendor/three.module.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';
import {loadSculptedAssets} from './sculpted-logos.js?v=2';
import {createAtelierLogo} from './atelier-models.js?v=atelier-2';
const names=['Expenses','AURA','Lumen','Afterlight'];
const lighting={
  nocturne:{key:'#ffdfaf',power:3.8,fill:'#bdcbe0',fillPower:.6,ambient:.55,ground:'#211a11'},
  folio:{key:'#fff1d5',power:2.7,fill:'#eff4ff',fillPower:.55,ambient:.9,ground:'#665542',print:true},
  chroma:{key:'#f4fff9',power:3.5,fill:'#c5b7ff',fillPower:1.7,ambient:1,ground:'#687579'}
};
function mesh(parent,geometry,material,x=0,y=0,z=0){const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;}
function opticalBackdrop(color){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const paint=canvas.getContext('2d');
  paint.fillStyle=color;paint.fillRect(0,0,512,512);
  const glow=paint.createRadialGradient(90,60,0,90,60,580);glow.addColorStop(0,'#ffffff36');glow.addColorStop(1,'#ffffff00');paint.fillStyle=glow;paint.fillRect(0,0,512,512);
  // Quiet optical registration lines make the refraction visible through the cast.
  paint.strokeStyle='#ffffff36';paint.lineWidth=1;
  [180,330].forEach(y=>{paint.beginPath();paint.moveTo(0,y);paint.lineTo(512,y-48);paint.stroke();});
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function normalize(object){
  const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  object.position.sub(center);const root=new THREE.Group();root.add(object);root.scale.setScalar(4.5/Math.max(size.x,size.y));return root;
}
export function createSculptedLogo(index,data,edition='nocturne'){
  return createAtelierLogo(index,data,edition);
}
function litScene(model,finish,environment){
  const scene=new THREE.Scene();scene.environment=environment;
  const pivot=new THREE.Group();pivot.add(model.clone(true));scene.add(pivot);
  pivot.traverse(object=>{if(object.isMesh){const list=Array.isArray(object.material)?object.material:[object.material];object.castShadow=!finish.print&&!list.some(material=>material.isMeshBasicMaterial||material.transmission>.5);}});
  const key=new THREE.DirectionalLight(finish.key,finish.power);key.position.set(-5,7,8);scene.add(key);
  if(!finish.print){
    key.castShadow=true;key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:24});key.shadow.bias=-.0002;key.shadow.normalBias=.025;
    const floor=mesh(scene,new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:'#21170c',opacity:.17}),0,-2.6,0);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
  }
  const fill=new THREE.DirectionalLight(finish.fill,finish.fillPower);fill.position.set(7,3,-3);scene.add(fill);
  scene.add(new THREE.HemisphereLight('#ffffff',finish.ground,finish.ambient));
  return {scene,pivot,key};
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

// Render each figure into a local target before compositing it. Transmission and
// shadow passes change WebGL viewport/scissor state internally; isolating those
// passes also keeps glass refraction local to its panel at every scroll position.
function drawFigure(renderer,view,camera,rect,width,height){
  const ratio=renderer.getPixelRatio(),w=Math.max(1,Math.round(rect.width*ratio)),h=Math.max(1,Math.round(rect.height*ratio));
  if(!view.target){
    const floating=renderer.extensions.has('EXT_color_buffer_float')||renderer.extensions.has('EXT_color_buffer_half_float');
    view.target=new THREE.WebGLRenderTarget(w,h,{type:floating?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:true,samples:Math.min(4,renderer.capabilities.maxSamples)});
    view.composite=new THREE.Scene();view.compositeCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    mesh(view.composite,new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:view.target.texture,transparent:true,depthTest:false,depthWrite:false}));
  }
  if(view.target.width!==w||view.target.height!==h)view.target.setSize(w,h);
  renderer.setScissorTest(false);renderer.setRenderTarget(view.target);renderer.clear();renderer.render(view.scene,camera);
  renderer.setRenderTarget(null);renderer.setViewport(rect.left,height-rect.bottom,rect.width,rect.height);
  renderer.setScissor(Math.max(0,rect.left),Math.max(0,height-rect.bottom),Math.min(width,rect.right)-Math.max(0,rect.left),Math.min(height,rect.bottom)-Math.max(0,rect.top));
  renderer.setScissorTest(true);renderer.render(view.composite,view.compositeCamera);
}

// One scissored renderer serves all four collection figures; Folio has one
// additional small renderer inside the physically transformed book page.
export function createSculptedLogos(edition,signal){
  const finish=lighting[edition],figures=[...document.querySelectorAll('[data-art]')];
  const canvas=document.createElement('canvas');canvas.className='app-world';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
  let renderer,env,bookRenderer,bookEnv,data,models=[],views=[],bookViews=[],bookCamera,bookCanvas,bookHost;
  let ready=false,closed=false,lost=false,bookLost=false,painted=false,size={width:0,height:0},bookSize={width:0,height:0},selected=Number(document.querySelector('.book-leaf')?.dataset.logoIndex||0);
  const cameras=new Map(),records=[];
  function release(){
    if(closed)return;closed=true;ready=false;
    if(document.body.dataset.logoState!=='fallback')document.body.dataset.logoState='still';
    const geometries=new Set(),materials=new Set();
    models.forEach(model=>model.traverse(object=>{if(object.geometry)geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).filter(Boolean).forEach(material=>materials.add(material));}));
    [...views,...bookViews].forEach(view=>view.scene.traverse(object=>{object.shadow?.dispose();if(object.geometry)geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).filter(Boolean).forEach(material=>materials.add(material));}));
    views.forEach(view=>{view.target?.dispose();view.scene.background?.dispose?.();view.composite?.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});});
    geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());data?.title.dispose();env?.dispose();bookEnv?.dispose();renderer?.dispose();bookRenderer?.dispose();canvas.remove();bookCanvas?.remove();
    figures.forEach(figure=>figure.classList.remove('model-ready'));bookHost?.classList.remove('model-ready');records.forEach(record=>record.button.remove());
  }
  async function load(){
    document.body.dataset.logoState='loading';
    try{
      data=await loadSculptedAssets(signal);if(closed||signal.aborted){data.title.dispose();return;}
      renderer=rendererFor(canvas);renderer.autoClear=false;env=environment(renderer);
      if(edition==='chroma')renderer.setClearColor('#dce5e1',0);
      models=names.map((name,i)=>normalize(createSculptedLogo(i,data,edition)));
      views=models.map(model=>litScene(model,finish,env.texture));
      if(edition==='chroma')views.forEach((view,i)=>{view.scene.background=opticalBackdrop(getComputedStyle(figures[i]).backgroundColor);});
      figures.forEach((figure,index)=>{
        const button=document.createElement('button');button.type='button';button.className='logo-turn';button.setAttribute('aria-label',(edition==='folio'?'Light ':'Turn ')+names[index]+' logo');button.innerHTML=edition==='folio'?'<span>Catch the foil ↗</span>':'<span>Turn ↗</span>';figure.append(button);
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
      ready=true;document.body.dataset.logoState='ready';
    }catch(error){if(!signal.aborted){document.body.dataset.logoState='fallback';console.warn('App sculptures unavailable',error);}release();}
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
          const view=views[index];view.pivot.rotation.set(edition==='folio'?.005+record.dy*.025:-.045+record.dy*.1,edition==='folio'?record.dx*.04+record.turn*.15:(index%2?.2:-.23)+record.dx*.25+record.turn,edition==='chroma'?-.045:0);
          renderer.setViewport(rect.left,height-rect.bottom,rect.width,rect.height);
          renderer.setScissor(Math.max(0,rect.left),Math.max(0,height-rect.bottom),Math.min(width,rect.right)-Math.max(0,rect.left),Math.min(height,rect.bottom)-Math.max(0,rect.top));
          if(edition==='folio')view.key.position.set(-5+record.dx*4+record.turn*10,7,8);
          renderer.clearDepth();drawFigure(renderer,view,cameras.get(key),rect,width,height);figure.classList.add('model-ready');shown.push(String(index));
        });
        renderer.setScissorTest(false);painted=shown.length>0;
        const rendered=shown.join(',');if(canvas.dataset.rendered!==rendered)canvas.dataset.rendered=rendered;
      }
      if(bookRenderer&&!bookLost&&bookHost&&document.querySelector('.book-leaf').dataset.logoIndex!==undefined){
        const rect=bookHost.getBoundingClientRect(),w=bookHost.clientWidth,h=bookHost.clientHeight;
        if(rect.bottom>0&&rect.top<height&&w&&h){
          if(bookSize.width!==w||bookSize.height!==h){bookSize={width:w,height:h};bookRenderer.setPixelRatio(Math.min(devicePixelRatio,1.5));bookRenderer.setSize(w,h,false);bookCamera=cameraFor({width:w,height:h},true);}
          const view=bookViews[selected];view.pivot.rotation.set(0,-.025,0);bookRenderer.render(view.scene,bookCamera);bookHost.classList.add('model-ready');bookCanvas.dataset.project=names[selected];
        }
      }
    },dispose:release
  };
}
