// Coordinates are in the illustrated theatre grounds, independent of the campus hub.
import {advance,currentScene,plays} from './school-plays.js';

const locations={
 science:[21,42],classroom:[54,30],door:[82,45],library:[18,72],cafe:[68,81],
 sports:[42,78],exhibit:[86,65],sign:[40,52],window:[71,49]
};
const places={'科学中心':'science','校园路牌':'sign','图书馆':'library','咖啡馆':'cafe','运动区':'sports','英语教室':'classroom','早读教室':'classroom','课桌旁':'classroom','教室门边':'door','教室门外':'door','画桌旁':'classroom','迎新展':'exhibit','午间采访窗':'window'};
const desks={board:[46,20],mei:[20,41],ben:[53,62],lin:[76,37],door:[13,83],exhibit:[84,82],window:[47,84]};
const classroomPlaces={
 pen:{start:'mei',board:'board',which:'board',mei:'mei',find:'mei',wrongDesk:'lin',borrow:'ben',take:'ben',source:'board',showBook:'board',fixed:'board',late:'door',lateWho:'door',exhibit:'exhibit',card:'exhibit',done:'exhibit'},
 fine:{start:'door',pan:'board',joke:'board',partner:'mei',moon:'board',cat:'mei',paired:'mei',labels:'ben',give:'ben',interview:'window',reporter:'window',done:'window'}
};
const starts={welcome:'science',pen:'classroom',fine:'door'};
const clues={welcome:'报到处',pen:'早读教室',fine:'教室门外'};
export function mapLocation(id,state){return classroomPlaces[id]?.[state.stage]||places[currentScene(id,state).place]||starts[id];}
export function mapDestinations(id,state){
 const from=mapLocation(id,state);
 return currentScene(id,state).actions.flatMap(action=>{
  // Preview a physical choice without writing to the student's real inventory or save.
  const preview=structuredClone(state);
  advance(id,preview,action.label,true);
  const to=mapLocation(id,preview);
  return to!==from?[{label:action.label,to}]:[];
 });
}

function drawGround(canvas){
 const c=canvas.getContext('2d');canvas.width=1400;canvas.height=800;
 c.scale(1.4,1.4);const h=800/1.4;
 function polygon(points,fill,stroke){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke();}
 }
 function path(points,color,width){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin=c.lineCap='round';c.stroke();
 }
 function oval(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 const sky=c.createLinearGradient(0,0,950,h);sky.addColorStop(0,'#cddcca');sky.addColorStop(1,'#9fbea0');c.fillStyle=sky;c.fillRect(0,0,1000,h);
 let seed=32;const random=()=>((seed=seed*16807%2147483647)/2147483647);
 for(let i=0;i<1600;i++){const x=random()*1000,y=random()*h;c.fillStyle=i%3?'#769c7029':'#f5e7b94a';c.fillRect(x,y,1+random()*4,1.6);}
 const stream=[[-40,450],[40,466],[123,524],[190,544],[315,560],[411,610]];
 path(stream,'#8aa998',40);path(stream,'#91b6b4',33);
 const lanes=[[[0,289],[200,270],[355,292],[537,266],[698,291],[825,289],[1010,258]],[[200,270],[210,355],[170,430]],[[355,292],[399,378],[425,466]],[[537,266],[548,174]],[[698,291],[683,427]],[[825,289],[866,392]]];
 for(const lane of lanes){path(lane,'#95a98d',18);path(lane,'#e6d8b9',15);path(lane,'#f1e6cd',7);}
 function tree(x,y,r){
  oval(x+5,y+2,r*.8,r*.29,'#42665b30');path([[x,y],[x,y-r]],'#735e49',2.8);
  oval(x,y-r*1.45,r*.70,r,'#567f69');oval(x-r*.22,y-r*1.7,r*.54,r*.76,'#83a17a');oval(x-r*.3,y-r*1.87,r*.34,r*.45,'#a3b686');
 }
 for(const [x,y,n] of [[14,153,14],[355,192,8],[725,136,12],[920,430,11],[40,366,8],[486,474,7],[243,508,6]]){
  for(let i=0;i<n;i++)tree(x+i*7,y+Math.sin(i*.8)*9,10+random()*8);
 }
 function building(x,y,w,d,height,roof,sign){
  c.save();c.translate(x,y);
  polygon([[-w*.52,1],[w*.5,1],[w*.5+d+14,-d*.54],[w*.42,-d*.76]],'#47695735');
  polygon([[-w/2,0],[w/2,0],[w/2,-height],[-w/2,-height]],'#f0ddba','#897d6c');
  polygon([[w/2,0],[w/2+d,-d*.6],[w/2+d,-d*.6-height],[w/2,-height]],'#c1aa88','#897d6c');
  for(let i=-w/2+10;i<w/2-10;i+=18){c.fillStyle='#67888a';c.fillRect(i,-height+8,10,14);c.fillStyle='#bdd5c9';c.fillRect(i+1,-height+9,4,5);}
  c.fillStyle='#697a69';c.fillRect(-8,-18,16,18);
  polygon([[-w/2-5,-height],[w/2+5,-height],[w/2+d+5,-height-d*.6],[w/2+d/2,-height-d*.45-13],[-w/2+d/2,-height-d*.45-13]],roof,'#696c5d');
  path([[-w/2,-height+1],[w/2+3,-height+1]],'#fff4d3',2);
  if(sign){c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#344f4e';c.fillText(sign,0,16);}
  c.restore();
 }
 building(202,208,110,24,43,'#527c73','报到处');
 building(541,138,162,33,49,'#ac7560','教学楼');
 building(807,213,95,27,40,'#b28166','教室门廊');
 building(168,377,115,29,45,'#65898a','图书馆');
 building(684,422,93,21,38,'#af8059','咖啡馆');
 building(863,356,77,20,27,'#788a72','迎新展');
 c.save();c.translate(417,413);c.transform(1,.04,-.33,.68,0,0);
 c.fillStyle='#ba8571';c.fillRect(-65,-27,130,54);c.strokeStyle='#f6e4c8';c.lineWidth=2;c.strokeRect(-60,-23,120,46);c.beginPath();c.arc(0,0,13,0,Math.PI*2);c.stroke();path([[0,-23],[0,23]],'#f6e4c8',2);c.restore();
 c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#344f4e';c.fillText('运动区',418,451);c.fillText('采访窗',715,269);
}
function drawClassroom(canvas,id){
 const c=canvas.getContext('2d');canvas.width=1400;canvas.height=800;c.scale(1.4,1.4);
 c.fillStyle='#d7c19d';c.fillRect(0,0,1000,572);
 for(let y=0;y<574;y+=22){c.fillStyle=y%44?'#e5d6b8':'#e9ddc6';c.fillRect(0,y,1000,21);}
 c.fillStyle='#b8c9b7';c.fillRect(0,0,1000,70);
 c.fillStyle='#596e60';c.fillRect(250,9,420,65);c.fillStyle='#2e5952';c.fillRect(255,13,410,55);
 c.font='italic 16px Georgia';c.textAlign='center';c.fillStyle='#f2e6bb';
 c.fillText(id==='pen'?'Learning without thinking is of no use.':"What's your name?",460,47);
 function desk(x,y,kind){
  c.fillStyle='#b39c7e';c.fillRect(x-55,y-2,121,50);c.fillStyle='#816a50';c.fillRect(x-58,y-10,116,46);
  c.fillStyle='#cfad80';c.fillRect(x-58,y-12,116,42);
  c.fillStyle='#f5e8c6';c.fillRect(x-23,y-9,45,31);
  if(kind==='book'){c.fillStyle='#567b9c';c.fillRect(x+4,y-9,5,35);c.fillStyle='#988971';c.fillRect(x-17,y-1,15,2);}
  if(kind==='card'){c.fillStyle='#e8bf61';c.fillRect(x-25,y-5,49,24);}
  if(kind==='moon'){c.fillStyle='#e2b65a';c.beginPath();c.arc(x,y+4,10,0,2*Math.PI);c.fill();c.fillStyle='#f5e8c6';c.beginPath();c.arc(x+4,y+1,9,0,2*Math.PI);c.fill();}
 }
 desk(204,185,id==='fine'?'moon':'book');desk(753,169,'card');desk(527,302,'book');
 desk(369,263,'');desk(704,317,'');
 c.fillStyle='#99866d';c.fillRect(0,397,1000,8);c.fillStyle='#ced5c5';c.fillRect(0,405,1000,170);
 c.fillStyle='#9da996';c.fillRect(0,553,1000,7);c.fillStyle='#775f4e';c.fillRect(81,381,83,49);c.fillStyle='#e8d8b4';c.fillRect(88,386,69,43);
 c.fillStyle='#749898';c.fillRect(390,422,145,36);c.fillStyle='#bbcec0';c.fillRect(396,427,62,25);c.fillRect(465,427,64,25);
 c.fillStyle='#92735c';c.fillRect(760,411,140,57);c.fillStyle='#eccd76';c.fillRect(768,418,52,36);c.fillRect(832,418,58,36);
 c.fillStyle='#514f41';c.font='bold 16px sans-serif';
 for(const [t,x,y] of [['梅的课桌',202,181],['本的课桌',525,298],['小林的课桌',754,165],['教室门口',125,455],['午间采访窗',466,478],['走廊迎新展',835,487]])c.fillText(t,x,y-16);
}
export function createTheatreMap(scale,markers){
 let background;
 return function render({id,state,journey,restore,open,go,resume}){
  const indoors=journey&&id!=='welcome';
  const nextBackground=indoors?id:'campus';
  if(nextBackground!==background){
    if(indoors)drawClassroom(scale,id);else drawGround(scale);
    background=nextBackground;
  }
  markers.replaceChildren();
  function pin(place,kicker,label,fn){
   const b=document.createElement('button');b.className='theatre-pin';b.type='button';
   const [x,y]=(indoors?desks:locations)[place];b.style.left=x+'%';b.style.top=y+'%';
   const k=document.createElement('small');k.textContent=kicker;const name=document.createElement('strong');name.textContent=label;
   b.append(k,name);b.setAttribute('aria-label',label);b.onclick=fn;markers.append(b);
  }
  if(!journey){
   for(const key of Object.keys(plays)){
    const progress=restore(key),status=progress.stage==='done'?'已完成':progress.stage==='start'?'': ' · 继续';
    pin(starts[key],(key==='welcome'?'序章':'Unit 1')+' · '+clues[key]+(status==='已完成'?' · ✓':status),plays[key].title,()=>open(key));
   }
  }else{
   const node=currentScene(id,state);
   pin(mapLocation(id,state),node.place,'回到'+node.who+'身边',resume);
   for(const dest of mapDestinations(id,state))pin(dest.to,'可前往',dest.label,()=>go(dest.label));
  }
 };
}
