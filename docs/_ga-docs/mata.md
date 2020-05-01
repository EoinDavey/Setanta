---
layout: single
classes: wide
title: Matamaitic
---

## Gníomhartha

| Ainm | Cur síos | Sampla |
|----
| `go_uimh` | Athraigh téacs go huimhir | `go_uimh("123") == 123` |
| `uas` | Uasmhéid | `uas(2, 3) == 3` |
| `íos` | Íosmhéid | `íos(2, 3) == 2` |

## `mata`

### Luachanna

| Ainm | Cur síos | Sampla |
|----
| `pí` | Tairiseach pí (3.1415...) | `pi@mata` |
| `e` | Tairiseach e (2.71828..) | `e@mata` |

### Gníomhartha

| Ainm | Cur síos | Sampla |
|----
| `fréamh` | Fréamh chearnach | `fréamh@mata(4) == 2` |
| `cearn` | Cearnóg (`x * x`)  |  `cearn@mata(2) == 4` |
| `dearbh` | Dearbhluach | `abs@mata(-2) == 2` |
| `eas` | Easpónantúil (`e^x`) | `eas@mata(1) == e@mata` |
| `cmhcht` | Cumhacht (`x^y`) | `cmhcht@mata(2, 4) == 16` |
| `log` | Logartam | `log@mata(2)` |
| `logb` | Logartam i mbun ar leith | `logb@mata(16, 2) == 4` |
| `sin`  | Síneas                  | `sin@mata(pi@mata/2)` |
| `cos`  | Comhshíneas             | `cos@mata(0)` |
| `tan`  | Tangant                 | `tan@mata(pi@mata)` |
| `asin` | Síneas inbhéartach      | `asin@mata(0)` |
| `acos` | Comhshíneas inbhéartach | `acos@mata(pi@mata)` |
| `atan` | Tangant inbhéartach    | `atan@mata(0)` |
| `rand` | Uimhir randamach idir 0 agus 1 | `rand@mata()` |
| `randUimh` | Slánuimhir randamach i raon éigin | `randUimh@mata(5, 10)` |
