# 填写示例：为野餐准备午餐

日期：2026-10-22。演示草稿，沿用现有点餐主题扩写；不代表来自真实教材，未接入运行引擎。

## 课程与任务

- 故事 ID：picnic-lunch；版本：draft-1；地图：咖啡馆。
- 建议对象：能进行简单请求的青少年；预计 8～12 分钟，需真实试玩校准。
- 假设课内材料：I would like … / Could I …? / with / without；食物和饮料词汇。
- 核心词汇：menu、sandwich、chicken、onions、water、juice。
- 语法目标：would like + 名词表达需求；Could I + 动词原形提出请求；with/without 表达配料要求。
- 故事补充词：sold out（卖完）、cheese（三明治替代选择）、instead（替代）、ready（准备好）。需作者确认再纳入语言背包。
- 主动表达目标：询问菜单/替代食物、表达或确认订单；听力目标：听懂需求、售罄通知、同伴的替代选择。

Lily 正在准备去公园野餐，请学生到柜台点午餐。学生需要听清需求；柜台临时发现鸡肉卖完，学生必须回去征询 Lily 的替代选择，再点餐、汇报。教练 Nova 随行分析，不代做决定。

人物：Lily（桌旁，委托和最终选择）；Waiter（柜台，库存和订单）；Nova（学生旁，可切为语音指导）。

教练开场：We are at a cafe before a picnic. Lily needs some help. Go and listen to her first. You make the decisions; I can help you think.

## 五个情节

| 情节 | 事件与交互 | 语言用途 | 进入下一步的条件 |
|---|---|---|---|
| 1 领取委托 | 点 Lily 问号听需求 | 听懂食物、配料、饮料 | 获得委托，不在地图标出答案 |
| 2 发现变化 | 向 Waiter 问菜单，听到鸡肉售罄；可另问有什么替代品 | Could I see…? / What else…? | 学生主动问到菜单，获得替代品信息 |
| 3 征询同伴 | 回 Lily 处说明鸡肉卖完，询问要什么；可分两轮 | unavailable / What would you like instead? | 说明变化并提出选择问题，听到新需求 |
| 4 确认订单 | 回柜台表达食物、配料、饮料，允许乱序与纠错 | I would like… / without… | 信息齐全、无待确认项、符合新需求且库存可用 |
| 5 交付收尾 | 回 Lily 处说明餐点好了、交付 | Here is… / Your lunch is ready. | 订单成功且学生实际回访并汇报 |

## 关键台词与信息来源

1. Lily：Could you order lunch for me? I would like a chicken sandwich without onions and a glass of water. Please check the menu first.
2. Waiter：Sorry, the chicken sandwiches are sold out. We still have cheese sandwiches. We have water and juice, too. 重听不产生新状态。学生只问菜单也会获得这段必要信息，询问替代品是可选追加交流，不能因为漏问额外固定句而卡死。
3. 学生可先说 They have no chicken sandwiches，再问 What would you like instead?；Lily：A cheese sandwich is fine. No onions, please. I would still like water.
4. Waiter 根据缺项问 What would you like to eat? / Would you like onions? / What would you like to drink?；齐全后：A cheese sandwich, no onions, and water. Your lunch is ready.
5. Lily：Thank you! You checked with me when the plan changed. Now we are ready for the picnic!

作者可查看这些完整台词，学生只能在对应交互中听到；学习背包不能提前展示 Lily 的完整订单组合。

## 情节 4 的配置细化

前置：已获悉售罄信息，并向 Lily 征询到替代选择；学生走到 Waiter 身边。

| 信息项 | 接受的词义值 | 任务要求来源 | 缺项追问 |
|---|---|---|---|
| food | chicken / cheese | Lily 的新选择；库存排除 chicken | What would you like to eat? |
| onions | with / without | Lily 的需求 | Would you like onions? |
| drink | water / juice | Lily 的需求 | What would you like to drink? |

- Water, please → 记住饮料，追问食物；A cheese sandwich → 记住食物，追问配料；No, thanks → 只回答当前是否加洋葱的问题，完成订单。
- A cheese sandwich without onions and juice → 保留三项，但饮料与委托不符，提示学生回顾需求；No, I meant water → 只更新饮料，完成订单。
- If you have onions… 这类条件表达未被可靠理解时追问，不因出现 onions 就算确认加洋葱。
- Without the audience → 候选“without onions”，问 Did you say no onions?；Yes 确认该项，No 清除候选，仍保留食物和饮料。
- 已有 water 又说 juice：问 Would you like juice instead of water, or both?；若要两种饮料，与当前委托不符，不自动完成。模板必须声明是否支持多份订单，本例不支持。
- 仍要求 chicken：说明已售罄，不授予餐点，已确认的配料和饮料保留。
- 成功后再说更改订单：本例明确订单已备好、建议完成交付；不能暗中改写已完成订单。复杂撤单不在第一版范围。

状态效果：仅成功一次时产生 order_ready；只有情节 5 的汇报可以产生 delivered 和 completed。提前说 Here is your lunch 不成功。

## 教练权限与识别提示

教练可说：The plan has changed. Who can decide what Lily would like instead?；可以解释 sold out，帮助重听已获得的需求。不能替学生选 cheese、填写饮料或领取餐点。

识别公共提示：An English conversation in a cafe. Vocabulary: menu, sandwich, chicken, cheese, onions, water, juice, sold out, order. 不拼接 Lily 的正确订单，不把待识别输入强制补成完整需求。

## 桌面推演（设计检查，不是程序测试）

- 五个情节均有前置来源：Lily 需求 → 库存变化 → 新选择 → 实际订单 → 交付；没有不可获得的关键信息。
- “饮料→食物→配料”和“配料→饮料→食物”都能表达同一订单。
- 更正饮料不会遗失其他项；拒绝歧义确认不授予进度；找错人物不推进。
- 教练解释、重听菜单和重复点击不会领取餐点；最终由学生汇报，收尾感谢而不是再次要求询问。
- 语法通过询问和点餐练习，语义正确的其他表达仍可完成；目标句型未使用时在回顾建议补练，不伪造发音评分。

尚需真实课文验证词汇/语法覆盖、语言难度和补充量；尚需开发加载器后进行自动化测试及真人试玩。
