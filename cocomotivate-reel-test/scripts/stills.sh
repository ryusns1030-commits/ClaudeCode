#!/usr/bin/env bash
# 使い方: scripts/stills.sh 名前 フレーム1 フレーム2 ...  → out/frames/名前.png にコンタクトシート
set -e
cd "$(dirname "$0")/.."
name=$1; shift
inputs=(); n=0
for f in "$@"; do
  npx remotion still Reel "out/frames/f$f.png" --frame="$f" --log=error >/dev/null
  inputs+=(-i "out/frames/f$f.png"); n=$((n+1))
done
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "hstack=$n,scale=$((360*n)):-1" "out/frames/$name.png"
echo "out/frames/$name.png"
