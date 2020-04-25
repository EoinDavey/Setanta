# Changelog

## 0.4.0 - 2020/04/25

### Added

- More maths functions support (tan, acos, asin, atan, dearbh, eas, cmhcht)
- More location tracking for errors
- Digits are now allowed in identifiers: `x2 := 3`
- Double quote string literals added: `"Setanta"`.
- Add member actions to text values: `go_liosta@'luan' == ['l', 'u', 'a', 'n']`
- Add member actions to lists (sortáil, cuid, fad, nasc): `sortáil@[3, 1, 2] == [1, 2, 3]`
- Add support for anonymous actions (lambda expressions): `gníomh(a,b) { toradh a + b }`
- Negative indices are support in array lookups:

### Breaking Changes

- Changed references to "litreacha" to "téacs", `go_lit` is now `go_téacs`
- Move athchuir, roinn, cuid from the global scope into member actions of
  text and list values
