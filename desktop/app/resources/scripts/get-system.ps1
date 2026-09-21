# MiraOS — telemetria systemu: bateria + nazwa sieci WiFi (jedna linia JSON)
$ErrorActionPreference = 'SilentlyContinue'

$bat = $null
$charging = $false
try {
    $b = Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($b) {
        $bat = [int]$b.EstimatedChargeRemaining
        $charging = ($b.BatteryStatus -eq 2)   # 2 = na zasilaniu
    }
} catch { }

$ssid = $null
try {
    $lines = netsh wlan show interfaces 2>$null
    foreach ($ln in $lines) {
        if ($ln -match '^\s*SSID\s*:\s*(\S.*)$') {
            $ssid = $Matches[1].Trim()
            break
        }
    }
} catch { }

$out = [pscustomobject]@{ battery = $bat; charging = $charging; ssid = $ssid }
Write-Output ($out | ConvertTo-Json -Compress)
