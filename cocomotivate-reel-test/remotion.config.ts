import { Config } from "@remotion/cli/config";

// 事前インストール済みの Chrome Headless Shell を使用（追加ダウンロード不要）
Config.setBrowserExecutable(
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioCodec("aac");
Config.setAudioBitrate("192k");
Config.setConcurrency(4);
