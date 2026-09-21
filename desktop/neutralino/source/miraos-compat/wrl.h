/* ============================================================
 * MiraOS build — shim <wrl.h> dla mingw-w64 (zig).
 * Dołącza oryginalne wrl.h (ComPtr) i dodaje brakujący
 * Microsoft::WRL::Callback — używany w webview.h wyłącznie dla
 * ICoreWebView2NewWindowRequestedEventHandler.
 * ============================================================ */
#ifndef __MIRAOS_WRL_SHIM_H__
#define __MIRAOS_WRL_SHIM_H__

#include_next <wrl.h>
#include <wrl/client.h>

#include <functional>
#include <type_traits>

namespace Microsoft {
namespace WRL {

/* Wyjątkowa obsługa: ICoreWebView2NewWindowRequestedEventHandler */
class MiraCallbackNewWindow final : public ICoreWebView2NewWindowRequestedEventHandler {
public:
  typedef std::function<HRESULT(ICoreWebView2 *, ICoreWebView2NewWindowRequestedEventArgs *)> Fn;
  explicit MiraCallbackNewWindow(Fn fn) : fn_(std::move(fn)) {}

  HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void **ppv) override {
    if (!ppv) return E_POINTER;
    if (riid == IID_IUnknown || riid == IID_ICoreWebView2NewWindowRequestedEventHandler) {
      *ppv = static_cast<ICoreWebView2NewWindowRequestedEventHandler *>(this);
      AddRef();
      return S_OK;
    }
    *ppv = nullptr;
    return E_NOINTERFACE;
  }
  ULONG STDMETHODCALLTYPE AddRef() override { return ++ref_; }
  ULONG STDMETHODCALLTYPE Release() override {
    ULONG r = --ref_;
    if (!r) delete this;
    return r;
  }
  HRESULT STDMETHODCALLTYPE Invoke(ICoreWebView2 *sender,
                                   ICoreWebView2NewWindowRequestedEventArgs *args) override {
    return fn_(sender, args);
  }

private:
  Fn fn_;
  ULONG ref_ = 1;
};

template <typename Itf, typename Fx>
inline ComPtr<ICoreWebView2NewWindowRequestedEventHandler> Callback(Fx &&fx) {
  static_assert(std::is_same<Itf, ICoreWebView2NewWindowRequestedEventHandler>::value,
                "MiraOS WRL shim: wspierane jest tylko Callback<ICoreWebView2NewWindowRequestedEventHandler>");
  ComPtr<ICoreWebView2NewWindowRequestedEventHandler> ptr(
      new MiraCallbackNewWindow(MiraCallbackNewWindow::Fn(std::forward<Fx>(fx))));
  return ptr;
}

} // namespace WRL
} // namespace Microsoft

#endif /* __MIRAOS_WRL_SHIM_H__ */
