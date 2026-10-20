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
      break: ['Break is a short rest between classes.', 'break 是课间休息。'],
      thank: ['Thank means to say you are grateful.', 'thank 表示感谢、道谢。'],
      tomorrow: ['Tomorrow is the day after today.', 'tomorrow 表示明天。']
    },
    scenes: [
      {
        title: '第 1 幕 · 课本不见了',
        icon: '🎒',
        narration: [
          'It is the morning break. Tom opens his bag and looks inside. His maths book is not there. He left it at home. The maths class starts in five minutes.',
          '课间休息时，Tom 打开书包翻找。数学课本不在里面——他把它忘在家里了。还有五分钟就要上数学课。'
        ],
        words: ['forgot', 'break'],
        interactions: [
          {
            type: 'choose',
            prompt: ['What is Tom’s problem?', 'Tom 遇到了什么麻烦？'],
            options: [
              { en: 'He forgot his maths book at home.', zh: '他把数学课本忘在家里了。', right: true, reply: ['Yes! Tom forgot his maths book at home.', '对！Tom 把数学课本忘在家里了。'] },
              { en: 'He lost his pencil case.', zh: '他丢了笔袋。', reply: ['Not quite. Listen again: his maths book is not in his bag.', '不完全对。再听一次：他的数学课本不在书包里。'] },
              { en: 'He is late for school.', zh: '他上学迟到了。', reply: ['Not quite. The problem is the missing maths book.', '不完全对。问题在于数学课本不见了。'] }
            ]
          }
        ]
      },
      {
        title: '第 2 幕 · 向 Lisa 开口',
        icon: '🙋',
        narration: [
          'Tom sees his classmate Lisa. Her maths book is on the desk. Tom thinks: maybe I can borrow it. But he must ask politely.',
          'Tom 看到同学 Lisa。她的数学课本在桌上。Tom 想：也许我能借来用一下。但他必须礼貌地开口。'
        ],
        words: ['borrow', 'lend'],
        interactions: [
          {
            type: 'speak',
            prompt: ['Help Tom ask Lisa politely.', '帮 Tom 礼貌地向 Lisa 借课本。'],
            model: 'Can I borrow your maths book, please?',
            match: /borrow|lend|book/i,
            reply: ['Yes, of course. Here you are.', '当然可以，给你。'],
            wrong: ['Try using "borrow": Can I borrow your maths book, please?', '试试用 borrow 来问：Can I borrow your maths book, please?']
          },
          {
            type: 'choose',
            prompt: ['Does Lisa lend the book to Tom?', 'Lisa 把课本借给 Tom 了吗？'],
            options: [
              { en: 'Yes, she lends it to him.', zh: '是的，她借给他了。', right: true, reply: ['Yes! Lisa lends Tom her maths book.', '对！Lisa 把数学课本借给了 Tom。'] },
              { en: 'No, she says no.', zh: '没有，她拒绝了。', reply: ['Not quite. Listen again: Lisa is happy to help.', '不完全对。再听一次：Lisa 很乐意帮忙。'] }
            ]
          }
        ]
      },
      {
        title: '第 3 幕 · 道谢与归还',
        icon: '🤝',
        narration: [
          'Lisa lends Tom her maths book. Tom says thank you and promises to give it back tomorrow. Lisa smiles: "Don’t forget again!" They both laugh.',
          'Lisa 把数学课本借给 Tom。Tom 道谢，并承诺明天归还。Lisa 笑着说：“别再忘了！”两人都笑了。'
        ],
        words: ['lend', 'thank', 'tomorrow'],
        interactions: [
          {
            type: 'speak',
            prompt: ['How does Tom thank Lisa?', 'Tom 该怎么感谢 Lisa？'],
            model: 'Thank you! I will give it back tomorrow.',
            match: /thank|thanks|give.*back|return/i,
            reply: ['You are welcome. See you tomorrow!', '不客气，明天见！'],
            wrong: ['Start with "Thank you", then say when you will give it back.', '用 Thank you 开头，再说什么时候归还。']
          },
          {
            type: 'choose',
            prompt: ['When will Tom give the book back?', 'Tom 什么时候归还课本？'],
            options: [
              { en: 'Tomorrow.', zh: '明天。', right: true, reply: ['Yes! He will give it back tomorrow.', '对！他明天归还。'] },
              { en: 'Next week.', zh: '下星期。', reply: ['Not quite. Listen again: he promises to give it back tomorrow.', '不完全对。再听一次：他承诺明天归还。'] },
              { en: 'He never gives it back.', zh: '他再也不还了。', reply: ['Not quite. Borrow means you must give it back.', '不完全对。borrow 借入是要归还的。'] }
            ]
          }
        ]
      }
    ],
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
    scenes: [
      {
        title: '第 1 幕 · 坐下点餐',
        icon: '🍽️',
        narration: [
          'Lily sits down at a table in the café. A waiter comes with a smile: "Welcome! What would you like to order?" Lily is hungry and looks at the menu.',
          'Lily 在咖啡馆坐下。服务员微笑着走来：“欢迎光临！您想点些什么？”Lily 有点饿，看看菜单。'
        ],
        words: ['order', 'sandwich'],
        interactions: [
          {
            type: 'speak',
            prompt: ['Help Lily tell the waiter what she wants.', '帮 Lily 告诉服务员她想吃什么。'],
            model: 'I would like a chicken sandwich, please.',
            match: /chicken|sandwich|would like|order/i,
            reply: ['Good choice. Anything to drink?', '好选择。要喝的吗？'],
            wrong: ['Try: I would like a chicken sandwich, please.', '试试这样说：I would like a chicken sandwich, please.']
          },
          {
            type: 'choose',
            prompt: ['What sandwich does Lily want?', 'Lily 想要什么三明治？'],
            options: [
              { en: 'A chicken sandwich.', zh: '鸡肉三明治。', right: true, reply: ['Yes! She orders a chicken sandwich.', '对！她点了鸡肉三明治。'] },
              { en: 'A beef sandwich.', zh: '牛肉三明治。', reply: ['Not quite. Listen again: it is a chicken sandwich.', '不完全对。再听一次：是鸡肉三明治。'] },
              { en: 'An egg sandwich.', zh: '鸡蛋三明治。', reply: ['Not quite. The sandwich is made with chicken.', '不完全对。三明治夹的是鸡肉。'] }
            ]
          }
        ]
      },
      {
        title: '第 2 幕 · 特别要求',
        icon: '🧅',
        narration: [
          'The waiter writes down the order. Lily remembers: she does not like onions. She says politely: "No onions, please." Then she asks for a glass of water.',
          '服务员记下订单。Lily 想起来：她不喜欢洋葱。她礼貌地说：“请不要放洋葱。”然后又要了一杯水。'
        ],
        words: ['onion', 'water'],
        interactions: [
          {
            type: 'choose',
            prompt: ['What does Lily NOT want in her sandwich?', 'Lily 不要三明治里放什么？'],
            options: [
              { en: 'Onions.', zh: '洋葱。', right: true, reply: ['Right. She says: no onions, please.', '对。她说：请不要放洋葱。'] },
              { en: 'Cheese.', zh: '奶酪。', reply: ['Not quite. Listen again: she says no onions.', '不完全对。再听一次：她说不要洋葱。'] },
              { en: 'Tomatoes.', zh: '西红柿。', reply: ['Not quite. The problem is with onions.', '不完全对。问题出在洋葱上。'] }
            ]
          },
          {
            type: 'speak',
            prompt: ['Help Lily order a drink.', '帮 Lily 点一杯喝的。'],
            model: 'Could I have a glass of water, please?',
            match: /water|glass|drink/i,
            reply: ['Sure, one glass of water.', '好的，一杯水。'],
            wrong: ['Try: Could I have a glass of water, please?', '试试这样说：Could I have a glass of water, please?']
          }
        ]
      },
      {
        title: '第 3 幕 · 开动啦',
        icon: '😋',
        narration: [
          'Soon the food comes: a chicken sandwich with no onions and a glass of water. Lily eats and drinks happily. She says: "Thank you. It is delicious!"',
          '很快餐点来了：不加洋葱的鸡肉三明治和一杯水。Lily 吃得津津有味。她说：“谢谢，太好吃了！”'
        ],
        words: ['sandwich', 'water'],
        interactions: [
          {
            type: 'choose',
            prompt: ['Is Lily happy with her food?', 'Lily 对餐点满意吗？'],
            options: [
              { en: 'Yes, she says it is delicious.', zh: '是的，她说太好吃了。', right: true, reply: ['Yes! Lily enjoys her meal.', '对！Lily 吃得很开心。'] },
              { en: 'No, she is angry.', zh: '不，她生气了。', reply: ['Not quite. Listen again: she says thank you.', '不完全对。再听一次：她说了谢谢。'] }
            ]
          }
        ]
      }
    ],
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
    scenes: [
      {
        title: '第 1 幕 · 发现蓝帽子',
        icon: '🧢',
        narration: [
          'Jack walks into a shop. On the shelf he sees a nice blue cap. "This cap looks great," he thinks. He wants to know the price.',
          'Jack 走进一家店。他在货架上看到一顶漂亮的蓝帽子。“这帽子真好看，”他想。他想知道价格。'
        ],
        words: ['cap', 'how much'],
        interactions: [
          {
            type: 'speak',
            prompt: ['Help Jack ask about the price.', '帮 Jack 问一下价格。'],
            model: 'How much is this cap?',
            match: /how much|price|cost/i,
            reply: ['It is 25 yuan.', '25 元。'],
            wrong: ['Try: How much is this cap?', '试试这样说：How much is this cap?']
          },
          {
            type: 'choose',
            prompt: ['How much is the blue cap?', '蓝帽子多少钱？'],
            options: [
              { en: '25 yuan.', zh: '25 元。', right: true, reply: ['Yes! The cap costs 25 yuan.', '对！帽子 25 元。'] },
              { en: '15 yuan.', zh: '15 元。', reply: ['Not quite. Listen again: it is 25 yuan.', '不完全对。再听一次：是 25 元。'] },
              { en: '50 yuan.', zh: '50 元。', reply: ['Not quite. It is cheaper than that.', '不完全对。比那个便宜。'] }
            ]
          }
        ]
      },
      {
        title: '第 2 幕 · 试戴',
        icon: '🪞',
        narration: [
          'The shop assistant brings a size M cap. "Would you like to try it on?" she asks. Jack puts it on in front of the mirror.',
          '店员拿了一顶 M 码的帽子。“要试戴一下吗？”她问。Jack 在镜子前戴上帽子。'
        ],
        words: ['size', 'fit'],
        interactions: [
          {
            type: 'choose',
            prompt: ['Which size does Jack try?', 'Jack 试了哪个尺码？'],
            options: [
              { en: 'Size M.', zh: 'M 码。', right: true, reply: ['Yes! He tries size M.', '对！他试了 M 码。'] },
              { en: 'Size S.', zh: 'S 码。', reply: ['Not quite. Listen again: it is size M.', '不完全对。再听一次：是 M 码。'] },
              { en: 'Size L.', zh: 'L 码。', reply: ['Not quite. The cap is size M.', '不完全对。帽子是 M 码。'] }
            ]
          }
        ]
      },
      {
        title: '第 3 幕 · 就买它了',
        icon: '🛍️',
        narration: [
          'Size M fits Jack well. He looks in the mirror and smiles. "I will take it!" He pays 25 yuan and wears his new blue cap home.',
          'M 码正合适。Jack 照照镜子，笑了。“就买它了！”他付了 25 元，戴着新蓝帽子回家。'
        ],
        words: ['fit', 'cap'],
        interactions: [
          {
            type: 'speak',
            prompt: ['Jack decides to buy it. What does he say?', 'Jack 决定买下帽子，他会怎么说？'],
            model: 'I will take it, please.',
            match: /take|buy|will/i,
            reply: ['Great! That is 25 yuan. Thank you!', '好嘞！一共 25 元，谢谢！'],
            wrong: ['Try: I will take it, please.', '试试这样说：I will take it, please.']
          }
        ]
      }
    ],
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
    scenes: [
      {
        title: '第 1 幕 · 想去博物馆',
        icon: '🏛️',
        narration: [
          'Anna is new in the city. She wants to visit the museum, but she does not know the way. She sees a kind man, Mr. Chen, at the bus stop.',
          'Anna 初来这座城市。她想去博物馆，但不认识路。她在公交站看到一位和气的先生——陈先生。'
        ],
        words: ['museum', 'bus'],
        interactions: [
          {
            type: 'speak',
            prompt: ['Help Anna ask the way politely.', '帮 Anna 礼貌地问路。'],
            model: 'Excuse me, how can I get to the museum?',
            match: /museum|way|get to|how/i,
            reply: ['Sure. Take Bus 5.', '好的。坐 5 路公交。'],
            wrong: ['Try: Excuse me, how can I get to the museum?', '试试这样说：Excuse me, how can I get to the museum?']
          },
          {
            type: 'choose',
            prompt: ['What does Anna not know?', 'Anna 不知道的是什么？'],
            options: [
              { en: 'The way to the museum.', zh: '去博物馆的路。', right: true, reply: ['Yes! She does not know the way.', '对！她不认识路。'] },
              { en: 'The time.', zh: '时间。', reply: ['Not quite. Her problem is the way to the museum.', '不完全对。她的问题是去博物馆的路。'] },
              { en: 'Her own name.', zh: '她自己的名字。', reply: ['Not quite. She knows her name, but not the way.', '不完全对。她知道名字，不知道的是路。'] }
            ]
          }
        ]
      },
      {
        title: '第 2 幕 · 陈先生指路',
        icon: '🚌',
        narration: [
          'Mr. Chen says: "Take Bus 5. Ride three stops and get off at the library stop." Anna listens carefully and repeats: "Bus 5, library stop."',
          '陈先生说：“坐 5 路公交，坐三站，在图书馆站下车。”Anna 认真听完，跟着重复：“5 路，图书馆站。”'
        ],
        words: ['get off', 'bus'],
        interactions: [
          {
            type: 'choose',
            prompt: ['Which bus should Anna take?', 'Anna 该坐几路公交？'],
            options: [
              { en: 'Bus 5.', zh: '5 路。', right: true, reply: ['Yes! She takes Bus 5.', '对！她坐 5 路。'] },
              { en: 'Bus 3.', zh: '3 路。', reply: ['Not quite. Listen again: it is Bus 5.', '不完全对。再听一次：是 5 路。'] },
              { en: 'Bus 15.', zh: '15 路。', reply: ['Not quite. It is Bus 5, not 15.', '不完全对。是 5 路，不是 15 路。'] }
            ]
          },
          {
            type: 'choose',
            prompt: ['Where does she get off?', '她在哪站下车？'],
            options: [
              { en: 'At the library stop.', zh: '图书馆站。', right: true, reply: ['Right. She gets off at the library stop.', '对。她在图书馆站下车。'] },
              { en: 'At the park stop.', zh: '公园站。', reply: ['Not quite. The stop is the library stop.', '不完全对。是图书馆站。'] },
              { en: 'At the school stop.', zh: '学校站。', reply: ['Not quite. Listen again: the library stop.', '不完全对。再听一次：图书馆站。'] }
            ]
          }
        ]
      },
      {
        title: '第 3 幕 · 到达博物馆',
        icon: '🎉',
        narration: [
          'Anna takes Bus 5 and gets off at the library stop. The museum is next to the library! She thanks Mr. Chen in her heart and walks in happily.',
          'Anna 坐上 5 路公交，在图书馆站下车。博物馆就在图书馆旁边！她心里感谢了陈先生，开心地走了进去。'
        ],
        words: ['next to', 'get off'],
        interactions: [
          {
            type: 'choose',
            prompt: ['Where is the museum?', '博物馆在哪里？'],
            options: [
              { en: 'Next to the library.', zh: '在图书馆旁边。', right: true, reply: ['Yes! The museum is next to the library.', '对！博物馆就在图书馆旁边。'] },
              { en: 'Across from the park.', zh: '在公园对面。', reply: ['Not quite. It is next to the library.', '不完全对。它在图书馆旁边。'] },
              { en: 'Behind the school.', zh: '在学校后面。', reply: ['Not quite. Listen again: next to the library.', '不完全对。再听一次：图书馆旁边。'] }
            ]
          }
        ]
      }
    ],
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
    scenes: [
      {
        title: '第 1 幕 · 晴朗的星期六',
        icon: '☀️',
        narration: [
          'It is Saturday morning. The sun is bright and the sky is clear. Bob looks out of the window: "What a sunny day!" He picks up the phone.',
          '星期六的早晨。阳光明亮，天空晴朗。Bob 看着窗外：“多晴的天啊！”他拿起了电话。'
        ],
        words: ['sunny', 'invite'],
        interactions: [
          {
            type: 'choose',
            prompt: ['What is the weather like on Saturday?', '星期六天气怎么样？'],
            options: [
              { en: 'It is sunny.', zh: '天气晴朗。', right: true, reply: ['Yes! The sun is bright and the sky is clear.', '对！阳光明亮，天空晴朗。'] },
              { en: 'It is rainy.', zh: '下雨。', reply: ['Not quite. Listen again: the sun is bright.', '不完全对。再听一次：阳光明亮。'] },
              { en: 'It is snowy.', zh: '下雪。', reply: ['Not quite. It is a sunny day.', '不完全对。这是晴天。'] }
            ]
          },
          {
            type: 'speak',
            prompt: ['Help Bob invite Mary to the park.', '帮 Bob 邀请 Mary 去公园。'],
            model: 'Would you like to go to the park with me?',
            match: /park|go|would|like/i,
            reply: ['Yes, I would love to!', '好呀，我很乐意！'],
            wrong: ['Try: Would you like to go to the park with me?', '试试这样说：Would you like to go to the park with me?']
          }
        ]
      },
      {
        title: '第 2 幕 · 带上风筝',
        icon: '🪁',
        narration: [
          'Mary says yes on the phone. Then she has an idea: "It is windy in the park. Let us bring a kite!" Bob laughs: "Good idea!"',
          'Mary 在电话里答应了。接着她有了个主意：“公园里风大，我们带一只风筝吧！”Bob 笑了：“好主意！”'
        ],
        words: ['kite', 'park'],
        interactions: [
          {
            type: 'choose',
            prompt: ['What does Mary want to bring?', 'Mary 想带什么去？'],
            options: [
              { en: 'A kite.', zh: '一只风筝。', right: true, reply: ['Yes! She wants to bring a kite.', '对！她想带风筝。'] },
              { en: 'A ball.', zh: '一个球。', reply: ['Not quite. Listen again: a kite.', '不完全对。再听一次：风筝。'] },
              { en: 'Some food.', zh: '一些食物。', reply: ['Not quite. She thinks of a kite.', '不完全对。她想到的是风筝。'] }
            ]
          }
        ]
      },
      {
        title: '第 3 幕 · 风筝飞高高',
        icon: '🎈',
        narration: [
          'In the park, Bob and Mary run with the kite. The kite flies high in the blue sky. "This is the best sunny day!" Mary says.',
          '在公园里，Bob 和 Mary 带着风筝奔跑。风筝在蓝蓝的天上飞得很高。“这是最棒的晴天！”Mary 说。'
        ],
        words: ['sunny', 'kite'],
        interactions: [
          {
            type: 'choose',
            prompt: ['How is the kite in the sky?', '天上的风筝怎么样？'],
            options: [
              { en: 'It flies high.', zh: '飞得很高。', right: true, reply: ['Yes! The kite flies high in the blue sky.', '对！风筝在蓝天上飞得很高。'] },
              { en: 'It breaks.', zh: '破了。', reply: ['Not quite. The kite flies well.', '不完全对。风筝飞得很好。'] },
              { en: 'They forget it.', zh: '他们忘带了。', reply: ['Not quite. They bring it and fly it.', '不完全对。他们带了，而且放飞了。'] }
            ]
          }
        ]
      }
    ],
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
    scenes: [
      {
        title: '第 1 幕 · 泳池的邀请',
        icon: '📞',
        narration: [
          'Tim loves water. His favourite sport is swimming. On Sunday he wants to swim, so he calls his friend Sue: "Will you swim with me?"',
          'Tim 喜欢水。他最喜欢的运动是游泳。周日他想去游泳，于是打电话给朋友 Sue：“你愿意和我一起去游泳吗？”'
        ],
        words: ['favourite', 'swimming'],
        interactions: [
          {
            type: 'speak',
            prompt: ['Help Tim invite Sue to swim.', '帮 Tim 邀请 Sue 一起游泳。'],
            model: 'Will you swim with me on Sunday?',
            match: /swim|with|sunday/i,
            reply: ['Let me think... I like basketball more.', '让我想想……我更喜欢篮球。'],
            wrong: ['Try: Will you swim with me on Sunday?', '试试这样说：Will you swim with me on Sunday?']
          },
          {
            type: 'choose',
            prompt: ['What is Tim\'s favourite sport?', 'Tim 最喜欢的运动是什么？'],
            options: [
              { en: 'Swimming.', zh: '游泳。', right: true, reply: ['Yes! Tim\'s favourite sport is swimming.', '对！Tim 最喜欢游泳。'] },
              { en: 'Basketball.', zh: '篮球。', reply: ['Not quite. Basketball is Sue\'s favourite.', '不完全对。篮球是 Sue 最喜欢的。'] },
              { en: 'Running.', zh: '跑步。', reply: ['Not quite. Tim loves swimming.', '不完全对。Tim 爱的是游泳。'] }
            ]
          }
        ]
      },
      {
        title: '第 2 幕 · 不同的爱好',
        icon: '🏀',
        narration: [
          'Sue likes basketball best. She plays it every week. But she looks at Tim and smiles: "I will try swimming with you. It sounds fun!"',
          'Sue 最喜欢篮球。她每周都打。但她看着 Tim 笑了笑：“我愿意和你试试游泳，听起来很有趣！”'
        ],
        words: ['basketball', 'join'],
        interactions: [
          {
            type: 'choose',
            prompt: ['What sport does Sue like best?', 'Sue 最喜欢什么运动？'],
            options: [
              { en: 'Basketball.', zh: '篮球。', right: true, reply: ['Yes! Sue plays basketball every week.', '对！Sue 每周都打篮球。'] },
              { en: 'Swimming.', zh: '游泳。', reply: ['Not quite. She will try swimming, but she likes basketball.', '不完全对。她会试着游泳，但她喜欢的是篮球。'] },
              { en: 'Football.', zh: '足球。', reply: ['Not quite. Listen again: basketball.', '不完全对。再听一次：篮球。'] }
            ]
          }
        ]
      },
      {
        title: '第 3 幕 · 尝试新事物',
        icon: '🏊',
        narration: [
          'On Sunday, Tim and Sue go to the pool. Sue learns to float and kick. "Swimming is fun!" she says. Now she has two favourite sports.',
          '周日，Tim 和 Sue 来到泳池。Sue 学会了漂浮和打水。“游泳真好玩！”她说。现在她有两个最喜欢的运动了。'
        ],
        words: ['swimming', 'join'],
        interactions: [
          {
            type: 'choose',
            prompt: ['How does Sue feel about swimming at last?', '最后 Sue 觉得游泳怎么样？'],
            options: [
              { en: 'It is fun.', zh: '很有趣。', right: true, reply: ['Yes! She says swimming is fun.', '对！她说游泳真好玩。'] },
              { en: 'It is scary.', zh: '很可怕。', reply: ['Not quite. She enjoys it.', '不完全对。她很喜欢。'] },
              { en: 'She will never swim again.', zh: '她再也不游了。', reply: ['Not quite. Now she has two favourite sports.', '不完全对。她现在有两个最喜欢的运动了。'] }
            ]
          }
        ]
      }
    ],
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
