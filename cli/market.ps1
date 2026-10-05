#!/usr/bin/env pwsh
<#
.SYNOPSIS
  market - installe et met à jour des skills depuis le marketplace skill-market (Windows).

.COMMANDES
  market.ps1 list                catalogue distant
  market.ps1 search <mot>        recherche dans le catalogue
  market.ps1 info <skill>        fiche d'un skill
  market.ps1 install <skill> [-y]  installe en global (détecte les outils requis)
  market.ps1 upgrade <skill>     met à jour un skill installé
  market.ps1 update              met à jour tous les skills installés
  market.ps1 remove <skill>      désinstalle
  market.ps1 installed           skills installés localement
  market.ps1 publish [chemin]    valide un skill avant soumission (PR)

.VARIABLES D'ENVIRONNEMENT
  MARKET_REPO    dépôt GitHub (défaut : BlackAngel242/skill-market)
  MARKET_BRANCH  branche (défaut : main)
  MARKET_HOME    dossier d'installation (défaut : $HOME\.skill-market)
  ASSUME_YES=1   répond oui à toutes les questions (équivaut à -y)

.EXEMPLE
  powershell -ExecutionPolicy Bypass -File .\market.ps1 install uxfix
#>
param(
  [string]$Command = "",
  [string]$Arg1 = "",
  [string]$Arg2 = ""
)

$ErrorActionPreference = "Stop"

$Repo       = if ($env:MARKET_REPO)   { $env:MARKET_REPO }   else { "BlackAngel242/skill-market" }
$Branch     = if ($env:MARKET_BRANCH) { $env:MARKET_BRANCH } else { "main" }
$MarketHome = if ($env:MARKET_HOME)   { $env:MARKET_HOME }   else { Join-Path $HOME ".skill-market" }
$SkillsDir  = Join-Path $MarketHome "skills"
$IndexUrl   = "https://raw.githubusercontent.com/$Repo/$Branch/index.json"
$RepoUrl    = "https://github.com/$Repo.git"

function Confirm-Yes($Prompt) {
  if ($env:ASSUME_YES -eq "1") { return $true }
  $ans = Read-Host "$Prompt [o/N]"
  return $ans -match '^[oOyY]$'
}

function Get-Index {
  (Invoke-RestMethod -Uri $IndexUrl).skills
}

function Test-SafeSkillName($Name) {
  return ($Name -match '\A[A-Za-z0-9][A-Za-z0-9._-]*\z' -and $Name -notin @(".", ".."))
}

function Test-SafeSkillPath($Path) {
  if ($Path -notmatch '\Askills/[A-Za-z0-9._/-]+\z') { return $false }
  foreach ($part in ($Path -split '/')) {
    if ($part -in @("", ".", "..")) { return $false }
  }
  return $true
}

function Get-Skill($Name) {
  Get-Index | Where-Object { $_.name -eq $Name } | Select-Object -First 1
}

function Test-VersionNewer($Installed, $Remote) {
  if ($Installed -eq $Remote) { return $false }
  return ([version]$Remote -gt [version]$Installed)
}

function Get-SkillFiles($RepoPath, $Dest) {
  # Télécharge un sous-dossier du dépôt : git sparse-checkout si dispo, sinon zip.
  if (-not (Test-SafeSkillPath $RepoPath)) { throw "Chemin de skill invalide dans le catalogue." }
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    if (Get-Command git -ErrorAction SilentlyContinue) {
      $r = Join-Path $tmp "repo"
      & git -C $tmp clone -q --depth 1 --filter=blob:none --sparse $RepoUrl repo 2>$null
      if ($LASTEXITCODE -ne 0) { throw "git clone a échoué." }
      & git -C $r sparse-checkout set $RepoPath 2>$null | Out-Null
      Copy-Item (Join-Path $r $RepoPath) -Destination $Dest -Recurse -Force
    } else {
      $zip = Join-Path $tmp "repo.zip"
      Invoke-WebRequest -Uri "https://github.com/$Repo/archive/refs/heads/$Branch.zip" -OutFile $zip
      Expand-Archive -Path $zip -DestinationPath $tmp
      $base = Get-ChildItem -Path $tmp -Directory | Select-Object -First 1
      Copy-Item (Join-Path $base.FullName $RepoPath) -Destination $Dest -Recurse -Force
    }
  } finally {
    Remove-Item -Path $tmp -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Test-Requires($ManifestPath) {
  # Vérifie les outils requis par le skill, propose d'installer ce qui manque.
  $m = Get-Content $ManifestPath -Raw | ConvertFrom-Json
  $req = $m.requires
  if (-not $req) { return $true }
  foreach ($b in @($req.bins) | Where-Object { $_ }) {
    if (-not (Get-Command $b -ErrorAction SilentlyContinue)) {
      Write-Host "Binaire manquant : '$b'. Installe-le manuellement, je ne peux pas deviner la source."
      Write-Host "Abandon de l'installation."
      return $false
    }
  }
  foreach ($p in @($req.npm) | Where-Object { $_ }) {
    & npm ls -g $p 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Paquet npm manquant : '$p'"
      if (Confirm-Yes "Installer '$p' en global avec npm ?") { & npm install -g $p }
      else { Write-Host "Abandon : '$p' est requis."; return $false }
    }
  }
  foreach ($p in @($req.pip) | Where-Object { $_ }) {
    $pip = (Get-Command pip -ErrorAction SilentlyContinue) ?? (Get-Command pip3 -ErrorAction SilentlyContinue)
    if (-not $pip) { Write-Host "pip introuvable et requis. Abandon."; return $false }
    & $pip show $p 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Paquet pip manquant : '$p'"
      if (Confirm-Yes "Installer '$p' avec pip ?") { & $pip install $p }
      else { Write-Host "Abandon : '$p' est requis."; return $false }
    }
  }
  return $true
}

function Write-Installed($Name, $Version) {
  $meta = @{ name = $Name; version = $Version; installed_at = (Get-Date).ToString("yyyy-MM-dd") }
  $meta | ConvertTo-Json | Set-Content (Join-Path $SkillsDir "$Name\installed.json")
}

function Install-Skill($Name) {
  if (-not (Test-SafeSkillName $Name)) { throw "Nom de skill invalide." }
  $s = Get-Skill $Name
  if (-not $s) { Write-Host "Skill '$Name' introuvable. Essaie 'market.ps1 list'."; exit 1 }
  $version = $s.version; $path = $s.path
  if ($version -notmatch '\A[0-9]+\.[0-9]+\.[0-9]+\z') { throw "Version de skill invalide dans le catalogue." }

  $metaFile = Join-Path $SkillsDir "$Name\installed.json"
  if (Test-Path $metaFile) {
    $iv = (Get-Content $metaFile -Raw | ConvertFrom-Json).version
    if ($iv -eq $version) { Write-Host "$Name $version est déjà installé."; return }
    Write-Host "Mise à jour de ${Name} : $iv -> $version"
  } else {
    Write-Host "Installation de $Name $version..."
  }

  $tmp = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
  $pkg = Join-Path $tmp "pkg"
  try {
    Get-SkillFiles $path $pkg
    if (-not (Test-Requires (Join-Path $pkg "skill.json"))) { return }
    if (-not (Test-Path $SkillsDir)) { New-Item -ItemType Directory -Path $SkillsDir | Out-Null }
    $dest = Join-Path $SkillsDir $Name
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $pkg -Destination $dest -Recurse -Force
    Write-Installed $Name $version
    Write-Host "OK : $Name $version installé dans $dest"
  } finally {
    Remove-Item -Path $tmp -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Show-Usage {
  @"
Usage : market.ps1 <commande> [arguments]

  list                catalogue distant
  search <mot>        recherche dans le catalogue
  info <skill>        fiche d'un skill
  install <skill> [-y]  installe en global (détecte les outils requis)
  upgrade <skill>     met à jour un skill installé
  update              met à jour tous les skills installés
  remove <skill>      désinstalle
  installed           skills installés localement
  publish [chemin]    valide un skill avant soumission (PR)
"@
}

function Publish-Skill($Src) {
  # Valide un skill avant soumission : SKILL.md, skill.json, version, secrets, taille.
  if (-not $Src) { $Src = "." }
  if (-not (Test-Path $Src -PathType Container)) { Write-Host "Dossier introuvable : $Src"; exit 1 }
  $Src = (Resolve-Path $Src).Path
  $nameDir = Split-Path $Src -Leaf

  # racine du dépôt (pour index.json) : remonte jusqu'à trouver index.json
  $root = $Src
  while ($root -and -not (Test-Path (Join-Path $root "index.json"))) {
    $parent = Split-Path $root -Parent
    if ($parent -eq $root) { $root = $null; break }
    $root = $parent
  }

  $errors = [System.Collections.Generic.List[string]]::new()
  $warns  = [System.Collections.Generic.List[string]]::new()
  $oks    = [System.Collections.Generic.List[string]]::new()

  # 1. SKILL.md + frontmatter
  $sk = Join-Path $Src "SKILL.md"
  $fm = @{}
  if (-not (Test-Path $sk)) { $errors.Add("SKILL.md manquant") }
  else {
    $txt = Get-Content $sk -Raw
    if ($txt -match '(?s)\A---\s*\r?\n(.*?)\r?\n---\s*(\r?\n|$)') {
      foreach ($line in ($Matches[1] -split "`n")) {
        if ($line -match '^\s*([A-Za-z0-9_-]+)\s*:\s*(.+?)\s*$') {
          $fm[$Matches[1]] = $Matches[2].Trim().Trim("'").Trim('"')
        }
      }
      if ($fm["name"]) { $oks.Add("frontmatter : name = '$($fm["name"])'") } else { $errors.Add("frontmatter : 'name' manquant") }
      if ($fm["description"]) { $oks.Add("frontmatter : description présente") } else { $errors.Add("frontmatter : 'description' manquante") }
    } else { $errors.Add("SKILL.md : frontmatter YAML '---' manquant ou malformé") }
  }

  # 2. skill.json
  $sj = Join-Path $Src "skill.json"
  $manifest = $null
  if (-not (Test-Path $sj)) { $errors.Add("skill.json manquant") }
  else {
    try { $manifest = Get-Content $sj -Raw | ConvertFrom-Json; $oks.Add("skill.json : JSON valide") }
    catch { $errors.Add("skill.json : JSON invalide ($($_.Exception.Message))") }
  }
  if ($manifest) {
    foreach ($f in @("name", "version", "description")) {
      if ($manifest.$f) { $oks.Add("skill.json : '$f' présent") } else { $errors.Add("skill.json : '$f' manquant") }
    }
    $n = "$($manifest.name)"
    if ($n -and $fm["name"] -and $n -ne $fm["name"]) { $errors.Add("incohérence : skill.json name='$n' != SKILL.md name='$($fm["name"])'") }
    elseif ($n) { $oks.Add("skill.json : name cohérent avec SKILL.md") }
    if ($n -and $n -ne $nameDir) { $errors.Add("incohérence : skill.json name='$n' != nom du dossier '$nameDir'") }
    elseif ($n) { $oks.Add("skill.json : name cohérent avec le dossier") }
    $v = "$($manifest.version)"
    if ($v -match '^\d+\.\d+\.\d+$') { $oks.Add("skill.json : version '$v' valide (semver)") }
    elseif ($v) { $errors.Add("skill.json : version '$v' invalide (attendu X.Y.Z)") }

    # 3. index.json : collision de version
    if ($root) {
      try {
        $idx = Get-Content (Join-Path $root "index.json") -Raw | ConvertFrom-Json
        $found = $idx.skills | Where-Object { $_.name -eq $n } | Select-Object -First 1
        if ($found) {
          if ("$($found.version)" -eq $v) { $errors.Add("index.json : la version $v de '$n' est déjà publiée (bumpe la version)") }
          else { $oks.Add("index.json : '$n' existe ($($found.version)), nouvelle version $v") }
        } else { $oks.Add("index.json : '$n' est un nouveau skill (aucune collision)") }
      } catch { $warns.Add("index.json illisible : $($_.Exception.Message)") }
    }
  }

  # 4. scan secrets (avertissement, revue manuelle)
  $pats = @('sk-[A-Za-z0-9]{20,}', 'ghp_[A-Za-z0-9]{20,}', 'BEGIN [A-Z ]*PRIVATE KEY',
            '(?i)(api[_-]?key|secret|token)\s*[:=]\s*[''"][^''"]{8,}[''"]')
  $hits = @()
  Get-ChildItem -Path $Src -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' } | ForEach-Object {
      $t = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
      if ($t) { foreach ($pat in $pats) {
        $m = [regex]::Match($t, $pat)
        if ($m.Success) { $hits += "$($_.FullName.Substring($Src.Length + 1)): $($m.Value.Substring(0, [Math]::Min(24, $m.Value.Length)))..."; break }
      } }
    }
  if ($hits.Count -gt 0) { $warns.Add("possible secret détecté ($($hits.Count)) : $($hits[0..([Math]::Min(2, $hits.Count - 1))] -join ', ') — vérifie avant de publier") }
  else { $oks.Add("aucun secret détecté") }

  # 5. taille
  $total = (Get-ChildItem -Path $Src -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  if ($total -gt 5MB) { $warns.Add("skill volumineux : $([math]::Round($total / 1MB, 1)) Mo (> 5 Mo)") }
  else { $oks.Add("taille raisonnable : $([math]::Round($total / 1KB)) Ko") }

  foreach ($m in $oks)    { Write-Host "  ✓ $m" }
  foreach ($m in $warns)  { Write-Host "  ! $m" }
  foreach ($m in $errors) { Write-Host "  ✗ $m" }
  Write-Host ""
  if ($errors.Count -gt 0) {
    Write-Host "RÉSULTAT : $($errors.Count) erreur(s), $($warns.Count) avertissement(s) — corrige avant la PR."
    exit 1
  }
  Write-Host "RÉSULTAT : prêt à publier ($($oks.Count) vérifications, $($warns.Count) avertissement(s))."
  if ($manifest) {
    $n = $manifest.name; $v = $manifest.version
    Write-Host ""
    Write-Host "Prochaines étapes :"
    Write-Host "  1. Ajoute cette entrée dans index.json :"
    Write-Host "     {`"name`": `"$n`", `"version`": `"$v`", `"description`": `"$($manifest.description)`", `"author`": `"BlackAngel242`", `"path`": `"skills/$n`"}"
    Write-Host "  2. git add skills/$n index.json && git commit -m `"publish: $n $v`""
    Write-Host "  3. Ouvre une PR vers main."
  }
}

switch ($Command) {
  "list" {
    Get-Index | ForEach-Object { "$($_.name) $($_.version) - $($_.description)" }
  }
  "search" {
    if (-not $Arg1) { Write-Host "Usage : market.ps1 search <mot>"; exit 1 }
    $q = $Arg1.ToLower()
    Get-Index | Where-Object { ("$($_.name) $($_.description)").ToLower().Contains($q) } |
      ForEach-Object { "$($_.name) $($_.version) - $($_.description)" }
  }
  "info" {
    if (-not $Arg1) { Write-Host "Usage : market.ps1 info <skill>"; exit 1 }
    $s = Get-Skill $Arg1
    if (-not $s) { Write-Host "Skill introuvable."; exit 1 }
    "Nom         : $($s.name)"
    "Version     : $($s.version)"
    "Auteur      : $($s.author)"
    "Description : $($s.description)"
  }
  "install" {
    if (-not $Arg1) { Write-Host "Usage : market.ps1 install <skill> [-y]"; exit 1 }
    if ($Arg2 -eq "-y" -or $Arg2 -eq "--yes") { $env:ASSUME_YES = "1" }
    Install-Skill $Arg1
  }
  "upgrade" {
    if (-not $Arg1) { Write-Host "Usage : market.ps1 upgrade <skill>"; exit 1 }
    Install-Skill $Arg1
  }
  "update" {
    if (-not (Test-Path $SkillsDir)) { Write-Host "Aucun skill installé."; break }
    $idx = Get-Index
    $n = 0
    Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
      $metaFile = Join-Path $_.FullName "installed.json"
      if (Test-Path $metaFile) {
        $meta = Get-Content $metaFile -Raw | ConvertFrom-Json
        $remote = $idx | Where-Object { $_.name -eq $meta.name } | Select-Object -First 1
        if ($remote -and (Test-VersionNewer $meta.version $remote.version)) {
          Install-Skill $meta.name; $n++
        }
      }
    }
    if ($n -eq 0) { Write-Host "Tout est à jour." }
  }
  "remove" {
    if (-not $Arg1) { Write-Host "Usage : market.ps1 remove <skill>"; exit 1 }
    if (-not (Test-SafeSkillName $Arg1)) { throw "Nom de skill invalide." }
    Remove-Item (Join-Path $SkillsDir $Arg1) -Recurse -Force
    Write-Host "$Arg1 désinstallé."
  }
  "installed" {
    if (-not (Test-Path $SkillsDir)) { Write-Host "Aucun skill installé."; break }
    Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
      $metaFile = Join-Path $_.FullName "installed.json"
      if (Test-Path $metaFile) {
        $m = Get-Content $metaFile -Raw | ConvertFrom-Json
        "$($m.name) $($m.version) (installé le $($m.installed_at))"
      }
    }
  }
  "publish" { Publish-Skill $Arg1 }
  { $_ -in "-h", "--help", "help", "" } { Show-Usage }
  default { Write-Host "Commande inconnue : $Command"; Show-Usage; exit 1 }
}
