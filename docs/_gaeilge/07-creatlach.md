---
layout: single
title: Rudaí & Creatlacha
toc: true
---

I rith an teagaisc seo chonaiceamar téarmaí a úsáideann an tsiombail `@`. Chonaiceamar:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
<span class="n">ciorcal</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">200</span><span class="p">,</span> <span class="m">200</span><span class="p">,</span> <span class="m">100</span>)</code></pre>
</div>
</div>

Tar éis an chuid seo den teagaisc tuigfidh tú cad atá ag tarlú nuair a úsáidimid `@`.

## Rudaí

Is grúpa gníomhartha agus luachanna é "rud". Mar shampla, tá na gníomhartha `dath` agus `ciorcal` a chonaiceamar roimhe seo isteach sa rud `stáitse`.

Úsáideann tú an siombail `@` chun ball de rud a fháil. Scríobhaimid `dath@stáitse` chun an gníomh a fháil agus ansin glaoimid ar an ngníomh le `dath@stáitse('dearg')`.

Freisin tá rud le ainm `mata` ag Setanta. Tá na gníomhartha matamaiticiúil `sin`, `cos`, `tan` etc. ag `mata`. Mar an gcéanna tá na luachanna `pi` agus `e` ag `mata` freisin. Bain úsáid as iad le `pi@mata` agus `e@mata`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">sin</span><span class="o">@</span><span class="n">mata</span>(<span class="m">2</span><span class="o">*</span><span class="n">pi</span><span class="o">@</span><span class="n">mata</span>) <span class="o">==</span> <span class="m">0</span></code></pre>
</div>
</div>

Is gnáth luachanna iad `stáitse` agus `mata` freisin, is féidir leat iad a cuir isteach in athróga nó bain úsáid as iad le gníomhartha:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">s</span> := <span class="n">stáitse</span>
<span class="n">ciorcal</span><span class="o">@</span><span class="n">s</span>(<span class="m">300</span><span class="p">,</span> <span class="m">300</span><span class="p">,</span> <span class="m">250</span>)</code></pre>
</div>
</div>

![Stáitse Athróg](/assets/images/teagaisc/staitseathrog.png)

## Creatlach

Is cur síos iomlán de rud é creatlach. Cruthaímid creatlach chun an struchtúr de rud a leag amach. Ansin is féidir linn an rud a cruthú.

Chun creatlach a cruthú bainimid úsáid as an focal `creatlach`.

Féach ar an gcód seo a leanas:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Bó</span> {
    <span class="k">gníomh</span> <span class="n">labhair</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Moo&#x27;</span>)
    }
}</code></pre>
</div>
</div>

Chruthaíomar creatlach nua leis an ainm `Bó`. Tá gníomh amháin ag `Bó`, an gníomh `labhair`. Ní dhéanann `labhair` aon rud ach 'Moo' a scríobh amach ar an gconsól.

Tabhair faoi deara nach rud é `Bó`, ach creatlach. Is féidir linn an rud a cruthú le `Bó()`.

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Bó</span> {
    <span class="k">gníomh</span> <span class="n">labhair</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Moo&#x27;</span>)
    }
}

<span class="n">bó</span> := <span class="n">Bó</span>()

<span class="c">&gt;-- Is rud é bó anois, leis an gníomh &quot;labhair&quot;
</span>
<span class="n">labhair</span><span class="o">@</span><span class="n">bó</span>()</code></pre>
</div>
</div>

Cuir é sin isteach san eagarthóir agus ban triail as. Cruthaigh cúpla gníomhartha eile nó creatlach eile ar bith!

## Ag athrú rudaí

Tá cuimhne ag rudaí freisin, táimid in ann luachanna a stóráil i rudaí le `=`.

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="c">&gt;-- Creatlach gan aon gníomhartha
</span><span class="k">creatlach</span> <span class="n">RudFolamh</span> {
}

<span class="c">&gt;-- Cruthaigh rud nua
</span><span class="n">rud</span> := <span class="n">RudFolamh</span>()

<span class="c">&gt;-- Cuir &#x27;Sara&#x27; i ainm@rud
</span><span class="n">ainm</span><span class="o">@</span><span class="n">rud</span> = <span class="s">&#x27;Sara&#x27;</span>

<span class="n">scríobh</span>(<span class="n">ainm</span><span class="o">@</span><span class="n">rud</span>) <span class="c">&gt;-- Scríobhann sé seo &#x27;Sara&#x27;</span></code></pre>
</div>
</div>

- Ar dtús cruthaímid creatlach gan aon gníomhartha. Tugaimid `RudFolamh` air.
- Ansin clóscríobhaimid `rud := RudFolamh()` chun rud a dhéanamh ón gcreatlach `RudFolamh`.
- Bainimid úsáid as an tsiombail `@` chun 'Sara' a chuir sa ball `ainm` leis an líne `ainm@rud = 'Sara'`.
- Ansin nuair a glaoimid `scríobh` ar `ainm@rud`, scríobhann sé amach 'Sara' ar an gconsól.

Chun an lánchumhacht na creatlaí a fheiceáil, caithfimid caint faoi an focal `seo`.

## An focal "seo"

Bá mhaith linn rud a athrú leis na gníomhartha atá isteach i gcreatlach an ruda. Bainimid úsáid as an focal `seo` chun é sin a dhéanamh. Féach ar seo mar shampla:

<div class="highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">creatlach</span> <span class="n">Duine</span> {

    <span class="k">gníomh</span> <span class="n">athraighAinm</span>(<span class="n">ainm</span>) {
        <span class="n">ainm</span><span class="o">@</span><span class="n">seo</span> = <span class="n">ainm</span>
    }

    <span class="k">gníomh</span> <span class="n">labhair</span>() {
        <span class="n">scríobh</span>(<span class="s">&#x27;Dia duit, is mise &#x27;</span> <span class="o">+</span> <span class="n">ainm</span><span class="o">@</span><span class="n">seo</span>)
    }
}

<span class="n">mise</span> := <span class="n">Duine</span>()
<span class="n">athraighAinm</span><span class="o">@</span><span class="n">mise</span>(<span class="s">&#x27;Eoin&#x27;</span>)

<span class="n">labhair</span><span class="o">@</span><span class="n">mise</span>()</code></pre>
</div>
</div>

Agus anois féach ar an gconsól:

```
Dia duit, is mise Eoin
```

Bhaineamar úsáid as an focal `seo` isteach sa ghníomh `athraighAinm` agus sa ghníomh `labhair`.

Chruthaíomar rud nua le `Duine()` agus chuireamar é san athróg `mise`. Ansin d'úsáideamar `athraighAinm@mise('Eoin')` chun ainm an duine a athrú go 'Eoin'.

Nuair a ghlaomar ar `labhair` le `labhair@mise()`, scríobh sé 'Dia duit, is mise Eoin' amach ar an gconsól.

Táimid in ann an creatlach chéanna a úsáid arís is arís chun a lán rudaí a cruthú.
