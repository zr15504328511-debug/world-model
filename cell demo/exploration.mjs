import * as THREE from 'three';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const G=new THREE.Group();
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,t)=>{const q=clamp((t-a)/(b-a),0,1);return q*q*(3-2*q);};
let seed=96114;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const r=(a,b)=>a+(b-a)*rnd();
const grey=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.78,metalness:0,...extra});
const chalk=grey(0xcccccc),pale=grey(0xaaaaaa),dark=grey(0x737373),bone=grey(0xb8b8b8);
const glass=grey(0xd8d8d8,{transparent:true,opacity:.20,depthWrite:false,side:THREE.DoubleSide});
const geo={sphere:new THREE.SphereGeometry(1,16,12),small:new THREE.IcosahedronGeometry(1,1),rod:new THREE.CapsuleGeometry(.35,1,4,8),column:new THREE.CylinderGeometry(1,1,1,10),ring:new THREE.TorusGeometry(1,.055,5,32)};
const dummy=new THREE.Object3D();
function add(parent,geometry,material,p,s,rotation){const m=new THREE.Mesh(geometry,material);if(p)m.position.copy(p);if(s)m.scale.copy(s);if(rotation)m.rotation.set(...rotation);parent.add(m);return m;}
function cells(parent,list,material=chalk,geometry=geo.sphere){const m=new THREE.InstancedMesh(geometry,material,list.length);list.forEach((v,i)=>{dummy.position.copy(v.p);dummy.scale.copy(v.s);dummy.rotation.set(...(v.r||[0,0,0]));dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.instanceMatrix.needsUpdate=true;parent.add(m);return m;}
function tube(parent,pts,radius,material=chalk,segments=24){const curve=new THREE.CatmullRomCurve3(pts);const m=add(parent,new THREE.TubeGeometry(curve,segments,radius,7,false),material);return {m,curve};}
function sphere(parent,x,y,z,sx,sy,sz,material=pale){return add(parent,geo.sphere,material,V(x,y,z),V(sx,sy,sz));}
function cloud(parent,count,spread,material=pale,rad=1){const list=[];for(let i=0;i<count;i++)list.push({p:V(r(-spread,spread),r(-12,7),r(-spread,spread)),s:V(rad*r(.6,1.5),rad*r(.4,1.2),rad*r(.6,1.5))});return cells(parent,list,material);}
const arches=[],drifters=[],edible=[],connections=[],districts=[];

// Forty-eight districts: sixteen geometries with three different structural variants.
const recipes=[
 'collagen-cathedral','adipose-honeycomb','capillary-delta','fibrin-web',
 'infection-canyon','epithelial-arcade','trabecular-vault','lymphatic-funnel',
 'platelet-garden','muscle-bundles','pericyte-bridges','cellular-cavern',
 'basement-membrane','vascular-spiral','immune-cluster','matrix-labyrinth'
];
function buildDistrict(type,variant,index){
 const group=new THREE.Group();group.name='District_'+String(index+1).padStart(2,'0')+'_'+recipes[type];
 const detail=new THREE.Group();group.add(detail);
 const spread=25+variant*2;
 // Convex, undulating tissue islands replace a flat world floor.
 sphere(group,0,-21,0,40,5.5+variant,38,dark);
 const fringe=[];
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2,rr=r(27,35);fringe.push({p:V(Math.cos(a)*rr,r(-18,-10),Math.sin(a)*rr),s:V(r(3,7),r(2,4),r(3,6)),r:[r(-.3,.3),r(0,3),r(-.3,.3)]});}
 cells(detail,fringe,pale);
 if(type===0){
  // A nave of layered collagen columns, side chapels, and a walkable central aisle.
  for(let k=0;k<7;k++){const z=-24+k*8;for(const side of [-1,1]){
   tube(detail,[V(side*17,-16,z),V(side*15,1,z),V(side*8,13,z),V(0,17,z)],.9,bone,30);
   tube(detail,[V(side*23,-17,z),V(side*24,-1,z),V(side*17,10,z),V(side*8,12,z)],.5,chalk);
  }}
  for(let i=0;i<12;i++)tube(detail,[V(r(-24,24),-15,-28),V(r(-24,24),r(-12,10),0),V(r(-24,24),-15,28)],.20,pale);
 }else if(type===1){
  // Adipocyte chambers have nested membranes, roof bridges and deep intercellular gaps.
  const list=[];for(let a=0;a<Math.PI*2;a+=Math.PI/6)for(let y=0;y<3;y++)list.push({p:V(Math.cos(a)*(20-y*2),-13+y*10,Math.sin(a)*(20-y*2)),s:V(r(5,8),r(4.5,7),r(5,8))});
  cells(detail,list,pale);cells(detail,list.map(v=>({p:v.p.clone().add(V(1,2,1)),s:v.s.clone().multiplyScalar(.36)})),chalk);
  sphere(detail,0,18,0,12,2,12,pale);cloud(detail,70,23,glass,.3);
 }else if(type===2){
  for(let arm=0;arm<5;arm++){
   const a=arm/5*Math.PI*2;const {curve}=tube(detail,[V(0,-8,0),V(Math.cos(a)*10,-2,Math.sin(a)*10),V(Math.cos(a+.2)*27,4,Math.sin(a+.2)*27)],2.25,pale,28);
   for(let i=0;i<14;i++){const t=i/14,p=curve.getPoint(t);const ring=add(detail,geo.ring,chalk,p,V(2.35,2.35,2.35));ring.quaternion.setFromUnitVectors(V(0,0,1),curve.getTangent(t));}
   drifters.push({curve,group:detail,phase:r(0,1),speed:.028+r(0,.02),m:sphere(detail,0,0,0,1.3,.35,1.3,chalk)});
  }
  cloud(detail,65,20,glass,.25);
 }else if(type===3){
  for(let i=0;i<25;i++){
   const a=r(0,6.28),b=a+r(.8,2.2),h=r(-14,17);
   tube(detail,[V(Math.cos(a)*28,h,Math.sin(a)*28),V(r(-6,6),h+r(-4,4),r(-6,6)),V(Math.cos(b)*28,h,Math.sin(b)*28)],.12+variant*.04,chalk);
  }
  cloud(detail,100,28,pale,.5);
 }else if(type===4){
  // Two cellular canyon walls surround multiple bacterial colonies.
  const walls=[];for(const side of [-1,1])for(let i=0;i<10;i++)walls.push({p:V(side*r(16,23),r(-12,6),-28+i*6),s:V(r(4,7),r(5,12),r(4,7))});cells(detail,walls,pale);
  for(let j=0;j<3;j++){
   const colony=new THREE.Group();colony.position.set((j-1)*10,-9+j*2,(j-1)*11);detail.add(colony);
   for(let i=0;i<22;i++){const m=add(colony,geo.rod,chalk,V(r(-4,4),r(-1,4),r(-4,4)),V(r(.5,1.1),r(.6,1.4),r(.5,1.1)),[r(0,3),r(0,3),r(0,3)]);edible.push(m);}
   sphere(colony,0,-2,0,7,2,7,dark);
  }
 }else if(type===5){
  const columns=[];for(let a=0;a<Math.PI*2;a+=Math.PI/14)for(let y=0;y<2;y++){const rad=23+y*5;columns.push({p:V(Math.cos(a)*rad,-4+y*14,Math.sin(a)*rad),s:V(2.6,10,2.8)});}cells(detail,columns,pale,geo.column);
  for(let k=0;k<3;k++){const ring=add(detail,geo.ring,chalk,V(0,-14+k*14,0),V(26,26,26),[Math.PI/2,0,0]);}
  for(let i=0;i<46;i++)tube(detail,[V(r(-26,26),17,r(-26,26)),V(r(-26,26),22,r(-26,26))],.12,pale,4);
 }else if(type===6){
  const beams=[];for(let i=0;i<20;i++){
   const a=r(0,6.28),b=r(0,6.28);tube(detail,[V(Math.cos(a)*25,-15,Math.sin(a)*25),V(Math.cos(b)*18,r(-2,13),Math.sin(b)*18),V(Math.cos(a+.8)*24,19,Math.sin(a+.8)*24)],r(.8,1.5),bone,16);
  }cloud(detail,60,25,pale,1.6);
 }else if(type===7){
  for(let level=0;level<4;level++){
   const h=-15+level*8,rad=25-level*3;
   add(detail,geo.ring,pale,V(0,h,0),V(rad,rad,rad),[Math.PI/2,0,0]);
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;tube(detail,[V(Math.cos(a)*rad,h,Math.sin(a)*rad),V(Math.cos(a+.15)*(rad-2),h+5,Math.sin(a+.15)*(rad-2)),V(Math.cos(a+.3)*(rad-3),h+8,Math.sin(a+.3)*(rad-3))],.6,chalk);}
  }
  sphere(detail,0,-8,0,13,10,13,glass);cloud(detail,100,22,chalk,.35);
 }else if(type===8){
  const platelets=[];for(let i=0;i<72;i++){
   const p=V(r(-25,25),r(-13,11),r(-25,25));platelets.push({p,s:V(r(.9,2.3),r(.45,.8),r(.9,2.3)),r:[r(0,2),r(0,2),r(0,2)]});
   if(i%6===0)for(let a=0;a<6.28;a+=1.26)tube(detail,[p,p.clone().add(V(Math.cos(a)*3,1,Math.sin(a)*3))],.08,chalk,4);
  }cells(detail,platelets,pale,geo.small);cloud(detail,150,29,glass,.2);
 }else if(type===9){
  for(let k=0;k<5;k++){
   const z=(k-2)*12;
   for(let i=0;i<6;i++)tube(detail,[V(-34,-10+i*.7,z+i*.55),V(0,-4+i*.8,z-4),V(34,-12+i*.7,z+i*.55)],.7,pale,24);
   for(let i=0;i<12;i++)sphere(detail,-29+i*5,-4,z,1.8,.5,3,chalk);
  }
 }else if(type===10){
  for(const side of [-1,1]){
   tube(detail,[V(-30,-5,side*15),V(-10,8,side*18),V(12,4,side*20),V(30,-8,side*15)],2.7,pale,30);
   for(let i=0;i<11;i++)sphere(detail,-27+i*5,0,side*17,3,1.2,4,dark);
  }
  for(let i=0;i<5;i++)tube(detail,[V(-24+i*12,0,-20),V(-26+i*12,12,-9),V(-23+i*12,12,9),V(-24+i*12,0,20)],.7,chalk);
 }else if(type===11){
  const outer=[];for(let j=0;j<10;j++)for(let level=0;level<3;level++){
   const a=j/10*6.28;outer.push({p:V(Math.cos(a)*r(18,25),-12+level*11,Math.sin(a)*r(18,25)),s:V(r(4,7),r(5,8),r(4,7))});
  }cells(detail,outer,pale);cells(detail,outer.map(v=>({p:v.p.clone().multiplyScalar(.97),s:v.s.clone().multiplyScalar(.38)})),dark);
  for(let i=0;i<3;i++)add(detail,geo.ring,chalk,V(0,-10+i*14,0),V(21,21,21),[Math.PI/2,0,0]);
 }else if(type===12){
  for(let level=0;level<3;level++){
   const h=-14+level*14;
   for(let k=-4;k<=4;k++){
    tube(detail,[V(-30,h,k*7),V(0,h+r(-1,1),k*7),V(30,h,k*7)],.20,pale);
    tube(detail,[V(k*7,h,-30),V(k*7,h+r(-1,1),0),V(k*7,h,30)],.20,chalk);
   }
  }for(let i=0;i<8;i++)tube(detail,[V(r(-24,24),-16,r(-24,24)),V(r(-24,24),17,r(-24,24))],.6,pale,12);
 }else if(type===13){
  const pts=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*6;pts.push(V(Math.cos(a)*22,-17+i*.37,Math.sin(a)*22));}
  const {curve}=tube(detail,pts,2.5,pale,130);
  for(let i=0;i<60;i++){const p=curve.getPoint(i/60),ring=add(detail,geo.ring,chalk,p,V(2.65,2.65,2.65));ring.quaternion.setFromUnitVectors(V(0,0,1),curve.getTangent(i/60));}
  for(let i=0;i<8;i++)drifters.push({curve,group:detail,phase:r(0,1),speed:r(.009,.02),m:sphere(detail,0,0,0,1.2,.35,1.2,chalk)});
 }else if(type===14){
  const immune=[];for(let i=0;i<16;i++){const p=V(r(-25,25),r(-10,5),r(-25,25));immune.push({p,s:V(3,3,3)});for(let j=0;j<3;j++)sphere(detail,p.x+(j-1)*.8,p.y,p.z,.8,1,.7,dark);}
  cells(detail,immune,glass);cloud(detail,160,28,chalk,.25);
  for(let i=0;i<24;i++){const m=add(detail,geo.rod,chalk,V(r(-15,15),r(-10,1),r(-15,15)),V(.8,.8,.8),[r(0,3),r(0,3),r(0,3)]);edible.push(m);}
 }else{
  for(let k=0;k<6;k++){
   const z=-25+k*10;
   for(let j=0;j<3;j++)tube(detail,[V(-30,-14+j*8,z),V(-14,-6+j*7,z+5),V(5,-10+j*8,z-4),V(30,-12+j*8,z+1)],.75,pale,30);
  }
  cloud(detail,44,25,chalk,2);
 }
 // An underground chamber and vertical access spine make every district multi-level.
 const lower=new THREE.Group();lower.name='Lower_Interstitial_Chamber';detail.add(lower);
 for(let k=0;k<6;k++){const a=k/6*6.28;tube(lower,[V(Math.cos(a)*17,-46,Math.sin(a)*17),V(Math.cos(a)*20,-34,Math.sin(a)*20),V(Math.cos(a)*13,-26,Math.sin(a)*13)],.48,pale,18);}
 sphere(lower,0,-50,0,26,3,25,dark);cloud(lower,40,17,pale,.65).position.y=-34;
 const vertical=tube(detail,[V(25,-45,22),V(24,-30,23),V(29,-15,18),V(27,5,15),V(14,22,10)],1.8,glass,40);
 for(let i=0;i<20;i++){const t=i/20;const ring=add(detail,geo.ring,pale,vertical.curve.getPoint(t),V(1.9,1.9,1.9));ring.quaternion.setFromUnitVectors(V(0,0,1),vertical.curve.getTangent(t));}
 return {group,detail,type,variant,index,visited:false};
}

export function createExploration({scene,camera,controls,agent,stage,mapCanvas,onModeChange,externalEdible=[]}){
 edible.push(...externalEdible);
 G.name='Explorable_Microcosm_48_Districts';scene.add(G);
 const regions=new THREE.Group();regions.name='Microhabitats';G.add(regions);
 for(let z=0;z<6;z++)for(let x=0;x<8;x++){
  const index=z*8+x,type=(index*7+x*3+z)%16,variant=Math.floor(index/16);
  const d=buildDistrict(type,variant,index);d.center=V(42+(x-3)*76,-14+(z%3-1)*3,(z-2)*76);d.group.position.copy(d.center);regions.add(d.group);districts.push(d);
 }
 const routes=new THREE.Group();routes.name='Interconnected_Vascular_And_Tissue_Routes';G.add(routes);
 function connect(a,b,index){
  const p=a.center.clone(),q=b.center.clone(),mid=p.clone().lerp(q,.5);
  mid.y+=index%2?19:-2;mid.z+=index%3===0?9:-7;
  const {curve,m}=tube(routes,[p.clone().add(V(0,17,0)),mid.clone().add(V(0,17,0)),q.clone().add(V(0,17,0))],1.7,glass,32);
  m.name='Vascular_Link_'+index;
  for(let j=0;j<12;j++){const t=j/12;const ring=add(routes,geo.ring,pale,curve.getPoint(t),V(1.8,1.8,1.8));ring.quaternion.setFromUnitVectors(V(0,0,1),curve.getTangent(t));}
  for(let side of [-1,1])tube(routes,[p.clone().add(V(side*5,-4,0)),mid.clone().add(V(side*6,-8,0)),q.clone().add(V(side*5,-4,0))],.42,bone,24);
  tube(routes,[p.clone().add(V(0,-36,0)),mid.clone().add(V(0,-42,8)),q.clone().add(V(0,-36,0))],.55,pale,24);
  drifters.push({curve,group:routes,phase:r(0,1),speed:r(.02,.038),m:sphere(routes,0,0,0,1,.3,1,chalk)});
  connections.push({from:a.index,to:b.index,m,curve});
 }
 districts.forEach(d=>{const x=d.index%8,z=Math.floor(d.index/8);if(x<7)connect(d,districts[d.index+1],connections.length);if(z<5)connect(d,districts[d.index+8],connections.length);});
 // A long peripheral loop joins opposite sides, avoiding dead-ended district corridors.
 const loopPoints=[V(-224,14,-197),V(87,25,-222),V(392,18,-169),V(390,30,134),V(264,14,271),V(-190,24,263),V(-224,14,-197)];
 const loop=tube(routes,loopPoints,2.8,glass,160);loop.m.name='Peripheral_Vascular_Loop';
 for(let j=0;j<110;j++){const t=j/110;const ring=add(routes,geo.ring,bone,loop.curve.getPoint(t),V(2.9,2.9,2.9));ring.quaternion.setFromUnitVectors(V(0,0,1),loop.curve.getTangent(t));}
 for(let j=0;j<20;j++)drifters.push({curve:loop.curve,group:routes,phase:j/20,speed:.008,m:sphere(routes,0,0,0,1.2,.4,1.2,chalk)});
 const dust=[];for(let i=0;i<1400;i++)dust.push(r(-260,410),r(-65,70),r(-210,280));
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));G.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xcccccc,size:.16,transparent:true,opacity:.3,depthWrite:false})));
 let enabled=false,pilot=true,position=V(42,-14,0),clock=0,engulfStart=-100,target=null,visited=new Set();
 const keys=new Set();const ctx=mapCanvas.getContext('2d');
 const mapBounds={minX:-238,maxX:395,minZ:-207,maxZ:285};
 const toMap=p=>[(p.x-mapBounds.minX)/(mapBounds.maxX-mapBounds.minX)*mapCanvas.width,(p.z-mapBounds.minZ)/(mapBounds.maxZ-mapBounds.minZ)*mapCanvas.height];
 function nearest(p){return districts.reduce((best,d)=>d.center.distanceToSquared(p)<best.center.distanceToSquared(p)?d:best,districts[0]);}
 function mode(v){
  enabled=v;G.visible=v;
  if(v){position.copy(agent.position);controls.target.copy(position);camera.position.copy(position).add(V(-5,3.8,10.5));}
  keys.clear();onModeChange?.(v);drawMap();
 }
 function teleport(index){
  const d=districts[index];if(!d)return;if(!enabled)mode(true);
  position.copy(d.center).add(V(0,2,0));agent.position.copy(position);
  controls.target.copy(position);camera.position.copy(position).add(V(-5,3.8,10.5));
  d.visited=true;visited.add(index);drawMap();
 }
 function drawMap(){
  const w=mapCanvas.width,h=mapCanvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#161819';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#454a4d';ctx.lineWidth=1;
  for(const link of connections){const a=toMap(districts[link.from].center),b=toMap(districts[link.to].center);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
  for(const d of districts){const [x,z]=toMap(d.center);ctx.beginPath();ctx.arc(x,z,d.visited?6:4,0,6.28);ctx.fillStyle=d.visited?'#d9dedf':'#686f73';ctx.fill();ctx.strokeStyle='#aab0b4';if(d.type===4||d.type===14){ctx.strokeRect(x-8,z-8,16,16);}else if(d.type===13){ctx.beginPath();ctx.arc(x,z,10,0,6.28);ctx.stroke();}}
  const [x,z]=toMap(pilot?position:controls.target);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,z,11,0,6.28);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,z,3,0,6.28);ctx.fill();
 }
 mapCanvas.onclick=e=>{const rect=mapCanvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*mapCanvas.width,z=(e.clientY-rect.top)/rect.height*mapCanvas.height;const p=V(mapBounds.minX+x/mapCanvas.width*(mapBounds.maxX-mapBounds.minX),-14,mapBounds.minZ+z/mapCanvas.height*(mapBounds.maxZ-mapBounds.minZ));teleport(nearest(p).index);};
 function engulf(){
  if(!enabled||!pilot)return false;
  scene.updateMatrixWorld(true);let near=null,dist=7.8;
  for(const m of edible){if(!m.visible)continue;const p=m.getWorldPosition(V()),d=p.distanceTo(position);if(d<dist){dist=d;near=m;}}
  if(!near)return false;target=near;engulfStart=clock;const delta=target.getWorldPosition(V()).sub(position);agent.rotation.y=-Math.atan2(delta.z,delta.x);return true;
 }
 function tick(dt){
  clock+=dt;
  if(!enabled)return;
  const forward=camera.getWorldDirection(V());forward.y=0;forward.normalize();const right=V().crossVectors(forward,V(0,1,0)).normalize();
  const movement=V();if(keys.has('KeyW')||keys.has('ArrowUp'))movement.add(forward);if(keys.has('KeyS')||keys.has('ArrowDown'))movement.sub(forward);if(keys.has('KeyD')||keys.has('ArrowRight'))movement.add(right);if(keys.has('KeyA')||keys.has('ArrowLeft'))movement.sub(right);if(keys.has('KeyE'))movement.y+=1;if(keys.has('KeyQ'))movement.y-=1;
  if(movement.lengthSq()>0){movement.normalize().multiplyScalar(dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?32:12));position.add(movement);position.x=clamp(position.x,-280,440);position.y=clamp(position.y,-75,100);position.z=clamp(position.z,-245,325);controls.target.add(movement);camera.position.add(movement);if(pilot){agent.position.copy(position);agent.rotation.y=-Math.atan2(movement.z,movement.x);}}
  if(pilot)agent.position.copy(position);
  const reference=pilot?position:camera.position;
  for(const d of districts){const dist=d.center.distanceTo(reference);d.detail.visible=dist<175;d.group.visible=dist<330;if(dist<39){d.visited=true;visited.add(d.index);}}
  for(const d of drifters){const t=((d.phase+clock*d.speed)%1+1)%1;const p=d.curve.getPoint(t);d.m.position.copy(p);d.m.rotation.y=clock*.18+d.phase*3;}
  const phase=clock-engulfStart;
  if(target&&phase<4){target.visible=phase<2.8;target.scale.setScalar(Math.max(.15,1-smooth(.8,2.8,phase)*.85));if(phase>=2.8)target.userData.consumed=true;}
  if(clock% .15<dt)drawMap();
 }
 function setPilot(v){pilot=v;if(v){position.copy(controls.target);agent.position.copy(position);}keys.clear();}
 document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(enabled&&['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}});
 document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
 G.visible=false;
 return {tick,mode,teleport,engulf,setPilot,drawMap,reframe(){controls.target.copy(position);camera.position.copy(position).add(V(-5,3.8,10.5));},get enabled(){return enabled;},get position(){return position;},get pilot(){return pilot;},get actionTime(){const p=clock-engulfStart;return p>=0&&p<4?58+p*3:42;},getState:()=>({enabled,pilot,position:position.toArray(),district:nearest(position).index,visited:[...visited],regions:districts.length,connections:connections.length+1,archetypes:recipes.length,worldBounds:{x:[-280,440],y:[-75,100],z:[-245,325]},visibleRegions:districts.filter(d=>d.group.visible).length,visibleDetailedRegions:districts.filter(d=>d.group.visible&&d.detail.visible).length,activeEngulfment:clock-engulfStart<4,consumed:edible.filter(m=>m.userData.consumed).length}),regions:districts};
}
