import * as THREE from '../vendor/three.module.js';

const W=3.4,H=4.6,TW=480,TH=650;
const clamp=value=>Math.min(1,Math.max(0,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
const range=(p,a,b)=>smooth((p-a)/(b-a));
const intervals=[[.025,.20],[.355,.435],[.575,.655],[.795,.875]];

// Integrate the paper's tangent across its width. Each row has a slightly
// different curl, lifting the free corner before the body follows it.
export function paperPoint(u,v,turn,rigid=false){
  const envelope=Math.sin(Math.PI*turn);
  const base=Math.PI*turn-(rigid?0:envelope*.42);
  const curvature=rigid?0:envelope*(1.25+(v-.5)*.18);
  let x,z;
  if(Math.abs(curvature)<1e-6){x=W*u*Math.cos(base);z=W*u*Math.sin(base);}
  else{x=W*(Math.sin(base+curvature*u)-Math.sin(base))/curvature;z=W*(Math.cos(base)-Math.cos(base+curvature*u))/curvature;}
  if(!rigid)z+=envelope*.035*u*u*(v-.5);
  return [x,(v-.5)*H+(rigid?0:envelope*.025*Math.sin(Math.PI*u)*(v-.5)),z];
}

function surface(nx,ny,back=false){
  const geometry=new THREE.BufferGeometry(),positions=[],uvs=[],indices=[];
  for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){
    positions.push(0,0,0);uvs.push(back?1-x/nx:x/nx,y/ny);
  }
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
    const a=y*(nx+1)+x,b=a+1,d=a+nx+1,c=d+1;
    if(back)indices.push(a,d,b,b,d,c);else indices.push(a,b,d,b,c,d);
  }
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
  geometry.userData={nx,ny,back};return geometry;
}

function deform(geometry,turn,thickness,rigid){
  const {nx,ny,back}=geometry.userData,positions=geometry.attributes.position;
  for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){
    const [px,py,pz]=paperPoint(x/nx,y/ny,turn,rigid);
    // A small true separation gives the paper a visible, warm edge.
    const angle=Math.PI*turn+(rigid?0:Math.sin(Math.PI*turn)*((1.25*x/nx-.42)+(y/ny-.5)*.18*x/nx));
    const side=(back?-thickness:thickness)/2;
    positions.setXYZ(y*(nx+1)+x,px-Math.sin(angle)*side,py,pz+Math.cos(angle)*side);
  }
  positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
}

function makeEdges(nx,ny){
  const vertices=[],indices=[],samples=[];
  for(let x=0;x<=nx;x++)samples.push([x/nx,0]);
  for(let y=1;y<=ny;y++)samples.push([1,y/ny]);
  for(let x=nx-1;x>=0;x--)samples.push([x/nx,1]);
  for(let y=ny-1;y>=0;y--)samples.push([0,y/ny]);
  samples.forEach(()=>vertices.push(0,0,0,0,0,0));
  for(let i=0;i<samples.length;i++){const a=i*2,b=((i+1)%samples.length)*2;indices.push(a,a+1,b,a+1,b+1,b);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.userData.samples=samples;return geometry;
}

function deformEdges(geometry,turn,thickness,rigid){
  geometry.userData.samples.forEach(([u,v],i)=>{
    const [x,y,z]=paperPoint(u,v,turn,rigid);
    const angle=Math.PI*turn+(rigid?0:Math.sin(Math.PI*turn)*((1.25*u-.42)+(v-.5)*.18*u));
    const dx=-Math.sin(angle)*thickness/2,dz=Math.cos(angle)*thickness/2;
    geometry.attributes.position.setXYZ(i*2,x+dx,y,z+dz);
    geometry.attributes.position.setXYZ(i*2+1,x-dx,y,z-dz);
  });
  geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
}

function image(src,signal){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    const abort=()=>{img.src='';reject(new DOMException('Aborted','AbortError'));};
    signal.addEventListener('abort',abort,{once:true});
    img.onload=()=>{signal.removeEventListener('abort',abort);resolve(img);};
    img.onerror=()=>{signal.removeEventListener('abort',abort);reject(new Error('Folio artwork unavailable'));};
    if(signal.aborted)abort();else img.src=src;
  });
}

function texture(paint){
  const canvas=document.createElement('canvas');canvas.width=TW*2;canvas.height=TH*2;
  const context=canvas.getContext('2d');context.scale(2,2);paint(context);
  const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;result.anisotropy=4;return result;
}

function paper(context,dark=false,cloth=false){
  context.fillStyle=cloth?'#374a36':dark?'#26322a':'#f0eadc';context.fillRect(0,0,TW,TH);
  let seed=77;
  for(let i=0;i<16000;i++){
    seed=(seed*1664525+1013904223)>>>0;const x=(seed/4294967296)*TW;
    seed=(seed*1664525+1013904223)>>>0;const y=(seed/4294967296)*TH;
    context.fillStyle=i%2?'#ffffff09':'#21271c09';context.fillRect(x,y,.6,cloth?3:.6);
  }
  const gutter=context.createLinearGradient(0,0,36,0);gutter.addColorStop(0,dark?'#00000045':'#544b2c28');gutter.addColorStop(1,'#00000000');context.fillStyle=gutter;context.fillRect(0,0,36,TH);
  context.strokeStyle=cloth?'#b9c49470':dark?'#d6c5a133':'#72765b25';context.lineWidth=.65;context.strokeRect(20,20,TW-40,TH-40);
}

function contain(context,img,x,y,w,h){const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;context.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);}
function wrap(context,text,x,y,width,lineHeight){
  let line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&context.measureText(next).width>width){context.fillText(line,x,y);y+=lineHeight;line=word;}else line=next;}if(line)context.fillText(line,x,y);
}
function lines(context,text,x,y,lineHeight){text.split('\n').forEach((line,i)=>context.fillText(line,x,y+i*lineHeight));}
function textOf(element){const clone=element.cloneNode(true);clone.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));return clone.textContent.trim().replace(/[ \t]+/g,' ');}

function printFront(context,article,img,index){
  const dark=index===3,ink=dark?'#e6d8b4':'#282e25';paper(context,dark);
  context.fillStyle=ink;context.font='10px "DM Sans"';context.fillText(textOf(article.querySelector('.page-top span')).toUpperCase(),42,50);context.textAlign='right';context.fillText('gLitCh Labs.',438,50);context.textAlign='left';
  contain(context,img,index===3?58:105,index===3?85:102,index===3?364:270,index===3?305:270);
  context.fillStyle=ink;context.font='400 48px "Cormorant Garamond"';context.letterSpacing='-1.6px';lines(context,textOf(article.querySelector('h2')),42,446,46);
  context.letterSpacing='0px';context.font='14px "DM Sans"';context.fillStyle=dark?'#bcc4b4':'#6e7263';wrap(context,textOf(article.querySelector('.page-description')),42,532,396,21);
  const link=article.querySelector('.text-link');context.fillStyle=ink;context.font='13px "DM Sans"';const label=textOf(link).replace(/\s*↗$/,'');context.fillText(label+'  ↗',42,608);context.fillRect(42,618,context.measureText(label+'  ↗').width,1);
  const label2=textOf(article.querySelector('.page-bottom>span'));context.font='10px "DM Sans"';context.textAlign='right';context.fillText(label2,438,608);context.textAlign='left';
}

function printBack(context,article,img,index){
  paper(context);context.fillStyle='#667455';context.font='10px "DM Sans"';context.fillText('gLitCh Labs.',42,50);context.textAlign='right';context.fillText(`0${index+1} / NOTES`,438,50);context.textAlign='left';
  context.font='80px "Cormorant Garamond"';context.fillText('0'+(index+1),42,145);
  context.fillStyle='#282e25';context.font='44px "Cormorant Garamond"';lines(context,textOf(article.querySelector('.page-back h3')),42,222,44);
  context.fillStyle='#6e7263';context.font='14px "DM Sans"';wrap(context,textOf(article.querySelector('.page-back>p')),42,345,350,23);contain(context,img,42,445,105,100);
  context.font='10px "DM Sans"';context.fillText(textOf(article.querySelector('.back-bottom')).toUpperCase(),42,610);
}

// Exact planar projection for the readable HTML on a settled sheet. The
// turning sheet uses the same print on its curved mesh until it lands.
function homography(points){
  const source=[[0,0],[TW,0],[TW,TH],[0,TH]],matrix=[];
  source.forEach(([x,y],i)=>{const [u,v]=points[i];matrix.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
  for(let c=0;c<8;c++){
    let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(matrix[r][c])>Math.abs(matrix[pivot][c]))pivot=r;
    [matrix[c],matrix[pivot]]=[matrix[pivot],matrix[c]];const factor=matrix[c][c];for(let j=c;j<9;j++)matrix[c][j]/=factor;
    for(let r=0;r<8;r++)if(r!==c){const k=matrix[r][c];for(let j=c;j<9;j++)matrix[r][j]-=k*matrix[c][j];}
  }
  const [a,b,c,d,e,f,g,h]=matrix.map(row=>row[8]);return `matrix3d(${[a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1].join(',')})`;
}

export async function createCurvedBook(stage,signal){
  const articles=[...stage.querySelectorAll('.entity-sheet')],cover=stage.querySelector('.cover-sheet');
  const sheets=[cover,...articles],saved=sheets.map(el=>el.getAttribute('style'));
  const artwork=await Promise.all([cover.querySelector('img'),...articles.map(el=>el.querySelector('.page-figure img'))].map(el=>image(el.src,signal)));
  if(signal.aborted)throw new DOMException('Aborted','AbortError');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch(error){throw error;}
  renderer.domElement.className='paper-world';renderer.domElement.setAttribute('aria-hidden','true');stage.prepend(renderer.domElement);
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-6,6,5,-5,.1,50);camera.position.set(0,0,14);
  const root=new THREE.Group();scene.add(root);
  scene.add(new THREE.AmbientLight('#f9f5e9',1.6));
  const key=new THREE.DirectionalLight('#fff6df',2.4);key.position.set(-3,5,9);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-8,right:8,top:7,bottom:-7,near:.1,far:25});key.shadow.bias=-.00018;key.shadow.normalBias=.015;key.shadow.radius=3.5;scene.add(key);
  const fill=new THREE.DirectionalLight('#dfe6ed',.65);fill.position.set(5,1,4);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.16}));ground.position.z=-.22;ground.receiveShadow=true;scene.add(ground);
  const textures=[];const keep=map=>{textures.push(map);return map;};
  const blanks=[false,true].map(dark=>keep(texture(c=>paper(c,dark))));
  const coverBlank=keep(texture(c=>paper(c,false,true)));
  const coverFront=keep(texture(c=>{
    paper(c,false,true);c.fillStyle='#e9e4c8';c.font='500 16px Space';c.fillText('gLitCh Labs.',38,48);
    c.font='62px "Cormorant Garamond"';lines(c,'A small\ncollection\nof possibilities.',38,235,59);contain(c,artwork[0],38,474,76,76);
    c.font='9px "DM Sans"';c.fillText('AN INDEPENDENT STUDIO',38,620);c.textAlign='right';c.fillText('VOL. 01 — 04',442,620);
  }));
  const coverBack=keep(texture(c=>{
    paper(c);c.fillStyle='#38472f';c.font='16px Space';c.fillText('gLitCh Labs.',42,50);
    c.fillStyle='#282e25';c.font='44px "Cormorant Garamond"';lines(c,'Independent\nby nature.\nCurious by choice.',42,225,45);
    c.fillStyle='#6e7263';c.font='14px "DM Sans"';lines(c,'Focused apps. Imagined worlds.\nDifferent projects, the same attention to detail.',42,380,23);contain(c,artwork[0],42,465,90,90);c.font='10px "DM Sans"';c.fillText('A SMALL STUDIO. WIDE OPEN MIND.',42,610);
  }));
  const records=sheets.map((element,index)=>{
    const rigid=index===0,nx=rigid?1:64,ny=rigid?1:22,group=new THREE.Group();root.add(group);
    const frontMap=rigid?coverFront:keep(texture(c=>printFront(c,articles[index-1],artwork[index],index-1)));
    const backMap=rigid?coverBack:keep(texture(c=>printBack(c,articles[index-1],artwork[index],index-1)));
    const frontMaterial=new THREE.MeshStandardMaterial({map:frontMap,roughness:rigid?.91:.84,metalness:0});
    const backMaterial=new THREE.MeshStandardMaterial({map:backMap,roughness:.88,metalness:0});
    const front=surface(nx,ny),back=surface(nx,ny,true),edge=makeEdges(nx,ny);
    const edgeMaterial=new THREE.MeshStandardMaterial({color:rigid?'#283d2b':'#d0c5a9',roughness:1,side:THREE.DoubleSide});
    [new THREE.Mesh(front,frontMaterial),new THREE.Mesh(back,backMaterial),new THREE.Mesh(edge,edgeMaterial)].forEach(mesh=>{mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);});
    return {element,index,rigid,group,front,back,edge,frontMaterial,frontMap,blank:rigid?coverBlank:blanks[index===4?1:0],turn:-1};
  });
  const board=new THREE.Mesh(new THREE.BoxGeometry(W+.05,H+.05,.045),new THREE.MeshStandardMaterial({color:'#30442f',roughness:.95}));board.position.set(W/2,0,-.075);board.castShadow=true;board.receiveShadow=true;root.add(board);
  const stackMap=keep(texture(c=>{c.fillStyle='#d6cbb2';c.fillRect(0,0,TW,TH);for(let y=0;y<TH;y+=5){c.fillStyle=y%10?'#bfb49a':'#efe6d2';c.fillRect(0,y,TW,1);}}));
  const stack=new THREE.Mesh(new THREE.BoxGeometry(W-.02,H-.02,.08),new THREE.MeshStandardMaterial({color:'#eee5ce',map:stackMap,roughness:1}));stack.position.set(W/2,0,-.015);stack.castShadow=true;stack.receiveShadow=true;root.add(stack);
  let width=0,height=0,progress=0,dirty=true,settleFrames=2,visible=true,disposed=false,lastPose='',framing;
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;stage.dataset.renderVisible=String(visible);if(visible)dirty=true;},{rootMargin:'100px'});observer.observe(stage);
  const projection=new THREE.Vector3();
  function overlay(record){
    const z=record.group.position.z+(record.rigid?.045:.009)/2;
    const corners=[[0,H/2,z],[W,H/2,z],[W,-H/2,z],[0,-H/2,z]].map(point=>{
      projection.set(...point).applyMatrix4(root.matrixWorld).project(camera);return [(projection.x+1)*width/2,(1-projection.y)*height/2];
    });
    record.element.style.transform=homography(corners);
  }
  function pose(){
    if(disposed)return;
    const open=range(progress,.015,.215),phone=framing.single;
    const turns=intervals.map(bounds=>range(progress,...bounds));
    const signature=[open,...turns].join('|');
    if(signature===lastPose)return;lastPose=signature;
    const turning=turns.findIndex(turn=>turn>0&&turn<1);
    const turn=turning<0?0:turns[turning];
    const closeup=turning<0?0:Math.sin(Math.PI*turn)*(turning===0?.75:1);
    const zoom=THREE.MathUtils.lerp(1,framing.turnHeight/framing.pageHeight,closeup);
    const scale=THREE.MathUtils.lerp(framing.coverScale,1,open)*zoom;
    root.rotation.set(THREE.MathUtils.lerp(.11,THREE.MathUtils.lerp(phone?.045:.075,.025,closeup),open),THREE.MathUtils.lerp(-.32,0,open),THREE.MathUtils.lerp(-.075,0,open));
    root.scale.setScalar(scale);
    // On narrow screens follow the curling leaf toward the spine, rather than
    // leaving most of its motion outside the single-page reading frame.
    const focusX=phone?THREE.MathUtils.lerp(W/2,turning<0?W/2:paperPoint(.5,.5,turn,turning===0)[0],closeup*.6):0;
    const anchor=new THREE.Vector3(focusX,0,0).multiplyScalar(scale).applyEuler(root.rotation);
    const centerX=THREE.MathUtils.lerp(framing.coverX,width/2,open);
    const centerY=THREE.MathUtils.lerp(framing.coverY,THREE.MathUtils.lerp(framing.readY,framing.turnY,closeup),open);
    root.position.set((centerX-width/2)*H/framing.pageHeight-anchor.x,(height/2-centerY)*H/framing.pageHeight-anchor.y,0);
    document.body.classList.toggle('paper-open',progress>.13);
    document.body.classList.toggle('paper-turning',turning>0);
    let moving=false;
    records.forEach((record,index)=>{
      const turn=turns[index]??0;
      if(turn>0&&turn<1)moving=true;
      record.group.position.z=THREE.MathUtils.lerp(.12-index*.018,.035+index*.018,turn);
      if(turn!==record.turn){
        deform(record.front,turn,record.rigid?.045:.009,record.rigid);deform(record.back,turn,record.rigid?.045:.009,record.rigid);deformEdges(record.edge,turn,record.rigid?.045:.009,record.rigid);record.turn=turn;
      }
    });
    let exposed=0;
    for(let i=0;i<4;i++)if(records[i].turn===1)exposed=i+1;
    root.updateMatrixWorld(true);camera.updateMatrixWorld();
    records.forEach((record,index)=>{
      const html=index===exposed&&!moving;
      record.element.style.opacity=html?'1':'0';
      record.frontMaterial.map=html?record.blank:record.frontMap;
      if(html)overlay(record);
    });
    stage.dataset.paperState=moving?'turning':exposed===0?'cover':'reading';
    stage.dataset.paperTurn=records.findIndex(record=>record.turn>0&&record.turn<1).toString();
    dirty=true;settleFrames=2;
  }
  function resize(){
    width=stage.clientWidth;height=stage.clientHeight;lastPose='';
    const phone=width<=700,compact=phone&&height<650;
    const single=phone&&!(width>=480&&height<700);
    const readTop=phone?(compact?70:96):108;
    const readBottom=height-(phone?174:132);
    const turnTop=phone?70:94;
    const turnBottom=height-(phone?128:96);
    const pageHeight=Math.max(140,Math.min(readBottom-readTop,width*.94/(single?W/H:2*W/H),1000));
    const turnHeight=Math.max(pageHeight,Math.min(turnBottom-turnTop,width*(single?1.06:.97)/(single?W/H:2*W/H),pageHeight*1.18));
    framing={single,pageHeight,turnHeight,readY:(readTop+readBottom)/2,turnY:(turnTop+turnBottom)/2,coverScale:phone?(compact?.84:.9):.94,coverX:single&&compact?width*.73:width/2,coverY:phone?(compact?(100+height-176)/2:height*.52):(readTop+readBottom)/2};
    const dpr=Math.min(devicePixelRatio,phone?1.25:1.5);renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);
    const viewH=H*height/pageHeight,viewW=viewH*width/height;
    Object.assign(camera,{left:-viewW/2,right:viewW/2,top:viewH/2,bottom:-viewH/2});camera.updateProjectionMatrix();pose();
  }
  function draw(){
    if(disposed||(!dirty&&settleFrames<=0)||!visible||document.hidden)return;
    renderer.shadowMap.needsUpdate=dirty;renderer.render(scene,camera);stage.dataset.paintedProgress=progress.toFixed(3);dirty=false;settleFrames--;
  }
  function dispose(){
    if(disposed)return;disposed=true;observer.disconnect();
    const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);object.shadow?.dispose();});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();document.body.classList.remove('paper-open','paper-turning');
    sheets.forEach((el,i)=>{if(saved[i]===null)el.removeAttribute('style');else el.setAttribute('style',saved[i]);});delete stage.dataset.paperState;delete stage.dataset.paperTurn;delete stage.dataset.renderVisible;delete stage.dataset.paintedProgress;
  }
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();document.dispatchEvent(new Event('folio-render-unavailable'));},{signal});
  return {resize,setProgress(value){if(progress!==value){progress=value;pose();}},draw,dispose};
}
