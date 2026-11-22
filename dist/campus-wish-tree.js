import * as T from './vendor/three/three.module.js';
import {wishPeople} from './campus-wish.js';

function paperLeaf(color, painted) {
  const canvas=document.createElement('canvas');
  canvas.width=128; canvas.height=160;
  const pen=canvas.getContext('2d');
  pen.fillStyle=color; pen.beginPath(); pen.moveTo(64,4);
  pen.bezierCurveTo(122,40,131,118,65,155);
  pen.bezierCurveTo(2,121,5,53,64,4); pen.fill();
  pen.strokeStyle='#96734a'; pen.lineWidth=2; pen.beginPath();
  pen.moveTo(64,8); pen.quadraticCurveTo(50,70,65,145); pen.stroke();
  if (painted) {
    pen.fillStyle='#24536a';
    pen.beginPath(); pen.ellipse(61,86,24,17,-.18,0,2*Math.PI); pen.fill();
    pen.beginPath(); pen.arc(79,72,12,0,2*Math.PI); pen.fill();
    pen.beginPath(); pen.moveTo(46,84); pen.lineTo(25,69); pen.lineTo(37,92); pen.fill();
    pen.fillStyle='#e5a145'; pen.beginPath(); pen.moveTo(88,69); pen.lineTo(99,74); pen.lineTo(88,76); pen.fill();
    pen.fillStyle='#80b8c5'; pen.beginPath(); pen.ellipse(57,84,13,6,-.35,0,2*Math.PI); pen.fill();
    pen.fillStyle='#fff'; pen.beginPath(); pen.arc(82,70,2,0,2*Math.PI); pen.fill();
  }
  const texture=new T.CanvasTexture(canvas); texture.colorSpace=T.SRGBColorSpace;
  return new T.Mesh(new T.PlaneGeometry(.42,.54),new T.MeshStandardMaterial({map:texture,alphaTest:.45,side:T.DoubleSide}));
}

export function createWishTree(scene,actor) {
  const garland=new T.Group(); scene.add(garland); garland.position.set(9,0,9.35);
  garland.userData.wishTree=true; garland.userData.learningWord='wish tree';
  const rope=new T.Mesh(new T.BoxGeometry(2.8,.025,.025),new T.MeshStandardMaterial({color:'#a27f55'}));
  rope.position.y=2; garland.add(rope);
  const wood=new T.MeshStandardMaterial({color:'#c49659'});
  const colors=['#efb261','#f0cc8d','#e68f78','#9ecab0','#f3d378'];
  const leaves=colors.map((color,i)=>{
    const x=(i-2)*.62, clip=new T.Mesh(new T.BoxGeometry(.07,.15,.07),wood);
    clip.position.set(x,1.97,0); garland.add(clip);
    const leaf=paperLeaf(color,i===3); leaf.position.set(x,1.69,0); garland.add(leaf); return leaf;
  });
  const blank=paperLeaf('#9ecab0',false), painted=paperLeaf('#9ecab0',true);
  for (const leaf of [blank,painted]) { actor.add(leaf); leaf.position.set(.38,.87,.24); leaf.rotation.z=-.3; }
  const companion={...wishPeople.ben};
  let walking=false;
  return {companion, update(state, completed) {
    const accompanying=state?.stage==='report'||state?.stage==='handover';
    if (accompanying) {
      const p=actor.position;
      if (!walking && Math.hypot(companion.x-p.x,companion.z-p.z)>5) {
        companion.x=p.x+1.2; companion.z=p.z;
      }
      const dx=p.x-companion.x,dz=p.z-companion.z,d=Math.hypot(dx,dz);
      if (d>1.55) {companion.x=p.x-dx/d*1.55; companion.z=p.z-dz/d*1.55;}
    } else Object.assign(companion,state?.complete?{x:7,z:9.7}:wishPeople.ben);
    walking=accompanying;
    garland.visible=!!state||completed;
    leaves[3].visible=state?state.complete:completed;
    blank.visible=state?.owner==='student'&&!accompanying;
    painted.visible=accompanying;
  }};
}
