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

An object is a group of actions and values. For example, the actions `dath` and `ciorcal` that we saw before are in the object `stáitse`.

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

## Changing objects

Objects have memory too, we can store values in objects with `=`.

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="c">&gt;-- Outline with no actions
</span><span class="k">creatlach</span> <span class="n">EmptyObject</span> {
}

<span class="c">&gt;-- Create a new object
</span><span class="n">obj</span> := <span class="n">EmptyObject</span>()

<span class="c">&gt;-- Put &#x27;Sara&#x27; in name@obj
</span><span class="n">name</span><span class="o">@</span><span class="n">obj</span> = <span class="s">&#x27;Sara&#x27;</span>

<span class="n">scríobh</span>(<span class="n">name</span><span class="o">@</span><span class="n">obj</span>) <span class="c">&gt;-- This writes &#x27;Sara&#x27;</span></code></pre>
</div>
</div>

- At the start we create a new outline without any actions. We call it `EmptyObject`.
- Then we type `obj := EmptyObject()` to create an object from the `EmptyObject` outline.
- We use the symbol `@` to put 'Sara' in the member `name` with the line `name@obj = 'Sara'`.
- Then when we call `scríobh` with `name@obj`, it writes 'Sara' out on the console.

To see the full power of outlines, we need to talk about the word `seo` (meaning "this").

## The word "seo".

We would like to change an object with the actions that are inside the outline of the object. We use the word `seo` (meaning "this") to do this. Look at this for example:

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Person</span> {

    <span class="k">gníomh</span> <span class="n">changeName</span>(<span class="n">name</span>) {
        <span class="n">name</span><span class="o">@</span><span class="n">seo</span> = <span class="n">name</span>
    }

    <span class="k">gníomh</span> <span class="n">speak</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Hi! My name is &#x27;</span> <span class="o">+</span> <span class="n">name</span><span class="o">@</span><span class="n">seo</span>)
    }
}

<span class="n">me</span> := <span class="n">Person</span>()
<span class="n">changeName</span><span class="o">@</span><span class="n">me</span>(<span class="s">&#x27;Eoin&#x27;</span>)

<span class="n">speak</span><span class="o">@</span><span class="n">me</span>()</code></pre>
</div>
</div>

And now look at the console:

```
Hi! My name is Eoin
```

We used the word `seo` inside the action `changeName` and `speak`.

We create a new object with `Person()` and we put it in the variable `me`. Then we used `changeName@me('Eoin')` to change the name of the person to 'Eoin'

When we called `speak` with `speak@me()`, it wrote 'Hi! My name is Eoin' out on the console.

We can use the same outline again and again to make a lot of objects.

## The "nua" action

We will now create an outline for a person. We need to create a lot of actions to store the name, age and address:

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Person</span> {
    <span class="k">gníomh</span> <span class="n">changeName</span>(<span class="n">name</span>) {
        <span class="n">name</span><span class="o">@</span><span class="n">seo</span> = <span class="n">name</span>
    }
    <span class="k">gníomh</span> <span class="n">changeAge</span>(<span class="n">age</span>) {
        <span class="n">age</span><span class="o">@</span><span class="n">seo</span> = <span class="n">age</span>
    }
    <span class="k">gníomh</span> <span class="n">changeAddress</span>(<span class="n">address</span>) {
        <span class="n">address</span><span class="o">@</span><span class="n">seo</span> = <span class="n">address</span>
    }
    <span class="k">gníomh</span> <span class="n">speak</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Hi, my name is&#x27;</span><span class="p">,</span> <span class="n">name</span><span class="o">@</span><span class="n">seo</span>)
        <span class="n">scríobh</span>(<span class="s">&#x27;I am&#x27;</span><span class="p">,</span> <span class="n">age</span><span class="o">@</span><span class="n">seo</span><span class="p">,</span> <span class="s">&#x27;years old&#x27;</span>)
        <span class="n">scríobh</span>(<span class="s">&#x27;I live in&#x27;</span><span class="p">,</span> <span class="n">address</span><span class="o">@</span><span class="n">seo</span>)
    }
}</code></pre>
</div>
</div>

When we want to create an object, we have to write a lot of code:

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">bart</span> := <span class="n">Person</span>()
<span class="n">changeName</span><span class="o">@</span><span class="n">bart</span>(<span class="s">&#x27;Bart Simpson&#x27;</span>)
<span class="n">changeAge</span><span class="o">@</span><span class="n">bart</span>(<span class="m">10</span>)
<span class="n">changeAddress</span><span class="o">@</span><span class="n">bart</span>(<span class="s">&#x27;Springfield&#x27;</span>)</code></pre>
</div>
</div>

To solve this problem, we can use a special action, the "nua" action. "Nua" translates as "new".

When you put an action in an outline with the name "nua", that action is ran when an object is created from the outline. For example: We can write the `Person` outline we wrote earlier with the "nua" function like this:

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Person</span> {
    <span class="k">gníomh</span> <span class="n">nua</span>(<span class="n">name</span><span class="p">,</span> <span class="n">age</span><span class="p">,</span> <span class="n">address</span>) {
        <span class="n">name</span><span class="o">@</span><span class="n">seo</span> = <span class="n">name</span>
        <span class="n">age</span><span class="o">@</span><span class="n">seo</span> = <span class="n">age</span>
        <span class="n">address</span><span class="o">@</span><span class="n">seo</span> = <span class="n">address</span>
    }
    <span class="k">gníomh</span> <span class="n">speak</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Hi, my name is&#x27;</span><span class="p">,</span> <span class="n">name</span><span class="o">@</span><span class="n">seo</span>)
        <span class="n">scríobh</span>(<span class="s">&#x27;I am&#x27;</span><span class="p">,</span> <span class="n">age</span><span class="o">@</span><span class="n">seo</span><span class="p">,</span> <span class="s">&#x27;years old&#x27;</span>)
        <span class="n">scríobh</span>(<span class="s">&#x27;I live in&#x27;</span><span class="p">,</span> <span class="n">address</span><span class="o">@</span><span class="n">seo</span>)
    }
}</code></pre>
</div>
</div>

We deleted the actions `changeName`, `changeAge` and `changeAddress`, and instead we wrote one action with the name "nua".

Now, instead of the long piece of code we wrote earlier to create the `bart` object. We can write this:

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">bart</span> := <span class="n">Person</span>(<span class="s">&#x27;Bart Simpson&#x27;</span><span class="p">,</span> <span class="m">10</span><span class="p">,</span> <span class="s">&#x27;Springfield&#x27;</span>)
<span class="n">speak</span><span class="o">@</span><span class="n">bart</span>()</code></pre>
</div>
</div>

That's a lot less code!

When we create a new object with

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">Person</span>(<span class="s">&#x27;Bart Simpson&#x27;</span><span class="p">,</span> <span class="m">10</span><span class="p">,</span> <span class="s">&#x27;Springfield&#x27;</span>)</code></pre>
</div>
</div>

It calls the action "nua" in the outline.

Then when we run `speak@bart()`, it writes the correct the name, age and address on the console.

![Bart](/assets/images/teagaisc/bart-en.png)
