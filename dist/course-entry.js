import {validateStory,generateCheckedStory} from './generated-story.js';
import {saveStory} from './story-store.js';
const $=id=>document.getElementById(id),fields=['title','text','level','extra','scenario'];
let db,images=[],urls=[],busy=0,dirty=false,revision=0,extraction=null,confirmed=false,extracting=false,storyDraft=null,generating=false;
const status=text=>$('status').textContent=text;
function changed(source=false){revision++;dirty=true;if(extraction){if(source){extraction.stale=true;$('review-warning').textContent='课程材料或要求已修改，请重新提取后再确认。';}confirmed=false;$('confirmed').textContent='内容有修改，请重新检查并确认';}if(storyDraft){storyDraft.stale=true;if($('story-status'))$('story-status').textContent='学习重点或要求已改变，请重新生成故事。';}updateStoryAccess();if(storyDraft)checkStory();status('有未保存的修改');}
function renderImages(){
 urls.forEach(URL.revokeObjectURL);urls=[];$('images').replaceChildren();
 images.forEach((file,index)=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption'),remove=document.createElement('button');const url=URL.createObjectURL(file);urls.push(url);img.src=url;img.alt='课程图片 '+(index+1);caption.textContent=file.name||'粘贴的截图';remove.type='button';remove.textContent='移除图片 '+(index+1);remove.onclick=()=>{images.splice(index,1);renderImages();changed(true);};figure.append(img,caption,remove);$('images').append(figure);});
}
async function addFiles(files){
 if(extracting||generating)return;
 busy++;$('save').disabled=true;$('error').textContent='';const errors=[];
 try{for(const file of files){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)){errors.push('仅支持 PNG、JPG、WebP 图片。');continue;}
 if(file.size>5*1024*1024||images.length>=8||images.reduce((n,f)=>n+f.size,0)+file.size>20*1024*1024){errors.push('图片超过数量或大小限制。');continue;}
 try{const bitmap=await createImageBitmap(file);bitmap.close();if(images.length>=8||images.reduce((n,f)=>n+f.size,0)+file.size>20*1024*1024){errors.push('图片超过数量或大小限制。');continue;}images.push(file);changed(true);}catch{errors.push('有一张图片无法读取，请换一张。');}
 }renderImages();$('error').textContent=[...new Set(errors)].join(' ');
 }finally{busy--;$('save').disabled=!db||busy>0;}
}
$('files').onchange=e=>{void addFiles([...e.target.files]);e.target.value='';};
document.addEventListener('paste',e=>{const files=[...e.clipboardData.items].filter(i=>i.kind==='file').map(i=>i.getAsFile()).filter(Boolean);if(files.length){if(!e.clipboardData.getData('text/plain'))e.preventDefault();void addFiles(files);}});
const drop=$('drop');drop.ondragover=e=>{e.preventDefault();drop.classList.add('over');};drop.ondragleave=()=>drop.classList.remove('over');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over');void addFiles([...e.dataTransfer.files]);};
for(const id of fields)$(id).addEventListener('input',()=>changed(true));
async function persistDraft(e){
 e?.preventDefault();if(!db||busy||extracting||generating)return;
 if(!$('text').value.trim()&&!images.length){$('error').textContent='请先粘贴课程文字或添加至少一张图片。';$('text').focus();return;}
 $('save').disabled=true;$('error').textContent='';const savedRevision=revision;const draft={version:1,updatedAt:new Date().toISOString(),images:[...images],extraction,confirmed,storyDraft};for(const id of fields)draft[id]=$(id).value;
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(draft,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});dirty=revision!==savedRevision;status(dirty?'已保存上一版，仍有未保存的修改':'草稿已保存 · 可随时回来继续编辑');return !dirty;}
 catch{status('保存失败，当前素材仍在页面中');$('error').textContent='浏览器存储不可用或空间不足，请保留原材料后重试。';}
 finally{$('save').disabled=false;}
}
$('course-form').onsubmit=persistDraft;
window.addEventListener('beforeunload',e=>{if(dirty||busy||extracting||generating){e.preventDefault();e.returnValue='';}});
try{
 db=await new Promise((resolve,reject)=>{const r=indexedDB.open('campus-course-drafts',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Blocked'));});
 const draft=await new Promise((resolve,reject)=>{const r=db.transaction('drafts').objectStore('drafts').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 if(draft){for(const id of fields)if(typeof draft[id]==='string')$(id).value=draft[id];images=(draft.images||[]).filter(f=>f instanceof Blob);extraction=draft.extraction||null;confirmed=draft.confirmed===true;storyDraft=draft.storyDraft||null;renderReview();renderStory();renderImages();status('已恢复上次保存的草稿');}else status('添加文字或图片后即可保存');
 $('save').disabled=busy>0;
}catch{status('本地草稿存储不可用');$('error').textContent='可以输入和预览，但无法保存；请保留原材料。';}

function renderReview(){
 $('review').hidden=!extraction;if(!extraction)return;
 $('review-warning').textContent=extraction.stale?'课程材料或要求已修改，请重新提取后再确认。':(extraction.warnings||[]).join(' ');$('image-text').value=extraction.image_text||'';$('image-text').hidden=!extraction.image_text;document.querySelector('label[for="image-text"]').hidden=!extraction.image_text;
 $('review-items').replaceChildren();
 for(const [key,title] of [['vocabulary','核心词汇'],['phrases','短语'],['grammar','句型与语法']]){
 const section=document.createElement('section'),h=document.createElement('h2');h.textContent=title;section.append(h);
 for(const [index,row] of extraction[key].entries()){
 const box=document.createElement('div');box.className='card learning-item';
 const del=document.createElement('button');del.type='button';del.className='remove-item';del.textContent='×';del.title='删除此条';del.setAttribute('aria-label','删除'+title+'第'+(index+1)+'条');del.onclick=()=>{extraction[key].splice(index,1);changed();renderReview();};box.append(del);
 const grid=document.createElement('div');grid.className='learning-fields';
 for(const [field,label] of [['term','内容'],['meaning','中文含义 / 用法']]){const l=document.createElement('label'),input=document.createElement('input');l.textContent=title+' '+(index+1)+' · '+label;input.value=row[field];input.maxLength=2000;l.append(input);input.oninput=()=>{row[field]=input.value;row.reviewed=false;const check=box.querySelector('[data-review-item]');if(check)check.checked=false;changed();};grid.append(l);}box.append(grid);
 const details=document.createElement('details'),summary=document.createElement('summary'),l=document.createElement('label'),input=document.createElement('input');summary.textContent='查看原文依据';l.textContent=title+' '+(index+1)+' · 原文依据';input.value=row.evidence||'';input.maxLength=2000;input.oninput=()=>{row.evidence=input.value;changed();};l.append(input);details.append(summary,l);box.append(details);
 if(row.origin==='review'){const label=document.createElement('label'),check=document.createElement('input');label.className='pending-review';check.type='checkbox';check.style.width='auto';check.dataset.reviewItem='1';check.checked=!!row.reviewed;check.onchange=()=>{row.reviewed=check.checked;changed();};label.append(check,' 我已核对这一项的内容与含义');box.append(label);}
 section.append(box);
 }
 const add=document.createElement('button');add.textContent='添加'+title;add.onclick=()=>{extraction[key].push({term:'',meaning:'',evidence:'',origin:'supplement'});changed();renderReview();};section.append(add);$('review-items').append(section);
 }
 $('confirmed').textContent=confirmed?'学习重点已确认，可以生成故事。':'请核对后确认，或保存草稿稍后修改。';
}
$('image-text').oninput=()=>{extraction.image_text=$('image-text').value;changed();};
$('confirm').onclick=async()=>{
 if(!db){$('confirmed').textContent='浏览器存储不可用，暂时无法保存确认。';return;}
 if(extraction?.stale){$('confirmed').textContent='材料已改变，请重新提取后确认。';return;}
 const rows=['vocabulary','phrases','grammar'].flatMap(k=>extraction?.[k]||[]);
 if(!rows.length||rows.some(r=>!r.term.trim()||!r.meaning.trim()||(r.origin==='review'&&!r.reviewed))){$('confirmed').textContent='请填写内容和含义，并核对待确认条目（勾选已核对或删除），再确认。';return;}
 confirmed=true;dirty=true;revision++;$('course-form').requestSubmit();
 // Confirmation is persisted by the same transaction as the materials.
 $('confirmed').textContent='已标记确认，请查看上方保存状态，然后生成故事。';updateStoryAccess();
};
async function encodeImage(file){
 const bitmap=await createImageBitmap(file),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/jpeg',.9).split(',')[1];
}
$('extract').onclick=async()=>{
 if(busy||extracting)return;if(!$('text').value.trim()&&!images.length){$('error').textContent='请先添加课文或图片。';return;}
 extracting=true;const controls=[...document.querySelectorAll('input,textarea,select,button')];const disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);$('extract-status').textContent='正在本机分析，请稍候（可能需要几十秒至数分钟）…';$('error').textContent='';
 try{
 const payload={};for(const id of fields)payload[id]=$(id).value;payload.images=[];for(const file of images)payload.images.push(await encodeImage(file));
 const response=await fetch('/api/course-extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(320000)});
 const result=await response.json();if(!response.ok)throw Error(result.error||'提取失败');extraction=result;confirmed=false;changed();renderReview();$('extract-status').textContent='提取完成，请在下方核对、编辑并保存。';$('review').scrollIntoView({behavior:'smooth'});
 }catch(e){$('extract-status').textContent='未完成提取，原材料和上次结果仍保留。';$('error').textContent=e.name==='TimeoutError'?'本地模型处理超时，请减少材料后重试。':e.message;}
 finally{extracting=false;controls.forEach((c,i)=>c.disabled=disabled[i]);}
};

function learningItems(){return ['vocabulary','phrases','grammar'].flatMap(type=>(extraction?.[type]||[]).map((r,i)=>({id:type+'-'+i,type,term:r.term,meaning:r.meaning,origin:r.origin})));}
function updateStoryAccess(){
 $('story-builder').hidden=!extraction;
 $('generate-story').disabled=!confirmed||!!extraction?.stale||generating;
 if(!confirmed)$('story-status').textContent='请先核对并确认上方学习重点。';
}
function storyChanged(){revision++;dirty=true;if(storyDraft)storyDraft.reviewed=false;$('story-reviewed').checked=false;$('story-save-status').textContent='故事有修改，请重新检查并保存';status('有未保存的故事修改');$('play-story').disabled=true;$('story-check').textContent='故事有修改，请重新检查';}
function storyErrors(){
 if(!storyDraft)return ['请先生成故事'];
 if(storyDraft.stale||!confirmed||extraction?.stale)return ['学习重点或要求已经改变，请重新生成故事'];
 return validateStory(storyDraft.config,storyDraft.learning);
}
function checkStory(){const errors=storyErrors(),unapplied=storyDraft&&$('story-json').value!==JSON.stringify(storyDraft.config,null,2);$('play-story').disabled=generating||!!errors.length||!!unapplied;$('repair-story').hidden=!errors.length;$('repair-story').disabled=generating||!!storyDraft?.stale||!confirmed;$('story-check').textContent=unapplied?'请先应用高级配置的修改':errors.length?'暂时不能试玩：'+errors.join('；'):'检查通过，可以开始试玩。请在试玩时核对剧情和英语。';return !errors.length&&!unapplied;}
function renderStory(){
 updateStoryAccess();$('story-draft').hidden=!storyDraft;$('import-story-panel').hidden=!!storyDraft;if(!storyDraft)return;
 const c=storyDraft.config;$('story-title').value=c.title||'';$('story-background').value=c.background||'';$('story-json').value=JSON.stringify(c,null,2);$('story-reviewed').checked=!!storyDraft.reviewed;
 $('story-scenes').replaceChildren();
 function field(box,label,value,change,multiline=true){const l=document.createElement('label'),input=document.createElement(multiline?'textarea':'input');l.textContent=label;input.value=value||'';input.maxLength=1500;if(multiline)input.style.minHeight='85px';input.oninput=()=>{change(input.value);storyChanged();$('story-json').value=JSON.stringify(c,null,2);checkStory();};l.append(input);box.append(l);}
 for(const [index,a] of [{label:'领取委托',reply:c.mission,hint:c.intro,event:'教练介绍场景，学生走近同伴听取任务。'},...(c.actions||[])].entries()){
 const box=document.createElement('article');box.className='card';const h=document.createElement('h2');h.textContent=(index+1)+' · '+a.label;box.append(h);
 const who=document.createElement('p');who.textContent='人物：'+(c.npcs?.find(n=>n.id===(index===0?c.giver:a.npc))?.name||'待修正');box.append(who);
 if(index)field(box,'事件与因果 · 作者可见',a.event,v=>a.event=v);
 for(const [key,label] of [['reply','人物回应'],['hint','教练建议']])for(const lang of ['en','zh'])field(box,label+(lang==='en'?' · 英语':' · 中文'),a[key]?.[lang],v=>{a[key]??={};a[key][lang]=v;});
 if(index){const p=document.createElement('p');p.className='hint';p.textContent='需交流 '+(a.slots?.length||0)+' 个信息项；可接受表达和条件可在高级编辑中调整。';box.append(p);}
 $('story-scenes').append(box);
 }
 $('story-coverage').replaceChildren();for(const item of storyDraft.learning){const p=document.createElement('p');const mappings=(c.coverage||[]).filter(x=>x.learning_id===item.id);p.textContent=item.term+' — '+(mappings.map(x=>x.step+'：'+x.practice).join('；')||'未安排练习');$('story-coverage').append(p);}
 $('story-additions').textContent=(c.additions||[]).map(x=>x.term+'：'+x.meaning).join('；')||'无关键补充表达';
 checkStory();
}
$('story-title').oninput=()=>{storyDraft.config.title=$('story-title').value;storyChanged();$('story-json').value=JSON.stringify(storyDraft.config,null,2);checkStory();};
$('story-background').oninput=()=>{storyDraft.config.background=$('story-background').value;storyChanged();$('story-json').value=JSON.stringify(storyDraft.config,null,2);checkStory();};
$('story-reviewed').onchange=()=>{storyDraft.reviewed=$('story-reviewed').checked;revision++;dirty=true;};
$('story-json').oninput=()=>{storyChanged();$('story-check').textContent='完整配置有未应用的修改，请先应用配置';$('play-story').disabled=true;};
$('apply-story-json').onclick=()=>{try{const config=JSON.parse($('story-json').value);if(!config||!Array.isArray(config.actions)||!Array.isArray(config.npcs))throw Error('缺少人物或情节');const errors=validateStory(config,storyDraft.learning);if(errors.length)throw Error(errors.join('；'));storyDraft.config=config;storyChanged();renderStory();}catch(e){$('story-check').textContent='无法应用配置：'+e.message;}};
$('check-story').onclick=()=>checkStory();
async function requestStory(payload){
 const r=await fetch('/api/story-generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(320000)});const result=await r.json();if(!r.ok)throw Error(result.error||'故事处理失败');return result;
}
async function buildStory(repair=false){
 if(!confirmed||extraction?.stale||generating||busy)return;
 if(repair&&(!storyDraft||storyDraft.stale))return;
 generating=true;const controls=[...document.querySelectorAll('input,textarea,select,button')],disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);$('story-status').textContent=repair?'正在本机修复当前故事的线索与交互，请稍候…':'正在本机编排故事，生成后会自动检查；如需修复会再处理一次…';
 try{
 const learning=repair?storyDraft.learning:learningItems(),payload={learning,title:$('title').value,level:$('level').value,scenario:$('scenario').value};
 if(repair)payload.story=storyDraft.config;
 const result=await generateCheckedStory(requestStory,payload,errors=>{$('story-status').textContent='初稿有 '+errors.length+' 处流程问题，正在自动修复（最多一次），请稍候…';}),errors=result.errors;
 const previousConfig=storyDraft?.config;storyDraft={id:repair?storyDraft.id:crypto.randomUUID(),config:result.story,learning,reviewed:false,stale:false,previousConfig};revision++;dirty=true;renderStory();
 $('story-status').textContent=result.repairError?'初稿已保留，自动修复未完成：'+result.repairError:errors.length?'自动修复后仍有流程问题，已保留为草稿。暂时无法试玩，可点击自动修复故事再试。':'故事已通过检查，点击“开始试玩”。草稿会自动保存。';
 $('story-draft').scrollIntoView({behavior:'smooth'});
 }catch(e){$('story-status').textContent='本次处理未完成，课程和上次故事仍保留。'+(e.name==='TimeoutError'?'模型超时，可稍后重试。':e.message);}
 finally{generating=false;controls.forEach((c,i)=>c.disabled=disabled[i]);updateStoryAccess();if(storyDraft){checkStory();if(dirty)await persistDraft();}}
}
$('generate-story').onclick=()=>buildStory();
$('repair-story').onclick=()=>buildStory(true);
async function storePlayable(mode){
 if(!storyDraft)throw Error('请先生成故事');
 if($('story-json').value!==JSON.stringify(storyDraft.config,null,2))throw Error('请先应用高级配置的修改');
 if(!checkStory())throw Error('请先处理故事检查问题');
 const record={id:mode==='preview'?'preview-'+storyDraft.id:storyDraft.id,version:crypto.randomUUID(),mode,config:storyDraft.config,learning:storyDraft.learning,updatedAt:new Date().toISOString()};
 await saveStory(record);return record;
}
$('play-story').onclick=async()=>{try{const record=await storePlayable('preview');if(!await persistDraft())throw Error('课程草稿未保存，请保留修改后重试');location.href='./?play='+encodeURIComponent(record.id);}catch(e){$('story-save-status').textContent='无法试玩：'+e.message;}};
$('save-story').onclick=async()=>{try{if(!storyDraft.reviewed)throw Error('请先试玩并勾选核对确认');await storePlayable('saved');$('story-save-status').textContent='已保存到本机故事列表，主页可选择；再次保存会更新版本并从头开始。';$('course-form').requestSubmit();}catch(e){$('story-save-status').textContent='保存失败：'+e.message;}};
updateStoryAccess();

$('import-story').onclick=async()=>{try{
 if(!confirmed)throw Error('请先确认学习重点');
 const c=JSON.parse($('import-story-json').value);if(!c||!Array.isArray(c.actions)||!Array.isArray(c.npcs)||!c.mission||!c.intro||!Array.isArray(c.coverage)||!Array.isArray(c.additions)||c.actions.some(a=>!a||!a.reply||!a.hint||!Array.isArray(a.slots))||c.npcs.some(n=>!n||typeof n.name!=='string'))throw Error('故事配置不完整');
 storyDraft={id:crypto.randomUUID(),config:c,learning:learningItems(),reviewed:false,stale:false};storyChanged();renderStory();await persistDraft();$('story-status').textContent='已恢复故事草稿，检查未通过时可自动修复。';
}catch(e){$('import-status').textContent='恢复失败：'+e.message;}};
