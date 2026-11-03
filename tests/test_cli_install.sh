#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
export MARKET_HOME
MARKET_HOME=$(mktemp -d)
trap 'rm -rf -- "$MARKET_HOME"' EXIT
set -- help
source "$root/cli/market" >/dev/null
skill_field() { case "$2" in version) echo 2.0.0;; path) echo skills/demo;; esac; }
download_skill() { mkdir -p "$2"; printf '%s\n' '{"name":"demo","version":"2.0.0","requires":{"bins":[]}}' > "$2/skill.json"; echo demo > "$2/SKILL.md"; }
do_install demo
printf '%s\n' '{"name":"demo","version":"1.0.0"}' > "$SKILLS_DIR/demo/installed.json"
echo local > "$SKILLS_DIR/demo/local.txt"
do_install demo
saved=$(find "$MARKET_HOME/backup" -name local.txt)
[ "$(cat "$saved")" = local ]
mkdir "$SKILLS_DIR/untracked"
if do_install untracked; then echo 'KO: non suivi accepté' >&2; exit 1; fi
printf '%s\n' '{"name":"demo","version":"1.0.0"}' > "$SKILLS_DIR/demo/installed.json"
echo restore > "$SKILLS_DIR/demo/restore.txt"
write_installed() { return 1; }
if do_install demo; then echo 'KO: erreur de copie non détectée' >&2; exit 1; fi
[ "$(cat "$SKILLS_DIR/demo/restore.txt")" = restore ]
fetch_index() { printf '%s\n' '{"skills":[{"name":"demo","version":"2.0.0"}]}'; }
do_install() { return 1; }
if result=$(cmd_update); then echo 'KO: update a masqué un échec' >&2; exit 1; fi
[[ "$result" == *'réussies : 0 ; échecs : 1'* ]]
echo 'OK: installation, sauvegarde, refus non suivi et restauration.'
