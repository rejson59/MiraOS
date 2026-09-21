# MiraOS — ukryj pasek zadań Windows (auto-hide przez SHAppBarMessage)
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MiraBar {
    [StructLayout(LayoutKind.Sequential)]
    public struct APPBARDATA { public int cbSize; public IntPtr hWnd; public uint uCallbackMessage; public uint uEdge; public RECT rc; public int lParam; }
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
    [DllImport("shell32.dll")] public static extern IntPtr SHAppBarMessage(int dwMessage, ref APPBARDATA pData);
    [DllImport("user32.dll")] public static extern IntPtr FindWindow(string cls, string win);
}
"@

$hWnd = [MiraBar]::FindWindow("Shell_TrayWnd", $null)
$data = New-Object MiraBar+APPBARDATA
$data.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($data)
if ($hWnd -ne [IntPtr]::Zero) { $data.hWnd = $hWnd }
# ABM_SETSTATE = 10, ABS_AUTOHIDE = 1
$data.lParam = 1
[MiraBar]::SHAppBarMessage(10, [ref]$data) | Out-Null
exit 0
