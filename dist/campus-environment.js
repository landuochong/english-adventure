import {workshopBench,workshopParts} from './campus-workshop.js?v=workshop-20261118';
import {levelStarts} from './campus-level-catalog.js?v=difficulty-1';
import {campusWorld} from './campus-world.js?v=workshop-20261118';
import {missions} from './campus-missions.js?v=difficulty-1';
import {createCampusProps} from './campus-props.js?v=school-1';
import {createStudent} from './campus-student.js?v=pace-2';
import {findCampusPath} from './campus-navigation.js?v=world-1';
import {createCampusTreeFactory} from './campus-landscape.js';
import {environmentLayout} from './campus-environment-layout.js?v=workshop-20261118';
import {createEnvironmentGame} from './campus-environment-game.js?v=difficulty-1';
import { createCampusCharacters } from './campus-characters.js?v=workshop-20261118';
import * as T from './vendor/three/three.module.js';
const scene=new T.Scene();scene.background=new T.Color('#b8d1df');scene.fog=new T.FogExp2('#bfd3dd',.0075);
let renderer;try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){const el=document.getElementById('error');el.style.display='block';el.textContent='此浏览器无法启动 3D 场景，请启用硬件加速后重试。';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.prepend(renderer.domElement);
const camera=new T.OrthographicCamera(-8*innerWidth/innerHeight,8*innerWidth/innerHeight,8,-8,.1,180);const viewOffset=new T.Vector3(10,14,14),viewYaw=Math.atan2(10,14);const student=createStudent(scene),player=student.root;function followCamera(){camera.position.copy(player.position).add(viewOffset);camera.lookAt(player.position.x,1,player.position.z);}followCamera();
const hemi=new T.HemisphereLight('#d7edff','#a39b86',2);scene.add(hemi);
const sun=new T.DirectionalLight('#fff2d9',3.4);sun.position.set(-18,28,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-45,right:45,top:40,bottom:-40,near:1,far:90});sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;scene.add(sun);
// Soft daylight reflected from the open courtyard keeps faces readable under the canopy.
const courtyardFill=new T.DirectionalLight('#e7f2ff',.85);courtyardFill.position.set(4,6,22);scene.add(courtyardFill);
const obstacles=[],solidMeshes=[],occluders=[];let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function texture(base,grain,tiles=false){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,512,512);for(let i=0;i<24000;i++){const v=random()*grain;x.fillStyle='rgba('+(random()>.5?'255,255,255':'0,0,0')+','+v+')';x.fillRect(random()*512,random()*512,1+random()*2,1+random()*2);}if(tiles){x.strokeStyle='#7a848822';x.lineWidth=3;x.strokeRect(0,0,512,512);}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
function mat(color,rough=.7,map=null){return new T.MeshStandardMaterial({color,roughness:rough,map});}
const concrete=mat('#eeeae1',.9,texture('#d7d4cb',.09));
const stone=mat('#c5ccd0',.8,texture('#c3c9c9',.12,true));stone.map.repeat.set(40,40);
const dark=mat('#263d4c',.4),steel=mat('#677f8d',.35),wood=mat('#aa8053',.7,texture('#b89265',.18)),white=mat('#eff2ef',.5),grass=mat('#688d6a',.95,texture('#648464',.25));
const glass=new T.MeshPhysicalMaterial({color:'#9bc2ce',roughness:.08,metalness:.2,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false});
function box(w,h,d,m,x,y,z,solid=false){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);if(solid){obstacles.push({x,z,w:w/2+.3,d:d/2+.3});solidMeshes.push(o);}if(h>2||y>2.5){o.material=m.clone();o.userData.fade={opacity:m.opacity,x,z,w,d,overhead:y>3&&h<1.3&&w>6,canopy:y>3&&y<3.9&&Math.abs(x)<5.6&&Math.abs(z)<1};occluders.push(o);}return o;}
function cylinder(r,h,m,x,y,z){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
function sign(text,x,y,z,w=5,h=1,background='#12354b',color='#eff7f8'){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.font='500 '+Math.round(c.height*.48)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,c.height/2,c.width*.92);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.5}));m.position.set(x,y,z);scene.add(m);if(y>2.5){m.userData.fade={opacity:1,x,z,w,d:.1,overhead:false,canopy:false};occluders.push(m);}return m;}
box(130,.2,120,stone,15,-.12,10);
box(20,.035,30,mat('#bec8cb'),0,.01,10);
for(let z=-2;z<28;z+=2.5)box(20,.01,.025,mat('#8d9da6'),0,.035,z);
for(let x=-10;x<=10;x+=2.5)box(.025,.01,30,mat('#8d9da6'),x,.035,10);
// Main hall, open ground-floor entrance and a transparent two-storey facade.
box(32,1,15,concrete,0,6.7,-10);
box(33,.3,16,dark,0,7.35,-10);
box(32,6.4,.4,concrete,0,3.2,-17.5,true);
box(.4,6.4,15,concrete,-16,3.2,-10,true);box(.4,6.4,15,concrete,16,3.2,-10,true);
for(const x of [-14,-10,-6,6,10,14]){box(.2,6,.3,dark,x,3,-2.6,true);box(3.8,5.6,.12,glass,x,3,-2.7,true);}
box(8,2.4,.14,glass,0,5.1,-2.7);
box(8,.18,.3,dark,0,3.8,-2.6);
for(const x of [-4,4])box(.22,6,.35,dark,x,3,-2.6,true);
box(11,.26,4,white,0,3.75,-.7);
for(let x=-5;x<=5;x+=.5)box(.06,.08,3.8,steel,x,3.58,-.7);
sign('SCIENCE  CENTER',0,5.15,-2.4,8,1.2);
sign('探索 · 交流 · 发现',0,4.15,-2.35,4,.5,'#183b4f','#8fcedd');
// Interior: science exhibition stands, information counter, benches and light strips.
box(31,.04,14,mat('#e1e5df'),0,.03,-10);
for(const x of [-11,0,11])box(.08,.06,12,mat('#b9c4c5'),x,.08,-10);
box(6,1.05,1.3,wood,-10,.55,-7,true);box(6.2,.1,1.5,white,-10,1.12,-7);
sign('Information',-10,2.4,-9.4,4,.7);
for(const x of [-8,0,8]){box(2,.65,2,white,x,.4,-13,true);box(2.1,.08,2.1,dark,x,.77,-13);if(x===0)continue;const shape=new T.Mesh(new T.TorusKnotGeometry(.55,.12,80,12),new T.MeshStandardMaterial({color:x===0?'#ebaa54':'#67aabb',metalness:.65,roughness:.25}));shape.position.set(x,1.65,-13);shape.castShadow=true;scene.add(shape);}
for(const x of [-10,-5,0,5,10]){box(3,.05,.18,new T.MeshStandardMaterial({color:'#f9f4da',emissive:'#fff0bd',emissiveIntensity:2}),x,6.1,-10);}
const indoor=new T.PointLight('#d9f1ff',65,22,2);indoor.position.set(0,4,-10);scene.add(indoor);
// Left wing, with layered cladding and a shaded colonnade.
box(10,8,30,concrete,-23,4,0,true);box(10.5,.35,30.5,dark,-23,8.25,0);
for(let z=-12;z<14;z+=4){box(.1,2.5,3,glass,-17.95,5.4,z);for(const y of [3.9,6.9])box(.15,.1,3.2,steel,-17.85,y,z);}
box(5,.22,30,white,-15.5,3.5,0);
for(let z=-12;z<=14;z+=5)box(.24,3.5,.24,steel,-13.2,1.75,z,true);
// Right laboratory wing, foreground lobby glazing.
box(11,6,25,concrete,23,3,-1,true);
for(let z=-10;z<10;z+=3){box(.12,3.8,2.75,glass,17.4,2.4,z);box(.22,4,.1,dark,17.25,2.4,z-1.5);}
box(12,.3,26,dark,23,6.2,-1);
sign('LAB  /  01',18.8,4.4,11.6,3,.8);
// Courtyard planters, mature trees, benches and paving details.
const tree=createCampusTreeFactory(scene,random);
for(const [x,z] of [[-9,8],[9,8],[-9,20],[9,20]]){box(3.4,.5,5,concrete,x,.25,z,true);box(3.1,.08,4.7,grass,x,.54,z);tree(x,z,1.05);for(let i=0;i<8;i++)box(.14,.12,4,wood,x+(i-3.5)*.2,.65,z+3.05);for(const dz of [1.6,4.5])box(1.4,.55,.14,dark,x,.3,z+dz,true);}
for(const x of [-5.8,5.8])for(const z of [5,14,23]){cylinder(.07,.9,dark,x,.45,z);cylinder(.08,.13,new T.MeshStandardMaterial({color:'#ffedb0',emissive:'#ffe9af',emissiveIntensity:.7}),x,.9,z);}
for(const x of [-11.5,11.5])box(.18,.03,30,mat('#afbbc0'),x,.04,10);
for(let z=-4;z<30;z+=.4)for(const x of [-11.5,11.5])box(.16,.015,.025,dark,x,.06,z);
sign('校园科技展   /   Science Fair',0,2.5,-16.9,10,1.5,'#0d4057','#f3f7f7');
// Distant buildings make the courtyard belong to a campus rather than float in space.
for(const [x,z,h] of [[-38,-27,12],[31,-30,15],[0,-35,10],[-39,24,9]]){box(16,h,12,mat('#bdced5'),x,h/2,z,true);for(let y=2;y<h;y+=2.5)box(16.1,.7,12.1,mat('#8eaebc',.3),x,y,z);}
// Low garden wall and planting close the courtyard behind the arrival point.
for(const x of [-11,11])box(14,1.1,.45,concrete,x,.55,32,true);
for(const x of [-15,-9,9,15])tree(x,34,.9);
// A walkable southern extension; each new region lives in the same world coordinate system.
box(8,.04,28,mat('#bec8cb'),0,.02,42);
for(const x of [-4.4,4.4])for(const z of [33,38,43]){cylinder(.07,.9,dark,x,.45,z);cylinder(.08,.13,white,x,.9,z);}
box(24,.06,19,mat('#d9dcd5'),0,.03,48);
box(24,1.2,.35,concrete,0,.6,57,true);
for(const x of [-12,12])box(.3,1.2,13,concrete,x,.6,50.5,true);
box(25,.28,14,dark,0,4.65,50.5);
for(const x of [-10,10])box(.22,4.5,.22,steel,x,2.25,44,true);
sign('Campus Cafe',0,4.1,43.5,8,.65);
box(7,1.05,1.3,wood,5,.55,52.5,true);box(7.2,.1,1.5,white,5,1.12,52.5);
for(const [x,z] of [[-7,48],[-7,53]]){cylinder(.95,.1,wood,x,.85,z);cylinder(.12,.8,steel,x,.4,z);obstacles.push({x,z,w:1.25,d:1.25});for(const dz of [-1.5,1.5]){box(1.6,.12,.5,wood,x,.55,z+dz);for(const dx of [-.55,.55])box(.12,.5,.36,steel,x+dx,.25,z+dz);}}
for(const x of [-14,14]){box(2.8,.5,4,concrete,x,.25,40,true);box(2.5,.08,3.7,grass,x,.54,40);tree(x,40,.85);}
// Open shop with a real customer area, display counter and separate collection stand.
box(14,.05,12,mat('#e1e5df'),25,.03,46);
box(14,1.2,.3,concrete,25,.6,52,true);for(const x of [18,32])box(.3,1.2,10,concrete,x,.6,47,true);
box(14.5,.25,12.5,dark,25,4.5,46);sign('Campus Store',25,3.9,40,8,.65);
box(5,1,1,wood,27,.5,49.5,true);box(5.2,.1,1.2,white,27,1.05,49.5);
for(const x of [20,22]){box(1.2,1.5,.6,white,x,.75,50,true);for(const y of [.5,1,1.5])box(1.3,.07,.7,steel,x,y,50);}
// East library: connected to the courtyard by an open promenade.
box(45,.04,5,mat('#bec8cb'),37,.025,26);
box(17,.05,16,mat('#e1e5df'),45,.035,16);
box(17,1.2,.3,concrete,45,.6,8,true);for(const x of [36.5,53.5])box(.3,1.2,13,concrete,x,.6,14.5,true);
box(18,.25,17,dark,45,4.5,16);sign('Library',45,3.8,24.3,7,.7);
for(const x of [39,44,49]){box(3,1.8,.65,wood,x,.9,9,true);for(const y of [.5,1,1.5])box(3,.06,.7,white,x,y,9);for(let i=0;i<9;i++)box(.18,.32,.3,mat(i%2?'#568a99':'#bf9f64'),x-1.2+i*.3,1.7,9.1);}
// Campus transport kiosk: the museum route is learned here, no bus boarding is simulated.
box(17,.05,12,mat('#c2ced0'),59,.03,36);
for(const x of [56,65])box(.16,3,.16,steel,x,1.5,37);
box(10,.18,3,white,60.5,3.1,37);sign('Campus Shuttle',60.5,2.6,38.6,8,.55);
box(5,.12,.65,wood,60,.65,39);for(const x of [58,62])box(.15,.6,.5,steel,x,.3,39);
// Western outdoor learning lawn and sports area; no external forest map is implied.
box(18,.06,24,grass,-25,.02,52);
for(const [x,z] of [[-33,42],[-33,61],[-16,63]])tree(x,z,.85);
sign('Outdoor Club',-26,2,40,6,.7);
box(12,.05,16,mat('#719eab'),-24,.03,25);
for(const x of [-29.5,-18.5])box(.06,.02,15,white,x,.08,25);
for(const z of [17.5,25,32.5])box(11,.02,.06,white,-24,.08,z);
const courtCircle=new T.Mesh(new T.RingGeometry(1.9,1.95,48),new T.MeshBasicMaterial({color:'#eff2ef',side:T.DoubleSide}));courtCircle.rotation.x=-Math.PI/2;courtCircle.position.set(-24,.08,25);scene.add(courtCircle);
sign('Sports Club',-24,2.6,16.5,6,.7);
sign('Cafe  ↓',3.5,1.5,30.5,2.5,.65);
// Open front and low walls keep the workshop interior legible from the campus camera.
const workshopPaint=mat('#79968e'),workshopWood=mat('#bd9365'),workshopMetal=mat('#365664');
box(14,.06,14,mat('#e4d5be'),65,.03,14);
box(14,1.25,.3,workshopPaint,65,.625,7,true);
for(const x of [58,72])box(.3,1.25,14,workshopPaint,x,.625,14,true);
box(12,.19,.26,workshopMetal,65,3.18,7);
for(const x of [59,71])box(.2,3.2,.25,workshopMetal,x,1.6,7,true);
sign('Campus Workshop',65,2.75,7.23,7,.76);
const benchTop=box(3.4,.15,1.6,workshopWood,workshopBench.x,.95,workshopBench.z,true);
benchTop.userData.learningWord='workbench';
for(const x of [63.6,66.4])for(const z of [10.5,11.5])box(.15,.9,.15,workshopMetal,x,.45,z);
const roomParts=new Map(),benchParts=new Map();
const bulbMaterial=new T.MeshStandardMaterial({color:'#ffe6ad',emissive:'#ffc552',emissiveIntensity:0,roughness:.25});
function partModel(part,x,y,z,installed=false){
 if(part.id==='base')return cylinder(.36,.13,workshopMetal,x,y,z);
 if(part.id==='battery')return box(.23,.32,.24,mat('#49a78b'),x,y,z);
 const bulb=cylinder(.24,.29,installed?bulbMaterial:mat('#fff0ca'),x,y,z);
 return bulb;
}
for(const [index,part] of workshopParts.entries()){
 box(.92,.65,.85,workshopWood,part.x,.33,part.z,true);
 box(1,.08,.92,workshopMetal,part.x,.68,part.z);
 const prop=partModel(part,part.x,.86,part.z);prop.userData.learningWord=part.word;prop.userData.workshopPart=part.id;
 roomParts.set(part.id,prop);
 const model=partModel(part,workshopBench.x,1.08+index*.22,workshopBench.z,true);model.userData.learningWord=part.word;
 benchParts.set(part.id,model);
}
const lanternLight=new T.PointLight('#ffcc69',0,5);lanternLight.position.set(workshopBench.x,1.6,workshopBench.z);scene.add(lanternLight);
function updateWorkshop(state){
 for(const [id,mesh] of roomParts)mesh.visible=!state?.collected.includes(id);
 const carried=state?.owner==='student';
 const delivered=state?.complete===true;
 const x=carried?player.position.x+.35:delivered?62.85:workshopBench.x;
 const z=carried?player.position.z+.24:delivered?15.25:workshopBench.z;
 for(const [index,part] of workshopParts.entries()){
  const mesh=benchParts.get(part.id);
  mesh.visible=!!state?.installed.includes(part.id);
  mesh.position.set(x,(carried?.85:delivered?.03:1.08)+index*.22,z);
  mesh.scale.setScalar(carried?.7:1);
 }
 const lit=carried||delivered;
 lanternLight.position.set(x,carried?1.4:delivered?.65:1.6,z);
 bulbMaterial.emissiveIntensity=lit?1.8:0;
 lanternLight.intensity=lit?6:0;
}
updateWorkshop(null);
createCampusProps(scene,obstacles,solidMeshes);
let yaw=0,pitch=-.04,active=false,drag=false,lastX=0,lastY=0;let route=[];const keys=new Set(),entry=document.getElementById('entry');
document.getElementById('start').onclick=()=>{entry.hidden=true;game.begin();};
function pause(){active=false;keys.clear();drag=false;entry.hidden=false;}
addEventListener('blur',pause);
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){if(game.conversing){game.closeConversation();keys.clear();return;}pause();return;}if(game.movementLocked)return;if(active&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
renderer.domElement.style.touchAction='none';
let pointerStart=null;const npcRay=new T.Raycaster(),npcPointer=new T.Vector2();
const interactionHint=document.createElement('div');interactionHint.id='interaction-hint';interactionHint.hidden=true;document.body.append(interactionHint);
function clearHover(){dispatchEvent(new CustomEvent('campus-hover-word',{detail:''}));interactionHint.hidden=true;renderer.domElement.style.cursor='default';}
function pickSceneObject(e){
 const rect=renderer.domElement.getBoundingClientRect();npcPointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);npcRay.setFromCamera(npcPointer,camera);
 const hit=npcRay.intersectObjects(scene.children,true).find(h=>{if(!h.object.isMesh||h.object.material?.visible===false)return false;for(let o=h.object;o;o=o.parent)if(!o.visible||o.userData.student||o.userData.cameraFaded)return false;return true;});
 return hit?.object||null;
}
function findObjectTag(object,tag){
 while(object&&!object.userData[tag])object=object.parent;
 return object;
}
renderer.domElement.onpointerdown=e=>{if(!active||game.movementLocked)return;clearHover();pointerStart={x:e.clientX,y:e.clientY};drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};
renderer.domElement.onpointermove=e=>{
 if(!active||game.movementLocked){clearHover();return;}
 if(drag)return;
 const object=pickSceneObject(e);
 const person=findObjectTag(object,'npcId');
 const learningWord=findObjectTag(object,'learningWord')?.userData.learningWord||'';
 dispatchEvent(new CustomEvent('campus-hover-word',{detail:learningWord}));
 if(!person){interactionHint.hidden=true;renderer.domElement.style.cursor=(game.canPickItem(findObjectTag(object,'pickupMission')?.userData.pickupMission)||findObjectTag(object,'workshopPart')||(game.canHangWish&&findObjectTag(object,'wishTree')))?'pointer':'default';return;}
 const id=person.userData.npcId,p=id==='nova'?person.userData.interactionPosition:game.people[id],name=id==='nova'?'Jalor':p.name;
 const near=Math.hypot(player.position.x-p.x,player.position.z-p.z)<=environmentLayout.interactionRadius&&clearLine(p);
 interactionHint.textContent=near?'点击与 '+name+' 交谈':'走近 '+name+' 后交谈';interactionHint.hidden=false;renderer.domElement.style.cursor=near?'pointer':'default';
};
renderer.domElement.onpointerleave=clearHover;
renderer.domElement.onpointerup=e=>{
 const click=pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<6;pointerStart=null;drag=false;
 if(!active||game.movementLocked)return;
 if(!click){renderer.domElement.onpointermove(e);return;}
 const object=pickSceneObject(e);const part=findObjectTag(object,'workshopPart');
 if(findObjectTag(object,'wishTree')&&game.canHangWish){game.hangWish();return;}
 if(part&&game.pickWorkshopPart(part.userData.workshopPart)){keys.clear();route=[];clearHover();return;}
 const item=findObjectTag(object,'pickupMission');
 if(item&&game.pickItem(item.userData.pickupMission)){keys.clear();route=[];destination.visible=false;clearHover();return;}
 const person=findObjectTag(object,'npcId');if(person){keys.clear();route=[];clearHover();game.interact(person.userData.npcId);}else{const point=npcRay.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),0),new T.Vector3());if(point){route=findCampusPath(player.position,point,valid,{bounds:campusWorld.bounds});destination.visible=route.length>0;destination.position.set(point.x,.08,point.z);}}
};
renderer.domElement.onpointercancel=()=>{drag=false;pointerStart=null;};
for(const b of document.querySelectorAll('[data-dir]')){b.onpointerdown=e=>{if(!active||game.movementLocked)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.dir);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.dir);}
function valid(x,z){
 if(Object.values(game.people).some(p=>Math.hypot(x-p.x,z-p.z)<.75))return false;
 if(missions.flatMap(m=>[m.device,m.display]).filter(Boolean).some(p=>Math.hypot(x-p.x,z-p.z)<.85))return false;
 const b=campusWorld.bounds;return x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ&&!obstacles.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d);}
// North-up map: reuse the collision footprints so buildings stay aligned with the world.
const mapLayout=document.getElementById('map-layout'),mapPlayer=document.getElementById('map-player');
const mapBody=document.getElementById('map-body'),mapToggle=document.getElementById('map-toggle');
const svgNS='http://www.w3.org/2000/svg';
function mapRect(x,z,w,d,fill){const el=document.createElementNS(svgNS,'rect');for(const [key,value] of Object.entries({x,y:z,width:w,height:d,fill}))el.setAttribute(key,value);mapLayout.append(el);}
mapRect(-11,-5,22,35,'#46616b');mapRect(-16,-17.5,32,15,'#54717b');mapRect(-18,-15,5,30,'#3f5864');
for(const o of obstacles)mapRect(o.x-o.w+.3,o.z-o.d+.3,(o.w-.3)*2,(o.d-.3)*2,'#91a8ae');
for(const [x,z] of [[-9,8],[9,8],[-9,20],[9,20]])mapRect(x-1.55,z-2.35,3.1,4.7,'#729a7e');
mapRect(58,7,14,14,'#887b62');mapRect(36.5,8,17,16,'#54717b');mapRect(50,30,17,12,'#54717b');mapRect(-34,40,18,24,'#729a7e');mapRect(-30,17,12,16,'#54717b');mapRect(-3.7,-3,7.4,.9,'#7ce0d3');mapRect(-4,28,8,15,'#46616b');mapRect(-12,39,24,18,'#54717b');
for(const [label,x,z] of [['科学中心',0,-7],['庭院',0,12],['咖啡馆',0,55],['商店',25,46],['手工坊',65,14],['图书馆',45,18],['车站',60,36],['草坪',-25,52],['运动区',-24,25]]){const el=document.createElementNS(svgNS,'text');el.setAttribute('x',x);el.setAttribute('y',z);el.setAttribute('fill','#e1edf0');el.setAttribute('font-size','3.5');el.setAttribute('text-anchor','middle');el.textContent=label;mapLayout.append(el);}
mapToggle.onclick=()=>{mapBody.hidden=!mapBody.hidden;mapToggle.setAttribute('aria-expanded',String(!mapBody.hidden));mapToggle.querySelector('span').textContent=mapBody.hidden?'展开 ＋':'收起 −';document.getElementById('minimap').classList.toggle('collapsed',mapBody.hidden);mapToggle.blur();};
function updateMap(){if(!mapBody.hidden)mapPlayer.setAttribute('transform',`translate(${player.position.x} ${player.position.z}) rotate(${180-player.rotation.y*180/Math.PI})`);}
const sightRay=new T.Raycaster();
function clearLine(point){const origin=player.position.clone().add(new T.Vector3(0,1.3,0)),end=new T.Vector3(point.x,1.3,point.z),delta=end.sub(origin);sightRay.set(origin,delta.clone().normalize());sightRay.far=Math.max(0,delta.length()-.15);return sightRay.intersectObjects(solidMeshes,false).length===0;}
const destination=new T.Mesh(new T.RingGeometry(.25,.34,32),new T.MeshBasicMaterial({color:'#5de5d4',side:T.DoubleSide}));destination.rotation.x=-Math.PI/2;destination.visible=false;scene.add(destination);
const initialMission=new URLSearchParams(location.search).get('mission');if(levelStarts[initialMission]){const start=levelStarts[initialMission];player.position.set(start.x,0,start.z);}
const game=createEnvironmentGame(scene,camera,value=>{active=value;keys.clear();route=[];drag=false;},player,clearLine);
const updateCharacters=createCampusCharacters(scene,camera,valid,player,game.people);
const requestedMode=new URLSearchParams(location.search);if(requestedMode.has('mission')||requestedMode.get('explore')==='1'){entry.hidden=true;game.begin();}else location.replace('./');
const fadeRay=new T.Raycaster();
function fadeBuildings(dt){const target=player.position.clone().add(new T.Vector3(0,1,0)),direction=target.clone().sub(camera.position);fadeRay.set(camera.position,direction.clone().normalize());fadeRay.far=direction.length();const hits=new Set(fadeRay.intersectObjects(occluders,false).map(h=>h.object));for(const o of occluders){const f=o.userData.fade,roof=f.overhead&&Math.abs(player.position.x-f.x)<f.w/2+2&&Math.abs(player.position.z-f.z)<f.d/2+2;const faded=hits.has(o)||roof||(f.canopy&&Math.abs(player.position.x)<7&&Math.abs(player.position.z)<5);o.material.transparent=true;o.material.opacity+=( (faded?.07:f.opacity)-o.material.opacity)*Math.min(1,dt*10);o.material.depthWrite=!faded&&f.opacity===1;o.userData.cameraFaded=o.material.opacity<.15;}}
let prev=0;
renderer.setAnimationLoop(time=>{const dt=Math.min((time-prev)/1000||.016,.04);prev=time;let moving=false;
 if(game.movementLocked){keys.clear();route=[];}
 if(active&&!game.movementLocked){const f=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown')),r=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));let dx=0,dz=0;const n=Math.hypot(f,r),speed=keys.has('shift')?3.8:2.1;
 if(n){route=[];dx=(r*Math.cos(viewYaw)-f*Math.sin(viewYaw))/n;dz=(-r*Math.sin(viewYaw)-f*Math.cos(viewYaw))/n;}
 else if(route.length){const next=route[0],x=next.x-player.position.x,z=next.z-player.position.z,d=Math.hypot(x,z);if(d<.12)route.shift();else{dx=x/d;dz=z/d;}}
 if(dx||dz){const x=player.position.x,z=player.position.z,step=dt*speed;if(valid(x+dx*step,z))player.position.x+=dx*step;if(valid(player.position.x,z+dz*step))player.position.z+=dz*step;moving=Math.hypot(player.position.x-x,player.position.z-z)>.001;if(moving){const target=Math.atan2(player.position.x-x,player.position.z-z),delta=Math.atan2(Math.sin(target-player.rotation.y),Math.cos(target-player.rotation.y));player.rotation.y+=Math.max(-dt*9,Math.min(dt*9,delta));}else route=[];}}
 destination.visible=active&&route.length>0;if(moving||game.movementLocked||!active)clearHover();student.update(dt,moving);followCamera();fadeBuildings(dt);updateCharacters(dt,time,active&&!game.movementLocked,matchMedia('(prefers-reduced-motion: reduce)').matches);game.update(active);updateWorkshop(game.workshopState);renderer.render(scene,camera);updateMap();});
addEventListener('resize',()=>{camera.left=-8*innerWidth/innerHeight;camera.right=8*innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
