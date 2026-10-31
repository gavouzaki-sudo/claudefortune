#!/usr/bin/env bash
# Package the site for a Hugging Face *Static* Space.
# A Static Space needs index.html + a README.md with YAML front-matter at the repo root.
# Output: dist-hf/  (push its contents to your Space repo)
set -euo pipefail
cd "$(dirname "$0")/.."

./build.sh
rm -rf dist-hf
mkdir -p dist-hf
cp -r web/. dist-hf/

cat > dist-hf/README.md <<'EOF'
---
title: ศาลเจ้าแห่งโชคลาภ (Lucky Shrine)
emoji: 🏮
colorFrom: red
colorTo: yellow
sdk: static
pinned: false
license: mit
short_description: เซียมซี ไพ่ยิปซี สะเดาะเคราะห์ออนไลน์ (Wasm)
---

เว็บเซียมซี ไพ่ยิปซี เลขมงคล และพิธีสะเดาะเคราะห์ออนไลน์ — เพื่อความบันเทิง
EOF

echo "Done. Upload the contents of dist-hf/ to your Hugging Face Static Space."
