# Campus Quest · 英语同行冒险

先阅读 [设计文档](docs/design.md)。无构建依赖的网页原型，支持校园探索、脚本教练、语言准备、线索和复盘。

## 运行

```sh
npm start
# http://localhost:4173
npm test
```

静态文件在 `dist/`。通过 HTTP/HTTPS 打开，不直接使用 file://（ES modules 限制）。

## 试玩路径

完成听辨或跳过 → 广场领取 → 图书馆询问 `Have you seen a robot?` → 美术教室检查记录并询问 `Where did you take the decoration?` → 温室选蓝灯机器人、按绿按钮、发送 `Follow me` → 广场交付 → 复盘听辨。

TTS 使用浏览器语音合成。语音输入依赖浏览器 SpeechRecognition 与麦克风权限，可能使用浏览器厂商的远程服务；不支持时可使用文字。转写由用户确认后发送。进度仅在本浏览器保存，不保存聊天或录音。

本版是**脚本教练**，并非已经接通的生成式 AI。不含真人联机、账号、发音评分或云端学习记录。UI 不向学生展示虚假的语言成绩。
