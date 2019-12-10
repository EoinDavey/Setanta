gníomh triail(x, freagair) {
    má x <= 2 {
        freagair(x == 2)
    } nó {
        príomha := fíor
        le i idir(2, x - 1) {
            má i*i > x
                bris
            má x % i == 0 {
                príomha = breag
                bris
            }
        }
        freagair(príomha)
    }
}

le i idir (2, 100) {
    príomha := breag
    gníomh f(x) {
        príomha = x
    }
    triail(i, f)
    má príomha
        scríobh(i)
}
