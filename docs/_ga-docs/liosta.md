---
layout: single
classes: wide
title: Liosta
---

## Gníomhartha

| Ainm | Cur síos | Sampla |
|----
| `fad` | Fad an liosta | `fad([1, 2, 3]) == 3` |

## Baill

### Luachanna

| Ainm | Cur síos | Sampla |
|----
| `fad` | Fad an liosta | `fad@[1, 2, 3] == 3` |

### Gníomhartha

| Ainm | Cur síos | Sampla |
|----
| `sortáil` | Sórtáil an liosta | `sórtáil@[3, 2, 1] == [1, 2, 3]` |
| `cuid` | Faigh liosta ón liosta ó shuíomh éigin go suíomh éigin eile | `cuid@[1, 2, 3](0, 2) == [1, 2]` |
| `nasc` | Cruthaigh téacs ón liosta, ag nascadh baill an liosta le luach éigin | `nasc@[1, 2, 3](',') == "1,2,3"` |
| `cóip` | Cruthaigh cóip den liosta | `cóip@[1, 2, 3]() == [1, 2, 3]` |
| `scrios` | Scrios ball den liosta ag suíomh éigin | `scrios@[1, 2, 3](0) == [2, 3]` |
| `scrios_cúl` | Scrios ball deireanach an liosta | `scrios_cúl@[1, 2, 3]() == [1, 2]` |
| `aimsigh` | Faigh an suíomh ina bhfuil ball den liosta (nó -1 mura bhfuil an ball ann) | `aimsigh@[1, 2, 3](2) == 1` |
