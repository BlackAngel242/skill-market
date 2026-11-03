$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cli = Join-Path $root 'cli/market.ps1'
$engine = (Get-Process -Id $PID).Path
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('market-tools-' + [guid]::NewGuid().ToString('N'))
$oldUser = $env:USERPROFILE; $oldHome = $env:HOME; $oldMarket = $env:MARKET_HOME; $oldTool = $env:MARKET_TOOL
$oldLocal = $env:LOCALAPPDATA; $oldApp = $env:APPDATA; $oldCache = $env:PSModuleAnalysisCachePath
$env:USERPROFILE = Join-Path $testRoot 'profile'; $env:HOME = $env:USERPROFILE; $env:MARKET_HOME = Join-Path $testRoot 'market'; $env:MARKET_TOOL = ''
$env:LOCALAPPDATA = Join-Path $env:USERPROFILE 'AppData/Local'; $env:APPDATA = Join-Path $env:USERPROFILE 'AppData/Roaming'; $env:PSModuleAnalysisCachePath = Join-Path $testRoot 'module-cache'
function Invoke-Market([string[]]$MarketArgs, [int]$Expected = 0) {
  $previous = $ErrorActionPreference
  try { $ErrorActionPreference = 'Continue'; $result = & $engine -NoProfile -ExecutionPolicy Bypass -File $cli @MarketArgs 2>&1 | Out-String; $code = $LASTEXITCODE }
  finally { $ErrorActionPreference = $previous }
  if ($null -eq $code -or $code -ne $Expected) { throw "Commande $MarketArgs : code $code attendu $Expected ; $result" }
  return $result
}
try {
  New-Item -ItemType Directory -Path $env:LOCALAPPDATA, $env:APPDATA -Force | Out-Null
  $probe = Join-Path $testRoot 'profile-check.ps1'
  '[Environment]::GetFolderPath("LocalApplicationData"); $env:PSModuleAnalysisCachePath' | Set-Content -LiteralPath $probe -Encoding UTF8
  $profileResult = @(& $engine -NoProfile -File $probe)
  if ($LASTEXITCODE -ne 0 -or $profileResult[0] -ne $env:LOCALAPPDATA -or $profileResult[1] -ne $env:PSModuleAnalysisCachePath) { throw 'Profil ou cache temporaire non appliqué au processus enfant.' }
  $dest = Join-Path $env:USERPROFILE '.claude/skills/prd-table-ronde'
  Invoke-Market @('install','prd-table-ronde','--tool','claude') | Out-Null
  if (-not (Test-Path -LiteralPath (Join-Path $dest 'installed.json'))) { throw 'Installation introuvable.' }
  if ((Invoke-Market @('installed','--tool','claude')) -notmatch 'prd-table-ronde 2.2.0') { throw 'Installed incorrect.' }
  Invoke-Market @('doctor','--tool','claude') | Out-Null
  '{"name":"prd-table-ronde","version":"1.0.0"}' | Set-Content -LiteralPath (Join-Path $dest 'installed.json')
  Set-Content -LiteralPath (Join-Path $dest 'before-update.txt') -Value 'avant mise à jour'
  Invoke-Market @('update','--tool','claude') | Out-Null
  if (-not @(Get-ChildItem -Path (Join-Path $env:MARKET_HOME 'backup') -Recurse -Filter before-update.txt).Count) { throw 'Mise à jour sans sauvegarde.' }
  if ((Get-Content -LiteralPath (Join-Path $dest 'installed.json') -Raw | ConvertFrom-Json).version -ne '2.2.0') { throw 'Mise à jour du client échouée.' }
  Invoke-Market @('remove','prd-table-ronde','--tool','claude') | Out-Null
  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  Set-Content -LiteralPath (Join-Path $dest 'local.txt') -Value 'local'
  if ((Invoke-Market @('install','prd-table-ronde','--tool','claude') 1) -notmatch 'Destination non suivie') { throw 'Refus incorrect.' }
  if ((Invoke-Market @('remove','prd-table-ronde','--tool','claude') 1) -notmatch 'non suivi') { throw 'Suppression non suivie acceptée.' }
  Invoke-Market @('install','prd-table-ronde','--tool','claude','--force') | Out-Null
  $saved = @(Get-ChildItem -Path (Join-Path $env:MARKET_HOME 'backup') -Recurse -Filter local.txt)
  if ($saved.Count -ne 1 -or (Get-Content -LiteralPath $saved[0].FullName) -ne 'local') { throw 'Sauvegarde invalide.' }
  if ($saved[0].FullName.StartsWith((Join-Path $env:USERPROFILE '.claude/skills'), [StringComparison]::OrdinalIgnoreCase)) { throw 'Sauvegarde dans le dossier client.' }
  $env:MARKET_TOOL='claude'; if ((Invoke-Market @('installed')) -notmatch 'prd-table-ronde') { throw 'MARKET_TOOL ignoré.' }; $env:MARKET_TOOL=''
  foreach ($client in @('codex','cursor','agents')) {
    $folder = if ($client -eq 'codex') { 'agents' } else { $client }
    $clientDir = Join-Path $env:USERPROFILE ".$folder/skills/demo"
    New-Item -ItemType Directory -Path $clientDir -Force | Out-Null
    '{"name":"demo","version":"1.0.0"}' | Set-Content -LiteralPath (Join-Path $clientDir 'installed.json')
    if ((Invoke-Market @('installed','--tool',$client)) -notmatch 'demo 1.0.0') { throw "Chemin $client incorrect." }
  }
  $legacyDir = Join-Path $env:USERPROFILE '.codex/skills/legacy'
  New-Item -ItemType Directory -Path $legacyDir -Force | Out-Null
  '{"name":"legacy","version":"1.0.0"}' | Set-Content -LiteralPath (Join-Path $legacyDir 'installed.json')
  if ((Invoke-Market @('installed','--tool','codex')) -match 'legacy') { throw 'Ancien répertoire Codex utilisé.' }
  Invoke-Market @('installed','--tool','nonsense') 1 | Out-Null
  Invoke-Market @('installed','--tool','claude','--bogus') 1 | Out-Null
  $backupHome = $env:MARKET_HOME
  $env:MARKET_HOME = Join-Path $env:USERPROFILE '.claude/skills'
  try {
    if ((Invoke-Market @('install','prd-table-ronde','--tool','claude','--force') 1) -notmatch 'Sauvegarde interdite') { throw 'Sauvegarde dans le dossier client acceptée.' }
    if ((Invoke-Market @('install','prd-table-ronde','--force') 1) -notmatch 'Sauvegarde interdite') { throw 'Sauvegarde sans client dans le dossier client acceptée.' }
  }
  finally { $env:MARKET_HOME = $backupHome }
  Invoke-Market @('remove','prd-table-ronde','--tool','claude') | Out-Null
  Write-Output 'OK: client claude, sauvegarde, refus, options et suppression.'
} finally {
  $env:USERPROFILE=$oldUser; $env:HOME=$oldHome; $env:MARKET_HOME=$oldMarket; $env:MARKET_TOOL=$oldTool
  $env:LOCALAPPDATA=$oldLocal; $env:APPDATA=$oldApp; $env:PSModuleAnalysisCachePath=$oldCache
  if (Test-Path -LiteralPath $testRoot) { Remove-Item -LiteralPath $testRoot -Recurse -Force }
}
