/* ============================================================
 * MiraOS build — kompatybilność efsw z libc++ (zig/clang).
 * efsw używa std::basic_string<Uint32>; libstdc++ ma generyczny
 * primary template char_traits, libc++ już nie — dostarczamy
 * minimalną, poprawną specjalizację.
 * ============================================================ */
#ifndef __MIRAOS_CHARTRAITS_UINT32_H__
#define __MIRAOS_CHARTRAITS_UINT32_H__

#include <cstddef>
#include <cstring>
#include <cwchar>
#include <string> // primary template char_traits musi być zadeklarowany przed specjalizacją

namespace std {

template <>
struct char_traits<unsigned int> {
  typedef unsigned int char_type;
  typedef unsigned int int_type;
  typedef std::streamoff off_type;
  typedef std::streampos pos_type;
  typedef std::mbstate_t state_type;

  static void assign(char_type &c1, const char_type &c2) noexcept { c1 = c2; }
  static bool eq(char_type c1, char_type c2) noexcept { return c1 == c2; }
  static bool lt(char_type c1, char_type c2) noexcept { return c1 < c2; }

  static int compare(const char_type *s1, const char_type *s2, size_t n) noexcept {
    for (size_t i = 0; i < n; ++i) {
      if (s1[i] < s2[i]) return -1;
      if (s2[i] < s1[i]) return 1;
    }
    return 0;
  }
  static size_t length(const char_type *s) noexcept {
    size_t i = 0;
    while (s[i] != char_type(0)) ++i;
    return i;
  }
  static const char_type *find(const char_type *s, size_t n, const char_type &a) noexcept {
    for (size_t i = 0; i < n; ++i)
      if (s[i] == a) return s + i;
    return nullptr;
  }
  static char_type *move(char_type *s1, const char_type *s2, size_t n) noexcept {
    if (n == 0) return s1;
    if (s1 < s2) {
      for (size_t i = 0; i < n; ++i) s1[i] = s2[i];
    } else if (s2 < s1) {
      for (size_t i = n; i > 0; --i) s1[i - 1] = s2[i - 1];
    }
    return s1;
  }
  static char_type *copy(char_type *s1, const char_type *s2, size_t n) noexcept {
    for (size_t i = 0; i < n; ++i) s1[i] = s2[i];
    return s1;
  }
  static char_type *assign(char_type *s, size_t n, char_type a) noexcept {
    for (size_t i = 0; i < n; ++i) s[i] = a;
    return s;
  }

  static constexpr int_type eof() noexcept { return int_type(-1); }
  static int_type to_int_type(char_type c) noexcept { return int_type(c); }
  static char_type to_char_type(int_type c) noexcept { return char_type(c); }
  static bool eq_int_type(int_type c1, int_type c2) noexcept { return c1 == c2; }
  static int_type not_eof(int_type c) noexcept { return (c == eof()) ? int_type(0) : c; }
};

} // namespace std

#endif /* __MIRAOS_CHARTRAITS_UINT32_H__ */
