export const levels=[
 {id:'welcome',title:'入学仪式',area:'未来校园',theme:'自我介绍 · 认识校园',hook:'欢迎来到未来校园！Mia 老师和新同伴正在等你。',minutes:'约 6–10 分钟',x:46,y:48},
 {id:'science',title:'科技展的空展台',area:'科学中心',theme:'询问线索 · 核对信息',hook:'科技展快开始了，Mia 的展台却少了一位重要成员。',minutes:'约 5–8 分钟',x:46,y:20},
 {id:'school',title:'上课前的小麻烦',area:'图书馆',theme:'礼貌借用 · 约定归还',hook:'上课铃快响了，Tom 发现自己忘带了课本。',minutes:'约 4–6 分钟',x:74,y:24},
 {id:'restaurant',title:'帮朋友点份午餐',area:'咖啡馆',theme:'询问菜单 · 表达需求',hook:'Lily 请你帮忙点餐。听清她喜欢什么，也记住她不要什么。',minutes:'约 4–6 分钟',x:43,y:73},
 {id:'shopping',title:'一份合适的礼物',area:'校园商店',theme:'询问价格 · 颜色与尺码',hook:'Jack 想挑一份礼物，请你在预算内找到合适的那一件。',minutes:'约 4–6 分钟',x:77,y:62},
 {id:'directions',title:'博物馆怎么走？',area:'校车站',theme:'询问路线 · 转述信息',hook:'Anna 计划去博物馆。你能帮她把路线问清楚吗？',minutes:'约 5–8 分钟',x:84,y:42},
 {id:'weather',title:'周末一起出发',area:'探索草坪',theme:'询问天气 · 协商计划',hook:'Bob 有个周末计划，不过还需要天气和朋友们的配合。',minutes:'约 5–7 分钟',x:20,y:70},
 {id:'hobbies',title:'认识一位新伙伴',area:'运动区',theme:'了解爱好 · 发出邀请',hook:'Tim 想邀请新伙伴参加活动。先聊聊她的兴趣吧。',minutes:'约 4–6 分钟',x:18,y:39},
 {id:'picnic',title:'午餐计划有变化',area:'咖啡馆',theme:'发现变化 · 商量替代方案',hook:'野餐准备得差不多了，但咖啡馆今天出了点状况。',minutes:'约 6–9 分钟',x:59,y:83},
 {id:'workshop',title:'给阅读角做一盏灯',area:'手工坊',theme:'听懂顺序 · 搜集与组装',hook:'阅读角缺一盏灯。听 Alex 的委托，在手工坊找零件并组装。',minutes:'约 4–6 分钟',x:88,y:23},
 {id:'wish',title:'愿望树旁的空位',area:'中央庭院',theme:'认识新同学 · 邀请与介绍',hook:'Mia 把最后一片愿望叶留给了新同学。去图书馆认识他，听听他想学什么，再邀他回庭院挂上愿望。',minutes:'约 4–6 分钟',x:59,y:44}
];
export const progressKey='campus-quest-levels-v1';
export function readProgress(storage,difficulty=1){try{const raw=JSON.parse(storage.getItem(difficulty===2?progressKey+'-l2':progressKey)||'{}');return {completed:levels.filter(l=>Array.isArray(raw?.completed)&&raw.completed.includes(l.id)).map(l=>l.id)};}catch{return {completed:[]};}}
export function finishLevel(storage,id,difficulty=1){const p=readProgress(storage,difficulty);if(!levels.some(l=>l.id===id))return false;if(!p.completed.includes(id))p.completed.push(id);try{storage.setItem(difficulty===2?progressKey+'-l2':progressKey,JSON.stringify(p));return true;}catch{return false;}}
export function nextLevel(id,progress){const i=levels.findIndex(l=>l.id===id);return levels.slice(i+1).find(l=>!progress.completed.includes(l.id))||levels.find(l=>!progress.completed.includes(l.id))||null;}

export const levelStarts={wish:{x:5.4,z:10},workshop:{x:64,z:22},welcome:{x:1,z:4},science:{x:1,z:4},school:{x:42,z:25},restaurant:{x:0,z:39},picnic:{x:0,z:39},shopping:{x:25,z:38},directions:{x:54,z:31},weather:{x:-17,z:40},hobbies:{x:-19,z:18}};
