---
layout: single
title: Gníomhartha
toc: true
---

Sa teagaisc seo, bhíomar ag úsáid an focal `scríobh` chun rudaí a scríobh amach ar an gconsól. Tugaimid "gníomhartha" ar `scríobh` agus a lán rudaí cosúil leis.

Mar shampla scríobh an ríomhchlár seo isteach san eagarthóir:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">ainm</span> := <span class="n">ceist</span>(<span class="s">&#x27;Cad is ainm duit?&#x27;</span>)
<span class="n">scríobh</span>(<span class="s">&#x27;Dia duit &#x27;</span> <span class="o">+</span> <span class="n">ainm</span>)</code></pre>
</div>
</div>

Rith an ríomhchlár sin, clóscríobh d'ainm isteach sa chonsól agus brúigh an eochair iontrála.

![Scríobh d'ainm](/assets/images/teagaisc/teagaisc07.png)

Seo é an toradh:

![Dia duit Eoin](/assets/images/teagaisc/ainm.gif)

Is sampla eile de gníomhartha é `ceist`, is féidir leat `ceist` a úsáid chun ceist a chur, agus an freagair a shábháil in athróg éigin.

## Ag cruthú ár ngníomhartha féin

Is féidir linn ár ngníomhartha féin a cruthú, déanaimid é sin nuair ba mhaith linn rud éigin a dhéanamh i roinnt áiteanna sa ríomhchlár.

Cruthaímid gníomhartha leis an bhfocal `gníomh`.

Mar shampla, déanfaimid gníomh chun 'Dia duit' a scríobh ar an gconsól mar seo:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">diaDuit</span>() {
    <span class="n">scríobh</span>(<span class="s">&#x27;Dia duit&#x27;</span>)
}</code></pre>
</div>
</div>

Chun an gníomh `diaDuit` a úsáid, scríobhaimid `diaDuit()`. Bain triail as é sin anois!

![Dia duit](/assets/images/teagaisc/diaduit.gif)

Tugaimid '**corp** an gnímh' ar an cód idir `{` agus `}`, sa ghníomh `diaDuit` is é `scríobh('Dia duit')` an corp.

## Sampla

Mar shampla: Abair gur mhaith leat an pictiúr seo a tharraingt:

![Ceithre ciorcal](/assets/images/teagaisc/ceithreciorcal.png)

Ba chóir dúinn ceithre phéire ciorcail a tharraingt.

Chun péire ciorcail amháin a tharraingt, scríobhfaimis cód mar seo

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">100</span><span class="p">,</span> <span class="m">100</span><span class="p">,</span> <span class="m">100</span>)
<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;glas&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">100</span><span class="p">,</span> <span class="m">100</span><span class="p">,</span> <span class="m">50</span>)</code></pre>
</div>
</div>

Ach cad a scríobhfaimis dá theastódh uainn ceithre phéire a tharraingt? D'fhéadfaimis ríomhchlár an fhada a scríobh mar seo:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">100</span><span class="p">,</span> <span class="m">100</span><span class="p">,</span> <span class="m">100</span>)
<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;glas&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">100</span><span class="p">,</span> <span class="m">100</span><span class="p">,</span> <span class="m">50</span>)

<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">100</span><span class="p">,</span> <span class="m">300</span><span class="p">,</span> <span class="m">100</span>)
<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;glas&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">100</span><span class="p">,</span> <span class="m">300</span><span class="p">,</span> <span class="m">50</span>)

<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">300</span><span class="p">,</span> <span class="m">100</span><span class="p">,</span> <span class="m">100</span>)
<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;glas&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">300</span><span class="p">,</span> <span class="m">100</span><span class="p">,</span> <span class="m">50</span>)

<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">300</span><span class="p">,</span> <span class="m">300</span><span class="p">,</span> <span class="m">100</span>)
<span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;glas&#x27;</span>)
<span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="m">300</span><span class="p">,</span> <span class="m">300</span><span class="p">,</span> <span class="m">50</span>)</code></pre>
</div>
</div>

Bheadh tú ag scríobh an rud cheanna arís 's arís. Áfach, is féidir linn gníomh a cruthú chun péire amháin a tharraingt, agus ansin úsáidfimid é ceithre huaire:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">dháChiorcal</span>(<span class="n">x</span><span class="p">,</span> <span class="n">y</span>) {
    <span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;dearg&#x27;</span>)
    <span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="n">x</span><span class="p">,</span> <span class="n">y</span><span class="p">,</span> <span class="m">100</span>)
    <span class="n">dath</span><span class="o">@</span><span class="n">stáitse</span>(<span class="s">&#x27;glas&#x27;</span>)
    <span class="n">ciorcalLán</span><span class="o">@</span><span class="n">stáitse</span>(<span class="n">x</span><span class="p">,</span> <span class="n">y</span><span class="p">,</span> <span class="m">50</span>)
}
<span class="n">dháChiorcal</span>(<span class="m">100</span><span class="p">,</span> <span class="m">100</span>)
<span class="n">dháChiorcal</span>(<span class="m">100</span><span class="p">,</span> <span class="m">300</span>)
<span class="n">dháChiorcal</span>(<span class="m">300</span><span class="p">,</span> <span class="m">100</span>)
<span class="n">dháChiorcal</span>(<span class="m">300</span><span class="p">,</span> <span class="m">300</span>)</code></pre>
</div>
</div>

![Ceithre ciorcal gif](/assets/images/teagaisc/ceithreciorcal.gif)

Sin i bhfad níos lú cód! Ach cad atá ag tarlú sa ghníomh? Ar dtús caithfimid labhairt faoi argóintí.

## Argóintí

Féach arís ar an ríomhchlár `scríobh('Dia duit')`. Tugaimid an luach "Dia duit" do `scríobh`, agus scríobhann sé amach é ar an gconsól. Sa chás seo, is **argóint** é 'Dia duit'. Is luachanna iad argóintí a thógann gníomhartha chun corp an gnímh a dhéanamh.

Is féidir linn argóintí a úsáid lenár gcuid gníomhartha féin freisin. Abair gur mhaith linn gníomh a dhéanamh chun scríobh rudaí trí huaire. Is féidir linn rud mar seo a scríobh:

<div class="language-python highlighter-rouge">
<div class="highlight">
<pre class="highlight"><code><span class="k">gníomh</span> <span class="n">tríhuaire</span>(<span class="n">x</span>) {
    <span class="n">scríobh</span>(<span class="n">x</span>)
    <span class="n">scríobh</span>(<span class="n">x</span>)
    <span class="n">scríobh</span>(<span class="n">x</span>)
}
<span class="n">tríhuaire</span>(<span class="s">&#x27;Is aoibhinn liom Setanta&#x27;</span>)</code></pre>
</div>
</div>

Féach ar an toradh!

![Trí huaire](/assets/images/teagaisc/trihuaire.gif)

Anois féach ar ais ar an gníomh `dháChiorcal` a chruthaíomar níos luaithe.
Tógann sé dhá **argóint**, go háirithe `x` agus `y`.
Tógann an gníomh na argóintí agus cuireann sé an luach sna athróga `x` agus `y` istigh de corp an gnímh.
Ansin ritheann an cód isteach sa gníomh, ag úsáid na athróga. Tarraingíonn sé an péire ciorcail timpeall an pointe (x, y).

[Anois téigh go dtí an céad teagaisc eile: Torthaí](/gaeilge/06-torthai)
