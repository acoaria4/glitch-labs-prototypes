import * as THREE from '../vendor/three.module.js';
import {SVGLoader} from '../vendor/SVGLoader.js';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';

// Geometry is shared across finishes. Lumen's sheets are closed curved surfaces;
// Afterlight combines the supplied silhouette with freestanding architectural parts.
export const finishes={
  cobalt:{gold:'#d4ad62',roughness:.22,metalness:.94,edge:'#4b3018'},
  midnight:{gold:'#c9a263',roughness:.24,metalness:.96,edge:'#35291f'},
  gallery:{gold:'#a77b42',roughness:.33,metalness:.91,edge:'#433023'},
  'gallery-dark':{gold:'#c29955',roughness:.25,metalness:.96,edge:'#352316'},
  portal:{gold:'#b38b53',roughness:.32,metalness:.91,edge:'#3b291e'},
  nocturne:{gold:'#c3a06a',roughness:.28,metalness:.96,edge:'#34261b',quiet:true},
  folio:{gold:'#9b7438',roughness:.4,metalness:.87,edge:'#795934',print:true},
  chroma:{gold:'#ccb97d',roughness:.19,metalness:.94,edge:'#535d59',glass:true}
};

function add(parent,geometry,material,x=0,y=0,z=0){
  const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;
}
function material(finish,color=finish.gold,kind='metal'){
  if(finish.glass&&kind!=='metal'&&kind!=='recess'){
    const tint=kind==='paper'?'#d6e8df':color;
    return new THREE.MeshPhysicalMaterial({color:new THREE.Color('#ffffff').lerp(new THREE.Color(tint),.18),metalness:0,roughness:kind==='paper'?.3:.12,
      transmission:kind==='paper'?.72:.94,thickness:.7,ior:1.47,attenuationColor:tint,
      attenuationDistance:.7,envMapIntensity:1.2,specularIntensity:.9,clearcoat:.5,clearcoatRoughness:.12,
      side:THREE.FrontSide}); // Closed volumes already have outward-facing backs.
  }
  const paper=kind==='paper',enamel=kind==='enamel',recess=kind==='recess';
  return new THREE.MeshPhysicalMaterial({color:paper?(finish.quiet?'#e5d9bd':color):recess?finish.edge:color,
    metalness:paper?.08:enamel?.32:finish.metalness,roughness:paper?.5:enamel?.26:recess?.4:finish.roughness,
    envMapIntensity:paper?.65:recess?.65:1.1,clearcoat:enamel?.5:.15,clearcoatRoughness:.22});
}
function tube(parent,points,radius,mat,segments=40){
  return add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),segments,radius,8,false),mat);
}

// Build separate front/back grids and edge walls. The sheets have real thickness,
// smooth face normals and crisp seams; no coincident planes or moving vertices.
function curvedSlab(sample,thickness,nu=32,nv=16){
  const positions=[],indices=[],groups=[];
  const a=sample(0,0),b=sample(1,0),c=sample(0,1),flip=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])<0;
  function grid(surface,stepsU,stepsV,reverse,mat){
    const start=positions.length/3,first=indices.length;
    for(let j=0;j<=stepsV;j++)for(let i=0;i<=stepsU;i++)positions.push(...surface(i/stepsU,j/stepsV));
    for(let j=0;j<stepsV;j++)for(let i=0;i<stepsU;i++){
      const a=start+j*(stepsU+1)+i,b=a+1,c=a+stepsU+1,d=c+1;
      indices.push(...(reverse!==flip?[a,c,b,b,c,d]:[a,b,c,b,d,c]));
    }
    groups.push({start:first,count:indices.length-first,materialIndex:mat});
  }
  grid(sample,nu,nv,false,0);
  grid((u,v)=>{const p=sample(u,v);p[2]-=thickness;return p;},nu,nv,true,1);
  [0,1].forEach(v=>grid((u,t)=>{const p=sample(u,v);p[2]-=thickness*t;return p;},nu,1,v===0,1));
  [0,1].forEach(u=>grid((v,t)=>{const p=sample(u,v);p[2]-=thickness*t;return p;},nv,1,u===1,1));
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
  groups.forEach(group=>geometry.addGroup(group.start,group.count,group.materialIndex));geometry.computeVertexNormals();return geometry;
}
function pagePoint(side,u,v,lift=0,expand=0){
  const x=side*(.055+(1.68+expand)*u);
  const top=.18+.58*Math.sin(Math.PI*u*.84)-.10*u+expand;
  const bottom=-1.52+.29*u+.14*Math.sin(Math.PI*u)-expand;
  const y=THREE.MathUtils.lerp(top,bottom,v);
  const arch=.48*Math.sin(Math.PI*u*.86)+.08*u;
  // Curled outer corners and a shallow saddle give the leaves compound curvature.
  const curl=.13*Math.pow(u,5)*Math.cos(Math.PI*v)+.07*Math.sin(Math.PI*v)*u;
  return [x,y,.15+arch+curl+lift*(.12+.88*Math.sin(Math.PI*u/2))];
}
function puffStar(parent,x,y,rx,ry,depth,mat,z=.12){
  const positions=[],indices=[],rings=12,around=64;
  // Two lenticular halves meet at the four-point outline.
  for(let face=0;face<2;face++){
    const start=positions.length/3;
    for(let r=0;r<=rings;r++)for(let i=0;i<=around;i++){
      const t=i/around*Math.PI*2,s=r/rings;
      positions.push(rx*Math.pow(Math.cos(t),3)*s,ry*Math.pow(Math.sin(t),3)*s,(face?-1:1)*depth*Math.sqrt(Math.max(0,1-s*s)));
    }
    for(let r=0;r<rings;r++)for(let i=0;i<around;i++){
      const a=start+r*(around+1)+i,b=a+1,c=a+around+1,d=c+1;
      indices.push(...(face?[a,b,c,b,d,c]:[a,c,b,b,c,d]));
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return add(parent,geometry,mat,x,y,z);
}
function lumen(finish){
  const group=new THREE.Group();group.name='Lumen / curved book';
  const gold=material(finish),recess=material(finish,finish.edge,'recess');
  const ivory=material(finish,'#eee4ce','paper'),edge=material(finish,'#c9b999','paper');
  const blue=material(finish,finish.quiet?'#4d7188':'#147daf','enamel');
  const red=material(finish,finish.quiet?'#a06743':'#bb5b32','enamel');
  [-1,1].forEach(side=>{
    // Bound cover, colored endpaper, one page block and one lifted leaf per side.
    const cover=(u,v)=>{const p=pagePoint(side,u,v,-.19,.11);p[2]-=.13;return p;};
    add(group,curvedSlab(cover,.14),[gold,recess]);
    add(group,curvedSlab((u,v)=>pagePoint(side,u,v,-.08,.075),.055),[side<0?blue:red,gold]);
    add(group,curvedSlab((u,v)=>pagePoint(side,u,v,.045),.17),[ivory,edge]);
    const lifted=(u,v)=>{const p=pagePoint(side,u*.96,v*.94,.29);p[2]+=.12*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);return p;};
    add(group,curvedSlab(lifted,.025),[ivory,edge]);
    // Fine page edges follow the actual curved fore-edge, inset from the cover.
    for(let line=0;line<5;line++){
      const points=Array.from({length:21},(_,i)=>{const p=pagePoint(side,1,i/20,.045);p[2]-=.025+line*.027;return new THREE.Vector3(...p);});
      tube(group,points,.0045,edge,24);
    }
    // A colored bookmark follows the book's contour instead of floating in front.
    const bookmark=curvedSlab((u,v)=>lifted(.66+u*.07,.25+v*.74).map((p,i)=>i===2?p+.018:p),.013,6,20);
    add(group,bookmark,[side<0?blue:gold,side<0?blue:gold]);
  });
  add(group,new RoundedBoxGeometry(.19,1.72,.29,4,.085),gold,0,-.69,.14);
  const binding=add(group,new THREE.SphereGeometry(1,32,16),blue,0,-1.5,.2);binding.scale.set(.23,.105,.16);
  puffStar(group,0,1.39,.64,.73,.19,gold,.2);
  puffStar(group,-1.13,1.01,.35,.43,.13,blue,.15);
  puffStar(group,1.14,1.01,.35,.43,.13,material(finish,finish.quiet?'#a78787':'#bb568d','enamel'),.15);
  [[-.58,1.98,-.7],[.58,1.98,.7],[-.62,.85,.7],[.62,.85,-.7]].forEach(([x,y,angle])=>{
    const ray=add(group,new THREE.CapsuleGeometry(.035,.14,3,8),gold,x,y,.15);ray.rotation.z=angle;
  });
  group.userData.geometry='curved-sheets';return group;
}
function extrude(parent,shape,depth,bevel,mat,z=0){
  return add(parent,new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:4,curveSegments:28}),mat,0,0,z);
}
function polygon(points){const shape=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));shape.closePath();return shape;}
function flameGeometry(points,widths,depths){
  const center=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),positions=[],indices=[],rings=48,around=32;
  function value(values,t){const f=t*(values.length-1),i=Math.min(values.length-2,Math.floor(f));return THREE.MathUtils.lerp(values[i],values[i+1],f-i);}
  for(let j=0;j<=rings;j++){
    const t=j/rings,p=center.getPoint(t),w=value(widths,t),d=value(depths,t);
    for(let i=0;i<=around;i++){const a=i/around*Math.PI*2;positions.push(p.x+Math.cos(a)*w,p.y,p.z+Math.sin(a)*d);}
  }
  for(let j=0;j<rings;j++)for(let i=0;i<around;i++){const a=j*(around+1)+i,b=a+1,c=a+around+1,d=c+1;indices.push(a,c,b,b,c,d);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function afterlight(data,finish){
  const group=new THREE.Group();group.name='Afterlight / architectural crest';
  const crest=new THREE.Group();crest.scale.set(.015,-.015,.015);crest.position.set(-1.92,2.4,0);group.add(crest);
  const gold=material(finish),dark=material(finish,finish.edge,'recess');
  const stone=finish.glass?material(finish,'#7f5c33','enamel'):gold;
  data.paths[3].paths.forEach(path=>{
    const {style,node}=path.userData;
    if(style.fill==='#d6ad70'){
      const main=(node.getAttribute('d')||'').startsWith('M128 65');
      SVGLoader.createShapes(path).forEach(shape=>{
        extrude(crest,shape,main?24:15,main?1.6:1,[stone,dark],main?-5:0);
      });
    }
    if(style.stroke&&style.stroke!=='none')path.subPaths.forEach(subpath=>{
      const points=subpath.getPoints(48).map(p=>new THREE.Vector3(p.x,p.y,5));
      tube(crest,points,4.2,gold,56);
    });
  });
  // Raised roof ridges and narrow inset panels create changing highlights and
  // genuinely recessed faces while keeping the supplied A-shaped outline.
  [[[82,114],[128,68],[128,77],[89,119]],[[128,68],[174,114],[167,119],[128,77]]].forEach(points=>extrude(crest,polygon(points),4,1,[gold,dark],21));
  [86.5,169.5].forEach(x=>{
    add(crest,new RoundedBoxGeometry(6,78,2,3,1),dark,x,166,19.6);
    [x-4.3,x+4.3].forEach(rail=>add(crest,new RoundedBoxGeometry(1.6,87,3,3,.65),gold,rail,165,22));
    [128,202].forEach(y=>{const pin=add(crest,new THREE.SphereGeometry(1.4,12,8),gold,x,y,22);pin.scale.z=.6;});
  });
  // Faceted lance: a raised central ridge catches light independently of its sides.
  const lance=new THREE.BufferGeometry();lance.setAttribute('position',new THREE.Float32BufferAttribute([128,12,15,120,58,15,128,58,25,136,58,15,128,72,15],3));lance.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]);lance.computeVertexNormals();add(crest,lance,gold);
  const ember=material(finish,'#d47a35','enamel');
  if(!finish.glass){ember.emissive.set('#c45717');ember.emissiveIntensity=.08;}
  add(group,flameGeometry([[0,-.55,.45],[-.12,-.39,.48],[-.13,-.12,.5],[.06,.13,.49],[.09,.38,.43],[0,.735,.35]],[.01,.23,.25,.16,.1,0],[.015,.15,.18,.13,.07,0]),ember);
  add(group,flameGeometry([[-.1,-.4,.48],[-.3,-.18,.48],[-.29,.015,.43]],[.1,.08,0],[.08,.07,0]),ember);
  add(group,flameGeometry([[0,-.52,.63],[.05,-.39,.66],[-.04,-.19,.65],[.025,.07,.61]],[0,.11,.085,0],[0,.075,.06,0]),material(finish,'#fff0cd','paper'));
  add(group,new THREE.CylinderGeometry(.31,.18,.15,32),gold,0,-.72,.33);
  add(group,new THREE.CylinderGeometry(.075,.09,.26,24),dark,0,-.92,.33);
  add(group,new THREE.CylinderGeometry(.28,.3,.065,32),gold,0,-1.08,.33);
  add(group,new THREE.PlaneGeometry(4.55,1.1),new THREE.MeshBasicMaterial({map:data.title,transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}),0,-1.9,.1);
  group.userData.geometry='architectural-crest';return group;
}
function originalRelief(index,data,finish){
  const group=new THREE.Group(),unit=index===2?.0158:.0175;
  const art=new THREE.Group();art.scale.set(unit,-unit,unit);art.position.set(-128*unit,128*unit,0);group.add(art);
  data.paths[index].paths.forEach((path,order)=>{
    const {node,style}=path.userData;if(!style.fill||style.fill==='none')return;
    const paper=node.getAttribute('data-metal')==='paper';
    const color=finish.print?style.fill:finish.glass?(index===0?'#b4a1d3':'#c3d8bc'):index<2?finish.gold:style.fill;
    const face=material(finish,color,paper?'paper':index<2?'enamel':'metal');
    if(finish.glass)face.thickness=22; // SVG coordinates become world units at .0175 scale.
    if(node.getAttribute('data-orb')==='true'&&!finish.print){
      const orb=add(art,new THREE.SphereGeometry(Number(node.getAttribute('r')),40,24),face,Number(node.getAttribute('cx')),Number(node.getAttribute('cy')),8);orb.scale.z=.72;return;
    }
    SVGLoader.createShapes(path).forEach(shape=>extrude(art,shape,finish.print?.35:finish.glass?22:10,finish.print?.16:1.6,[face,finish.glass?face:material(finish,finish.print?finish.gold:finish.edge,finish.print?'metal':'recess')],finish.print?order*.075:0));
  });return group;
}
function printMark(index,data,finish){
  // Print follows the original artwork, not the sculptural reinterpretation.
  if(index<3)return originalRelief(index,data,finish);
  const group=new THREE.Group(),crest=new THREE.Group();crest.scale.set(.015,-.015,.015);crest.position.set(-1.92,2.4,0);group.add(crest);
  data.paths[3].paths.forEach((path,order)=>{
    if(path.userData.style.fill&&path.userData.style.fill!=='none')SVGLoader.createShapes(path).forEach(shape=>extrude(crest,shape,.35,.12,material(finish,path.userData.style.fill),order*.075));
    if(path.userData.style.stroke&&path.userData.style.stroke!=='none')path.subPaths.forEach(part=>{
      const geometry=SVGLoader.pointsToStroke(part.getPoints(48),path.userData.style);if(geometry)add(crest,geometry,material(finish),0,0,.1);
    });
  });
  add(group,new THREE.PlaneGeometry(4.55,1.1),new THREE.MeshBasicMaterial({map:data.title,color:'#b28a43',transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}),0,-1.9,.03);return group;
}
export function createAtelierLogo(index,data,treatment='cobalt'){
  const finish=finishes[treatment]||finishes.cobalt;
  const model=finish.print?printMark(index,data,finish):index===2?lumen(finish):index===3?afterlight(data,finish):originalRelief(index,data,finish);
  model.userData.treatment=treatment;return model;
}
