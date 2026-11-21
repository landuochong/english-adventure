import {dialOrder,dialMarks,tileAt, layoutFor, surveyTiles, trailKey} from './underground-maze.js';

const glyphs={M:['☾','#57aaff'],'*':['★','#ffe59b'],a:['△','#ffd192'],b:['◇','#9be0c6'],c:['◎','#c4b9fb']};
const stone={top:'#46515a',front:'#27313b',side:'#323e47'};

export function createMazeView(canvas){
 const ctx=canvas.getContext('2d');
 const hits=[];
 let lastRun,lastPosition;
 // Each row is a direction. Column zero is idle, followed by eight frames of the campus gait.
 const student=new Image(),jalor=new Image();
 student.onload=jalor.onload=()=>{if(lastRun)draw(lastRun,lastPosition);};
 student.src='assets/maze-characters/student-walk.png';
 jalor.src='assets/maze-characters/jalor-walk.png';
 let facing=0,walkDistance=0,walking=false;
 function setMotion(dx,dy){
  const distance=Math.hypot(dx,dy);
  walking=distance>.0001;
  if(!walking){walkDistance=0;return;}
  facing=Math.abs(dx)>Math.abs(dy)?dx>0?1:3:dy>0?0:2;
  walkDistance+=distance;
 }
 function sprite(image,x,y,size,phase=0){
  const column=walking?1+((Math.floor(walkDistance*5.5)+phase)%8):0;
  ctx.drawImage(image,column*96,facing*96,96,96,x,y,size,size);
 }
 let scale=1;
 let origin=[0,0];
 const point=(x,y,z=0)=>[origin[0]+(x*78+y*31)*scale,origin[1]+(y*48-z)*scale];
 function poly(points,fill,edge='#121a20'){
  ctx.beginPath();ctx.moveTo(...points[0]);
  for(const p of points.slice(1))ctx.lineTo(...p);
  ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  if(edge){ctx.strokeStyle=edge;ctx.stroke();}
 }
 function box(x,y,w,d,h,palette,base=0){
  const a=point(x,y,base+h),b=point(x+w,y,base+h),c=point(x+w,y+d,base+h),e=point(x,y+d,base+h);
  const front=[e,c,point(x+w,y+d,base),point(x,y+d,base)];
  const side=[a,e,point(x,y+d,base),point(x,y,base)];
  const top=[a,b,c,e];
  poly(side,palette.side);poly(front,palette.front);poly(top,palette.top);
  return [side,front,top];
 }
 function plate(x,y,mark,run){
  const palette={top:'#665549',front:'#44362f',side:'#3c3032'};
  const northWall=tileAt(x,y-1,run)==='#';
  const wallY=northWall?y-.49:y+.39;
  const height=northWall?23:33;
  const faces=box(x-.31,wallY,.62,.11,height,palette);
  const [sx,sy]=point(x,wallY+.12,height-11);
  ctx.font='bold '+Math.round(18*scale)+'px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=glyphs[mark][1];ctx.fillText(glyphs[mark][0],sx,sy);
  return faces;
 }
 function prop(x,y,tile,run){
  if(tile==='N'){
   const base=box(x-.16,y-.12,.32,.24,25,{top:'#587f95',front:'#37596b',side:'#294958'});
   const head=box(x-.10,y-.09,.20,.18,13,{top:'#705441',front:'#deb38a',side:'#c19573'},25);
   const [sx,sy]=point(x,y,47);ctx.font='bold '+Math.round(12*scale)+'px sans-serif';ctx.fillStyle='#fff1b1';ctx.textAlign='center';ctx.fillText('Robin',sx,sy);
   return [...base,...head];
  }
  if(tile==='W'){
   const base=box(x-.38,y-.31,.76,.62,14,stone);
   const [sx,sy]=point(x,y,18);
   ctx.beginPath();ctx.ellipse(sx,sy,30*scale,15*scale,0,0,Math.PI*2);ctx.fillStyle='#302c36';ctx.fill();ctx.strokeStyle='#c7a65f';ctx.stroke();
   for(const [i,mark] of ['leaf','sun','drop'].entries()){
    const px=sx+(i-1)*18*scale;
    if(dialOrder.indexOf(mark)<run.dialStep){ctx.beginPath();ctx.arc(px,sy,9*scale,0,Math.PI*2);ctx.fillStyle='#ffe598';ctx.fill();}
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#daa847';ctx.font=Math.round(13*scale)+'px sans-serif';ctx.fillText(dialMarks[mark],px,sy);
   }
   return base;
  }
  if(tile==='M'){
   if(run.doorOpen)return box(x-.46,y-.45,.12,.75,37,stone);
   return [...box(x-.28,y-.40,.56,.76,36,{top:'#927154',front:'#705039',side:'#503c30'}),...plate(x,y,tile,run)];
  }
  if(glyphs[tile])return plate(x,y,tile,run);
  if(tile==='r'||tile==='B'){
   const color='#ccb187';
   return [...plate(x,y,tile==='B'?'b':'a',run),...box(x-.23,y-.19,.46,.38,5,stone),...box(x-.035,y-.04,.07,.09,21,stone),
    ...box(x-.15,y-.07,.30,.14,6,{top:color,front:color,side:color},18)];
  }
  if(tile==='K'&&!run.key){
   const base=box(x-.26,y-.24,.52,.48,11,stone);
   const [sx,sy]=point(x,y,19);
   ctx.font='bold '+Math.round(25*scale)+'px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffdb79';ctx.fillText('⚿',sx,sy);
   return base;
  }
  if(tile==='S')return Array.from({length:4},(_,i)=>box(x-.33,y-.36+i*.17,.66,.18,3+i*4,stone)).flat();
  if(tile==='T'||tile==='D'){
   const faces=box(x-.34,y-.32,.68,.64,4,{top:'#904d46',front:'#4f292b',side:'#643a38'});
   for(let i=-2;i<=2;i++)poly([point(x+i*.12-.025,y-.25,5),point(x+i*.12+.025,y-.25,5),point(x+i*.12+.025,y+.25,5),point(x+i*.12-.025,y+.25,5)],'#ca8b65',null);
   if(tile==='D'){const [sx,sy]=point(x,y,7);ctx.font='bold '+(19*scale)+'px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff0c9';ctx.fillText('!',sx,sy);}
   return faces;
  }
  if(tile==='R'&&!run.cleared){
   const faces=[
   ...box(x-.37,y-.28,.48,.58,22,stone),...box(x+.06,y-.13,.27,.42,15,stone),...box(x-.13,y-.17,.33,.36,17,stone,19)
  ];
   if(run.mission==='key'){
    const marks=run.crackVisible?[[0,-.06,37],[-.04,.02,37],[.03,.08,37],[-.02,.17,37]]:[[-.09,0,37],[0,.01,37],[.08,.03,37]];
    ctx.beginPath();marks.forEach(([dx,dy,z],i)=>ctx[i?'lineTo':'moveTo'](...point(x+dx,y+dy,z)));
    ctx.strokeStyle=run.crackVisible?'#171b1c':'#c7bb9f';ctx.lineWidth=(run.crackVisible?2:5)*scale;ctx.stroke();ctx.lineWidth=1;
   }
   return faces;
  }
  if(tile==='J'&&!run.brush)return [
   ...box(x-.05,y-.26,.10,.45,5,{top:'#b88960',front:'#95674b',side:'#75543c'}),
   ...box(x-.16,y+.10,.32,.22,7,{top:'#e6cfa0',front:'#c1a16f',side:'#947d58'})
  ];
  if(tile==='G'){
   const frames=[...box(x-.42,y-.18,.12,.26,49,stone),...box(x+.29,y-.18,.12,.26,49,stone)];
   const gate={top:'#d68c6a',front:'#a45845',side:'#6e3934'};
   return (run.mission==='key'?run.dialStep<3:run.powered)?[...frames,...[-.24,0,.24].flatMap(dx=>box(x+dx-.026,y-.11,.052,.11,45,gate))]:frames;
  }
  if(tile==='V'){
   const stand=box(x-.13,y-.13,.26,.25,17,stone);
   const [vx,vy]=point(x,y,22);
   ctx.strokeStyle=run.powered?'#e88768':'#90c6ae';ctx.lineWidth=3*scale;
   ctx.beginPath();ctx.arc(vx,vy,10*scale,0,Math.PI*2);ctx.moveTo(vx-9*scale,vy);ctx.lineTo(vx+9*scale,vy);ctx.moveTo(vx,vy-9*scale);ctx.lineTo(vx,vy+9*scale);ctx.stroke();
   ctx.lineWidth=1;
   return stand;
  }
  if(tile==='H'&&!run.hammer)return [
   ...box(x-.06,y-.30,.12,.60,5,{top:'#cf9b68',front:'#885735',side:'#65422c'}),...box(x-.28,y-.32,.56,.19,11,stone)
  ];
  if(tile==='P'&&!run.prism){
   const plinth=box(x-.22,y-.22,.44,.44,12,stone);
   const top=point(x,y,43),left=point(x-.18,y,26),right=point(x+.18,y,26),bottom=point(x,y,13);
   const gem=[top,right,bottom,left];
   poly(gem,'#f3b65b','#ffe4a0');poly([top,left,bottom,point(x,y,25)],'#ffe29c',null);
   return [...plinth,gem];
  }
  return [];
 }
 function player(x,y,run){
  const [sx,sy]=point(x,y);
  if(student.naturalWidth)sprite(student,sx-32*scale,sy-57*scale,64*scale);
  else box(x-.13,y-.12,.26,.24,24,{top:'#e3b978',front:'#9a6a48',side:'#704d39'});
  if(run.mission!=='key'&&jalor.naturalWidth){
   const [dx,dy]=point(x-.34,y+.16);
   sprite(jalor,dx-20*scale,dy-33*scale,40*scale,2);
  }
  const [lx,ly]=point(x+.21,y+.04,12);
  const light=ctx.createRadialGradient(lx,ly,0,lx,ly,43*scale);
  light.addColorStop(0,'#ffca6bb0');light.addColorStop(1,'#ffbe6200');
  ctx.fillStyle=light;ctx.fillRect(lx-43*scale,ly-43*scale,86*scale,86*scale);
  ctx.fillStyle='#ffedbc';ctx.fillRect(lx-4*scale,ly-5*scale,8*scale,10*scale);
 }
 function groundFace(x,y){
  return [point(x-.5,y-.5),point(x+.5,y-.5),point(x+.5,y+.5),point(x-.5,y+.5)];
 }
 function wallBand(from,to,y,height){
  const a=point(from-.5,y-.5,height),b=point(to+.5,y-.5,height);
  const c=point(to+.5,y+.5,height),d=point(from-.5,y+.5,height);
  poly([a,d,point(from-.5,y+.5),point(from-.5,y-.5)],'#253b43',null);
  poly([d,c,point(to+.5,y+.5),point(from-.5,y+.5)],height>20?'#21343d':'#293f45',null);
  poly([a,b,c,d],'#3d555b',null);
  ctx.strokeStyle='#587076';
  ctx.beginPath();ctx.moveTo(...d);ctx.lineTo(...c);ctx.stroke();
 }
 function draw(run,position=run){
  lastRun=run;lastPosition=position;
  hits.length=0;
  scale=Math.min(canvas.width/704,canvas.height/512);
  origin=[canvas.width*.5-(position.x*78+position.y*31)*scale,canvas.height*.53-position.y*48*scale];
  ctx.fillStyle='#0a1017';ctx.fillRect(0,0,canvas.width,canvas.height);
  const lit=new Set(surveyTiles(run).map(({x,y})=>trailKey(x,y)));
  const surveyed=new Set([...run.surveyed,...lit]);
  const walked=new Set(run.trail);
  const maze=layoutFor(run);
  for(let y=0;y<maze.length;y++){
   const cells=[];
   for(let x=0;x<maze[y].length;x++){
    const key=trailKey(x,y),tile=tileAt(x,y,run);
    if(!surveyed.has(key)&&!walked.has(key))continue;
    if(tile==='#'){
     const height=y>run.y&&Math.hypot(x-run.x,y-run.y)<2.3?11:37;
     cells.push({x,tile,height});
    }else{
     const face=groundFace(x,y);
     poly(face,walked.has(key)?'#607b6b':lit.has(key)?'#40565a':'#35484a',null);
     hits.push({face,x,y});
     cells.push({x,tile});
    }
   }
   // Adjacent wall sections share one surface, so the corridor doesn't show a tile grid.
   for(let i=0;i<cells.length;i++){
    const {x,tile,height}=cells[i];
    if(tile==='#'){
     let end=x;
     while(cells[i+1]?.height===height&&cells[i+1]?.x===end+1){i++;end++;}
     wallBand(x,end,y,height);
    }else{
     ctx.globalAlpha=walked.has(trailKey(x,y))?1:.68;
     for(const face of prop(x,y,tile,run))hits.push({face,x,y});
     if(tile==='W'){
      const [cx,cy]=point(x,y,18);
      for(const [index,mark] of ['leaf','sun','drop'].entries()){
       const px=cx+(index-1)*18*scale,r=9*scale;
       hits.push({x,y,mark,face:[[px-r,cy-r],[px+r,cy-r],[px+r,cy+r],[px-r,cy+r]]});
      }
     }
     ctx.globalAlpha=1;
     if(x===run.x&&y===run.y)player(position.x,position.y,run);
    }
   }
  }
 }
 function pick(x,y){
  for(let i=hits.length-1;i>=0;i--){
   const hit=hits[i],face=hit.face;
   let inside=false;
   for(let a=0,b=face.length-1;a<face.length;b=a++){
    const [ax,ay]=face[a],[bx,by]=face[b];
    if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
   }
   if(inside)return {x:hit.x,y:hit.y,mark:hit.mark};
  }
  return null;
 }
 return {draw,pick,setMotion};
}
