import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.mjs';
import {createExploration} from './exploration.mjs';

const $=id=>document.getElementById(id);
const canvas=$('scene');
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const lerp=THREE.MathUtils.lerp;
const seg=(t,a,b)=>ease((t-a)/(b-a));
let seed=48123;
const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const range=(a,b)=>lerp(a,b,rand());
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.setClearColor(0x343434);
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x343434);
scene.fog=new THREE.FogExp2(0x343434,.020);
const camera=new THREE.PerspectiveCamera(49,16/9,.08,900);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=3.2;controls.maxDistance=100;
controls.enablePan=true;controls.maxPolarAngle=Math.PI;
const root=new THREE.Group();root.name='Neutrophil_Journey_Whitebox';scene.add(root);
const vessel=new THREE.Group();vessel.name='Postcapillary_Venule';root.add(vessel);
const tissue=new THREE.Group();tissue.name='Interstitial_Tissue';root.add(tissue);
const agent=new THREE.Group();agent.name='Neutrophil';root.add(agent);

const mat=(color,roughness=.7,extra={})=>new THREE.MeshStandardMaterial({color,roughness,metalness:0,...extra});
const white=mat(0xe2e2e2,.65);
const soft=mat(0xa5a5a5,.85);
const wallMat=mat(0x909090,.87,{side:THREE.DoubleSide});
const backWall=mat(0x686868,.88,{side:THREE.DoubleSide});
const fiberMat=mat(0xb5b5b5,.8);
const microMat=mat(0xcacaca,.74);
const nucleusMat=mat(0x6e6e6e,.5);
const membraneMat=mat(0xf0f0f0,.36,{transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide});
const sphere=new THREE.SphereGeometry(1,24,16);
const smallSphere=new THREE.SphereGeometry(1,12,8);
function mesh(geometry,material,parent,position,scale,name){const m=new THREE.Mesh(geometry,material);m.name=name||'';if(position)m.position.copy(position);if(scale)m.scale.copy(scale);parent.add(m);return m;}
function ellipsoid(parent,position,scale,material=white,name=''){return mesh(sphere,material,parent,position,scale,name);}
function tube(parent,points,radius,material,segments=28,name=''){const curve=new THREE.CatmullRomCurve3(points);return mesh(new THREE.TubeGeometry(curve,segments,radius,7,false),material,parent,null,null,name);}

// Concave discs, rather than flattened spheres, preserve erythrocyte silhouettes.
function erythrocyteGeometry(){
 const positions=[],indices=[],n=40,rings=12;
 for(let s=0;s<2;s++)for(let j=0;j<=rings;j++)for(let i=0;i<=n;i++){
  const r=j/rings,a=i/n*Math.PI*2;
  const h=(s===0?1:-1)*(.09+.33*r*r)*Math.sqrt(Math.max(0,1-r*r));
  positions.push(r*Math.cos(a)*1.45,h,r*Math.sin(a)*1.45);
 }
 const plane=(rings+1)*(n+1);
 for(let s=0;s<2;s++)for(let j=0;j<rings;j++)for(let i=0;i<n;i++){
  const a=s*plane+j*(n+1)+i,b=a+n+1;
  if(!s)indices.push(a,b,a+1,b,b+1,a+1);else indices.push(a,a+1,b,b,a+1,b+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
const rbcGeo=erythrocyteGeometry();
const rbcs=[];
for(let i=0;i<78;i++){
 const a=range(0,Math.PI*2),r=range(3.1,7.1);
 const m=mesh(rbcGeo,i%3===0?soft:white,vessel,null,V(1,1,1),'Erythrocyte_'+i);
 const size=range(.68,1.02);m.scale.setScalar(size);
 rbcs.push({m,phase:range(0,95),speed:range(3.5,6.5),y:Math.cos(a)*r,z:Math.sin(a)*r,spin:range(-.4,.4),angle:range(0,6.3)});
}

// Continuous vessel, tiled with elongated endothelial cells; the exit slit is left open.
function vesselSkin(){
 const pos=[],idx=[],nx=56,na=64;
 for(let i=0;i<=nx;i++){const x=-76+i/nx*96;for(let j=0;j<=na;j++){const a=j/na*Math.PI*2;const r=9.4+.16*Math.sin(x*.34+a*4);pos.push(x,Math.cos(a)*r,Math.sin(a)*r);}}
 for(let i=0;i<nx;i++)for(let j=0;j<na;j++){
  const x=-76+(i+.5)/nx*96,a=(j+.5)/na*Math.PI*2;
  if(x>1.7&&x<9.0&&a>Math.PI-.18&&a<Math.PI+.18)continue;
  if(x>-28&&Math.sin(a)>.24)continue;
  const p=i*(na+1)+j;idx.push(p,p+1,p+na+1,p+1,p+na+2,p+na+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
mesh(vesselSkin(),backWall,vessel,null,null,'Vessel_Wall');
for(let ix=0;ix<28;ix++)for(let j=0;j<16;j++){
 const x=-73+ix*3.35+(j%2)*1.65,a=j/16*Math.PI*2;
 if(x>1&&x<10&&Math.abs(a-Math.PI)<.26)continue;
 if(x>-28&&Math.sin(a)>.24)continue;
 const c=ellipsoid(vessel,V(x,Math.cos(a)*9.14,Math.sin(a)*9.14),V(1.57,.23,1.65),wallMat,'Endothelial_Cell');
 c.rotation.x=a;
 const n=ellipsoid(c,V(.13,-.6,.1),V(.20,1.55,.20),soft,'Endothelial_Nucleus');
 n.scale.set(.20,1.55,.20);
}
// A receding, perforated branch at the upstream fork.
const branchPath=new THREE.CatmullRomCurve3([V(-12,4,-6),V(-5,8,-11),V(5,11,-21),V(22,12,-33)]);
mesh(new THREE.TubeGeometry(branchPath,36,4.3,28,false),wallMat,vessel,null,null,'Vessel_Bifurcation');
for(let i=0;i<13;i++){
 const p=branchPath.getPoint(i/13),q=branchPath.getTangent(i/13);
 const rim=mesh(new THREE.TorusGeometry(4.28,.06,6,40),fiberMat,vessel,p,null,'Branch_Endothelial_Seam');rim.quaternion.setFromUnitVectors(V(0,0,1),q);
}

// Junctional cells separate slightly, then reseal after passage.
const gate=new THREE.Group();gate.name='Endothelial_Junction';gate.position.set(5,-9.05,0);vessel.add(gate);
const gateL=ellipsoid(gate,V(-1.6,0,0),V(1.9,.34,2.8),wallMat,'Junction_Left');
const gateR=ellipsoid(gate,V(1.6,0,0),V(1.9,.34,2.8),wallMat,'Junction_Right');
ellipsoid(gateL,V(-.1,.6,0),V(.26,.50,.23),soft,'Endothelial_Nucleus');
ellipsoid(gateR,V(.1,.6,0),V(.26,.50,.23),soft,'Endothelial_Nucleus');
const adhesion=[];
for(let i=0;i<9;i++){
 const q=mesh(new THREE.CylinderGeometry(.06,.085,.4,6),white,gate,V(range(-2,2),.45,range(-1.5,1.5)),null,'Adhesion_Receptor');adhesion.push(q);
}

// Irregular, interwoven collagen bundles; a winding corridor remains navigable.
const collagen=[];
for(let i=0;i<62;i++){
 const x=range(-5,57),y=range(-27,-11),z=range(-17,17);
 if(Math.abs(z)<3.4&&y>-18.5&&y<-11.5)continue;
 const dx=range(2,9),dy=range(-3,3),dz=range(-7,7);
 const points=[V(x-dx,y-dy,z-dz),V(x-dx*.4,y+1,z-dz*.45),V(x+dx*.3,y-1,z+dz*.4),V(x+dx,y+dy,z+dz)];
 const c=tube(tissue,points,range(.18,.42),fiberMat,24,'Collagen_Bundle');collagen.push(c);
 if(i%2===0)tube(tissue,points.map(p=>p.clone().add(V(0,.24,.14))),.095,white,24,'Collagen_Fibril');
}
// Deliberate overhead arch and nearby strands create parallax through the maze.
for(let x=13;x<39;x+=7){
 tube(tissue,[V(x-4,-18,-7),V(x-2,-11,-4),V(x+1,-10,1),V(x+4,-18,7)],.36,fiberMat,30,'Collagen_Arch');
}
for(let i=0;i<24;i++){
 const x=range(-1,58),y=range(-27,-13),z=(i%2?-1:1)*range(5.5,17);
 const c=ellipsoid(tissue,V(x,y,z),V(range(2,4.6),range(.8,2),range(1.5,3.4)),soft,'Tissue_Cell_'+i);
 c.rotation.set(range(-.3,.3),range(-1,1),range(-.5,.5));
 ellipsoid(c,V(.1,.62,.06),V(.26,.42,.27),nucleusMat,'Tissue_Cell_Nucleus');
}
 const tissueBed=mesh(new THREE.SphereGeometry(1,48,24),mat(0x454545,.95),tissue,V(23,-37,-4),V(80,9,45),'Tissue_Bed');

// Pale segmented nucleus is visible through an irregular semitransparent membrane.
const bodyGeo=new THREE.SphereGeometry(2.15,48,32);
const bodyBase=bodyGeo.attributes.position.array.slice();
const membrane=mesh(bodyGeo,membraneMat,agent,null,null,'Neutrophil_Membrane');membrane.renderOrder=4;
const nucleus=new THREE.Group();nucleus.name='Segmented_Nucleus';agent.add(nucleus);
const lobes=[V(-.67,.2,.14),V(.03,.48,-.25),V(.68,.10,.12),V(.15,-.52,.28)];
lobes.forEach((p,i)=>ellipsoid(nucleus,p,V(.58,.67,.50),nucleusMat,'Nuclear_Lobe_'+i));
for(let i=0;i<3;i++)tube(nucleus,[lobes[i],lobes[i].clone().lerp(lobes[i+1],.5).add(V(0,-.1,.1)),lobes[i+1]],.14,nucleusMat,12,'Nuclear_Bridge');
const granules=new THREE.Group();granules.name='Cytoplasmic_Granules';agent.add(granules);
for(let i=0;i<100;i++){
 const d=V(range(-1,1),range(-1,1),range(-1,1)).normalize().multiplyScalar(range(1.10,1.92));
 mesh(smallSphere,i%4===0?soft:white,granules,d,V(.065,.065,.065),'Granule');
}
const surfaceGrains=new THREE.Group();surfaceGrains.name='Membrane_Microstructure';agent.add(surfaceGrains);
for(let i=0;i<160;i++){
 const d=V(range(-1,1),range(-1,1),range(-1,1)).normalize().multiplyScalar(2.15);
 const r=range(.025,.052);mesh(smallSphere,white,surfaceGrains,d,V(r,r,r),'Membrane_Grain');
}
const leading=ellipsoid(agent,V(1.5,.1,0),V(1,.85,1.0),membraneMat,'Migratory_Leading_Edge');leading.renderOrder=5;
const uropod=ellipsoid(agent,V(-1.7,-.1,0),V(.7,.6,.65),membraneMat,'Uropod');uropod.renderOrder=5;

const pseudopods=[];
for(const sign of [-1,1]){
 const m=tube(agent,[V(1.3,sign*.6,0),V(2.05,sign*1.3,0),V(3.05,sign*.96,0),V(3.65,sign*.3,0)],.30,membraneMat,30,'Phagocytic_Pseudopod');m.renderOrder=6;pseudopods.push(m);
}
const phagosome=ellipsoid(agent,V(1.1,0,0),V(.65,.55,.55),mat(0xe4e4e4,.33,{transparent:true,opacity:.28,depthWrite:false}),'Phagosome');phagosome.renderOrder=7;
const bacteriaGeo=new THREE.CapsuleGeometry(.24,.62,6,10);
const captured=mesh(bacteriaGeo,microMat,agent,V(1.1,0,.05),V(.7,.7,.7),'Engulfed_Bacterium');captured.rotation.z=Math.PI/2;
const bacteria=[];
for(let i=0;i<32;i++){
 const p=i<3?V(45.3+i*.16,-14+(i-1)*.34,(i-1)*.28):V(range(45,53),range(-17,-11),range(-4.5,4.5));
 const g=new THREE.Group();g.name='Bacterium_'+i;tissue.add(g);g.position.copy(p);
 const m=mesh(bacteriaGeo,microMat,g,null,null,'Bacterial_Body');m.rotation.set(range(0,2),range(0,2),range(0,3));
 for(let j=0;j<4;j++){
  const a=j/4*Math.PI*2;const q=tube(g,[V(.18*Math.cos(a),0,.18*Math.sin(a)),V(.39*Math.cos(a),.1,.38*Math.sin(a)),V(.58*Math.cos(a),.15,.51*Math.sin(a))],.025,soft,8,'Fimbria');q.rotation.copy(m.rotation);
 }
 bacteria.push({g,p,phase:range(0,6.28),target:i<3});
}

// Concentration cue: increasing density of motes near the infection focus.
const signalGroup=new THREE.Group();signalGroup.name='Chemotactic_Concentration_Cue';root.add(signalGroup);
const sp=[],sPhase=[];
for(let i=0;i<480;i++){
 const u=Math.sqrt(rand()),x=5+u*46;sp.push(x,range(-18.5,-10),range(-6,6));sPhase.push(range(0,6.3));
}
const sigGeo=new THREE.BufferGeometry();sigGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
const signalPoints=new THREE.Points(sigGeo,new THREE.PointsMaterial({color:0xf2f2f2,size:.075,transparent:true,opacity:.42,depthWrite:false,sizeAttenuation:true}));signalGroup.add(signalPoints);
const luminalSignals=new THREE.Group();gate.add(luminalSignals);
for(let i=0;i<32;i++)mesh(smallSphere,white,luminalSignals,V(range(-2,2),range(.2,2.8),range(-1.5,1.5)),V(.04,.04,.04),'Inflammatory_Signal');

const hemi=new THREE.HemisphereLight(0xf0f0f0,0x242424,1.25);scene.add(hemi);
const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(-8,30,18);scene.add(key);
const rim=new THREE.DirectionalLight(0xd8d8d8,2.0);rim.position.set(20,-5,-28);scene.add(rim);
const heroLight=new THREE.PointLight(0xffffff,40,32,2);scene.add(heroLight);
const gateLight=new THREE.PointLight(0xf0f0f0,90,30,2);gateLight.position.set(5,-6,4);scene.add(gateLight);
const infectionLight=new THREE.PointLight(0xefefef,150,40,2);infectionLight.position.set(46,-7,3);scene.add(infectionLight);

// Focus corridor: fade foreground tissue only where it obscures the protagonist.
const occluders=[];
tissue.traverse(m=>{if(m.isMesh&&(m.name.startsWith('Collagen_')||m.name.startsWith('Tissue_Cell'))){m.material=m.material.clone();m.userData.baseOpacity=m.material.opacity;occluders.push(m);}});
const focusRay=new THREE.Raycaster();
let blocked=new Set();
function clearSight(p,instant=false){
 scene.updateMatrixWorld(true);
 if(instant||frames%5===0){
  blocked=new Set();
  for(const offset of [V(),V(0,1.7,0),V(0,-1.7,0),V(1.7,0,0),V(-1.7,0,0),V(1.2,1.2,0),V(-1.2,1.2,0)]){
   const target=p.clone().add(offset),direction=target.clone().sub(camera.position),distance=direction.length();
   focusRay.set(camera.position,direction.normalize());focusRay.far=Math.max(0,distance-1.7);
   for(const hit of focusRay.intersectObjects(occluders,false))blocked.add(hit.object);
  }
 }
 for(const m of occluders){const o=blocked.has(m)?.065:1;m.material.opacity=instant?o:lerp(m.material.opacity,o,.24);m.material.transparent=m.material.opacity<.995;m.material.depthWrite=!m.material.transparent;}
}

// Hero motion is continuous, deterministic, and fully seekable.
const route=new THREE.CatmullRomCurve3([V(6,-13.5,0),V(12,-14.4,1.2),V(19,-14.3,-1.8),V(25,-13.8,1.9),V(32,-14.8,-1.1),V(41.8,-14,0)]);
const heroPosition=t=>{
 if(t<=15)return V(lerp(-46,-10,t/15),.35*Math.sin(t*.42),.25*Math.sin(t*.3));
 if(t<=23)return V(lerp(-10,3.5,seg(t,15,23)),lerp(0,-6.9,seg(t,15,22)),lerp(0,.10,seg(t,15,23)));
 if(t<=27)return V(lerp(3.5,5,seg(t,23,27)),-6.9,0);
 if(t<=35)return V(lerp(5,6,seg(t,27,35)),lerp(-6.9,-13.5,seg(t,27,35)),0);
 if(t<=55)return route.getPoint(seg(t,35,55));
 return V(41.8+seg(t,55,59)*.3,-14,0);
};
function cameraPose(t,p){
 let offset=V(-10,3.2,6.4),target=p.clone().add(V(1,0,0));
 if(t<15){offset=V(-10.2,2.7,6.5);target.add(V(1.6,0,0));}
 else if(t<35){const s=seg(t,15,22);offset.lerp(V(-4.3,3.8,12.6),s);target=p.clone().add(V(.5,-.2,0));}
 else if(t<55){offset=V(-6.4,4.1,12.8);target=p.clone().add(V(1.1,0,0));}
 else {const pull=seg(t,67,75);offset=V(lerp(-4.8,-20,pull),lerp(2.3,12,pull),lerp(10.6,32,pull));target=p.clone().add(V(lerp(1.4,5,pull),-pull*1.7,0));}
 // Blend camera direction through the vessel exit instead of a discontinuous cut.
 if(t>=33&&t<37){const s=seg(t,33,37);offset=V(-4.3,3.8,12.6).lerp(V(-6.4,4.1,12.8),s);}
 if(t>=53&&t<57)offset=V(-6.4,4.1,12.8).lerp(V(-4.8,2.3,10.6),seg(t,53,57));
 return {eye:p.clone().add(offset),target};
}
let time=0,playing=true,following=true,showSignals=true,last=performance.now(),lastStage=-1;
let frames=0,elapsed=0,lastFPS=0;
const exploration=createExploration({scene,camera,controls,agent,externalEdible:bacteria.map(b=>b.g),stage:$('stage'),mapCanvas:$('map-canvas'),onModeChange:v=>{
 $('app').classList.toggle('exploring',v);$('explore').setAttribute('aria-pressed',String(v));
 if(v){setPlaying(false);setFollowing(false);}else{$('world-map').hidden=true;$('map').setAttribute('aria-expanded','false');}
}});
function update(t){
 if(exploration.enabled)t=exploration.actionTime;
 const p=exploration.enabled?agent.position.clone():heroPosition(t);agent.position.copy(p);
 const adhere=seg(t,17,23)*(1-seg(t,26,28));
 const squeeze=Math.sin(Math.PI*clamp((t-27)/8));
 const move=seg(t,34,37)*(1-seg(t,54,58));
 agent.scale.set(1+.28*adhere-.38*squeeze+.12*move,1-.27*adhere+.58*squeeze-.10*move,1-.38*squeeze);
 if(!exploration.enabled){agent.rotation.z=t<17?t*.10:lerp(.12,-Math.PI*.04,seg(t,17,24));
 if(t>=35&&t<55){const tangent=route.getTangent(seg(t,35,55));agent.rotation.y=-Math.atan2(tangent.z,tangent.x);agent.rotation.z=Math.atan2(tangent.y,Math.hypot(tangent.x,tangent.z));}
 else if(t>=55){agent.rotation.y=0;agent.rotation.z=0;}}
 else agent.rotation.z=0;
 const arr=bodyGeo.attributes.position.array;
 for(let i=0;i<arr.length;i+=3){
  const x=bodyBase[i],y=bodyBase[i+1],z=bodyBase[i+2];
  const n=.027*Math.sin(x*3.4+t*.65)*Math.sin(y*4.8+z*3.1)+.016*Math.cos(z*6.4-x*3.1+t*.5);
  const breathe=1+.016*Math.sin(t*1.4);
  arr[i]=x*(1+n)*breathe;arr[i+1]=y*(1+n)*breathe;arr[i+2]=z*(1+n)*breathe;
 }
 bodyGeo.attributes.position.needsUpdate=true;
 if(frames%3===0)bodyGeo.computeVertexNormals();
 nucleus.rotation.x=.1*Math.sin(t*.28);nucleus.rotation.y=.12*Math.sin(t*.22);
 const lead=seg(t,23,27)*(1-seg(t,33,35))+move*.75;
 leading.scale.set(.5+lead*.75,.54,.62);leading.position.x=1.65;
 leading.visible=t>18&&t<58;uropod.visible=t>34&&t<58;
 const opening=Math.sin(Math.PI*clamp((t-26)/11));gateL.position.x=-1.6-opening*.86;gateR.position.x=1.6+opening*.86;
 adhesion.forEach((m,i)=>{m.scale.y=1+seg(t,20,24)*.65*(1-seg(t,30,35));m.rotation.z=Math.sin(i)*.2;});
 const reach=seg(t,58,63),close=seg(t,63,67),retract=seg(t,67,70);
 for(const [i,m]of pseudopods.entries()){
  m.visible=t>58&&t<70;m.scale.set(Math.max(.01,reach*(1-retract*.6)),Math.max(.01,reach*(1-close*.45))*(1-retract),Math.max(.01,reach*(1-retract)));
  m.rotation.y=(i===0?-1:1)*.10*close;
 }
 captured.visible=t>=64;phagosome.visible=t>=65;
 const inner=seg(t,64,68);captured.position.set(lerp(3.2,1.08,inner),.08,.1);captured.scale.setScalar(.7*(1-seg(t,70,74)*.3));
 phagosome.position.copy(captured.position);phagosome.scale.set(.65,.55,.55);
 bacteria.forEach(({g,p,phase,target})=>{g.position.copy(p);g.position.y+=Math.sin(t*.7+phase)*.11;g.rotation.y=.06*Math.sin(t+phase);if(target){const s=seg(t,62,66);g.position.lerp(agent.position.clone().add(V(1.1,.1,0)),s);g.scale.setScalar(1-s*.8);g.visible=t<66;}else{g.visible=true;g.scale.setScalar(1);}if(exploration.enabled&&g.userData.consumed)g.visible=false;});
 rbcs.forEach(({m,phase,speed,y,z,spin,angle})=>{m.position.set(-76+((phase+t*speed)%96),y+Math.sin(t*.4+angle)*.25,z+Math.cos(t*.31+angle)*.25);m.rotation.set(angle+t*spin,t*.12+angle,angle*.6+t*.15);});
 signalGroup.visible=showSignals;luminalSignals.visible=showSignals;
 const sa=sigGeo.attributes.position.array;
 for(let i=0;i<sa.length;i+=3){sa[i]=sp[i]-.27*Math.sin(t*.38+sPhase[i/3]);sa[i+1]=sp[i+1]+.3*Math.sin(t*.4+sPhase[i/3]);sa[i+2]=sp[i+2]+.35*Math.cos(t*.33+sPhase[i/3]);}
 sigGeo.attributes.position.needsUpdate=true;
 heroLight.position.copy(p).add(V(-3,4,5));
 gateLight.intensity=lerp(45,100,seg(t,14,24));
 scene.fog.density=exploration.enabled?.0055:lerp(.020,.018,seg(t,33,38));
 const pose=cameraPose(t,p);
 if(following&&!exploration.enabled){camera.position.copy(pose.eye);controls.target.copy(pose.target);}
 controls.update();
 clearSight(p);
 if(!exploration.enabled)$('timeline').value=t;
 const stage=t<15?0:t<35?1:t<55?2:3;
 if(stage!==lastStage){document.querySelectorAll('.chapter').forEach((b,i)=>{b.classList.toggle('active',i===stage);b.setAttribute('aria-current',i===stage?'step':'false');});lastStage=stage;}
}
function resize(){const r=$('stage').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=16/9;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe($('stage'));
function setPlaying(v){playing=v;$('play').setAttribute('aria-pressed',String(v));$('play').setAttribute('aria-label',v?'暂停':'播放');$('play').innerHTML=v?'<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>':'<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg>';}
function setFollowing(v){following=v;$('follow').setAttribute('aria-pressed',String(v));$('follow').setAttribute('aria-label',v?'切换自由观察':'恢复相机跟随');if(v){const pose=cameraPose(time,heroPosition(time));camera.position.copy(pose.eye);controls.target.copy(pose.target);controls.update();}}
function seek(t,pause=false){if(exploration.enabled)exploration.mode(false);time=clamp(t,0,75);if(pause)setPlaying(false);update(time);clearSight(agent.position,true);renderer.render(scene,camera);}
$('play').onclick=()=>{if(exploration.enabled){exploration.mode(false);time=0;setFollowing(true);setPlaying(true);}else{if(time>=75)time=0;setPlaying(!playing);}};
$('reset').onclick=()=>{exploration.mode(false);time=0;setFollowing(true);setPlaying(true);};
$('explore').onclick=()=>{const v=!exploration.enabled;exploration.mode(v);if(!v){setFollowing(true);setPlaying(true);}};
$('pilot').onclick=()=>{exploration.setPilot(!exploration.pilot);$('pilot').setAttribute('aria-pressed',String(exploration.pilot));$('pilot').setAttribute('aria-label',exploration.pilot?'切换摄影机飞行':'切换细胞操控');};
$('map').onclick=()=>{if(!exploration.enabled)exploration.mode(true);$('world-map').hidden=!$('world-map').hidden;$('map').setAttribute('aria-expanded',String(!$('world-map').hidden));exploration.drawMap();};
$('follow').onclick=()=>{if(exploration.enabled)exploration.reframe();else setFollowing(!following);};
$('signals').onclick=()=>{showSignals=!showSignals;$('signals').setAttribute('aria-pressed',String(showSignals));$('signals').setAttribute('aria-label',showSignals?'隐藏化学信号粒子':'显示化学信号粒子');};
$('timeline').addEventListener('input',e=>seek(Number(e.target.value),true));
document.querySelectorAll('.chapter').forEach(b=>b.onclick=()=>{setFollowing(true);seek(Number(b.dataset.time)+.01);setPlaying(true);});
$('help').onclick=()=>{const hidden=$('app').classList.toggle('help-hidden');$('help').setAttribute('aria-expanded',String(!hidden));};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen();}catch{$('status').textContent='当前浏览器不支持全屏，可使用浏览器全屏快捷键。';}};
controls.addEventListener('start',()=>setFollowing(false));
document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.code==='Space'){e.preventDefault();if(exploration.enabled)exploration.engulf();else{if(time>=75)time=0;setPlaying(!playing);}}if(e.key.toLowerCase()==='m')$('map').click();if(e.key.toLowerCase()==='c')$('pilot').click();if(e.key.toLowerCase()==='r')$('reset').click();if(e.key.toLowerCase()==='f'){if(exploration.enabled)exploration.reframe();else setFollowing(true);}if(e.key.toLowerCase()==='h')$('help').click();if(['1','2','3','4'].includes(e.key)){exploration.mode(false);setFollowing(true);seek([0,15,35,55][Number(e.key)-1]+.01);setPlaying(true);}});
document.querySelectorAll('#touch-move button').forEach(b=>{const press=(down)=>document.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code:b.dataset.key,bubbles:true}));b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);press(true);};b.onpointerup=()=>press(false);b.onpointercancel=()=>press(false);});
document.addEventListener('visibilitychange',()=>{last=performance.now();});
function animate(now){requestAnimationFrame(animate);const dt=Math.max(0,Math.min((now-last)/1000,.08));last=now;if(!document.hidden&&playing&&!exploration.enabled){time=Math.min(75,time+dt);if(time>=75)setPlaying(false);}exploration.tick(dt);update(time);renderer.render(scene,camera);frames++;elapsed+=dt;if(elapsed>1){lastFPS=frames/elapsed;frames=0;elapsed=0;}}
resize();update(55);exploration.mode(true);exploration.teleport(19);update(55);renderer.render(scene,camera);$('loading').hidden=true;
requestAnimationFrame(animate);

// Deterministic inspection and local asset export. No network credentials in the application.
window.neutrophilScene={
 seek:(t)=>seek(t,true),play:()=>setPlaying(true),pause:()=>setPlaying(false),follow:setFollowing,
 getState:()=>({time,playing,following,signals:showSignals,stage:lastStage+1,hero:agent.position.toArray(),camera:camera.position.toArray(),aspect:camera.aspect,fps:lastFPS,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,exploration:exploration.getState(),pseudopods:pseudopods.map(m=>({visible:m.visible,scale:m.scale.toArray()})),captured:captured.visible}),
 explore:()=>exploration.mode(true),teleport:i=>exploration.teleport(i),getRegions:()=>exploration.regions.map(d=>({index:d.index,type:d.type,variant:d.variant,center:d.center.toArray(),name:d.group.name})),
 async exportGLB(){
  const {GLTFExporter}=await import('./vendor/GLTFExporter.mjs');
  const t=time;seek(60,true);const exporter=new GLTFExporter();
  const b=await exporter.parseAsync(root,{binary:true,onlyVisible:true,trs:true});seek(t,true);
  const u=URL.createObjectURL(new Blob([b],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=u;a.download='neutrophil-whitebox.glb';a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);return {bytes:b.byteLength};
 },
 async exportNeutrophilGLB(){
  const {GLTFExporter}=await import('./vendor/GLTFExporter.mjs');const t=time;seek(42,true);
  const model=agent.clone(true);model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.set(1,1,1);model.name='Neutrophil_Whitebox';
  const b=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true,trs:true});seek(t,true);
  const u=URL.createObjectURL(new Blob([b],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=u;a.download='neutrophil-whitebox-actor.glb';a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);return {bytes:b.byteLength};
 }
};
window.addEventListener('error',e=>{const box=$('error');box.hidden=false;box.textContent='场景加载失败，请刷新页面。'+(e.message||'');});
