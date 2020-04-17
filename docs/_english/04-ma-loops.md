---
layout: single
title: Má and loops
toc: true
---
## Má ... nó ...

You can make choices in your program! We use the word `má` (meaning "if") to make a check, and then to make a choice with the result of that check. Look at the following program:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">aois</span> := <span class="m">14</span>
<span class="k">má</span> <span class="n">aois</span> <span class="o">&gt;=</span> <span class="m">13</span> <span class="o">&amp;</span> <span class="n">aois</span> <span class="o">&lt;=</span> <span class="m">19</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Is déagóir thú&#x27;</span>)
<span class="k">nó</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Ní déagóir thú&#x27;</span>)</code></pre>
</div>
</div>

This program checks if `aois` is between 13 and 19. If it's true, it writes 'Is déagóir thú' (You're a teenager). If it's not true it writes 'Ní déagóir thú' (You're not a teenager).

We can use this structure again and again, like this.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">má</span> <span class="n">ainm</span> <span class="o">==</span> <span class="s">&#x27;Oisín&#x27;</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Oisin, tar liomsa go Tír na nÓg&#x27;</span>)
<span class="k">nó</span> <span class="k">má</span> <span class="n">ainm</span> <span class="o">==</span> <span class="s">&#x27;Fionn&#x27;</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Dia duit Fionn, an bhfuil Oisín anseo?&#x27;</span>)
<span class="k">nó</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Tá brón orm, Níl aithne agam ort&#x27;</span>)</code></pre>
</div>
</div>

- If `ainm` is equal to 'Oisín' this writes 'Oisin, tar liomsa go Tír na nÓg' (Oisín, come with me to Tír na nÓg).
- If `ainm` isn't equal to Oisin, it then checks if `ainm` is equal to 'Fionn', if it is it writes 'Dia duit Fionn, an bhfuil Oisín anseo?' (Hello Fionn, is Oisín here).
- If `ainm` wasn't Oisín or Fionn, then it writes 'Tá brón orm, Níl aithne agam ort' (I'm sorry, I don't know you)

Use `{` and `}` to make a group of instructions.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">má</span> <span class="n">x</span> <span class="o">==</span> <span class="m">6</span> {
    <span class="n">scríobh</span>(<span class="n">x</span>)
    <span class="n">scríobh</span>(<span class="m">2</span> <span class="o">*</span> <span class="n">x</span>)
} <span class="k">nó</span> {
    <span class="n">scríobh</span>(<span class="n">x</span>)
    <span class="n">scríobh</span>(<span class="m">3</span> <span class="o">*</span> <span class="n">x</span>)
}</code></pre>
</div>
</div>

**You can use `ma` and `no` if you can't type 'á' or 'ó'.**

## Loops

We use loops when we need to do something again and again.

### Le .. idir ..

When we know how many times we want to do something, we can use this loop

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="m">10</span>)
    <span class="n">scríobh</span>(<span class="n">i</span>)</code></pre>
</div>
</div>

This program writes every number between 0 and 10, it doesn't write 10 because the loop stops before the last number.

You can put another number in the brackets to change the step between numbers. For example:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="m">10</span><span class="p">,</span> <span class="m">3</span>)
    <span class="n">scríobh</span>(<span class="n">i</span>)</code></pre>
</div>
</div>

This writes 0, 3, 6, 9 as the step size is 3.

#### Example

We will use a loop to make a list of every number between 0 and 10.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">liosta</span> := []

<span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="m">10</span>) {
    <span class="n">liosta</span> = <span class="n">liosta</span> <span class="o">+</span> [<span class="n">i</span>]
}

<span class="n">scríobh</span>(<span class="n">liosta</span>)</code></pre>
</div>
</div>

Run that code and look at the console.

![List of numbers](/assets/images/teagaisc/liostauimhreacha.png)

### Nuair-a

There is a simpler loop available too, called `nuair-a` (which translates as "when").

At first the loop checks the term after the `nuair-a`, if it's true, it follows the instructions in the loop, and it goes back to the start. If it's not true, it breaks out of the loop. It does this over and over until the check is false.

In the following example, it goes through the loop 5 times, and then `x == 6`, specifically `x < 5` is not true, and with that, the loop is finished.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">x</span> := <span class="m">0</span>
<span class="k">nuair-a</span> <span class="n">x</span> <span class="o">&lt;</span> <span class="m">5</span> {
    <span class="n">scríobh</span>(<span class="n">x</span>)
    <span class="n">x</span> = <span class="n">x</span> <span class="o">+</span> <span class="m">1</span>
}</code></pre>
</div>
</div>

We get `0, 1, 2, 3, 4`.

### bris & chun-cinn

In both of those loops, `le idir` and `nuair-a`, you can use the instructions `bris` and `chun-cinn`. `bris` does exactly what it says, it breaks out of the loop. If Setanta follows this instruction, it stops the loop and it continues after the loop.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">x</span> := <span class="m">0</span>
<span class="k">nuair-a</span> <span class="n">x</span> <span class="o">&lt;</span> <span class="m">100</span> {
    <span class="k">má</span> <span class="n">x</span> <span class="o">==</span> <span class="m">10</span>
        <span class="k">bris</span>
    <span class="n">scríobh</span>(<span class="n">x</span>)
}</code></pre>
</div>
</div>
This loop writes `0 1 2 3 4 5 6 7 8 9`, and then `x == 10` and we break out of the loop.

`chun-cinn` does something different. `chun-cinn` goes directly to the top of the loop, and it starts with the next one. For example:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (-<span class="m">10</span><span class="p">,</span> <span class="m">10</span>) {
    <span class="k">má</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="m">0</span>
        <span class="k">chun-cinn</span>
    <span class="n">scríobh</span>(<span class="n">i</span>)
}</code></pre>
</div>
</div>

This loop writes `0 1 2 3 4 5 6 7 9 8 9`, because for each `i < 0`, the `chunn-cinn` instruction is followed, and we start with the next number.

## Big example

We have an example now that uses everything we've seen, loops, `má`, variables, the stage ....

Run this code and look at the stage:
<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;gorm&#x27;</span>)

<span class="c">&gt;-- Na súile
</span><span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">200</span><span class="p">,</span> <span class="m">200</span><span class="p">,</span> <span class="m">50</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">400</span><span class="p">,</span> <span class="m">200</span><span class="p">,</span> <span class="m">50</span>)

<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)

<span class="n">x</span> := <span class="m">100</span>
<span class="n">y</span> := <span class="m">400</span>

<span class="c">&gt;-- Béal
</span><span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="m">40</span>) {
    <span class="n">dron</span><span class="o">@</span><span class="n">stáitse</span>(<span class="n">x</span><span class="p">,</span> <span class="n">y</span><span class="p">,</span> <span class="m">20</span><span class="p">,</span> <span class="m">20</span>)
    <span class="n">x</span> += <span class="m">10</span>
    <span class="k">má</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="m">10</span>
    	<span class="n">y</span> += <span class="m">3</span>
    <span class="k">nó</span> <span class="k">má</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="m">20</span>
    	<span class="n">y</span> += <span class="m">1</span>
    <span class="k">nó</span> <span class="k">má</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="m">30</span>
    	<span class="n">y</span> -= <span class="m">1</span>
    <span class="k">nó</span>
    	<span class="n">y</span> -= <span class="m">3</span>
}

<span class="c">&gt;-- srón
</span>
<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;oráiste&#x27;</span>)

<span class="n">cruthLán</span><span class="o">@</span><span class="n">stáitse</span>([[<span class="m">300</span><span class="p">,</span> <span class="m">270</span>]<span class="p">,</span> [<span class="m">270</span><span class="p">,</span> <span class="m">350</span>]<span class="p">,</span> [<span class="m">330</span><span class="p">,</span> <span class="m">350</span>]])</code></pre>
</div>
</div>

![An aghaidh](/assets/images/teagaisc/aghaidh.gif)

Now go to the [next tutorial: Actions (gníomh)](/english/05-gniomh)
