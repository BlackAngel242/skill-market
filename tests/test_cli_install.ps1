$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$env:MARKET_HOME = Join-Path ([IO.Path]::GetTempPath()) ('market-test-' + [guid]::NewGuid().ToString('N'))
. (Join-Path $root 'cli/market.ps1') -Command help | Out-Null
function Get-Skill($Name) { [pscustomobject]@{ name=$Name; version='2.0.0'; path="skills/$Name" } }
function Get-SkillFiles($RepoPath, $Dest) {
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  '{"name":"demo","version":"2.0.0","requires":{"bins":[]}}' | Set-Content (Join-Path $Dest 'skill.json')
  'demo' | Set-Content (Join-Path $Dest 'SKILL.md')
}
try {
  Install-Skill 'demo'
  $dest = Join-Path $SkillsDir 'demo'
  '{"name":"demo","version":"1.0.0"}' | Set-Content (Join-Path $dest 'installed.json')
  'local' | Set-Content (Join-Path $dest 'local.txt')
  Install-Skill 'demo'
  $saved = @(Get-ChildItem -LiteralPath (Join-Path $MarketHome 'backup') -Recurse -Filter 'local.txt')
  if ($saved.Count -ne 1 -or (Get-Content $saved[0].FullName) -ne 'local') { throw 'Sauvegarde invalide.' }
  function npm { $global:LASTEXITCODE = 17 }
  $env:ASSUME_YES = '1'
  '{"requires":{"npm":["missing-package"]}}' | Set-Content (Join-Path $env:MARKET_HOME 'requires.json')
  if (Test-Requires (Join-Path $env:MARKET_HOME 'requires.json')) { throw 'Échec npm non détecté.' }
  New-Item -ItemType Directory -Path (Join-Path $SkillsDir 'unknown') | Out-Null
  try { Install-Skill 'unknown'; throw 'Le refus attendu manque.' } catch { if ($_.Exception.Message -notmatch 'Destination non suivie') { throw } }
  '{"name":"demo","version":"1.0.0"}' | Set-Content (Join-Path $dest 'installed.json')
  'restore' | Set-Content (Join-Path $dest 'restore.txt')
  function Write-Installed($Name, $Version) { throw 'échec simulé' }
  try { Install-Skill 'demo'; throw 'Échec attendu absent.' } catch { if ($_.Exception.Message -ne 'échec simulé') { throw } }
  if ((Get-Content (Join-Path $dest 'restore.txt')) -ne 'restore') { throw 'Restauration invalide.' }
  Write-Host 'OK: installation, sauvegarde, refus non suivi et restauration.'
} finally {
  if (Test-Path -LiteralPath $env:MARKET_HOME) { Remove-Item -LiteralPath $env:MARKET_HOME -Recurse -Force }
}
