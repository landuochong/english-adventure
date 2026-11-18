import * as T from './vendor/three/three.module.js';
const objectWords={
 lunch:{item:'lunch bag',pickup:'pickup counter',destination:'picnic table',pickupLabel:'取餐台'},
 book:{item:'textbook',pickup:'collection stand',destination:'book stand',pickupLabel:'课本领取台'},
 cap:{item:'cap',pickup:'collection stand',destination:'display stand',pickupLabel:'帽子领取台'},
 robot:{item:'robot',pickup:'display stand',destination:'exhibit stand',pickupLabel:'实验展示台'}
};
// Presentation only. Discovery, ownership and delivery remain in campus-level.
export function createExhibit(scene,camera,location,actor=camera,options={}){
 const shell=new T.MeshStandardMaterial({color:'#f0f4ef',metalness:.15,roughness:.32});
 const graphite=new T.MeshStandardMaterial({color:'#203744',metalness:.4,roughness:.4});
 const blue=new T.MeshStandardMaterial({color:'#83e5ff',emissive:'#31b8ee',emissiveIntensity:1.2,roughness:.3});
 const gold=new T.MeshStandardMaterial({color:'#e8b66b',metalness:.45,roughness:.3});
 const words=objectWords[options.kind]||objectWords.robot;
 const robot=new T.Group();robot.userData.learningWord=words.item;robot.userData.pickupMission=options.missionId;scene.add(robot);
 function mesh(geometry,material,x,y,z,parent=robot){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 const body=mesh(new T.SphereGeometry(.25,32,20),shell,0,.3,0);body.scale.set(1,1.05,.8);
 const head=mesh(new T.SphereGeometry(.25,32,20),shell,0,.62,0);head.scale.set(1,.8,.85);
 const visor=mesh(new T.SphereGeometry(.205,32,16),graphite,0,.64,.08);visor.scale.set(1,.56,.85);
 for(const x of [-.075,.075]){const eye=mesh(new T.SphereGeometry(.035,16,12),blue,x,.65,.239);eye.scale.set(.7,1,.35);}
 mesh(new T.CylinderGeometry(.014,.014,.11,12),graphite,0,.86,0);
 mesh(new T.SphereGeometry(.03,16,12),blue,0,.93,0);
 for(const x of [-.23,.23]){const wheel=mesh(new T.CylinderGeometry(.105,.105,.07,24),graphite,x,.11,0);wheel.rotation.z=Math.PI/2;
 const hub=mesh(new T.CylinderGeometry(.045,.045,.075,20),gold,x,.11,0);hub.rotation.z=Math.PI/2;
 const arm=mesh(new T.CapsuleGeometry(.045,.14,5,12),shell,x*1.1,.35,0);arm.rotation.z=x>0?.25:-.25;}
 mesh(new T.BoxGeometry(.11,.025,.015),blue,0,.34,.2);
 if(options.kind==='lunch'){
   robot.clear();
   mesh(new T.BoxGeometry(.55,.5,.3),new T.MeshStandardMaterial({color:'#d9b984',roughness:.9}),0,.25,0);
   const handle=mesh(new T.TorusGeometry(.12,.018,8,24,Math.PI),graphite,0,.5,0);handle.rotation.z=0;
 }
 if(options.kind==='book'){
  robot.clear();mesh(new T.BoxGeometry(.55,.1,.4),shell,0,.06,0);const cover=new T.MeshStandardMaterial({color:'#3d83aa'});mesh(new T.BoxGeometry(.58,.025,.43),cover,0,.125,0);mesh(new T.BoxGeometry(.58,.025,.43),cover,0,.008,0);
 }
 if(options.kind==='cap'){
  robot.clear();const fabric=new T.MeshStandardMaterial({color:'#3688cc',roughness:.9});mesh(new T.SphereGeometry(.24,20,12,0,Math.PI*2,0,Math.PI/2),fabric,0,.03,0);const brim=mesh(new T.SphereGeometry(.22,20,12),fabric,0,.03,.18);brim.scale.set(1,.08,1);
 }
 const stands=[];
 function stand(x,z){const g=new T.Group();scene.add(g);g.position.set(x,0,z);
 mesh(new T.CylinderGeometry(.52,.58,.72,48),graphite,0,.36,0,g);
 mesh(new T.CylinderGeometry(.58,.58,.065,48),shell,0,.752,0,g);
 const ring=mesh(new T.TorusGeometry(.5,.012,8,64),blue,0,.79,0,g);ring.rotation.x=-Math.PI/2;
 stands.push(g);return g;}
 const pickupStand=stand(location.x,location.z);
 pickupStand.userData.learningWord=words.pickup;pickupStand.userData.pickupMission=options.missionId;const display=options.display||{x:-.8,z:-1.2};
 const meal=new T.Group();meal.userData.learningWord='lunch';meal.position.set(display.x,.8,display.z);scene.add(meal);meal.visible=false;
 if(options.kind==='lunch'){
  const table=new T.Group();table.userData.learningWord=words.destination;table.position.set(display.x,0,display.z);scene.add(table);stands.push(table);
  const timber=new T.MeshStandardMaterial({color:'#ac8252',roughness:.8});mesh(new T.BoxGeometry(1.45,.1,1),timber,0,.74,0,table);
  for(const x of [-.55,.55])for(const z of [-.34,.34])mesh(new T.BoxGeometry(.08,.72,.08),graphite,x,.36,z,table);
  mesh(new T.BoxGeometry(1.05,.012,.72),new T.MeshStandardMaterial({color:'#e7d19a'}),0,.8,0,table);
  const bread=new T.MeshStandardMaterial({color:'#e6bd79',roughness:.9}),cheese=new T.MeshStandardMaterial({color:'#efd86d'}),leaf=new T.MeshStandardMaterial({color:'#629c5d'});
  for(const x of [-.27,.27]){
   mesh(new T.CylinderGeometry(.23,.23,.025,32),shell,x,.04,0,meal);
   for(const [y,m,h] of [[.085,bread,.065],[.13,leaf,.018],[.15,cheese,.018],[.19,bread,.065]])mesh(new T.BoxGeometry(.28,h,.25),m,x,y,0,meal);
  }
  mesh(new T.CylinderGeometry(.075,.06,.23,20),new T.MeshPhysicalMaterial({color:'#a7deea',transparent:true,opacity:.7,roughness:.1}),.48,.14,-.26,meal);
 }else stand(display.x,display.z).userData.learningWord=words.destination;
 let priorOwner=null,pickupAt=0,deliveredAt=0;
 const point=new T.Vector3();
 return {display,pickupLabel:words.pickupLabel,update(state,now){
   for(const [i,stand] of stands.entries())stand.visible=state.visible!==false&&(!state.displayOnly||i!==0);
   meal.visible=options.kind==='lunch'&&state.visible!==false&&state.complete===true;
   if(state.visible===false){robot.visible=false;return;}
   if(state.owner!==priorOwner){if(state.owner==='student')pickupAt=now;if(state.owner==='display')deliveredAt=now;priorOwner=state.owner;}
   robot.visible=state.owner==='student'||state.owner==='display'||state.discovered===true&&state.stage==='pickup';
   if(options.kind==='lunch'&&state.owner==='display'){robot.visible=false;return;}
   if(!robot.visible)return;
   if(state.owner==='student'){
     const t=Math.min(1,(now-pickupAt)/350),ease=1-Math.pow(1-t,3);
     point.set(.36,.65+ease*.15,.38).applyQuaternion(actor.quaternion).add(actor.position);
     robot.position.copy(point);robot.quaternion.copy(actor.quaternion);robot.rotateY(-.28);robot.scale.setScalar(.45);
   }else{
     robot.position.set(state.owner==='display'?display.x:location.x,.79,state.owner==='display'?display.z:location.z);
     robot.scale.setScalar(1);robot.quaternion.identity();
     if(state.owner==='display'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const t=Math.min(1,(now-deliveredAt)/700);robot.rotation.y=(1-Math.pow(1-t,3))*Math.PI*2;}
   }
   blue.emissiveIntensity=state.complete?1.5:1.05;
 }};
}
