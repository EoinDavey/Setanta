---
layout: single
title: Actions (gníomh)
toc: true
---

In this tutorial, we were using the word `scríobh` to write things out on the console. We call `scríobh` and a lot of things like it a **gníomh**, which translates as "action".

For example, write this program into the editor:

```
ainm := ceist('Cad is ainm duit?')
scríobh('Dia duit ' + ainm)
```

Run that program, type your name into the console, and press the enter key.

![Your name here](/assets/images/teagaisc/teagaisc09.png)

This is the result:

![Dia duit Eoin](/assets/images/teagaisc/ainm.gif)

`ceist` is another example of an "*action*", You can use `ceist` to ask questions, and to save the answer in some variable.

## Creating our own actions

We can create our own *action*s, we do this when we want to do something in a few places in the program.

We create *action*s with the word `gníomh`

For example, we will make an *action* to write 'Dia duit' on the console like this:

```
gníomh diaDuit() {
    scríobh('Dia duit')
}
```

To use this *action*, we write `diaDuit()`. Try it out now!

![Dia duit](/assets/images/teagaisc/diaduit.gif)

We call the code between `{` and `}` the **body** of the *action*, in the `diaDuit` *action*, `scríobh('Dia duit')` is the body.

## Example

For example, say we want to draw this picture:

![Four circles](/assets/images/teagaisc/ceithreciorcal.png)

We should draw four pairs of circles.

To draw a single pair of circles, we could write code like this

```
dath@stáitse('dearg')
ciorcalLán@stáitse(100, 100, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(100, 100, 50)
```

But what would we write if we wanted to draw four pairs? We would have to write a very long program like this:

```
dath@stáitse('dearg')
ciorcalLán@stáitse(100, 100, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(100, 100, 50)

dath@stáitse('dearg')
ciorcalLán@stáitse(100, 300, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(100, 300, 50)

dath@stáitse('dearg')
ciorcalLán@stáitse(300, 100, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(300, 100, 50)

dath@stáitse('dearg')
ciorcalLán@stáitse(300, 300, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(300, 300, 50)

```

You would be writing the same thing again and again. However, we can create an *action* to draw a pair of circles, and then we will use that four times:

```
gníomh dháChiorcal(x, y) {
    dath@stáitse('dearg')
    ciorcalLán@stáitse(x, y, 100)
    dath@stáitse('glas')
    ciorcalLán@stáitse(x, y, 50)
}
dháChiorcal(100, 100)
dháChiorcal(100, 300)
dháChiorcal(300, 100)
dháChiorcal(300, 300)
```

![Four circles gif](/assets/images/teagaisc/ceithreciorcal.gif)

That's a lot less code! But what is happening in the *action*? At first we have to talk about arguments.

## Arguments

Look again at the program `scríobh('Dia duit')`. We give the value 'Dia duit' to `scríobh`, and it writes it out on the console. In this case, 'Dia duit' is an **argument**. Arguments are values that *action*s take to execute the body of the *action*.

We can use arguments with our own *action*s too. Say we want to create an *action* to write things three times. We can write something like this:

```
gníomh tríhuaire(x) {
    scríobh(x)
    scríobh(x)
    scríobh(x)
}

tríhuaire('Is aoibhinn liom Setanta')
```

Look at the result!

![Three times](/assets/images/teagaisc/trihuaire.gif)

Now look back at the *action* `dháChiorcal` that we created earlier.
It takes two arguments, specifically `x` and `y`.
The *action* takes the arguments and it puts the value in the variables `x` and `y` inside the body of the *action*.
Then the code inside the *action* is run, using the variables. It draws the pair of circles around the point (x, y).

[Now go the next tutorial: Results](/english/06-torthai)
