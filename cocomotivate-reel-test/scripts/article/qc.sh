#!/usr/bin/env bash
# 完成MP4そのものの技術検査（第3段階）。使い方: scripts/article/qc.sh <mp4> <master.wav> <出力dir>
# 出力: <出力dir>/qc-tech.txt, frames/*.png, contact-sheet.png, mouth-sheet.png
set -u
MP4=$1; WAV=$2; OUT=$3
mkdir -p "$OUT/frames"
R="$OUT/qc-tech.txt"
{
echo "# 技術検査  $(date -u +%FT%TZ)  $MP4"
echo "## ffprobe"
ffprobe -v error -show_entries stream=index,codec_type,codec_name,profile,width,height,display_aspect_ratio,r_frame_rate,avg_frame_rate,nb_frames,pix_fmt,color_range,color_space,color_primaries,color_transfer,sample_rate,channels,duration -of compact "$MP4"
ffprobe -v error -show_entries format=duration,size,bit_rate -of compact "$MP4"
echo "## decode errors"
echo "count=$(ffmpeg -v error -i "$MP4" -f null - 2>&1 | wc -l)"
echo "## blackdetect (d>=0.1s, pix_th=0.10)"
ffmpeg -hide_banner -nostats -i "$MP4" -vf blackdetect=d=0.1:pix_th=0.10 -an -f null - 2>&1 | grep -o "black_start.*" || echo "none"
echo "## freezedetect (n=0.001, d>=1.0s)"
ffmpeg -hide_banner -nostats -i "$MP4" -vf freezedetect=n=0.001:d=1.0 -an -f null - 2>&1 | grep -o "freeze_[a-z]*: [0-9.]*" || echo "none"
echo "## silencedetect (-50dB, d>=0.5s)"
ffmpeg -hide_banner -nostats -i "$MP4" -af silencedetect=n=-50dB:d=0.5 -vn -f null - 2>&1 | grep -o "silence_[a-z]*: [0-9.]*" || echo "none"
echo "## loudness (ebur128, true peak)"
ffmpeg -hide_banner -nostats -i "$MP4" -af ebur128=peak=true -vn -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:"
echo "## clipping (sample peak / samples at full scale)"
ffmpeg -hide_banner -nostats -i "$MP4" -af astats=metadata=0:reset=0 -vn -f null - 2>&1 | grep -E "Overall|Peak level dB|Number of clipped|Flat factor" | grep -A3 Overall | head -4
} > "$R" 2>&1

# 音ズレ：MP4 の音声と元の master.wav の相互相関（モノラル・8kHz に落として ±0.5秒を探索）
"$(dirname "$0")/../../.venv/bin/python" - "$MP4" "$WAV" >> "$R" <<'EOF'
import subprocess, sys, numpy as np
def pcm(p):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar","8000","-f","s16le","-"],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.int16).astype(np.float32)
a, b = pcm(sys.argv[1]), pcm(sys.argv[2])
n = min(len(a), len(b)); a, b = a[:n], b[:n]
F = 1 << int(np.ceil(np.log2(2*n)))
c = np.fft.irfft(np.fft.rfft(a,F)*np.conj(np.fft.rfft(b,F)),F)
lag = int(np.argmax(np.concatenate([c[-4000:], c[:4001]]))) - 4000
corr = np.corrcoef(a, np.roll(b, lag))[0,1]
print("## A/V sync (cross-correlation mp4 audio vs master.wav)")
print(f"lag={lag/8:.1f} ms  corr={corr:.4f}  (mp4 {len(a)/8000:.3f}s / wav {len(b)/8000:.3f}s)")
EOF

# コンタクトシート：完成MP4から24時点（等間隔＋演出キュー付近）を抽出
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MP4")
TS=${QC_TIMES:-$(python3 -c "d=$DUR;print(' '.join(f'{d*(i+0.5)/24:.2f}' for i in range(24)))")}
i=0; for t in $TS; do
  ffmpeg -v error -y -ss "$t" -i "$MP4" -frames:v 1 -vf "scale=360:640,drawtext=text='$t s':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6" "$OUT/frames/$(printf %02d $i).png"; i=$((i+1)); done
ffmpeg -v error -y -pattern_type glob -i "$OUT/frames/*.png" -vf "tile=8x3:padding=6:color=black" "$OUT/contact-sheet.png"
echo "contact sheet: $OUT/contact-sheet.png ($i frames)" >> "$R"
cat "$R"
