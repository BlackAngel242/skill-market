$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid().ToString("N"))
$env:MARKET_HOME = Join-Path $tempRoot "home"
$outside = Join-Path $env:MARKET_HOME "keep.txt"
New-Item -ItemType Directory -Path (Join-Path $env:MARKET_HOME "skills") -Force | Out-Null
Set-Content -Path $outside -Value "keep"

try {
  . (Join-Path $repoRoot "cli/market.ps1") -Command "remove" -Arg1 "..\keep.txt"
} catch {
  # A rejected traversal is expected. The file outside skills must remain.
}

if (-not (Test-Path -LiteralPath $outside)) {
  throw "remove escaped the skills directory"
}

Remove-Item -LiteralPath $tempRoot -Recurse -Force
Write-Output "OK: remove cannot escape the skills directory."
