import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  bg0: "#061233",
  bg1: "#0B1F4B",
  bg2: "#13306E",
  navy: "#0B1F4B",
  blue: "#2F6BFF",
  sky: "#5CC8FF",
  glow: "#6FE3FF",
  white: "#FFFFFF",
  paper: "#F4F7FF",
  ink: "#0B1F4B",
  sub: "#5A6B8F",
  line: "#D6E2FF",
  coral: "#FF6B6B",
  amber: "#FFB547",
};

export const FONT = "'NotoSansJP', sans-serif";
export const ROUND = "'MPRounded', 'NotoSansJP', sans-serif";

export const fontsReady = Promise.all([
  loadFont({ family: "NotoSansJP", url: staticFile("fonts/NotoSansJP_500Medium.ttf"), weight: "500" }),
  loadFont({ family: "NotoSansJP", url: staticFile("fonts/NotoSansJP_700Bold.ttf"), weight: "700" }),
  loadFont({ family: "NotoSansJP", url: staticFile("fonts/NotoSansJP_900Black.ttf"), weight: "900" }),
  loadFont({ family: "MPRounded", url: staticFile("fonts/MPLUSRounded1c_800ExtraBold.ttf"), weight: "800" }),
  loadFont({ family: "MPRounded", url: staticFile("fonts/MPLUSRounded1c_900Black.ttf"), weight: "900" }),
]);

// レイアウト（1080x1920, Instagramの上下UIを避けたセーフエリア）
export const L = {
  W: 1080,
  H: 1920,
  stageTop: 300,
  stageBottom: 1300,
  subTop: 1340,
  subBottom: 1590,
  side: 72,
};
