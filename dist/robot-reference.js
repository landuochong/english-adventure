const R=window.CampusReference,T=R.THREE;
const renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;document.body.prepend(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#dce5e6');scene.fog=new T.Fog('#dce5e6',22,65);
const camera=new T.PerspectiveCamera(48,innerWidth/innerHeight,.05,100);
scene.add(new T.HemisphereLight('#eef7ff','#8c9886',2));const sun=new T.DirectionalLight('#fff4df',3);sun.position.set(5,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8});sun.shadow.normalBias=.015;scene.add(sun);
const G={renderer,scene,camera,params:{tex:512,wet:0,eshow:'both'},quality:{tex:512},time:{t:0,dt:0,frame:0},events:R.events(),rng:R.rng(4207),level:{groundSurfaceAt:()=> 'concrete'},player:{pos:new T.Vector3(0,0,8),eye:new T.Vector3(0,1.7,8),alive:true},render:{},fx:{},audio:null};
let showcase,paused=false,speed=1,angle=.6,elevation=.36,radius=8,drag=false,lastX=0,lastY=0;
const target=new T.Vector3(0,1,0);
try{
 G.mats=await R.materials(G);G.physics=R.physics(G);G.physics.build();
 const floor=new T.Mesh(new T.PlaneGeometry(100,100),G.mats.get('concrete',{triplanar:true}));floor.rotation.x=-Math.PI/2;floor.position.y=-.01;floor.receiveShadow=true;scene.add(floor);
 showcase=await R.showcase(G);document.getElementById('status').hidden=true;
}catch(e){document.getElementById('status').textContent='加载失败：'+e.message;console.error(e);}
for(const button of document.querySelectorAll('[data-mode]'))button.onclick=()=>{const mode=button.dataset.mode;for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b===button));for(const item of G.enemies.list)item.rig.group.visible=mode==='both'||item.type===mode;radius=mode==='gull'?3.5:mode==='hound'?5.5:8;target.set(mode==='gull'?-.9:.3,mode==='gull'?2.2:mode==='hound'?.65:1,0);};
document.getElementById('pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'继续动作':'暂停动作';};document.getElementById('speed').onchange=e=>speed=Number(e.target.value);
renderer.domElement.onpointerdown=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};renderer.domElement.onpointermove=e=>{if(!drag)return;angle-=(e.clientX-lastX)*.006;elevation=Math.max(.08,Math.min(1.2,elevation+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;};renderer.domElement.onpointerup=renderer.domElement.onpointercancel=()=>drag=false;
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(2.5,Math.min(15,radius+e.deltaY*.007));},{passive:false});
let last=0;renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000||.016,.04);last=now;if(showcase&&!paused){G.time.dt=dt*speed;G.time.t+=dt*speed;G.time.frame++;showcase.update(dt*speed);}camera.position.set(target.x+Math.sin(angle)*radius*Math.cos(elevation),target.y+Math.sin(elevation)*radius,target.z+Math.cos(angle)*radius*Math.cos(elevation));camera.lookAt(target);renderer.render(scene,camera);});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
