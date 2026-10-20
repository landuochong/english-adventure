// 英语日常故事内容模块（standalone content module）
//
// 数据结构沿用 guidance.js 中的 `discussions` 形态，便于日后接入 App：
//   id:        故事键
//   topic:     主题分类（中文）
//   name:      故事里的关键人物，用于“和教练讨论”时的称呼
//   simple:    [英文叙述, 中文叙述] —— 短小的日常生活片段
//   words:     [英文释义, 中文释义] —— 2 个重点词/短语
//   terms:     { 词: [英文, 中文] } —— 可在对话中追问的词汇表（可选）
//   check:     [英文问题, 中文问题] —— 理解检查题
//   answer:    正则 —— 匹配“答对了”的关键词
//   feedback:  [英文, 中文] —— 答对时的鼓励
//   wrong:     [英文, 中文] —— 答错时再听一次的提示（可选）
//
// discussStory(id, text, checking) 与 discussClue 风格一致，但不含 mission 门控，
// 可直接用于“日常故事”练习模式。

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
    name: 'Waiter',
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
    name: 'Shop assistant',
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
    name: 'Mr. Chen',
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

// 每篇故事的可探索场景：在校园/教室/咖啡馆/商店/街道/公园里走动，走近人物对话，收集线索。
// 集齐所有人物线索即完成本次冒险。坐标 x:0-1000, y:0-600。
export const worlds = {
  pip: { scene:'campus', goal:{en:'Walk around the campus and ask friends about the missing Pip.', zh:'在校园里询问同学，找到走失的 Pip。'},
    npcs:[
      {id:'mia', name:'Mia', icon:'👩‍💼', x:140, y:300, line:['Pip is a small white robot with a blue light. Ask Ben at the library.','Pip 是白色小机器人，有一盏蓝灯。去图书馆问问 Ben。']},
      {id:'ben', name:'Ben', icon:'👨‍🏫', x:430, y:250, line:['Pip went past the library, towards the art room.','Pip 经过图书馆，朝美术教室走去。']},
      {id:'amy', name:'Amy', icon:'👩‍🎨', x:790, y:300, line:['We carried a shiny decoration to the greenhouse. Pip followed us!','我们把闪亮的装饰物搬到温室，Pip 跟着我们！']},
      {id:'leo', name:'Leo', icon:'👨‍🔧', x:660, y:420, line:['The record says blue light flashing. Pip flashes blue when it follows bright things.','记录显示蓝灯闪烁。Pip 追随明亮的东西时会闪蓝灯。']},
      {id:'pip', name:'Pip', icon:'🤖', x:500, y:140, line:['You found me! Thank you for your help!','你找到我了！谢谢你的帮助！']}
    ]},
  school: { scene:'classroom', goal:{en:'Talk to Tom and Lisa about the maths book Tom forgot.', zh:'和 Tom、Lisa 聊聊 Tom 忘带的数学课本。'},
    npcs:[
      {id:'tom', name:'Tom', icon:'🧒', x:300, y:250, line:['I forgot my maths book at home. Can I borrow yours, Lisa?','我把数学课本忘在家里了。Lisa，能借你的给我吗？']},
      {id:'lisa', name:'Lisa', icon:'👧', x:700, y:380, line:['Sure! Here is my maths book. You can borrow it.','当然！这是我的数学课本，借给你吧。']}
    ]},
  restaurant: { scene:'cafe', goal:{en:'Help Lily order her food at the cafe.', zh:'在咖啡馆帮 Lily 点餐。'},
    npcs:[
      {id:'waiter', name:'Waiter', icon:'🧑‍🍳', x:280, y:240, line:['Welcome! What would you like to order?','欢迎光临！您想点些什么？']},
      {id:'lily', name:'Lily', icon:'👩', x:700, y:360, line:['A chicken sandwich, no onions please, and a glass of water.','一个鸡肉三明治，请不要放洋葱，再来一杯水。']}
    ]},
  shopping: { scene:'shop', goal:{en:'Find the blue cap and learn its price.', zh:'找到那顶蓝帽子，了解它的价格。'},
    npcs:[
      {id:'assistant', name:'Shop assistant', icon:'🧑‍💼', x:300, y:240, line:['This blue cap is 25 yuan. Would you like to try size M?','这顶蓝帽子 25 元。要试一下 M 码吗？']},
      {id:'jack', name:'Jack', icon:'🧒', x:700, y:360, line:['I like this blue cap. Size M fits me well.','我喜欢这顶蓝帽子，M 码我戴着正合适。']}
    ]},
  directions: { scene:'street', goal:{en:'Ask the way to the museum.', zh:'问去博物馆的路。'},
    npcs:[
      {id:'chen', name:'Mr. Chen', icon:'🧓', x:300, y:250, line:['Take Bus 5, get off at the library stop. The museum is next to it.','坐 5 路公交，在图书馆站下车，博物馆就在旁边。']},
      {id:'anna', name:'Anna', icon:'👩', x:680, y:380, line:['I want to visit the museum. Could you tell me the way?','我想去博物馆，能告诉我怎么走吗？']}
    ]},
  weather: { scene:'park', goal:{en:'Plan a sunny-day outing with friends.', zh:'和朋友们计划一个晴天出游。'},
    npcs:[
      {id:'bob', name:'Bob', icon:'🧑', x:300, y:250, line:['It is sunny. Would you like to go to the park with me, Mary?','天气晴朗。Mary，和我一起去公园好吗？']},
      {id:'mary', name:'Mary', icon:'👧', x:680, y:380, line:['Yes! Let us bring a kite to the park.','好呀！我们带一只风筝去公园吧。']}
    ]},
  hobbies: { scene:'sports', goal:{en:'Invite a friend to swim together.', zh:'约朋友一起去游泳。'},
    npcs:[
      {id:'tim', name:'Tim', icon:'🧒', x:300, y:250, line:['My favourite sport is swimming. Will you swim with me on Sunday?','我最喜欢的运动是游泳。周日你愿意和我一起去游吗？']},
      {id:'sue', name:'Sue', icon:'👧', x:680, y:380, line:['I like basketball, but I will try swimming with you!','我喜欢篮球，不过我愿意和你试试游泳！']}
    ]}
};

export { stories };
