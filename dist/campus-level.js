import {generatedTurn} from './generated-story.js';
export const campusPeople={mia:{name:'Mia',x:-7,z:4},ben:{name:'Ben',x:-6,z:-3},leo:{name:'Leo',x:7,z:-3}};
export const devicePoint={x:8,z:-5};
const pair=(en,zh)=>({en,zh});
export const intro=pair('Welcome to the science fair. Mia needs help at the exhibition desk. Go and listen to her first. I will help you think, but you take the lead.','欢迎来到科技展。Mia 在展台需要帮助，先去听她的委托。你来行动，我帮你分析。');
export const mission=pair('Our small robot is missing from this display. It has a blue light. Please bring it back for the science fair. Ben at the information desk may know where it is.','展台的小机器人不见了。它有蓝色灯。请把它带回科技展。服务台的 Ben 可能知道去向。');
const moved=pair('Yes, the robot was moved to the laboratory for a battery check. Go through the glass doorway on the right and ask Leo.','机器人被移到实验室检查电池了。穿过右侧玻璃门，去问 Leo。');
const requirements=pair('The battery check is finished. Before I release the robot, please tell me its light colour and what you need it for.','电池检查完了。领取前，请告诉我灯的颜色，以及你需要它做什么。');
const released=pair('That is the right robot. It is ready on the laboratory platform. Please pick it up and take it back to Mia.','核对正确。机器人在实验室台面上，请亲自领取并带回 Mia 那里。');
export const thanks=pair('You brought our robot back! Thank you. The science fair can begin. Well done!','你把机器人带回来了！谢谢，科技展可以开始了，做得好！');
const slot=(key,intent,aliases,en,zh)=>({key,intent,expected:key,question:pair(en,zh),options:[{value:key,aliases}]});
const askSlots=[slot('slot1','question',['robot','device'],'What would you like to ask about?','你想询问什么？')];
const verifySlots=[slot('slot1','answer',['blue','blue light'],'What colour is its light?','它的灯是什么颜色？'),slot('slot2','answer',['science fair','science exhibition','school fair','exhibition'],'What do you need the robot for?','你需要机器人做什么？')];
const reportSlots=[slot('slot1','report',['robot','device'],'What have you brought back?','你带回了什么？')];
export function campusState(){return {stage:'brief',draft:null,owner:null,discovered:false,complete:false,records:{}};}
export function campusMarker(s,id){
 if(id==='nova')return 'coach';
 if(s.complete)return 'done';
 if(id==='mia'&&(s.stage==='brief'||s.stage==='return'))return 'ask';
 if(id==='ben'&&s.stage==='service'||id==='leo'&&['lab-question','verify'].includes(s.stage))return 'ask';
 return s.records[id]?'text':'idle';
}
export function campusAct(s,id,type,text='',pos,layout){
 const target=id==='device'?(layout?.device||devicePoint):(layout?.people||campusPeople)[id];
 if(!pos||!target||Math.hypot(pos.x-target.x,pos.z-target.z)>(id==='device'?2.3:(layout?.interactionRadius??2.3)))return null;
 if(s.complete)return s.records[id]||thanks;
 const record=r=>{s.records[id]=r;return r;};
 if(type==='mission'&&id==='mia'&&s.stage==='brief'){s.stage='service';return record(mission);}
 if(type==='discover'&&id==='device'&&s.stage==='pickup'){s.discovered=true;return null;}
 if(type==='pickup'&&id==='device'&&s.stage==='pickup'&&s.discovered){s.owner='student';s.stage='return';return null;}
 if(type==='deliver'&&id==='mia'&&s.stage==='handover'&&s.owner==='student'){s.owner='display';s.stage='complete';s.complete=true;return record(thanks);}
 if(type!=='say')return null;
 const expected={service:'ben','lab-question':'leo',verify:'leo',return:'mia'}[s.stage];
 if(id!==expected)return null;
 const slots=s.stage==='verify'?verifySlots:s.stage==='return'?reportSlots:askSlots;
 const r=generatedTurn(slots,s.draft,text);s.draft=r.draft;
 if(!r.complete)return record(r.response);
 s.draft=null;
 if(s.stage==='service'){s.stage='lab-question';return record(moved);}
 if(s.stage==='lab-question'){s.stage='verify';return record(requirements);}
 if(s.stage==='verify'){s.stage='pickup';return record(released);}
 if(s.stage==='return'&&s.owner==='student'){s.stage='handover';return record(pair('Thank you. Please put it on our display.','谢谢，请亲自把它交到展台上。'));}
 return null;
}
export function campusHint(s){
 const hints={
 brief:intro,
 service:pair('Who could know where the robot went? Try asking at the information desk.','谁可能知道去向？试着询问服务台。'),
 'lab-question':pair('Think about what Ben told you. Find the glass doorway and speak to Leo.','回想 Ben 的话，找到玻璃门，和 Leo 交流。'),
 verify:pair('Remember Mia’s description and why she needs the robot. You can give one detail at a time.','回想 Mia 的描述和用途，可以分次补充。'),
 pickup:pair('Leo has finished the check. Walk close to the laboratory platform and pick up the robot yourself.','Leo 已完成检查，走近实验室台面，亲自领取。'),
 return:pair('You are carrying the robot. Go back to Mia and tell her what you brought.','你带着机器人了，回去向 Mia 汇报。'),
 handover:pair('Now put the robot on the display yourself.','现在亲自交付到展台上。'),
 complete:thanks};
 return hints[s.stage];
}
