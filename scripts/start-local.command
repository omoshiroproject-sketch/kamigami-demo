#!/bin/bash
set -e
cd "$(dirname "$0")/.."
if command -v node >/dev/null 2>&1; then
  node_exec=$(command -v node)
else
  node_exec="/Users/U/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [ ! -x "$node_exec" ]; then
  echo "Node.js 24 LTSをインストールして npm ci を実行してください。"
  read -r
  exit 1
fi
if [ ! -f node_modules/vite/bin/vite.js ]; then
  echo "このフォルダで npm ci を実行してから起動してください。"
  read -r
  exit 1
fi
echo "確認URL: http://127.0.0.1:4173/ （停止は Control+C）"
exec "$node_exec" node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort
