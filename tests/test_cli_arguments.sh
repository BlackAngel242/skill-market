#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf -- "$tmp"' EXIT
export MARKET_HOME="$tmp/home"
export PYTHON_REAL
PYTHON_REAL=$(command -v python || command -v python3)
for name in python python3; do printf '#!/bin/sh\nexit 1\n' > "$tmp/$name"; done
cat > "$tmp/py" <<'EOF'
#!/bin/sh
[ "$1" = -3 ] || exit 9
shift
exec "$PYTHON_REAL" "$@"
EOF
cat > "$tmp/curl" <<'EOF'
#!/bin/sh
for arg do case "$arg" in */index.json) printf '%s\n' '{"skills":[{"name":"demo","version":"1.0.0","path":"skills/demo"}]}' ; exit 0;; esac; done
exit 22
EOF
chmod +x "$tmp/python" "$tmp/python3" "$tmp/py" "$tmp/curl"
export PATH="$tmp:$PATH"
output=$(bash "$root/cli/market" list)
[[ "$output" == *'demo 1.0.0'* ]] || { echo 'py -3 fallback failed' >&2; exit 1; }
output=$(bash "$root/cli/market" info demo)
[[ "$output" == *'Fiche inaccessible (réseau).'* ]] || { echo 'missing network message' >&2; exit 1; }
if output=$(bash "$root/cli/market" upgrade demo --bogus 2>&1); then echo 'invalid option accepted' >&2; exit 1; fi
[[ "$output" == *'Option inconnue : --bogus'* ]]
if output=$(bash "$root/cli/market" install ../invalid -y 2>&1); then echo 'invalid name accepted' >&2; exit 1; fi
[[ "$output" == *'Nom de skill invalide.'* ]]
echo 'OK: py -3, info réseau, options de commande.'
