# 人物候选验收

目标：现代校园任务人物，近距离脸部可信，姿态自然，不需要走路。以实际校园光照下的画面验收。

## Michelle 本地对比

来源：https://threejs.org/examples/models/gltf/Michelle.glb
对应官方源码：https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/Michelle.glb

2026-11-12 下载，约 3.1 MiB，自带 SambaDance 和 TPose。当前仅采样第一帧作视觉对比，不播放舞蹈、不作为正式接待员。官方库包含该资源不代表我们已确认其单独的再分发许可；不得随项目发布这份候选。

已在校园入口近距离验收并淘汰：卡通比例、耳机与舞蹈姿态不符合现代校园写实人物要求。候选文件移出 dist，保留在 /tmp/campus-michelle-rejected.glb，测试入口已撤回。截图 /tmp/campus-michelle-comparison.png。正常游戏未替换人物。

Mixamo 直接页面本轮加载超时；尚未从用户 Adobe 账户选取或导出人物。

## Renderpeople 真人扫描样例

来源：https://renderpeople.com/free-3d-people/
下载：https://renderpeople.com/sample/free/rp_posed_00178_29_GLB.zip
许可：https://renderpeople.com/general-terms-and-conditions/

当前本地 Mia 使用 rp_posed_00178_29，身高归一化 1.67m，静态扫描站姿。模型约4.6MB，包含基础色贴图。免费许可允许游戏实时渲染，但限制单独模型提取和再分发；资源放在 gitignore 排除的 assets/local-characters，禁止纳入公开源码或现有静态网站发布包。正式发布前需解决授权与资源分发方案，不能将其误标 CC0。本轮仅本地预览，无付费、注册或外部上传。

验收结果：本地浏览器已检查正面近景、地面位置、现有 NPC 点击距离限制及点击领取任务，均可用。静态扫描不含口型或待机动画。仅 localhost / 127.0.0.1 优先使用此本地资产，缺失时回退原人物；其他域名使用原资产。gitignore 不能代替部署排除，任何手动打包 dist 时仍须排除 local-characters。

## 三人本地扫描阵容

新增官方免费合集：https://renderpeople.com/sample/free/renderpeople_free_posed_people_OBJ.zip

- Mia：Mei Posed 001，持文件夹的接待员，30k OBJ 转 GLB，2K 基础色，1,603,512 字节。
- Ben：Dennis Posed 004，服务台工作人员，30k OBJ 转 GLB，2K 基础色，1,188,404 字节。
- Leo：沿用 rp_posed_00178_29 黄色外套扫描角色，固定站姿，原任务身份保持不变。

使用本机 Blender 转换，保留原始 UV、自然站姿和基础色贴图；无新增行走系统。所有扫描资源仅本地使用，缺失或非本地域名仍回退原人物。三位合计约7.43MB，相比旧三人约64.82MB显著减少传输体积。

三人实景验收：已检查 Mia 正面近景及点击自动发布任务、Ben 服务台近景、Leo 右侧展区近景。贴图正常、脚底归一化、角色朝向可随玩家调整。近距离姓名牌不再显示，避免与任务问号在屏幕顶部重叠；姓名仍在交谈面板和已遇人物小地图中显示。
