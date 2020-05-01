---
layout: single
classes: wide
title: Lists
---

## Actions

| Name | Description | Example |
|----
| `fad` | Length of the list | `fad([1, 2, 3]) == 3` |

## Members

### Values

| Name | Description | Example |
|----
| `fad` | Length of the list | `fad@[1, 2, 3] == 3` |

### Actions

| Name | Description | Example |
|----
| `sortáil` | Sort the list | `sórtáil@[3, 2, 1] == [1, 2, 3]` |
| `cuid` | Get a list from the list from some position to some other position | `cuid@[1, 2, 3](0, 2) == [1, 2]` |
| `nasc` | Create text from the list, joining members of the list with some value | `nasc@[1, 2, 3](',') == "1,2,3"` |
