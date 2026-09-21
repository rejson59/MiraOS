# MiraOS — natychmiastowe ustawienie tapety (SystemParametersInfo)
param([string]$Path = "")

if ($Path -eq "" -or -not (Test-Path $Path)) { exit 1 }

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MiraWallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@

# SPI_SETDESKWALLPAPER = 20, SPIF_UPDATEINIFILE | SPIF_SENDWININICHANGE = 3
[MiraWallpaper]::SystemParametersInfo(20, 0, $Path, 3) | Out-Null
exit 0
