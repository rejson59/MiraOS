/* ============================================================
 * MiraOS build — shims CRT dla statycznej libki WebView2 (MSVC).
 *
 * 1) __guard_dispatch_icall_dummy — odpowiednik guard_dispatch.S
 *    z mingw-w64 (zig's libmingw32 odwołuje się do tego symbolu,
 *    a defincja jest w osobnym pliku asemblerowym, którego brak):
 *    gdy CFGuard nieaktywny, wykonaj bezpośredni skok do celu (%rax).
 *
 * 2) Operatory C++ z manglingiem MSVC (??_U/??_V/??2/??3) —
 *    WebView2LoaderStatic.lib jest zbudowana MSVC i wymaga
 *    symboli operatorów new/delete w tym samym obrazie.
 * ============================================================ */

__asm__(
    ".text\n"
    ".align 16\n"
    ".globl __guard_dispatch_icall_dummy\n"
    "__guard_dispatch_icall_dummy:\n"
    "    jmp *%rax\n"
);

/* std::nothrow (MSVC-mangled) — pusty obiekt, liczy się adres */
__attribute__((used)) extern const char __msvc_std_nothrow[1]
    __asm__("?nothrow@std@@3Unothrow_t@1@B");
__attribute__((used)) extern const char __msvc_std_nothrow[1] = {0};

extern "C" {

void *__attribute__((used)) __msvc_op_new_array(unsigned long long n)
    __asm__("??_U@YAPEAX_K@Z");
void *__attribute__((used)) __msvc_op_new_array(unsigned long long n) {
    return malloc(n);
}

void __attribute__((used)) __msvc_op_delete_array(void *p)
    __asm__("??_V@YAXPEAX@Z");
void __attribute__((used)) __msvc_op_delete_array(void *p) {
    free(p);
}

void __attribute__((used)) __msvc_op_delete_array_sized(void *p, unsigned long long)
    __asm__("??_V@YAXPEAX_K@Z");
void __attribute__((used)) __msvc_op_delete_array_sized(void *p, unsigned long long) {
    free(p);
}

void *__attribute__((used)) __msvc_op_new(unsigned long long n)
    __asm__("??2@YAPEAX_K@Z");
void *__attribute__((used)) __msvc_op_new(unsigned long long n) {
    return malloc(n);
}

void __attribute__((used)) __msvc_op_delete(void *p)
    __asm__("??3@YAXPEAX@Z");
void __attribute__((used)) __msvc_op_delete(void *p) {
    free(p);
}

void __attribute__((used)) __msvc_op_delete_sized(void *p, unsigned long long)
    __asm__("??3@YAXPEAX_K@Z");
void __attribute__((used)) __msvc_op_delete_sized(void *p, unsigned long long) {
    free(p);
}


void *__attribute__((used)) __msvc_op_new_nothrow(unsigned long long n, const void *)
    __asm__("??2@YAPEAX_KAEBUnothrow_t@std@@@Z");
void *__attribute__((used)) __msvc_op_new_nothrow(unsigned long long n, const void *) {
    return malloc(n);
}

void *__attribute__((used)) __msvc_op_new_array_nothrow(unsigned long long n, const void *)
    __asm__("??_U@YAPEAX_KAEBUnothrow_t@std@@@Z");
void *__attribute__((used)) __msvc_op_new_array_nothrow(unsigned long long n, const void *) {
    return malloc(n);
}

void __attribute__((used)) __msvc_op_delete_nothrow(void *p, const void *)
    __asm__("??3@YAXPEAXAEBUnothrow_t@std@@@Z");
void __attribute__((used)) __msvc_op_delete_nothrow(void *p, const void *) {
    free(p);
}

} /* extern "C" */

/* ---------- Wczytywane dynamicznie API (brak import libs w zig/mingw) ---------- */
#include <windows.h>

extern "C" {

/* powrprof.dll — używane przez hwinfo (monitoring) */
long __stdcall CallNtPowerInformation(int infoLevel, void *inputBuffer, unsigned long inputBufferSize,
                                      void *outputBuffer, unsigned long outputBufferSize) {
    typedef long(__stdcall * Fn)(int, void *, unsigned long, void *, unsigned long);
    static Fn fn = (Fn)(void *)GetProcAddress(GetModuleHandleW(L"powrprof.dll"), "CallNtPowerInformation");
    return fn(infoLevel, inputBuffer, inputBufferSize, outputBuffer, outputBufferSize);
}

/* dxgi.dll — używane przez hwinfo (GPU) */
long __stdcall CreateDXGIFactory1(const void *riid, void **factory) {
    typedef long(__stdcall * Fn)(const void *, void **);
    static Fn fn = (Fn)(void *)GetProcAddress(GetModuleHandleW(L"dxgi.dll"), "CreateDXGIFactory1");
    if (!fn) return (long)0x80004005L; /* E_FAIL */
    return fn(riid, factory);
}

/* ---------- /GS stack cookie (MSVC) ---------- */
#if defined(_WIN64)
typedef unsigned long long sec_cookie_t;
#else
typedef unsigned long sec_cookie_t;
#endif
extern "C" sec_cookie_t __security_cookie = 0x0002B992DDFA2329ULL;

__attribute__((constructor)) static void __mira_init_security_cookie(void) {
    LARGE_INTEGER t;
    QueryPerformanceCounter(&t);
    __security_cookie ^= (sec_cookie_t)t.QuadPart ^ (sec_cookie_t)(uintptr_t)&__security_cookie;
    __security_cookie &= 0x0000FFFFFFFFFFFFULL;
    if (__security_cookie == 0x0002B992DDFA2329ULL) __security_cookie += 1;
}

void __security_check_cookie(sec_cookie_t cookie) {
    if (cookie != __security_cookie) {
        TerminateProcess(GetCurrentProcess(), (UINT)0xC0000409); /* STATUS_STACK_BUFFER_OVERRUN */
    }
}

/* ---------- Magic statics (MSVC thread-safe init, wg _initstd.cpp) ---------- */
#include <limits.h>

static SRWLOCK g_mira_tss_srw = SRWLOCK_INIT;
static CONDITION_VARIABLE g_mira_tss_cv = CONDITION_VARIABLE_INIT;

static int const mira_uninitialized = 0;
static int const mira_being_initialized = -1;
static int const mira_epoch_start = INT_MIN;

extern "C" int _Init_global_epoch = mira_epoch_start;
extern "C" __thread int _Init_thread_epoch = mira_epoch_start;

extern "C" void __cdecl _Init_thread_lock(void) { AcquireSRWLockExclusive(&g_mira_tss_srw); }
extern "C" void __cdecl _Init_thread_unlock(void) { ReleaseSRWLockExclusive(&g_mira_tss_srw); }
extern "C" void __cdecl _Init_thread_wait_v2(void) { SleepConditionVariableSRW(&g_mira_tss_cv, &g_mira_tss_srw, INFINITE, 0); }
extern "C" void __cdecl _Init_thread_notify(void) { WakeAllConditionVariable(&g_mira_tss_cv); }

extern "C" void __cdecl _Init_thread_header(int *const ptrOnce) {
    _Init_thread_lock();
    if (*ptrOnce == mira_uninitialized) {
        *ptrOnce = mira_being_initialized;
    } else {
        while (*ptrOnce == mira_being_initialized) {
            _Init_thread_wait_v2();
            if (*ptrOnce == mira_uninitialized) {
                *ptrOnce = mira_being_initialized;
                _Init_thread_unlock();
                return;
            }
        }
        _Init_thread_epoch = _Init_global_epoch;
    }
    _Init_thread_unlock();
}

extern "C" void __cdecl _Init_thread_abort(int *const ptrOnce) {
    _Init_thread_lock();
    *ptrOnce = mira_uninitialized;
    _Init_thread_unlock();
    _Init_thread_notify();
}

extern "C" void __cdecl _Init_thread_footer(int *const ptrOnce) {
    _Init_thread_lock();
    ++_Init_global_epoch;
    *ptrOnce = _Init_global_epoch;
    _Init_thread_epoch = _Init_global_epoch;
    _Init_thread_unlock();
    _Init_thread_notify();
}

} /* extern "C" */