import test from 'node:test';
import assert from 'node:assert/strict';
import {advance,currentScene,newPlay} from '../dist/school-plays.js';

function player(id){
  let state=newPlay();
  return {
    get state(){return state;},
    say(text){assert.ok(advance(id,state,text),text);},
    reject(text){const before=structuredClone(state);assert.equal(advance(id,state,text),false);assert.deepEqual(state,before);},
    choose(label){assert.ok(advance(id,state,label,true),label);},
    reload(){state=JSON.parse(JSON.stringify(state));assert.ok(currentScene(id,state).line);},
    done(){assert.equal(state.stage,'done');}
  };
}
test('入学：昵称和爱好，选两处，回访真实地点，完成入学',()=>{
  const p=player('welcome');
  p.reject("I'm fine.");p.say('My name is River.');p.say('I like reading.');
  p.say('What sports do you like?');p.say('Can we go to the library?');p.say('Hello!');
  p.reload();p.choose('前往运动区');p.say('What can we do here?');
  p.choose('找 Ben 约午休地点');p.reject('Cafe');p.say('The library');p.choose('回科学中心');
  p.reject("I didn't like the library.");p.reject('I liked the cafe.');p.say('I liked the sports area.');p.say('Yes!');p.done();
});
test('停笔：走错桌、取书、刷新、指出署名、补笔记、改展签',()=>{
  const p=player('pen');p.choose('夹上蓝书签，把书还给梅');p.choose('找梅核实出处');
  p.say('Can I borrow your book?');p.choose('走到小林身边');p.choose('回到梅身边');p.choose('走到本身边');
  p.say('Can I have the book?');p.choose('拿起书，回到黑板前');p.reload();assert.equal(p.state.book,true);
  p.say('The name is wrong!');p.reject('Mencius');p.reject('It was not Confucius.');p.say('Confucius');
  p.choose('展示书页');p.choose('给迟到的同学补笔记');p.say('Just the name.');p.say('Wang Han.');
  p.say('The one about learning.');p.say('Confucius');p.done();
});
test('Fine：答岔、改口、辨认画作、记者转述',()=>{
  const p=player('fine');p.say("I'm nervous.");p.say("I'm fine.");p.reject('My name is Ben.');
  p.say('My name is An.');p.reject('Mei drew the cat.');p.say('This is Mei.');p.reject('The moon is mine.');p.say('The moon is hers.');
  p.reject('The cat is hers.');p.say('Mine is the cat.');p.choose('帮本摆正桌牌');p.reload();p.say("It isn't mine. It's hers.");
  p.say('Give it to me.');p.say('I told him I was fine.');p.reject('Ben showed the cat.');
  p.say('Mei showed my cat.');p.done();
});
