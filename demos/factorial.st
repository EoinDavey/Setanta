gníomh fac(x, set) {
    má x <= 1 {
        set(1)
    } nó {
        res := 0
        gníomh in_set(x) {
            res = x
        }
        fac(x - 1, in_set)
        set(x * res)
    }
}

fac(10, scríobh)
