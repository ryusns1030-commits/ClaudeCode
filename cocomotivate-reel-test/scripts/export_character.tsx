// キャラクターの静止SVG素材を書き出す（npx tsx scripts/export_character.tsx）
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { CharacterSVG } from "../src/character/CharacterSVG";

const svg = renderToStaticMarkup(<CharacterSVG idPrefix="cn" />);
writeFileSync("out/character.svg", `<?xml version="1.0" encoding="UTF-8"?>\n<!-- オリジナルAIナビゲーター「ココナビ」 / Co.Co.Motivate reel experiment -->\n${svg}\n`);
const expr = ["normal", "surprised", "thinking", "happy", "serious"] as const;
const sheet = expr.map((e, i) => `<g transform="translate(${i * 420} 0)">${renderToStaticMarkup(
  <CharacterSVG idPrefix={`s${i}`} expression={e} mouth={e === "surprised" ? "o" : "-"} antenna={e === "surprised" ? 1 : 0.4}
    leftHand={e === "thinking" ? { x: 168, y: 268, rot: -40 } : undefined}
    rightHand={e === "happy" ? { x: 336, y: 196, rot: 18 } : undefined} />)}</g>`).join("");
writeFileSync("out/character_expressions.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="2100" height="480" viewBox="0 0 2100 480">${sheet}</svg>\n`);
console.log("ok");
