---
layout: single
title: Starting with try-setanta.ie
toc: true
---

## try-setanta.ie

When you go to [try-setanta.ie](https://try-setanta.ie), you will see something like this.

![The first site](/assets/images/teagaisc/teagaisc01.png)

There are three pieces on the site. They are the "stáitse" (stage), the editor and the console.

![The parts](/assets/images/teagaisc/tutorial01.png)

You can write Setanta programs in the editor. Then when you click the "Tosaigh" (start) button, the program starts running. Then the program can draw shapes on the stage, or write phrases out on the console.

## Example

Type `scríobh('Dia duit')` in the editor like this

**If you don't know how to type "í", you can use "scriobh".**

![Dia duit](/assets/images/teagaisc/teagaisc03.png)

Now, click on the "Tosaigh" button.

![Dia duit](/assets/images/teagaisc/teagaisc04.png)

Now look at the console!

![Dia duit](/assets/images/teagaisc/teagaisc05.png)

Congratulations!, you wrote your first Setanta program!

## Drawing shapes

You can use Setanta to draw shapes on the stage

```
dath@stáitse('dearg')
ciorcal@stáitse(200, 200, 100)
```

The first line changes the colour of the pen to dearg (red). Then the second line draws a circle around the point (200, 200) with radius 100. Press the "Tosaigh" (Start) button and look at the stage.

![Circle](/assets/images/teagaisc/ciorcal.gif)

You can draw rectangles, squares or any other shape! Try out this code:

```
dath@stáitse('buí')
dron@stáitse(300, 300, 400, 200)
dath@stáitse('oráiste')
ciorcalLán@stáitse(300, 300, 50)
ciorcalLán@stáitse(700, 300, 50)
ciorcal@stáitse(300, 500, 50)
ciorcal@stáitse(700, 500, 50)
```

[The next tutorial: Setanta 101](/english/03-tutorial)
