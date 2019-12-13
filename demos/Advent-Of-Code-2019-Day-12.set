mns := [
    [-7,17,-11],
    [9, 12, 5],
    [-9, 0, -4],
    [4, 6, 0]
]

vs := [
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0]
]

gníomh ad(x, y) {
    n := [0,0,0]
    le i idir (0, 3)
        n[i] = x[i] + y[i]
    toradh n
}

gníomh cmp(x, y) {
    má x == y
        toradh 0
    má x > y
        toradh -1
    toradh 1
}

gníomh abs(x) {
    má x > 0
        toradh x
    toradh -1 * x
}

gníomh gcd(a, b) {
    nuair a b != 0 {
        t := a % b
        a = b
        b = t
    }
    toradh a
}

le t idir (0, 1000) {
    le a idir (0, 4){
        le b idir (0, a) {
            le i idir (0, 3) {
                df := cmp(mns[a][i], mns[b][i])
                vs[a][i] = vs[a][i] + df
                vs[b][i] = vs[b][i] - df
            }
        }
    }
    le k idir (0, 4){
        mns[k] = ad(mns[k], vs[k])
    }
}

sm := 0
le m idir (0, 4) {
    vsm := 0
    psm := 0
    le i idir(0, 3) {
        vsm = vsm + abs(vs[m][i])
        psm = psm + abs(mns[m][i])
    }
    sm = sm + vsm*psm
}
scríobh(sm)

mns = [
    [-7,17,-11],
    [9, 12, 5],
    [-9, 0, -4],
    [4, 6, 0]
]

vs = [
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0]
]

tms := [0,0,0]

le i idir (0, 3) {
    ps := [mns[0][i], mns[1][i], mns[2][i], mns[3][i]]
    vs := [0,0,0,0]
    t := 0
    nuair a fíor {
        t = t + 1
        le a idir (0, 4){
            le b idir (0, a) {
                df := cmp(ps[a], ps[b])
                vs[a] = vs[a] + df
                vs[b] = vs[b] - df
            }
        }
        le i idir (0, 4)
            ps[i] = ps[i] + vs[i]
        má vs == [0,0,0,0] {
            tms[i] = 2*t
            bris
        }
    }
}

st := tms[0]
le i idir (1, 3)
    st = (st*tms[i])/gcd(st,tms[i])
scríobh(st)
