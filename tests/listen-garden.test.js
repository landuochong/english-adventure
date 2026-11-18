import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
test('garden needs listening, discovery, confirmation and correct delivery',()=>{
 const nodes=new Map(),objects=[];
 function element(){return {textContent:'',value:'',dataset:{},style:{},classList:{toggle(){}},children:[],setAttribute(){},replaceChildren(){this.children=[];},append(b){this.children.push(b);if(this===nodes.get('objects'))objects.push(b);}};}
 const get=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 const context=vm.createContext({document:{getElementById:get,createElement:element,querySelectorAll:()=>objects,querySelector:selector=>selector==='details'?get('details'):objects.find(b=>b.dataset.item==='bottle')},createGardenSpeech:()=>({speak(){},stop(){}}),window:{},setTimeout:()=>1,clearTimeout(){},addEventListener(){},location:{reload(){}}});
 const source=fs.readFileSync(new URL('../dist/listen-garden.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
 vm.runInContext(source,context);
 const click=name=>objects.find(b=>b.dataset.item===name).onclick();
 const ask=text=>{get('question').value=text;get('form').onsubmit({preventDefault(){}});};
 click('water');assert.equal(get('inventory').children.length,0);
 get('mission').onclick();click('water');click('cup');click('bottle');
 get('deliver').onclick();assert.notEqual(get('deliver').textContent,'✓ 小聚准备好了');
 ask('Can I bring a bottle instead?');click('juice');get('deliver').onclick();assert.notEqual(get('deliver').textContent,'✓ 小聚准备好了');
 get('inventory').children.at(-1).onclick();get('deliver').onclick();assert.equal(get('deliver').textContent,'✓ 小聚准备好了');
});
