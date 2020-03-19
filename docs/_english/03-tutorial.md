---
layout: single
title: Setanta 101
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

## Lists

Create lists in Setanta with `[` and `]`, for example:

```
[1, 2, 3]
['An Dagda', 'Lugh', 'Mór-Ríoghain', 'Nuada']
```

Lists are very powerful. Every position in a list has a number. You can get an element of a list if you have the number of the position of the element. We give the number 0 to the first element of the list, the number 1 to the second element, the number 2 to the third etc.

If you have the number of the position, you can use `[` and `]` again to get the member. For example:

```
['Dia', 'Duit'][0] == 'Dia'
['Dia', 'Duit'][1] == 'Duit'

[100, 200, 300, 400][2] == 300
```

## Comments

If you write the symbol `>--` in your program, Anything you write after it on the same line is a comment, and is not part of the program. For example

```
scríobh('Hello') >-- I can write anything here!
>-- Or here as well
```

Comments are very useful because they allow us to write notes in our programs.

## Variables

Setanta can remember values. For example, put this code in the editor and run it:

```
x := 10
scríobh(x * 2)
```

It writes out `20` in the console.

In this program `x` is a **variable**. We can use variables everywhere that we use numbers and litreacha.

We create new variables with `:=`.

We can change the value in the variable `x` with `=`.

```
x := 10 >-- New variable with value 10
x = x + 10 >-- Now x == 20
```

Now `x` is equal to 20. What does this program write?

```
x := 10
y := 2 * x >-- Create a new variable 'y' with value 20
x = y + x >-- Change the variable 'x' to 'x + y' = 10 + 20 = 30
scríobh(x)
```

We can use variables to draw things on the stage too. Put the following code in the editor:

```
mo_dhath := 'dearg' >-- Change this variable to change the colour of the circles.

dath@stáitse(mo_dhath)

>-- Create the variables 'x', 'y' and 'ga'
x := 100
y := 100
ga := 40

ciorcal@stáitse(x, y, ga) >-- Draw the first circle

x = x + 100 >-- Change 'x' to 200
y = y + 100 >-- Change 'y' to 200
ga = ga * 2 >-- Change 'ga' to 80

ciorcal@stáitse(x, y, ga) >-- Draw the second circle
```

![Two circles](/assets/images/teagaisc/dhaciorcal.gif)

## Next
You learned a lot of new things, go to [the next page](/english/04-ma-loops) to learn about `má` and loops.
