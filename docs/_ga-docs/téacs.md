---
layout: single
classes: wide
title: Téacs
---

## Gníomhartha

| Ainm | Cur síos | Sampla |
|----
| `go_téacs` | Athraigh luach éigin go téacs | `go_téacs([1, 2, 3]) == "[1, 2, 3]"` |
| `fad` | Fad an téacs | `fad("123") == 3` |


## Baill

### Luachanna

| Ainm | Cur síos | Sampla |
|----
| `fad` | Fad an téacs | `fad@"123" == 3` |

### Gníomhartha

| Ainm | Cur síos | Sampla |
|----
| `athchuir` | Cuardaigh an téacs ar thóir luachanna éigin agus cruthaigh téacs nua leis na luachanna athchurtha le luach eile | `athchuir@"aaabbbccc"('c', 'd') == "aaabbbddd"` |
| `roinn` | Roinn an téacs ag luachanna éigin | `roinn@"1,2,3"(',') == ["1", "2", "3"]` |
| `cuid` | Faigh píosa téacs ón téacs ó shuíomh éigin go suíomh éigin eile | `cuid@"Dia duit"(4, 7) == "duit"` |
| `go_liosta` | Faigh liosta litreacha ón téacs | `go_liosta@"ainm"() == ['a', 'i', 'n', 'm']` |
