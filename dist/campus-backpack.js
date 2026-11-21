// Read-only learning and task view. Opening a bag never changes mission progress.
export function createBackpack({getContext,speak,pause,resume,stop}){
 const dialog=document.createElement('dialog');dialog.id='campus-backpack';dialog.setAttribute('aria-labelledby','bag-title');
 dialog.innerHTML=`<header><div><small>随身物品</small><h2 id="bag-title">任务背包</h2></div><button id="bag-close" aria-label="关闭任务背包">×</button></header><section id="bag-task"><h3>当前任务</h3><strong id="bag-mission"></strong><p id="bag-status"></p><div id="bag-task-audio"><button id="bag-listen">🔊 重听委托</button><button id="bag-slow">慢速听</button></div><p id="bag-audio-status" role="status"></p><details id="bag-text"><summary>查看任务文字</summary><p id="bag-en" lang="en"></p><p id="bag-zh"></p></details></section><section id="bag-clues" aria-labelledby="bag-clue-title"><h3 id="bag-clue-title">已获得线索</h3><p id="bag-clue-empty">还没有线索。和任务人物交流后，可以来这里重听。</p><ol id="bag-clue-list"></ol></section><button id="bag-book" aria-expanded="false" aria-controls="bag-pages"><span class="bag-book-icon" aria-hidden="true">▤</span><span><strong>语言学习册</strong><small id="bag-count"></small></span><span aria-hidden="true">打开 ›</span></button><section id="bag-pages" hidden><h3>核心词汇</h3><div id="bag-words"></div><h3>常用短语</h3><div id="bag-phrases"></div></section>`;
 document.body.append(dialog);const $=id=>dialog.querySelector('#bag-'+id);let context;
 function entries(target,items){target.replaceChildren();for(const text of items){const row=document.createElement('div');row.className='bag-entry';const label=document.createElement('span');label.textContent=text;label.lang='en';const listen=document.createElement('button');listen.textContent='🔊';listen.setAttribute('aria-label','朗读 '+text);listen.onclick=()=>speak(text);const slow=document.createElement('button');slow.textContent='慢听';slow.setAttribute('aria-label','慢速朗读 '+text);slow.onclick=()=>speak(text,true);row.append(label,listen,slow);target.append(row);}}
 function renderClues(clues){
  const list=$('clue-list');
  list.replaceChildren();
  $('clue-empty').hidden=clues.length>0;
  for(const [index,clue] of clues.entries()){
   const row=document.createElement('li');
   const name=document.createElement('strong');name.textContent=clue.name;
   const listen=document.createElement('button');listen.textContent='重听';
   listen.setAttribute('aria-label',`重听第 ${index+1} 条线索，${clue.name}`);
   listen.onclick=()=>speak(clue.en);
   const details=document.createElement('details');
   const summary=document.createElement('summary');summary.textContent='查看文字';
   const english=document.createElement('p');english.lang='en';english.textContent=clue.en;
   const chinese=document.createElement('p');chinese.textContent=clue.zh;
   details.append(summary,english,chinese);
   row.append(name,listen,details);
   list.append(row);
  }
 }
 $('close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{stop();resume();});
 $('book').onclick=()=>{$('pages').hidden=!$('pages').hidden;$('book').setAttribute('aria-expanded',String(!$('pages').hidden));$('book').lastElementChild.textContent=$('pages').hidden?'打开 ›':'收起 ‹';};
 $('listen').onclick=()=>context.briefing&&speak(context.briefing.en);$('slow').onclick=()=>context.briefing&&speak(context.briefing.en,true);
 return {open(){context=getContext();pause();$('audio-status').textContent='';const {config,state,briefing,exploring,clues=[],status}=context;
 $('clues').hidden=exploring;renderClues(exploring?[]:clues);
 $('mission').textContent=exploring?'尚未选择任务':config.title;
 $('status').textContent=status??(exploring?'走近有问号的同伴，听听他的委托。':state.complete?'已完成':state.stage==='brief'?'尚未领取：先听任务发布者的委托。':state.owner==='student'?'携带中：'+config.item:state.stage==='pickup'?'物品待领取':state.stage==='handover'?'等待你确认交付':'进行中');
 $('task-audio').hidden=$('text').hidden=!briefing||exploring;$('text').open=false;$('en').textContent=briefing?.en||'';$('zh').textContent=briefing?.zh||'';
 $('book').hidden=exploring||!(config.words.length||config.phrases.length);$('pages').hidden=true;$('book').setAttribute('aria-expanded','false');$('book').lastElementChild.textContent='打开 ›';
 $('count').textContent=config.words.length+' 个词汇 · '+config.phrases.length+' 个短语';entries($('words'),config.words);entries($('phrases'),config.phrases);dialog.showModal();
 }};
}
