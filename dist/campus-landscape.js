import * as T from './vendor/three/three.module.js';
// Shared instanced foliage: detailed silhouettes without thousands of draw calls.
export function createCampusTreeFactory(scene,random){
 const c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d');
 const gradient=ctx.createLinearGradient(0,0,128,256);gradient.addColorStop(0,'#b4c77d');gradient.addColorStop(1,'#456d3e');
 ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(64,8);ctx.bezierCurveTo(125,75,119,180,64,247);ctx.bezierCurveTo(6,178,7,73,64,8);ctx.fill();
 ctx.strokeStyle='#c9d39877';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(64,18);ctx.lineTo(64,241);ctx.stroke();
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
 const leaves=new T.MeshStandardMaterial({map:texture,alphaTest:.5,side:T.DoubleSide,roughness:.88});
 const bark=new T.MeshStandardMaterial({color:'#756957',roughness:.96});
 const geometry=new T.PlaneGeometry(1,1),temp=new T.Object3D(),up=new T.Vector3(0,1,0);
 function branch(group,a,b,width){const direction=b.clone().sub(a);const m=new T.Mesh(new T.CylinderGeometry(width*.45,width,direction.length(),7),bark);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(up,direction.normalize());m.castShadow=true;group.add(m);}
 return function tree(x,z,size=1){
   const group=new T.Group();group.position.set(x,0,z);group.scale.setScalar(size);scene.add(group);
   branch(group,new T.Vector3(0,.45,0),new T.Vector3(.08,3.7,0),.16);
   for(let i=0;i<12;i++){const angle=i*2.399,r=.8+random()*.8,y=2.5+random()*1.2;branch(group,new T.Vector3(.03,y-.6,0),new T.Vector3(Math.cos(angle)*r,y+.5,Math.sin(angle)*r),.065);}
   const count=1000,foliage=new T.InstancedMesh(geometry,leaves,count);
   for(let i=0;i<count;i++){
     const theta=random()*Math.PI*2,cos=random()*2-1,sin=Math.sqrt(1-cos*cos),r=Math.cbrt(random());
     temp.position.set(Math.cos(theta)*sin*r*2.15,3.8+cos*r*1.25,Math.sin(theta)*sin*r*1.85);
     temp.rotation.set(random()*Math.PI,random()*Math.PI,random()*Math.PI);const scale=.25+random()*.22;temp.scale.set(scale,scale*1.7,1);temp.updateMatrix();foliage.setMatrixAt(i,temp.matrix);
     foliage.setColorAt(i,new T.Color().setHSL(.22+random()*.045,.25+random()*.15,.55+random()*.23));
   }
   foliage.castShadow=foliage.receiveShadow=true;group.add(foliage);
   return group;
 };
}
