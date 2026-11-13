import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut, pop, prog } from "../../../src/anim";
import { Card, Phrases } from "../../../src/components/common";
import { IconCalendar, IconCheck } from "../../../src/components/icons";
import { C, FONT, ROUND } from "../../../src/theme";
import { CONTENT_W, Note, SAFE, SceneTag } from "./layout";
import { evIn, lineIn } from "./tl";

const X = SAFE.left;
const NARROW = 660; // キャラクター（x≥754）の左に収める幅

/* ------------------------------------------------------------------ 共通パーツ */
const Bar: React.FC<{ w: number; p?: number; color?: string; h?: number }> = ({ w, p = 1, color = "#DDE6F7", h = 18 }) => (
  <div style={{ height: h, width: w * p, borderRadius: h / 2, background: color }} />
);

const AiAvatar: React.FC = () => (
  <div style={{ width: 54, height: 54, borderRadius: 18, background: `linear-gradient(135deg, ${C.blue}, ${C.sky})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontFamily: ROUND, fontWeight: 900, fontSize: 24, flexShrink: 0 }}>
    AI
  </div>
);

const ChatHeader: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 28px", borderBottom: `2px solid ${C.line}` }}>
    <div style={{ display: "flex", gap: 8 }}>
      {[C.coral, C.amber, C.sky].map((c) => (
        <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.7 }} />
      ))}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: C.sub }}>{label}</div>
  </div>
);

/** 英文メールのイメージ（本文は非公開のため伏せ字の行で表す。英文は創作しない） */
const DraftLines: React.FC<{ p: number; subjectColor?: string }> = ({ p, subjectColor = "#BFD3F5" }) => {
  const widths = [520, 470, 500, 380];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, color: C.ink, opacity: interpolate(p, [0, 0.15], [0, 1], clamp) }}>Subject:</div>
        <Bar w={330} p={interpolate(p, [0, 0.3], [0, 1], clamp)} color={subjectColor} h={22} />
      </div>
      {widths.map((w, i) => (
        <Bar key={i} w={w} p={interpolate(p, [0.2 + i * 0.18, 0.38 + i * 0.18], [0, 1], clamp)} />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ シーン1：フック */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eHover = evIn("hook", "sendButtonHover");
  const eWait = evIn("hook", "waitStamp");
  const e3 = evIn("hook", "promise3");
  const e5 = evIn("hook", "promise5");

  // 0フレーム目から表示：英訳済みの下書きと「送信」ボタン
  const cursor = interpolate(frame, [eHover - 24, eHover], [0, 1], { ...clamp, easing: easeOut });
  const btn = 1 + 0.08 * prog(frame, eHover, 6) - 0.04 * prog(frame, eWait, 6);
  const stamp = pop(frame, fps, eWait, 8, 300);
  const shake = frame >= eWait && frame < eWait + 10 ? Math.sin((frame - eWait) * 2.4) * (10 - (frame - eWait)) : 0;
  const away = prog(frame, e3 - 6, 16);
  const c3 = pop(frame, fps, e3, 12);
  const c5 = pop(frame, fps, e5, 12);
  const n3 = Math.round(3 * prog(frame, e3, 12));
  const n5 = Math.round(5 * prog(frame, e5, 12));

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 244, left: X, fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.92)", letterSpacing: 1 }}>
        ChatGPTで英訳したあと…
      </div>
      <div style={{ position: "absolute", top: 296, left: X, fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.navy, background: C.glow, borderRadius: 999, padding: "6px 22px" }}>
        最後に「送る前の5チェック」
      </div>

      {/* チャットUI（オリジナルデザイン） */}
      <div style={{ position: "absolute", left: X, top: 380, width: CONTENT_W, opacity: 1 - 0.7 * away, scale: String(1 - 0.1 * away), filter: away > 0 ? `blur(${away * 4}px)` : undefined, translate: `${shake}px ${-40 * away}px` }}>
        <Card style={{ overflow: "hidden" }}>
          <ChatHeader label="AIチャット" />
          <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ alignSelf: "flex-end", background: C.blue, color: C.white, fontSize: 32, fontWeight: 700, padding: "14px 26px", borderRadius: "26px 26px 6px 26px" }}>
              この営業メールを英語にして
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <AiAvatar />
              <div style={{ background: C.paper, borderRadius: "6px 26px 26px 26px", padding: "22px 26px" }}>
                <DraftLines p={1} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.sub }}>※イメージです</div>
              <div style={{ position: "relative" }}>
                <div style={{ background: C.coral, color: C.white, fontWeight: 900, fontSize: 36, padding: "14px 40px", borderRadius: 999, scale: String(btn), boxShadow: "0 10px 24px rgba(255,107,107,0.4)" }}>
                  そのまま送信 ▶
                </div>
                {/* カーソル */}
                <svg width={56} height={56} viewBox="0 0 24 24" style={{ position: "absolute", left: 120 + (1 - cursor) * 140, top: 40 + (1 - cursor) * 260, opacity: cursor }}>
                  <path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.5 L12 13.8 L19 13.8 Z" fill={C.white} stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
                </svg>
                {/* 待って！スタンプ */}
                <div style={{ position: "absolute", left: -40, top: -120, opacity: stamp, scale: String(interpolate(stamp, [0, 1], [2.4, 1])), rotate: "-10deg", border: `7px solid ${C.coral}`, color: C.coral, background: "rgba(255,255,255,0.94)", fontFamily: ROUND, fontWeight: 900, fontSize: 60, padding: "4px 30px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  待って！
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 結論の先出し：頼み方3つ／チェック5つ */}
      {[
        { s: c3, n: n3, top: "AIへの", main: "頼み方", unit: "つ", x: X },
        { s: c5, n: n5, top: "送る前の", main: "チェック", unit: "項目", x: X + CONTENT_W / 2 + 18 },
      ].map((c, i) => (
        <Card key={i} style={{ position: "absolute", left: c.x, top: 480, width: CONTENT_W / 2 - 18, height: 420, opacity: c.s, scale: String(0.7 + 0.3 * c.s), translate: `0px ${(1 - c.s) * 60}px`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: C.sub }}>{c.top}</div>
          <div style={{ fontSize: 50, fontWeight: 900 }}>{c.main}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
            <span style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 190, lineHeight: 1, color: C.blue }}>{c.n}</span>
            <span style={{ fontSize: 46, fontWeight: 900, color: C.blue }}>{c.unit}</span>
          </div>
        </Card>
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ シーン2：実体験 */
export const Experience: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eDate = evIn("experience", "dateChip");
  const eType = evIn("experience", "chatTyping");
  const eSubj = evIn("experience", "subjectCard");
  const eMerit = evIn("experience", "meritHighlight");
  const eApol = evIn("experience", "apologyCard");
  const eUnc = evIn("experience", "unconfirmedStamp");
  const eDraft = evIn("experience", "draftLabel");

  const date = pop(frame, fps, eDate, 14);
  const req = pop(frame, fps, eDate + 14, 14);
  const ai = prog(frame, eType, 28);
  const subj = pop(frame, fps, eSubj, 13);
  const strike = prog(frame, eSubj + 8, 10);
  const merit = pop(frame, fps, eMerit, 10, 220);
  const glow = interpolate(frame, [eMerit, eMerit + 6, eMerit + 30], [0, 1, 0.45], clamp);
  const apol = pop(frame, fps, eApol, 13);
  const unc = pop(frame, fps, eUnc, 8, 300);
  const dim = prog(frame, eUnc - 2, 8);
  const draft = pop(frame, fps, eDraft, 12);

  return (
    <AbsoluteFill>
      <SceneTag no="01" label="実体験：2024年に試したこと" />
      <div style={{ position: "absolute", top: 302, left: X, display: "flex", alignItems: "center", gap: 12, opacity: date, translate: `${(1 - date) * -60}px 0px`, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(111,227,255,0.5)", borderRadius: 999, padding: "6px 22px 6px 12px" }}>
        <IconCalendar size={40} color={C.glow} />
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.white }}>2024.10.08 の会話記録</span>
      </div>

      <Card style={{ position: "absolute", left: X, top: 376, width: CONTENT_W, height: 390, overflow: "hidden" }}>
        <ChatHeader label="AIチャット（当時の依頼の要旨）" />
        <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ alignSelf: "flex-end", maxWidth: 640, background: C.blue, color: C.white, fontSize: 30, fontWeight: 700, lineHeight: 1.4, padding: "12px 24px", borderRadius: "24px 24px 6px 24px", opacity: req, translate: `0px ${(1 - req) * 20}px` }}>
            Instagram運用代行の営業メール → 自然なアメリカ英語に
          </div>
          <div style={{ display: "flex", gap: 14, opacity: interpolate(ai, [0, 0.1], [0, 1], clamp) }}>
            <AiAvatar />
            <div style={{ background: C.paper, borderRadius: "6px 24px 24px 24px", padding: "18px 24px" }}>
              <DraftLines p={ai} subjectColor={frame >= eMerit ? C.glow : "#BFD3F5"} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 26, bottom: 14, fontSize: 21, fontWeight: 700, color: C.sub }}>※英文はイメージです（実際の文面は非公開）</div>
      </Card>

      {/* 件名の比較 */}
      <Card style={{ position: "absolute", left: X, top: 786, width: CONTENT_W, height: 196, padding: "20px 30px", opacity: subj * (1 - 0.85 * dim), translate: `${(1 - subj) * -80}px 0px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: C.sub, width: 170, whiteSpace: "nowrap" }}>よくある件名</span>
          <span style={{ position: "relative", fontSize: 34, fontWeight: 700, color: "#9AA6C0" }}>
            サービスのご案内
            <span style={{ position: "absolute", left: 0, top: "52%", height: 4, width: `${strike * 100}%`, background: "#9AA6C0" }} />
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: merit, scale: String(0.9 + 0.1 * merit), transformOrigin: "left center" }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: C.sub, width: 170, whiteSpace: "nowrap" }}>生成された件名</span>
          <span style={{ fontSize: 40, fontWeight: 900, color: C.blue, whiteSpace: "nowrap", textShadow: `0 0 ${18 * glow}px rgba(111,227,255,${glow})` }}>相手のメリットを伝える件名</span>
        </div>
      </Card>

      {/* 別案 */}
      <Card style={{ position: "absolute", left: X, top: 1000, width: NARROW, height: 96, padding: "0 30px", display: "flex", alignItems: "center", gap: 18, opacity: apol * (1 - 0.85 * dim), translate: `${(1 - apol) * -80}px 0px` }}>
        <span style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 26, color: C.white, background: C.blue, borderRadius: 999, padding: "4px 18px" }}>別案</span>
        <span style={{ fontSize: 34, fontWeight: 900 }}>突然の連絡へのお詫びも</span>
      </Card>

      {/* 未確認スタンプ + 下書き */}
      <AbsoluteFill style={{ background: "rgba(4,12,36,0.62)", opacity: dim }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", opacity: unc }}>
        <div style={{ scale: String(interpolate(unc, [0, 1], [2.4, 1])), rotate: "-6deg", border: `8px solid ${C.coral}`, background: "rgba(255,255,255,0.96)", borderRadius: 28, padding: "18px 44px", textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.ink }}>送信・返信・成約</div>
          <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 104, lineHeight: 1.1, color: C.coral }}>未確認</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: X, width: CONTENT_W, top: 820, display: "flex", justifyContent: "center", opacity: draft, translate: `0px ${(1 - draft) * 30}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: C.navy, border: `3px solid ${C.glow}`, borderRadius: 26, padding: "16px 30px", boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
          <span style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 32, color: C.navy, background: C.glow, borderRadius: 12, padding: "6px 16px", rotate: "-4deg" }}>DRAFT</span>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.white, whiteSpace: "nowrap" }}>だから英文は“下書き”扱い</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ シーン3：頼み方3つ */
const PROMPT_LINES = [
  "以下の日本語を、アメリカの企業担当者に送る営業メールとして、自然で丁寧な英語にしてください。",
  "・営業色が強すぎない表現にする",
  "・元の文章にない実績やサービス内容を追加しない",
  "・件名も提案する",
  "・意味が変わりそうな箇所は日本語で説明する",
];
const PROMPT_HL: Record<number, { no: string; ev: "cond1" | "cond2" | "cond3" }> = {
  0: { no: "①", ev: "cond1" },
  2: { no: "②", ev: "cond2" },
  4: { no: "③", ev: "cond3" },
};

export const Prompt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(frame, fps, 0, 15);
  const active = [0, 2, 4].filter((i) => frame >= evIn("prompt", PROMPT_HL[i].ev) - 2).pop();
  const zoom = 1 + 0.025 * Math.max(0, ...[0, 2, 4].map((i) => {
    const e = evIn("prompt", PROMPT_HL[i].ev);
    return interpolate(frame, [e - 2, e + 6, e + 40], [0, 1, 0.6], clamp) * (active === i ? 1 : 0);
  }));

  return (
    <AbsoluteFill>
      <SceneTag no="02" label="AIへの頼み方 3つ" />
      <div style={{ position: "absolute", left: X, top: 330, width: CONTENT_W, opacity: card, translate: `0px ${(1 - card) * 80}px`, scale: String(zoom) }}>
        <Card style={{ padding: "26px 30px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <AiAvatar />
            <div style={{ fontSize: 32, fontWeight: 900 }}>英訳プロンプト（再現例）</div>
          </div>
          {PROMPT_LINES.map((t, i) => {
            const h = PROMPT_HL[i];
            const e = h ? evIn("prompt", h.ev) : 1e9;
            const on = pop(frame, fps, e - 2, 12, 220);
            const isActive = active === i;
            return (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 14px", marginTop: 6, borderRadius: 16, background: h ? `rgba(92,200,255,${0.22 * on * (isActive ? 1 : 0.55)})` : "transparent", borderLeft: `6px solid ${h ? `rgba(47,107,255,${on})` : "transparent"}` }}>
                <div style={{ width: 52, flexShrink: 0, fontFamily: ROUND, fontWeight: 900, fontSize: 40, lineHeight: 1.2, color: C.blue, opacity: on, scale: String(0.4 + 0.6 * on) }}>{h ? h.no : ""}</div>
                <div style={{ fontSize: 33, lineHeight: 1.5, fontWeight: h && on > 0.5 ? 900 : 700, color: h ? C.ink : C.sub, wordBreak: "keep-all", textWrap: "pretty" }}>
                  <Phrases text={t} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
      <Note style={{ position: "absolute", left: X, top: 1000, width: NARROW, lineHeight: 1.4, opacity: card }}>※記事用に整理した再現例です（当時の原文ではありません）</Note>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ シーン4：送る前の5チェック */
const CHECKS = [
  "サービス内容は、元の日本語と同じ？",
  "料金・実績に、誤りはない？",
  "失礼な表現になっていない？",
  "事実以上の効果を、約束していない？",
  "連絡先・リンクは正しい？",
];

export const Check: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(frame, fps, 0, 15);
  const items = ["checkItem0", "checkItem1", "checkItem2", "checkItem3", "checkItem4"] as const;
  const hint = pop(frame, fps, evIn("check", "checkItem4") + 10, 14);
  return (
    <AbsoluteFill>
      <SceneTag no="03" label="送る前の5チェック" />
      <Card style={{ position: "absolute", left: X, top: 330, width: CONTENT_W, padding: "30px 34px", opacity: card, translate: `0px ${(1 - card) * 80}px` }}>
        <div style={{ fontSize: 38, fontWeight: 900, marginBottom: 10 }}>送信前チェックリスト</div>
        {CHECKS.map((t, i) => {
          const e = evIn("check", items[i]);
          const r = pop(frame, fps, e, 13, 200);
          const tick = prog(frame, e + 3, 8);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, height: 112, borderTop: i ? `2px solid ${C.line}` : undefined, opacity: r, translate: `${(1 - r) * 60}px 0px` }}>
              <svg width={60} height={60} viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
                <rect x={4} y={4} width={52} height={52} rx={14} fill={tick > 0 ? C.blue : "none"} stroke={C.blue} strokeWidth={5} />
                <path d="M16 31 L26 41 L45 20" fill="none" stroke={C.white} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - tick)} />
              </svg>
              <div style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>{t}</div>
            </div>
          );
        })}
      </Card>
      <div style={{ position: "absolute", left: X, top: 1110, width: CONTENT_W, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.glow, opacity: hint, translate: `0px ${(1 - hint) * 20}px` }}>
        保存して、送信前に見返そう
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ シーン5：結論 */
export const Conclusion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l11 = lineIn("conclusion", "L11");
  const l12 = lineIn("conclusion", "L12");
  const eSplit = evIn("conclusion", "splitCompare");
  const eJudge = evIn("conclusion", "humanJudge");
  const a = pop(frame, fps, l11 - 2, 13);
  const chk = pop(frame, fps, l11 + 10, 10, 220);
  const b = pop(frame, fps, eSplit, 13);
  const neq = pop(frame, fps, eSplit + 4, 9, 200);
  const ai = pop(frame, fps, l12 - 2, 13);
  const arrow = prog(frame, l12 + 16, 14);
  const human = pop(frame, fps, eJudge, 11);
  const glow = interpolate(frame, [eJudge, eJudge + 8, eJudge + 40], [0, 1, 0.5], clamp);
  const W = 360;
  const q = 1 + Math.sin(frame * 0.25) * 0.06;

  return (
    <AbsoluteFill>
      <SceneTag no="まとめ" label="いちばん大事なこと" />
      <Card style={{ position: "absolute", left: X, top: 400, width: W, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: a, translate: `${(1 - a) * -80}px 0px` }}>
        <div style={{ scale: String(chk) }}>
          <IconCheck size={96} />
        </div>
        <div style={{ fontSize: 50, fontWeight: 900 }}>文章の完成</div>
      </Card>
      <div style={{ position: "absolute", left: X + W, width: CONTENT_W - 2 * W, top: 470, textAlign: "center", fontFamily: ROUND, fontWeight: 900, fontSize: 130, lineHeight: 1, color: C.glow, scale: String(neq), rotate: `${(1 - neq) * 90}deg` }}>≠</div>
      <Card style={{ position: "absolute", left: X + CONTENT_W - W, top: 400, width: W, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, border: `5px dashed ${C.sky}`, opacity: b, translate: `${(1 - b) * 80}px 0px` }}>
        <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 96, lineHeight: 1, color: C.sub, scale: String(q) }}>?</div>
        <div style={{ fontSize: 50, fontWeight: 900 }}>営業の成果</div>
      </Card>

      <div style={{ position: "absolute", left: X, top: 790, width: CONTENT_W - 60, height: 190, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 330, height: 170, borderRadius: 30, background: "rgba(255,255,255,0.1)", border: "3px solid rgba(255,255,255,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: ai, scale: String(0.8 + 0.2 * ai) }}>
          <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 34, color: C.sky }}>AI</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.white }}>出発点</div>
        </div>
        <svg width={120} height={60} viewBox="0 0 120 60" style={{ opacity: arrow }}>
          <path d={`M10 30 L${10 + 90 * arrow} 30`} stroke={C.glow} strokeWidth={8} strokeLinecap="round" />
          <path d="M84 14 L104 30 L84 46" fill="none" stroke={C.glow} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={arrow > 0.9 ? 1 : 0} />
        </svg>
        <div style={{ width: 330, height: 170, borderRadius: 30, background: C.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: human, scale: String(0.8 + 0.2 * human), boxShadow: `0 0 ${50 * glow}px rgba(111,227,255,${0.8 * glow})` }}>
          <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 34, color: C.blue }}>人</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.ink }}>判断</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ シーン6：CTA */
export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eSave = evIn("ending", "saveIcon");
  const icon = pop(frame, fps, eSave, 10, 220);
  const t1 = pop(frame, fps, eSave + 10, 14);
  const t2 = pop(frame, fps, eSave + 22, 14);
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, frame - eSave - 12) * 0.2);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", opacity: icon, scale: String((0.5 + 0.5 * icon) * pulse) }}>
        <div style={{ width: 230, height: 230, borderRadius: 60, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(111,227,255,0.55)" }}>
          <svg width={120} height={140} viewBox="0 0 24 28">
            <path d="M3 2 H21 V26 L12 19 L3 26 Z" fill={C.blue} stroke={C.navy} strokeWidth={1.2} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", left: X, width: CONTENT_W, top: 610, textAlign: "center", opacity: t1, translate: `0px ${(1 - t1) * 24}px` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.white }}>成功も限界も、実体験から。</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.sky, marginTop: 8 }}>AI×仕事のリアルを発信中</div>
      </div>
      <div style={{ position: "absolute", left: X, width: CONTENT_W, top: 800, textAlign: "center", opacity: t2 }}>
        <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 76, color: C.white, letterSpacing: 2 }}>Co.Co.Motivate</div>
        <Note style={{ marginTop: 14, fontSize: 24 }}>ナレーション：VOICEVOX:春日部つむぎ</Note>
      </div>
    </AbsoluteFill>
  );
};
