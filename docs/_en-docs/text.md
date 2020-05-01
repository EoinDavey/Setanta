---
layout: single
classes: wide
title: Text
---

## Actions

| Name | Description | Example |
|----
| `go_téacs` | Change some value to text | `go_téacs([1, 2, 3]) == "[1, 2, 3]"` |
| `fad` | Length of the text | `fad("123") == 3` |


## Members

### Values

| Name | Description | Example |
|----
| `fad` | Length of the text | `fad@"123" == 3` |

### Actions

| Name | Description | Example |
|----
| `athchuir` | Search the text for some value and create new text with the values replaced with some other value | `athchuir@"aaabbbccc"('c', 'd') == "aaabbbddd"` |
| `roinn` | Split the text at some value | `roinn@"1,2,3"(',') == ["1", "2", "3"]` |
| `cuid` | Get a piece of text from the text from some position to some other position | `cuid@"Dia duit"(4, 7) == "duit"` |
| `go_liosta` | Get a list of characters from the text | `go_liosta@"ainm"() == ['a', 'i', 'n', 'm']` |
