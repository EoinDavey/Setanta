---
layout: single
title: Setanta 101
toc: true
---

## Maths

Setanta can do maths. Type `scríobh(2*3)` into the editor, click start, and look at the console. `6` will be written there.
![6](/assets/images/teagaisc/teagaisc06.png)

Look what this program writes.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">scríobh</span>(<span class="m">2</span> <span class="o">+</span> <span class="m">2</span>)
<span class="n">scríobh</span>(<span class="m">4</span> <span class="o">*</span> (<span class="m">2</span> <span class="o">+</span> <span class="m">3</span>))
<span class="n">scríobh</span>(<span class="m">5</span> <span class="o">==</span> <span class="m">5</span>)
<span class="n">scríobh</span>(<span class="m">5</span> <span class="o">==</span> <span class="m">6</span>)
<span class="n">scríobh</span>(<span class="m">5</span> <span class="o">!=</span> <span class="m">6</span>)</code></pre>
</div>
</div>

This is in the console.


<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="m">4</span>
<span class="m">20</span>
<span class="m">fíor</span>
<span class="m">bréag</span>
<span class="m">fíor</span></code></pre>
</div>
</div>

Specifically, notice that `==` and `!=` compare numbers (and other things).

## Letters (Litreacha)

You can write phrases too, we saw this earlier with the simple program:
<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">scríobh</span>(<span class="s">&#x27;Dia duit&#x27;</span>)</code></pre>
</div>
</div>

We call these phrases "litreacha". You create *litreacha* with two `'`s. For example:
<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="s">&#x27;Hello&#x27;</span>
<span class="s">&#x27;I\&#x27;m Eoin&#x27;</span></code></pre>
</div>
</div>

You can use `+` to join litreacha together.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">scríobh</span>(<span class="s">&#x27;Hello&#x27;</span> <span class="o">+</span> <span class="s">&#x27;, &#x27;</span> <span class="o">+</span> <span class="s">&#x27;my name is Eoin&#x27;</span>)</code></pre>
</div>
</div>

This writes `Hello, My name is Eoin`.

## Lists

Create lists in Setanta with `[` and `]`, for example:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code>[<span class="m">1</span><span class="p">,</span> <span class="m">2</span><span class="p">,</span> <span class="m">3</span>]
[<span class="s">&#x27;An Dagda&#x27;</span><span class="p">,</span> <span class="s">&#x27;Lugh&#x27;</span><span class="p">,</span> <span class="s">&#x27;Mór-Ríoghain&#x27;</span><span class="p">,</span> <span class="s">&#x27;Nuada&#x27;</span>]</code></pre>
</div>
</div>

Lists are very powerful. Every position in a list has a number. You can get an element of a list if you have the number of the position of the element. We give the number 0 to the first element of the list, the number 1 to the second element, the number 2 to the third etc.

If you have the number of the position, you can use `[` and `]` again to get the member. For example:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code>[<span class="s">&#x27;Dia&#x27;</span><span class="p">,</span> <span class="s">&#x27;Duit&#x27;</span>][<span class="m">0</span>] <span class="o">==</span> <span class="s">&#x27;Dia&#x27;</span>
[<span class="s">&#x27;Dia&#x27;</span><span class="p">,</span> <span class="s">&#x27;Duit&#x27;</span>][<span class="m">1</span>] <span class="o">==</span> <span class="s">&#x27;Duit&#x27;</span>

[<span class="m">100</span><span class="p">,</span> <span class="m">200</span><span class="p">,</span> <span class="m">300</span><span class="p">,</span> <span class="m">400</span>][<span class="m">2</span>] <span class="o">==</span> <span class="m">300</span></code></pre>
</div>
</div>

## Comments

If you write the symbol `>--` in your program, Anything you write after it on the same line is a comment, and is not part of the program. For example

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">scríobh</span>(<span class="s">&#x27;Hello&#x27;</span>)</code></pre>
</div>
</div>

Comments are very useful because they allow us to write notes in our programs.

## Variables

Setanta can remember values. For example, put this code in the editor and run it:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">x</span> := <span class="m">10</span>
<span class="n">scríobh</span>(<span class="n">x</span> <span class="o">*</span> <span class="m">2</span>)</code></pre>
</div>
</div>

It writes out `20` in the console.

In this program `x` is a **variable**. We can use variables everywhere that we use numbers and litreacha.

We create new variables with `:=`.

We can change the value in the variable `x` with `=`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">x</span> := <span class="m">10</span> <span class="c">&gt;-- New variable with value 10
</span><span class="n">x</span> = <span class="n">x</span> <span class="o">+</span> <span class="m">10</span></code></pre>
</div>
</div>

Now `x` is equal to 20. What does this program write?

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">x</span> := <span class="m">10</span>
<span class="n">y</span> := <span class="m">2</span> <span class="o">*</span> <span class="n">x</span> <span class="c">&gt;-- Create a new variable &#x27;y&#x27; with value 20
</span><span class="n">x</span> = <span class="n">y</span> <span class="o">+</span> <span class="n">x</span> <span class="c">&gt;-- Change the variable &#x27;x&#x27; to &#x27;x + y&#x27; = 10 + 20 = 30
</span><span class="n">scríobh</span>(<span class="n">x</span>)</code></pre>
</div>
</div>

We can use variables to draw things on the stage too. Put the following code in the editor:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">mo_dhath</span> := <span class="s">&#x27;dearg&#x27;</span> <span class="c">&gt;-- Change this variable to change the colour of the circles.
</span>
<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="n">mo_dhath</span>)

<span class="c">&gt;-- Create the variables &#x27;x&#x27;, &#x27;y&#x27; and &#x27;ga&#x27;
</span><span class="n">x</span> := <span class="m">100</span>
<span class="n">y</span> := <span class="m">100</span>
<span class="n">ga</span> := <span class="m">40</span>

<span class="n">ciorcal</span><span class="o">@</span><span class="n">stáitse</span>(<span class="n">x</span><span class="p">,</span> <span class="n">y</span><span class="p">,</span> <span class="n">ga</span>) <span class="c">&gt;-- Draw the first circle
</span>
<span class="n">x</span> = <span class="n">x</span> <span class="o">+</span> <span class="m">100</span> <span class="c">&gt;-- Change &#x27;x&#x27; to 200
</span><span class="n">y</span> = <span class="n">y</span> <span class="o">+</span> <span class="m">100</span> <span class="c">&gt;-- Change &#x27;y&#x27; to 200
</span><span class="n">ga</span> = <span class="n">ga</span> <span class="o">*</span> <span class="m">2</span> <span class="c">&gt;-- Change &#x27;ga&#x27; to 80
</span>
<span class="n">ciorcal</span><span class="o">@</span><span class="n">stáitse</span>(<span class="n">x</span><span class="p">,</span> <span class="n">y</span><span class="p">,</span> <span class="n">ga</span>)</code></pre>
</div>
</div>

![Two circles](/assets/images/teagaisc/dhaciorcal.gif)

## Next
You learned a lot of new things, go to [the next page](/english/04-ma-loops) to learn about `má` and loops.
