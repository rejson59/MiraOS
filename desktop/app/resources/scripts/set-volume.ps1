# MiraOS — ustawienie glosnosci systemowej (bez admina, przez klawisze multimedialne)
param([int]$Percent = 50)
$ErrorActionPreference = 'SilentlyContinue'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MiraVol {
    [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);
}
"@

$VK_DOWN = 0xAD
$VK_UP   = 0xAF
$rel = 2      # KEYEVENTF_KEYUP
# przygasi do zera (50 krokow po 2%)
for ($i = 0; $i -lt 50; $i++) {
    [MiraVol]::keybd_event($VK_DOWN, 0, 0, [UIntPtr]::Zero)
    [MiraVol]::keybd_event($VK_DOWN, 0, $rel, [UIntPtr]::Zero)
}
# podnies do zadanej wartosci
$n = [Math]::Round([Math]::Max(0, [Math]::Min(100, $Percent)) / 2)
for ($i = 0; $i -lt $n; $i++) {
    [MiraVol]::keybd_event($VK_UP, 0, 0, [UIntPtr]::Zero)
    [MiraVol]::keybd_event($VK_UP, 0, $rel, [UIntPtr]::Zero)
}
exit 0
