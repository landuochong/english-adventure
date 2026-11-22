import * as T from './vendor/three/three.module.js';
import {gradeSevenMissions} from './campus-grade-seven.js';

function text(ctx,word,x,y,size,color='#263e41'){
 ctx.fillStyle=color;ctx.font='600 '+size+'px Georgia, serif';ctx.fillText(word,x,y);
}
function disc(ctx,x,y,r,color){
 ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();
}
function paint(id,phase){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=432;
 const c=canvas.getContext('2d'),done=phase==='complete';
 c.fillStyle=id==='u2'?'#f3e5c6':'#f5eddc';c.fillRect(0,0,640,432);
 c.strokeStyle='#a78e62';c.lineWidth=4;c.strokeRect(12,12,616,408);
 if(id==='u1'&&phase==='sticker'){
  c.fillStyle='#94b9ae';c.fillRect(20,20,600,392);
  c.fillStyle='#365958';c.beginPath();c.moveTo(100,157);c.lineTo(320,53);c.lineTo(540,157);c.fill();
  c.fillStyle='#fff3d6';c.fillRect(130,162,380,126);
  c.fillStyle='#365958';for(let x=154;x<=440;x+=92)c.fillRect(x,177,48,88);
  text(c,'LIBRARY',185,365,65);
 }else if(id==='u1'){
  text(c,'Our first week',35,74,48);
  ['MON','TUE','WED','THU','FRI'].forEach((day,i)=>{
   const x=32+i*116;c.fillStyle='#476b67';c.fillRect(x,112,106,50);text(c,day,x+12,146,25,'#fff9de');
   c.strokeStyle='#a18b67';c.strokeRect(x,162,106,160);
   if(i<4||done){c.fillStyle=['#dfb670','#91b7ae','#cc9986','#b4ac82','#719aaf'][i];c.fillRect(x+8,177,90,126);
    text(c,['Meet','Tour','Play','Art','Library'][i],x+13,246,22);}
  });
  if(done)text(c,'Friday after school  ·  Ben & Mei',36,379,30);
 }else if(id==='u2'){
  text(c,'Rehearsal',40,73,48);
  for(let i=0;i<5;i++){c.fillStyle='#a99772';c.fillRect(46,138+i*13,548,2);}
  for(let i=0;i<4;i++){disc(c,118+i*114,174-i%2*13,9,'#404745');c.fillStyle='#404745';c.fillRect(124+i*114,128-i%2*13,3,46);}
  text(c,'Guitar',52,267,32);text(c,'Ben',338,267,32);text(c,'Second part',52,350,32);
  if(done)text(c,'Mei  ·  Erhu',338,350,32);else{c.strokeStyle='#967c52';c.beginPath();c.moveTo(335,357);c.lineTo(565,357);c.stroke();}
 }else{
  text(c,'Family album',36,65,41);
  if(phase==='back'){
   c.save();c.translate(82,119);c.rotate(-.035);c.fillStyle='#dfcca5';c.fillRect(0,0,470,235);
   text(c,'A cold morning',43,96,44,'#635240');text(c,'Mei, age six',54,175,33,'#635240');c.restore();
  }else{
   c.fillStyle='#d1c2aa';c.fillRect(45,90,305,275);c.fillStyle='#b3a893';c.fillRect(55,99,285,253);
   disc(c,200,158,36,'#6a5749');disc(c,202,167,27,'#d5ad86');
   c.fillStyle='#6e685b';c.beginPath();c.moveTo(165,195);c.lineTo(132,283);c.lineTo(157,296);c.lineTo(171,269);c.lineTo(166,326);c.lineTo(240,326);c.lineTo(233,267);c.lineTo(248,295);c.lineTo(276,278);c.lineTo(237,195);c.closePath();c.fill();
   for(const y of [221,247,273])disc(c,201,y,3,'#c1ad85');
   text(c,done?"Grandpa's coat":'Mei, age six',372,180,30);
   if(done){text(c,'It kept her',372,233,27);text(c,'warm.',372,275,27);}
  }
 }
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;return tex;
}
function panel(id,phase,width){
 const mesh=new T.Mesh(new T.PlaneGeometry(width,width*432/640),new T.MeshBasicMaterial({map:paint(id,phase),side:T.DoubleSide}));
 return mesh;
}
function instrument(scene,x,z,bowed){
 const group=new T.Group();group.position.set(x,0,z);group.rotation.set(0,.35,-.08);scene.add(group);
 const wood=new T.MeshStandardMaterial({color:bowed?'#77442c':'#c38a42'}),dark=new T.MeshStandardMaterial({color:'#42332e'});
 const body=new T.Mesh(bowed?new T.CylinderGeometry(.135,.135,.25,6):new T.SphereGeometry(.26,18,14),wood);
 body.position.y=.39;if(bowed)body.rotation.x=Math.PI/2;else body.scale.set(1,1.25,.38);group.add(body);
 const neck=new T.Mesh(new T.BoxGeometry(bowed?.032:.085,.89,.045),dark);neck.position.set(0,.92,0);group.add(neck);
 if(bowed){
  const bow=new T.Mesh(new T.CylinderGeometry(.009,.012,.79),wood);bow.rotation.z=1.39;bow.position.set(.17,.51,.09);group.add(bow);
 }else{
  const hole=new T.Mesh(new T.CircleGeometry(.065,16),dark);hole.position.set(0,.47,.099);group.add(hole);
 }
 return group;
}
export function createGradeSevenProps(scene,actor){
 const guitar=instrument(scene,61.3,20,false),erhu=instrument(scene,13.65,19.25,true);
 const reader=document.createElement('dialog');reader.className='chapter-prop-reader';reader.setAttribute('aria-label','查看任务道具');
 const pages=document.createElement('div'),back=document.createElement('button');back.textContent='回到校园';back.onclick=()=>reader.close();
 reader.append(pages,back);document.body.append(reader);
 const displays=gradeSevenMissions.map(config=>{
  const at=config.positions[config.giver],group=new T.Group();group.position.set(at.x+1.25,1.5,at.z-.45);group.rotation.y=.38;scene.add(group);
  group.userData.storyProp=config.id;
  const wood=new T.Mesh(new T.BoxGeometry(2.3,1.6,.09),new T.MeshStandardMaterial({color:'#715843'}));wood.position.z=-.07;group.add(wood);
  for(const x of [-.8,.8]){const leg=new T.Mesh(new T.BoxGeometry(.08,1,.08),wood.material);leg.position.set(x,-1,0);group.add(leg);}
  const phases={};for(const phase of config.id==='u3'?['front','back','complete']:['front','complete']){
   phases[phase]=panel(config.id,phase,2.22);group.add(phases[phase]);
  }
  const card=panel(config.id,config.id==='u1'?'sticker':'front',.42);card.position.set(.34,.88,.27);actor.add(card);
  return {config,group,phases,card};
 });
 function read(id,phase){
  const display=displays.find(d=>d.config.id===id);
  if(!display||reader.open)return;
  const canvas=display.phases[phase].material.map.image;
  canvas.setAttribute('aria-label',phase==='back'?'照片背面：A cold morning · Mei, age six':display.config.title);
  pages.replaceChildren(canvas);reader.showModal();
 }
 function update(id,state,completed){
  guitar.visible=erhu.visible=id==='u2'||completed.includes('u2');
  for(const {config,group,phases,card} of displays){
   const current=config.id===id,done=current?state.complete:completed.includes(config.id);
   group.visible=current||done;card.visible=current&&state.owner==='student';
   const phase=done?'complete':config.id==='u3'&&current&&state.index===0&&state.stage==='interview'?'back':'front';
   for(const [name,mesh] of Object.entries(phases))mesh.visible=name===phase;
  }
 }
 return {read,update};
}

// Four beats of a plucked part and a bowed part, synthesized locally.
let sound;
export function playRehearsal(part){
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
 try{
  sound??=new Audio();
  void sound.resume().then(()=>{
   const start=sound.currentTime+.04;
   for(const [beat,note] of [293.66,329.63,392,349.23].entries()){
    for(const voice of part==='both'?['guitar','erhu']:[part]){
     const bowed=voice==='erhu',osc=sound.createOscillator(),gain=sound.createGain();
     const time=start+beat*.38;osc.type=bowed?'triangle':'sine';osc.frequency.value=bowed?note:note/2;
     gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(.095,time+(bowed?.08:.009));
     gain.gain.exponentialRampToValueAtTime(.0001,time+.36);osc.connect(gain).connect(sound.destination);osc.start(time);osc.stop(time+.38);
    }
   }
  }).catch(()=>{});
 }catch{}
}
