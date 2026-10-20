// 英语日常故事内容模块（standalone content module）
//
// stories[id]：每篇故事的「听说练习」数据（语言背包 / 教练讨论 / 线索手记 / 冒险回顾）。
// worlds[id]：每篇故事的「地图冒险」数据，参考 Pip 主线范式——
//   有地图、有教练(Nova)、有任务(steps)、有交互(asks)、有情节(resolve)。
//   坐标 x:0-1000, y:0-600；npcs 为场景人物；coach 为同行教练引导；
//   steps 为任务清单；npc.asks 为该人物处的交互（选择题或打字答），答对即完成对应 step。

const stories = {
  pip: {
    topic: '科技节与机器人',
    name: 'Pip',
    simple: [
      'At the school tech festival, a small robot named Pip goes missing. You ask friends around the campus. Mia says Pip was near the library. Later you find Pip behind the greenhouse, next to a flashing green button.',
      '在学校科技节上，一个叫 Pip 的小机器人不见了。你在校园里询问同学。Mia 说 Pip 曾在图书馆附近。后来你在温室后面、一个闪烁的绿色按钮旁找到了 Pip。'
    ],
    words: [
      'Missing means lost or not where it should be. Flashing means a light going on and off quickly.',
      'missing 是失踪、丢失；flashing 是闪烁（灯光快速忽明忽暗）。'
    ],
    terms: {
      missing: ['Missing means lost or not where it should be.', 'missing 表示失踪、找不到了。'],
      library: ['A library is a quiet place full of books.', 'library 是图书馆。'],
      greenhouse: ['A greenhouse is a glass building where plants grow.', 'greenhouse 是温室。'],
      button: ['A button is a small part you press, like on a toy.', 'button 是按钮，可以按压的小部件。']
    },
    check: [
      'What is missing, and where do you find Pip?',
      '什么不见了？你在哪里找到了 Pip？'
    ],
    answer: /\b(robot|pip|library|greenhouse|button|flashing|missing)\b|机器人|图书馆|温室|按钮|闪烁|后面|失踪|不见/,
    feedback: [
      'Yes! Pip the robot is missing, and you find it behind the greenhouse, next to a flashing green button. Great work!',
      '对！Pip 这个小机器人不见了，你在温室后面、一个闪烁的绿色按钮旁找到了它。太棒了！'
    ],
    wrong: [
      'Listen again: Pip the robot is missing. Mia saw it near the library. You find Pip behind the greenhouse, next to a flashing button. Try the check question.',
      '再听一次：Pip 机器人不见了。Mia 在图书馆附近看到它。你在温室后面、闪烁的按钮旁找到了 Pip。试着回答检查问题。'
    ]
  },

  school: {
    topic: '校园与课堂',
    name: 'Tom',
    simple: [
      'Tom forgot his maths book at home. At the break, he asks Lisa to borrow hers. Lisa says yes and lends it to him.',
      'Tom 把数学课本忘在家里了。课间他向 Lisa 借课本，Lisa 答应借给他。'
    ],
    words: [
      'Forgot means you did not remember something. Borrow means to take and use something, then give it back.',
      'forgot 是忘记；borrow 是借入，用完要归还。'
    ],
    terms: {
      forgot: ['Forgot means you did not remember something.', 'forgot 表示忘记。'],
      borrow: ['Borrow means take something and return it later.', 'borrow 表示借入、以后归还。'],
      lend: ['Lend means give something to someone for a while.', 'lend 表示把东西借给别人。'],
      break: ['Break is a short rest between classes.', 'break 是课间休息。']
    },
    check: [
      'What did Tom forget, and did Lisa lend it to him?',
      'Tom 忘了什么？Lisa 借给他了吗？'
    ],
    answer: /\b(book|maths|math|textbook)\b|课本|数学书|书/,
    feedback: [
      'Yes. Tom forgot his maths book and Lisa lent it to him. Great listening!',
      '对，Tom 忘了数学课本，Lisa 借给了他。你听得很准！'
    ],
    wrong: [
      'Listen again: Tom forgot his maths book and Lisa lent it to him. Now try the check question.',
      '再听一次：Tom 忘了数学课本，Lisa 借给了他。试着回答检查问题。'
    ]
  },

  restaurant: {
    topic: '餐厅点餐',
    name: 'Lily',
    simple: [
      'Lily goes to a café. She orders a chicken sandwich and says “no onions, please”. She also asks for a glass of water.',
      'Lily 来到一家咖啡馆。她点了一个鸡肉三明治，并说“请不要放洋葱”。她还点了一杯水。'
    ],
    words: [
      'Order means to ask for food in a shop or café. A sandwich is two pieces of bread with food inside.',
      'order 是点餐；sandwich 是三明治（两片面包夹食物）。'
    ],
    terms: {
      order: ['Order means to ask for food or a drink.', 'order 表示点餐。'],
      onion: ['An onion is a strong-tasting vegetable, often white or purple.', 'onion 是洋葱。'],
      water: ['A glass of water is a drink with no colour or taste.', 'a glass of water 是一杯水。'],
      sandwich: ['A sandwich is food between two pieces of bread.', 'sandwich 是夹在面包里的食物，即三明治。']
    },
    check: [
      'What did Lily order, and did she want onions?',
      'Lily 点了什么？她要洋葱吗？'
    ],
    answer: /\b(sandwich|chicken)\b|三明治|鸡肉/,
    feedback: [
      'Right. Lily ordered a chicken sandwich and asked for no onions. Well done!',
      '对，Lily 点了鸡肉三明治，并且不要洋葱。很好！'
    ],
    wrong: [
      'Listen again: Lily ordered a chicken sandwich with no onions, and a glass of water. Try the check question.',
      '再听一次：Lily 点了一份不要洋葱的鸡肉三明治和一杯水。试着回答检查问题。'
    ]
  },

  shopping: {
    topic: '购物',
    name: 'Jack',
    simple: [
      'Jack sees a blue cap in a shop. He asks the shop assistant how much it is. She says 25 yuan. Jack tries size M and it fits.',
      'Jack 在店里看到一顶蓝色帽子。他问店员多少钱，店员说 25 元。Jack 试了 M 码，很合适。'
    ],
    words: [
      'How much asks about the price. Size tells how big clothes or hats are. Fit means the right size for you.',
      'how much 问价格；size 是尺码；fit 表示合身。'
    ],
    terms: {
      cap: ['A cap is a soft hat with a curved part at the front.', 'cap 是前面有帽檐的帽子。'],
      'how much': ['We say “How much is it?” to ask the price.', '用 How much is it? 问价格。'],
      size: ['Size shows how big or small something is, like S, M, L.', 'size 表示尺码，如 S、M、L。'],
      fit: ['Fit means the clothes are the right size for you.', 'fit 表示衣服尺码正合适。']
    },
    check: [
      'What colour cap does Jack like, and how much is it?',
      'Jack 喜欢什么颜色的帽子？多少钱？'
    ],
    answer: /\b(blue|cap|25|twenty[- ]?five|yuan)\b|蓝色|帽子|25|元/,
    feedback: [
      'Yes. Jack likes the blue cap and it costs 25 yuan. Nice work!',
      '对，Jack 喜欢那顶蓝帽子，价格是 25 元。做得好！'
    ],
    wrong: [
      'Listen again: Jack likes a blue cap. It is 25 yuan and size M fits him. Try the check question.',
      '再听一次：Jack 喜欢一顶蓝帽子，25 元，M 码合身。试着回答检查问题。'
    ]
  },

  directions: {
    topic: '问路与出行',
    name: 'Anna',
    simple: [
      'Anna wants to visit the museum. She asks a man for help. He says: take Bus 5, get off at the library stop, and the museum is next to it.',
      'Anna 想去博物馆。她向一位男士问路。他说：坐 5 路公交，在图书馆站下车，博物馆就在旁边。'
    ],
    words: [
      'Get off means to leave a bus or train. Next to means very near, on the side of something.',
      'get off 是下车；next to 是在……旁边。'
    ],
    terms: {
      museum: ['A museum is a building where we see old or beautiful things.', 'museum 是博物馆。'],
      'get off': ['Get off means to leave a bus or train.', 'get off 表示下车。'],
      'next to': ['Next to means beside something, very close.', 'next to 表示在……旁边。'],
      bus: ['A bus is a big car that many people travel in.', 'bus 是公交车。']
    },
    check: [
      'Which bus should Anna take, and where does she get off?',
      'Anna 该坐几路公交？在哪站下车？'
    ],
    answer: /\b(bus|5|five|library)\b|5 路|公交|图书馆|下车/,
    feedback: [
      'Correct. Anna takes Bus 5 and gets off at the library stop. The museum is next to it.',
      '正确。Anna 坐 5 路公交，在图书馆站下车，博物馆就在旁边。'
    ],
    wrong: [
      'Listen again: take Bus 5, get off at the library stop, the museum is next to it. Try the check question.',
      '再听一次：坐 5 路，在图书馆站下车，博物馆在旁边。试着回答检查问题。'
    ]
  },

  weather: {
    topic: '天气与日常安排',
    name: 'Mary',
    simple: [
      'It is sunny on Saturday. Bob calls Mary and invites her to the park. Mary says yes, and asks to bring a kite.',
      '星期六天气晴朗。Bob 打电话邀请 Mary 去公园。Mary 答应了，还提出要带一只风筝。'
    ],
    words: [
      'Sunny means the sun is out and it is bright. Invite means to ask someone to come with you.',
      'sunny 是晴朗的；invite 是邀请。'
    ],
    terms: {
      sunny: ['Sunny means the sun is shining and the sky is clear.', 'sunny 表示阳光明媚、天气晴。'],
      invite: ['Invite means ask someone to join you.', 'invite 表示邀请。'],
      kite: ['A kite is a toy that flies in the wind.', 'kite 是风筝。'],
      park: ['A park is a green open place in a city.', 'park 是公园。']
    },
    check: [
      'What is the weather like, and what does Mary want to bring?',
      '天气怎么样？Mary 想带什么？'
    ],
    answer: /\b(sunny|park|kite)\b|晴天|公园|风筝/,
    feedback: [
      'Yes. It is sunny, and Mary wants to bring a kite to the park. Perfect!',
      '对，天气晴朗，Mary 想带一只风筝去公园。太棒了！'
    ],
    wrong: [
      'Listen again: it is sunny. Bob invites Mary to the park, and she wants to bring a kite. Try the check question.',
      '再听一次：天气晴朗，Bob 邀请 Mary 去公园，她想带风筝。试着回答检查问题。'
    ]
  },

  hobbies: {
    topic: '爱好与运动',
    name: 'Sue',
    simple: [
      'Tim’s favourite sport is swimming. He asks Sue to swim with him on Sunday. Sue likes basketball, but she says yes and wants to try swimming.',
      'Tim 最喜欢的运动是游泳。他约 Sue 周日一起去游泳。Sue 喜欢篮球，但她答应了，想试试游泳。'
    ],
    words: [
      'Favourite means the one you like best. Swimming is moving in water with your arms and legs.',
      'favourite 是最喜欢的；swimming 是游泳。'
    ],
    terms: {
      favourite: ['Favourite means the one you like most.', 'favourite 表示最喜欢的。'],
      swimming: ['Swimming is moving through water using your body.', 'swimming 是游泳。'],
      basketball: ['Basketball is a sport with a ball and two hoops.', 'basketball 是篮球。'],
      join: ['Join means take part with other people.', 'join 表示一起参加。']
    },
    check: [
      'What sport does Tim like, and does Sue like swimming?',
      'Tim 喜欢什么运动？Sue 喜欢游泳吗？'
    ],
    answer: /\b(swim|swimming)\b|游泳/,
    feedback: [
      'Right. Tim likes swimming. Sue likes basketball but will try swimming with him.',
      '对，Tim 喜欢游泳。Sue 喜欢篮球，但愿意试试游泳。'
    ],
    wrong: [
      'Listen again: Tim likes swimming and asks Sue to join. Sue likes basketball but says yes. Try the check question.',
      '再听一次：Tim 喜欢游泳并约 Sue，Sue 喜欢篮球但答应了。试着回答检查问题。'
    ]
  }
};

export const storyIds = Object.keys(stories);
export const storyList = storyIds.map(id => ({ id, topic: stories[id].topic, name: stories[id].name }));

// 与 discussClue 风格一致：处理“检查题 / 问词义 / 请再说一遍 / 答对了 / 答错”等分支。
// checking=true 时，用 answer 正则判定用户是否答对（排除否定词）。
export function discussStory(id, text, checking = false) {
  const d = stories[id];
  if (!d) return { en: 'No story here yet.', zh: '这里还没有故事。', checking: false };
  const t = text.toLowerCase();

  if (checking && !/意思|解释|听不懂|mean|explain|understand|why/.test(t)) {
    const negated = /\b(no|not|never|didn't|didn’t)\b|不是|没有|没/.test(t);
    const matches = d.answer.test(t) && !negated;
    const pair = matches ? d.feedback : (d.wrong || [d.simple[0] + ' ' + d.check[0], d.simple[1] + ' ' + d.check[1]]);
    return { en: pair[0], zh: pair[1], checking: !matches };
  }

  if (/检查|复述|check|test|quiz/.test(t)) return { en: d.check[0], zh: d.check[1], checking: true };

  const term = d.terms && Object.keys(d.terms).find(w => t.includes(w));
  if (term) return { en: d.terms[term][0], zh: d.terms[term][1], checking: false };

  if (/为什么|why/.test(t)) return {
    en: 'This story shows one small moment in daily life. What did you hear about the people?',
    zh: '这个故事展示了日常生活中的一个小片段。你从人物身上听到了什么？'
  };

  if (/词|意思|mean|word|vocab/.test(t)) return { en: d.words[0], zh: d.words[1], checking: false };

  if (/听不懂|不明白|讨论|解释|换|简单|detail|explain|understand|simpl|rephrase|said|say/.test(t))
    return { en: d.simple[0], zh: d.simple[1], checking: false };

  return {
    en: 'Stay with ' + d.name + '’s story. Ask about a word, ask me to say it again, or try the check question.',
    zh: '我们继续看 ' + d.name + ' 的故事。可以问词义、请我再说一遍，或回答问题。',
    checking: false
  };
}

// ===== 地图冒险数据（参考 Pip 主线：地图 + 教练 + 任务 + 交互 + 情节）=====
// coach     : 同行教练 Nova 的引导（开场 intro + 逐步提示 hints）
// steps     : 任务清单，按顺序完成；npc.asks 答对即点亮对应 step
// npcs      : 场景人物，meet 为旁白/对话，asks 为交互（choices 选择题 或 expect 打字答）
// resolve   : 所有任务完成后触发的情节收尾
export const worlds = {
  pip: { scene:'campus', goal:{en:'Walk around the campus and ask friends about the missing Pip.', zh:'在校园里询问同学，找到走失的 Pip。'},
    npcs:[
      {id:'mia', name:'Mia', icon:'👩‍💼', x:140, y:300, meet:{en:'Pip is a small white robot with a blue light. Ask Ben at the library.', zh:'Pip 是白色小机器人，有一盏蓝灯。去图书馆问问 Ben。'}},
      {id:'ben', name:'Ben', icon:'👨‍🏫', x:430, y:250, meet:{en:'Pip went past the library, towards the art room.', zh:'Pip 经过图书馆，朝美术教室走去。'}},
      {id:'amy', name:'Amy', icon:'👩‍🎨', x:790, y:300, meet:{en:'We carried a shiny decoration to the greenhouse. Pip followed us!', zh:'我们把闪亮的装饰物搬到温室，Pip 跟着我们！'}},
      {id:'leo', name:'Leo', icon:'👨‍🔧', x:660, y:420, meet:{en:'The record says blue light flashing. Pip flashes blue when it follows bright things.', zh:'记录显示蓝灯闪烁。Pip 追随明亮的东西时会闪蓝灯。'}},
      {id:'pip', name:'Pip', icon:'🤖', x:500, y:140, meet:{en:'You found me! Thank you for your help!', zh:'你找到我了！谢谢你的帮助！'}}
    ]},

  school: { scene:'classroom', goal:{en:'Help Tom borrow Lisa’s maths book during the break.', zh:'课间帮 Tom 向 Lisa 借到数学课本。'},
    coach:{ name:'Nova', icon:'👩🏻‍🚀',
      intro:{en:'Tom forgot his maths book at home. Your job: help him borrow Lisa’s book politely, then say thanks.', zh:'Tom 把数学课本忘在家里了。你的任务：帮他礼貌地向 Lisa 借书，再替他说声谢谢。'},
      hints:[ {en:'First, walk to Tom and find out what he needs.', zh:'先走到 Tom 身边，听清他需要什么。'},
              {en:'At Lisa, use “Can I borrow … please?” to ask nicely.', zh:'到 Lisa 身边，用 “Can I borrow … please?” 礼貌开口。'},
              {en:'When Lisa says yes, help Tom say “Thank you! I will give it back.”', zh:'Lisa 答应后，帮 Tom 说 “Thank you! I will give it back.”'} ] },
    steps:[ {id:'tom',label:'听 Tom 的困难',icon:'🧒'}, {id:'borrow',label:'帮 Tom 向 Lisa 借书',icon:'📚'}, {id:'thanks',label:'Tom 道谢',icon:'🙏'} ],
    npcs:[
      {id:'tom', name:'Tom', icon:'🧒', x:300, y:250, step:'tom',
        meet:{en:'I forgot my maths book at home. Can I sit with you, Lisa?', zh:'我把数学课本忘在家里了。Lisa，我能和你坐一起吗？'},
        asks:[ {q:{en:'Tom 遇到了什么麻烦？', zh:'Tom 遇到了什么麻烦？'},
          choices:[ {text:'他把数学课本忘在家里了', reply:{en:'Right, he forgot his maths book.', zh:'对，他忘了数学课本。'}, correct:true, step:'tom'},
                    {text:'他没带午餐', reply:{en:'No, it is about a book, not lunch.', zh:'不对，是书的问题，不是午餐。'}, correct:false} ] } ] },
      {id:'lisa', name:'Lisa', icon:'👧', x:700, y:380, step:'borrow',
        meet:{en:'Sure! Here is my maths book. You can borrow it.', zh:'当然！这是我的数学课本，借给你吧。'},
        asks:[
          {q:{en:'帮 Tom 向 Lisa 借书，怎么说最礼貌？', zh:'帮 Tom 向 Lisa 借书，怎么说最礼貌？'},
            choices:[ {text:'Can I borrow your maths book, please?', reply:{en:'Of course! Here you are.', zh:'当然！给你。'}, correct:true, step:'borrow'},
                      {text:'Give me your book.', reply:{en:'That sounds rude. Try “Can I borrow … please?”.', zh:'这样太不礼貌了。试试 “Can I borrow … please?”。'}, correct:false} ] },
          {q:{en:'Lisa 借出了课本，Tom 该怎么说？', zh:'Lisa 借出了课本，Tom 该怎么说？'},
            choices:[ {text:'Thank you! I will give it back tomorrow.', reply:{en:'You are welcome!', zh:'不客气！'}, correct:true, step:'thanks'},
                      {text:'It is mine now.', reply:{en:'That is not polite. Say thank you and promise to return it.', zh:'这样不礼貌。应该说谢谢并答应归还。'}, correct:false} ] } ] }
    ],
    resolve:{en:'Great! Tom borrowed the maths book and said thanks. Class can begin.', zh:'太好了！Tom 借到了数学课本并道了谢，上课没问题了。'} },

  restaurant: { scene:'cafe', goal:{en:'Help Lily order her food at the cafe.', zh:'在咖啡馆帮 Lily 点好她想吃的餐。'},
    coach:{ name:'Nova', icon:'👩🏻‍🚀',
      intro:{en:'Lily wants to order but is shy in English. Help her tell the waiter: a chicken sandwich, no onions, and a glass of water.', zh:'Lily 想点餐但不太敢说英语。你帮她告诉服务员：鸡肉三明治、不要洋葱、再加一杯水。'},
      hints:[ {en:'First, listen to Lily — what does she want?', zh:'先听 Lily 说，她想点什么？'},
              {en:'At the waiter, say the order clearly: sandwich, no onions, water.', zh:'到服务员面前，清楚地说出：三明治、不要洋葱、水。'},
              {en:'Confirm: “No onions, please.” so the order is right.', zh:'确认一句 “No onions, please.”，保证订单没错。'} ] },
    steps:[ {id:'lily',label:'听 Lily 想点什么',icon:'🗣'}, {id:'order',label:'帮 Lily 点餐',icon:'🍽'}, {id:'confirm',label:'确认订单',icon:'✅'} ],
    npcs:[
      {id:'lily', name:'Lily', icon:'👩', x:300, y:250, step:'lily',
        meet:{en:'I’d like a chicken sandwich, no onions please, and a glass of water.', zh:'我想要一个鸡肉三明治，请不要放洋葱，再来一杯水。'},
        asks:[ {q:{en:'Lily 想点什么？', zh:'Lily 想点什么？'},
          choices:[ {text:'鸡肉三明治（不要洋葱）+ 一杯水', reply:{en:'Yes! A chicken sandwich, no onions, and water.', zh:'对！鸡肉三明治不要洋葱，再加一杯水。'}, correct:true, step:'lily'},
                    {text:'牛肉汉堡 + 可乐', reply:{en:'No, Lily wants a chicken sandwich, no onions, and water.', zh:'不对，Lily 要的是鸡肉三明治、不要洋葱、一杯水。'}, correct:false} ] } ] },
      {id:'waiter', name:'Waiter', icon:'🧑‍🍳', x:700, y:380, step:'order',
        meet:{en:'Welcome! What would you like to order?', zh:'欢迎光临！您想点些什么？'},
        asks:[
          {q:{en:'帮 Lily 点餐，怎么说？', zh:'帮 Lily 点餐，怎么说？'},
            choices:[ {text:'A chicken sandwich, no onions, and a glass of water.', reply:{en:'Got it — chicken sandwich, no onions, and water.', zh:'收到——鸡肉三明治、不要洋葱、一杯水。'}, correct:true, step:'order'},
                      {text:'A beef burger and a cola.', reply:{en:'That is not what Lily wanted. Try the chicken sandwich, no onions, water.', zh:'那不是 Lily 想要的。试试鸡肉三明治、不要洋葱、水。'}, correct:false} ] },
          {q:{en:'服务员准备下单，确认一下：要洋葱吗？', zh:'服务员准备下单，确认一下：要洋葱吗？'},
            choices:[ {text:'No onions, please.', reply:{en:'Perfect, no onions. Your order is set!', zh:'好的，不要洋葱。订单确认！'}, correct:true, step:'confirm'},
                      {text:'Yes, onions.', reply:{en:'Lily asked for no onions. Say “No onions, please.”', zh:'Lily 说了不要洋葱。请说 “No onions, please.”。'}, correct:false} ] } ] }
    ],
    resolve:{en:'Order up! Lily’s chicken sandwich, no onions, and a glass of water. Enjoy your meal!', zh:'出餐啦！Lily 的鸡肉三明治（不要洋葱）和一杯水。用餐愉快！'} },

  shopping: { scene:'shop', goal:{en:'Help Jack find the blue cap, learn the price, and try it on.', zh:'帮 Jack 找到蓝帽子、问清价格并试戴。'},
    coach:{ name:'Nova', icon:'👩🏻‍🚀',
      intro:{en:'Jack likes a blue cap. Help him ask the price in English, then try size M and say it fits.', zh:'Jack 喜欢一顶蓝帽子。你帮他用地道英语问价格，再试 M 码并说合身。'},
      hints:[ {en:'Listen to Jack — what does he like?', zh:'先听 Jack 说，他看中了什么？'},
              {en:'Ask the assistant: “How much is the blue cap?”', zh:'问店员：“How much is the blue cap?”'},
              {en:'After trying size M, say “Size M fits me well.”', zh:'试过 M 码后，说 “Size M fits me well.”'} ] },
    steps:[ {id:'jack',label:'听 Jack 看中什么',icon:'🧒'}, {id:'price',label:'问清价格',icon:'💰'}, {id:'size',label:'试戴并确认合身',icon:'👒'} ],
    npcs:[
      {id:'jack', name:'Jack', icon:'🧒', x:300, y:250, step:'jack',
        meet:{en:'I like this blue cap. How much is it?', zh:'我喜欢这顶蓝帽子。多少钱呢？'},
        asks:[ {q:{en:'Jack 看中了什么？', zh:'Jack 看中了什么？'},
          choices:[ {text:'一顶蓝色帽子', reply:{en:'Yes, a blue cap!', zh:'对，一顶蓝帽子！'}, correct:true, step:'jack'},
                    {text:'一双蓝色球鞋', reply:{en:'No, it is a cap, not shoes.', zh:'不对，是帽子不是鞋。'}, correct:false} ] } ] },
      {id:'assistant', name:'Shop assistant', icon:'🧑‍💼', x:700, y:380, step:'price',
        meet:{en:'This blue cap is 25 yuan. Would you like to try size M?', zh:'这顶蓝帽子 25 元。要试一下 M 码吗？'},
        asks:[
          {q:{en:'帮 Jack 问价格，怎么说？', zh:'帮 Jack 问价格，怎么说？'},
            choices:[ {text:'How much is the blue cap?', reply:{en:'It is 25 yuan.', zh:'25 元。'}, correct:true, step:'price'},
                      {text:'I want to buy it.', reply:{en:'First ask the price: “How much is the blue cap?”', zh:'先问价格：“How much is the blue cap?”'}, correct:false} ] },
          {q:{en:'Jack 试了 M 码，怎么确认合身？', zh:'Jack 试了 M 码，怎么确认合身？'},
            choices:[ {text:'Size M fits me well.', reply:{en:'Great choice! It suits you.', zh:'选得好！很适合你。'}, correct:true, step:'size'},
                      {text:'It is too small.', reply:{en:'M is too small? Try L, or say it fits if it is right.', zh:'M 太小？可以试 L，或者合适就说合身。'}, correct:false} ] } ] }
    ],
    resolve:{en:'Jack buys the blue cap for 25 yuan. Size M fits perfectly!', zh:'Jack 花 25 元买下蓝帽子，M 码刚刚好！'} },

  directions: { scene:'street', goal:{en:'Help Anna ask the way to the museum.', zh:'帮 Anna 问清去博物馆的路。'},
    coach:{ name:'Nova', icon:'👩🏻‍🚀',
      intro:{en:'Anna wants to visit the museum but is lost. Help her ask a passer-by for directions, then repeat the route to confirm.', zh:'Anna 想去博物馆但不认路。你帮她向路人问路，再复述路线确认听懂了。'},
      hints:[ {en:'Listen to Anna — where does she want to go?', zh:'先听 Anna 说，她要去哪儿？'},
              {en:'Ask Mr. Chen: “Excuse me, how can I get to the museum?”', zh:'问陈先生：“Excuse me, how can I get to the museum?”'},
              {en:'Repeat the route: Bus 5, get off at the library stop.', zh:'复述路线：坐 5 路，在图书馆站下车。'} ] },
    steps:[ {id:'anna',label:'听 Anna 想去哪',icon:'👩'}, {id:'way',label:'向路人问路',icon:'🧭'}, {id:'repeat',label:'复述路线确认',icon:'🗺'} ],
    npcs:[
      {id:'anna', name:'Anna', icon:'👩', x:300, y:250, step:'anna',
        meet:{en:'I want to visit the museum. Could you tell me the way?', zh:'我想去博物馆，能告诉我怎么走吗？'},
        asks:[ {q:{en:'Anna 想去哪里？', zh:'Anna 想去哪里？'},
          choices:[ {text:'博物馆', reply:{en:'Yes, the museum!', zh:'对，博物馆！'}, correct:true, step:'anna'},
                    {text:'图书馆', reply:{en:'No, she wants the museum, not the library.', zh:'不对，她要去博物馆，不是图书馆。'}, correct:false} ] } ] },
      {id:'chen', name:'Mr. Chen', icon:'🧓', x:700, y:380, step:'way',
        meet:{en:'Take Bus 5, get off at the library stop. The museum is next to it.', zh:'坐 5 路公交，在图书馆站下车，博物馆就在旁边。'},
        asks:[
          {q:{en:'帮 Anna 问去博物馆的路，怎么说？', zh:'帮 Anna 问去博物馆的路，怎么说？'},
            choices:[ {text:'Excuse me, how can I get to the museum?', reply:{en:'Take Bus 5, get off at the library stop.', zh:'坐 5 路，在图书馆站下车。'}, correct:true, step:'way'},
                      {text:'Where is the bus?', reply:{en:'Ask for the museum: “how can I get to the museum?”', zh:'要问博物馆：“how can I get to the museum?”'}, correct:false} ] },
          {q:{en:'复述一下路线，确认你听懂了？', zh:'复述一下路线，确认你听懂了？'},
            choices:[ {text:'坐 5 路公交，图书馆站下车，博物馆在旁边', reply:{en:'Exactly right! You understood perfectly.', zh:'完全正确！你听得很准。'}, correct:true, step:'repeat'},
                      {text:'坐 5 路到公园', reply:{en:'Not the park — get off at the library stop, museum next to it.', zh:'不是公园——在图书馆站下车，博物馆在旁边。'}, correct:false} ] } ] }
    ],
    resolve:{en:'Anna now knows: Bus 5, library stop, museum next door. Off she goes!', zh:'Anna 现在知道了：5 路公交、图书馆站下车、博物馆就在旁边。出发吧！'} },

  weather: { scene:'park', goal:{en:'Help Bob invite Mary to the park and bring a kite.', zh:'帮 Bob 邀请 Mary 去公园，并带上风筝。'},
    coach:{ name:'Nova', icon:'👩🏻‍🚀',
      intro:{en:'It is sunny. Bob wants to invite Mary to the park and fly a kite. Help him invite her in English, then confirm the kite.', zh:'天气晴朗。Bob 想邀请 Mary 去公园放风筝。你帮他用英语邀请，再确认带上风筝。'},
      hints:[ {en:'Listen to Bob — what is the plan?', zh:'先听 Bob 说，他的打算是什么？'},
              {en:'Invite Mary: “Would you like to go to the park with me?”', zh:'邀请 Mary：“Would you like to go to the park with me?”'},
              {en:'Mary wants a kite — confirm “Let’s bring a kite.”', zh:'Mary 想带风筝——确认 “Let’s bring a kite.”'} ] },
    steps:[ {id:'bob',label:'听 Bob 的打算',icon:'🧑'}, {id:'invite',label:'帮 Bob 邀请 Mary',icon:'☀️'}, {id:'kite',label:'确认带风筝',icon:'🪁'} ],
    npcs:[
      {id:'bob', name:'Bob', icon:'🧑', x:300, y:250, step:'bob',
        meet:{en:'It is sunny. Mary, would you like to go to the park with me?', zh:'天气晴朗。Mary，和我一起去公园好吗？'},
        asks:[ {q:{en:'天气怎样？Bob 想做什么？', zh:'天气怎样？Bob 想做什么？'},
          choices:[ {text:'晴天，约去公园', reply:{en:'Yes, a sunny-day park trip!', zh:'对，晴天去公园！'}, correct:true, step:'bob'},
                    {text:'下雨，待在家', reply:{en:'No, it is sunny, not rainy.', zh:'不对，是晴天不是雨天。'}, correct:false} ] } ] },
      {id:'mary', name:'Mary', icon:'👧', x:700, y:380, step:'invite',
        meet:{en:'Yes! Let us bring a kite to the park.', zh:'好呀！我们带一只风筝去公园吧。'},
        asks:[
          {q:{en:'帮 Bob 邀请 Mary，怎么说？', zh:'帮 Bob 邀请 Mary，怎么说？'},
            choices:[ {text:'Mary, would you like to go to the park with me?', reply:{en:'Sure! I’d love to.', zh:'好呀！我很乐意。'}, correct:true, step:'invite'},
                      {text:'Mary, go home.', reply:{en:'That is not an invitation. Try “Would you like to go … with me?”', zh:'那不是邀请。试试 “Would you like to go … with me?”'}, correct:false} ] },
          {q:{en:'Mary 想带什么？你帮 Bob 确认。', zh:'Mary 想带什么？你帮 Bob 确认。'},
            choices:[ {text:'带一只风筝', reply:{en:'Great, a kite for the windy park!', zh:'太好了，公园有风正适合放风筝！'}, correct:true, step:'kite'},
                      {text:'带一本书', reply:{en:'Mary wants a kite, not a book.', zh:'Mary 想带风筝，不是书。'}, correct:false} ] } ] }
    ],
    resolve:{en:'Mary said yes. Sunny park, a kite, and good friends — perfect!', zh:'Mary 答应了。晴朗的公园、一只风筝、好朋友——完美！'} },

  hobbies: { scene:'sports', goal:{en:'Help Tim invite Sue to swim together on Sunday.', zh:'帮 Tim 约 Sue 周日一起去游泳。'},
    coach:{ name:'Nova', icon:'👩🏻‍🚀',
      intro:{en:'Tim’s favourite sport is swimming. He wants to invite Sue on Sunday. Help him invite her, even though she likes basketball.', zh:'Tim 最喜欢游泳，想约 Sue 周日一起。你帮他用英语邀请，尽管 Sue 喜欢篮球。'},
      hints:[ {en:'Listen to Tim — what sport does he love?', zh:'先听 Tim 说，他最喜欢什么运动？'},
              {en:'Invite Sue: “Would you like to swim with me on Sunday?”', zh:'邀请 Sue：“Would you like to swim with me on Sunday?”'},
              {en:'Sue likes basketball but will try — confirm she says yes.', zh:'Sue 喜欢篮球但愿意尝试——确认她答应了。'} ] },
    steps:[ {id:'tim',label:'听 Tim 的爱好',icon:'🧒'}, {id:'invite',label:'帮 Tim 邀请 Sue',icon:'🏊'}, {id:'join',label:'Sue 答应尝试',icon:'🤝'} ],
    npcs:[
      {id:'tim', name:'Tim', icon:'🧒', x:300, y:250, step:'tim',
        meet:{en:'My favourite sport is swimming. Will you swim with me on Sunday?', zh:'我最喜欢游泳。周日你愿意和我一起去游吗？'},
        asks:[ {q:{en:'Tim 最喜欢什么运动？', zh:'Tim 最喜欢什么运动？'},
          choices:[ {text:'游泳', reply:{en:'Yes, swimming!', zh:'对，游泳！'}, correct:true, step:'tim'},
                    {text:'篮球', reply:{en:'No, Tim likes swimming, not basketball.', zh:'不对，Tim 喜欢游泳不是篮球。'}, correct:false} ] } ] },
      {id:'sue', name:'Sue', icon:'👧', x:700, y:380, step:'invite',
        meet:{en:'I like basketball, but I will try swimming with you!', zh:'我喜欢篮球，不过我愿意和你试试游泳！'},
        asks:[
          {q:{en:'帮 Tim 邀请 Sue，怎么说？', zh:'帮 Tim 邀请 Sue，怎么说？'},
            choices:[ {text:'Sue, would you like to swim with me on Sunday?', reply:{en:'I like basketball, but I will try!', zh:'我喜欢篮球，不过我愿意试试！'}, correct:true, step:'invite'},
                      {text:'Sue, play basketball.', reply:{en:'Tim wants to swim, not play basketball. Invite her to swim.', zh:'Tim 想游泳不是打篮球。邀请她去游泳。'}, correct:false} ] },
          {q:{en:'Sue 喜欢篮球，但她愿意怎样？', zh:'Sue 喜欢篮球，但她愿意怎样？'},
            choices:[ {text:'愿意试试游泳', reply:{en:'Wonderful! See you on Sunday.', zh:'太好了！周日见。'}, correct:true, step:'join'},
                      {text:'拒绝了他', reply:{en:'No, Sue says yes to trying swimming.', zh:'不对，Sue 答应尝试游泳。'}, correct:false} ] } ] }
    ],
    resolve:{en:'Sue said yes to swimming. Sunday swim, here we come!', zh:'Sue 答应去游泳了。周日泳池见！'} }
};

export { stories };
