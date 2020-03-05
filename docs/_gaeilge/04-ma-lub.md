---
layout: single
title: Má agus lúba
toc: true
---
## Má ... nó ...

Is féidir leat rogha a dhéanamh i do ríomhchlár! Úsáidimid an focal `má` chun seiceáil a dhéanamh, agus ansin rogha a dhéanamh le toradh an seiceáil. Féach ar an ríomhchlár seo.

```
aois := 14
má aois >= 13 & aois <= 19
    scríobh('Is déagóir thú')
nó
    scríobh('Ní déagóir thú')
```

Seiceálann an ríomhchlár seo go bhfuil `aois` idir 13 agus 14. Má tá sé fíor, scríobhann sé 'Is déagóir thú', mura bhfuil sé fíor scríobhann sé 'Ní déagóir thú'.

Is féidir linn an struchtúr seo a úsáid arís is arís, mar seo

```
má ainm == 'Oisín'
    scríobh('Oisin, tar liomsa go Tír na nÓg')
nó má ainm == 'Fionn'
    scríobh('Dia duit Fionn, an bhfuil Oisín anseo?')
nó
    scríobh('Tá brón orm, Níl aithne agam ort')
```

Úsáid `{` agus `}` chun grúpa treoracha a cruthú.

```
má x == 6 {
    scríobh(x)
    scríobh(2 * x)
} nó {
    scríobh(x)
    scríobh(3 * x)
}
```

**Is féidir leat `ma` agus `no` a úsaid mura féidir leat 'á' nó 'ó' a chlóscríobh.**

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

Is féidir leat uimhir eile a chur idir na lúibíní chun an céim a athrú. Mar shampla

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

Faighimid `0, 1, 2, 3, 4`. Ar dtús seiceálann an lúb an téarma tar éis `nuair-a`, má bhfuil sé fíor, leanann sé na treoracha sa lúb, agus téann sé ar ais go dtí an tús. Nuair a nach bhfuil sé fíor, briseann sé amach as an lúb. Sa sampla sin, téann sé tríd an lúb 5 uair, agus ansin tá `x == 6`, go háirithe níl `x < 5`, agus mar sin, tá an lúb críochnaithe.

### bris & chun-cinn

Sa dá lúb sin, `le idir` agus `nuair-a`, is féidir leat na treoracha `bris` agus `chun-cinn` a úsáid. Déanann `bris` díreach an rud a deir sé, briseann sé amach as an lúb. Má leanann Setanta an treoir sin, stop sé an lúb agus leanann sé ar aghaidh tar éis an lúb.

```
x := 0
nuair-a x < 100 {
    má x == 10
        bris
    scríobh(x)
}
```
Scríobhann an lúb seo `0 1 2 3 4 5 6 7 8 9`, agus ansin tá `x == 10` agus brisimid as an lúb.

Déanann `chun-cinn` rud difriúil. Téann `chun-cinn` díreach go dtí barr an lúb, agus tosaíonn sé leis an gcéad ceann eile. Mar shampla

```
le i idir (-10, 10) {
    má i < 0
        chun-cinn
    scríobh(i)
}
```

Scríobhann an lúb seo `0 1 2 3 4 5 6 7 8 9` mar le gach `i < 0`, leantar an treoir `chun-cinn` agus tosaímid leis an gcéad uimhir eile.
