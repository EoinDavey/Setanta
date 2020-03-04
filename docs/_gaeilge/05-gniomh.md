---
layout: single
title: Gníomhartha
toc: true
---

Sa teagaisc seo, bhíomar agus úsaid an focal `scríobh` chun rudaí a scríobh amach ar an gconsól. Tugaimid "gníomhartha" ar `scríobh` agus a lán rudaí cosúil leis.

Mar shampla scríobh an ríomchlár seo isteach san eagarthóir.

```
ainm := ceist('Cad is ainm duit?')
scríobh('Dia duit ' + ainm)
```

Rith an ríomchlár sin, agus clóscríobh d'ainm isteach sa chonsól agus brúigh an eochar iontrála.

![Scríobh d'ainm](/assets/images/teagaisc/teagaisc07.png)

Seo é an toradh:

![Dia duit Eoin](/assets/images/teagaisc/ainm.gif)

Is sampla eile de gníomhartha é `ceist`, is féidir leat `ceist` a úsáid chun ceist a chur, agus an freagair a sábháil i athróg éigin.

## Ag cruthú ár ngníomhartha féin

Is féidir linn ár ngníomhartha féin a cruthú, déanaimid é sin nuair ba mhaith linn rud éigin a dhéanamh i roinnt áiteann sa ríomhchlár.

Mar shampla. Abair gur mhaith leat gach uimhir idir 1 agus 100 a suimiú. Scríobhfá ríomhchlár cosúil le seo

```
suim := 0
le i idir (1, 101)
	suim += i
scríobh(suim)
```

Ach cad a scríobhfá dá ba mhaith leat é sin a dheanamh le gach uimhir idir 1 & 200, 1 & 300, agus 1 & 400. Beidh ríomhchlár an fhada agat mar seo

```
suim := 0
le i idir (1, 101)
	suim += i
scríobh(suim)

suim = 0
le i idir (1, 201)
	suim += i
scríobh(suim)

suim = 0
le i idir (1, 301)
	suim += i
scríobh(suim)

suim = 0
le i idir (1, 401)
	suim += i
scríobh(suim)
```

Bheadh tú ag scríobh an rud cheanna arís 's arís. Áfach, is féidir linn gníomhartha a úsáid leis an focal `gníomh`. Féach ar an sampla seo:

```
gníomh diaDuit() {
    scríobh('Dia duit')
}

diaDuit()
```

Is gníomh é `diaDuit`, nuair a úsaideann tú `diaDuit` le `diaDuit()`, scríobhann sé "Dia duit" amach ar an gconsól. Bain triail as é sin anois!

Ag dul ar ais go dtí an sampla a bhí a phlé againn níos luaithe, bhíomar ag caint faoi ag suimiú na uimhreacha idir 1 agus 100, 200, 300 agus 400. Anois is féidir linn baint a úsáid as gníomhartha.

```
gníomh suimGoN(n) {
    suim := 0
    le i idir (1, n + 1)
        suim += i
    scríobh(suim)
}
suimGoN(100)
suimGoN(200)
suimGoN(300)
suimGoN(400)
```

Sin i bhfad níos lú cód!

## Argóintí

Tá **argóint** amháin ag an gníomh `suimGoN`, go háirithe an uimhir `n`.
Tógann an gníomh an argóint agus cuireann sé an luach san athróg istigh den ghníomh.

Is féidir leat níos mó na argóint amháin a úsaid. Féach ar an cód seo:

```
gníomh scríobhIsMó(a, b) {
    má b > a
        scríobh(b)
    nó
        scríobh(a)
}
```

Tógann an gníomh `scríobhIsMó` dhá argóint, `a` agus `b`, agus scríobhann sé amach an ceann is mó. Mar shampla scríobhann `scríobhIsMo(3, 5)` 5 amach ar an gconsól.
