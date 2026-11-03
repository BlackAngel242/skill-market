$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cli = Join-Path $root 'cli/market.ps1'
$engine = (Get-Process -Id $PID).Path
$oldHome = $env:MARKET_HOME
$testHome = Join-Path ([IO.Path]::GetTempPath()) ('market-args-test-' + [guid]::NewGuid().ToString('N'))
$env:MARKET_HOME = $testHome
try {
  New-Item -ItemType Directory -Path $testHome | Out-Null
  foreach ($case in @(@('upgrade','demo','--bogus','Option inconnue'), @('install','../invalid','-y','Nom de skill invalide'), @('upgrade','../invalid','-y','Nom de skill invalide'))) {
    $oldPreference = $ErrorActionPreference
    try { $ErrorActionPreference = 'Continue'; $out = & $engine -NoProfile -ExecutionPolicy Bypass -File $cli $case[0] $case[1] $case[2] 2>&1 | Out-String; $code = $LASTEXITCODE }
    finally { $ErrorActionPreference = $oldPreference }
    if ($null -eq $code -or $code -eq 0 -or $out -notmatch $case[3]) { throw "Échec contrôle arguments : $($case[0]) / $out / $code" }
  }
  $driver = Join-Path $testHome 'info-driver.ps1'
  @'
param($Cli)
function Invoke-RestMethod {
  param($Uri)
  if ($Uri -like '*/index.json') { return [pscustomobject]@{skills=@([pscustomobject]@{name='demo';version='1.0.0';path='skills/demo';author='a';description='b'})} }
  throw 'réseau simulé'
}
. $Cli -Command info -Arg1 demo
'@ | Set-Content -LiteralPath $driver -Encoding UTF8
  $out = & $engine -NoProfile -ExecutionPolicy Bypass -File $driver $cli | Out-String
  $code = $LASTEXITCODE
  if ($null -eq $code -or $code -ne 0 -or $out -notmatch 'Fiche inaccessible \(réseau\)' -or $out -match 'Licence.*non renseigné') { throw "Échec contrôle réseau : $out / $code" }
  Write-Output 'OK: options install et upgrade, fiche inaccessible.'
} finally {
  if (Test-Path -LiteralPath $testHome) { Remove-Item -LiteralPath $testHome -Recurse -Force }
  $env:MARKET_HOME = $oldHome
}
