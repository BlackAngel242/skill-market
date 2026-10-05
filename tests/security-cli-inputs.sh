#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/bin" "$tmp/home/skills"

cat > "$tmp/bin/curl" <<'CURL_EOF'
#!/usr/bin/env bash
cat "$MARKET_TEST_INDEX"
CURL_EOF
chmod +x "$tmp/bin/curl"
export MARKET_HOME="$tmp/home"
export MARKET_TEST_INDEX="$repo_root/index.json"
export PATH="$tmp/bin:$PATH"

search_marker="$tmp/search-executed"
search_payload="ignored'.lower(); __import__(\"os\").system(\"touch $search_marker\"); q='ignored"
bash "$repo_root/cli/market" search "$search_payload" >/dev/null 2>&1 || true
[[ ! -e "$search_marker" ]] || { echo "search input executed Python code" >&2; exit 1; }

info_marker="$tmp/info-executed"
info_payload="missing' or __import__(\"os\").system(\"touch $info_marker\")==0 or 'x"
bash "$repo_root/cli/market" info "$info_payload" >/dev/null 2>&1 || true
[[ ! -e "$info_marker" ]] || { echo "info input executed Python code" >&2; exit 1; }

outside="$MARKET_HOME/keep.txt"
printf 'keep\n' > "$outside"
bash "$repo_root/cli/market" remove ../keep.txt >/dev/null 2>&1 || true
[[ -f "$outside" ]] || { echo "remove path escaped the skills directory" >&2; exit 1; }

echo "OK: crafted inputs do not execute code or escape the skills directory."
