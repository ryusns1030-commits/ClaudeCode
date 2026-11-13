// サムネイル（1280x720）を生成：本編と同じキャラクターを使って盤面だけ差し替える
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
(async () => {
  const tl = JSON.parse(fs.readFileSync(path.join(__dirname, "build/timeline.json"), "utf8"));
  const sc = tl.scenes.find(s => s.id === "case");
  const t = sc.lines[1].start + 0.25; // ハルが驚いている瞬間
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("file://" + path.join(__dirname, "index.html"));
  await page.waitForFunction(() => window.READY === true);
  await page.evaluate(t => window.setTime(t), t);
  await page.evaluate(() => {
    document.querySelector("#sub").style.display = "none";
    document.querySelector("#prog").style.display = "none";
    document.querySelector("#chapter").textContent = "保存版";
    const b = document.querySelector("#board");
    Object.assign(b.style, { left: "250px", top: "110px", width: "1420px", height: "740px" });
    b.innerHTML = `
     <div style="position:absolute;inset:0;padding:50px 60px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:18px">
      <div style="font-size:54px;font-weight:900;color:#fff;padding:10px 40px;border-radius:999px;background:linear-gradient(90deg,#10a37f,#1a7f9c 50%,#e1306c)">ChatGPT × インスタ運用</div>
      <div style="font-size:84px;font-weight:900;line-height:1.15;color:#2b2340">閲覧<span style="color:#e1306c">255万回</span>なのに</div>
      <div style="font-size:84px;font-weight:900;line-height:1.15;color:#2b2340">フォロワー<span style="color:#7b3fe4">+36人</span>…</div>
      <div style="margin-top:14px;font-size:66px;font-weight:900;color:#fff;padding:14px 46px;border-radius:28px;background:linear-gradient(90deg,#7b3fe4,#e1306c,#f77737)">仕組み化の7ステップ</div>
     </div>`;
    for (const id of ["charH", "charK"]) document.getElementById(id).style.transform += " scale(1.18)";
  });
  await page.screenshot({ path: path.join(__dirname, "build/thumb_full.png") });
  await browser.close();
})();
