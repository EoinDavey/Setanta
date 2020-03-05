---
layout: single
title: Setanta 101
toc: true
---

## Matamaitic

Is féidir le Setanta matamaitic a dhéanamh.
Clóscríobh `scríobh(2 * 3)` isteach san eagarthóir, cliceáil ar "Tosaigh" agus féach ar an gconsól. Beidh `6` scríofa ansin.
![6](/assets/images/teagaisc/teagaisc06.png)

Féach cad a scríobhann an ríomhchlár seo

```
scríobh(2 + 2)
scríobh(4 * (2 + 3))
scríobh(5 == 5)
scríobh(5 == 6)
scríobh(5 != 6)
```

Tá sé seo sa chonsól.


```
4
20
fíor
bréag
fíor
```

Go háirithe, tabhair faoi deara gur déanann `==` agus `!=` comparáid idir uimhreacha (agus rudaí eile).

## Litreacha

Is féidir leat frasaí a scríobh freisin, chonaiceamar é seo roimhe seo leis an ríomhchlár simplí
```
scríobh('Dia duit')
```

Tugaimid "litreacha" ar na frasaí sin. Cruthaíonn tú litreacha le dhá `'`. Mar shampla
```
'Dia duit'
'Is mise Eoin'
```

Is féidir leat `+` a úsáid chun litreacha a cheangail le chéile

```
scríobh('Dia duit' + ', ' + 'Eoin is ainm dom')
```

Scríobhann sé seo `Dia duit, Eoin is ainm dom`.

## Tráchtanna

Má scríobhann tú an siombail `>--` i do ríomhchlár, Is trácht é aon rud a scríobhann tú tar éis é sin ar an líne chéanna, agus ní cuid den ríomhchlár é. Mar shampla

```
scríobh('Dia duit') >-- Is féidir liom aon rud a scríobh anseo!
>-- Nó anseo freisin.
```

Tá tráchtanna an úsáideach mar ceadaíonn sé dúinn nótaí a scríobh inár gcuid ríomhchláir.

## Athróga

Is féidir le Setanta luachanna a chuimhnigh. Mar shampla, cuir an cód seo san eagarthóir agus rith é:

```
x := 10
scríobh(x * 2)
```

Scríobhann sé `20` amach sa chonsól.

Sá ríomhchlár seo is **athróg** é `x`. Is féidir linn athróga a úsáid i ngach áit a úsáidimid uimhreacha nó litreacha.

Cruthaímid athróg nua le `:=`

Táimid in ann an luach san athróg `x` a athrú le `=`.

```
x := 10 >-- athróg nua le luach 10
x = x + 10 >-- Anois tá x == 20
```

Anois tá `x` cothrom le 20. Cad a scríobhann an ríomhchlár seo?

```
x := 10
y := 2 * x >-- Cruthaigh athróg nua 'y' le luach 20
x = y + x >-- Athraigh an athróg 'x' go 'x + y' = 10 + 20 = 30
scríobh(x)
```

Is féidir linn athróga a úsáid chun rudaí a tarraingt ar an stáitse freisin. Cuir an cód a leanas san eagarthóir:

```
mo_dhath := 'dearg' >-- Athraigh an athróg seo chun dath na ciorcail a athrú.

dath@stáitse(mo_dhath)

>-- Cruthaigh na athróga 'x', 'y', agus 'ga'
x := 100
y := 100
ga := 40

ciorcal@stáitse(x, y, ga) >-- Tarraing an chéad chiorcal

x = x + 100 >-- Athraigh 'x' go 200
y = y + 100 >-- Athraigh 'y' go 200
ga = ga * 2 >-- Athraigh 'ga' go 80

ciorcal@stáitse(x, y, ga) >-- Tarraing an dara ciorcal
```

![Dhá ciorcal](/assets/images/teagaisc/dhaciorcal.gif)

## Anois
D'fhoghlaim tú a lán rudaí nua, téigh go dtí an [chéad leathanach eile](/gaeilge/04-ma-lub) chun foghlaim faoi `má` agus lúba.
