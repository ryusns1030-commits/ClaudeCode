/* 決定論的アニメーションエンジン：setTime(t) で任意時刻の1フレームを描画する */
(function () {
const TL = window.TL;
const $ = (s, r = document) => r.querySelector(s);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eOut = p => 1 - Math.pow(1 - p, 3);
const eBack = p => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const GRADS = ["#7b3fe4", "#b235c4", "#e1306c", "#f05a4a", "#f77737", "#f9963f", "#fcaf45"];
const PAL4 = ["#7b3fe4", "#e1306c", "#f77737", "#16a3a0"];

// r: 表示番号（0=シーン頭）, a: アニメ種別, d: 遅延
const R = (r, a = "pop", d = 0) => `data-r="${r}" data-a="${a}" data-d="${d}"`;

/* ---------------- scene builders ---------------- */
const B = {};
B.title = d => `
 <div class="title-wrap">
  <div class="kicker" ${R(0, "pop", 0.1)}>${esc(d.kicker)}</div>
  <div class="big" ${R(0, "up", 0.3)}><span class="grad">${esc(d.title)}</span></div>
  <div class="subt" ${R(1, "up")}>${esc(d.sub)}</div>
  <div class="neq" ${R(2, "pop")}><span>投稿を「作る」</span><em>≠</em><span>Instagramを「運用する」</span></div>
  <div style="display:flex;gap:12px" ${R(3, "up")}>${[1,2,3,4,5,6,7].map(i => `<div style="width:62px;height:62px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:900;font-size:28px;background:${GRADS[i-1]}">${i}</div>`).join("")}</div>
 </div>`;

B.chat = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="chatwin" ${R(0, "up", 0.2)}>
  <div class="chathead"><div class="gptlogo">AI</div>ChatGPT</div>
  <div class="msgs">
   <div class="msg user" ${R(1, "up")}><span data-type="${esc(d.msgs[0][1])}" data-tr="1" data-cps="16"></span></div>
   <div class="msg ai" ${R(2, "up")}><span data-type="${esc(d.msgs[1][1])}" data-tr="2" data-cps="30"></span></div>
  </div>
 </div>
 <div class="note red" ${R(3, "up")}><b>!</b>${esc(d.note)}</div>`;

B.list = d => {
  const n = d.items.length;
  const icon = (i) => d.icon === "worry" ? `<div class="ic worry">!</div>` : d.icon === "check" ?
    `<div class="ic check"><svg width="34" height="34" viewBox="0 0 34 34"><path d="M6 18 L14 26 L28 9" fill="none" stroke="#18a874" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="40" data-dash="${i + 1}"/></svg></div>` :
    `<div class="ic num">${i + 1}</div>`;
  const avail = 668 - 150 - (d.banner ? 135 : 45);
  const rowH = Math.min(104, avail / n);
  const fs = Math.round(Math.min(44, rowH * 0.46));
  const big = `font-size:${fs}px;height:${Math.round(rowH - 12)}px;padding:0 24px;`;
  return `<h2 class="bt">${esc(d.title)}</h2>
  <div class="items" style="gap:12px">${d.items.map((it, i) => `<div class="item" style="${big}" ${R(i + 1, "left")}>${icon(i)}<span>${esc(it)}</span></div>`).join("")}</div>
  ${d.banner ? `<div class="banner" ${R(n + 1, "up")}>${esc(d.banner)}</div>` : ""}`;
};

B.stats = d => {
  const mx = Math.max(...d.bars.map(b => b[1]));
  return `<h2 class="bt">${esc(d.title)}</h2><span class="tag">${esc(d.period)}</span>
  <div class="chart">
   <div style="position:absolute;left:0;top:-14px;font-size:26px;font-weight:800;color:var(--sub)" ${R(1, "fade")}>Instagramの閲覧数</div>
   <div class="axis"></div>
   ${d.bars.map((b, i) => `<div class="bar" style="left:${80 + i * 260}px;height:${Math.round(b[1] / mx * 215)}px;background:${i ? "linear-gradient(180deg,#e1306c,#f77737)" : "#cbbfd9"}" ${R(1, "growy", i * 0.5)}>
      <div class="v"><span data-count="${b[1]}" data-dec="1" data-cr="1" data-cd="${i * 0.5}"></span><small style="font-size:24px">${esc(d.unit)}</small></div><div class="l">${esc(b[0])}</div></div>`).join("")}
   <div style="position:absolute;left:250px;top:150px;font-size:56px;color:#d8c8e6;font-weight:900" ${R(1, "fade", 0.8)}>➜</div>
  </div>
  ${d.cards.map((c, i) => `<div class="scard" style="top:${140 + i * 175}px" ${R(2 + i, "left")}>
     <div class="k">${esc(c[0])}</div><div class="s">${esc(c[1])}</div>
     <div class="n" style="color:${i ? "#7b3fe4" : "#e1306c"}"><span data-count="${c[2].replace(/[^0-9.]/g, "")}" data-pre="${c[2].startsWith("+") ? "+" : ""}" data-dec="0" data-cr="${2 + i}" data-cd="0" data-fmt="comma"></span><small>${esc(c[3])}</small></div></div>`).join("")}
  <div class="note" ${R(4, "up")}><b>!</b>${esc(d.note)}</div>`;
};

B.versus = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="vs">
  <div style="display:flex;flex-direction:column;align-items:center;gap:18px" ${R(1, "pop")}>
   <div class="circ" style="width:330px;height:330px;background:linear-gradient(135deg,#7b3fe4,#e1306c)"><div class="n">${esc(d.left[1])}<small>${esc(d.left[2])}</small></div></div>
   <div style="font-size:34px;font-weight:900">${esc(d.left[0])}</div></div>
  <div style="font-size:60px;font-weight:900;color:#d0c3dc" ${R(2, "fade")}>vs</div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:18px" ${R(2, "pop")}>
   <div style="height:330px;display:flex;align-items:center"><div class="circ" style="width:140px;height:140px;background:#f2a7b9"><div class="n" style="font-size:44px">${esc(d.right[1])}</div></div></div>
   <div style="font-size:34px;font-weight:900">${esc(d.right[0])}</div></div>
 </div>
 <div class="note red" ${R(3, "up")}><b>?</b>${esc(d.note)}</div>`;

B.funnel = d => {
  const W = [1080, 880, 690, 520, 380];
  return `<h2 class="bt">${esc(d.title)}</h2><div class="funnel">${d.stages.map((s, i) => `
   <div class="fs" style="width:${W[i]}px;height:66px;background:${GRADS[Math.min(6, i * 1.5 | 0)]}" ${R(i + 1, "growx")}>${esc(s)}</div>`).join("")}</div>
   <div class="note" ${R(6, "up")}><b>!</b>${esc(d.note)}</div>`;
};

B.roadmap = d => {
  const pos = [[0, 0], [302, 0], [604, 0], [906, 0], [151, 236], [453, 236], [755, 236]];
  return `<h2 class="bt">${esc(d.title)}</h2><div class="road">${d.steps.map((s, i) => `
   <div class="rstep" style="left:${pos[i][0]}px;top:${pos[i][1]}px" ${R(i + 1, "pop")}><div class="no">${i + 1}</div><div class="tx">${esc(s)}</div></div>`).join("")}</div>`;
};

B.chapter = d => `
 <div class="chap">
  <div class="st" ${R(0, "fade", 0.1)}>STEP</div>
  <div class="num" ${R(0, "spin", 0.2)}>${esc(d.num)}</div>
  <div class="tt" ${R(0, "up", 0.5)}>${esc(d.title)}</div>
 </div>`;

B.sheet = d => `
 <h2 class="bt">${esc(d.title)}</h2>${d.tag ? `<span class="tag">${esc(d.tag)}</span>` : ""}
 <div class="sheet" ${R(0, "up", 0.2)}>${d.rows.map((r, i) => `
   <div class="row"><div class="lb">${esc(r[0])}</div><div class="vl"><span data-type="${esc(r[1])}" data-tr="${i + 1}" data-cps="20" data-td="${0}"></span></div></div>`).join("")}</div>
 ${d.goal ? `<div class="banner" style="font-size:29px" ${R(d.rows.length + 1, "up")}>${esc(d.goal)}</div>` : ""}`;

B.prompt = d => {
  let acc = 0;
  const lines = d.lines.map((l, i) => {
    const html = `<div class="pl"><div class="hlbg" style="right:${d.hl.includes(i) ? -10 : 9999}px" ${d.hl.includes(i) ? `data-hl="2"` : ""}></div><span data-type="${esc(l)}" data-tr="1" data-cps="45" data-td="${acc.toFixed(2)}" ${d.hl.includes(i) ? `data-hlc="2"` : ""}></span></div>`;
    acc += l.length / 45 + 0.12;
    return html;
  }).join("");
  return `<h2 class="bt">${esc(d.title)}</h2><span class="tag">プロンプト①より抜粋</span>
   <div class="pbox" ${R(0, "up", 0.2)}>${lines}</div>`;
};

B.grid4 = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="g4">${d.cards.map((c, i) => `
  <div class="gc" ${R(i + 1, "pop")}>
   <div class="hd" style="background:${PAL4[i]}"><span>${esc(c[0])}</span><small>${esc(c[1])}</small></div>
   <div class="bd"><div>例：${esc(c[2])}</div><div class="m"><div class="mbg" data-hl="5"></div>指標：${esc(c[3])}</div></div>
  </div>`).join("")}</div>`;

B.work = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="phones">${[0, 1, 2].map(i => `<div class="phone" ${R(1, "pop", i * 0.2)}><div class="q">?</div>
   <div style="position:absolute;left:14px;right:14px;bottom:14px;height:12px;border-radius:6px;background:rgba(255,255,255,.7)"></div>
   <div style="position:absolute;left:14px;right:60px;bottom:34px;height:12px;border-radius:6px;background:rgba(255,255,255,.7)"></div></div>`).join("")}</div>
 <div class="opts"><div class="qq" ${R(2, "fade")}>${esc(d.q)}</div>${d.opts.map((o, i) => `<div class="opt" ${R(2, "left", 0.2 + i * 0.15)}>${esc(o)}</div>`).join("")}</div>
 <div class="note red" ${R(3, "up")}><b>!</b>${esc(d.warn)}</div>`;

const IDEAS = [["運動が続かない\n本当の理由", 0], ["初心者向け\nストレッチ", 1], ["失敗しない\nジムの選び方", 2], ["三日坊主に\nなる原因", 0], ["朝5分の\nストレッチ", 1],
  ["ジム見学で\n見るポイント", 2], ["続かない人の\n共通点", 0], ["簡単ストレッチ\n3選", 1], ["運動が続かない\nのはなぜ？", 0], ["ジム選びで\n迷ったら", 2]];
const GCOL = ["#7b3fe4", "#e1306c", "#f77737"];
B.ideas = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 ${IDEAS.map((x, i) => `<div class="idea" data-idea="${i}" ${R(1, "pop", i * 0.12)}>${esc(x[0]).replace(/\n/g, "<br>")}</div>`).join("")}
 ${[0, 1, 2].map(g => `<div class="glabel" style="left:${115 + g * 380}px;top:420px;color:${GCOL[g]}" ${R(2, "pop", 0.9)}>→ 実質1案</div>`).join("")}
 <div class="banner" style="font-size:30px" ${R(2, "up", 1.2)}>${esc(d.rule)}</div>`;

B.calendar = d => `
 <h2 class="bt">${esc(d.title)}</h2><span class="tag">${esc(d.tag)}</span>
 <div class="cal">${d.days.map((x, i) => {
   const on = !!x[1]; const k = [0, 2, 4].indexOf(i) + 2;
   return `<div class="day"><div class="dn" style="${i >= 5 ? "color:" + (i == 5 ? "#2f5fb3" : "#e8473f") : ""}">${x[0]}</div>
    ${on ? `<div class="post" style="background:${PAL4[k - 2]}" ${R(k, "pop")}><div class="fmt">${esc(x[1])}</div><div class="pp">${esc(x[2])}</div><div class="th">${esc(x[3])}</div></div>`
         : `<div class="rest" ${R(1, "fade", i * 0.08)}>休み</div>`}</div>`; }).join("")}</div>`;

B.flow = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="flow">${d.steps.map((s, i) => `${i ? `<div class="farr" ${R(i + 1, "fade")}></div>` : ""}
   <div class="fbox" style="background:${PAL4[i]}" ${R(i + 1, "pop")}><div class="h">${esc(s[0])}</div><div class="d">${esc(s[1])}</div></div>`).join("")}</div>
 <div class="note" ${R(5, "up")}><b>!</b>${esc(d.note)}</div>`;

B.twocol = d => {
  const col = (c, r, color) => `<div class="col" ${R(r, "up")}><h3 style="color:${color}">${esc(c[0])}</h3>${c[1].map((x, i) =>
    `<div class="cl" ${R(r, "left", 0.3 + i * 0.35)}><b style="background:${color}">${i + 1}</b>${esc(x)}</div>`).join("")}</div>`;
  return `<h2 class="bt">${esc(d.title)}</h2><div class="cols">${col(d.left, 1, "#7b3fe4")}${col(d.right, 2, "#e1306c")}</div>`;
};

B.checklist = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="chk">${d.items.map((x, i) => `<div class="ck" ${R(i + 1, "left")}>${d.hl.includes(i) ? `<div class="hbg" data-hl="${d.items.length + 1}"></div>` : ""}
   <div class="box"><svg width="52" height="52" viewBox="0 0 52 52"><path d="M8 26 L20 38 L46 8" fill="none" stroke="#18a874" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="60" data-dash="${i + 1}"/></svg></div>${esc(x)}</div>`).join("")}</div>`;

const MICON = [
  `<svg width="56" height="56" viewBox="0 0 56 56"><path d="M4 28 C14 12 42 12 52 28 C42 44 14 44 4 28Z" fill="none" stroke="#fff" stroke-width="5"/><circle cx="28" cy="28" r="8" fill="#fff"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 56 56"><circle cx="20" cy="20" r="8" fill="#fff"/><circle cx="38" cy="22" r="7" fill="#fff" opacity=".8"/><path d="M6 46 C6 32 34 32 34 46Z" fill="#fff"/><path d="M28 46 C28 34 52 34 52 46Z" fill="#fff" opacity=".8"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="22" fill="none" stroke="#fff" stroke-width="5"/><circle cx="28" cy="23" r="7" fill="#fff"/><path d="M15 41 C18 31 38 31 41 41" fill="#fff"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 56 56"><circle cx="22" cy="20" r="9" fill="#fff"/><path d="M6 48 C6 32 38 32 38 48Z" fill="#fff"/><path d="M44 18 V34 M36 26 H52" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`];
B.metrics = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="mets">${d.cards.map((c, i) => `<div class="mc" ${R(i + 1, "pop")}><div class="ico" style="background:${PAL4[i]}">${MICON[i]}</div>
   <div class="h">${esc(c[0]).replace("プロフィールアクセス", "プロフィール<br>アクセス")}</div><div class="d">${esc(c[1])}</div></div>`).join("")}</div>
 <div class="neqmark" ${R(5, "stamp")}>≠</div>`;

B.calc = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="formula" ${R(1, "up")}><div class="fbx">${esc(d.expr[0])}</div><div class="op">÷</div><div class="fbx">${esc(d.expr[1])}</div><div class="op">＝</div><div class="fbx" style="font-size:52px;color:#e8473f;position:relative">？％
 <svg style="position:absolute;left:50%;top:50%;width:180px;height:180px;margin:-90px 0 0 -90px" viewBox="0 0 200 200" ${R(2, "stamp")}><circle cx="100" cy="100" r="84" fill="none" stroke="#e8473f" stroke-width="16"/><path d="M58 58 L142 142 M142 58 L58 142" stroke="#e8473f" stroke-width="18" stroke-linecap="round"/></svg></div></div>
 <div class="calcmsg" ${R(2, "up", 0.3)}>${esc(d.msg)}</div>
 <div class="zero" ${R(3, "up")}><div class="z">${esc(d.tip[0])} <span style="color:#e8473f">≠</span> ${esc(d.tip[1])}</div><div class="t">${esc(d.tip[2])}</div></div>`;

B.steps = d => `
 <h2 class="bt">${esc(d.title)}</h2>
 <div class="stp">${d.items.map((x, i) => `<div class="sp" ${R(i + 1, "left")}><div class="n">${i + 1}</div>${esc(x)}</div>`).join("")}</div>`;

B.weeks = d => `
 <h2 class="bt">${esc(d.title)}</h2><span class="tag">※成果を保証する期間ではありません</span>
 <div class="wk">${d.weeks.map((w, i) => `<div class="wc" ${R(i + 1, "up")}><div class="hd" style="background:${PAL4[i]}"><div class="w">${esc(w[0])}</div><div class="tt">${esc(w[1])}</div></div>
   <ul>${w[2].map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>`;

B.ending = d => `
 <div class="endq">
  <div style="display:flex;gap:18px" ${R(0, "up", 0.2)}>${["状況を整理する", "投稿案を考える", "数字を比較する", "改善の選択肢を作る"].map((x, i) =>
    `<div style="padding:12px 24px;border-radius:999px;font-size:28px;font-weight:800;color:#fff;background:${PAL4[i]}">${x}</div>`).join("")}</div>
  <div class="q" ${R(1, "pop")}><span class="grad">${esc(d.quote)}</span></div>
  <div class="subbtn" ${R(2, "up")}><div class="like">👍 高評価</div><div class="sb">チャンネル登録</div></div>
 </div>`;

/* ---------------- characters ---------------- */
function charSVG(kind) {
  if (kind === "H") return `
<svg viewBox="0 0 340 520" width="340" height="520">
 <g id="Hbody">
  <path d="M60 330 C40 230 50 110 170 92 C290 110 300 230 280 330 C265 350 240 350 230 335 L110 335 C100 350 75 350 60 330Z" fill="#6e4434"/>
  <path d="M36 520 C36 425 92 382 170 382 C248 382 304 425 304 520Z" fill="#ff8f8f"/>
  <path d="M132 384 L170 448 L208 384Z" fill="#fff"/>
  <path d="M120 386 L170 470 L132 384Z M220 386 L170 470 L208 384Z" fill="#ff7a7a"/>
  <circle cx="170" cy="490" r="7" fill="#fff"/>
  <rect x="150" y="318" width="40" height="72" rx="18" fill="#f8d2bd"/>
 </g>
 <g id="Hhead">
  <ellipse cx="72" cy="228" rx="14" ry="20" fill="#fbd9c6"/><ellipse cx="268" cy="228" rx="14" ry="20" fill="#fbd9c6"/>
  <ellipse cx="170" cy="215" rx="100" ry="110" fill="#ffe6d6"/>
  <ellipse cx="112" cy="266" rx="20" ry="11" fill="#ff9aa8" opacity=".5"/><ellipse cx="228" cy="266" rx="20" ry="11" fill="#ff9aa8" opacity=".5"/>
  <g class="eyes">
   <g class="eo"><ellipse cx="128" cy="232" rx="15" ry="20" fill="#4a2c22"/><ellipse cx="212" cy="232" rx="15" ry="20" fill="#4a2c22"/>
    <ellipse cx="128" cy="238" rx="10" ry="12" fill="#8a5a3c"/><ellipse cx="212" cy="238" rx="10" ry="12" fill="#8a5a3c"/>
    <circle cx="123" cy="224" r="6" fill="#fff"/><circle cx="207" cy="224" r="6" fill="#fff"/>
    <path d="M108 214 Q128 202 148 214" stroke="#3a2018" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M192 214 Q212 202 232 214" stroke="#3a2018" stroke-width="5" fill="none" stroke-linecap="round"/></g>
   <g class="ec" style="display:none"><path d="M110 234 Q128 240 146 234" stroke="#3a2018" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M194 234 Q212 240 230 234" stroke="#3a2018" stroke-width="5" fill="none" stroke-linecap="round"/></g>
   <g class="eh" style="display:none"><path d="M110 236 Q128 216 146 236" stroke="#3a2018" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M194 236 Q212 216 230 236" stroke="#3a2018" stroke-width="6" fill="none" stroke-linecap="round"/></g>
  </g>
  <g class="brows"><path class="bl" d="M110 190 Q126 182 142 188" stroke="#5a3424" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path class="br" d="M198 188 Q214 182 230 190" stroke="#5a3424" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  <g class="mouth" transform="translate(170 284)">
   <path class="mc" d="M-12 -2 Q0 8 12 -2" stroke="#b8484f" stroke-width="5" fill="none" stroke-linecap="round"/>
   <g class="mo"><ellipse rx="15" ry="10" fill="#9c2f3f"/><ellipse cy="5" rx="9" ry="4" fill="#ff8e9a"/></g>
  </g>
  <path d="M70 215 C66 120 118 96 170 96 C228 96 276 124 272 210 C256 176 240 158 222 146 C214 170 186 180 152 176 C160 162 162 150 160 140 C130 166 100 190 70 215Z" fill="#7d4c39"/>
  <path d="M232 118 l10 -18 l10 18 l18 2 l-14 12 l4 18 l-18 -10 l-18 10 l4 -18 l-14 -12Z" fill="#ffc54d"/>
 </g>
</svg>`;
  return `
<svg viewBox="0 0 340 520" width="340" height="520">
 <g id="Kbody">
  <path d="M30 520 C30 420 90 380 170 380 C250 380 310 420 310 520Z" fill="#2f3f6b"/>
  <path d="M138 380 L170 430 L202 380Z" fill="#cfe3ff"/>
  <path d="M120 384 L160 470 L136 380Z M220 384 L180 470 L204 380Z" fill="#24325a"/>
  <path d="M164 420 L176 420 L180 500 L170 512 L160 500Z" fill="#e1306c"/>
  <rect x="150" y="316" width="40" height="72" rx="16" fill="#efc8ad"/>
 </g>
 <g id="Khead">
  <ellipse cx="76" cy="226" rx="14" ry="20" fill="#efc8ad"/><ellipse cx="264" cy="226" rx="14" ry="20" fill="#efc8ad"/>
  <ellipse cx="170" cy="212" rx="96" ry="110" fill="#f9dcc6"/>
  <g class="eyes">
   <g class="eo"><ellipse cx="132" cy="230" rx="10" ry="13" fill="#262230"/><ellipse cx="208" cy="230" rx="10" ry="13" fill="#262230"/>
    <circle cx="129" cy="225" r="4" fill="#fff"/><circle cx="205" cy="225" r="4" fill="#fff"/></g>
   <g class="ec" style="display:none"><path d="M120 232 Q132 237 144 232" stroke="#262230" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M196 232 Q208 237 220 232" stroke="#262230" stroke-width="5" fill="none" stroke-linecap="round"/></g>
   <g class="eh" style="display:none"><path d="M120 234 Q132 218 144 234" stroke="#262230" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M196 234 Q208 218 220 234" stroke="#262230" stroke-width="6" fill="none" stroke-linecap="round"/></g>
  </g>
  <g fill="none" stroke="#33303d" stroke-width="5"><rect x="102" y="204" width="60" height="48" rx="14"/><rect x="178" y="204" width="60" height="48" rx="14"/><path d="M162 222 Q170 214 178 222"/><path d="M102 220 L84 214 M238 220 L256 214"/></g>
  <g class="brows"><path class="bl" d="M108 186 Q130 176 152 184" stroke="#2b2a33" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path class="br" d="M188 184 Q210 176 232 186" stroke="#2b2a33" stroke-width="8" fill="none" stroke-linecap="round"/></g>
  <g class="mouth" transform="translate(170 286)">
   <path class="mc" d="M-14 0 Q0 7 14 0" stroke="#9b4a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
   <g class="mo"><ellipse rx="15" ry="10" fill="#7d2b2b"/><ellipse cy="5" rx="9" ry="4" fill="#e07a7a"/></g>
  </g>
  <path d="M76 205 C62 112 118 84 175 84 C238 84 284 112 266 200 C258 160 240 140 206 132 C176 150 126 150 98 138 C88 158 80 180 76 205Z" fill="#2b2a33"/>
  <path d="M206 132 C226 134 248 148 262 176" stroke="#8a8796" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
 </g>
</svg>`;
}

const MARKS = {
  surprise: `<svg width="70" height="110" viewBox="0 0 70 110"><path d="M22 6 H48 L42 70 H28Z" fill="#e8473f"/><circle cx="35" cy="92" r="11" fill="#e8473f"/></svg>`,
  sweat: `<svg width="60" height="90" viewBox="0 0 60 90"><path d="M30 4 C36 30 54 46 54 62 A24 24 0 0 1 6 62 C6 46 24 30 30 4Z" fill="#7cc6f2" stroke="#3e95cf" stroke-width="4"/><ellipse cx="22" cy="60" rx="5" ry="9" fill="#fff" opacity=".8"/></svg>`,
  think: `<svg width="80" height="110" viewBox="0 0 80 110"><path d="M18 34 C18 8 62 8 62 34 C62 52 40 54 40 72" stroke="#7b3fe4" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="40" cy="96" r="9" fill="#7b3fe4"/></svg>`,
  happy: `<svg width="90" height="90" viewBox="0 0 90 90"><path d="M45 8 L53 36 L82 38 L58 54 L67 82 L45 64 L23 82 L32 54 L8 38 L37 36Z" fill="#fcaf45" stroke="#f77737" stroke-width="3"/></svg>`,
};

const chars = {};
function initChar(k) {
  const el = $("#char" + k);
  el.innerHTML = charSVG(k) + `<div class="mark" style="left:${k === "H" ? 250 : 20}px;top:50px"></div>`;
  chars[k] = { el, svg: el.querySelector("svg"), head: el.querySelector(`#${k}head`), eo: el.querySelector(".eo"), ec: el.querySelector(".ec"),
    eh: el.querySelector(".eh"), eyes: el.querySelector(".eyes"), bl: el.querySelector(".bl"), br: el.querySelector(".br"),
    mc: el.querySelector(".mc"), mo: el.querySelector(".mo"), mark: el.querySelector(".mark"), markKind: null };
}

/* ---------------- timeline helpers ---------------- */
const ALL_LINES = [];
TL.scenes.forEach((sc, si) => sc.lines.forEach((ln, li) => ALL_LINES.push(Object.assign({ si, li }, ln))));

function revealTimes(sc) {
  const rt = { 0: sc.start + 0.25 };
  let cur = 0;
  for (const ln of sc.lines) {
    if (ln.show != null && ln.show > cur) {
      for (let j = 0; j < ln.show - cur; j++) rt[cur + 1 + j] = ln.start + j * 0.35;
      cur = ln.show;
    }
  }
  return rt;
}

let cur = { idx: -1 };
function buildScene(idx) {
  const sc = TL.scenes[idx];
  const root = $("#scene");
  root.innerHTML = B[sc.type](sc.data, sc);
  cur = { idx, sc, root, rt: revealTimes(sc),
    els: [...root.querySelectorAll("[data-r]")].map(e => ({ e, r: +e.dataset.r, a: e.dataset.a, d: +e.dataset.d || 0 })),
    types: [...root.querySelectorAll("[data-type]")],
    counts: [...root.querySelectorAll("[data-count]")],
    hls: [...root.querySelectorAll("[data-hl]")],
    dashes: [...root.querySelectorAll("[data-dash]")],
    ideas: [...root.querySelectorAll("[data-idea]")],
  };
  $("#chapter").textContent = sc.chapter || "はじめに";
}

function applyAnim(o, p) {
  const s = o.e.style;
  if (p <= 0) { s.opacity = 0; s.transform = o.a === "growx" ? "scaleX(0)" : o.a === "growy" ? "scaleY(0)" : ""; return; }
  const q = clamp(p);
  switch (o.a) {
    case "pop": s.opacity = clamp(q * 3); s.transform = `scale(${0.6 + 0.4 * eBack(q)})`; break;
    case "up": s.opacity = clamp(q * 2); s.transform = `translateY(${(1 - eOut(q)) * 40}px)`; break;
    case "left": s.opacity = clamp(q * 2); s.transform = `translateX(${(1 - eOut(q)) * -50}px)`; break;
    case "fade": s.opacity = q; s.transform = ""; break;
    case "growx": s.opacity = clamp(q * 3); s.transform = `scaleX(${eOut(q)})`; break;
    case "growy": s.opacity = 1; s.transform = `scaleY(${eOut(q)})`; break;
    case "spin": s.opacity = clamp(q * 2); s.transform = `scale(${0.3 + 0.7 * eBack(q)}) rotate(${(1 - eOut(q)) * -200}deg)`; break;
    case "stamp": s.opacity = clamp(q * 4); s.transform = `scale(${1 + (1 - eOut(q)) * 1.4}) rotate(${(1 - eOut(q)) * 20}deg)`; break;
  }
}

function fmtNum(v, dec, comma) {
  let s = v.toFixed(dec);
  if (comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return s;
}

function updateScene(t) {
  const { sc, rt } = cur;
  const durs = { pop: .55, up: .6, left: .55, fade: .6, growx: .7, growy: 1.1, spin: .9, stamp: .45 };
  for (const o of cur.els) {
    const T = rt[o.r];
    applyAnim(o, T === undefined ? 0 : (t - T - o.d) / (durs[o.a] || .6));
  }
  for (const e of cur.types) {
    const T = rt[+e.dataset.tr];
    const full = e.dataset.type;
    if (T === undefined) { e.textContent = ""; continue; }
    const el = t - T - (+e.dataset.td || 0) - 0.25;
    const n = clamp(Math.floor(el * (+e.dataset.cps || 20)), 0, full.length);
    e.textContent = full.slice(0, n);
    const typing = n > 0 && n < full.length;
    if (typing) e.insertAdjacentHTML("beforeend", '<i class="caret"></i>');
    if (e.dataset.hlc) e.style.fontWeight = rt[2] !== undefined && t > rt[2] ? 900 : 500;
    if (e.dataset.hlc) e.style.color = rt[2] !== undefined && t > rt[2] ? "#1f1b2e" : "";
  }
  for (const e of cur.counts) {
    const T = rt[+e.dataset.cr];
    const p = T === undefined ? 0 : eOut(clamp((t - T - (+e.dataset.cd || 0) - 0.1) / 1.3));
    e.textContent = (e.dataset.pre || "") + fmtNum(+e.dataset.count * p, +e.dataset.dec, !!e.dataset.fmt);
  }
  for (const e of cur.hls) {
    const T = rt[+e.dataset.hl];
    const p = T === undefined ? 0 : eOut(clamp((t - T) / 0.6));
    e.style.transformOrigin = "left"; e.style.transform = `scaleX(${p})`; e.style.opacity = p > 0 ? 1 : 0;
  }
  for (const e of cur.dashes) {
    const T = rt[+e.dataset.dash];
    const p = T === undefined ? 0 : clamp((t - T - 0.25) / 0.4);
    const L = +e.getAttribute("stroke-dasharray");
    e.setAttribute("stroke-dashoffset", (L * (1 - p)).toFixed(1));
  }
  if (cur.ideas.length) {
    const T2 = rt[2];
    const g = T2 === undefined ? 0 : eOut(clamp((t - T2) / 0.9));
    const cnt = [0, 0, 0];
    cur.ideas.forEach((e, i) => {
      const [label, grp] = IDEAS[i];
      const gx = 104 + (i % 5) * 228, gy = 160 + Math.floor(i / 5) * 120;
      const k = cnt[grp]++;
      const tx = 165 + grp * 380 + k * 16, ty = 190 + k * 40;
      const x = gx + (tx - gx) * g, y = gy + (ty - gy) * g;
      e.style.left = x + "px"; e.style.top = y + "px";
      e.style.background = g > 0.3 ? GCOL[grp] : "#9b8bb4";
      e.style.zIndex = k;
    });
  }
  // シーンの入り・出
  const inP = eOut(clamp((t - sc.start) / 0.45));
  const outP = clamp((sc.end - t) / 0.3);
  cur.root.style.opacity = Math.min(inP, outP);
  cur.root.style.transform = `translateY(${(1 - inP) * 24}px)`;
}

/* ---------------- characters per frame ---------------- */
function lineAt(spk, t) {
  for (const ln of ALL_LINES) if (ln.s === spk && t >= ln.start && t < ln.start + ln.dur) return ln;
  return null;
}
function exprAt(spk, t) {
  let best = null;
  for (const ln of ALL_LINES) {
    if (ln.s !== spk || !ln.e) continue;
    if (t >= ln.start - 0.05 && t < ln.start + ln.dur + 0.9) best = ln;
  }
  return best;
}
function blinkAt(t, off) {
  const period = 3.3 + off;
  const ph = (t + off * 1.9) % period;
  if (ph < 0.12) return true;
  if (Math.floor((t + off * 1.9) / period) % 4 === 1 && ph > 0.24 && ph < 0.34) return true; // ときどき2回まばたき
  return false;
}

function updateChar(k, t) {
  const c = chars[k];
  const ln = lineAt(k, t);
  let v = 0;
  if (ln) {
    const fi = Math.floor((t - ln.start) * TL.fps);
    v = (+ln.env[fi] || 0) / 9;
  }
  const ex = exprAt(k, t);
  const e = ex ? ex.e : "";
  const ep = ex ? clamp((t - ex.start) / 0.3) : 0;
  const speaking = !!ln;
  // 体の動き
  const off = k === "H" ? 0 : 1.3;
  const breath = Math.sin((t + off) * 2.1) * 0.006;
  const bob = speaking ? -v * 7 : 0;
  const hop = e === "surprise" ? -Math.sin(clamp((t - ex.start) / 0.35) * Math.PI) * 26 : e === "happy" ? -Math.abs(Math.sin((t - ex.start) * 9)) * 8 * clamp(1 - (t - ex.start) / 0.9) : 0;
  const tilt = e === "think" ? (k === "H" ? -5 : 4) * ep : speaking ? Math.sin(t * 3.1 + off) * 1.5 : Math.sin(t * 0.9 + off) * 0.8;
  c.el.style.transform = `translateY(${bob + hop}px) scale(${1 + breath + (speaking ? 0.012 : 0)})`;
  c.head.setAttribute("transform", `rotate(${tilt.toFixed(2)} 170 300)`);
  // 目
  const blink = blinkAt(t, off);
  const happyEyes = e === "happy" && ep > 0;
  c.eo.style.display = !blink && !happyEyes ? "" : "none";
  c.ec.style.display = blink && !happyEyes ? "" : "none";
  c.eh.style.display = happyEyes ? "" : "none";
  const es = e === "surprise" ? 1 + 0.18 * ep : 1;
  const ecx = 170, ecy = 230;
  c.eyes.setAttribute("transform", `translate(${ecx} ${ecy}) scale(${es}) translate(${-ecx} ${-ecy})`);
  // 眉
  const by = e === "surprise" ? -12 * ep : 0;
  const rotL = e === "sweat" ? -14 * ep : e === "think" ? 8 * ep : 0;
  const rotR = e === "sweat" ? 14 * ep : e === "think" ? -6 * ep : 0;
  c.bl.setAttribute("transform", `translate(0 ${by}) rotate(${rotL} 126 186)`);
  c.br.setAttribute("transform", `translate(0 ${by + (e === "think" ? -8 * ep : 0)}) rotate(${rotR} 214 186)`);
  // 口
  if (v > 0.05) {
    c.mo.style.display = ""; c.mc.style.display = "none";
    c.mo.setAttribute("transform", `scale(${0.75 + v * 0.35} ${0.25 + v * 1.0})`);
  } else {
    c.mo.style.display = "none"; c.mc.style.display = "";
    const sm = e === "happy" ? 1.5 : e === "sweat" ? 0.6 : 1;
    c.mc.setAttribute("transform", `scale(${sm} ${e === "sweat" ? -0.6 : sm})`);
  }
  // マーク（！ 汗 ？ ☆）
  const mk = e && ep > 0 && ex && t < ex.start + ex.dur + 0.9 ? e : null;
  if (mk !== c.markKind) { c.mark.innerHTML = mk ? MARKS[mk] : ""; c.markKind = mk; }
  if (mk) {
    const lt = t - ex.start;
    const pp = eBack(clamp(lt / 0.35));
    const wob = Math.sin(lt * 6) * 4;
    const fadeOut = clamp((ex.start + ex.dur + 0.9 - t) / 0.3);
    const dy = mk === "sweat" ? (lt % 1.6) * 14 : wob;
    c.mark.style.opacity = fadeOut;
    c.mark.style.transform = `translateY(${dy}px) scale(${pp}) rotate(${mk === "happy" ? lt * 60 : 0}deg)`;
    c.mark.style.left = (mk === "sweat" ? (k === "H" ? 262 : 250) : (k === "H" ? 250 : 20)) + "px";
    c.mark.style.top = (mk === "sweat" ? 150 : 40) + "px";
  }
}

/* ---------------- subtitles ---------------- */
function updateSub(t) {
  let act = null;
  for (let i = 0; i < ALL_LINES.length; i++) {
    const ln = ALL_LINES[i];
    if (t < ln.start - 0.08) break;
    const nxt = ALL_LINES[i + 1];
    const until = Math.min(ln.start + ln.dur + 0.55, nxt ? nxt.start - 0.08 : 1e9);
    if (t < until) act = ln;
  }
  const box = $("#subbox");
  if (!act) { $("#sub").style.opacity = 0; return; }
  const p = eOut(clamp((t - act.start + 0.08) / 0.18));
  $("#sub").style.opacity = 1;
  const col = act.s === "H" ? "var(--H)" : "var(--K)";
  box.style.borderColor = col;
  box.style.transform = `translateY(${(1 - p) * 10}px)`;
  $("#subname").style.background = col;
  $("#subname").style.left = act.s === "H" ? "34px" : "auto";
  $("#subname").style.right = act.s === "H" ? "auto" : "34px";
  $("#subname").textContent = act.s === "H" ? "ハル（新人SNS担当）" : "クロダ（ベテラン運用者）";
  const tx = $("#subtext");
  if (tx.dataset.key !== act.start + "") {
    tx.dataset.key = act.start + "";
    tx.innerHTML = esc(act.text).replace(/(ChatGPT|Instagram|CTA|LINE|仮説|目的|ターゲット|閲覧数|リーチ|プロフィールアクセス|改善)/g, '<span style="color:' + (act.s === "H" ? "#d23a5b" : "#2f5fb3") + '">$1</span>');
    tx.style.fontSize = act.text.length > 62 ? "37px" : "41px";
  }
  tx.style.opacity = p;
}

/* ---------------- main ---------------- */
function setTime(t) {
  let idx = TL.scenes.findIndex(s => t >= s.start && t < s.end);
  if (idx < 0) idx = t < TL.scenes[0].start ? 0 : TL.scenes.length - 1;
  if (idx !== cur.idx) buildScene(idx);
  updateScene(t);
  updateChar("H", t);
  updateChar("K", t);
  updateSub(t);
  $("#prog i").style.width = (t / TL.duration * 100).toFixed(3) + "%";
  // 背景のゆらぎ
  $("#b1").style.transform = `translate(${Math.sin(t * .2) * 40}px,${Math.cos(t * .17) * 30}px)`;
  $("#b2").style.transform = `translate(${Math.cos(t * .15) * 50}px,${Math.sin(t * .19) * 40}px)`;
  $("#b3").style.transform = `translate(${Math.sin(t * .13) * 60}px,${Math.cos(t * .21) * 20}px)`;
  $("#dots").style.backgroundPosition = `${(t * 6) % 44}px ${(t * 4) % 44}px`;
}

async function init() {
  initChar("H"); initChar("K");
  // 全テキストを事前に描画してフォントのサブセットを読み込ませる
  let all = "ハル（新人SNS担当）クロダ（ベテラン運用者）はじめに　ChatGPT×Instagram 運用講座 ？％＝÷→➜例：指標：プロンプト①より抜粋";
  for (const sc of TL.scenes) { all += JSON.stringify(sc.data) + sc.chapter; for (const l of sc.lines) all += l.text; }
  all += IDEAS.map(x => x[0]).join("") + "状況を整理する投稿案を考える数字を比較する改善の選択肢を作る休み実質1案ここだけ見ていたvs月火水木金土日";
  const pre = $("#preload");
  pre.innerHTML = [500, 700, 800, 900].map(w => `<div style="font-weight:${w}">${esc(all)}</div>`).join("");
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));
  await document.fonts.ready;
  setTime(0);
  window.READY = true;
}
window.setTime = setTime;
init();
})();
