import test from 'node:test';
import assert from 'node:assert/strict';
import {stories, storyIds, storyList, discussStory} from '../dist/stories.js';

// 每篇故事的检查题：正例（应命中 answer 正则）与反例（应不命中）。
const samples = {
  school: {positive: ['He forgot his book', '数学书'], negative: ['He bought a pen']},
  restaurant: {positive: ['She ordered a sandwich', '鸡肉三明治'], negative: ['She drank juice']},
  shopping: {positive: ['a blue cap', '25 yuan', '蓝色帽子'], negative: ['a red shirt']},
  directions: {positive: ['take Bus 5', 'get off at library', '5 路公交'], negative: ['take a taxi']},
  weather: {positive: ['It is sunny', 'bring a kite', '公园'], negative: ['It is rainy']},
  hobbies: {positive: ['Tim likes swimming', '游泳'], negative: ['Tim likes running']},
  pip: {positive: ['Pip the robot is missing', '机器人不见了'], negative: ['The weather is nice']}
};

test('stories module exposes ids and list', () => {
  assert.equal(storyIds.length, 7);
  assert.equal(storyList.length, 7);
  for (const s of storyList) {
    assert.equal(typeof s.id, 'string');
    assert.equal(typeof s.topic, 'string');
    assert.equal(typeof s.name, 'string');
  }
});

test('every story has required bilingual fields', () => {
  for (const id of storyIds) {
    const d = stories[id];
    assert.ok(d.topic && d.name, id + ': missing topic/name');
    for (const key of ['simple', 'words', 'check', 'feedback']) {
      assert.ok(Array.isArray(d[key]) && d[key].length === 2, id + ': ' + key + ' must be [en,zh]');
      assert.ok(d[key].every(x => typeof x === 'string'), id + ': ' + key + ' must be strings');
    }
    assert.ok(d.answer instanceof RegExp, id + ': answer must be RegExp');
    assert.ok(Array.isArray(d.wrong) && d.wrong.length === 2, id + ': wrong must be [en,zh]');
  }
});

test('every story answer regex matches positives, rejects negatives', () => {
  for (const id of storyIds) {
    const {positive, negative} = samples[id];
    for (const p of positive) assert.ok(stories[id].answer.test(p), id + ': should match "' + p + '"');
    for (const n of negative) assert.ok(!stories[id].answer.test(n), id + ': should NOT match "' + n + '"');
  }
});

test('discussStory question mode returns bilingual pair', () => {
  const r = discussStory('school', 'Tell me the story again');
  assert.ok(r.en && r.zh);
  assert.equal(r.checking, false);
});

test('discussStory check mode asks the check question', () => {
  const r = discussStory('restaurant', 'check my understanding');
  assert.equal(r.checking, true);
  assert.ok(r.en.includes('order') || r.en.includes('onion'));
});

test('discussStory evaluates answers (positive and negative)', () => {
  const good = discussStory('shopping', 'a blue cap', true);
  assert.equal(good.checking, false); // matched -> not still checking
  assert.ok(good.en.includes('blue cap'));

  const bad = discussStory('shopping', 'a red shirt', true);
  assert.equal(bad.checking, true); // wrong -> keep checking
});

test('discussStory handles term lookup', () => {
  const r = discussStory('weather', 'What does sunny mean?');
  assert.ok(r.en.toLowerCase().includes('sun') || r.zh.includes('晴朗'));
});
