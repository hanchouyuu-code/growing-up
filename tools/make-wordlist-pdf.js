/* Builds downloads/unit1-word-list.pdf from js/data.js.
   Run from the project folder:  node tools/make-wordlist-pdf.js   (needs Playwright) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const ctx = {};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'), ctx);
const GU = ctx.GU;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mark = (s, hl) => { const e = esc(s); const i = e.toLowerCase().indexOf(hl.toLowerCase()); return i < 0 ? e : e.slice(0, i) + '<b>' + e.slice(i, i + hl.length) + '</b>' + e.slice(i + hl.length); };
const font = f => 'file://' + path.join(root, 'assets/fonts', f);

const groups = [0, 1, 2].map(g => GU.WORDS.slice(g * 10, g * 10 + 10));
const rows = (ws, start) => ws.map((w, i) => `
  <tr><td class="n">${start + i + 1}</td>
  <td class="w"><span class="word">${esc(w.word)}</span>${w.ipa ? `<span class="ipa">${w.ipa}</span>` : ''}</td>
  <td class="p">${w.pos}</td><td class="zh">${w.zh}</td>
  <td class="s">${mark(w.book, w.hl)}<span class="src">${esc(w.src)}</span></td></tr>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url(${font('bricolage-grotesque-latin-standard-normal.woff2')});font-weight:200 800}
@font-face{font-family:A;src:url(${font('atkinson-hyperlegible-latin-400-normal.woff2')});font-weight:400}
@font-face{font-family:A;src:url(${font('atkinson-hyperlegible-latin-700-normal.woff2')});font-weight:700}
@page{size:A4;margin:14mm 13mm 14mm}
body{font:400 9.6pt/1.45 A,"Noto Sans CJK SC",sans-serif;color:#1D1A3A;margin:0}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #5A3FD6;padding-bottom:8px;margin-bottom:10px}
h1{font:800 24pt/1 B;margin:0;letter-spacing:-.02em}
h1 span{display:block;font:700 10pt/1.4 B;color:#5A3FD6;letter-spacing:0}
.book{text-align:right;font:9pt/1.5 "Noto Sans CJK SC",sans-serif;color:#4A4768}
h2{font:700 11pt/1 B;margin:14px 0 6px;color:#5A3FD6}
table{width:100%;border-collapse:collapse}
td{padding:5px 6px;border-bottom:1px solid #E4E0F3;vertical-align:top}
tr{page-break-inside:avoid}
.n{width:18px;color:#75728F;font:700 8.5pt B}
.w{width:118px}.word{display:block;font:750 11.5pt/1.2 B}
.ipa{font:8.5pt "DejaVu Sans",sans-serif;color:#4A4768}
.p{width:38px;font-style:italic;color:#5A3FD6;font-weight:700}
.zh{width:120px;font-family:"Noto Sans CJK SC",sans-serif}
.s b{background:#FFE39A}.src{display:block;font-size:7.5pt;color:#75728F}
footer{margin-top:12px;font-size:7.5pt;color:#75728F}
</style></head><body>
<header><h1><span>Unit 1 Growing up</span>Word list</h1>
<div class="book">外语教学与研究出版社<br>普通高中教科书 英语 选择性必修 第二册</div></header>
${groups.map((ws, g) => `<h2>Words ${g * 10 + 1}–${g * 10 + 10}</h2><table>${rows(ws, g * 10)}</table>`).join('')}
<footer>Sentences from the textbook, for classroom use. Practise these words online: listen, say and spell each one.</footer>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const tmp = path.join(root, 'tools', '.wordlist.html');
  fs.writeFileSync(tmp, html);
  await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await page.pdf({ path: path.join(root, 'downloads/unit1-word-list.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  fs.unlinkSync(tmp);
  await browser.close();
  console.log('Saved downloads/unit1-word-list.pdf');
})();
