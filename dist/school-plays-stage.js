// The stage shows readable objects. Dialogue and controls remain accessible HTML.
const student = new Image();
student.src = './assets/maze-characters/student.png';
export function drawStage(canvas,id,state,node){
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const W=720,H=350;
  canvas.width=W;canvas.height=H;
  const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const circle=(x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
  const label=(text,x,y,size,color='#f7edd7')=>{
    ctx.fillStyle=color;ctx.textAlign='center';ctx.font='600 '+size+'px system-ui';ctx.fillText(text,x,y);
  };
  if(id==='welcome'){
    rect(0,0,W,H,'#bddac4');
    rect(0,183,W,28,'#eee1c3');rect(334,0,38,H,'#eee1c3');
    const locations=[
      ['library',45,42,'Library','#657e97'],['cafe',452,48,'Cafe','#b76849'],
      ['sports',455,232,'Sports area','#527f66'],['science',45,226,'Science centre','#637a69']
    ];
    for(const [key,x,y,name,color] of locations){
      const visited=state.visited.includes(key);
      rect(x+7,y+8,193,82,'#98b49e');rect(x,y,193,82,'#eee2c2');
      rect(x-5,y-5,203,17,color);
      for(let i=0;i<5;i++)rect(x+11+i*35,y+20,28,18,'#83a8ac');
      label(name,x+96,y+68,18,'#324e48');
      if(visited)circle(x+184,y+4,9,'#e5ae46');
    }
    for(const x of [22,278,403,687]){
      rect(x-3,157,6,24,'#947457');circle(x,150,15,'#6b9c7c');circle(x-4,145,10,'#93b68b');
    }
  }else{
    rect(0,0,W,H,'#e5d9bd');rect(0,253,W,97,'#ba956f');
    for(let x=0;x<W;x+=80)rect(x,253,2,97,'#aa8562');
    for(let y=270;y<H;y+=26)rect(0,y,W,2,'#aa8562');
    rect(38,32,92,146,'#9d8265');rect(44,38,80,132,'#badae3');
    rect(80,38,5,134,'#fcf0d8');rect(44,98,80,5,'#fcf0d8');
    rect(168,25,516,174,'#977752');rect(175,32,502,160,'#345c52');
    if(id==='pen'){
      const fixed=['fixed','late','lateWho','done'].includes(state.stage);
      const reading=['start','take','showBook'].includes(state.stage);
      if(reading){
        rect(244,58,180,110,'#f6e9c4');rect(425,58,180,110,'#fff1cf');
        rect(544,58,15,40,'#497fa3');
        label('学而不思则罔',330,119,19,'#574b3b');label('Confucius',513,121,24,'#574b3b');
      }else{
        label('Learning without thinking',425,89,27);label('is of no use.',425,127,27);
        label('— '+(fixed?'Confucius':'Mencius'),519,167,21);
      }
    }else{
      rect(260,52,133,115,'#f4e4c6');rect(449,52,133,115,'#f4e4c6');
      circle(327,102,29,'#d3a549');circle(339,91,24,'#f4e4c6');
      ctx.fillStyle='#6c574d';ctx.beginPath();ctx.moveTo(489,102);ctx.lineTo(488,73);ctx.lineTo(511,89);ctx.lineTo(538,74);ctx.lineTo(538,104);ctx.fill();
      circle(514,108,25,'#6c574d');circle(505,106,2,'#f6e9c4');circle(521,106,2,'#f6e9c4');
      if(state.stage==='joke')label('Fine … ?',416,182,19);
    }
    rect(216,232,342,19,'#895d43');rect(232,251,13,59,'#765741');rect(527,251,13,59,'#765741');
  }
  const drawStudent=()=>{
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(student,id==='welcome'?320:106,id==='welcome'?132:195,76,106);
  };
  if(student.complete&&student.naturalWidth)drawStudent();
  else student.onload=drawStudent;
  canvas.setAttribute('aria-label',node.place+'场景');
}
