---
layout: single
title: Gníomhartha
toc: true
---

Sa teagaisc seo, bhíomar ag úsáid an focal `scríobh` chun rudaí a scríobh amach ar an gconsól. Tugaimid "gníomhartha" ar `scríobh` agus a lán rudaí cosúil leis.

Mar shampla scríobh an ríomhchlár seo isteach san eagarthóir:

```
ainm := ceist('Cad is ainm duit?')
scríobh('Dia duit ' + ainm)
```

Rith an ríomhchlár sin, clóscríobh d'ainm isteach sa chonsól agus brúigh an eochair iontrála.

![Scríobh d'ainm](/assets/images/teagaisc/teagaisc07.png)

Seo é an toradh:

![Dia duit Eoin](/assets/images/teagaisc/ainm.gif)

Is sampla eile de gníomhartha é `ceist`, is féidir leat `ceist` a úsáid chun ceist a chur, agus an freagair a sábháil i athróg éigin.

## Ag cruthú ár ngníomhartha féin

Is féidir linn ár ngníomhartha féin a cruthú, déanaimid é sin nuair ba mhaith linn rud éigin a dhéanamh i roinnt áiteanna sa ríomhchlár.

Cruthaímid gníomhartha leis an bhfocal `gníomh`.

Mar shampla, déanfaimid gníomh chun 'Dia duit' a scríobh ar an gconsól mar seo:

```
gníomh diaDuit() {
    scríobh('Dia duit')
}
```

Chun an gníomh `diaDuit` a úsáid, scríobhaimid `diaDuit()`. Bain triail as é sin anois!

![Dia duit](/assets/images/teagaisc/diaduit.gif)

Tugaimid '**corp** an gnímh' ar an cód idir `{` agus `}`, sa gníomh `diaDuit` is é `scríobh('Dia duit')` an corp.

## Sampla

Mar shampla. Abair gur mhaith leat an pictiúr seo a tharraingt:

![Ceithre ciorcal](/assets/images/teagaisc/ceithreciorcal.png)

Ba chóir dúinn ceithre phéire ciorcail a tharraingt.

Chun péire ciorcail amháin a tharraingt, scríobhfaimis cód mar seo

```
dath@stáitse('dearg')
ciorcalLán@stáitse(100, 100, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(100, 100, 50)
```

Ach cad a scríobhfaimis dá theastódh uainn ceithre phéire a tharraingt? D'fhéadfaimis ríomhchlár an fhada a scríobh mar seo:

```
dath@stáitse('dearg')
ciorcalLán@stáitse(100, 100, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(100, 100, 50)

dath@stáitse('dearg')
ciorcalLán@stáitse(100, 300, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(100, 300, 50)

dath@stáitse('dearg')
ciorcalLán@stáitse(300, 100, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(300, 100, 50)

dath@stáitse('dearg')
ciorcalLán@stáitse(300, 300, 100)
dath@stáitse('glas')
ciorcalLán@stáitse(300, 300, 50)

```

Bheadh tú ag scríobh an rud cheanna arís 's arís. Áfach, is féidir linn gníomh a cruthú chun péire amháin a tharraingt, agus ansin úsáidfimid é ceithre huaire:

```
gníomh dháChiorcal(x, y) {
    dath@stáitse('dearg')
    ciorcalLán@stáitse(x, y, 100)
    dath@stáitse('glas')
    ciorcalLán@stáitse(x, y, 50)
}
dháChiorcal(100, 100)
dháChiorcal(100, 300)
dháChiorcal(300, 100)
dháChiorcal(300, 300)
```

![Ceithre ciorcal gif](/assets/images/teagaisc/ceithreciorcal.gif)

Sin i bhfad níos lú cód! Ach cad atá ag tarlú sa ghníomh? Ar dtús caithfimid labhairt faoi argóintí.

## Argóintí

Féach arís ar an ríomhchlár `scríobh('Dia duit')`. Tugaimid an luach "Dia duit" do `scríobh`, agus scríobhann sé amach é ar an gconsól. Sa chás seo, is **argóint** é 'Dia duit'. Is luachanna iad argóintí a thógann gníomhartha chun corp an gnímh a dhéanamh.

Is féidir linn argóintí a úsáid lenár gcuid gníomhartha féin freisin. Abair gur mhaith linn gníomh a dhéanamh chun scríobh rudaí trí huaire. Is féidir linn rud mar seo a scríobh:

```
gníomh tríhuaire(x) {
    scríobh(x)
    scríobh(x)
    scríobh(x)
}
tríhuaire('Is aoibhinn liom Setanta')
```

Féach ar an toradh!

![Trí huaire](/assets/images/teagaisc/trihuaire.gif)

Anois féach ar ais ar an gníomh `dháChiorcal` a chruthaíomar níos luaithe.
Tógann sé dhá **argóint** aige, go háirithe `x` agus `y`.
Tógann an gníomh na argóintí agus cuireann sé an luach sna athróga `x` agus `y` istigh de corp an gnímh.
Ansin ritheann an cód isteach sa gníomh, ag úsáid na athróga. Tarraingíonn sé an péire ciorcail timpeall an pointe (x, y).

[Ansin téigh go dtí an céad teagaisc eile: Torthaí](/gaeilge/06-torthai)
