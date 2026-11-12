# 未来学校素材库：Quaternius

收录日期：2026-11-12。用途：复用现成模型和动画，减少角色与场景制作成本。仅收录素材，本轮没有替换角色、改动关卡或发布网站。

## 已实际加入项目

| 资源 | 精选内容 | 数量 | 状态 |
|---|---|---:|---|
| Sci-Fi Essentials Kit · Standard | 无人机、机器人、桌椅、门卡、储物柜、医疗包、箱子、天线、货架 | 14 个模型 | 已下载、依赖校验通过，未放入关卡 |
| Modular Sci-Fi Megakit · Standard | 门禁、电脑、展示架、灯、柱子、门框、门、玻璃墙与窗组件 | 12 个模型 | 已下载、依赖校验通过，未放入关卡 |
| Universal Animation Library · Standard | 原地动画与带根运动动画各一份 | 2 个 GLB，各 43 动作 | 已下载，骨骼适配与视觉验收待做 |
| RobotExpressive | 当前黄色机器人 | 1 个模型、14 动作 | 前轮已接入用户控制的学生，复用原路径 |

## 文件位置与使用方法

- 精选可加载文件：`dist/assets/quaternius/`。资源不会自动导入或预加载到游戏。
- 已接入机器人：`dist/assets/characters/school-robot.glb`。这是玩家，不是教练或接待员。
- 原始免费包：`resources/quaternius/<包名>/standard.zip`，共约 220.7 MiB；保留为本地来源备份，Git 忽略压缩包。
- 精选文件及依赖约 122.9 MiB；多数体积来自贴图，后续实际使用前按需压缩，勿整目录预加载。
- 完整机器可读清单：`resources/quaternius/catalog.json`，记录包版本、来源、SHA-256、动画名、依赖和状态。
- 许可证和 README：各包在 `resources/quaternius/<包名>/` 下保存原文。
- 重建精选目录：`python3 scripts/import_quaternius_assets.py`（需本地已有三个 standard.zip，不访问付费入口）。
- 校验清单：`python3 scripts/verify_quaternius_assets.py`。

## 接入建议

1. 第一批优先使用门卡、门禁、电脑、桌椅与储物柜，为听说任务提供具体互动对象。
2. 无人机和四足机器人作为角色候选；素材名中的 Enemy 只是原作者命名，不意味着校园加入战斗玩法。
3. 门、墙、窗组件先用于一间实验室，确认尺寸、碰撞和材质后再扩大。
4. 动画库需要匹配或重定向骨骼，不能直接把通用人形动作套给任意机器人。RM 版包含根运动，接入时应避免根运动和游戏位移重复叠加。
5. 新模型尚未逐个浏览器视觉验收；结构与依赖校验不等于动作协调、尺寸或渲染效果已通过。

## 来源与许可证据

本次下载的三个免费 Standard 包内许可证均明确标注 CC0 1.0；保留原文作为所收录版本的证据。网站通用许可页另列 QAL，不将整站一概视为 CC0。后续更新或增加资源时重新核对对应文件包。未购买 Pro、Source 或赞助服务。

- [科幻设备包](https://quaternius.com/packs/scifiessentialskit.html) / [作者下载页](https://quaternius.itch.io/sci-fi-essentials-kit)
- [模块化科幻场景](https://quaternius.com/packs/modularscifimegakit.html) / [作者下载页](https://quaternius.itch.io/modular-sci-fi-megakit)
- [通用动画库](https://quaternius.com/packs/universalanimationlibrary.html) / [作者下载页](https://quaternius.itch.io/universal-animation-library)
- [机器人来源与许可](https://github.com/mrdoob/three.js/tree/r180/examples/models/gltf/RobotExpressive)

## 待下载资源

[Animated Mech Pack](https://quaternius.com/packs/animatedmech.html)：已找到作者公开的四个 glTF 文件，但下载返回 Google Drive “Quota exceeded”。本轮未获得有效模型，未纳入已下载统计；后续额度恢复再获取。

## 精选明细

| 文件 | 动作数 | 建议用途 |
|---|---:|---|
| `dist/assets/quaternius/sci-fi-essentials-kit/Enemy_EyeDrone.gltf` | 6 | 校园机器人候选 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Enemy_QuadShell.gltf` | 8 | 校园机器人候选 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Chair.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Desk_Medium.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Desk_Small.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_HealthPack.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_HealthPack_Tube.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_KeyCard.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Locker.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Mug.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Chest.gltf` | 4 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Crate.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_SatelliteDish.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/sci-fi-essentials-kit/Prop_Shelves_ThinShort.gltf` | 0 | 实验室家具、设备或任务道具 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Props/Prop_AccessPoint.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Props/Prop_Computer.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Props/Prop_ItemHolder.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Props/Prop_Light_Small.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Props/Prop_Light_Wide.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Columns/Column_Simple.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Platforms/Door_Frame_Square.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Platforms/Door_Simple.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Platforms/Door_Metal.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Walls/WallWindow_Straight.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Walls/WallAstra_Straight_Window.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/modular-sci-fi-megakit/Walls/TopWindow_Straight.gltf` | 0 | 未来教室/实验室模块 |
| `dist/assets/quaternius/universal-animation-library/UAL1_Standard.glb` | 43 | 人形动作候选，需适配骨骼 |
| `dist/assets/quaternius/universal-animation-library/UAL1_Standard_RM.glb` | 43 | 人形动作候选，需适配骨骼 |
| `dist/assets/characters/school-robot.glb` | 14 | 角色待机/移动/表情参考 |

## 未来学校第一轮场景整合（2026-11-12，本地）

- 保留现有校园建筑、固定 2.5D 控制、黄色机器人玩家、Mia / Ben / Leo 身份和机器狗教练。教练不参与任务完成。
- 视觉基准：象牙白 #eeeae1、蓝灰 #677f8d、深蓝 #263d4c、青蓝 #56d9d1、玩家暖黄。沿用 system-ui；文字用于姓名、控制与场内导视，未增加剧情常驻字幕。
- 正交视野从 18 米收为 16 米，人物更易看清。姓名简化为短标签放在脚下，近距离显示；问号/对话标记保留在头顶。移除加载阶段的临时拼装人形，改为小型占位指示。
- Quaternius 成品模型实际布置：4 个自助终端（入口两侧、服务台旁、实验桌旁）、1 张实验桌、1 把椅子、2 个储物柜、1 个静态无人机展品。展品与任务目标 Pip 分开，不授予线索，不提前显示目标。
- 墙挂 AccessPoint 经实景检查不适合独立落地摆放，保留派生资源但不加载；入口采用完整 Computer 终端。
- 家具碰撞范围在异步加载前注册，小地图复用这些范围；重复静态模型共享加载请求。新增设备仅作场景陈设，不能点击执行任务。
- 原始模型不修改。`scripts/build_campus_props.py` 通过 Blender 导出自包含 GLB，贴图最长边 1024；输出 `dist/assets/campus-props/`，来源映射见其中 sources.json。六个派生文件约 12.5 MiB，实际加载五种约 10.8 MiB。不加载整套 123 MiB 素材库。

验证：校园任务和寻路 6 项检查通过；浏览器实测进入/准备、键盘行走、穿过入口、点击 Mia 身体领取任务及标记变为文本按钮；查看室内设备，无浏览器错误。没有本轮真人语音识别/口型验证，也未改写人物模型或重做动作。只修改本地，未发布、提交或推送。
