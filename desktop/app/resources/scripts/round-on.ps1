# MiraOS — wlaczenie zaokraglonych okien (najpierw ubij stare, jesli sa)
$pidFile = Join-Path $env:APPDATA 'MiraOS\round.pid'
if (Test-Path $pidFile) {
    $old = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($old) { Stop-Process -Id $old -Force -ErrorAction SilentlyContinue }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}
$dir = Split-Path $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-WindowStyle','Hidden','-File', (Join-Path $dir 'round-windows.ps1')) -WindowStyle Hidden
Write-Output 'OK'
