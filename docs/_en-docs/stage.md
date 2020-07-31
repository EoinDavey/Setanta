---
layout: single
classes: wide
title: The Stage
---

_**Only available on try-setanta.ie**_

## Values

| Name | Description | Example |
|----
| `fad_x` | Length of the stage in the x direction| `fad_x@stáitse` |
| `fad_y` | Length of the stage in the y direction | `fad_y@stáitse` |

## Actions

| Name | Description | Example |
|----
| `dath` | Change the colour of the pen | `dath@stáitse('dearg')` |
| `lthd` | Change the width of the pen | `lthd@stáitse(20)` |
| `dron` | Draw a rectangle  | `dron@stáitse(suíomh_x, suíomh_y, leithead, airde)` |
| `líne` | Draw a line  | `líne@stáitse(x_1, y_1, x_2, y_2)` |
| `ciorcal` | Draw a circle | `ciorcal@stáitse(x, y, ga)` |
| `ciorcal_lán` | Draw a filled circle | `ciorcal_lán@stáitse(x, y, ga)` |
| `cruth` | Draw a shape from a list of points | `cruth@stáitse([[0, 0], [0, 100], [100, 0], [100, 100]])` |
| `cruth_lán` | Draw a filled shape from a list of points | `cruth_lán@stáitse([[0, 0], [0, 100], [100, 0], [100, 100]])` |
| `píosa_ciorcal` | Draw a piece of a circle (arc) | `píosa_ciorcal@stáitse(x, y, ga, uillinn_tosaigh, uillinn_deiridh, deisil)` |
| `píosa_ciorcal_lán` | Draw a filled piece of a circle (arc) | `píosa_ciorcal_lán@stáitse(x, y, ga, uillinn_tosaigh, uillinn_deiridh, deisil)` |
| `glan_dron` | Clear a rectangle | `glan_dron@stáitse(x_1, x_2, leithead, airde)` |
| `glan` | Clear the whole stage | `glan@stáitse()` |
