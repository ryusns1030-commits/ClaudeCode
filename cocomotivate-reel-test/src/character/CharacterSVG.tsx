import React from "react";

/**
 * オリジナルAIナビゲーター「ココナビ」
 * 白いスクワークル型の頭 + ネイビーのバイザー画面 + 発光する目と口。
 * 浮遊する手（胴体と非接続）で、手振り・指差し・考えるポーズを自由に付けられる。
 * このコンポーネントはフレームに依存しない純粋な描画関数（静止SVG書き出しにも使用）。
 */
export type Expression = "normal" | "surprised" | "thinking" | "happy" | "serious";
export type Hand = { x: number; y: number; rot: number; open?: number };

export type CharacterProps = {
  blink?: number; // 0=開 1=閉
  mouth?: string; // a i u e o n -
  expression?: Expression;
  look?: { x: number; y: number };
  tilt?: number;
  antenna?: number; // 0..1 発光
  leftHand?: Hand;
  rightHand?: Hand;
  squash?: number; // 体の伸縮（1=通常）
  idPrefix?: string;
};

export const DEFAULT_LEFT: Hand = { x: 92, y: 352, rot: -12 };
export const DEFAULT_RIGHT: Hand = { x: 308, y: 352, rot: 12 };

const EYE = "#6FE3FF";

const Mouth: React.FC<{ v: string; expression: Expression }> = ({ v, expression }) => {
  const cx = 200;
  const cy = 214;
  if (v === "-" || v === "") {
    if (expression === "surprised") return <ellipse cx={cx} cy={cy + 2} rx={9} ry={10} fill={EYE} />;
    if (expression === "serious")
      return <rect x={cx - 14} y={cy} width={28} height={5} rx={2.5} fill={EYE} />;
    if (expression === "thinking")
      return <path d={`M ${cx - 12} ${cy + 4} Q ${cx} ${cy - 2} ${cx + 14} ${cy + 2}`} stroke={EYE} strokeWidth={5} fill="none" strokeLinecap="round" />;
    return (
      <path d={`M ${cx - 18} ${cy - 2} Q ${cx} ${cy + 14} ${cx + 18} ${cy - 2}`} stroke={EYE} strokeWidth={6} fill="none" strokeLinecap="round" />
    );
  }
  const shapes: Record<string, [number, number]> = {
    a: [17, 13],
    i: [19, 5],
    u: [8, 8],
    e: [16, 8],
    o: [12, 12],
    n: [10, 3.5],
  };
  const [rx, ry] = shapes[v] ?? [12, 8];
  return (
    <g>
      <ellipse cx={cx} cy={cy + 2} rx={rx} ry={ry} fill={EYE} />
      <ellipse cx={cx} cy={cy + 2 + ry * 0.35} rx={rx * 0.6} ry={ry * 0.45} fill="#1E5FB8" opacity={ry > 6 ? 0.8 : 0} />
    </g>
  );
};

const Eyes: React.FC<{ blink: number; expression: Expression; look: { x: number; y: number } }> = ({
  blink,
  expression,
  look,
}) => {
  const lx = 156 + look.x;
  const rx = 244 + look.x;
  const y = 165 + look.y;
  if (expression === "happy") {
    return (
      <g stroke={EYE} strokeWidth={9} fill="none" strokeLinecap="round">
        <path d={`M ${lx - 17} ${y + 6} Q ${lx} ${y - 16} ${lx + 17} ${y + 6}`} />
        <path d={`M ${rx - 17} ${y + 6} Q ${rx} ${y - 16} ${rx + 17} ${y + 6}`} />
      </g>
    );
  }
  const open = 1 - blink;
  if (expression === "surprised") {
    const r = 23;
    return (
      <g>
        {[lx, rx].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={y} rx={r} ry={Math.max(2, r * open)} fill={EYE} />
            <ellipse cx={x + 6} cy={y - 8} rx={6} ry={Math.max(0.5, 6 * open)} fill="#fff" opacity={0.9} />
          </g>
        ))}
      </g>
    );
  }
  const w = 28;
  let h = 44;
  if (expression === "serious") h = 30;
  const hh = Math.max(4, h * open);
  return (
    <g>
      {[lx, rx].map((x, i) => {
        // 考え中は片目を少し細める
        const hi = expression === "thinking" && i === 0 ? Math.max(4, hh * 0.72) : hh;
        return (
          <g key={x}>
            <rect x={x - w / 2} y={y - hi / 2} width={w} height={hi} rx={Math.min(w / 2, hi / 2)} fill={EYE} />
            {open > 0.5 && (
              <ellipse cx={x + 5} cy={y - hi / 2 + 9} rx={5} ry={5 * open} fill="#fff" opacity={0.85} />
            )}
          </g>
        );
      })}
      {expression === "serious" && (
        <g stroke={EYE} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
          <line x1={lx - 18} y1={y - 30} x2={lx + 14} y2={y - 26} />
          <line x1={rx - 14} y1={y - 26} x2={rx + 18} y2={y - 30} />
        </g>
      )}
    </g>
  );
};

const HandShape: React.FC<{ h: Hand; side: "l" | "r"; id: string }> = ({ h, side, id }) => (
  <g transform={`translate(${h.x} ${h.y}) rotate(${h.rot})`}>
    <ellipse cx={0} cy={0} rx={27} ry={31} fill={`url(#${id}hand)`} stroke="#BFD3FF" strokeWidth={3} />
    {/* 親指 */}
    <ellipse cx={side === "l" ? 20 : -20} cy={4} rx={10} ry={13} fill="#fff" stroke="#BFD3FF" strokeWidth={3}
      transform={`rotate(${side === "l" ? -25 : 25} ${side === "l" ? 20 : -20} 4)`} />
    <rect x={-20} y={22} width={40} height={10} rx={5} fill="#2F6BFF" />
  </g>
);

export const CharacterSVG: React.FC<CharacterProps & { width?: number; height?: number }> = ({
  blink = 0,
  mouth = "-",
  expression = "normal",
  look = { x: 0, y: 0 },
  tilt = 0,
  antenna = 0.4,
  leftHand = DEFAULT_LEFT,
  rightHand = DEFAULT_RIGHT,
  squash = 1,
  idPrefix = "cn",
  width = 400,
  height = 480,
}) => {
  const id = idPrefix;
  return (
    <svg width={width} height={height} viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <defs>
        <linearGradient id={`${id}head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3ECFF" />
        </linearGradient>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C4596" />
          <stop offset="1" stopColor="#0B1F4B" />
        </linearGradient>
        <linearGradient id={`${id}visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E2A66" />
          <stop offset="1" stopColor="#081A42" />
        </linearGradient>
        <radialGradient id={`${id}hand`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E6EEFF" />
        </radialGradient>
        <radialGradient id={`${id}orb`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.35" stopColor="#8FEAFF" />
          <stop offset="1" stopColor="#2F6BFF" />
        </radialGradient>
        <filter id={`${id}glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 体 */}
      <g transform={`translate(200 410) scale(${2 - squash} ${squash}) translate(-200 -410)`}>
        <rect x={132} y={282} width={136} height={128} rx={62} fill={`url(#${id}body)`} />
        <circle cx={200} cy={346} r={25} fill="#fff" />
        {/* 胸のエンブレム：上向きの棒グラフ */}
        <rect x={185} y={350} width={7} height={10} rx={2} fill="#5CC8FF" />
        <rect x={196.5} y={342} width={7} height={18} rx={2} fill="#2F6BFF" />
        <rect x={208} y={334} width={7} height={26} rx={2} fill="#0B1F4B" />
      </g>

      {/* 頭（傾き） */}
      <g transform={`rotate(${tilt} 200 290)`}>
        {/* アンテナ */}
        <line x1={200} y1={66} x2={200} y2={30} stroke="#BFD3FF" strokeWidth={7} strokeLinecap="round" />
        <circle cx={200} cy={24} r={15 + antenna * 4} fill="#6FE3FF" opacity={0.25 + antenna * 0.35} />
        <circle cx={200} cy={24} r={13} fill={`url(#${id}orb)`} />
        {/* 耳ポッド */}
        <rect x={50} y={150} width={30} height={60} rx={15} fill="#2F6BFF" />
        <rect x={320} y={150} width={30} height={60} rx={15} fill="#2F6BFF" />
        <rect x={56} y={160} width={8} height={26} rx={4} fill="#8FB7FF" />
        {/* 頭部 */}
        <rect x={68} y={60} width={264} height={228} rx={104} fill={`url(#${id}head)`} stroke="#CFDDFF" strokeWidth={4} />
        <ellipse cx={140} cy={92} rx={40} ry={14} fill="#fff" opacity={0.9} />
        {/* バイザー */}
        <rect x={98} y={106} width={204} height={142} rx={64} fill={`url(#${id}visor)`} />
        <rect x={98} y={106} width={204} height={142} rx={64} fill="none" stroke="#2F6BFF" strokeWidth={3} opacity={0.6} />
        <g filter={`url(#${id}glow)`}>
          <Eyes blink={blink} expression={expression} look={look} />
          <Mouth v={mouth} expression={expression} />
        </g>
        {/* ほお */}
        <ellipse cx={122} cy={222} rx={13} ry={7} fill="#7FB2FF" opacity={0.55} />
        <ellipse cx={278} cy={222} rx={13} ry={7} fill="#7FB2FF" opacity={0.55} />
      </g>

      {/* 浮遊する手 */}
      <HandShape h={leftHand} side="l" id={id} />
      <HandShape h={rightHand} side="r" id={id} />
    </svg>
  );
};
