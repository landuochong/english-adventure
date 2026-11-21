// Coordinates are shared by movement, lighting and the browser renderer.
export const maze = [
 '###################',
 '#S..a.T....#......#',
 '###.#.....##.####.#',
 '#...#.....#..#P...#',
 '#.###.##########G##',
 '#...#...H#......V.#',
 '#.#.#####.###.###.#',
 '#.#.....#...#...#.#',
 '#.#####.###...#.#.#',
 '#.......b.R.D..c..#',
 '###################'
];
const keyMaze = [
 '###################',
 '#S..+....*#########',
 '####.##############',
 '#....#######.N#####',
 '#.##..######.######',
 '#.##..M...R...WG.K#',
 '#.##..##.##########',
 '#.######J##########',
 '#r.B####H##########',
 '###################'
];
export const dialOrder=['sun','drop','leaf'];
export const dialMarks={sun:'☀',drop:'💧',leaf:'🍃'};
export const layoutFor = run => run?.mission === 'key' ? keyMaze : maze;
const keyActions = {M:'推门', B:'拉动 ◇ 拉杆', r:'拉动 △ 拉杆', K:'拿起钥匙'};
const words = {
 a: ['Triangle', 'The triangle marks a pressure plate. Look for another passage.', '三角形标记了压力踏板。找找有没有另一条通道。'],
 b: ['Diamond', 'The diamond marks loose stone. A hammer can break it.', '菱形标记了松动的岩石。锤子能把它敲开。'],
 c: ['Spiral', 'The spiral marks a powered gate. Turn the valve to cut the power.', '螺旋标记了通电的门。转动阀门切断电源。']
};
export const briefing = ['Find the amber prism and bring it back to the stairs. Look closely at the marks on the walls.', '找到琥珀棱镜，带回入口的楼梯。留意墙上的图案。'];
const start = [1, 1];
export const trailKey=(x,y)=>x+','+y;
export const tileAt = (x, y, run) => layoutFor(run)[y]?.[x] ?? '#';
export function newRun(mission) {
 return {...(mission==='key'?{mission,brush:false,brushEquipped:false,crackVisible:false,coachNotes:[],hammerEquipped:false,dialStep:0,starAwake:false,leversReady:false,askedAboutSymbol:false,doorOpen:false,key:false}:{}),phase:'brief', x:start[0], y:start[1], hammer:false, cleared:false, powered:true, prism:false, clues:[], seen:[], announced:[], audioVersion:1, trail:[trailKey(...start)], surveyed:[], resets:0};
}
export function restoreRun(raw, mission=raw?.mission) {
 const run = newRun(mission);
 const layout=layoutFor(run);
 // An older save may be standing on the tile that now contains the dangerous plate.
 if(raw&&raw.y===9&&raw.x===12&&!Array.isArray(raw.seen))raw={...raw,x:11};
 if (!raw || !['search','return','complete','failed'].includes(raw.phase) || !Number.isInteger(raw.x) || !Number.isInteger(raw.y)
     || tileAt(raw.x, raw.y,run)==='#' || (mission!=='key'&&(tileAt(raw.x,raw.y,run)==='D')!==(raw.phase==='failed'))) return run;
 for (const key of ['hammer','cleared','powered','prism']) if (typeof raw[key] !== 'boolean') return run;
 if(mission==='key'){
  if(raw.mission!=='key'||!['search','return','failed','complete'].includes(raw.phase)||typeof raw.doorOpen!=='boolean'||
     (raw.phase==='failed'&&raw.doorOpen)||(typeof raw.key!=='boolean'||(raw.phase==='failed'&&raw.key)||(['return','complete'].includes(raw.phase)&&!raw.key))||(!raw.doorOpen&&(raw.key||raw.x>=6&&raw.y===5)))return run;
 }else if ((raw.phase!=='failed'&&(raw.phase !== 'search') !== raw.prism) || (raw.prism && (raw.powered || !raw.cleared)) || (raw.cleared && !raw.hammer)
     || (tileAt(raw.x, raw.y,run)==='R' && !raw.cleared) || (tileAt(raw.x, raw.y,run)==='G' && raw.powered)) return run;
 const coordinates=(data,allowWalls)=>Array.isArray(data)?data.filter(key=>{
  if(typeof key!=='string'||!/^\d{1,2},\d{1,2}$/.test(key))return false;
  const [x,y]=key.split(',').map(Number);
  return key===trailKey(x,y)&&layout[y]?.[x]!==undefined&&(allowWalls||tileAt(x,y,run)!=='#');
 }):[];
 const trail=[...new Set([...run.trail,...coordinates(raw.trail,false),trailKey(raw.x,raw.y)])];
 const surveyed=new Set(coordinates(raw.surveyed,true));
 if(!Array.isArray(raw.surveyed)){
  // Recover side passages conservatively from positions saved before the survey existed.
  for(const key of trail){
   const [x,y]=key.split(',').map(Number);
   for(const cell of surveyTiles({...run,x,y}))surveyed.add(trailKey(cell.x,cell.y));
  }
 }
 return {...run, ...(mission==='key'?{brush:raw.brush===true,brushEquipped:raw.brush===true&&raw.brushEquipped===true&&!(raw.hammer&&raw.hammerEquipped),crackVisible:raw.crackVisible===true,
  coachNotes:Array.isArray(raw.coachNotes)?raw.coachNotes.filter(note=>['rocks','crack','hammer'].includes(note)):[],hammerEquipped:raw.hammer&&raw.hammerEquipped===true,dialStep:raw.key?3:raw.cleared&&Array.isArray(raw.clues)&&raw.clues.includes('keeper-order')&&Number.isInteger(raw.dialStep)&&raw.dialStep>=0&&raw.dialStep<=3?raw.dialStep:0,starAwake:raw.doorOpen||raw.starAwake===true,leversReady:raw.doorOpen||(raw.starAwake===true&&raw.leversReady===true),askedAboutSymbol:raw.askedAboutSymbol===true,doorOpen:raw.doorOpen,key:raw.key}:{}), phase:raw.phase, x:raw.x, y:raw.y, hammer:raw.hammer, cleared:raw.cleared, powered:raw.powered, prism:raw.prism,
  clues:Array.isArray(raw.clues)?[...new Set(raw.clues.filter(key=>(mission==='key'?['moon-route','star-awake','levers-ready','lever-rule','keeper-order'].includes(key):Object.hasOwn(words,key))))]:[],
  seen:Array.isArray(raw.seen)?[...new Set(raw.seen.filter(id=>typeof id==='string'&&'abcHTRVGPD'.includes(id)&&id.length===1))]:[],
  announced:raw.audioVersion===1&&Array.isArray(raw.announced)?[...new Set(raw.announced.filter(id=>typeof id==='string'&&'abcHTRVGPD'.includes(id)&&id.length===1))]:[],
  trail,surveyed:[...surveyed],
  resets:Number.isSafeInteger(raw.resets)&&raw.resets>=0?raw.resets:0};
}
const blocks = (run, tile) => tile==='#' || (tile==='M'&&!run.doorOpen) || (tile==='R'&&!run.cleared) || (tile==='G'&&(run.mission==='key'?run.dialStep!==3:run.powered));
export function visible(run, x, y) {
 const dx=x-run.x, dy=y-run.y;
 if (Math.hypot(dx,dy)>3.5) return false;
 // Trace the beam through tile centres. Two touching walls also block a diagonal.
 const count=Math.max(Math.abs(dx),Math.abs(dy))*4;
 let px=run.x, py=run.y;
 for(let i=1;i<=count;i++){
  const tx=Math.round(run.x+dx*i/count), ty=Math.round(run.y+dy*i/count);
  if(tx!==px&&ty!==py&&blocks(run,tileAt(px,ty,run))&&blocks(run,tileAt(tx,py,run)))return false;
  if(tx===x&&ty===y)return true;
  if(blocks(run,tileAt(tx,ty,run)))return false;
  px=tx;py=ty;
 }
 return true;
}
export function move(run, dx, dy) {
 if (!['search','return'].includes(run.phase) || !Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx)+Math.abs(dy)!==1) return null;
 const x=run.x+dx, y=run.y+dy, tile=tileAt(x,y,run);
 if(blocks(run,tile)) return tile==='M'?'门锁着。':tile==='R'?'石障挡住了路。':tile==='G'?(run.mission==='key'?'通道门被轮盘锁住了。':'门还通着电。'):'';
 const visited=trailKey(x,y);
 if(!run.trail.includes(visited))run.trail=[...run.trail,visited];
 if(tile==='D'){run.x=x;run.y=y;run.phase='failed';return '踩中危险踏板，本轮结束。';}
 if(tile==='T'){
  run.x=start[0];run.y=start[1];run.resets++;
  return '踏板触发了机关。你回到了楼梯，已找到的物品和线索还在。';
 }
 run.x=x;run.y=y;
 if(tile==='S'&&run.mission==='key'&&run.phase==='return'){
  run.phase='complete';return '你带着钥匙回到了出发点。';
 }
 return '';
}
export function lanternTiles(run){
 const candidates=[];
 for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
  if((!dx&&!dy)||tileAt(run.x+dx,run.y+dy,run)==='#'||!visible(run,run.x+dx,run.y+dy))continue;
  candidates.push({x:run.x+dx,y:run.y+dy,distance:Math.hypot(dx,dy)});
 }
 return [{x:run.x,y:run.y},...candidates.sort((a,b)=>a.distance-b.distance).slice(0,6)];
}
export function surveyTiles(run){
 const tiles=lanternTiles(run);
 const edges=new Set();
 for(const {x,y} of [...tiles])for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const tx=x+dx,ty=y+dy,key=trailKey(tx,ty);
  if(!edges.has(key)&&layoutFor(run)[ty]?.[tx]==='#'&&visible(run,tx,ty)){
   tiles.push({x:tx,y:ty});edges.add(key);
  }
 }
 return tiles;
}
export function rememberSurvey(run){
 const remembered=new Set(run.surveyed);
 for(const {x,y} of surveyTiles(run))remembered.add(trailKey(x,y));
 run.surveyed=[...remembered];
}
export function encounterTiles(run){
 return lanternTiles(run)
  .filter(({x,y})=>Math.abs(x-run.x)+Math.abs(y-run.y)<=1)
  .map(({x,y})=>tileAt(x,y,run))
  .filter(id=>'abcHTRVGPD'.includes(id)&&(!run.hammer||id!=='H')&&(!run.prism||id!=='P'));
}
export function nearby(run) {
 const actions=[];
 for(const [dx,dy] of [[0,0],[0,-1],[1,0],[0,1],[-1,0]]){
  const x=run.x+dx,y=run.y+dy,key=tileAt(x,y,run);
  if(!visible(run,x,y))continue;
  const label=words[key]?.[0];
  if(keyActions[key]&&(!run.doorOpen||!['B','r','M'].includes(key))&&(key!=='K'||!run.key&&run.doorOpen&&run.cleared&&run.dialStep===3))actions.push({id:key,label:keyActions[key]});
  else if(key==='W'&&run.dialStep<3){
   for(const mark of ['leaf','sun','drop'])actions.push({id:mark,label:'点亮 '+dialMarks[mark]});
  }
  else if(label)actions.push({id:key,label:'查看'+({a:'三角形',b:'菱形',c:'螺旋'})[key]+'刻纹'});
  else if(key==='J'&&!run.brush)actions.push({id:key,label:'拿起刷子'});
  else if(key==='H'&&!run.hammer)actions.push({id:key,label:'拿起锤子'});
  else if(key==='R'&&!run.cleared)actions.push({id:key,label:run.brushEquipped?'刷去石粉':run.hammer&&(run.mission!=='key'||run.hammerEquipped)?'用锤子破开石障':'查看石障'});
  else if(key==='V'&&run.powered)actions.push({id:key,label:'转动阀门'});
  else if(key==='P'&&!run.prism&&run.cleared&&!run.powered)actions.push({id:key,label:'拿起琥珀棱镜'});
  else if(key==='S'&&run.prism)actions.push({id:key,label:'从楼梯带出棱镜'});
 }
 return actions;
}
export function interact(run,id) {
 if (!['search','return'].includes(run.phase)||!nearby(run).some(action=>action.id===id))return null;
 if(Object.hasOwn(dialMarks,id)){
  if(!run.clues.includes('keeper-order'))return '轮盘未启动。找值守人问问点亮顺序。';
  if(id!==dialOrder[run.dialStep]){run.dialStep=0;return '顺序不对，轮盘熄灭了。可以重听值守人的线索，再试一次。';}
  run.dialStep++;
  return run.dialStep===3?'三盏灯亮起，通道门打开了。':'轮盘亮起了第 '+run.dialStep+' 盏灯。';
 }
 if(words[id]){
  if(!run.clues.includes(id))run.clues.push(id);
  return words[id][2];
 }
 if((id==='r'||id==='B')&&!run.leversReady){
  return run.starAwake?'拉杆锁着。向月亮门请求启动机关。':'拉杆锁着。先去和走廊里的星纹交谈。';
 }
 if((id==='r'||id==='B')&&!run.clues.includes('lever-rule'))return '拉杆还锁着。向机关询问拉杆上的图案。';
 switch(id){
 case 'M':return '门纹丝不动。';
 case 'r':run.phase='failed';return '机关落锁，月亮门封闭了。';
 case 'B':run.doorOpen=true;return '门闩滑开了。';
 case 'K':run.key=true;return '钥匙已放进背包。告诉教练你的发现。';
 case 'J':run.brush=true;return '刷子已收入工具箱。';
 case 'H':run.hammer=true;return run.mission==='key'?'锤子已收入工具箱。':'锤子已放进背包。';
 case 'R':
  if(run.mission==='key'&&run.brushEquipped){
   run.crackVisible=true;return '灰尘被扫开，石面露出一道裂缝。';
  }
  if(run.mission==='key'&&!run.hammerEquipped)return run.crackVisible?'裂缝露出来了。可以打开工具箱，或向教练描述你的发现。':'石面盖着灰白色的粉尘。你可以看看工具箱。';
  if(!run.hammer)return '石块上有裂缝。附近也许有能敲开它的工具。';
  run.cleared=true;return '石障碎开了，通道打开。';
 case 'V':run.powered=false;return '阀门关闭了。通电门已经可以穿过。';
 case 'P':run.prism=true;run.phase='return';return '已找到琥珀棱镜。沿走过的路回楼梯。';
 case 'S':run.phase='complete';return '棱镜已带回地面。';
 }
 return null;
}
export const clueText=id=>words[id]?.slice(1);

// Route through lit or already walked floor. Deliberate movement still uses move().
export function routeTo(run, target){
 const allowed=new Set([...run.trail,...run.surveyed,...lanternTiles(run).map(({x,y})=>trailKey(x,y))]);
 const goal=trailKey(target.x,target.y);
 if(!allowed.has(goal))return [];
 const open=[{x:run.x,y:run.y,path:[]}];
 const seen=new Set([trailKey(run.x,run.y)]);
 for(const {x,y,path} of open){
  if(trailKey(x,y)===goal)return path;
  for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
   const nx=x+dx,ny=y+dy,key=trailKey(nx,ny),tile=tileAt(nx,ny,run);
   if(!allowed.has(key)||seen.has(key)||blocks(run,tile)||tile==='T'||tile==='D')continue;
   seen.add(key);
   open.push({x:nx,y:ny,path:[...path,[dx,dy]]});
  }
 }
 return [];
}

// The rendered position is continuous. Entering a new cell applies the maze rules once.
export function advancePosition(run, position, dx, dy){
 let message='';
 for(const [axis,offset] of [['x',dx],['y',dy]]){
  if(!offset)continue;
  const ahead=Math.sign(offset);
  const boundary=tileAt(run.x+(axis==='x'?ahead:0),run.y+(axis==='y'?ahead:0),run);
  const wall=boundary==='#';
  const proposed=position[axis]+offset;
  const next=wall?run[axis]+ahead*Math.min((proposed-run[axis])*ahead,.41):proposed;
  const cell=Math.floor(next+.5);
  if(cell===run[axis]){
   position[axis]=next;
   continue;
  }
  const resets=run.resets,delta=cell-run[axis];
  const result=move(run,axis==='x'?delta:0,axis==='y'?delta:0);
  if(result)message=result;
  if(run.phase==='failed'||run.resets!==resets){
   position.x=run.x;position.y=run.y;
   break;
  }
  if(run[axis]===cell)position[axis]=next;
  else position[axis]=run[axis]+Math.sign(delta)*.41;
 }
 return message;
}
