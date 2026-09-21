/**
 * MiraOS build — minimalne nagłówki z Windows SDK, których brak w mingw-w64,
 * wymagane przez nagłówki WebView2 (wygenerowane przez MIDL).
 */
#ifndef __EventToken_h__
#define __EventToken_h__

typedef struct EventToken
{
    unsigned __int64 value;
} EventToken;

typedef struct EventRegistrationToken
{
    __int64 value;
} EventRegistrationToken;

#endif /* __EventToken_h__ */
