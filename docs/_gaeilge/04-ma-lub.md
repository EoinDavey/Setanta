---
layout: single
title: Má agus lúba
toc: true
---
## Má ... nó ...

Is féidir leat rogha a dhéanamh i do ríomhchlár! Úsáidimid an focal `má` chun seiceáil a dhéanamh, agus ansin rogha a dhéanamh le toradh an seiceáil. Féach ar an ríomhchlár seo.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">aois</span> := <span class="m">14</span>
<span class="k">má</span> <span class="n">aois</span> <span class="o">&gt;=</span> <span class="m">13</span> <span class="o">&amp;</span> <span class="n">aois</span> <span class="o">&lt;=</span> <span class="m">19</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Is déagóir thú&#x27;</span>)
<span class="k">nó</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Ní déagóir thú&#x27;</span>)</code></pre>
</div>
</div>

Seiceálann an ríomhchlár seo go bhfuil `aois` idir 13 agus 14. Má tá sé fíor, scríobhann sé 'Is déagóir thú', mura bhfuil sé fíor scríobhann sé 'Ní déagóir thú'.

Is féidir linn an struchtúr seo a úsáid arís is arís, mar seo

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">má</span> <span class="n">ainm</span> <span class="o">==</span> <span class="s">&#x27;Oisín&#x27;</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Oisín, tar liomsa go Tír na nÓg&#x27;</span>)
<span class="k">nó</span> <span class="k">má</span> <span class="n">ainm</span> <span class="o">==</span> <span class="s">&#x27;Fionn&#x27;</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Dia duit Fionn, an bhfuil Oisín anseo?&#x27;</span>)
<span class="k">nó</span>
    <span class="n">scríobh</span>(<span class="s">&#x27;Tá brón orm, Níl aithne agam ort&#x27;</span>)</code></pre>
</div>
</div>

- Má tá `ainm` cothrom le 'Oisín', scríobhann an cód sin 'Oisín, tar liomsa go Tír na nÓg'.
- Mura bhfuil `ainm` cothrom le 'Oisín', ansin seiceálann sé go bhfuil `ainm` cothrom le 'Fionn', más ionann iad scríobhann sé 'Dia duit Fionn, an bhfuil Oisín anseo?'
- Mura bhfuil `ainm` cothrom le 'Oisín' nó 'Fionn', ansin scríobhann sé 'Tá brón orm, Níl aithne agam ort'

Úsáid `{` agus `}` chun grúpa treoracha a cruthú.

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

**Is féidir leat `ma` agus `no` a úsaid mura féidir leat 'á' nó 'ó' a chlóscríobh.**

## Lúba

Bainimid úsáid as lúba nuair a bhfuil gá dúinn rud a dhéanamh arís 's arís eile.

### Le .. idir ..

Nuair atá fhios againn cé mhéad uair a bhfuil gá dúinn an rud a dhéanamh, is féidir linn úsáid an lúb seo

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="m">10</span>)
    <span class="n">scríobh</span>(<span class="n">i</span>)</code></pre>
</div>
</div>

Scríobhann an ríomhchlár seo gach uimhir idir 0 agus 10, ní scríobhann sé 10 mar stopann an lúb roimh an uimhir deireanach.

Is féidir leat uimhir eile a chur idir na lúibíní chun an céim idir na huimhreacha a athrú. Mar shampla

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (<span class="m">0</span><span class="p">,</span> <span class="m">10</span><span class="p">,</span> <span class="m">3</span>)
    <span class="n">scríobh</span>(<span class="n">i</span>)</code></pre>
</div>
</div>

Scríobhann é sin `0, 3, 6, 9` mar tá méid an chéim 3.

#### Sampla

Úsáidfimid lúb chun liosta a cruthú de gach uimhir idir 0 agus 10.

```setanta
liosta := []

le i idir (0, 10) {
    liosta = liosta + [i]
}

scríobh(liosta)
```

Rith an cód sin agus féach ar an gconsól.

![Liosta uimhreacha](/assets/images/teagaisc/liostauimhreacha.png)

### Nuair-a

Tá lúb níos simplí ar fáil freisin le ainm `nuair-a`.

Ar dtús seiceálann an lúb an téarma tar éis `nuair-a`, má bhfuil sé fíor leanann sé na treoracha sa lúb, agus téann sé ar ais go dtí tús na lúibe. Mura bhfuil sé fíor, briseann sé amach as an lúb. Déanann sé é seo arís is arís go mbeidh an téarma bréagach.

Sa sampla seo a leanas, ritheann an lúb 5 uair, agus ansin tá `x` cothrom le `6`, go háirithe níl `x < 5`, agus mar sin tá an lúb críochnaithe.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">x</span> := <span class="m">0</span>
<span class="k">nuair-a</span> <span class="n">x</span> <span class="o">&lt;</span> <span class="m">5</span> {
    <span class="n">scríobh</span>(<span class="n">x</span>)
    <span class="n">x</span> = <span class="n">x</span> <span class="o">+</span> <span class="m">1</span>
}</code></pre>
</div>
</div>


Faighimid `0, 1, 2, 3, 4`. 

### bris & chun-cinn

Sa dá lúb sin, `le idir` agus `nuair-a`, is féidir leat na treoracha `bris` agus `chun-cinn` a úsáid. Déanann `bris` díreach an rud a deir sé, briseann sé amach as an lúb. Má leanann Setanta an treoir sin, stop sé an lúb agus leanann sé ar aghaidh tar éis an lúb.

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
Scríobhann an lúb seo `0 1 2 3 4 5 6 7 8 9`, agus ansin tá `x == 10` agus brisimid as an lúb.

Déanann `chun-cinn` rud difriúil. Téann `chun-cinn` díreach go dtí barr na lúibe, agus tosaíonn sé leis an gcéad ceann eile. Mar shampla:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">le</span> <span class="n">i</span> <span class="k">idir</span> (-<span class="m">10</span><span class="p">,</span> <span class="m">10</span>) {
    <span class="k">má</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="m">0</span>
        <span class="k">chun-cinn</span>
    <span class="n">scríobh</span>(<span class="n">i</span>)
}</code></pre>
</div>
</div>

Scríobhann an lúb seo `0 1 2 3 4 5 6 7 8 9` mar le gach `i < 0`, leantar an treoir `chun-cinn` agus tosaímid leis an gcéad uimhir eile.

## Sampla mór

Tá sampla againn anois a úsáideann gach rud a chonaiceamar, lúba, `má`, athróga, an stáitse ...

Rith an cód seo agus féach ar an stáitse:
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

Anois téigh go dtí an [chéad teagaisc eile: gníomhartha](/gaeilge/05-gniomh)
