#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$PWD/.local/node-v22/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo '首次启动：准备本地 Node.js 运行环境…'
  BA_ARCH=$(uname -m); [ "$BA_ARCH" = arm64 ] || BA_ARCH=x64
  BA_RELEASE="node-v22.23.4-darwin-$BA_ARCH"
  mkdir -p .local/node-v22
  BA_TEMP=$(mktemp -d)
  trap 'rm -rf "$BA_TEMP"' EXIT
  curl --fail --location "https://nodejs.org/dist/v22.23.4/$BA_RELEASE.tar.gz" -o "$BA_TEMP/$BA_RELEASE.tar.gz"
  curl --fail --location 'https://nodejs.org/dist/v22.23.4/SHASUMS256.txt' -o "$BA_TEMP/SHASUMS256.txt"
  (cd "$BA_TEMP"; awk -v file="$BA_RELEASE.tar.gz" '$2 == file { print }' SHASUMS256.txt > checksum.txt; test -s checksum.txt; shasum -a 256 -c checksum.txt)
  tar -xzf "$BA_TEMP/$BA_RELEASE.tar.gz" -C .local/node-v22 --strip-components=1
fi
if [ ! -f node_modules/vite/bin/vite.js ]; then
  echo '首次启动：安装项目依赖…'
  npm ci
fi
if curl --silent --max-time 2 http://127.0.0.1:5174/ | /usr/bin/grep -q 'Big Academy Writing'; then
  open http://127.0.0.1:5174/
  echo 'Big Academy 已在运行。'
  exit 0
fi
# Open after the server is reachable. Progress remains on the same local origin.
(node scripts/open-local.mjs) &
echo '正在启动 Big Academy Writing。关闭此终端或按 Control+C 停止。'
node node_modules/vite/bin/vite.js apps/writing --host 127.0.0.1 --port 5174 --strictPort
