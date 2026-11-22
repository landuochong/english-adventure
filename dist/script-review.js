import {scripts} from './grade-seven-scripts.js';

const labels = {
  title: '剧本标题', goal: '学科目标与依据', opening: '开场与委托',
  explore: '探索与对话', delivery: '交付与反馈', check: '完成条件与待核项'
};
const editor = document.querySelector('article');
const list = document.querySelector('#list');
const message = document.querySelector('#message');
const records = new Map();
const storageKey = id => 'campus-quest:grade7-review:v1:' + id;
let current;
let loadWarning = false;
for (const base of scripts) {
  const record = {...base, status: '待审核', notes: ''};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(base.id)));
    for (const field of [...Object.keys(labels), 'notes', 'status']) {
      if (typeof saved?.[field] === 'string') record[field] = saved[field];
    }
  } catch { loadWarning = true; }
  records.set(base.id, record);
}

for (const [field, text] of Object.entries(labels)) {
  const label = document.createElement('label');
  label.htmlFor = field;
  label.textContent = text;
  const control = document.createElement(field === 'title' ? 'input' : 'textarea');
  control.id = field;
  document.querySelector('#fields').append(label, control);
}

function updateEntry(record) {
  const button = document.getElementById('entry-' + record.id);
  button.firstChild.textContent = record.title || '未命名剧本';
  button.lastChild.textContent = record.unit.split(' · ')[0] + ' · ' + record.status;
  button.setAttribute('aria-current', String(record === current));
}
function openScript(record) {
  current = record;
  document.querySelector('#wish-preview').hidden = record.id !== 'starter';
  document.querySelector('#unit').textContent = record.unit;
  for (const control of editor.querySelectorAll('textarea,input,select')) control.value = record[control.id];
  records.forEach(updateEntry);
}
for (const record of records.values()) {
  if (record.id === 'starter' || record.id === 'bio') {
    const heading = document.createElement('h2');
    heading.textContent = record.id === 'starter' ? '英语主线' : '跨学科候选';
    list.append(heading);
  }
  const button = document.createElement('button');
  button.id = 'entry-' + record.id;
  button.append(document.createElement('span'), document.createElement('small'));
  button.addEventListener('click', () => openScript(record));
  list.append(button);
}
openScript(records.get('starter'));
if (loadWarning) message.textContent = '部分本地稿件读取失败，请检查内容后导出备份。';

editor.addEventListener('input', event => {
  const control = event.target;
  if (!control.matches('textarea,input,select')) return;
  current[control.id] = control.value;
  if (control.id !== 'status' && control.id !== 'notes' && current.status === '已通过') {
    current.status = '待审核';
    document.querySelector('#status').value = current.status;
  }
  updateEntry(current);
  try {
    localStorage.setItem(storageKey(current.id), JSON.stringify(current));
    message.textContent = '修改已保存到当前浏览器';
  } catch {
    message.textContent = '浏览器保存失败，请导出全册审核稿。';
  }
});
document.querySelector('#download').addEventListener('click', () => {
  const sections = ['# 七年级上册剧本审核稿'];
  for (const record of records.values()) {
    sections.push('## ' + record.unit + ' · ' + record.title);
    for (const [field, label] of Object.entries({...labels, status:'审核状态', notes:'审核意见'})) {
      if (field !== 'title') sections.push('### ' + label, record[field] || '（空）');
    }
  }
  const url = URL.createObjectURL(new Blob([sections.join('\n\n')], {type:'text/markdown;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = '七年级上册剧本审核稿.md';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
