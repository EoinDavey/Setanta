---
layout: single
title: Torthaí
toc: true
---

## Gníomhartha le torthaí

Chun torthaí a mhínigh, féachfaimid ar cúpla gníomhartha a thagann le Setanta. Mar shampla, tagann Setanta leis an gníomh `fad`. Úsáideann tú `fad` chun fad liosta nó litreacha a fháil.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">liosta</span> := [<span class="m">0</span><span class="p">,</span> <span class="m">1</span><span class="p">,</span> <span class="m">2</span>]
<span class="n">scríobh</span>(<span class="n">fad</span>(<span class="n">liosta</span>)) <span class="c">&gt;-- Scríobhann sé seo &quot;3&quot;
</span>
<span class="n">ainm</span> := <span class="s">&#x27;Cú Chulainn&#x27;</span>
<span class="n">scríobh</span>(<span class="n">fad</span>(<span class="n">ainm</span>))</code></pre>
</div>
</div>

Nuair a úsáideann tú `fad` faigheann tú toradh ar ais, go háirithe fad an liosta nó fad an `litreacha`.

Mar an gcéanna, tá toradh ag an gníomh `go_uimh`. Úsáideann tú `go_uimh` chun litreacha a aistriú go huimhir. Mar shampla:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">go_uimh</span>(<span class="s">&#x27;123&#x27;</span>) <span class="o">==</span> <span class="m">123</span></code></pre>
</div>
</div>

Is é `123` toradh an ghnímh `go_uimh`.

## Ár dtorthaí féin

Is léir go bhfuil torthaí an-úsáideach. Is féidir linn gníomhartha le torthaí a cruthú leis an bhfocal `toradh`. Abair gur mhaith linn gníomh a cruthú chun dhá uimhir a shuimiú. Is féidir linn é seo a scríobh:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">suim</span>(<span class="n">a</span><span class="p">,</span> <span class="n">b</span>) {
    <span class="k">toradh</span> <span class="n">a</span> <span class="o">+</span> <span class="n">b</span>
}</code></pre>
</div>
</div>

Anois nuair a glaoimid ar `suim` le `suim(a, b)`, faighimid ar ais `a + b`. Bain triail as anois!

![An gníomh suim](/assets/images/teagaisc/suimgniomh.png)

## Sampla níos casta

Anois meascaimid lúba, gníomhartha agus torthaí chun gníomh a cruthú chun gach uimhir i liosta a shuimiú.

Ar dtús cruthaímid creatlach an ghnímh:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">suimLiosta</span>(<span class="n">liosta</span>) {
}</code></pre>
</div>
</div>

Anois teastaíonn uainn dul thar gach uimhir san athróg `liosta`. Caithimid lúb a úsáid chun dul ó thús an liosta go dtí an deireadh. Ar dtús féachaimid ar `liosta[0]`, ansin `liosta[1]`, `liosta[2]` etc. go dtí an deireadh. Úsáidimid `fad` chun fad an liosta a fháil.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">suimLiosta</span>(<span class="n">liosta</span>) {
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">liosta</span>)) {
        
    }
}</code></pre>
</div>
</div>

Anois cruthaímid athróg chun an suim a stóráil.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">suimLiosta</span>(<span class="n">liosta</span>) {
    <span class="n">suim</span> := <span class="m">0</span>
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">liosta</span>)) {
        
    }
}</code></pre>
</div>
</div>

Anois, sa lúb, nuair atáimid ag féachaint ar an uimhir an liosta san áit `i`, suimímid `liosta[i]` agus an athróg `suim` le chéile agus cuirimid an toradh ar ais i `suim`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">suimLiosta</span>(<span class="n">liosta</span>) {
    <span class="n">suim</span> := <span class="m">0</span>
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">liosta</span>)) {
        <span class="n">suim</span> = <span class="n">suim</span> <span class="o">+</span> <span class="n">liosta</span>[<span class="n">i</span>]
    }
}</code></pre>
</div>
</div>

Nuair atá an lúb críochnaithe is é suim an liosta iomlán an luach atá san athróg `suim`. Anois níl aon rud le déanamh ach cuir an luach sin i dtoradh an ghnímh leis an focal `toradh`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">suimLiosta</span>(<span class="n">liosta</span>) {
    <span class="n">suim</span> := <span class="m">0</span>
    <span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="n">fad</span>(<span class="n">liosta</span>)) {
        <span class="n">suim</span> = <span class="n">suim</span> <span class="o">+</span>  <span class="n">liosta</span>[<span class="n">i</span>]      
    }
    <span class="k">toradh</span> <span class="n">suim</span>
}</code></pre>
</div>
</div>

Anois is féidir linn bain triail as an gníomh. Úsáid é chun an liosta `[1, 2, 3, 4]` a shuimiú le `suimLiosta([1, 2, 3, 4])` agus féach ar an toradh. Faighimid 10, mar tá 1 + 2 + 3 + 4 cothrom le 10.

![Oibríonn suimLiosta](/assets/images/teagaisc/oibrionnSuimLiosta.png)
