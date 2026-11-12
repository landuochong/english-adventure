import {GLTFLoader} from './vendor/three/loaders/GLTFLoader.js';
import * as T from './vendor/three/three.module.js';
import {environmentLayout} from './campus-environment-layout.js?v=range-35';
import { createRobotCoach } from './robot-coach.js?v=school-1';

// Stylized campus cast. Characters provide presence only; they never complete tasks.
export function createCampusCharacters(scene, camera, canWalk, actor=camera) {
  const material = color => new T.MeshStandardMaterial({color, roughness:.82});
  const skin = material('#dca981'), hair = material('#302c30'), shoes = material('#eff2ed');
  function person({name, role, x, z, shirt, trousers='#334354', scale=1, backpack=false}) {
    const root = new T.Group(); root.position.set(x,0,z); root.scale.setScalar(scale); scene.add(root);
    const beacon=new T.Mesh(new T.CylinderGeometry(.18,.22,.45,12),material(shirt));beacon.position.y=.225;root.add(beacon);
    const legs=[],arms=[];
    const c=document.createElement('canvas');c.width=256;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#163447dd';ctx.beginPath();ctx.roundRect(0,0,256,96,20);ctx.fill();ctx.fillStyle='#fff';ctx.font='500 52px system-ui';ctx.textAlign='center';ctx.fillText(name,128,66);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
    const label=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false,transparent:true,sizeAttenuation:false}));label.position.y=2.22;label.scale.set(1.4,.35,1);root.add(label);
    return {root,legs,arms,label,phase:0};
  }
  const people=Object.entries(environmentLayout.people).map(([id,p])=>({id,...person({...p,role:id==='mia'?'科技引导员':id==='ben'?'服务台':'实验员',shirt:id==='mia'?'#e1b76e':id==='ben'?'#c1dce3':'#647db4'})}));
  for(const person of people){person.root.userData.npcId=person.id;
    const ring=new T.Mesh(new T.RingGeometry(.55,.61,40),new T.MeshBasicMaterial({color:'#79e1cf',transparent:true,opacity:.7,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(person.root.position.x,.09,person.root.position.z);scene.add(ring);person.rangeRing=ring;
  }
  // Ready-made CC0 people; only the existing Sam needs one sampled idle pose.
  // Swap a model here without changing NPC identity, tasks, or world coordinates.
  const localCast=['localhost','127.0.0.1'].includes(location.hostname);
  const asset=(file,fallback,height,idle)=>({file:localCast?'../local-characters/'+file:fallback,fallback,height,idle});
  const assets={mia:{file:'vanguard-mixamo.glb',fallback:'mia-riley.glb',height:1.8,idle:'Idle'},ben:asset('ben-service.glb','coach-sam.glb',1.78,'Idle_Standing'),leo:asset('mia-scan.glb','leo-theo.glb',1.73)};
  const status=document.createElement('div');status.setAttribute('role','status');status.style.cssText='position:fixed;left:30px;top:90px;background:#163447dd;color:white;padding:8px 12px;border-radius:6px;font:13px system-ui';document.body.append(status);
  let pending=0;const failures=[];const requested=new Set();
  const report=()=>{status.textContent=pending?'正在加载附近人物…':failures.length?'人物加载未完成：'+failures.join('、')+'；刷新可重试':'';status.hidden=!pending&&!failures.length;};report();
  const loader=new GLTFLoader();
  function loadPerson(person){if(requested.has(person.id))return;requested.add(person.id);pending++;report();const config=assets[person.id];
    loader.loadAsync('./assets/characters/'+config.file).catch(error=>{if(config.fallback&&config.file!==config.fallback)return loader.loadAsync('./assets/characters/'+config.fallback);throw error;}).then(gltf=>{
      const avatar=gltf.scene;
      if(config.idle&&gltf.animations.length){const mixer=new T.AnimationMixer(avatar),idle=gltf.animations.find(c=>c.name===config.idle);if(!idle)throw new Error('Missing standing pose');mixer.clipAction(idle).play();mixer.update(0);if(gltf.animations.some(c=>c.name==='Talking'||c.name==='Wave')){person.mixer=mixer;person.actions=Object.fromEntries(gltf.animations.map(c=>[c.name,mixer.clipAction(c)]));person.current='Idle';if(person.actions.Wave){person.actions.Talking=person.actions.Wave;person.actions.Talking.setLoop(T.LoopOnce,1);person.actions.Talking.clampWhenFinished=true;}}}
      avatar.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(avatar);
      const scale=config.height/(bounds.max.y-bounds.min.y);avatar.scale.multiplyScalar(scale);
      avatar.position.set(-(bounds.min.x+bounds.max.x)*scale/2,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*scale/2);
      avatar.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});
      for(const child of [...person.root.children])if(child!==person.label)person.root.remove(child);
      person.root.add(avatar);person.label.position.y=-.42;
    }).catch(error=>{failures.push(environmentLayout.people[person.id].name);console.error('NPC model:',person.id,error);}).finally(()=>{pending--;report();});
  }
  loadPerson(people.find(p=>p.id==='mia'));
  addEventListener('campus-voice-state',e=>{for(const p of people){p.speaking=e.detail.id===p.id&&e.detail.state==='speaking';p.listening=e.detail.id===p.id&&e.detail.state==='listening';}});
  const updateCoach=createRobotCoach(scene,actor,canWalk,camera);
  return function update(dt,time,active){
    updateCoach(dt,active);
    for(const p of people){
      const distance=p.root.position.distanceTo(actor.position);
      if(p.mixer){const next=active&&p.speaking?'Talking':'Idle';if(next!==p.current){p.actions[next].reset().play().crossFadeFrom(p.actions[p.current],.25,false);p.current=next;}p.mixer.update(dt);}
      p.rangeRing.material.color.set(p.listening?'#ffd18b':p.speaking?'#65bfff':'#79e1cf');
      if(active&&distance<16)loadPerson(p);
      p.label.visible=active&&distance<6;p.rangeRing.visible=active&&distance<=environmentLayout.interactionRadius;
      const labelUnits=(camera.isOrthographicCamera?(camera.top-camera.bottom)/camera.zoom:2*Math.tan(camera.fov*Math.PI/360))/innerHeight;
      p.label.scale.set(76*labelUnits,28*labelUnits,1);
      if(active&&distance<6){
        const target=Math.atan2(actor.position.x-p.root.position.x,actor.position.z-p.root.position.z);
        const turn=Math.atan2(Math.sin(target-p.root.rotation.y),Math.cos(target-p.root.rotation.y));
        p.root.rotation.y+=Math.max(-dt,Math.min(dt,turn));
      }
    }
  };
}
