# 歸藏 Game Skill：对 Campus Quest 的参考结论

核对日期：2026-11-12。
仓库：https://github.com/op7418/guizang-game-skill
检查版本：6001e56e1eaa60be49e5aa4ef81d08b746a1b4e2。

## 核对范围

已只读下载 main 分支，阅读 README、SKILL.md、角色动画/素材/踩坑/打包文档和输入脚本，查看仓库提供的实机截图。在线演示浏览器载入超时，未完成动态试玩；不能把作者描述和静态图片当成已实测的帧率或步态质量。没有安装该 Skill，没有运行仓库脚本，没有调用付费素材服务，也没有复制演示游戏资产。

main 主要提供开发工作流、经验文档和输入/打包脚本，不是完整的游戏业务源代码目录。README 指向独立在线演示；游戏素材位于另一分支。作者明确区分 main 的 AGPL-3.0 与演示美术、模型、音频等内容的保留权利声明。后续可参考方法，不能将演示人物当作可自由移植的免费素材。

## 对我们最有用的结论

1. 角色外观和动作必须分开验收。当前校园建筑已获认可，下一阶段集中检验人物，不继续通过更换整套场景掩盖角色问题。
2. 人物进入展示台时先确定绑定姿态、真实身高、正面方向和脚底高度。站立截图正常不能证明动画过程中不漂移、不滑步。
3. 原地动作与游戏位移需明确分工。逐个检查动画是否带水平根位移；有则在正确坐标空间处理，保留必要的上下起伏，不能直接清空所有位置轨道。
4. 自制交互手势应以手部目标位置和脚部支撑为依据。英语关卡需要的是倾听、说话、指路和交付，而不是移植战斗招式。
5. 需要独立人物动作展示页和可见诊断：动作名称、时间、移动速度、动画播放速率、脚底高度及根位移。补充侧面连续观察，避免只用一次截图或控制台无错误宣布完成。
6. 统一人物和场景的美术方向。若以后使用生成服务，应先确定角色设定与预算，再生成并绑定；当前不自动新增付费依赖。
7. 打包后再验一次人物。体积优化可能改变骨骼、缩放与纹理，不能只验证开发版。当前单个教练约 21 MiB，也需要在动作质量稳定后优化。

参考：
- 角色与动画：https://github.com/op7418/guizang-game-skill/blob/main/references/characters-animation.md
- 素材流程：https://github.com/op7418/guizang-game-skill/blob/main/references/assets.md
- 打包与模型缩放问题：https://github.com/op7418/guizang-game-skill/blob/main/references/packaging.md

## 下一步执行顺序

先建立教练动作验收台，分离原地步态、直线移动、转弯和停止四种情况，核对控制代码修正后是否仍有素材本身僵硬的问题。动作资源不合格就替换资源，避免无止境调混合参数。通过后把人物接回现有校园，再连通已约定的问号、语音对话、文字辅助与单任务推进规则。

机器狗与无人机独立演示作为机械角色质量参考，不能代替真人动作验收，也不能代替英语任务闭环。保持学生亲自完成任务、教练只指导的产品约定。当前目标尚未完成。

## 2026-11-12 更新：优先现成资源

用户明确要求“最好找现成的，不要自己花大量时间研究”。后续不继续扩建动作验收台、不自研 IK 或逐关节步态；优先使用已有角色与其配套动画，仅做必要接入。原有 Sam 仍是临时角色，不能将控制参数修正当作人物真实性验收完成。

已下载检查 Quaternius Universal Animation Library Standard 的 2025-06-10 glTF 镜像：
- 镜像：https://github.com/J-Ponzo/gltf-universal-animation-library
- 归档版本：e24c23cf2a1323488a3faa226ea7ea21f644b73e。
- 本地检查目录：/tmp/campus-ual-reference/gltf-universal-animation-library-main。
- 实际文件含 46 个动画条目（包含 A_TPose），包括 Idle_Loop、Idle_Talking_Loop、Walk_Loop、Walk_Formal_Loop、Jog_Fwd_Loop、Interact、PickUp_Table、Sitting_Talking_Loop。
- 只有 Mannequin 网格，不能直接用这个无脸测试人偶替代校园人物并宣称真实。需配套穿衣人物；避免为了复用它对 Sam 开展长时间骨骼重定向研发。
- 内附 CC0 文本，作者页面也标注 CC0。正式采纳前保留对应版本来源与许可。
- 作者当前页面已更新至 v3.0；镜像是旧版，不能将其当成最新版。正式集成优先取得作者当前 Standard 包。
- 尚未完成此动作包的浏览器动态效果验收，尚未接入校园。

作者来源：https://quaternius.itch.io/universal-animation-library
配套人物：https://quaternius.com/packs/universalbasecharacters

另一候选为 Adobe Mixamo 的现成人物与动作。官方 FAQ 写明免费、需 Adobe ID，可在游戏中使用，同时注明中国国家代码账号限制。不能默认用户具备可用账号或已有下载素材，也不因此反复要求用户配置服务。
来源：https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html

下一步选择标准：日常服装、正常人体比例、现成待机/走路/跑步/交谈、明确使用许可、接入成本低。以实际动作效果筛选；不满足就换资产，不扩建自研工具。

最新范围调整：用户接受机器狗作为同行教练、任务人物站立不动。暂停真人步行动画筛选；现成动作与模型优先的原则继续适用。2026-11-12 已在校园本地预览接入参考机器狗，下一步集中任务互动；人物模型可按后续 Tripo 资源替换。
