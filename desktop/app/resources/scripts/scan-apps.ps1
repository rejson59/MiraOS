# MiraOS — skan zainstalowanych aplikacji
# Zbiera skroty z Menu Start (wynik = aplikacje widoczne w systemie),
# wyciaga ikonki do PNG i zapisuje manifest apps.json.
$ErrorActionPreference = 'SilentlyContinue'

$outDir  = Join-Path $env:APPDATA 'MiraOS'
$iconDir = Join-Path $outDir 'icons'
New-Item -ItemType Directory -Force -Path $iconDir | Out-Null
Add-Type -AssemblyName System.Drawing

$shell = New-Object -ComObject WScript.Shell
$seen = @{}
$apps = New-Object System.Collections.Generic.List[object]

# --- skroty .lnk z Menu Start (wszyscy uzytkownicy + biezacy) ---
$dirs = @(
  (Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs'),
  (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs')
)
foreach ($d in $dirs) {
  if (-not (Test-Path $d)) { continue }
  Get-ChildItem -Path $d -Filter *.lnk -Recurse | ForEach-Object {
    $lnkPath = $_.FullName
    $lnk = $shell.CreateShortcut($lnkPath)
    $target = $lnk.TargetPath
    if ([string]::IsNullOrWhiteSpace($target)) { return }
    if ($target -match 'uninstall|uninst|setup|installer|readme|help|helpcenter|eula|repair|debug|crash') { return }
    $name = $_.BaseName
    if ($seen.ContainsKey($name)) { return }
    $seen[$name] = $true
    $apps.Add([pscustomobject]@{ name = $name; lnk = $lnkPath; target = $target; type = 'win32'; icon = $null })
  }
}

# --- aplikacje ze Sklepu (UWP) ---
Get-StartApps | Where-Object { $_.AppID -match '!' } | ForEach-Object {
  $n = $_.Name
  if ([string]::IsNullOrWhiteSpace($n)) { return }
  if ($seen.ContainsKey($n)) { return }
  $seen[$n] = $true
  $apps.Add([pscustomobject]@{ name = $n; lnk = $null; target = $_.AppID; type = 'uwp'; icon = $null })
}

# --- ikonki (win32) ---
$i = 0
foreach ($a in $apps) {
  if ($a.type -ne 'win32') { continue }
  try {
    $src = if (Test-Path $a.target) { $a.target } else { $a.lnk }
    $ico = [System.Drawing.Icon]::ExtractAssociatedIcon($src)
    if ($ico) {
      $bmp = $ico.ToBitmap()
      $pngPath = Join-Path $iconDir ("app_" + $i + ".png")
      $bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
      $bmp.Dispose(); $ico.Dispose()
      $a.icon = $pngPath
      $i++
    }
  } catch { }
}

# --- manifest ---
$manifest = [pscustomobject]@{ generated = (Get-Date -Format o); apps = $apps }
$json = $manifest | ConvertTo-Json -Depth 3
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $outDir 'apps.json'), $json, $utf8)

Write-Output ("OK " + $apps.Count)
