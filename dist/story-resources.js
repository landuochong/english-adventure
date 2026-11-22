import {environmentLayout} from './campus-environment-layout.js';
export const sceneTemplates=[
 {id:'library',name:'校园图书馆',theme:'classroom',description:'借阅、寻找资料、约定归还与学习合作',cast:['tom','lisa'],roles:['需要帮助的同学','提供图书或资料的同学']},
 {id:'cafe',name:'校园咖啡馆',theme:'cafe',description:'点餐、询问菜单、调整食物与饮料',cast:['lily','waiter'],roles:['委托点餐的朋友','咖啡馆店员']},
 {id:'shop',name:'校园商店',theme:'shop',description:'选购、问价、比较款式与处理缺货',cast:['jack','seller'],roles:['挑选礼物的朋友','商店店员']},
 {id:'transit',name:'校车站',theme:'town',description:'问路、交通、集合与行程变化',cast:['anna','driver','librarian'],roles:['计划出行的同学','提供交通信息的人','提供地点信息的人']},
 {id:'garden',name:'校园草坪',theme:'park',description:'天气、野餐、活动邀请与计划调整',cast:['bob','ranger','mary'],roles:['发起活动的同学','提供天气信息的人','受邀的同伴']},
 {id:'sports',name:'校园运动区',theme:'sports',description:'爱好、运动邀请、时间安排与合作',cast:['tim','sue'],roles:['发起运动的同学','参加运动的同伴']}
];
const roles={mei:'音乐社伙伴',alex:'手工坊伙伴',mia:'科技展组织者',ben:'校园服务人员',leo:'实验室伙伴',lily:'校园同学',waiter:'咖啡馆店员',tom:'校园同学',lisa:'图书馆伙伴',jack:'校园同学',seller:'商店店员',anna:'出行伙伴',driver:'校车司机',librarian:'图书管理员',bob:'活动组织者',ranger:'户外活动指导员',mary:'活动伙伴',tim:'运动伙伴',sue:'运动伙伴'};
export const builtInCharacters=Object.entries(environmentLayout.people).map(([id,p])=>({id,name:p.name,identity:roles[id],personality:'友善，使用清楚的英语短句。',worldCharacterId:id,archived:false}));
export const resourceKey='campus-character-library-v1';
export function validateCharacter(p){return !!p&&typeof p.id==='string'&&/^[a-z0-9-]{1,80}$/.test(p.id)&&['name','identity','personality'].every(k=>typeof p[k]==='string'&&p[k].trim()&&p[k].length<=(k==='name'?60:200));}
export function loadCharacters(storage){const base=structuredClone(builtInCharacters);const raw=storage.getItem(resourceKey);if(!raw)return base;const saved=JSON.parse(raw);if(!Array.isArray(saved)||saved.some(p=>!validateCharacter(p))||new Set(saved.map(p=>p.id)).size!==saved.length)throw Error('人物库数据损坏，未覆盖原数据');for(const p of saved){const i=base.findIndex(x=>x.id===p.id);if(i>=0)base[i]={...base[i],...p};else base.push(p);}return base;}
export function saveCharacters(storage,people){if(people.some(p=>!validateCharacter(p)))throw Error('姓名、身份和性格不能为空或过长');storage.setItem(resourceKey,JSON.stringify(people));}
export function selectionSnapshot(sceneId,casting,people){const scene=sceneTemplates.find(s=>s.id===sceneId);if(!scene)throw Error('请选择场景');const cast=casting.filter(p=>p.characterId);if(cast.length<2||cast.length>3||new Set(cast.map(p=>p.characterId)).size!==cast.length)throw Error('请选择 2～3 位不同人物');return {version:1,scene:{id:scene.id,name:scene.name,theme:scene.theme,description:scene.description},cast:cast.map((entry,i)=>{const p=people.find(p=>p.id===entry.characterId&&!p.archived);if(!p)throw Error('所选人物已停用，请重新选择');if(!entry.role.trim()||entry.role.length>200)throw Error('请填写本故事中的角色职责');return {slot:'npc'+(i+1),characterId:p.id,name:p.name,identity:p.identity,personality:p.personality,role:entry.role,worldCharacterId:p.worldCharacterId||null};})};}
export function bindResources(story,resources){if(!resources)return story;if(story.theme!==resources.scene.theme||story.giver!=='npc1'||story.npcs.length!==resources.cast.length||resources.cast.some(p=>!story.npcs.some(n=>n.id===p.slot&&n.name===p.name)))throw Error('生成结果未遵循所选场景或人物，请重新生成');return {...story,resources:structuredClone(resources)};}
