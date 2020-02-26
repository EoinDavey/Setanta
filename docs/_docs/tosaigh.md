---
layout: single
title: Tosaigh Anseo - Gaeilge
toc: true
---

# Conas a úsáidim Setanta?

Chun trial a bhaint as Setanta, tá dhá roghanna agat.

- Is féidir leat Setanta a úsáid ar [try-setanta.ie](https://try-setanta.ie).
- Is féidir leat é a íoslodáil ó NPM le `npm i -g setanta`.

Anois lean an teagaisc simplí seo.

# Teagaisc

## Struchtúr riomhcláir Setanta

Is seicheamh treoracha é ríomhclár Setanta. Már shampla

```
scríobh('Dia duit')
scríobh('Dia is Muire duit')
```

Scríobhann an ríomhchlár sin 'Dia duit', agus ansin scríobhann sé 'Dia is Muire duit'. Ban triail as é seo i Setanta anois! Tosaíonn Setanta ag barr an ríomhchlár agus leanann sé na treoracha ar na línte, síos go dtí bun an ríomhchlár.

**Mura bhfuil fhios agat conas 'í' a chlóscríobh, is feidir leat `scriobh` a úsáid.**

## Matamaitic

Is féidir le Setanta matamaitic a dhéanamh. Clóscríobh `scríobh(2 * 3)` isteach agus faigheann tú ar áis `6`. Tá `+`, `*`, `-`, `/` ag Setanta freisin. Is féidir linn a fheiceáil go bhfuil dhá rud cothrom le `==` agus `!=`, mar shampla is fíor é `2 * 3 == 6`, agus is fíor é `2 * 4 != 6`. Usáid `(` agus `)` chun tearmaí cosúil le `2 * 3 + (4 - 5) == 7` a scríobh.

## Athróga

Is féidir le Setanta luachanna a chuimhnigh. Mar shampla

```
x := 10
scríobh(x * 2) >-- scríobhann sé seo 20
```

Sá ríomhchlár seo is **athróg** é `x`. Cruthaimid athróg nua le `:=`

Táimid in ann an luach san athróg `x` a athrú le `=`.

```
x := 10
x = x + 10
```

Anois tá `x` cothrom le 20. Cad a scríobhann an ríomhchlár seo?

```
x := 10
y := 2 * x
x = y + x
scríobh(x)
```

## Má ... nó ...

Chonaiceamar conas a deanann tú treoir agus treoir eile, ach is féidir linn rogha a dheanámh! Úsáidimid an focal `má` chun seiceáil a dheanamh, agus ansin rogha a dheanámh leis an toradh.

```
aois := 14
má aois >= 13 & aois <= 19
    scríobh('Is déagóir tú')
nó
    scríobh('Ní déagóir tú')
```

Seiceálann an ríomhchlár seo go bhfuil `aois` idir 13 agus 14. Má bhfuil sé fíor, scríobhann sé 'Is déagóir tú', mura bhfuil sé fíor scríobhann sé 'Ni déagóir tú'.

Is féidir linn an struchtúr seo a úsáid arís is arís, mar seo

```
má ainm == 'Oisín'
    scríobh('Oisin, tar liomsa go Tír na nÓg')
nó má ainm == 'Fionn'
    scríobh('Dia duit Fionn, an bhfuil Oisín anseo?')
nó
    scríobh('Tá brón orm, Níl aithne agam ort')
```

Úsaid `{` agus `}` chun grúpa treoracha a cruthú.

```
má x == 6 {
    scríobh(x)
    scríobh(2 * x)
} nó {
    scríobh(x)
    scríobh(3 * x)
}
```

**Is feidir leat `ma` a úsaid mura feidir leat 'á' a chlóscríobh.**

## Lúba

Bainimid úsáid as lúba nuair a bhfuil gá dúinn rud a dhéanamh arís 's arís eile.

### Le .. idir ..

Nuair atá fhios againn cé mhéad uair a bhfuil gá dúinn an rud a dhéanamh, is féidir linn úsáid an lúb seo

```
le i idir (0, 10)
    scríobh(i)
```

Scríobhann an ríomhchlár seo gach uimhir idir 0 agus 10, ní scríobhann sé 10 mar stopann an lúb roimh an uimhir deireanach.

Oibríonn an lúb sa treo eile freisin

```
le i idir (10, 0)
    scríobh(i)
```

Scríobhann an ríomhchlár seo 10, 9, ... 1.

Is féidir leat uimhir eile a chur idir na luibíní chun an céim a athrú. Mar shampla

```
le i idir (0, 10, 3)
    scríobh(i)
```

Scríobhann é sin `0, 3, 6, 9`

### Nuair-a

Tá lúb níos simplí ar fháil freisin, le ainm `nuair-a`. Féach ar seo mar shampla

```
x := 0
nuair-a x < 5 {
    scríobh(x)
    x = x + 1
}
```

Faighimid `0, 1, 2, 3, 4`. Ar dtús seicealann an lúb an tearma tar éis `nuair-a`, má bhfuil sé fíor, leanann sé na treoracha sa lúb, agus téann sé ar ais go dtí an tús. Nuair a nach bhfuil sé fíor, briseann sé amach as an lúb. Sa sampla sin, téann sé tríd an lúb 5 uair, agus ansin tá `x == 6`, go háirithe níl `x < 5`, agus mar sin, tá an lúb críochnaithe.

### bris & chun-cinn

Sa dá lúb sin, `le idir` agus `nuair-a`, is feidir leat na treoracha `bris` agus `chun-cinn` a úsaid. Deanann `bris` díreach an rud a deireann sé, briseann sé amach as an lúb. Má leanann Setanta an treoir sin, stop sé an lúb agus leanann sé ar aghaidh tar éis an lúb.

```
x := 0
nuair-a x < 100 {
    má x == 10
        bris
    scríobh(x)
}
```
Scríobhann an lúb seo `0 1 2 3 4 5 6 7 8 9`, agus ansin tá `x == 10` agus brisimid as an lúb.

Deanann `chun-cinn` rud difriúil. Leanann `chun-cinn` díreach go dtí barr an lúb, agus tosaíonn sé leis an gcéad ceann eile. Mar shampla

```
le i idir (-10, 10) {
    má i < 0
        chun-cinn
    scríobh(i)
}
```

Scríobhann an lúb seo `0 1 2 3 4 5 6 7 8 9` mar le gach `i < 0`, leantar an treoir `chun-cinn` agus tosaímid leis an gcéad uimhir eile.
