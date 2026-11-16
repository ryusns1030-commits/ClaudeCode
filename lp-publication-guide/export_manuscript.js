// build/*.html から、Canva に移しやすい「ページ別原稿」(Markdown) を書き出します。
// 使い方: node build.js && node export_manuscript.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DOCS = [
  ['conoha.html', 'Canva_Manuscript_ConoHa.md', 'はじめてでもできる！LP公開ガイド｜ConoHa WING編'],
  ['xserver.html', 'Canva_Manuscript_Xserver.md', 'はじめてでもできる！LP公開ガイド｜エックスサーバー編'],
  ['troubleshooting.html', 'Canva_Manuscript_Troubleshooting.md', 'ホームページが表示されないときの確認ガイド'],
];

(async () => {
  const browser = await chromium.launch();
  for (const [src, out, title] of DOCS) {
    const page = await browser.newPage();
    await page.goto('file://' + path.join(__dirname, 'build', src));
    const pages = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
      // 参照ページ番号を build.js と同じ方法で埋める
      const all = [...document.querySelectorAll('.page')];
      p.querySelectorAll('.pref').forEach((s) => {
        const t = document.getElementById(s.dataset.ref);
        s.textContent = t ? 'p.' + (all.indexOf(t.closest('.page')) + 1) : 'p.?';
      });
      const figs = [];
      p.querySelectorAll('.mock').forEach((m) => {
        const marks = [...m.querySelectorAll('.hl')].map((h) => h.innerText.replace(/\s+/g, ' ').trim());
        figs.push('説明用イメージ（実際の画面とは異なります）。赤枠＋番号: ' + (marks.join(' / ') || 'なし'));
      });
      if (p.querySelector('.cmp')) figs.push('「正しい例（緑枠）」と「間違った例（赤枠）」を左右に並べる');
      if (p.querySelector('.tree')) figs.push('フォルダ構成図（フォルダ=黄色アイコン、ファイル=青アイコン、公開フォルダ=黄色背景＋赤枠）');
      if (p.querySelector('.mcard')) figs.push('8つのたとえイラスト（家・土地・住所の看板・骨組み・内装・スイッチ・トラック・カギ）');
      p.querySelectorAll('.page-foot, svg').forEach((n) => n.remove());
      p.querySelectorAll('td, th').forEach((c) => { c.innerText = c.innerText + ' ｜ '; });
      return { no: i + 1, text: p.innerText.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(), figs };
    }));
    let md = `# ${title} — Canva用ページ別原稿\n\n`;
    md += '共通デザイン指定：A4縦／白背景／メイン #1f3a5f（ネイビー）／アクセント #3aa8a0（ブルーグリーン）／注意 #fff8e1 背景＋#e9c44c 枠／成功 #e9f7ef 背景＋#2e9e5b ✓／STOP #fdecec 背景＋#d93a3a 枠／クリック位置は赤枠＋赤丸数字。本文 12.5pt 以上、余白 16mm。フォント Noto Sans JP。\n\n';
    md += '画面図はすべて「説明用イメージ」と明記し、実際の管理画面のスクリーンショットは使用しないこと（利用許可未確認のため）。\n\n';
    for (const pg of pages) {
      md += `---\n\n## ${pg.no}ページ\n\n`;
      if (pg.figs.length) md += '**図解・画像配置指示**\n' + pg.figs.map((f) => `- ${f}`).join('\n') + '\n\n';
      md += '**原稿**\n\n```text\n' + pg.text + '\n```\n\n';
    }
    fs.writeFileSync(path.join(__dirname, 'docs', out), md);
    console.log(out, pages.length + 'ページ');
    await page.close();
  }
  await browser.close();
})();
