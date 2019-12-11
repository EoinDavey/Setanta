gníomh triail(x) {
    má x <= 2
        toradh x == 2
    le i idir(2, x) {
        má i*i > x
            bris
        má x % i == 0
            toradh breag
    }
    toradh fíor
}

le i idir (2, 100) {
    má triail(i)
        scríobh(i)
}
