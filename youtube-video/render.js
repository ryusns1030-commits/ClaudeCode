// 使い方:
//   node render.js preview 3.5 40 120 ...   指定秒のPNGを build/preview/ に出力
//   node render.js video [workers]           全フレームを描画して output/ にMP4を出力
const { chromium } = require("playwright");
const { spawn, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const BUILD = path.join(ROOT, "build");
const OUTDIR = path.join(ROOT, "output");
const tl = JSON.parse(fs.readFileSync(path.join(BUILD, "timeline.json"), "utf8"));
fs.writeFileSync(path.join(BUILD, "timeline.js"), "window.TL=" + JSON.stringify(tl) + ";");
const FPS = tl.fps;
const URL = "file://" + path.join(ROOT, "index.html");

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", e => console.error("PAGE ERROR", e.message));
  await page.goto(URL);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  return page;
}

async function preview(times) {
  const browser = await chromium.launch();
  const page = await openPage(browser);
  const dir = path.join(BUILD, "preview");
  fs.mkdirSync(dir, { recursive: true });
  for (const t of times) {
    await page.evaluate(t => window.setTime(t), t);
    const f = path.join(dir, `t${String(t).padStart(6, "0")}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
}

async function renderRange(browser, w, f0, f1) {
  const page = await openPage(browser);
  const seg = path.join(BUILD, `seg${w}.mp4`);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS), seg], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.setTime(t), f / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if ((f - f0) % 600 === 0) console.log(`[w${w}] ${f - f0}/${f1 - f0} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await page.close();
  return seg;
}

async function video(workers) {
  const total = Math.ceil(tl.duration * FPS);
  const browser = await chromium.launch();
  const per = Math.ceil(total / workers);
  const segs = await Promise.all([...Array(workers)].map((_, w) => renderRange(browser, w, w * per, Math.min(total, (w + 1) * per))));
  await browser.close();
  const list = path.join(BUILD, "segs.txt");
  fs.writeFileSync(list, segs.map(s => `file '${s}'`).join("\n"));
  fs.mkdirSync(OUTDIR, { recursive: true });
  const out = path.join(OUTDIR, "instagram_chatgpt_manual.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-i", path.join(BUILD, "mix.wav"),
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], { stdio: "inherit" });
  console.log("done:", out);
}

const [mode, ...args] = process.argv.slice(2);
if (mode === "preview") preview(args.map(Number));
else video(Number(args[0] || 4));
