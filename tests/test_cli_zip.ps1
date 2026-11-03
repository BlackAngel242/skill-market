$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cli = Join-Path $root 'cli/market.ps1'
$engine = (Get-Process -Id $PID).Path
$previousPath = $env:PATH
$previousHome = $env:MARKET_HOME
$env:MARKET_HOME = Join-Path ([IO.Path]::GetTempPath()) ('market-zip-test-' + [guid]::NewGuid().ToString('N'))
$testHome = $env:MARKET_HOME
try {
  $env:PATH = Join-Path $env:SystemRoot 'System32'
  & $engine -NoProfile -Command 'if (Get-Command git -ErrorAction SilentlyContinue) { exit 1 }; Write-Output "OK: git absent"'
  if ($null -eq $LASTEXITCODE -or $LASTEXITCODE -ne 0) { throw 'Le chemin ne désactive pas git.' }
  & $engine -NoProfile -ExecutionPolicy Bypass -File $cli install prd-table-ronde
  if ($null -eq $LASTEXITCODE -or $LASTEXITCODE -ne 0) { throw "Installation ZIP échouée : code $LASTEXITCODE" }
  $installed = Join-Path $env:MARKET_HOME 'skills/prd-table-ronde/installed.json'
  if (-not (Test-Path -LiteralPath $installed)) { throw 'Métadonnées installées absentes.' }
  Write-Output 'OK: installation ZIP sans git et code 0 vérifiés.'
  . $cli -Command help | Out-Null
  function Invoke-WebRequest { throw 'réseau simulé' }
  try { Get-SkillFiles 'skills/demo' (Join-Path $env:MARKET_HOME 'fail'); throw 'Échec de téléchargement non détecté.' }
  catch { if ($_.Exception.Message -notmatch 'Téléchargement ZIP impossible') { throw } }
  function Invoke-WebRequest { param($Uri, $OutFile, [switch]$UseBasicParsing) Set-Content -LiteralPath $OutFile -Value 'invalid zip' }
  try { Get-SkillFiles 'skills/demo' (Join-Path $env:MARKET_HOME 'fail'); throw "Échec d'extraction non détecté." }
  catch { if ($_.Exception.Message -notmatch 'Extraction ZIP impossible') { throw } }
  Write-Output 'OK: téléchargement et extraction invalides rejetés.'
  $testHome = $env:MARKET_HOME
  $driver = Join-Path $testHome 'failure-driver.ps1'
  @'
param($Cli, $Mode)
$ErrorActionPreference = 'Stop'
function Invoke-WebRequest {
  param($Uri, $OutFile, [switch]$UseBasicParsing)
  if ($Mode -eq 'download') { throw 'réseau simulé' }
  Set-Content -LiteralPath $OutFile -Value 'invalid zip'
}
. $Cli -Command install -Arg1 prd-table-ronde
'@ | Set-Content -LiteralPath $driver -Encoding UTF8
  $env:MARKET_HOME = Join-Path $testHome 'failure-home'
  foreach ($mode in @('download', 'extract')) {
    $outputPath = Join-Path $testHome "$mode.txt"
    $oldPreference = $ErrorActionPreference
    try { $ErrorActionPreference = 'Continue'; & $engine -NoProfile -ExecutionPolicy Bypass -File $driver $cli $mode *> $outputPath }
    finally { $ErrorActionPreference = $oldPreference }
    $code = $LASTEXITCODE
    $expected = if ($mode -eq 'download') { 'Téléchargement ZIP impossible' } else { 'Extraction ZIP impossible' }
    if ($null -eq $code -or $code -eq 0 -or (Get-Content -LiteralPath $outputPath -Raw) -notmatch $expected) { throw "Erreur $mode non détectée dans le processus enfant : code $code" }
    Write-Output "OK: $mode code=$code et message vérifiés."
  }
  $env:MARKET_HOME = $testHome
} finally {
  $env:PATH = $previousPath
  if (Test-Path -LiteralPath $testHome) { Remove-Item -LiteralPath $testHome -Recurse -Force }
  $env:MARKET_HOME = $previousHome
}
