import * as T from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/loaders/GLTFLoader.js';
export function createStudent(scene){
 const root=new T.Group();root.position.set(1,0,20);scene.add(root);root.userData.student=true;
 const ring=new T.Mesh(new T.RingGeometry(.38,.46,40),new T.MeshBasicMaterial({color:'#56d9d1',side:T.DoubleSide,transparent:true,opacity:.85}));ring.rotation.x=-Math.PI/2;ring.position.y=.07;root.add(ring);
 const placeholder=new T.Mesh(new T.CapsuleGeometry(.22,.85,5,12),new T.MeshStandardMaterial({color:'#57a9a7'}));placeholder.position.y=.85;root.add(placeholder);
 let mixer,actions,current='Idle';const previousPosition=root.position.clone();
 new GLTFLoader().loadAsync('./assets/characters/school-robot.glb').then(gltf=>{
   const avatar=gltf.scene;mixer=new T.AnimationMixer(avatar);actions=Object.fromEntries(['Idle','Walking','Running'].map(name=>{const clip=gltf.animations.find(c=>c.name===name);if(!clip)throw new Error('Missing student animation: '+name);return [name,mixer.clipAction(clip)];}));actions.Idle.play();mixer.update(0);
   avatar.updateMatrixWorld(true);const box=new T.Box3().setFromObject(avatar),scale=1.65/(box.max.y-box.min.y);avatar.scale.multiplyScalar(scale);avatar.position.set(-(box.min.x+box.max.x)*scale/2,-box.min.y*scale,-(box.min.z+box.max.z)*scale/2);
   avatar.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});root.remove(placeholder);root.add(avatar);
 }).catch(e=>console.error('Student model:',e));
 return {root,update(dt,moving){const speed=moving&&dt>0?Math.hypot(root.position.x-previousPosition.x,root.position.z-previousPosition.z)/dt:0;previousPosition.copy(root.position);if(!mixer||!actions)return;const next=speed<.05?'Idle':speed>2?'Running':'Walking';if(next!==current){actions[next].reset().play().crossFadeFrom(actions[current],.18,false);current=next;}actions.Walking.setEffectiveTimeScale(Math.max(.15,speed/1.4));actions.Running.setEffectiveTimeScale(Math.max(.15,speed/2.8));mixer.update(dt);}};
}
