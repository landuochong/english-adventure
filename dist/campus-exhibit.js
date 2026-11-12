import * as T from './vendor/three/three.module.js';
// Presentation only. Discovery, ownership and delivery remain in campus-level.
export function createExhibit(scene,camera,location,actor=camera,options={}){
 const shell=new T.MeshStandardMaterial({color:'#f0f4ef',metalness:.15,roughness:.32});
 const graphite=new T.MeshStandardMaterial({color:'#203744',metalness:.4,roughness:.4});
 const blue=new T.MeshStandardMaterial({color:'#83e5ff',emissive:'#31b8ee',emissiveIntensity:1.2,roughness:.3});
 const gold=new T.MeshStandardMaterial({color:'#e8b66b',metalness:.45,roughness:.3});
 const robot=new T.Group();scene.add(robot);
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
 stand(location.x,location.z);const display=options.display||{x:-.8,z:-1.2};stand(display.x,display.z);
 let priorOwner=null,pickupAt=0,deliveredAt=0;
 const point=new T.Vector3();
 return {display,update(state,now){
   for(const stand of stands)stand.visible=state.visible!==false;
   if(state.visible===false){robot.visible=false;return;}
   if(state.owner!==priorOwner){if(state.owner==='student')pickupAt=now;if(state.owner==='display')deliveredAt=now;priorOwner=state.owner;}
   robot.visible=state.owner==='student'||state.owner==='display'||state.discovered&&state.stage==='pickup';
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
