---
layout: single
classes: wide
title: An stáitse
---

_**Ar fáil ar try-setanta.ie amháin**_

## Luachanna

| Ainm | Cur síos | Sampla |
|----
| `fad_x` | Fad an stáitse sa treo x | `fad_x@stáitse` |
| `fad_y` | Fad an stáitse sa treo y | `fad_y@stáitse` |

## Gníomhartha

| Ainm | Cur síos | Sampla |
|----
| `dath` | Athraigh dath an phinn | `dath@stáitse('dearg')` |
| `lthd` | Athraigh leithead an phinn | `lthd@stáitse(20)` |
| `dron` | Tarraing dronuilleog  | `dron@stáitse(suíomh_x, suíomh_y, leithead, airde)` |
| `líne` | Tarraing líne  | `líne@stáitse(x_1, y_1, x_2, y_2)` |
| `ciorcal` | Tarraing ciorcal | `ciorcal@stáitse(x, y, ga)` |
| `ciorcal_lán` | Tarraing ciorcal lán | `ciorcal_lán@stáitse(x, y, ga)` |
| `cruth` | Tarraing cruth ó liosta pointí | `cruth@stáitse([[0, 0], [0, 100], [100, 0], [100, 100]])` |
| `cruth_lán` | Tarraing cruth lán ó liosta pointí | `cruth_lán@stáitse([[0, 0], [0, 100], [100, 0], [100, 100]])` |
| `píosa_ciorcal` | Tarraing píosa ciorcal (stua) | `píosa_ciorcal@stáitse(x, y, ga, uillinn_tosaigh, uillinn_deiridh, deisil)` |
| `píosa_ciorcal_lán` | Tarraing píosa ciorcal (stua) lán | `píosa_ciorcal_lán@stáitse(x, y, ga, uillinn_tosaigh, uillinn_deiridh, deisil)` |
| `glan_dron` | Glan dronuilleog | `glan_dron@stáitse(x_1, x_2, leithead, airde)` |
| `glan` | Glan an stáitse iomlán | `glan@stáitse()` |
| `méarchlár` | Roghnaigh gníomh le húsáid le ionchur an mhéarchláir  | `méarchlár@stáitse(gníomh (k) { scríobh(k) })` |
| `méarchlár_suas` | Roghnaigh gníomh le húsáid le ionchur an mhéarchláir (eochair suas) | `méarchlár_suas@stáitse(gníomh (k) { scríobh(k) })` |
| `luch` | Roghnaigh gníomh le húsáid le ionchur na luiche (luch síos) | `luch@stáitse(gníomh (x, y) { scríobh("luch-síos @", x, y) })` |
| `luch_suas` | Roghnaigh gníomh le húsáid le ionchur na luiche (luch suas) | `luch_suas@stáitse(gníomh (x, y) { scríobh("luch-suas @", x, y) })` |
| `luch_bog` | Roghnaigh gníomh le húsáid le ionchur na luiche (luch bog) | `luch_bog@stáitse(gníomh (x, y) { scríobh("luch-bog @", x, y) })` |
