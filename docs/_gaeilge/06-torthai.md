---
layout: single
title: Torthaí
toc: true
---

## Gníomhartha le torthaí

Chun torthaí a mhínigh, féachfaimid ar cúpla gníomhartha a thagann le Setanta. Mar shampla, tagann Setanta leis an gníomh `fad`. Úsáideann tú `fad` chun fad liosta nó litreacha a fháil.

```
liosta := [0, 1, 2]
scríobh(fad(liosta)) >-- Scríobhann sé seo "3"

ainm := 'Cú Chulainn'
scríobh(fad(ainm)) >-- Scríobhann sé seo "11"
```

Nuair a úsáideann tú `fad` faigheann tú toradh ar ais, go háirithe fad an liosta nó fad an `litreacha`.

Mar an gcéanna, tá toradh ag an gníomh `go_uimh`. Úsáideann tú `go_uimh` chun litreacha a aistriú go huimhir. Mar shampla:

```
go_uimh('123') == 123
```

Is é `123` toradh an ghnímh `go_uimh`.

## Ár dtorthaí féin

Is léir go bhfuil torthaí an-úsáideach. Is féidir linn gníomhartha le torthaí a cruthú leis an bhfocal `toradh`. Abair gur mhaith linn gníomh a cruthú chun dhá uimhir a shuimiú. Is féidir linn é seo a scríobh:

```
gníomh suim(a, b) {
    toradh a + b
}
```

Anois nuair a glaoimid ar `suim` le `suim(a, b)`, faighimid ar ais `a + b`. Bain triail as anois!

![An gníomh suim](/assets/images/teagaisc/suimgniomh.png)

## Sampla níos casta

Anois meascaimid lúba, gníomhartha agus torthaí chun gníomh a cruthú chun gach uimhir i liosta a shuimiú.

Ar dtús cruthaímid creatlach an ghnímh:

```
gníomh suimLiosta(liosta) {
}
```

Anois teastaíonn uainn dul thar gach uimhir san athróg `liosta`. Caithimid lúb a úsáid chun dul ó thús an liosta go dtí an deireadh. Ar dtús féachaimid ar `liosta[0]`, ansin `liosta[1]`, `liosta[2]` etc. go dtí an deireadh. Úsáidimid `fad` chun fad an liosta a fháil.

```
gníomh suimLiosta(liosta) {
    le i idir (0, fad(liosta)) {
        
    }
}
```

Anois cruthaímid athróg chun an suim a stóráil.

```
gníomh suimLiosta(liosta) {
    suim := 0
    le i idir (0, fad(liosta)) {
        
    }
}
```

Anois, sa lúb, nuair atáimid ag féachaint ar an uimhir an liosta san áit `i`, suimímid `liosta[i]` agus an athróg `suim` le chéile agus cuirimid an toradh ar ais i `suim`.

```
gníomh suimLiosta(liosta) {
    suim := 0
    le i idir (0, fad(liosta)) {
        suim = suim + liosta[i]
    }
}
```

Nuair atá an lúb críochnaithe is é suim an liosta iomlán an luach atá san athróg `suim`. Anois níl aon rud le déanamh ach cuir an luach sin i dtoradh an ghnímh leis an focal `toradh`.

```
gníomh suimLiosta(liosta) {
    suim := 0
    le i idir (0, fad(liosta)) {
        suim = suim +  liosta[i]      
    }
    toradh suim
}
```

Anois is féidir linn bain triail as an gníomh. Úsáid é chun an liosta `[1, 2, 3, 4]` a shuimiú le `suimLiosta([1, 2, 3, 4])` agus féach ar an toradh. Faighimid 10, mar tá 1 + 2 + 3 + 4 cothrom le 10.

![Oibríonn suimLiosta](/assets/images/teagaisc/oibrionnSuimLiosta.png)
