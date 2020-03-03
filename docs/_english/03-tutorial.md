---
layout: single
title: Teagaisc
toc: true
---

## Maths

Setanta can do maths. Type `scríobh(2*3)` into the editor, click "Tosaigh", and look at the console. `6` will be written there.
![6](/assets/images/teagaisc/teagaisc06.png)

Look what this program writes.

```
scríobh(2 + 2)
scríobh(4 * (2 + 3))
scríobh(5 == 5)
scríobh(5 == 6)
scríobh(5 != 6)
```

This is in the console.


```
4
20
fíor
bréag
fíor
```

Specifically, notice that `==` and `!=` compare numbers (and other things).

## Letters (Litreacha)

You can write phrases too, we saw this earlier with the simple program:
```
scríobh('Dia duit')
```

We call these phrases "litreacha". You create *litreacha* with two `'`s. For example:
```
'Hello'
'I'm Eoin'
```

You can use `+` to join litreacha together.

```
scríobh('Hello' + ', ' + 'my name is Eoin')
```

This writes `Hello, My name is Eoin`.

## Variables

Setanta can remember values. For example, put this in the editor:

```
x := 10
scríobh(x * 2)
```

It writes out `20` in the console.

In this program `x` is a **variable**. We can use variables everywhere that we use numbers and litreacha. We create new variables with `:=`.

We can change the value in the variable `x` with `=`.

```
x := 10
x = x + 10
```

Now `x` is equal to 20. What does this program write?

```
x := 10
y := 2 * x
x = y + x
scríobh(x)
```

Take the following program and put your name in the variable `ainm`

```
ainm := 'd'ainm anseo'
scríobh('Dia duit ' + ainm)
```

## Next
You learned a lot of new things, go to [the next page](/english/04-ma-loops) to learn about `má` and loops.
