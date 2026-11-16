// LP公開ガイド ビルドスクリプト
// 使い方: node build.js   （fonts/ が無い場合は README の手順で用意）
// src/*.html の <!--#include name {"key":"value"}--> を src/partials/name を差し込み、
// {{key}} を置換したうえで build/*.html を作り、Chromium で A4 PDF に変換します。
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const BUILD = path.join(ROOT, 'build');
const OUT = path.join(ROOT, 'pdf');

const DOCS = [
  { src: 'conoha.html', pdf: 'LP_Upload_Guide_ConoHa.pdf' },
  { src: 'xserver.html', pdf: 'LP_Upload_Guide_Xserver.pdf' },
  { src: 'troubleshooting.html', pdf: 'LP_Upload_Troubleshooting.pdf' },
];

function expand(html, vars, depth = 0) {
  if (depth > 5) throw new Error('include too deep');
  html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
  html = html.replace(/<!--#include\s+([\w.\-]+)\s*(\{[\s\S]*?\})?\s*-->/g, (_, name, json) => {
    const local = Object.assign({}, vars, json ? JSON.parse(json) : {});
    const body = fs.readFileSync(path.join(SRC, 'partials', name), 'utf8');
    return expand(body, local, depth + 1);
  });
  return html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
}

(async () => {
  fs.mkdirSync(BUILD, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.copyFileSync(path.join(SRC, 'common.css'), path.join(BUILD, 'common.css'));
  const browser = await chromium.launch();
  for (const d of DOCS.filter((x) => !process.argv[2] || x.src.startsWith(process.argv[2]))) {
    const raw = fs.readFileSync(path.join(SRC, d.src), 'utf8');
    const m = raw.match(/<meta name="guide-vars" content='([^']*)'/);
    const vars = m ? JSON.parse(m[1]) : {};
    const html = expand(raw, vars);
    const left = html.match(/\{\{\w+\}\}/g);
    if (left) throw new Error(`${d.src}: 未置換の変数 ${[...new Set(left)].join(', ')}`);
    const built = path.join(BUILD, d.src);
    fs.writeFileSync(built, html);

    const page = await browser.newPage();
    await page.goto('file://' + built, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const pages = [...document.querySelectorAll('.page')];
      const title = document.querySelector('meta[name="foot-title"]')?.content || document.title;
      pages.forEach((p, i) => {
        if (p.classList.contains('cover')) return;
        const f = document.createElement('div');
        f.className = 'page-foot';
        f.innerHTML = `<span>${title}</span><span class="pno">${i + 1} / ${pages.length}</span>`;
        p.appendChild(f);
      });
      const missing = [];
      document.querySelectorAll('.pref').forEach((s) => {
        const t = document.getElementById(s.dataset.ref);
        if (!t) { missing.push(s.dataset.ref); s.textContent = 'p.?'; return; }
        const pg = t.closest('.page');
        s.textContent = 'p.' + (pages.indexOf(pg) + 1);
      });
      // はみ出しチェック
      const overflow = [];
      pages.forEach((p, i) => {
        const limit = p.getBoundingClientRect().bottom - 13 * 3.78; // フッター上端付近
        [...p.querySelectorAll('*')].forEach((el) => {
          if (el.closest('.page-foot')) return;
          const r = el.getBoundingClientRect();
          if (r.height > 0 && r.bottom > limit + 1 && !overflow.includes(i + 1)) overflow.push(i + 1);
        });
      });
      return { count: pages.length, missing, overflow };
    });
    await page.pdf({ path: path.join(OUT, d.pdf), printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log(`${d.pdf}: ${report.count}ページ`
      + (report.missing.length ? ` / 参照先なし: ${report.missing.join(',')}` : '')
      + (report.overflow.length ? ` / はみ出し疑い: p.${report.overflow.join(', p.')}` : ''));
  }
  await browser.close();
})();
