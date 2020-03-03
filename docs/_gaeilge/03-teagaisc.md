---
layout: single
title: Teagaisc
toc: true
---

## Matamaitic

Is féidir le Setanta matamaitic a dhéanamh.
Clóscríobh `scríobh(2 * 3)` isteach san eagrathóir, cliceáil ar "Tosaigh" agus féach ar an gconsól. Beidh `6` scríofa ansin.
![6](/assets/images/teagaisc/teagaisc06.png)

Féach cad a scríobhann an ríomhchlár seo

```
scríobh(2 + 2)
scríobh(4 * (2 + 3))
scríobh(5 == 5)
scríobh(5 == 6)
scríobh(5 != 6)
```

Tá se seo sa chonsól.


```
4
20
fíor
bréag
fíor
```

Go háirithe, tug faoi deara gur déanann `==` agus `!=` comparáid idir uimhreacha (agus rudaí eile).

## Litreacha

Is féidir leat frasaí a scríobh freisin, chonaiceamar é seo roimhe seo leis an ríomchlár simplí
```
scríobh('Dia duit')
```

Tugaimid "litreacha" ar na frasaí sin. Cruthaíonn tú litreacha le dhá `'`. Mar shampla
```
'Dia duit'
'Is mise Eoin'
```

Is féidir leat `+` a úsaid chun litreacha a cheangail le chéile

```
scríobh('Dia duit' + ', ' + 'Eoin is ainm dom')
```

Scríobhann sé seo `Dia duit, Eoin is ainm dom`.

## Athróga

Is féidir le Setanta luachanna a chuimhnigh. Mar shampla, cuir an ríomhchlár seo san eagrathóir.

```
x := 10
scríobh(x * 2)
```

Scríobhann sé `20` amach sa chonsól.

Sá ríomhchlár seo is **athróg** é `x`. Is feidir linn athróga a úsaid i ngach áit a úsaidimid uimhreacha nó litreacha. Cruthaimid athróg nua le `:=`

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

Tóg an ríomchlár a leanas agus cur d'ainm féin isteach san athróg `ainm`

```
ainm := 'd'ainm anseo'
scríobh('Dia duit ' + ainm)
```

## Anois
D'fhoghlaim tú a lán rudaí nua, téigh go dtí an [chéad leathanach eile](/gaeilge/04-ma-lub) chun foghlaim faoi `má` agus lúba.
