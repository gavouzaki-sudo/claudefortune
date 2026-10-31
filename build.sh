#!/usr/bin/env bash
# Build the Wasm core: wasm/core.c -> web/wasm/core.wasm
# Requires: clang (with wasm32 target) and wasm-ld (package: clang + lld)
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p web/wasm
clang --target=wasm32 -O2 -nostdlib -ffreestanding -fno-builtin \
  -Wall -Wextra -Wno-unused-parameter \
  -Wl,--no-entry \
  -Wl,--export-memory \
  -Wl,--initial-memory=4194304 \
  -Wl,--max-memory=4194304 \
  -Wl,-z,stack-size=131072 \
  -Wl,--strip-all \
  -o web/wasm/core.wasm wasm/core.c

ls -l web/wasm/core.wasm
