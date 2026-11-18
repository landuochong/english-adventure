import test from 'node:test';
import assert from 'node:assert/strict';
import {builtinStoryURL,oldEntryURL} from '../dist/legacy-entry.js';
test('old entry URLs lead to matching new levels',()=>{
 assert.equal(oldEntryURL('/campus-3d.html'),builtinStoryURL('science'));
 assert.equal(oldEntryURL('/cafe-3d.html'),builtinStoryURL('picnic'));
 assert.equal(oldEntryURL('/standalone.html'),'./');
 for(const id of ['welcome','pip','school','restaurant','shopping','directions','weather','hobbies'])assert.equal(oldEntryURL('/index.html','?play='+id),builtinStoryURL(id));
});
test('custom story links keep their identifiers and preview parameters',()=>{
 assert.equal(oldEntryURL('/standalone.html','?play=course-12345&preview=1'),'./practice.html?play=course-12345&preview=1');
 assert.equal(builtinStoryURL('constructor'),null);assert.equal(builtinStoryURL('generated-123'),null);
});
