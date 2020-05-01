---
layout: single
classes: wide
title: The Stage
---

_**Only available on try-setanta.ie**_

## Values

| Name | Description | Example |
|----
| `fadX` | Length of the stage in the x direction| `fadX@stáitse` |
| `fadY` | Length of the stage in the y direction | `fadY@stáitse` |

## Actions

| Name | Description | Example |
|----
| `dath` | Change the colour of the pen | `dath@stáitse('dearg')` |
| `lthd` | Change the width of the pen | `lthd@stáitse(20)` |
| `dron` | Draw a rectangle  | `dron@stáitse(suíomh_x, suíomh_y, leithead, airde)` |
| `líne` | Draw a line  | `líne@stáitse(x_1, y_1, x_2, y_2)` |
| `ciorcal` | Draw a circle | `ciorcal@stáitse(x, y, ga)` |
| `ciorcalLán` | Draw a filled circle | `ciorcalLán@stáitse(x, y, ga)` |
| `cruth` | Draw a shape from a list of points | `cruth@stáitse([[0, 0], [0, 100], [100, 0], [100, 100]])` |
| `cruthLán` | Draw a filled shape from a list of points | `cruthLán@stáitse([[0, 0], [0, 100], [100, 0], [100, 100]])` |
| `píosaCiorcal` | Draw a piece of a circle (arc) | `píosaCiorcal@stáitse(x, y, ga, uillinn_tosaigh, uillinn_deiridh, deisil)` |
| `píosaCiorcalLán` | Draw a filled piece of a circle (arc) | `píosaCiorcalLán@stáitse(x, y, ga, uillinn_tosaigh, uillinn_deiridh, deisil)` |
| `glanDron` | Clear a rectangle | `glanDron@stáitse(x_1, x_2, leithead, airde)` |
| `glan` | Clear the whole stage | `glan@stáitse()` |
