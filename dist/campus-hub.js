import {advancedStories} from './campus-level-two.js';
import {oldEntryURL} from './legacy-entry.js';
import {levels,readProgress} from './campus-level-catalog.js?v=difficulty-1';
// Old shared course preview links retain their original player and IndexedDB data.
if(new URLSearchParams(location.search).has('play'))location.replace(oldEntryURL(location.pathname,location.search));
const query=new URLSearchParams(location.search);let difficulty=query.get('difficulty')==='2'?2:1,selected;
let progress;try{progress=readProgress(localStorage,difficulty);}catch{progress={completed:[]};document.querySelector('#storage-note').textContent='浏览器未允许保存记录，本次仍可正常挑战。';}
const $=id=>document.getElementById(id),nodes=new Map();
const symbols={u1:'▤',u2:'♫',u3:'▧',wish:'❧',workshop:'⚒',welcome:'✧',science:'✦',school:'▤',restaurant:'☕',shopping:'◇',directions:'➜',weather:'☀',hobbies:'◉',picnic:'☕'};
function select(id){selected=id;const level=levels.find(l=>l.id===id);if(!level)return;const completed=progress.completed.includes(id);for(const [key,b] of nodes)b.setAttribute('aria-pressed',String(key===id));$('level-area').textContent=level.area;$('level-number').textContent='第 '+(levels.indexOf(level)+1)+' 关';$('level-symbol').textContent=symbols[id];$('level-state').textContent=completed?'★★★ 已完成':'新的委托';$('level-title').textContent=difficulty===2?advancedStories[id].title:level.title;$('level-hook').textContent=difficulty===2?advancedStories[id].brief.zh:level.hook;$('level-theme').textContent=level.theme;$('level-time-label').textContent=difficulty===2?'进阶挑战':'冒险时长';$('level-time').textContent=difficulty===2?'新增 '+advancedStories[id].steps.length+' 次任务交流':level.minutes;$('start-level').href='./campus-environment.html?mission='+id+(difficulty===2?'&difficulty=2':'');$('start-level').replaceChildren(document.createTextNode(completed?'再次挑战':'进入关卡'));const icon=document.createElement('span');icon.textContent='▶';icon.setAttribute('aria-hidden','true');$('start-level').append(icon);}
for(const [i,level] of levels.entries()){const b=document.createElement('button');b.type='button';b.className='level-node'+(progress.completed.includes(level.id)?' done':'');b.style.left=level.x+'%';b.style.top=level.y+'%';b.setAttribute('aria-label','第 '+(i+1)+' 关 '+level.title+(progress.completed.includes(level.id)?'，已完成':''));b.setAttribute('aria-pressed','false');const pin=document.createElement('span');pin.className='pin';pin.textContent=progress.completed.includes(level.id)?'✓':i+1;const label=document.createElement('span');label.className='node-title';label.textContent=level.title;b.append(pin,label);b.onclick=()=>select(level.id);$('level-nodes').append(b);nodes.set(level.id,b);}
$('completed-count').textContent=progress.completed.length+' / '+levels.length;
const requested=new URLSearchParams(location.search).get('level');select(levels.some(l=>l.id===requested)?requested:levels.find(l=>!progress.completed.includes(l.id))?.id||levels[0].id);
const ns='http://www.w3.org/2000/svg';for(const [x,y,r] of [[83,170,24],[285,160,28],[295,220,18],[88,470,25],[126,520,32],[290,580,22],[328,480,20],[880,560,27],[910,480,23],[600,100,22],[590,205,17],[660,650,27],[750,650,30],[300,380,21],[98,370,17]]){const g=document.createElementNS(ns,'g');g.setAttribute('transform',`translate(${x} ${y})`);for(const [cx,cy,rr,fill] of [[4,8,r,'#6c967a'],[0,0,r,'#80aa85'],[-7,-7,r*.65,'#98ba8f']]){const c=document.createElementNS(ns,'circle');for(const [k,v] of Object.entries({cx,cy,r:rr,fill}))c.setAttribute(k,v);g.append(c);}$('map-trees').append(g);}

$('difficulty').value=String(difficulty);
$('difficulty').onchange=()=>{
 difficulty=Number($('difficulty').value);progress=readProgress(localStorage,difficulty);
 for(const [id,node] of nodes){
  const done=progress.completed.includes(id),number=levels.findIndex(l=>l.id===id)+1;
  node.classList.toggle('done',done);node.querySelector('.pin').textContent=done?'✓':number;
  node.setAttribute('aria-label','第 '+number+' 关 '+levels[number-1].title+(done?'，已完成':''));
 }
 $('completed-count').textContent=progress.completed.length+' / '+levels.length;select(selected);
};
