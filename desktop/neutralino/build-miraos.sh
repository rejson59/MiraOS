#!/bin/bash
# ============================================================
#  Buduje MiraOS.exe (Windows x64) ze źródeł Neutralino v6.9.0
#  Kompilator: Zig (clang + lld, target x86_64-windows-gnu)
#  Etapy: (1) lista plików, (2) kompilacja równolega do .o,
#         (3) konsolidacja + zasoby .res
# ============================================================
set -e
cd "$(dirname "$0")"

SRC=source
OUT=MiraOS-raw.exe
OBJDIR=build/obj
COMMIT="2cec764ac5e3ccc5b1b44d046d6e6d6c85c3099e"
mkdir -p "$OBJDIR"

# ---------- (1) lista plików ----------
SRCLIST=$(mktemp)
{
  ls $SRC/*.cpp
  find $SRC/auth $SRC/server $SRC/api -name '*.cpp'
  echo $SRC/lib/tinyprocess/process.cpp
  echo $SRC/lib/easylogging/easylogging++.cc
  echo $SRC/lib/platformfolders/platform_folders.cpp
  echo $SRC/lib/clip/clip.cpp
  echo $SRC/lib/clip/image.cpp
  find $SRC/lib/infoware/src -name '*.cpp'
  find $SRC/lib/efsw/src/efsw -name '*.cpp'
  find $SRC/lib/hwinfo/src -name '*.cpp'
  echo $SRC/lib/trashcan/trashcan.c
  find $SRC/lib/mbedtls/library -name '*.c'
  # WIN32
  echo $SRC/lib/tinyprocess/process_win.cpp
  echo $SRC/lib/clip/clip_win.cpp
  find $SRC/lib/efsw/src/efsw/platform/win -name '*.cpp'
  echo $SRC/lib/hwinfo/src/windows/disk.cpp
  echo $SRC/lib/hwinfo/src/windows/monitoring/disk.cpp
  echo $SRC/miraos-compat/wbemuuid.cpp
  echo $SRC/miraos-compat/msvc-crt-shim.cpp
} | awk '!seen[$0]++' > "$SRCLIST"

N=$(wc -l < "$SRCLIST")
echo "Plików źródłowych: $N"

# ---------- (2) kompilacja równolega ----------
cat > build/compile-one.sh <<'COMPEOF'
#!/bin/bash
f="$1"
SRC=source
OBJDIR=build/obj
base=$(echo "$f" | sed "s|^$SRC/||" | tr '/' '_')
o="$OBJDIR/${base%.*}.o"
extra="-std=c++17"
case "$f" in
  *.c) extra="-std=c11" ;;
  *)   extra="-std=c++17 -include $SRC/miraos-compat/chartraits-uint32.h" ;;
esac
if ! python3 -m ziglang c++ \
  -Os \
  -target x86_64-windows-gnu \
  -DNEU_VERSION='"6.9.0"' \
  -DNEU_COMMIT='"2cec764ac5e3ccc5b1b44d046d6e6d6c85c3099e"' \
  -DELPP_NO_DEFAULT_LOG_FILE=1 \
  -DASIO_STANDALONE \
  -DINFOWARE_VERSION='"0.6.0"' \
  -DINFOWARE_USE_X11 \
  -DCLIP_ENABLE_IMAGE \
  -DCPPHTTPLIB_MBEDTLS_SUPPORT \
  -D_WEBSOCKETPP_CPP11_STL_ \
  -D_WEBSOCKETPP_CPP11_THREAD_ \
  -D_HAS_STD_BYTE=0 \
  -DHWINFO_EXPORTS \
  -DTRAY_WINAPI=1 \
  -DNOMINMAX -DUNICODE -D_UNICODE \
  -I$SRC -I$SRC/lib -I$SRC/lib/asio/include -I$SRC/lib/infoware/include \
  -I$SRC/lib/efsw/include -I$SRC/lib/efsw/src -I$SRC/lib/hwinfo/include \
  -I$SRC/lib/mbedtls/include -I$SRC/lib/webview/windows -I$SRC/miraos-compat \
  $extra -c "$f" -o "$o" 2>>build/compile-errors.log; then
  echo "BLAD: $f"
fi
COMPEOF
chmod +x build/compile-one.sh
: > build/compile-errors.log

xargs -P "$(nproc)" -n 1 build/compile-one.sh < "$SRCLIST"

if grep -q "BLAD:" build/compile-errors.log; then
  echo "=== Kompilacja nieudana: ==="
  grep "BLAD:" build/compile-errors.log | head
  exit 1
fi
echo "Skompilowano $(find $OBJDIR -name '*.o' | wc -l) obiektów."

# ---------- (3) konsolidacja ----------
OBJECTS=$(find "$OBJDIR" -name '*.o' | tr '\n' ' ')

python3 -m ziglang c++ \
  -target x86_64-windows-gnu \
  -municode -mwindows \
  -o "$OUT" \
  "$SRC/resources/mira.res" \
  $OBJECTS \
  "$SRC/lib/webview/windows/WebView2LoaderStatic.lib" \
  -Lbuild/shimlibs -lgdi32 -lversion -lole32 -loleaut32 -lntdll -ldwmapi \
  -liphlpapi -lws2_32 -ladvapi32 -lbcrypt -lmswsock -lshlwapi -lcrypt32 -lgdiplus -lpowrprof -ldxgi 2>/dev/null \
  -ffunction-sections -fdata-sections \
  -s -static

python3 - <<'PYPEOF'
import pefile
pe = pefile.PE("MiraOS-raw.exe")
pe.OPTIONAL_HEADER.Subsystem = 2  # IMAGE_SUBSYSTEM_WINDOWS_GUI
pe.write("MiraOS-raw.exe")
print("Subsystem ustawiony na GUI (2)")
PYPEOF

echo "OK: $OUT ($(stat -c%s $OUT) bajtów)"
