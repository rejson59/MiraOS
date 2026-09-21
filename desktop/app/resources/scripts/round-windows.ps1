# MiraOS — "szklane" okna dla calego systemu
# Wymusza zaokraglone narozniki (DWM) i mintowa obwodke na wszystkich oknach.
# Dziala w tle; nowe okna lapie w petli. Tylko biezaca sesja.
$ErrorActionPreference = 'SilentlyContinue'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MiraDWM {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lp);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
    [DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int val, int size);
    [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr hwnd, int attr, out int val, int size);
}
"@

# kolory (COLORREF = 0x00BBGGRR); mint MiraOS ~ #57C79B -> BB=9B GG=C7 RR=57
$borderColor = [Convert]::ToInt32('9BC757', 16)
$DWMWA_USE_HOSTBACKDROPBRUSH = 17
$DWMWA_CLOAKED = 14
$DWMWA_BORDER_COLOR = 34
$DWMWA_WINDOW_CORNER_PREFERENCE = 33
$prefRound = 2

# pilnuj pojedynczej instancji
$pidFile = Join-Path $env:APPDATA 'MiraOS\round.pid'
New-Item -ItemType Directory -Force -Path (Split-Path $pidFile) | Out-Null
Set-Content -Path $pidFile -Value $PID

$processed = @{}

while ($true) {
    $cb = [MiraDWM+EnumWindowsProc]{
        param($hWnd, $lp)

        if ($processed.ContainsKey($hWnd)) { return $true }
        if (-not [MiraDWM]::IsWindowVisible($hWnd)) { return $true }
        if ([MiraDWM]::GetWindowTextLength($hWnd) -le 0) { return $true }

        # pomin okna narzedziowe (tooltipy, menu kontekstowe)
        $exStyle = [MiraDWM]::GetWindowLong($hWnd, -20)
        if (($exStyle -band 0x80) -ne 0) { return $true }

        # pomin zakloakowane (ukryte okna UWP itp.)
        $cloaked = 0
        [MiraDWM]::DwmGetWindowAttribute($hWnd, $DWMWA_CLOAKED, [ref]$cloaked, 4) | Out-Null
        if ($cloaked -ne 0) { return $true }

        $v = $prefRound
        [MiraDWM]::DwmSetWindowAttribute($hWnd, $DWMWA_WINDOW_CORNER_PREFERENCE, [ref]$v, 4) | Out-Null
        $b = $borderColor
        [MiraDWM]::DwmSetWindowAttribute($hWnd, $DWMWA_BORDER_COLOR, [ref]$b, 4) | Out-Null

        $processed[$hWnd] = $true
        return $true
    }
    [MiraDWM]::EnumWindows($cb, [IntPtr]::Zero) | Out-Null
    Start-Sleep -Milliseconds 1500
}
