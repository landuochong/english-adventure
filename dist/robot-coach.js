import {findCampusPath} from './campus-navigation.js';
import {campusWorld} from './campus-world.js';
// Local-only adaptation of the user-provided robot reference. No combat or task writes.
export function createRobotCoach(scene,camera,canWalk,viewCamera=camera){
 const R=window.CampusReference,T=R.THREE;
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
 const c=canvas.getContext('2d');c.fillStyle='#174957';c.fillRect(0,0,256,64);c.fillStyle='white';c.font='bold 32px system-ui';c.textAlign='center';c.fillText('JALOR',128,44);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const badge=new T.MeshBasicMaterial({map:texture,side:T.DoubleSide});
 const player={pos:camera.position.clone(),eye:camera.position.clone(),alive:true};
 const G={scene,player,events:{emit(){}},audio:null,
 mats:{label:()=>({aspect:4,material:badge})},
 physics:{groundHeight:()=>0,raycast:()=>null,nav:{isWalkable:canWalk,findPath:(start,goal)=>findCampusPath(start,goal,canWalk,{bounds:campusWorld.bounds}).map(p=>new T.Vector3(p.x,0,p.z)),randomPoint:()=>null}},level:{groundSurfaceAt:()=> 'concrete'},fx:{}};
 const companion=R.companion(G),dog=companion.dog;
 for(const [dx,dz] of [[0,-2.2],[-2.2,0],[2.2,0],[0,2.2]]){if(canWalk(camera.position.x+dx,camera.position.z+dz)){dog._activate(new T.Vector3(camera.position.x+dx,0,camera.position.z+dz),{passive:true,yaw:Math.PI,patrolRadius:0});break;}}
 dog.rig.group.userData.npcId='nova';
 dog.rig.group.name='campus-coach';
 dog.rig.group.userData.interactionPosition=dog.pos;
 const trail=[new T.Vector3(camera.position.x,0,camera.position.z)];
 let last=trail[0].clone(),wasActive=false;
 const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=96;
 const lc=labelCanvas.getContext('2d');lc.fillStyle='#163447dd';lc.beginPath();lc.roundRect(0,0,256,96,20);lc.fill();lc.fillStyle='#fff';lc.font='52px system-ui';lc.textAlign='center';lc.fillText('Jalor',128,66);
 const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.colorSpace=T.SRGBColorSpace;
 const label=new T.Sprite(new T.SpriteMaterial({map:labelTexture,transparent:true,depthTest:false,sizeAttenuation:false}));label.scale.set(1.5,.28,1);label.position.set(0,-.42,0);dog.rig.group.add(label);
 return (dt,active)=>{
   label.visible=active;
   const distance=dog.pos.distanceTo(camera.position);
   const labelUnits=(viewCamera.isOrthographicCamera?(viewCamera.top-viewCamera.bottom)/viewCamera.zoom:2*Math.tan(viewCamera.fov*Math.PI/360))/innerHeight;
   label.scale.set(76*labelUnits,28*labelUnits,1);
   if(!active){wasActive=false;return;}
   if(!wasActive){dog.path=null;dog.planT=0;dog.waitT=0;dog.hasGoal=false;}
   wasActive=true;
   player.pos.set(camera.position.x,0,camera.position.z);player.eye.copy(camera.position);
   if(player.pos.distanceTo(last)>.3){trail.push(player.pos.clone());last.copy(player.pos);}
   while(trail.length>1&&dog.pos.distanceTo(trail[0])<.55)trail.shift();
   let remaining=dog.pos.distanceTo(trail[0]);for(let i=1;i<trail.length;i++)remaining+=trail[i].distanceTo(trail[i-1]);
   // Follow traversed points, retain personal space, never collect or complete tasks.
   if(remaining>2.6){if(!dog.hasGoal||dog.goal.distanceTo(trail[0])>.1){dog.goal.copy(trail[0]);dog.path=null;dog.planT=0;}dog.hasGoal=true;dog.waitT=0;}
   else{dog.hasGoal=false;dog.path=null;dog.waitT=10;}
   const before=dog.pos.clone();// Keep the original coordinated gait, with enough pace to catch a faster student.
   const followDt=dt*(distance>4?2:1.4);
   for(let left=followDt;left>0;left-=.025)companion.update(Math.min(left,.025));
   if(!canWalk(dog.pos.x,dog.pos.z)){dog.pos.copy(before);dog.speed=0;}
   label.visible=dog.pos.distanceTo(player.pos)<12;
 };
}
