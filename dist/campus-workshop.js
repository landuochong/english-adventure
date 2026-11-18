const pair=(en,zh)=>({en,zh});

export const workshopBench={x:65,z:11};
export const workshopParts=[
 {id:'base',name:'底座',word:'base',x:60,z:12},
 {id:'battery',name:'电池',word:'battery',x:70,z:13},
 {id:'bulb',name:'灯泡',word:'bulb',x:70,z:19}
];

const briefing=pair(
 'Can you build a lantern for our reading corner? Find the parts in this room. On the workbench, put down the base first, fit the battery next, and put the bulb on last. Switch it on to test it, then bring it to me.',
 '能帮阅读角组装一盏便携灯吗？零件就在房间里。到工作台先放底座，再装电池，最后装灯泡。开灯试一试，然后把灯带给我。'
);
export const workshopMission={
 id:'workshop',world:'campus',region:'workshop',title:'给阅读角做一盏灯',
 giver:'alex',people:['alex'],kind:'workshop',item:'便携灯',device:null,
 asrScene:'campus-workshop',words:['base','battery','bulb','workbench','lantern'],
 phrases:['What should I put on first?','Where can I find the battery?','Switch it on.'],
 thanks:pair('It works! Thank you for building a lantern for our reading corner.','亮了！谢谢你为阅读角做了一盏灯。'),
 summary:'你找齐零件，按顺序组装并试亮了便携灯，然后交给了 Alex。'
};

export function createWorkshopMission(layout){
 const config=workshopMission;
 const state={stage:'brief',complete:false,owner:null,records:{},collected:[],installed:[]};
 const near=(pos,target,range,clearLine)=>pos&&clearLine(target)&&Math.hypot(pos.x-target.x,pos.z-target.z)<=range;
 const nextPart=()=>workshopParts[state.installed.length];
 return {
  config,state,
  get keyword(){return state.stage==='brief'?'listen':state.stage==='handover'?'deliver':nextPart()?.word||'switch';},
  marker(npc){return npc!==config.giver?'idle':state.complete?'done':state.stage==='brief'?'ask':'text';},
  hint(){
   if(state.stage==='brief')return pair('Go to the workshop and listen to Alex.','去手工坊听 Alex 的委托。');
   if(state.stage==='handover')return pair('The lantern works. Take it back to Alex.','灯已经亮了。把它带回去交给 Alex。');
   const part=nextPart();
   if(!part)return pair('All the parts are in place. Switch on the lantern to test it.','零件都装好了，开灯试一试。');
   if(state.collected.includes(part.id))return pair('At the workbench, install the '+part.word+' next.','到工作台，下一步安装'+part.name+'。');
   return pair('Look for the '+part.word+' around the workshop. Listen to Alex again if you forget the order.','在手工坊找'+part.name+'。忘了顺序可以重听 Alex 的委托。');
  },
  act(target,type,text,pos,clearLine=()=>true){
   if(state.complete)return null;
   if(target===config.giver&&near(pos,layout.people.alex,layout.interactionRadius,clearLine)){
    if(type==='mission'&&state.stage==='brief'){
     state.stage='assembly';state.records.alex=briefing;return briefing;
    }
    if(type==='deliver'&&state.stage==='handover'){
     state.complete=true;state.stage='complete';state.owner='display';return config.thanks;
    }
   }
   if(state.stage!=='assembly')return null;
   if(type==='take-part'){
    const part=workshopParts.find(p=>p.id===target);
    if(part&&!state.collected.includes(part.id)&&near(pos,part,2.25,clearLine))state.collected.push(part.id);
   }
   if(target==='bench'&&near(pos,workshopBench,2.5,clearLine)){
    if(type==='install-part'&&nextPart()?.id===text&&state.collected.includes(text))state.installed.push(text);
    if(type==='test-lamp'&&!nextPart()){state.owner='student';state.stage='handover';}
   }
   return null;
  }
 };
}
