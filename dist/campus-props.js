import * as T from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/loaders/GLTFLoader.js';
// Dimensions are reserved before asynchronous loading so navigation never changes underfoot.
export const campusProps = [
 {asset:'computer',x:9,z:50.8,height:1.6,w:.85,d:.7},
 {asset:'computer',x:4.8,z:1.8,height:1.65,w:.85,d:.7},
 {asset:'computer',x:-5.2,z:1.8,height:1.65,w:.85,d:.7},
 {asset:'computer',x:-6.6,z:-6,height:1.6,w:.85,d:.7},
 {asset:'desk',x:4,z:-8,height:.95,w:2.8,d:1.4},
 {asset:'computer',x:5.9,z:-8,height:1.6,w:.85,d:.7},
 {asset:'chair',x:4,z:-6.5,height:1.15,w:.8,d:.8,angle:Math.PI},
 {asset:'locker',x:-13.5,z:-14.8,height:2.15,w:1.4,d:1},
 {asset:'locker',x:-11.7,z:-14.8,height:2.15,w:1.4,d:1},
 {asset:'drone',x:0,z:-13,height:1.05,y:1.05}
];
export function createCampusProps(scene,obstacles,solidMeshes){
 const loader=new GLTFLoader(),cache=new Map();
 const status=document.createElement('div');status.setAttribute('role','status');status.style.cssText='position:fixed;left:30px;top:130px;color:#163447;background:#fffffff0;padding:6px 10px;border-radius:6px;font:13px system-ui';status.hidden=true;document.body.append(status);
 const jobs=campusProps.map(async p=>{
  if(p.w){obstacles.push({x:p.x,z:p.z,w:p.w/2+.3,d:p.d/2+.3});
   const proxy=new T.Mesh(new T.BoxGeometry(p.w,p.height,p.d),new T.MeshBasicMaterial({visible:false}));proxy.position.set(p.x,p.height/2,p.z);scene.add(proxy);solidMeshes.push(proxy);}
  try{
   if(!cache.has(p.asset))cache.set(p.asset,loader.loadAsync('./assets/campus-props/'+p.asset+'.glb'));
   const gltf=await cache.get(p.asset),model=p.asset==='drone'?gltf.scene:gltf.scene.clone(true);
   // Drone is displayed in its authored rest pose as a science exhibit; no combat animation.
   model.updateMatrixWorld(true);const b=new T.Box3().setFromObject(model),scale=p.height/(b.max.y-b.min.y);
   model.scale.multiplyScalar(scale);model.position.set(-(b.min.x+b.max.x)*scale/2,-b.min.y*scale,-(b.min.z+b.max.z)*scale/2);
   const group=new T.Group();group.position.set(p.x,p.y||0,p.z);group.rotation.y=p.angle||0;group.add(model);scene.add(group);
   model.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;
    const adjust=m=>{const copy=m.clone();copy.metalness=Math.min(copy.metalness??0,.35);copy.roughness=Math.max(copy.roughness??.5,.4);return copy;};o.material=Array.isArray(o.material)?o.material.map(adjust):adjust(o.material);
   }});

  }catch(error){status.hidden=false;status.textContent='部分校园设备未加载，刷新可重试';console.error('Campus prop:',p.asset,error);}
 });
 return Promise.all(jobs);
}
