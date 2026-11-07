#!/usr/bin/env bash
# Assistant interactif de Vercel Labs : liste à cocher des skills, des agents détectés et de la portée.
set -euo pipefail
command -v npx >/dev/null 2>&1 || { echo "Node.js requis (npx) : https://nodejs.org/" >&2; exit 1; }
exec npx -y skills add BlackAngel242/skill-market "$@"
