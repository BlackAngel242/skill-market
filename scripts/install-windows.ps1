#Requires -Version 5.1
<#
Installateur guidé de Skill Market. Il ne modifie pas le compte ChatGPT.
Agents locaux : délègue à `npx skills add` (liste à cocher des skills, des agents détectés et de la portée).
Node.js LTS peut être installé par winget, uniquement avec consentement.
#>
[CmdletBinding()]
param(
  [ValidateSet('','agents','chatgpt')][string]$Tool = '',
  [switch]$DryRun,
  [switch]$Yes
)
$ErrorActionPreference = 'Stop'
function Node-Version {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $cmd) { return 0 }
  try { if ((& node --version) -match '^v(\d+)\.') { return [int]$Matches[1] } }
  catch {}
  return 0
}
function Confirm-Action([string]$message) {
  if ($Yes) { return $true }
  return (Read-Host "$message (o/N)") -match '^(?i:o|oui|y|yes)$'
}
function Python-Command {
  if (Get-Command py -ErrorAction SilentlyContinue) { return @{ Exe = 'py'; Args = @('-3') } }
  if (Get-Command python -ErrorAction SilentlyContinue) { return @{ Exe = 'python'; Args = @() } }
  return $null
}
try {
  Write-Host '=== Skill Market — installateur guidé ===' -ForegroundColor Cyan
  if (-not $Tool) {
    Write-Host '1. Agents locaux : Claude Code, Codex, Cursor, Gemini/Antigravity, OpenCode... (recommandé)'
    Write-Host '2. ChatGPT (préparer des ZIP à importer)'
    $choice = Read-Host 'Votre choix [1]'
    $Tool = if ($choice -eq '2') { 'chatgpt' } else { 'agents' }
  }
  if ($Tool -eq 'chatgpt') {
    Write-Host "ChatGPT : le compte n'est pas modifié automatiquement." -ForegroundColor Yellow
    $py = Python-Command
    if (-not $py) { throw "Python 3 est nécessaire pour créer les ZIP. Sinon, télécharger les artefacts GitHub Actions." }
    if ($DryRun) { Write-Host '[simulation] Aucun fichier créé.'; exit 0 }
    & $py.Exe @($py.Args) (Join-Path $PSScriptRoot 'build-chatgpt.py')
    if ($LASTEXITCODE -ne 0) { throw "La génération des archives a échoué." }
    Write-Host 'ZIP générés dans le dossier dist.' -ForegroundColor Green
    Write-Host 'Sur un compte éligible : Plugins > Compétences > Créer > Importer depuis votre ordinateur.'
    exit 0
  }
  if ((Node-Version) -lt 22) {
    Write-Host 'Node.js 22+ est requis.' -ForegroundColor Yellow
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { throw 'Winget absent : installer Node.js LTS depuis https://nodejs.org/ puis relancer.' }
    if (-not (Confirm-Action 'Installer Node.js LTS avec winget ?')) { throw 'Installation annulée.' }
    if ($DryRun) { Write-Host '[simulation] Installation Node.js via winget, aucune écriture.'; exit 0 }
    & winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) { throw "L'installation de Node.js a échoué." }
    $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
    if ((Node-Version) -lt 22) { throw 'Node.js non détecté dans cette session. Ouvrir un nouveau terminal puis relancer.' }
  }
  # --list en simulation : affiche le catalogue sans rien écrire.
  $npxArgs = @('-y', 'skills', 'add', 'BlackAngel242/skill-market')
  if ($DryRun) { $npxArgs += '--list' }
  & npx @npxArgs
  if ($LASTEXITCODE -ne 0) { throw "L'installation a échoué ($LASTEXITCODE)." }
  Write-Host 'Terminé. Relancer ou actualiser le client pour charger les skills.' -ForegroundColor Green
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
