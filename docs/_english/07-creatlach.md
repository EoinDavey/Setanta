---
layout: single
title: Objects & Outlines
toc: true
---

Throughout this tutorial we have seen terms that use the symbol `@`. We saw:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
<span class="n">ciorcal</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">200</span><span class="p">,</span> <span class="m">200</span><span class="p">,</span> <span class="m">100</span>)</code></pre>
</div>
</div>

After this part of the tutorial, you will understand what is happening when we use `@`.

## Objects

We call the variable `stáitse` an object. An object is a group of actions and values. For example, the actions `dath` and `ciorcal` are in `stáitse`.

You use the symbol `@` to get a member of an object. We write `dath@stáitse` to get the action and then we call the action with `dath@stáitse('dearg')`.

Setanta also has an object called `mata`. The mathematical functions `sin`, `cos`, `tan` etc. are in `mata`. Similarly `mata` also has the values `pi` and `e`. Use them with `pi@mata` and `e@mata`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">sin</span><span class="o">@</span><span class="n">mata</span>(<span class="m">2</span><span class="o">*</span><span class="n">pi</span><span class="o">@</span><span class="n">mata</span>) <span class="o">==</span> <span class="m">0</span></code></pre>
</div>
</div>

`stáitse` and `mata` are normal values too, you can put them in variables or use them with functions.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">s</span> := <span class="n">stáitse</span>
<span class="n">ciorcal</span><span class="o">@</span><span class="n">s</span>(<span class="m">300</span><span class="p">,</span> <span class="m">300</span><span class="p">,</span> <span class="m">250</span>)</code></pre>
</div>
</div>

![Stáitse variable](/assets/images/teagaisc/staitseathrog.png)

## Outlines

An outline is a full description of an object. We create an outline to lay out the structure of an object. Then we can create the object.

We use the word `creatlach` to create an outline. `creatlach` translates as skeleton/outline.

Look at the following code:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Cow</span> {
    <span class="k">gníomh</span> <span class="n">speak</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Moo&#x27;</span>)
    }
}</code></pre>
</div>
</div>

We created an outline with the name `Cow`. `Cow` has one action, the action `speak`. `speak` just prints `Moo` on the console.

Notice that `Cow` is not an object, it's an outline. We can create the object with `Cow()`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Cow</span> {
    <span class="k">gníomh</span> <span class="n">speak</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Moo&#x27;</span>)
    }
}

<span class="n">cow</span> := <span class="n">Cow</span>()

<span class="c">&gt;-- cow is now an object, with the action &quot;speak&quot;
</span>
<span class="n">speak</span><span class="o">@</span><span class="n">cow</span>()</code></pre>
</div>
</div>

Put that into the editor and try it out. Create a few other functions or a completely different class!
