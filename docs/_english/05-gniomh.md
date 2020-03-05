---
layout: single
title: Gníomhs
toc: true
---

In this tutorial, we were using the word `scríobh` to write things out on the console. We call `scríobh` and a lot of things like it a *gníomh*, which translates as "action".

For example, write this program into the editor:

```
ainm := ceist('Cad is ainm duit?')
scríobh('Dia duit ' + ainm)
```

Run that program, type your name into the console, and press the enter key.

![Scríobh d'ainm](/assets/images/teagaisc/teagaisc07.png)

This is the result:

![Dia duit Eoin](/assets/images/teagaisc/ainm.gif)

`ceist` is another example of a "gníomh", You can use `ceist` to ask questions, and to save the answer in some variable.

## Creating our own gníomhs

We can create our own gníomhs, we do this when we want to do something in a few places in the program.

For example, say you want to sum up every number between 1 and 100. You would write something like this:

```
suim := 0
le i idir (1, 101)
	suim = suim + i
scríobh(suim)
```

But what would you write if you wanted to do that with ever number between 1 & 200, 1 & 300, and 1 & 400. You would have a very long program like this:

```
suim := 0
le i idir (1, 101)
	suim = suim + i
scríobh(suim)

suim = 0
le i idir (1, 201)
	suim = suim + i
scríobh(suim)

suim = 0
le i idir (1, 301)
	suim = suim + i
scríobh(suim)

suim = 0
le i idir (1, 401)
	suim = suim + i
scríobh(suim)
```

You would be writing the same thing again and again. However, we can create a gníomh with the word `gníomh`. Look at this example:

```
gníomh diaDuit() {
    scríobh('Dia duit')
}

diaDuit()
```

`diaDuit` is a gníomh, when you use `diaDuit` with `diaDuit()`, it writes "Dia duit" out on the console. Try it out now!

Going back the example we were discussing earlier, we were talking about adding the numbers between 1 and 100, 200, 300 and 400. Now we can make use of a gníomh.

```
gníomh suimighGoN(n) {
    suim := 0
    le i idir (1, n + 1)
        suim = suim + i
    scríobh(suim)
}
suimighGoN(100)
suimighGoN(200)
suimighGoN(300)
suimighGoN(400)
```

That's a lot less code! But what's happening in the gníomh? We have to talk about arguments.

## Arguments

Look again at the program `scríobh('Dia duit')`. We give the value "Dia duit" to `scríobh`, and it writes it out on the console. In this case, 'Dia duit' is an **argument**. Arguments are values that gníomhs take to do the action.

Now look back at the gníomh `suimighGoN` that we created earlier. `suimighGoN` has one argument, specifically the number `n`.
The gníomh takes the argument and it puts the value in the variable `n` inside the gníomh. Then it runs the code inside the gníomh.

We can use more than one argument. Look at this code:

```
gníomh scríobhIsMó(a, b) {
    má b > a
        scríobh(b)
    nó
        scríobh(a)
}
```

`scríobhIsMó` takes 2 arguments `a` and `b`, and it writes out the biggest one. For example `scríobhIsMó(3, 5)` writes out 5 on the console.

Try to create a gníomh to write out the smallest number

[Now go to the next tutorial: Results](/english/06-results)
