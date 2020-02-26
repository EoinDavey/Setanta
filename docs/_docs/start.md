---
layout: single
title: Start Here - English
toc: true
---

# How do I use Setanta?

To try out Setanta, you have two options.

- You can use Setanta on [try-setanta.ie](https://try-setanta.ie).
- You can download Setanta from the NPM with `npm i -g setanta`.

Now follow this simple tutorial.

# Tutorial

## Setanta program structure.

A Setanta program is a sequence of instructions, for example.

```
scríobh('Dia duit')
scríobh('Dia is Muire duit')
```

This program writes 'Dia duit', and then writes 'Dia is Muire duit'. Try this out in Setanta now! Setanta starts at the top of the program and follows the lines down to the bottom.

**If you don't know how to type `í`, you can use `scriobh`.**

## Maths

Setanta can do maths! Type `scríobh(2*3)` in and you get back `6`. Setanta has `+`, `-`, and `/` too. We can see if 2 things are equal with `==` and `!=`, for example it's true that `2*3 == 6`, and it's true that `2 * 4 != 6`. Use `(` and `)` to write complex terms like `2 * 3 + (4 - 5) == 7`.

## Variables

Setanta can remember values, for example

```
x := 10
scríobh(x * 2) >-- scríobhann sé seo 20
```

In this program `x` is a **variable**. We create new variables with `:=`.

We can change the value of `x` with `=`.

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

## Má ... nó ...

We saw how to make one instruction after another, but we can make choices! We use the word `má` to make a check, and then to make a choice with the result.

```
age := 14
má age >= 13 & age <= 19
    scríobh('You're a teenager')
nó
    scríobh('You're not a teenager')
```

This program checks if `age` is between 13 and 14. If it's true, it writes 'You're a teenager', if it's not it writes 'You're not a teenager'.

We can use this structure again and again, like this.

```
má name == 'Oisín'
    scríobh('Oisín, come with me to Tír na nÓg')
nó má name == 'Fionn'
    scríobh('Hello Fionn, is Oisín here?')
nó
    scríobh('I'm sorry, I don't know you')
```

Use `{` and `}` to creat a group of instructions.

```
má x == 6 {
    scríobh(x)
    scríobh(2 * x)
} nó {
    scríobh(x)
    scríobh(3 * x)
}
```

**You can use `ma` if you cannot type `á`.**

## Loops

We use loops when we need to do something again and again.

### Le .. idir ..

When we know how many times we need to do the thing, we can use this loop.

```
le i idir (0, 10)
    scríobh(i)
```

This program writes every number between 0 and 10, it doesn't write 10 because the loop stops before the last number.

This loop works in the other direction too.

```
le i idir (10, 0)
    scríobh(i)
```

This program writes `10, 9, 8 ... 1`.

You can put another number in the brackets to change the step size. For example:

```
le i idir (0, 10, 3)
    scríobh(i)
```

That writes `0, 3, 6, 9`.

### Nuair-a

There is a simpler loop available too, called `nuair-a`. Look at this for example:

```
x := 0
nuair-a x < 5 {
    scríobh(x)
    x = x + 1
}
```

We get `0, 1, 2, 3, 4`. At first the loop checks the term after `nuair-a`, if it's true it continues with the instructions in the loop, and it goes back to the start. When it's not true, it breaks out of the loop. In that example it goes through the loop 5 times, and then `x == 6`, specifically `x < 5` is not true, and with that the loop is finished.

### bris & chun-cinn

In those 2 loops, `le idir` and `nuair-a`, you can use the instructions `bris` and `chun-cinn`. `bris` does directly what it says it does, it breaks out of the loop. If Setanta follows this instruction, it stops the loop and continues on after it.

```
x := 0
nuair-a x < 100 {
    má x == 10
        bris
    scríobh(x)
}
```
This loop writes `0 1 2 3 4 5 6 7 8 9` and then `x == 10` and we break from the loop.

`chun-cinn` does something different. `chun-cinn` goes directly to the top of the loop, and it starts with next one. For example

```
le i idir (-10, 10) {
    má i < 0
        chun-cinn
    scríobh(i)
}
```

This loop writes `0 1 2 3 4 5 6 7 8 9` because for each `i < 0`, the instruction `chun-cinn` is followed and we start from the top with the next number.
