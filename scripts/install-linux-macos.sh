#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22+ requis : https://nodejs.org/" >&2
  exit 1
fi
version="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$version" -lt 22 ]; then
  echo "Node.js 22+ requis (version actuelle : $version)." >&2
  exit 1
fi
exec node "$script_dir/install-skills.mjs" "$@"
