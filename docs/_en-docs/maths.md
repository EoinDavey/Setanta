---
layout: single
classes: wide
title: Maths
---

## Actions

| Name | Description | Example |
|----
| `go_uimh` | Change text to a number | `go_uimh("123") == 123` |
| `uas` | Max value | `uas(2, 3) == 3` |
| `íos` | Min value | `íos(2, 3) == 2` |

## `mata`

### Values

| Name | Description | Example |
|----
| `pí` | Pi constant (3.1415...) | `pi@mata` |
| `e` | e constant (2.71828..) | `e@mata` |

### Actions

| Name | Description | Example |
|----
| `fréamh` | Square root | `fréamh@mata(4) == 2` |
| `cearn` | Square function (`x * x`)  |  `cearn@mata(2) == 4` |
| `dearbh` | Absolute value | `abs@mata(-2) == 2` |
| `eas` | Exponential (`e^x`) | `eas@mata(1) == e@mata` |
| `cmhcht` | Power (`x^y`) | `cmhcht@mata(2, 4) == 16` |
| `log` | Logarithm | `log@mata(2)` |
| `logb` | Logarithm in some base | `logb@mata(16, 2) == 4` |
| `sin`  | Sine                  | `sin@mata(pi@mata/2)` |
| `cos`  | Cosine             | `cos@mata(0)` |
| `tan`  | Tangent                 | `tan@mata(pi@mata)` |
| `asin` | Inverse sine      | `asin@mata(0)` |
| `acos` | Inverse cosine | `acos@mata(pi@mata)` |
| `atan` | Inverse tangent    | `atan@mata(0)` |
| `rand` | Random number from 0 to 1 | `rand@mata()` |
| `slánuimh_rand` | Random whole number (slánuimhir) in some range | `slánuimh_rand@mata(5, 10)` |
