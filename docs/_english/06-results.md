---
layout: single
title: Results
toc: true
---

## Actions with results

To explain results, we will look at some actions that come with Setanta. For example, Setanta comes with the action `fad`. You use `fad` to get the length of a list or `letters`. "fad" translates as length in English.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">liosta</span> := [<span class="m">0</span><span class="p">,</span> <span class="m">1</span><span class="p">,</span> <span class="m">2</span>]
<span class="n">scríobh</span>(<span class="n">fad</span>(<span class="n">liosta</span>)) <span class="c">&gt;-- This writes &quot;3&quot;
</span>
<span class="n">ainm</span> := <span class="s">&#x27;Cú Chulainn&#x27;</span>
<span class="n">scríobh</span>(<span class="n">fad</span>(<span class="n">ainm</span>))</code></pre>
</div>
</div>

When you use `fad` you get a result back, specifically the length of the list or the length of the letters.

In the same way, the action `go_uimh` has a result. You use `go_uimh` to convert letters to a number. For example:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">go_uimh</span>(<span class="s">&#x27;123&#x27;</span>) <span class="o">==</span> <span class="m">123</span></code></pre>
</div>
</div>

`123` is the result of the `go_uimh` action.

## Our own functions.

It's clear that results are very useful. We can create actions with results with the word `toradh` (meaning "result"). Say we want to create an action to add two numbers. We can write this:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">add</span>(<span class="n">a</span><span class="p">,</span> <span class="n">b</span>) {
    <span class="k">toradh</span> <span class="n">a</span> <span class="o">+</span> <span class="n">b</span>
}</code></pre>
</div>
</div>

Now when we call `add` with `add(a, b)`, we get back `a + b`. Try it out now!

![The add actions](/assets/images/teagaisc/addgniomh.png)

## A more complicated example

Now we mix loops, actions and results to create an action to add every number in a list.

At first we create the outline of the action.
<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">listSum</span>(<span class="n">list</span>) {
}</code></pre>
</div>
</div>

Now we want to go over every number in the variable `list`. We have to use a list to go from the start of the list to the end. We first look at `list[0]`, then `list[1]`, `list[2]` etc. until the end. We use `fad` to get the length of the list

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">listSum</span>(<span class="n">list</span>) {
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">list</span>)) {
        
    }
}</code></pre>
</div>
</div>

Now we create a variable to store the sum.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">listSum</span>(<span class="n">list</span>) {
    <span class="n">sum</span> := <span class="m">0</span>
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">list</span>)) {
        
    }
}</code></pre>
</div>
</div>

Now, in the loop, when we are looking at the the number of the list in position `i`, we add `list[i]` and the variable `sum` together and we put the result back in `sum`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">listSum</span>(<span class="n">list</span>) {
    <span class="n">sum</span> := <span class="m">0</span>
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">list</span>)) {
        <span class="n">sum</span> = <span class="n">sum</span> <span class="o">+</span> <span class="n">list</span>[<span class="n">i</span>]
    }
}</code></pre>
</div>
</div>

When the loop is finished the value of the variable `sum` is the sum of the whole list. Now there's nothing left to do but to put this value in the result of the action with the word `toradh`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">listSum</span>(<span class="n">list</span>) {
    <span class="n">sum</span> := <span class="m">0</span>
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">list</span>)) {
        <span class="n">sum</span> = <span class="n">sum</span> <span class="o">+</span> <span class="n">list</span>[<span class="n">i</span>]
    }
    <span class="k">toradh</span> <span class="n">sum</span>
}</code></pre>
</div>
</div>

We can run this code and see that it's working! Try `listSum([1, 2, 3, 4])` and see that it returns 10, which is 1 + 2 + 3 + 4.

![listSum works!](/assets/images/teagaisc/listsumworks.png)

## NB

The word `toradh` works like the word `bris`. When Setanta follows `toradh`, the action stops completely. To explain this, look at this action:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">f</span>() {
    <span class="n">scríobh</span>(<span class="s">&#x27;Dia duit&#x27;</span>)
    <span class="k">toradh</span> <span class="s">&#x27;Críochnaithe&#x27;</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Dia is Muire duit&#x27;</span>)
}

<span class="n">f</span>()</code></pre>
</div>
</div>

![Toradh NB](/assets/images/teagaisc/toradhnb.png)

The program didn't write 'Dia is Muire duit', because it stopped when it reached the line `toradh 'Críochnaithe'`.
