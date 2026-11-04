#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf -- "$tmp"' EXIT
export HOME="$tmp/profile" MARKET_HOME="$tmp/market"
mkdir -p "$HOME"
run() { bash "$root/cli/market" "$@"; }
run install prd-table-ronde --tool claude
[ -f "$HOME/.claude/skills/prd-table-ronde/installed.json" ]
run installed --tool claude | grep -q 'prd-table-ronde 2.2.0'
run doctor --tool claude
printf '%s\n' '{"name":"prd-table-ronde","version":"1.0.0"}' > "$HOME/.claude/skills/prd-table-ronde/installed.json"
printf 'avant mise à jour\n' > "$HOME/.claude/skills/prd-table-ronde/before-update.txt"
run update --tool claude
test -n "$(find "$MARKET_HOME/backup" -name before-update.txt)"
grep -q '2.2.0' "$HOME/.claude/skills/prd-table-ronde/installed.json"
run remove prd-table-ronde --tool claude
mkdir -p "$HOME/.claude/skills/prd-table-ronde"
printf 'local\n' > "$HOME/.claude/skills/prd-table-ronde/local.txt"
if run install prd-table-ronde --tool claude; then echo 'KO: dossier non suivi accepté' >&2; exit 1; fi
if run remove prd-table-ronde --tool claude; then echo 'KO: dossier non suivi supprimé' >&2; exit 1; fi
run install prd-table-ronde --tool claude --force
saved=$(find "$MARKET_HOME/backup" -name local.txt)
[ "$(cat "$saved")" = local ]
case "$saved" in "$HOME/.claude/skills/"*) echo 'KO: sauvegarde dans le dossier client' >&2; exit 1;; esac
MARKET_TOOL=claude run installed | grep -q prd-table-ronde
for client in codex cursor gemini agents; do
  folder="$client"; [ "$client" != codex ] || folder=agents
  mkdir -p "$HOME/.$folder/skills/demo"
  printf '%s\n' '{"name":"demo","version":"1.0.0"}' > "$HOME/.$folder/skills/demo/installed.json"
  run installed --tool "$client" | grep -q 'demo 1.0.0'
done
mkdir -p "$HOME/.codex/skills/legacy"
printf '%s\n' '{"name":"legacy","version":"1.0.0"}' > "$HOME/.codex/skills/legacy/installed.json"
if run installed --tool codex | grep -q legacy; then echo 'KO: ancien répertoire Codex utilisé' >&2; exit 1; fi
if run installed --tool nonsense; then echo 'KO: client inconnu' >&2; exit 1; fi
if run installed --tool claude --bogus; then echo 'KO: option inconnue' >&2; exit 1; fi
if MARKET_HOME="$HOME/.claude/skills" run install prd-table-ronde --tool claude --force; then echo 'KO: sauvegarde dans le dossier client' >&2; exit 1; fi
if MARKET_HOME="$HOME/.claude/skills" run install prd-table-ronde --force; then echo 'KO: sauvegarde sans client dans le dossier client' >&2; exit 1; fi
run remove prd-table-ronde --tool claude
printf 'OK: client claude, sauvegarde, refus, options et suppression.\n'
