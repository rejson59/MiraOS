# MiraOS — pokaz pasek zadań Windows (zdejmuje auto-hide)
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MiraBar2 {
    [StructLayout(LayoutKind.Sequential)]
    public struct APPBARDATA { public int cbSize; public IntPtr hWnd; public uint uCallbackMessage; public uint uEdge; public RECT rc; public int lParam; }
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
    [DllImport("shell32.dll")] public static extern IntPtr SHAppBarMessage(int dwMessage, ref APPBARDATA pData);
    [DllImport("user32.dll")] public static extern IntPtr FindWindow(string cls, string win);
}
"@

$hWnd = [MiraBar2]::FindWindow("Shell_TrayWnd", $null)
$data = New-Object MiraBar2+APPBARDATA
$data.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($data)
if ($hWnd -ne [IntPtr]::Zero) { $data.hWnd = $hWnd }
# ABM_SETSTATE = 10, lParam = 0 -> normalny
$data.lParam = 0
[MiraBar2]::SHAppBarMessage(10, [ref]$data) | Out-Null
exit 0
