# MiraOS — wylaczenie zaokraglania okien
$pidFile = Join-Path $env:APPDATA 'MiraOS\round.pid'
if (Test-Path $pidFile) {
    $old = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($old) { Stop-Process -Id $old -Force -ErrorAction SilentlyContinue }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}
Write-Output 'OK'
