/* MiraOS build — shim: mingw-w64 (zig) nie ma ShlObj_core.h z Windows SDK.
   shlobj.h w mingw zawiera te deklaracje. */
#ifndef __SHLOBJ_CORE_SHIM_H__
#define __SHLOBJ_CORE_SHIM_H__
#include <shlobj.h>
#include <shobjidl.h>
#endif
