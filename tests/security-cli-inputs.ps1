$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$market = Join-Path $repoRoot "cli/market.ps1"
# Same engine as the caller: powershell.exe 5.1 or pwsh 7.
$engine = (Get-Process -Id $PID).Path

$tokens = $null
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile($market, [ref]$tokens, [ref]$errors) | Out-Null
if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Output "line $($_.Extent.StartLineNumber): $($_.Message)" }
  throw "market.ps1 does not parse under PowerShell $($PSVersionTable.PSVersion)"
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid().ToString("N"))
$env:MARKET_HOME = Join-Path $tempRoot "home"
$skills = Join-Path $env:MARKET_HOME "skills"
$outside = Join-Path $env:MARKET_HOME "keep.txt"
New-Item -ItemType Directory -Path $skills -Force | Out-Null
Set-Content -Path $outside -Value "keep"

function Invoke-Market([string[]]$CliArgs) {
  # PowerShell 5.1 turns a child's stderr into a terminating error under "Stop".
  $ErrorActionPreference = "Continue"
  $out = & $engine -NoProfile -ExecutionPolicy Bypass -File $market @CliArgs 2>&1 | Out-String
  return @{ Code = $LASTEXITCODE; Output = $out }
}

try {
  # The traversal must be refused for the stated reason, not by any crash.
  $r = Invoke-Market @("remove", "..\keep.txt")
  if ($r.Code -eq 0) { throw "remove ..\keep.txt succeeded" }
  if ($r.Output -notmatch "Nom de skill invalide") { throw "remove failed for an unexpected reason: $($r.Output)" }
  if (-not (Test-Path -LiteralPath $outside)) { throw "remove escaped the skills directory" }

  # A valid name must still be removable, otherwise the refusal above proves nothing.
  $demo = Join-Path $skills "demo"
  New-Item -ItemType Directory -Path $demo -Force | Out-Null
  $r = Invoke-Market @("remove", "demo")
  if ($r.Code -ne 0 -or (Test-Path -LiteralPath $demo)) { throw "remove demo failed: $($r.Output)" }
}
finally {
  Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output "OK: remove refuses traversal and still removes a valid skill (PowerShell $($PSVersionTable.PSVersion))."
