# Changelog

## 0.8.0 - 2020/07/22

### Added

- Add `fan` action

## 0.7.0 - 2020/07/22

### Fixes

- lodash security patch

### Added

- Added `slánuimh_rand` action for a random integer in a range. Replaces `randUimh` which is now
  deprecated.
  - NOTE: `slánuimh_rand` is inclusive of the end of the range, `randUimh` was not.

## 0.6.2 - 2020/07/03

- Updated to tsPEG v1.3.2 to fix Safari/iOS/WebKit issues

## 0.6.1 - 2020/07/03

### Fixes

- Fixed `cuid` action not working as intended.

## 0.6.0 - 2020/06/11

### Added
- Add `stop` action

### Fixes
- Large improvements to stopping the interpreter.
- Interpreter now stops correctly even if asked to stop while waiting
  on input or sleeping.

## 0.5.0 - 2020/06/10

### Added
- Grammar corrections.
- Fix grammar issue with grouping whitespace.
- Add syntax error formatting information, big improvement over previous method
  of just dumping tsPEG output to the user.

## 0.4.1 - 2020/06/08

### Added
- `--help` and `--cabhair` CLI flags.
- Added simple usage message.
- Add `codladh` function.
- Documentation updates.
- Negative sqrt (`fréamh`) error catch.
- Various grammar fixes etc.

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
