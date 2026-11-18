import {finishLevel} from './campus-level-catalog.js';
import {createMission} from './campus-missions.js?v=invite-finish-1';
// Replay accepted interactions so hidden dialogue slots and visible state resume together.
export function createMissionSession(id,storage,notify=()=>{},fresh=false){
 const key='campus-session-v1-'+id;
 let controller=createMission(id),events=[],restored=false,writable=true,briefing=null;
 const clues=[];
 let original=controller.act;
 function clearCompletedSession(){
  if(id==='hobbies'&&!finishLevel(storage,id))throw Error('Could not save invitation completion');
  storage.removeItem(key);
 }
 function apply(npc,type,text,pos,clearLine){
  const step=()=>controller.clueStep??(controller.state.stage+':'+(controller.state.visited?.length??0));
  const previous=step();
  const reply=original(npc,type,text,pos,clearLine);
  if(type==='mission'&&reply)briefing={...reply};
  if(type==='say'&&reply&&step()!==previous&&!clues.some(c=>c.npc===npc&&c.en===reply.en)){
   clues.push({npc,en:reply.en,zh:reply.zh});
  }
  return reply;
 }
 try{
  if(fresh)storage.removeItem(key);
  const raw=storage.getItem(key);
  if(raw){
   const saved=JSON.parse(raw);
   if(saved.version!==1||saved.id!==id||!Array.isArray(saved.events)||saved.events.length>10000)throw Error('invalid save');
   for(const e of saved.events){
    if(!e||!['mission','say','greet','discover','pickup','deliver','take-part','install-part','test-lamp'].includes(e.type)||typeof e.npc!=='string'||typeof e.text!=='string'||e.text.length>2000||!Number.isFinite(e.pos?.x)||!Number.isFinite(e.pos?.z))throw Error('invalid event');
    apply(e.npc,e.type,e.text,e.pos);
   }
   if(controller.state.complete){clearCompletedSession();controller=createMission(id);briefing=null;clues.length=0;}
   else {events=saved.events;restored=events.length>0;}
  }
 }catch{controller=createMission(id);events=[];briefing=null;clues.length=0;writable=false;notify('上次进度无法读取，原记录已保留；本次进度暂不能保存。');}
 original=controller.act;
 controller.act=(npc,type,text='',pos,clear=()=>true)=>{
  const before=JSON.stringify(controller.state);
  const reply=apply(npc,type,text,pos,clear);
  if(reply||JSON.stringify(controller.state)!==before){
   events.push({npc,type,text,pos:{x:pos.x,z:pos.z}});
   if(writable)try{
    if(events.length>10000)throw Error('save too large');
    if(controller.state.complete)clearCompletedSession();
    else storage.setItem(key,JSON.stringify({version:1,id,events}));
   }catch{writable=false;notify('本次进度未能保存，请勿刷新或关闭页面。');}
  }
  return reply;
 };
 Object.defineProperty(controller,'briefing',{get:()=>briefing});
 return Object.assign(controller,{restored,clues,review(npc){
  if(controller.state.complete&&npc===controller.config.giver)return controller.config.thanks;
  return clues.findLast(clue=>clue.npc===npc)||
   (npc===controller.config.giver?briefing:null);
 }});
}
