import test from 'node:test';
import assert from 'node:assert/strict';
import {maze,newRun,move,interact,nearby,restoreRun,visible,tileAt} from '../dist/underground-maze.js';

test('maze has a continuous route through all three mechanisms and back to the stairs',()=>{
 let run=newRun();
 assert.equal(move(run,1,0),null);
 run.phase='search';
 assert.equal(visible(run,14,3),false);
 assert.equal(visible(run,5,3),false);
 assert.equal(interact(run,'P'),null);
 function reach(id){
  const queue=[[run.x,run.y,[]]],seen=new Set();
  while(queue.length){
   const [x,y,steps]=queue.shift(),key=x+','+y;
   if(seen.has(key))continue;
   seen.add(key);
   if(nearby({...run,x,y}).some(action=>action.id===id)){
    for(const delta of steps)assert.equal(move(run,...delta),'');
    return;
   }
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const probe={...run,x,y};
    if(move(probe,dx,dy)===''&&(probe.x!==x||probe.y!==y))queue.push([probe.x,probe.y,[...steps,[dx,dy]]]);
   }
  }
  assert.fail('Unreachable '+id);
 }
 reach('a');interact(run,'a');
 reach('R');assert.match(interact(run,'R'),/工具/);
 assert.throws(()=>reach('V'),/Unreachable/);
 reach('H');interact(run,'H');
 run=restoreRun(JSON.parse(JSON.stringify(run)));
 assert.equal(run.hammer,true);
 assert.deepEqual(run.clues,['a']);
 reach('b');interact(run,'b');
 reach('R');interact(run,'R');
 reach('c');interact(run,'c');
 assert.throws(()=>reach('P'),/Unreachable/);
 reach('V');interact(run,'V');
 reach('P');interact(run,'P');assert.equal(run.phase,'return');
 run=restoreRun(run);assert.equal(run.prism,true);
 reach('S');interact(run,'S');assert.equal(run.phase,'complete');
 assert.equal(restoreRun(run).phase,'complete');
 assert.equal(newRun().phase,'brief');
});

test('the pressure plate returns the player to the stairs and a side passage is reachable',()=>{
 const run=newRun();run.phase='search';
 for(let i=0;i<4;i++)move(run,1,0);
 assert.equal(tileAt(run.x+1,run.y),'T');
 assert.match(move(run,1,0),/楼梯/);
 assert.equal(run.resets,1);
 assert.deepEqual([run.x,run.y],[1,1]);
 move(run,1,0);move(run,1,0);move(run,0,1);move(run,0,1);
 assert.equal(run.y,3);
 assert.ok(maze.every(row=>row.length===maze[0].length));
});

test('maze questions can clarify a mark, ask a follow-up and repeat without changing game state',async()=>{
 const {answerMazeQuestion}=await import('../dist/underground-maze-dialogue.js');
 const run=newRun(),before=structuredClone(run);
 assert.equal(answerMazeQuestion('a','What does this triangle mean?',run),'a');
 assert.equal(answerMazeQuestion('a','How can I get around it?',run),'a-route');
 assert.equal(answerMazeQuestion('a','Could you say that again?',run,'a-route'),'a-route');
 assert.equal(answerMazeQuestion('b','Where can I find a hammer?',run),'b-tool');
 assert.equal(answerMazeQuestion('c','Where is the valve?',run),'c-valve');
 assert.equal(answerMazeQuestion('c','What is your favourite food?',run),'clarify');
 assert.deepEqual(run,before);
 assert.equal(answerMazeQuestion('b','How do I use the hammer?',{...run,hammer:true}),'b-have');
 assert.equal(answerMazeQuestion('c','Can I go through the gate?',{...run,powered:false}),'c-off');
});

test('six nearby tiles can be lit and a dangerous plate ends the run until restart',async()=>{
 const {lanternTiles,encounterTiles}=await import('../dist/underground-maze.js');
 const run={...newRun(),phase:'search',hammer:true,cleared:true,x:11,y:9};
 const lit=lanternTiles(run);
 assert.ok(lit.length<=7);
 assert.ok(lit.every(({x,y})=>visible(run,x,y)&&tileAt(x,y)!=='#'));
 assert.ok(encounterTiles(run).includes('D'));
 const bypass={...run};
 for(const delta of [[0,-1],[1,0],[1,0],[0,1]])assert.equal(move(bypass,...delta),'');
 assert.deepEqual([bypass.x,bypass.y,bypass.phase],[13,9,'search']);
 assert.match(move(run,1,0),/本轮结束/);
 assert.equal(run.phase,'failed');
 assert.equal(move(run,1,0),null);
 assert.equal(restoreRun(run).phase,'failed');
 assert.equal(newRun().hammer,false);
});

test('trail remembers traversed tiles through refresh and a pressure plate return',()=>{
 let run=newRun();run.phase='search';
 move(run,0,-1);
 assert.deepEqual(run.trail,['1,1']);
 for(let i=0;i<5;i++)move(run,1,0);
 assert.deepEqual([run.x,run.y],[1,1]);
 assert.deepEqual(run.trail,['1,1','2,1','3,1','4,1','5,1','6,1']);
 run=restoreRun(JSON.parse(JSON.stringify(run)));
 move(run,1,0);
 assert.equal(run.trail.length,6);
 assert.deepEqual(newRun().trail,['1,1']);
});

test('click routes can span several lit cells and never auto-route across a trap',async()=>{
 const {routeTo}=await import('../dist/underground-maze.js');
 const run=newRun();run.phase='search';
 assert.deepEqual(routeTo(run,{x:3,y:1}),[[1,0],[1,0]]);
 assert.deepEqual(routeTo(run,{x:14,y:3}),[]);
 run.x=5;
 assert.deepEqual(routeTo(run,{x:6,y:1}),[]);
});

test('continuous movement can stop between cells and only triggers a trap on entry',async()=>{
 const {advancePosition}=await import('../dist/underground-maze.js');
 const run={...newRun(),phase:'search'},pos={x:1,y:1};
 advancePosition(run,pos,.2,0);
 advancePosition(run,pos,.2,0);
 assert.equal(run.x,1);
 assert.ok(pos.x>1.39&&pos.x<1.41);
 advancePosition(run,pos,.2,0);
 assert.equal(run.x,2);
 assert.ok(pos.x>1.59&&pos.x<1.61);
 advancePosition(run,pos,0,.2);
 advancePosition(run,pos,0,.2);
 advancePosition(run,pos,0,.2);
 assert.equal(pos.y,1.41);
 advancePosition(run,pos,0,.2);
 assert.equal(pos.y,1.41);
 run.x=11;run.y=9;run.hammer=run.cleared=true;Object.assign(pos,{x:11.4,y:9});
 advancePosition(run,pos,.05,0);assert.equal(run.phase,'search');
 advancePosition(run,pos,.1,0);assert.equal(run.phase,'failed');
});

test('terrain beside the route remains surveyed after leaving and refreshing',async()=>{
 const {rememberSurvey,surveyTiles}=await import('../dist/underground-maze.js');
 const run={...newRun(),phase:'search'};
 rememberSurvey(run);
 const original=surveyTiles(run);
 assert.ok(run.surveyed.includes('2,1'));
 assert.ok(run.surveyed.includes('1,0'));
 assert.ok(!run.surveyed.includes('14,3'));
 move(run,1,0);move(run,1,0);move(run,0,1);move(run,0,1);
 rememberSurvey(run);
 assert.equal(run.x,3);assert.equal(run.y,3);
 const restored=restoreRun(run);
 assert.ok(original.every(({x,y})=>restored.surveyed.includes(x+','+y)));
 assert.ok(restored.surveyed.some(key=>!restored.trail.includes(key)&&key!=='1,0'));
 const legacy=restoreRun({...run,surveyed:undefined,audioVersion:undefined,announced:['a']});
 assert.ok(legacy.surveyed.includes('1,0'));
 assert.deepEqual(legacy.announced,[]);
});

test('moon door needs three local exchanges and survives a refresh',async()=>{
 const {keyScene,keyAnswer,talkToKeyRoom}=await import('../dist/underground-maze-dialogue.js');
 let run=newRun('key');
 run.phase='search';
 for(let i=0;i<3;i++)move(run,1,0);
 for(const text of ['Which way?','Key?'])assert.equal(keyAnswer(keyScene(run),text,run),'moon-route');
 assert.equal(keyAnswer(keyScene(run),'Star?',run),'key-clarify');
 for(let i=0;i<4;i++)move(run,1,0);
 for(const text of ['Star?', 'I see a star.', 'What is this?'])assert.equal(keyAnswer(keyScene(run),text,run),'star-hint');
 assert.equal(keyAnswer(keyScene(run),'Not a star.',run),'key-clarify');
 for(let i=0;i<4;i++)move(run,-1,0);
 assert.equal(interact(run,'B'),null);
 for(let i=0;i<4;i++)move(run,0,1);
 move(run,1,0);
 assert.match(move(run,1,0),/锁/);
 assert.equal(interact(run,'K'),null);
 interact(run,'B');assert.equal(run.doorOpen,false);
 assert.equal(talkToKeyRoom(run,'Open the door.'),'find-star');
 const atDoor={x:run.x,y:run.y};
 Object.assign(run,{x:8,y:1});
 talkToKeyRoom(run,'Not a star.');assert.equal(run.starAwake,false);
 assert.equal(talkToKeyRoom(run,'Which way?'),'star-awake');
 run=restoreRun(run,'key');Object.assign(run,atDoor);
 for(const text of ['Do not open the door.','Star?','Blue?','Hello'])talkToKeyRoom(run,text);
 interact(run,'B');assert.equal(run.doorOpen,false);
 assert.equal(talkToKeyRoom(run,'Which one?'),'levers-ready');
 assert.equal(interact(run,'B'),null);
 const step=(dx,dy,n)=>{for(let i=0;i<n;i++)assert.equal(move(run,dx,dy),'');};
 step(-1,0,1);step(0,-1,2);step(-1,0,3);step(0,1,5);step(1,0,1);
 assert.equal(keyScene(run),'levers');
 talkToKeyRoom(run,'Not a diamond.');
 assert.match(interact(run,'B'),/锁/);
 assert.equal(talkToKeyRoom(run,'What do these marks mean?'),'lever-rule');
 run=restoreRun(run,'key');
 const failure=structuredClone(run);
 assert.match(interact(failure,'r'),/封闭/);
 assert.equal(restoreRun(failure,'key').phase,'failed');
 assert.equal(interact(failure,'B'),null);
 assert.equal(failure.doorOpen,false);
 interact(run,'B');
 step(-1,0,1);step(0,-1,5);step(1,0,3);step(0,1,2);step(1,0,1);
 run=restoreRun(structuredClone(run),'key');
 assert.equal(run.doorOpen,true);
 assert.equal(run.key,false);
 step(1,0,4);
 assert.match(interact(run,'R'),/工具/);assert.equal(run.cleared,false);
 step(-1,0,1);step(0,1,2);interact(run,'H');
 run=restoreRun(run,'key');assert.equal(run.hammer,true);
 step(0,-1,2);step(1,0,1);
 assert.equal(restoreRun({...run,hammerEquipped:undefined},'key').hammerEquipped,false);
 assert.match(interact(run,'R'),/工具箱/);assert.equal(run.cleared,false);
 assert.equal(talkToKeyRoom(run,'Help!'),'radio-see');
 assert.equal(talkToKeyRoom(run,'Can I use the hammer?'),'radio-break');
 assert.equal(talkToKeyRoom(run,'Rocks.'),'radio-cracks');
 assert.equal(talkToKeyRoom(run,'There is a crack.'),'radio-tools');
 run=restoreRun(run,'key');
 assert.equal(talkToKeyRoom(run,'I have a hammer.'),'hammer-use');
 run.hammerEquipped=true;run=restoreRun(run,'key');assert.equal(run.hammerEquipped,true);
 interact(run,'R');step(1,0,4);
 assert.equal(talkToKeyRoom(run,'Order?'),'radio-keeper');
 assert.match(interact(run,'sun'),/值守人/);assert.equal(run.dialStep,0);
 step(-1,0,1);step(0,-1,2);
 assert.equal(talkToKeyRoom(run,"I don't want the order."),'keeper-ask');
 assert.equal(talkToKeyRoom(run,"What's the order?"),'keeper-order');
 step(0,1,2);step(1,0,1);
 interact(run,'sun');interact(run,'leaf');assert.equal(run.dialStep,0);
 interact(run,'sun');run=restoreRun(run,'key');assert.equal(run.dialStep,1);
 interact(run,'drop');interact(run,'leaf');step(1,0,3);
 assert.match(interact(run,'K'),/钥匙/);
 run=restoreRun(run,'key');assert.equal(run.phase,'search');assert.equal(keyScene(run),'coach');
 for(const text of ["I don't have the key.",'Where is the key?','I found a hammer.'])assert.equal(talkToKeyRoom(run,text),'key-report');
 assert.equal(talkToKeyRoom(run,'I have the key.'),'key-return');
 run=restoreRun(run,'key');assert.equal(run.phase,'return');
 step(-1,0,12);step(0,-1,4);step(-1,0,2);
 assert.equal(run.phase,'return');assert.match(move(run,-1,0),/出发点/);
 assert.equal(restoreRun(run,'key').phase,'complete');
 assert.equal(newRun('key').doorOpen,false);
});
