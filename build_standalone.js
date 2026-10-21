// 把所有 ESM 模块内联成一个独立 HTML，绕过服务器/端口/缓存
import fs from 'node:fs';
const order = ['scene-conversation','scene-engine','engine','stories','speech','dialogue','world','guidance','voice-turn','vad-loader','app'];

function strip(src){
  let s = src;
  // 去掉 import ... from './x.js?v=N'
  s = s.replace(/^[ \t]*import[^\n]*?from[ \t]*['"][^'"]+['"][^\n]*$/gm, '');
  // export function|const|let|var|class -> 去掉 export
  s = s.replace(/^[ \t]*export[ \t]+(function|const|let|var|class)[ \t]+/gm, '$1 ');
  // 去掉 export { ... };
  s = s.replace(/^[ \t]*export[ \t]*\{[^}]*\}[ \t]*;?[ \t]*$/gm, '');
  return s;
}

let code = '';
for (const f of order){
  const raw = fs.readFileSync(`dist/${f}.js`, 'utf8');
  code += `\n/* ===== ${f}.js ===== */\n` + strip(raw) + '\n';
}

const css = fs.readFileSync('dist/style.css', 'utf8');
const html =
`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Campus Quest · 英语同行冒险</title><style>${css}</style></head><body><div id="app"></div><script type="module">${code}</script></body></html>`;

fs.writeFileSync('dist/standalone.html', html);
console.log('standalone.html written,', html.length, 'bytes');
