// noinspection JSSuspiciousNameCombination

// Source - https://stackoverflow.com/a/3710367
// Posted by cHao, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-01, License - CC BY-SA 3.0

try {
    Object.defineProperty(Object.prototype, 'can', {
        enumerable: false,
        value: function(method) {
            return (typeof this[method] === 'function');
        }
    })
} catch (e) {
    console.warn(e)
}

export class MatrixLike {
    getAt(x, y) { return 0 }
    setAt(val, x, y) {}
    throwIfOutside(x, y) {
        let dim = this.matrixDimensions
        if (x < 0) throw RangeError("row < 0")
        if (x >= dim.x) throw RangeError(`row > ${dim.x}`)
        if (y < 0) throw RangeError("column < 0")
        if (y >= dim.y) throw RangeError(`column > ${dim.y}`)
    }

    matrixGet(x, y) {
        this.throwIfOutside(x, y)
        return this.getAt(x, y)
    }

    matrixSet(val, x, y) {
        if (typeof val !== "number") throw TypeError(`number expected, got ${typeof val}`)
        this.throwIfOutside(x, y)
        return this.setAt(val, x, y)
    }

    matrixDimensions() { return new Vec2(0, 0)}

    static mul(A, B) {
        if (!(A.can("matrixGet") && A.can("matrixDimensions"))) throw TypeError(`MatrixLike expected for A, got ${typeof A}`)
        if (!(B.can("matrixGet") && B.can("matrixDimensions"))) throw TypeError(`MatrixLike expected for B, got ${typeof B}`)
        let dimA = A.matrixDimensions()
        let dimB = B.matrixDimensions()
        if (dimA.y !== dimB.x) throw Error(`Matrix of size ${dimA.x}x${dimA.y} can't be multiplied by matrix of size ${dimB.x}x${dimB.y}`)
        let common = dimA.y
        let dimO = new Vec2(dimA.x, dimB.y)
        let out
        if (dimO.x === 4 && dimO.y === 4) out = Matrix4.of(0)
        else if (dimO.y === 1) {
            if (dimO.x === 4) out = Vec4.zero
            else if (dimO.x === 3) out = Vec3.zero
            else if (dimO.x === 2) out = Vec2.zero
            else out = new VariableMatrix(0.0, dimA.x, dimB.y)
        } else out = new VariableMatrix(0.0, dimA.x, dimB.y)

        for (let i = 0; i < dimO.x; i++) {
            for (let j = 0; j < dimO.y; j++) {
                let v = 0
                for (let k = 0; k < common; k++) {
                    v += A.matrixGet(i, k) * B.matrixGet(k, j)
                }
                out.matrixSet(v, i, j)
            }
        }
        return out
    }
}

export class Vec2 extends MatrixLike {
    _x
    _y

    getAt(x, y) { if (x === 0) return this._x; else return this._y }
    setAt(val, x, y) { if (x === 0) this._x = val; else this._y = val }

    matrixDimensions() { return new Vec2(2, 1) }

    get x() { return this._x }
    set x(x) { if (typeof x === "number") this._x = x; else throw TypeError(`number expected, got ${typeof x}`) }
    get y() { return this._y }
    set y(y) { if (typeof y === "number") this._y = y; else throw TypeError(`number expected, got ${typeof y}`) }
    get u() { return this._x }
    set u(u) { if (typeof u === "number") this._x = u; else throw TypeError(`number expected, got ${typeof u}`) }
    get v() { return this._y }
    set v(v) { if (typeof v === "number") this._y = v; else throw TypeError(`number expected, got ${typeof v}`) }

    get xx() { return new Vec2(this._x, this._x)}
    get xy() { return new Vec2(this._x, this._y)}
    get yx() { return new Vec2(this._y, this._x)}
    get yy() { return new Vec2(this._y, this._y)}

    get uu() { return new Vec2(this._x, this._x)}
    get uv() { return new Vec2(this._x, this._y)}
    get vu() { return new Vec2(this._y, this._x)}
    get vv() { return new Vec2(this._y, this._y)}

    set xy(xy) { if(xy instanceof Vec2) {this._x = xy.x; this._y = xy.y; } else if (typeof xy === "number") this._x = this._y = xy; else throw TypeError(`Vec2 or number expected, got ${typeof xy}`)}
    set yx(yx) { if(yx instanceof Vec2) {this._y = yx.x; this._x = yx.y; } else if (typeof yx === "number") this._y = this._x = yx; else throw TypeError(`Vec2 or number expected, got ${typeof yx}`)}

    set uv(uv) { if(uv instanceof Vec2) {this._x = uv.x; this._y = uv.y; } else if (typeof uv === "number") this._x = this._y = uv; else throw TypeError(`Vec2 or number expected, got ${typeof uv}`)}
    set vu(vu) { if(vu instanceof Vec2) {this._y = vu.x; this._x = vu.y; } else if (typeof vu === "number") this._y = this._x = vu; else throw TypeError(`Vec2 or number expected, got ${typeof vu}`)}

    get xxx() { return new Vec3(this._x, this._x, this._x)}
    get xxy() { return new Vec3(this._x, this._x, this._y)}
    get xyx() { return new Vec3(this._x, this._y, this._x)}
    get xyy() { return new Vec3(this._x, this._y, this._y)}
    get yxx() { return new Vec3(this._y, this._x, this._x)}
    get yxy() { return new Vec3(this._y, this._x, this._y)}
    get yyx() { return new Vec3(this._y, this._y, this._x)}
    get yyy() { return new Vec3(this._y, this._y, this._y)}

    get uuu() { return new Vec3(this._x, this._x, this._x)}
    get uuv() { return new Vec3(this._x, this._x, this._y)}
    get uvu() { return new Vec3(this._x, this._y, this._x)}
    get uvv() { return new Vec3(this._x, this._y, this._y)}
    get vuu() { return new Vec3(this._y, this._x, this._x)}
    get vuv() { return new Vec3(this._y, this._x, this._y)}
    get vvu() { return new Vec3(this._y, this._y, this._x)}
    get vvv() { return new Vec3(this._y, this._y, this._y)}

    get xxxx() { return new Vec4(this._x, this._x, this._x, this._x) }
    get xxxy() { return new Vec4(this._x, this._x, this._x, this._y) }
    get xxyx() { return new Vec4(this._x, this._x, this._y, this._x) }
    get xxyy() { return new Vec4(this._x, this._x, this._y, this._y) }
    get xyxx() { return new Vec4(this._x, this._y, this._x, this._x) }
    get xyxy() { return new Vec4(this._x, this._y, this._x, this._y) }
    get xyyx() { return new Vec4(this._x, this._y, this._y, this._x) }
    get xyyy() { return new Vec4(this._x, this._y, this._y, this._y) }
    get yxxx() { return new Vec4(this._y, this._x, this._x, this._x) }
    get yxxy() { return new Vec4(this._y, this._x, this._x, this._y) }
    get yxyx() { return new Vec4(this._y, this._x, this._y, this._x) }
    get yxyy() { return new Vec4(this._y, this._x, this._y, this._y) }
    get yyxx() { return new Vec4(this._y, this._y, this._x, this._x) }
    get yyxy() { return new Vec4(this._y, this._y, this._x, this._y) }
    get yyyx() { return new Vec4(this._y, this._y, this._y, this._x) }
    get yyyy() { return new Vec4(this._y, this._y, this._y, this._y) }

    get uuuu() { return new Vec4(this._x, this._x, this._x, this._x) }
    get uuuv() { return new Vec4(this._x, this._x, this._x, this._y) }
    get uuvu() { return new Vec4(this._x, this._x, this._y, this._x) }
    get uuvv() { return new Vec4(this._x, this._x, this._y, this._y) }
    get uvuu() { return new Vec4(this._x, this._y, this._x, this._x) }
    get uvuv() { return new Vec4(this._x, this._y, this._x, this._y) }
    get uvvu() { return new Vec4(this._x, this._y, this._y, this._x) }
    get uvvv() { return new Vec4(this._x, this._y, this._y, this._y) }
    get vuuu() { return new Vec4(this._y, this._x, this._x, this._x) }
    get vuuv() { return new Vec4(this._y, this._x, this._x, this._y) }
    get vuvu() { return new Vec4(this._y, this._x, this._y, this._x) }
    get vuvv() { return new Vec4(this._y, this._x, this._y, this._y) }
    get vvuu() { return new Vec4(this._y, this._y, this._x, this._x) }
    get vvuv() { return new Vec4(this._y, this._y, this._x, this._y) }
    get vvvu() { return new Vec4(this._y, this._y, this._y, this._x) }
    get vvvv() { return new Vec4(this._y, this._y, this._y, this._y) }

    constructor(x, y) {
        super()
        if (x instanceof Vec2) {
            this._x = x.x
            this._y = x.y
            if (y !== undefined) console.warn(`Vec2 constructed from Vec2, but extra argument present: ${y}`)
            return
        }
        if (typeof x === "number" && typeof y === "number") {
            this._x = x;
            this._y = y;
            return;
        }
        throw TypeError(`Wrong types of X and/or Y: ${typeof x}, ${typeof y}`)
    }

    plus(other)     { if (other instanceof Vec2) return new Vec2(this._x + other.x, this._y + other.y); else if (typeof other === "number") return new Vec2(this._x + other, this._y + other); else throw TypeError(`Vec2 or number expected, got ${typeof other}`)}
    minus(other)    { if (other instanceof Vec2) return new Vec2(this._x - other.x, this._y - other.y); else if (typeof other === "number") return new Vec2(this._x - other, this._y - other); else throw TypeError(`Vec2 or number expected, got ${typeof other}`)}
    times(other)    { if (other instanceof Vec2) return new Vec2(this._x * other.x, this._y * other.y); else if (typeof other === "number") return new Vec2(this._x * other, this._y * other); else throw TypeError(`Vec2 or number expected, got ${typeof other}`)}
    divide(other)   { if (other instanceof Vec2) return new Vec2(this._x / other.x, this._y / other.y); else if (typeof other === "number") return new Vec2(this._x / other, this._y / other); else throw TypeError(`Vec2 or number expected, got ${typeof other}`)}
    exponent(other) { if (other instanceof Vec2) return new Vec2(this._x ** other.x, this._y ** other.y); else if (typeof other === "number") return new Vec2(this._x ** other, this._y ** other); else throw TypeError(`Vec2 or number expected, got ${typeof other}`)}

    toString() {
        return `Vec2(${this._x}, ${this._y})`
    }
}

export class Vec3 extends Vec2 {
    _z

    getAt(x, y) { if (x === 0) return this._x; else if (x === 1) return this._y; else return this._z }
    setAt(val, x, y) { if (x === 0) this._x = val; else if (x === 1) this._y = val; else this._z = val }

    matrixDimensions() { return new Vec2(3, 1) }

    get z() { return this._z }
    set z(z) { if (typeof z === "number") this._z = z; else throw TypeError(`Z is not a number`) }

    get r() { return this._x }
    set r(r) { if (typeof r === "number") this._x = r; else throw TypeError(`R is not a number`) }
    get g() { return this._y }
    set g(g) { if (typeof g === "number") this._y = g; else throw TypeError(`G is not a number`) }
    get b() { return this._z }
    set b(b) { if (typeof b === "number") this._z = b; else throw TypeError(`B is not a number`) }

    get xz() { return new Vec2(this._x, this._z)}
    get yz() { return new Vec2(this._y, this._z)}
    get zx() { return new Vec2(this._z, this._x)}
    get zy() { return new Vec2(this._z, this._y)}
    get zz() { return new Vec2(this._z, this._z)}

    get rr() { return new Vec2(this._x, this._x)}
    get rg() { return new Vec2(this._x, this._y)}
    get rb() { return new Vec2(this._x, this._z)}
    get gr() { return new Vec2(this._y, this._x)}
    get gg() { return new Vec2(this._y, this._y)}
    get gb() { return new Vec2(this._y, this._z)}
    get br() { return new Vec2(this._z, this._x)}
    get bg() { return new Vec2(this._z, this._y)}
    get bb() { return new Vec2(this._z, this._z)}

    set xz(xz) { if(xz instanceof Vec2) {this._x = xz.x; this._z = xz.y; } else if (typeof xz === "number") this._x = this._z = xz; else throw TypeError(`Vec2 or number expected, got ${typeof xz}`)}
    set yz(yz) { if(yz instanceof Vec2) {this._y = yz.x; this._z = yz.y; } else if (typeof yz === "number") this._y = this._z = yz; else throw TypeError(`Vec2 or number expected, got ${typeof yz}`)}
    set zx(zx) { if(zx instanceof Vec2) {this._z = zx.x; this._x = zx.y; } else if (typeof zx === "number") this._z = this._x = zx; else throw TypeError(`Vec2 or number expected, got ${typeof zx}`)}
    set zy(zy) { if(zy instanceof Vec2) {this._z = zy.x; this._y = zy.y; } else if (typeof zy === "number") this._z = this._y = zy; else throw TypeError(`Vec2 or number expected, got ${typeof zy}`)}

    set rg(rg) { if(rg instanceof Vec2) {this._x = rg.x; this._y = rg.y; } else if (typeof rg === "number") this._x = this._y = rg; else throw TypeError(`Vec2 or number expected, got ${typeof rg}`)}
    set rb(rb) { if(rb instanceof Vec2) {this._x = rb.x; this._z = rb.y; } else if (typeof rb === "number") this._x = this._z = rb; else throw TypeError(`Vec2 or number expected, got ${typeof rb}`)}
    set gr(gr) { if(gr instanceof Vec2) {this._y = gr.x; this._x = gr.y; } else if (typeof gr === "number") this._y = this._x = gr; else throw TypeError(`Vec2 or number expected, got ${typeof gr}`)}
    set gb(gb) { if(gb instanceof Vec2) {this._y = gb.x; this._z = gb.y; } else if (typeof gb === "number") this._y = this._z = gb; else throw TypeError(`Vec2 or number expected, got ${typeof gb}`)}
    set br(br) { if(br instanceof Vec2) {this._z = br.x; this._x = br.y; } else if (typeof br === "number") this._z = this._x = br; else throw TypeError(`Vec2 or number expected, got ${typeof br}`)}
    set bg(bg) { if(bg instanceof Vec2) {this._z = bg.x; this._y = bg.y; } else if (typeof bg === "number") this._z = this._y = bg; else throw TypeError(`Vec2 or number expected, got ${typeof bg}`)}

    get xxz() { return new Vec3(this._x, this._x, this._z)}
    get xyz() { return new Vec3(this._x, this._y, this._z)}
    get xzx() { return new Vec3(this._x, this._z, this._x)}
    get xzy() { return new Vec3(this._x, this._z, this._y)}
    get xzz() { return new Vec3(this._x, this._z, this._z)}
    get yxz() { return new Vec3(this._y, this._x, this._z)}
    get yyz() { return new Vec3(this._y, this._y, this._z)}
    get yzx() { return new Vec3(this._y, this._z, this._x)}
    get yzy() { return new Vec3(this._y, this._z, this._y)}
    get yzz() { return new Vec3(this._y, this._z, this._z)}
    get zxx() { return new Vec3(this._z, this._x, this._x)}
    get zxy() { return new Vec3(this._z, this._x, this._y)}
    get zxz() { return new Vec3(this._z, this._x, this._z)}
    get zyx() { return new Vec3(this._z, this._y, this._x)}
    get zyy() { return new Vec3(this._z, this._y, this._y)}
    get zyz() { return new Vec3(this._z, this._y, this._z)}
    get zzx() { return new Vec3(this._z, this._z, this._x)}
    get zzy() { return new Vec3(this._z, this._z, this._y)}
    get zzz() { return new Vec3(this._z, this._z, this._z)}

    get rrr() { return new Vec3(this._x, this._x, this._x)}
    get rrg() { return new Vec3(this._x, this._x, this._y)}
    get rrb() { return new Vec3(this._x, this._x, this._z)}
    get rgr() { return new Vec3(this._x, this._y, this._x)}
    get rgg() { return new Vec3(this._x, this._y, this._y)}
    get rgb() { return new Vec3(this._x, this._y, this._z)}
    get rbr() { return new Vec3(this._x, this._z, this._x)}
    get rbg() { return new Vec3(this._x, this._z, this._y)}
    get rbb() { return new Vec3(this._x, this._z, this._z)}
    get grr() { return new Vec3(this._y, this._x, this._x)}
    get grg() { return new Vec3(this._y, this._x, this._y)}
    get grb() { return new Vec3(this._y, this._x, this._z)}
    get ggr() { return new Vec3(this._y, this._y, this._x)}
    get ggg() { return new Vec3(this._y, this._y, this._y)}
    get ggb() { return new Vec3(this._y, this._y, this._z)}
    get gbr() { return new Vec3(this._y, this._z, this._x)}
    get gbg() { return new Vec3(this._y, this._z, this._y)}
    get gbb() { return new Vec3(this._y, this._z, this._z)}
    get brr() { return new Vec3(this._z, this._x, this._x)}
    get brg() { return new Vec3(this._z, this._x, this._y)}
    get brb() { return new Vec3(this._z, this._x, this._z)}
    get bgr() { return new Vec3(this._z, this._y, this._x)}
    get bgg() { return new Vec3(this._z, this._y, this._y)}
    get bgb() { return new Vec3(this._z, this._y, this._z)}
    get bbr() { return new Vec3(this._z, this._z, this._x)}
    get bbg() { return new Vec3(this._z, this._z, this._y)}
    get bbb() { return new Vec3(this._z, this._z, this._z)}

    set xyz(xyz) { if(xyz instanceof Vec3) {this._x = xyz.x; this._y = xyz.y; this._z = xyz.z } else if (typeof xyz === "number") this._x = this._y = this._z = xyz; else throw TypeError(`Vec3 or number expected, got ${typeof xyz}`)}
    set xzy(xzy) { if(xzy instanceof Vec3) {this._x = xzy.x; this._z = xzy.y; this._y = xzy.z } else if (typeof xzy === "number") this._x = this._z = this._y = xzy; else throw TypeError(`Vec3 or number expected, got ${typeof xzy}`)}
    set yxz(yxz) { if(yxz instanceof Vec3) {this._y = yxz.x; this._x = yxz.y; this._z = yxz.z } else if (typeof yxz === "number") this._y = this._x = this._z = yxz; else throw TypeError(`Vec3 or number expected, got ${typeof yxz}`)}
    set yzx(yzx) { if(yzx instanceof Vec3) {this._y = yzx.x; this._z = yzx.y; this._x = yzx.z } else if (typeof yzx === "number") this._y = this._z = this._x = yzx; else throw TypeError(`Vec3 or number expected, got ${typeof yzx}`)}
    set zxy(zxy) { if(zxy instanceof Vec3) {this._z = zxy.x; this._x = zxy.y; this._y = zxy.z } else if (typeof zxy === "number") this._z = this._x = this._y = zxy; else throw TypeError(`Vec3 or number expected, got ${typeof zxy}`)}
    set zyx(zyx) { if(zyx instanceof Vec3) {this._z = zyx.x; this._y = zyx.y; this._x = zyx.z } else if (typeof zyx === "number") this._z = this._y = this._x = zyx; else throw TypeError(`Vec3 or number expected, got ${typeof zyx}`)}

    set rgb(rgb) { if(rgb instanceof Vec3) {this._x = rgb.x; this._y = rgb.y; this._z = rgb.z } else if (typeof rgb === "number") this._x = this._y = this._z = rgb; else throw TypeError(`Vec3 or number expected, got ${typeof rgb}`)}
    set rbg(rbg) { if(rbg instanceof Vec3) {this._x = rbg.x; this._z = rbg.y; this._y = rbg.z } else if (typeof rbg === "number") this._x = this._z = this._y = rbg; else throw TypeError(`Vec3 or number expected, got ${typeof rbg}`)}
    set grb(grb) { if(grb instanceof Vec3) {this._y = grb.x; this._x = grb.y; this._z = grb.z } else if (typeof grb === "number") this._y = this._x = this._z = grb; else throw TypeError(`Vec3 or number expected, got ${typeof grb}`)}
    set gbr(gbr) { if(gbr instanceof Vec3) {this._y = gbr.x; this._z = gbr.y; this._x = gbr.z } else if (typeof gbr === "number") this._y = this._z = this._x = gbr; else throw TypeError(`Vec3 or number expected, got ${typeof gbr}`)}
    set brg(brg) { if(brg instanceof Vec3) {this._z = brg.x; this._x = brg.y; this._y = brg.z } else if (typeof brg === "number") this._z = this._x = this._y = brg; else throw TypeError(`Vec3 or number expected, got ${typeof brg}`)}
    set bgr(bgr) { if(bgr instanceof Vec3) {this._z = bgr.x; this._y = bgr.y; this._x = bgr.z } else if (typeof bgr === "number") this._z = this._y = this._x = bgr; else throw TypeError(`Vec3 or number expected, got ${typeof bgr}`)}

    get xxxz() { return new Vec4(this._x, this._x, this._x, this._z) }
    get xxyz() { return new Vec4(this._x, this._x, this._y, this._z) }
    get xxzx() { return new Vec4(this._x, this._x, this._z, this._x) }
    get xxzy() { return new Vec4(this._x, this._x, this._z, this._y) }
    get xxzz() { return new Vec4(this._x, this._x, this._z, this._z) }
    get xyxz() { return new Vec4(this._x, this._y, this._x, this._z) }
    get xyyz() { return new Vec4(this._x, this._y, this._y, this._z) }
    get xyzx() { return new Vec4(this._x, this._y, this._z, this._x) }
    get xyzy() { return new Vec4(this._x, this._y, this._z, this._y) }
    get xyzz() { return new Vec4(this._x, this._y, this._z, this._z) }
    get xzxx() { return new Vec4(this._x, this._z, this._x, this._x) }
    get xzxy() { return new Vec4(this._x, this._z, this._x, this._y) }
    get xzxz() { return new Vec4(this._x, this._z, this._x, this._z) }
    get xzyx() { return new Vec4(this._x, this._z, this._y, this._x) }
    get xzyy() { return new Vec4(this._x, this._z, this._y, this._y) }
    get xzyz() { return new Vec4(this._x, this._z, this._y, this._z) }
    get xzzx() { return new Vec4(this._x, this._z, this._z, this._x) }
    get xzzy() { return new Vec4(this._x, this._z, this._z, this._y) }
    get xzzz() { return new Vec4(this._x, this._z, this._z, this._z) }
    get yxxz() { return new Vec4(this._y, this._x, this._x, this._z) }
    get yxyz() { return new Vec4(this._y, this._x, this._y, this._z) }
    get yxzx() { return new Vec4(this._y, this._x, this._z, this._x) }
    get yxzy() { return new Vec4(this._y, this._x, this._z, this._y) }
    get yxzz() { return new Vec4(this._y, this._x, this._z, this._z) }
    get yyxz() { return new Vec4(this._y, this._y, this._x, this._z) }
    get yyyz() { return new Vec4(this._y, this._y, this._y, this._z) }
    get yyzx() { return new Vec4(this._y, this._y, this._z, this._x) }
    get yyzy() { return new Vec4(this._y, this._y, this._z, this._y) }
    get yyzz() { return new Vec4(this._y, this._y, this._z, this._z) }
    get yzxx() { return new Vec4(this._y, this._z, this._x, this._x) }
    get yzxy() { return new Vec4(this._y, this._z, this._x, this._y) }
    get yzxz() { return new Vec4(this._y, this._z, this._x, this._z) }
    get yzyx() { return new Vec4(this._y, this._z, this._y, this._x) }
    get yzyy() { return new Vec4(this._y, this._z, this._y, this._y) }
    get yzyz() { return new Vec4(this._y, this._z, this._y, this._z) }
    get yzzx() { return new Vec4(this._y, this._z, this._z, this._x) }
    get yzzy() { return new Vec4(this._y, this._z, this._z, this._y) }
    get yzzz() { return new Vec4(this._y, this._z, this._z, this._z) }
    get zxxx() { return new Vec4(this._z, this._x, this._x, this._x) }
    get zxxy() { return new Vec4(this._z, this._x, this._x, this._y) }
    get zxxz() { return new Vec4(this._z, this._x, this._x, this._z) }
    get zxyx() { return new Vec4(this._z, this._x, this._y, this._x) }
    get zxyy() { return new Vec4(this._z, this._x, this._y, this._y) }
    get zxyz() { return new Vec4(this._z, this._x, this._y, this._z) }
    get zxzx() { return new Vec4(this._z, this._x, this._z, this._x) }
    get zxzy() { return new Vec4(this._z, this._x, this._z, this._y) }
    get zxzz() { return new Vec4(this._z, this._x, this._z, this._z) }
    get zyxx() { return new Vec4(this._z, this._y, this._x, this._x) }
    get zyxy() { return new Vec4(this._z, this._y, this._x, this._y) }
    get zyxz() { return new Vec4(this._z, this._y, this._x, this._z) }
    get zyyx() { return new Vec4(this._z, this._y, this._y, this._x) }
    get zyyy() { return new Vec4(this._z, this._y, this._y, this._y) }
    get zyyz() { return new Vec4(this._z, this._y, this._y, this._z) }
    get zyzx() { return new Vec4(this._z, this._y, this._z, this._x) }
    get zyzy() { return new Vec4(this._z, this._y, this._z, this._y) }
    get zyzz() { return new Vec4(this._z, this._y, this._z, this._z) }
    get zzxx() { return new Vec4(this._z, this._z, this._x, this._x) }
    get zzxy() { return new Vec4(this._z, this._z, this._x, this._y) }
    get zzxz() { return new Vec4(this._z, this._z, this._x, this._z) }
    get zzyx() { return new Vec4(this._z, this._z, this._y, this._x) }
    get zzyy() { return new Vec4(this._z, this._z, this._y, this._y) }
    get zzyz() { return new Vec4(this._z, this._z, this._y, this._z) }
    get zzzx() { return new Vec4(this._z, this._z, this._z, this._x) }
    get zzzy() { return new Vec4(this._z, this._z, this._z, this._y) }
    get zzzz() { return new Vec4(this._z, this._z, this._z, this._z) }

    get rrrr() { return new Vec4(this._x, this._x, this._x, this._x) }
    get rrrg() { return new Vec4(this._x, this._x, this._x, this._y) }
    get rrrb() { return new Vec4(this._x, this._x, this._x, this._z) }
    get rrgr() { return new Vec4(this._x, this._x, this._y, this._x) }
    get rrgg() { return new Vec4(this._x, this._x, this._y, this._y) }
    get rrgb() { return new Vec4(this._x, this._x, this._y, this._z) }
    get rrbr() { return new Vec4(this._x, this._x, this._z, this._x) }
    get rrbg() { return new Vec4(this._x, this._x, this._z, this._y) }
    get rrbb() { return new Vec4(this._x, this._x, this._z, this._z) }
    get rgrr() { return new Vec4(this._x, this._y, this._x, this._x) }
    get rgrg() { return new Vec4(this._x, this._y, this._x, this._y) }
    get rgrb() { return new Vec4(this._x, this._y, this._x, this._z) }
    get rggr() { return new Vec4(this._x, this._y, this._y, this._x) }
    get rggg() { return new Vec4(this._x, this._y, this._y, this._y) }
    get rggb() { return new Vec4(this._x, this._y, this._y, this._z) }
    get rgbr() { return new Vec4(this._x, this._y, this._z, this._x) }
    get rgbg() { return new Vec4(this._x, this._y, this._z, this._y) }
    get rgbb() { return new Vec4(this._x, this._y, this._z, this._z) }
    get rbrr() { return new Vec4(this._x, this._z, this._x, this._x) }
    get rbrg() { return new Vec4(this._x, this._z, this._x, this._y) }
    get rbrb() { return new Vec4(this._x, this._z, this._x, this._z) }
    get rbgr() { return new Vec4(this._x, this._z, this._y, this._x) }
    get rbgg() { return new Vec4(this._x, this._z, this._y, this._y) }
    get rbgb() { return new Vec4(this._x, this._z, this._y, this._z) }
    get rbbr() { return new Vec4(this._x, this._z, this._z, this._x) }
    get rbbg() { return new Vec4(this._x, this._z, this._z, this._y) }
    get rbbb() { return new Vec4(this._x, this._z, this._z, this._z) }
    get grrr() { return new Vec4(this._y, this._x, this._x, this._x) }
    get grrg() { return new Vec4(this._y, this._x, this._x, this._y) }
    get grrb() { return new Vec4(this._y, this._x, this._x, this._z) }
    get grgr() { return new Vec4(this._y, this._x, this._y, this._x) }
    get grgg() { return new Vec4(this._y, this._x, this._y, this._y) }
    get grgb() { return new Vec4(this._y, this._x, this._y, this._z) }
    get grbr() { return new Vec4(this._y, this._x, this._z, this._x) }
    get grbg() { return new Vec4(this._y, this._x, this._z, this._y) }
    get grbb() { return new Vec4(this._y, this._x, this._z, this._z) }
    get ggrr() { return new Vec4(this._y, this._y, this._x, this._x) }
    get ggrg() { return new Vec4(this._y, this._y, this._x, this._y) }
    get ggrb() { return new Vec4(this._y, this._y, this._x, this._z) }
    get gggr() { return new Vec4(this._y, this._y, this._y, this._x) }
    get gggg() { return new Vec4(this._y, this._y, this._y, this._y) }
    get gggb() { return new Vec4(this._y, this._y, this._y, this._z) }
    get ggbr() { return new Vec4(this._y, this._y, this._z, this._x) }
    get ggbg() { return new Vec4(this._y, this._y, this._z, this._y) }
    get ggbb() { return new Vec4(this._y, this._y, this._z, this._z) }
    get gbrr() { return new Vec4(this._y, this._z, this._x, this._x) }
    get gbrg() { return new Vec4(this._y, this._z, this._x, this._y) }
    get gbrb() { return new Vec4(this._y, this._z, this._x, this._z) }
    get gbgr() { return new Vec4(this._y, this._z, this._y, this._x) }
    get gbgg() { return new Vec4(this._y, this._z, this._y, this._y) }
    get gbgb() { return new Vec4(this._y, this._z, this._y, this._z) }
    get gbbr() { return new Vec4(this._y, this._z, this._z, this._x) }
    get gbbg() { return new Vec4(this._y, this._z, this._z, this._y) }
    get gbbb() { return new Vec4(this._y, this._z, this._z, this._z) }
    get brrr() { return new Vec4(this._z, this._x, this._x, this._x) }
    get brrg() { return new Vec4(this._z, this._x, this._x, this._y) }
    get brrb() { return new Vec4(this._z, this._x, this._x, this._z) }
    get brgr() { return new Vec4(this._z, this._x, this._y, this._x) }
    get brgg() { return new Vec4(this._z, this._x, this._y, this._y) }
    get brgb() { return new Vec4(this._z, this._x, this._y, this._z) }
    get brbr() { return new Vec4(this._z, this._x, this._z, this._x) }
    get brbg() { return new Vec4(this._z, this._x, this._z, this._y) }
    get brbb() { return new Vec4(this._z, this._x, this._z, this._z) }
    get bgrr() { return new Vec4(this._z, this._y, this._x, this._x) }
    get bgrg() { return new Vec4(this._z, this._y, this._x, this._y) }
    get bgrb() { return new Vec4(this._z, this._y, this._x, this._z) }
    get bggr() { return new Vec4(this._z, this._y, this._y, this._x) }
    get bggg() { return new Vec4(this._z, this._y, this._y, this._y) }
    get bggb() { return new Vec4(this._z, this._y, this._y, this._z) }
    get bgbr() { return new Vec4(this._z, this._y, this._z, this._x) }
    get bgbg() { return new Vec4(this._z, this._y, this._z, this._y) }
    get bgbb() { return new Vec4(this._z, this._y, this._z, this._z) }
    get bbrr() { return new Vec4(this._z, this._z, this._x, this._x) }
    get bbrg() { return new Vec4(this._z, this._z, this._x, this._y) }
    get bbrb() { return new Vec4(this._z, this._z, this._x, this._z) }
    get bbgr() { return new Vec4(this._z, this._z, this._y, this._x) }
    get bbgg() { return new Vec4(this._z, this._z, this._y, this._y) }
    get bbgb() { return new Vec4(this._z, this._z, this._y, this._z) }
    get bbbr() { return new Vec4(this._z, this._z, this._z, this._x) }
    get bbbg() { return new Vec4(this._z, this._z, this._z, this._y) }
    get bbbb() { return new Vec4(this._z, this._z, this._z, this._z) }

    constructor(x, y, z) {
        if (x instanceof Vec3) {
            if (y !== undefined || z !== undefined) console.warn(`Vec3 constructed from Vec3, but extra arguments present: ${y}, ${z}`)
            super(x.x, x.y)
            this._z = x.z
            return
        }

        if (x instanceof Vec2 && typeof y === "number") {
            if (z !== undefined) console.warn(`Vec3 constructed from Vec2 and number, but extra argument present: ${z}`)
            super(x)
            this._z = y
            return
        }
        if (typeof x === "number" && y instanceof Vec2) {
            if (z !== undefined) console.warn(`Vec3 constructed from number and Vec2, but extra argument present: ${z}`)
            super(x, y.x)
            this._z = y.y
            return
        }

        if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
            super(x, y)
            this._z = z;
            return
        }
        throw TypeError(`Wrong types of X, Y and/or Z: ${typeof x}, ${typeof y}, ${typeof z}`)
    }

    get homogeneous() {
        return new Vec4(this._x, this._y, this._z, 1.0)
    }

    plus(other)     { if (other instanceof Vec3) return new Vec3(this._x + other.x, this._y + other.y, this._z + other.z); else if (typeof other === "number") return new Vec3(this._x + other, this._y + other, this._z + other); else throw TypeError(`Vec3 or number expected, got ${typeof other}`)}
    minus(other)    { if (other instanceof Vec3) return new Vec3(this._x - other.x, this._y - other.y, this._z - other.z); else if (typeof other === "number") return new Vec3(this._x - other, this._y - other, this._z - other); else throw TypeError(`Vec3 or number expected, got ${typeof other}`)}
    times(other)    { if (other instanceof Vec3) return new Vec3(this._x * other.x, this._y * other.y, this._z * other.z); else if (typeof other === "number") return new Vec3(this._x * other, this._y * other, this._z * other); else throw TypeError(`Vec3 or number expected, got ${typeof other}`)}
    divide(other)   { if (other instanceof Vec3) return new Vec3(this._x / other.x, this._y / other.y, this._z / other.z); else if (typeof other === "number") return new Vec3(this._x / other, this._y / other, this._z / other); else throw TypeError(`Vec3 or number expected, got ${typeof other}`)}
    exponent(other) { if (other instanceof Vec3) return new Vec3(this._x ** other.x, this._y ** other.y, this._z ** other.z); else if (typeof other === "number") return new Vec3(this._x ** other, this._y ** other, this._z ** other); else throw TypeError(`Vec3 or number expected, got ${typeof other}`)}

    toString() {
        return `Vec3(${this._x}, ${this._y}, ${this._z})`
    }
}

export class Vec4 extends Vec3 {
    _w

    getAt(x, y) { if (x === 0) return this._x; else if (x === 1) return this._y; else if (x === 2) return this._z; else return this._w }
    setAt(val, x, y) { if (x === 0) this.x = val; else if (x === 1) this.y = val; else if (x === 2) this.z = val; else this.w = val }

    matrixDimensions() { return new Vec2(4, 1) }

    get w() { return this._w }
    set w(w) { if (typeof w === "number") this._w = w; else throw TypeError(`number expected, got ${typeof w}`) }

    get a() { return this._w }
    set a(a) { if (typeof a === "number") this._w = a; else throw TypeError(`number expected, got ${typeof a}`) }

    get xw() { return new Vec2(this._x, this._w)}
    get yw() { return new Vec2(this._y, this._w)}
    get zw() { return new Vec2(this._z, this._w)}
    get wx() { return new Vec2(this._w, this._x)}
    get wy() { return new Vec2(this._w, this._y)}
    get wz() { return new Vec2(this._w, this._z)}
    get ww() { return new Vec2(this._w, this._w)}

    get ra() { return new Vec2(this._x, this._w)}
    get ga() { return new Vec2(this._y, this._w)}
    get ba() { return new Vec2(this._z, this._w)}
    get ar() { return new Vec2(this._w, this._x)}
    get ag() { return new Vec2(this._w, this._y)}
    get ab() { return new Vec2(this._w, this._z)}
    get aa() { return new Vec2(this._w, this._w)}

    set xw(xw) { if(xw instanceof Vec2) {this._x = xw.x; this._w = xw.y; } else if (typeof xw === "number") this._x = this._w = xw; else throw TypeError(`Vec2 or number expected, got ${typeof xw}`)}
    set yw(yw) { if(yw instanceof Vec2) {this._y = yw.x; this._w = yw.y; } else if (typeof yw === "number") this._y = this._w = yw; else throw TypeError(`Vec2 or number expected, got ${typeof yw}`)}
    set zw(zw) { if(zw instanceof Vec2) {this._z = zw.x; this._w = zw.y; } else if (typeof zw === "number") this._z = this._w = zw; else throw TypeError(`Vec2 or number expected, got ${typeof zw}`)}
    set wx(wx) { if(wx instanceof Vec2) {this._w = wx.x; this._x = wx.y; } else if (typeof wx === "number") this._w = this._x = wx; else throw TypeError(`Vec2 or number expected, got ${typeof wx}`)}
    set wy(wy) { if(wy instanceof Vec2) {this._w = wy.x; this._y = wy.y; } else if (typeof wy === "number") this._w = this._y = wy; else throw TypeError(`Vec2 or number expected, got ${typeof wy}`)}
    set wz(wz) { if(wz instanceof Vec2) {this._w = wz.x; this._z = wz.y; } else if (typeof wz === "number") this._w = this._z = wz; else throw TypeError(`Vec2 or number expected, got ${typeof wz}`)}

    set ra(ra) { if(ra instanceof Vec2) {this._x = ra.x; this._w = ra.y; } else if (typeof ra === "number") this._x = this._w = ra; else throw TypeError(`Vec2 or number expected, got ${typeof ra}`)}
    set ga(ga) { if(ga instanceof Vec2) {this._y = ga.x; this._w = ga.y; } else if (typeof ga === "number") this._y = this._w = ga; else throw TypeError(`Vec2 or number expected, got ${typeof ga}`)}
    set ba(ba) { if(ba instanceof Vec2) {this._z = ba.x; this._w = ba.y; } else if (typeof ba === "number") this._z = this._w = ba; else throw TypeError(`Vec2 or number expected, got ${typeof ba}`)}
    set ar(ar) { if(ar instanceof Vec2) {this._w = ar.x; this._x = ar.y; } else if (typeof ar === "number") this._w = this._x = ar; else throw TypeError(`Vec2 or number expected, got ${typeof ar}`)}
    set ag(ag) { if(ag instanceof Vec2) {this._w = ag.x; this._y = ag.y; } else if (typeof ag === "number") this._w = this._y = ag; else throw TypeError(`Vec2 or number expected, got ${typeof ag}`)}
    set ab(ab) { if(ab instanceof Vec2) {this._w = ab.x; this._z = ab.y; } else if (typeof ab === "number") this._w = this._z = ab; else throw TypeError(`Vec2 or number expected, got ${typeof ab}`)}

    get xxw() { return new Vec3(this._x, this._x, this._w)}
    get xyw() { return new Vec3(this._x, this._y, this._w)}
    get xzw() { return new Vec3(this._x, this._z, this._w)}
    get xwx() { return new Vec3(this._x, this._w, this._x)}
    get xwy() { return new Vec3(this._x, this._w, this._y)}
    get xwz() { return new Vec3(this._x, this._w, this._z)}
    get xww() { return new Vec3(this._x, this._w, this._w)}
    get yxw() { return new Vec3(this._y, this._x, this._w)}
    get yyw() { return new Vec3(this._y, this._y, this._w)}
    get yzw() { return new Vec3(this._y, this._z, this._w)}
    get ywx() { return new Vec3(this._y, this._w, this._x)}
    get ywy() { return new Vec3(this._y, this._w, this._y)}
    get ywz() { return new Vec3(this._y, this._w, this._z)}
    get yww() { return new Vec3(this._y, this._w, this._w)}
    get zxw() { return new Vec3(this._z, this._x, this._w)}
    get zyw() { return new Vec3(this._z, this._y, this._w)}
    get zzw() { return new Vec3(this._z, this._z, this._w)}
    get zwx() { return new Vec3(this._z, this._w, this._x)}
    get zwy() { return new Vec3(this._z, this._w, this._y)}
    get zwz() { return new Vec3(this._z, this._w, this._z)}
    get zww() { return new Vec3(this._z, this._w, this._w)}
    get wxx() { return new Vec3(this._w, this._x, this._x)}
    get wxy() { return new Vec3(this._w, this._x, this._y)}
    get wxz() { return new Vec3(this._w, this._x, this._z)}
    get wxw() { return new Vec3(this._w, this._x, this._w)}
    get wyx() { return new Vec3(this._w, this._y, this._x)}
    get wyy() { return new Vec3(this._w, this._y, this._y)}
    get wyz() { return new Vec3(this._w, this._y, this._z)}
    get wyw() { return new Vec3(this._w, this._y, this._w)}
    get wzx() { return new Vec3(this._w, this._z, this._x)}
    get wzy() { return new Vec3(this._w, this._z, this._y)}
    get wzz() { return new Vec3(this._w, this._z, this._z)}
    get wzw() { return new Vec3(this._w, this._z, this._w)}
    get wwx() { return new Vec3(this._w, this._w, this._x)}
    get wwy() { return new Vec3(this._w, this._w, this._y)}
    get wwz() { return new Vec3(this._w, this._w, this._z)}
    get www() { return new Vec3(this._w, this._w, this._w)}

    get rra() { return new Vec3(this._x, this._x, this._w)}
    get rga() { return new Vec3(this._x, this._y, this._w)}
    get rba() { return new Vec3(this._x, this._z, this._w)}
    get rar() { return new Vec3(this._x, this._w, this._x)}
    get rag() { return new Vec3(this._x, this._w, this._y)}
    get rab() { return new Vec3(this._x, this._w, this._z)}
    get raa() { return new Vec3(this._x, this._w, this._w)}
    get gra() { return new Vec3(this._y, this._x, this._w)}
    get gga() { return new Vec3(this._y, this._y, this._w)}
    get gba() { return new Vec3(this._y, this._z, this._w)}
    get gar() { return new Vec3(this._y, this._w, this._x)}
    get gag() { return new Vec3(this._y, this._w, this._y)}
    get gab() { return new Vec3(this._y, this._w, this._z)}
    get gaa() { return new Vec3(this._y, this._w, this._w)}
    get bra() { return new Vec3(this._z, this._x, this._w)}
    get bga() { return new Vec3(this._z, this._y, this._w)}
    get bba() { return new Vec3(this._z, this._z, this._w)}
    get bar() { return new Vec3(this._z, this._w, this._x)}
    get bag() { return new Vec3(this._z, this._w, this._y)}
    get bab() { return new Vec3(this._z, this._w, this._z)}
    get baa() { return new Vec3(this._z, this._w, this._w)}
    get arr() { return new Vec3(this._w, this._x, this._x)}
    get arg() { return new Vec3(this._w, this._x, this._y)}
    get arb() { return new Vec3(this._w, this._x, this._z)}
    get ara() { return new Vec3(this._w, this._x, this._w)}
    get agr() { return new Vec3(this._w, this._y, this._x)}
    get agg() { return new Vec3(this._w, this._y, this._y)}
    get agb() { return new Vec3(this._w, this._y, this._z)}
    get aga() { return new Vec3(this._w, this._y, this._w)}
    get abr() { return new Vec3(this._w, this._z, this._x)}
    get abg() { return new Vec3(this._w, this._z, this._y)}
    get abb() { return new Vec3(this._w, this._z, this._z)}
    get aba() { return new Vec3(this._w, this._z, this._w)}
    get aar() { return new Vec3(this._w, this._w, this._x)}
    get aag() { return new Vec3(this._w, this._w, this._y)}
    get aab() { return new Vec3(this._w, this._w, this._z)}
    get aaa() { return new Vec3(this._w, this._w, this._w)}

    set xyw(xyw) { if(xyw instanceof Vec3) {this._x = xyw.x; this._y = xyw.y; this._w = xyw.z } else if (typeof xyw === "number") this._x = this._y = this._w = xyw; else throw TypeError(`Vec3 or number expected, got ${typeof xyw}`)}
    set xzw(xzw) { if(xzw instanceof Vec3) {this._x = xzw.x; this._z = xzw.y; this._w = xzw.z } else if (typeof xzw === "number") this._x = this._z = this._w = xzw; else throw TypeError(`Vec3 or number expected, got ${typeof xzw}`)}
    set xwy(xwy) { if(xwy instanceof Vec3) {this._x = xwy.x; this._w = xwy.y; this._y = xwy.z } else if (typeof xwy === "number") this._x = this._w = this._y = xwy; else throw TypeError(`Vec3 or number expected, got ${typeof xwy}`)}
    set xwz(xwz) { if(xwz instanceof Vec3) {this._x = xwz.x; this._w = xwz.y; this._z = xwz.z } else if (typeof xwz === "number") this._x = this._w = this._z = xwz; else throw TypeError(`Vec3 or number expected, got ${typeof xwz}`)}
    set yxw(yxw) { if(yxw instanceof Vec3) {this._y = yxw.x; this._x = yxw.y; this._w = yxw.z } else if (typeof yxw === "number") this._y = this._x = this._w = yxw; else throw TypeError(`Vec3 or number expected, got ${typeof yxw}`)}
    set yzw(yzw) { if(yzw instanceof Vec3) {this._y = yzw.x; this._z = yzw.y; this._w = yzw.z } else if (typeof yzw === "number") this._y = this._z = this._w = yzw; else throw TypeError(`Vec3 or number expected, got ${typeof yzw}`)}
    set ywx(ywx) { if(ywx instanceof Vec3) {this._y = ywx.x; this._w = ywx.y; this._x = ywx.z } else if (typeof ywx === "number") this._y = this._w = this._x = ywx; else throw TypeError(`Vec3 or number expected, got ${typeof ywx}`)}
    set ywz(ywz) { if(ywz instanceof Vec3) {this._y = ywz.x; this._w = ywz.y; this._z = ywz.z } else if (typeof ywz === "number") this._y = this._w = this._z = ywz; else throw TypeError(`Vec3 or number expected, got ${typeof ywz}`)}
    set zxw(zxw) { if(zxw instanceof Vec3) {this._z = zxw.x; this._x = zxw.y; this._w = zxw.z } else if (typeof zxw === "number") this._z = this._x = this._w = zxw; else throw TypeError(`Vec3 or number expected, got ${typeof zxw}`)}
    set zyw(zyw) { if(zyw instanceof Vec3) {this._z = zyw.x; this._y = zyw.y; this._w = zyw.z } else if (typeof zyw === "number") this._z = this._y = this._w = zyw; else throw TypeError(`Vec3 or number expected, got ${typeof zyw}`)}
    set zwx(zwx) { if(zwx instanceof Vec3) {this._z = zwx.x; this._w = zwx.y; this._x = zwx.z } else if (typeof zwx === "number") this._z = this._w = this._x = zwx; else throw TypeError(`Vec3 or number expected, got ${typeof zwx}`)}
    set zwy(zwy) { if(zwy instanceof Vec3) {this._z = zwy.x; this._w = zwy.y; this._y = zwy.z } else if (typeof zwy === "number") this._z = this._w = this._y = zwy; else throw TypeError(`Vec3 or number expected, got ${typeof zwy}`)}
    set wxy(wxy) { if(wxy instanceof Vec3) {this._w = wxy.x; this._x = wxy.y; this._y = wxy.z } else if (typeof wxy === "number") this._w = this._x = this._y = wxy; else throw TypeError(`Vec3 or number expected, got ${typeof wxy}`)}
    set wxz(wxz) { if(wxz instanceof Vec3) {this._w = wxz.x; this._x = wxz.y; this._z = wxz.z } else if (typeof wxz === "number") this._w = this._x = this._z = wxz; else throw TypeError(`Vec3 or number expected, got ${typeof wxz}`)}
    set wyx(wyx) { if(wyx instanceof Vec3) {this._w = wyx.x; this._y = wyx.y; this._x = wyx.z } else if (typeof wyx === "number") this._w = this._y = this._x = wyx; else throw TypeError(`Vec3 or number expected, got ${typeof wyx}`)}
    set wyz(wyz) { if(wyz instanceof Vec3) {this._w = wyz.x; this._y = wyz.y; this._z = wyz.z } else if (typeof wyz === "number") this._w = this._y = this._z = wyz; else throw TypeError(`Vec3 or number expected, got ${typeof wyz}`)}
    set wzx(wzx) { if(wzx instanceof Vec3) {this._w = wzx.x; this._z = wzx.y; this._x = wzx.z } else if (typeof wzx === "number") this._w = this._z = this._x = wzx; else throw TypeError(`Vec3 or number expected, got ${typeof wzx}`)}
    set wzy(wzy) { if(wzy instanceof Vec3) {this._w = wzy.x; this._z = wzy.y; this._y = wzy.z } else if (typeof wzy === "number") this._w = this._z = this._y = wzy; else throw TypeError(`Vec3 or number expected, got ${typeof wzy}`)}

    set rga(rga) { if(rga instanceof Vec3) {this._x = rga.x; this._y = rga.y; this._w = rga.z } else if (typeof rga === "number") this._x = this._y = this._w = rga; else throw TypeError(`Vec3 or number expected, got ${typeof rga}`)}
    set rba(rba) { if(rba instanceof Vec3) {this._x = rba.x; this._z = rba.y; this._w = rba.z } else if (typeof rba === "number") this._x = this._z = this._w = rba; else throw TypeError(`Vec3 or number expected, got ${typeof rba}`)}
    set rag(rag) { if(rag instanceof Vec3) {this._x = rag.x; this._w = rag.y; this._y = rag.z } else if (typeof rag === "number") this._x = this._w = this._y = rag; else throw TypeError(`Vec3 or number expected, got ${typeof rag}`)}
    set rab(rab) { if(rab instanceof Vec3) {this._x = rab.x; this._w = rab.y; this._z = rab.z } else if (typeof rab === "number") this._x = this._w = this._z = rab; else throw TypeError(`Vec3 or number expected, got ${typeof rab}`)}
    set gra(gra) { if(gra instanceof Vec3) {this._y = gra.x; this._x = gra.y; this._w = gra.z } else if (typeof gra === "number") this._y = this._x = this._w = gra; else throw TypeError(`Vec3 or number expected, got ${typeof gra}`)}
    set gba(gba) { if(gba instanceof Vec3) {this._y = gba.x; this._z = gba.y; this._w = gba.z } else if (typeof gba === "number") this._y = this._z = this._w = gba; else throw TypeError(`Vec3 or number expected, got ${typeof gba}`)}
    set gar(gar) { if(gar instanceof Vec3) {this._y = gar.x; this._w = gar.y; this._x = gar.z } else if (typeof gar === "number") this._y = this._w = this._x = gar; else throw TypeError(`Vec3 or number expected, got ${typeof gar}`)}
    set gab(gab) { if(gab instanceof Vec3) {this._y = gab.x; this._w = gab.y; this._z = gab.z } else if (typeof gab === "number") this._y = this._w = this._z = gab; else throw TypeError(`Vec3 or number expected, got ${typeof gab}`)}
    set bra(bra) { if(bra instanceof Vec3) {this._z = bra.x; this._x = bra.y; this._w = bra.z } else if (typeof bra === "number") this._z = this._x = this._w = bra; else throw TypeError(`Vec3 or number expected, got ${typeof bra}`)}
    set bga(bga) { if(bga instanceof Vec3) {this._z = bga.x; this._y = bga.y; this._w = bga.z } else if (typeof bga === "number") this._z = this._y = this._w = bga; else throw TypeError(`Vec3 or number expected, got ${typeof bga}`)}
    set bar(bar) { if(bar instanceof Vec3) {this._z = bar.x; this._w = bar.y; this._x = bar.z } else if (typeof bar === "number") this._z = this._w = this._x = bar; else throw TypeError(`Vec3 or number expected, got ${typeof bar}`)}
    set bag(bag) { if(bag instanceof Vec3) {this._z = bag.x; this._w = bag.y; this._y = bag.z } else if (typeof bag === "number") this._z = this._w = this._y = bag; else throw TypeError(`Vec3 or number expected, got ${typeof bag}`)}
    set arg(arg) { if(arg instanceof Vec3) {this._w = arg.x; this._x = arg.y; this._y = arg.z } else if (typeof arg === "number") this._w = this._x = this._y = arg; else throw TypeError(`Vec3 or number expected, got ${typeof arg}`)}
    set arb(arb) { if(arb instanceof Vec3) {this._w = arb.x; this._x = arb.y; this._z = arb.z } else if (typeof arb === "number") this._w = this._x = this._z = arb; else throw TypeError(`Vec3 or number expected, got ${typeof arb}`)}
    set agr(agr) { if(agr instanceof Vec3) {this._w = agr.x; this._y = agr.y; this._x = agr.z } else if (typeof agr === "number") this._w = this._y = this._x = agr; else throw TypeError(`Vec3 or number expected, got ${typeof agr}`)}
    set agb(agb) { if(agb instanceof Vec3) {this._w = agb.x; this._y = agb.y; this._z = agb.z } else if (typeof agb === "number") this._w = this._y = this._z = agb; else throw TypeError(`Vec3 or number expected, got ${typeof agb}`)}
    set abr(abr) { if(abr instanceof Vec3) {this._w = abr.x; this._z = abr.y; this._x = abr.z } else if (typeof abr === "number") this._w = this._z = this._x = abr; else throw TypeError(`Vec3 or number expected, got ${typeof abr}`)}
    set abg(abg) { if(abg instanceof Vec3) {this._w = abg.x; this._z = abg.y; this._y = abg.z } else if (typeof abg === "number") this._w = this._z = this._y = abg; else throw TypeError(`Vec3 or number expected, got ${typeof abg}`)}

    get xxxw() { return new Vec4(this._x, this._x, this._x, this._w) }
    get xxyw() { return new Vec4(this._x, this._x, this._y, this._w) }
    get xxzw() { return new Vec4(this._x, this._x, this._z, this._w) }
    get xxwx() { return new Vec4(this._x, this._x, this._w, this._x) }
    get xxwy() { return new Vec4(this._x, this._x, this._w, this._y) }
    get xxwz() { return new Vec4(this._x, this._x, this._w, this._z) }
    get xxww() { return new Vec4(this._x, this._x, this._w, this._w) }
    get xyxw() { return new Vec4(this._x, this._y, this._x, this._w) }
    get xyyw() { return new Vec4(this._x, this._y, this._y, this._w) }
    get xyzw() { return new Vec4(this._x, this._y, this._z, this._w) }
    get xywx() { return new Vec4(this._x, this._y, this._w, this._x) }
    get xywy() { return new Vec4(this._x, this._y, this._w, this._y) }
    get xywz() { return new Vec4(this._x, this._y, this._w, this._z) }
    get xyww() { return new Vec4(this._x, this._y, this._w, this._w) }
    get xzxw() { return new Vec4(this._x, this._z, this._x, this._w) }
    get xzyw() { return new Vec4(this._x, this._z, this._y, this._w) }
    get xzzw() { return new Vec4(this._x, this._z, this._z, this._w) }
    get xzwx() { return new Vec4(this._x, this._z, this._w, this._x) }
    get xzwy() { return new Vec4(this._x, this._z, this._w, this._y) }
    get xzwz() { return new Vec4(this._x, this._z, this._w, this._z) }
    get xzww() { return new Vec4(this._x, this._z, this._w, this._w) }
    get xwxx() { return new Vec4(this._x, this._w, this._x, this._x) }
    get xwxy() { return new Vec4(this._x, this._w, this._x, this._y) }
    get xwxz() { return new Vec4(this._x, this._w, this._x, this._z) }
    get xwxw() { return new Vec4(this._x, this._w, this._x, this._w) }
    get xwyx() { return new Vec4(this._x, this._w, this._y, this._x) }
    get xwyy() { return new Vec4(this._x, this._w, this._y, this._y) }
    get xwyz() { return new Vec4(this._x, this._w, this._y, this._z) }
    get xwyw() { return new Vec4(this._x, this._w, this._y, this._w) }
    get xwzx() { return new Vec4(this._x, this._w, this._z, this._x) }
    get xwzy() { return new Vec4(this._x, this._w, this._z, this._y) }
    get xwzz() { return new Vec4(this._x, this._w, this._z, this._z) }
    get xwzw() { return new Vec4(this._x, this._w, this._z, this._w) }
    get xwwx() { return new Vec4(this._x, this._w, this._w, this._x) }
    get xwwy() { return new Vec4(this._x, this._w, this._w, this._y) }
    get xwwz() { return new Vec4(this._x, this._w, this._w, this._z) }
    get xwww() { return new Vec4(this._x, this._w, this._w, this._w) }
    get yxxw() { return new Vec4(this._y, this._x, this._x, this._w) }
    get yxyw() { return new Vec4(this._y, this._x, this._y, this._w) }
    get yxzw() { return new Vec4(this._y, this._x, this._z, this._w) }
    get yxwx() { return new Vec4(this._y, this._x, this._w, this._x) }
    get yxwy() { return new Vec4(this._y, this._x, this._w, this._y) }
    get yxwz() { return new Vec4(this._y, this._x, this._w, this._z) }
    get yxww() { return new Vec4(this._y, this._x, this._w, this._w) }
    get yyxw() { return new Vec4(this._y, this._y, this._x, this._w) }
    get yyyw() { return new Vec4(this._y, this._y, this._y, this._w) }
    get yyzw() { return new Vec4(this._y, this._y, this._z, this._w) }
    get yywx() { return new Vec4(this._y, this._y, this._w, this._x) }
    get yywy() { return new Vec4(this._y, this._y, this._w, this._y) }
    get yywz() { return new Vec4(this._y, this._y, this._w, this._z) }
    get yyww() { return new Vec4(this._y, this._y, this._w, this._w) }
    get yzxw() { return new Vec4(this._y, this._z, this._x, this._w) }
    get yzyw() { return new Vec4(this._y, this._z, this._y, this._w) }
    get yzzw() { return new Vec4(this._y, this._z, this._z, this._w) }
    get yzwx() { return new Vec4(this._y, this._z, this._w, this._x) }
    get yzwy() { return new Vec4(this._y, this._z, this._w, this._y) }
    get yzwz() { return new Vec4(this._y, this._z, this._w, this._z) }
    get yzww() { return new Vec4(this._y, this._z, this._w, this._w) }
    get ywxx() { return new Vec4(this._y, this._w, this._x, this._x) }
    get ywxy() { return new Vec4(this._y, this._w, this._x, this._y) }
    get ywxz() { return new Vec4(this._y, this._w, this._x, this._z) }
    get ywxw() { return new Vec4(this._y, this._w, this._x, this._w) }
    get ywyx() { return new Vec4(this._y, this._w, this._y, this._x) }
    get ywyy() { return new Vec4(this._y, this._w, this._y, this._y) }
    get ywyz() { return new Vec4(this._y, this._w, this._y, this._z) }
    get ywyw() { return new Vec4(this._y, this._w, this._y, this._w) }
    get ywzx() { return new Vec4(this._y, this._w, this._z, this._x) }
    get ywzy() { return new Vec4(this._y, this._w, this._z, this._y) }
    get ywzz() { return new Vec4(this._y, this._w, this._z, this._z) }
    get ywzw() { return new Vec4(this._y, this._w, this._z, this._w) }
    get ywwx() { return new Vec4(this._y, this._w, this._w, this._x) }
    get ywwy() { return new Vec4(this._y, this._w, this._w, this._y) }
    get ywwz() { return new Vec4(this._y, this._w, this._w, this._z) }
    get ywww() { return new Vec4(this._y, this._w, this._w, this._w) }
    get zxxw() { return new Vec4(this._z, this._x, this._x, this._w) }
    get zxyw() { return new Vec4(this._z, this._x, this._y, this._w) }
    get zxzw() { return new Vec4(this._z, this._x, this._z, this._w) }
    get zxwx() { return new Vec4(this._z, this._x, this._w, this._x) }
    get zxwy() { return new Vec4(this._z, this._x, this._w, this._y) }
    get zxwz() { return new Vec4(this._z, this._x, this._w, this._z) }
    get zxww() { return new Vec4(this._z, this._x, this._w, this._w) }
    get zyxw() { return new Vec4(this._z, this._y, this._x, this._w) }
    get zyyw() { return new Vec4(this._z, this._y, this._y, this._w) }
    get zyzw() { return new Vec4(this._z, this._y, this._z, this._w) }
    get zywx() { return new Vec4(this._z, this._y, this._w, this._x) }
    get zywy() { return new Vec4(this._z, this._y, this._w, this._y) }
    get zywz() { return new Vec4(this._z, this._y, this._w, this._z) }
    get zyww() { return new Vec4(this._z, this._y, this._w, this._w) }
    get zzxw() { return new Vec4(this._z, this._z, this._x, this._w) }
    get zzyw() { return new Vec4(this._z, this._z, this._y, this._w) }
    get zzzw() { return new Vec4(this._z, this._z, this._z, this._w) }
    get zzwx() { return new Vec4(this._z, this._z, this._w, this._x) }
    get zzwy() { return new Vec4(this._z, this._z, this._w, this._y) }
    get zzwz() { return new Vec4(this._z, this._z, this._w, this._z) }
    get zzww() { return new Vec4(this._z, this._z, this._w, this._w) }
    get zwxx() { return new Vec4(this._z, this._w, this._x, this._x) }
    get zwxy() { return new Vec4(this._z, this._w, this._x, this._y) }
    get zwxz() { return new Vec4(this._z, this._w, this._x, this._z) }
    get zwxw() { return new Vec4(this._z, this._w, this._x, this._w) }
    get zwyx() { return new Vec4(this._z, this._w, this._y, this._x) }
    get zwyy() { return new Vec4(this._z, this._w, this._y, this._y) }
    get zwyz() { return new Vec4(this._z, this._w, this._y, this._z) }
    get zwyw() { return new Vec4(this._z, this._w, this._y, this._w) }
    get zwzx() { return new Vec4(this._z, this._w, this._z, this._x) }
    get zwzy() { return new Vec4(this._z, this._w, this._z, this._y) }
    get zwzz() { return new Vec4(this._z, this._w, this._z, this._z) }
    get zwzw() { return new Vec4(this._z, this._w, this._z, this._w) }
    get zwwx() { return new Vec4(this._z, this._w, this._w, this._x) }
    get zwwy() { return new Vec4(this._z, this._w, this._w, this._y) }
    get zwwz() { return new Vec4(this._z, this._w, this._w, this._z) }
    get zwww() { return new Vec4(this._z, this._w, this._w, this._w) }
    get wxxx() { return new Vec4(this._w, this._x, this._x, this._x) }
    get wxxy() { return new Vec4(this._w, this._x, this._x, this._y) }
    get wxxz() { return new Vec4(this._w, this._x, this._x, this._z) }
    get wxxw() { return new Vec4(this._w, this._x, this._x, this._w) }
    get wxyx() { return new Vec4(this._w, this._x, this._y, this._x) }
    get wxyy() { return new Vec4(this._w, this._x, this._y, this._y) }
    get wxyz() { return new Vec4(this._w, this._x, this._y, this._z) }
    get wxyw() { return new Vec4(this._w, this._x, this._y, this._w) }
    get wxzx() { return new Vec4(this._w, this._x, this._z, this._x) }
    get wxzy() { return new Vec4(this._w, this._x, this._z, this._y) }
    get wxzz() { return new Vec4(this._w, this._x, this._z, this._z) }
    get wxzw() { return new Vec4(this._w, this._x, this._z, this._w) }
    get wxwx() { return new Vec4(this._w, this._x, this._w, this._x) }
    get wxwy() { return new Vec4(this._w, this._x, this._w, this._y) }
    get wxwz() { return new Vec4(this._w, this._x, this._w, this._z) }
    get wxww() { return new Vec4(this._w, this._x, this._w, this._w) }
    get wyxx() { return new Vec4(this._w, this._y, this._x, this._x) }
    get wyxy() { return new Vec4(this._w, this._y, this._x, this._y) }
    get wyxz() { return new Vec4(this._w, this._y, this._x, this._z) }
    get wyxw() { return new Vec4(this._w, this._y, this._x, this._w) }
    get wyyx() { return new Vec4(this._w, this._y, this._y, this._x) }
    get wyyy() { return new Vec4(this._w, this._y, this._y, this._y) }
    get wyyz() { return new Vec4(this._w, this._y, this._y, this._z) }
    get wyyw() { return new Vec4(this._w, this._y, this._y, this._w) }
    get wyzx() { return new Vec4(this._w, this._y, this._z, this._x) }
    get wyzy() { return new Vec4(this._w, this._y, this._z, this._y) }
    get wyzz() { return new Vec4(this._w, this._y, this._z, this._z) }
    get wyzw() { return new Vec4(this._w, this._y, this._z, this._w) }
    get wywx() { return new Vec4(this._w, this._y, this._w, this._x) }
    get wywy() { return new Vec4(this._w, this._y, this._w, this._y) }
    get wywz() { return new Vec4(this._w, this._y, this._w, this._z) }
    get wyww() { return new Vec4(this._w, this._y, this._w, this._w) }
    get wzxx() { return new Vec4(this._w, this._z, this._x, this._x) }
    get wzxy() { return new Vec4(this._w, this._z, this._x, this._y) }
    get wzxz() { return new Vec4(this._w, this._z, this._x, this._z) }
    get wzxw() { return new Vec4(this._w, this._z, this._x, this._w) }
    get wzyx() { return new Vec4(this._w, this._z, this._y, this._x) }
    get wzyy() { return new Vec4(this._w, this._z, this._y, this._y) }
    get wzyz() { return new Vec4(this._w, this._z, this._y, this._z) }
    get wzyw() { return new Vec4(this._w, this._z, this._y, this._w) }
    get wzzx() { return new Vec4(this._w, this._z, this._z, this._x) }
    get wzzy() { return new Vec4(this._w, this._z, this._z, this._y) }
    get wzzz() { return new Vec4(this._w, this._z, this._z, this._z) }
    get wzzw() { return new Vec4(this._w, this._z, this._z, this._w) }
    get wzwx() { return new Vec4(this._w, this._z, this._w, this._x) }
    get wzwy() { return new Vec4(this._w, this._z, this._w, this._y) }
    get wzwz() { return new Vec4(this._w, this._z, this._w, this._z) }
    get wzww() { return new Vec4(this._w, this._z, this._w, this._w) }
    get wwxx() { return new Vec4(this._w, this._w, this._x, this._x) }
    get wwxy() { return new Vec4(this._w, this._w, this._x, this._y) }
    get wwxz() { return new Vec4(this._w, this._w, this._x, this._z) }
    get wwxw() { return new Vec4(this._w, this._w, this._x, this._w) }
    get wwyx() { return new Vec4(this._w, this._w, this._y, this._x) }
    get wwyy() { return new Vec4(this._w, this._w, this._y, this._y) }
    get wwyz() { return new Vec4(this._w, this._w, this._y, this._z) }
    get wwyw() { return new Vec4(this._w, this._w, this._y, this._w) }
    get wwzx() { return new Vec4(this._w, this._w, this._z, this._x) }
    get wwzy() { return new Vec4(this._w, this._w, this._z, this._y) }
    get wwzz() { return new Vec4(this._w, this._w, this._z, this._z) }
    get wwzw() { return new Vec4(this._w, this._w, this._z, this._w) }
    get wwwx() { return new Vec4(this._w, this._w, this._w, this._x) }
    get wwwy() { return new Vec4(this._w, this._w, this._w, this._y) }
    get wwwz() { return new Vec4(this._w, this._w, this._w, this._z) }
    get wwww() { return new Vec4(this._w, this._w, this._w, this._w) }

    get rrra() { return new Vec4(this._x, this._x, this._x, this._w) }
    get rrga() { return new Vec4(this._x, this._x, this._y, this._w) }
    get rrba() { return new Vec4(this._x, this._x, this._z, this._w) }
    get rrar() { return new Vec4(this._x, this._x, this._w, this._x) }
    get rrag() { return new Vec4(this._x, this._x, this._w, this._y) }
    get rrab() { return new Vec4(this._x, this._x, this._w, this._z) }
    get rraa() { return new Vec4(this._x, this._x, this._w, this._w) }
    get rgra() { return new Vec4(this._x, this._y, this._x, this._w) }
    get rgga() { return new Vec4(this._x, this._y, this._y, this._w) }
    get rgba() { return new Vec4(this._x, this._y, this._z, this._w) }
    get rgar() { return new Vec4(this._x, this._y, this._w, this._x) }
    get rgag() { return new Vec4(this._x, this._y, this._w, this._y) }
    get rgab() { return new Vec4(this._x, this._y, this._w, this._z) }
    get rgaa() { return new Vec4(this._x, this._y, this._w, this._w) }
    get rbra() { return new Vec4(this._x, this._z, this._x, this._w) }
    get rbga() { return new Vec4(this._x, this._z, this._y, this._w) }
    get rbba() { return new Vec4(this._x, this._z, this._z, this._w) }
    get rbar() { return new Vec4(this._x, this._z, this._w, this._x) }
    get rbag() { return new Vec4(this._x, this._z, this._w, this._y) }
    get rbab() { return new Vec4(this._x, this._z, this._w, this._z) }
    get rbaa() { return new Vec4(this._x, this._z, this._w, this._w) }
    get rarr() { return new Vec4(this._x, this._w, this._x, this._x) }
    get rarg() { return new Vec4(this._x, this._w, this._x, this._y) }
    get rarb() { return new Vec4(this._x, this._w, this._x, this._z) }
    get rara() { return new Vec4(this._x, this._w, this._x, this._w) }
    get ragr() { return new Vec4(this._x, this._w, this._y, this._x) }
    get ragg() { return new Vec4(this._x, this._w, this._y, this._y) }
    get ragb() { return new Vec4(this._x, this._w, this._y, this._z) }
    get raga() { return new Vec4(this._x, this._w, this._y, this._w) }
    get rabr() { return new Vec4(this._x, this._w, this._z, this._x) }
    get rabg() { return new Vec4(this._x, this._w, this._z, this._y) }
    get rabb() { return new Vec4(this._x, this._w, this._z, this._z) }
    get raba() { return new Vec4(this._x, this._w, this._z, this._w) }
    get raar() { return new Vec4(this._x, this._w, this._w, this._x) }
    get raag() { return new Vec4(this._x, this._w, this._w, this._y) }
    get raab() { return new Vec4(this._x, this._w, this._w, this._z) }
    get raaa() { return new Vec4(this._x, this._w, this._w, this._w) }
    get grra() { return new Vec4(this._y, this._x, this._x, this._w) }
    get grga() { return new Vec4(this._y, this._x, this._y, this._w) }
    get grba() { return new Vec4(this._y, this._x, this._z, this._w) }
    get grar() { return new Vec4(this._y, this._x, this._w, this._x) }
    get grag() { return new Vec4(this._y, this._x, this._w, this._y) }
    get grab() { return new Vec4(this._y, this._x, this._w, this._z) }
    get graa() { return new Vec4(this._y, this._x, this._w, this._w) }
    get ggra() { return new Vec4(this._y, this._y, this._x, this._w) }
    get ggga() { return new Vec4(this._y, this._y, this._y, this._w) }
    get ggba() { return new Vec4(this._y, this._y, this._z, this._w) }
    get ggar() { return new Vec4(this._y, this._y, this._w, this._x) }
    get ggag() { return new Vec4(this._y, this._y, this._w, this._y) }
    get ggab() { return new Vec4(this._y, this._y, this._w, this._z) }
    get ggaa() { return new Vec4(this._y, this._y, this._w, this._w) }
    get gbra() { return new Vec4(this._y, this._z, this._x, this._w) }
    get gbga() { return new Vec4(this._y, this._z, this._y, this._w) }
    get gbba() { return new Vec4(this._y, this._z, this._z, this._w) }
    get gbar() { return new Vec4(this._y, this._z, this._w, this._x) }
    get gbag() { return new Vec4(this._y, this._z, this._w, this._y) }
    get gbab() { return new Vec4(this._y, this._z, this._w, this._z) }
    get gbaa() { return new Vec4(this._y, this._z, this._w, this._w) }
    get garr() { return new Vec4(this._y, this._w, this._x, this._x) }
    get garg() { return new Vec4(this._y, this._w, this._x, this._y) }
    get garb() { return new Vec4(this._y, this._w, this._x, this._z) }
    get gara() { return new Vec4(this._y, this._w, this._x, this._w) }
    get gagr() { return new Vec4(this._y, this._w, this._y, this._x) }
    get gagg() { return new Vec4(this._y, this._w, this._y, this._y) }
    get gagb() { return new Vec4(this._y, this._w, this._y, this._z) }
    get gaga() { return new Vec4(this._y, this._w, this._y, this._w) }
    get gabr() { return new Vec4(this._y, this._w, this._z, this._x) }
    get gabg() { return new Vec4(this._y, this._w, this._z, this._y) }
    get gabb() { return new Vec4(this._y, this._w, this._z, this._z) }
    get gaba() { return new Vec4(this._y, this._w, this._z, this._w) }
    get gaar() { return new Vec4(this._y, this._w, this._w, this._x) }
    get gaag() { return new Vec4(this._y, this._w, this._w, this._y) }
    get gaab() { return new Vec4(this._y, this._w, this._w, this._z) }
    get gaaa() { return new Vec4(this._y, this._w, this._w, this._w) }
    get brra() { return new Vec4(this._z, this._x, this._x, this._w) }
    get brga() { return new Vec4(this._z, this._x, this._y, this._w) }
    get brba() { return new Vec4(this._z, this._x, this._z, this._w) }
    get brar() { return new Vec4(this._z, this._x, this._w, this._x) }
    get brag() { return new Vec4(this._z, this._x, this._w, this._y) }
    get brab() { return new Vec4(this._z, this._x, this._w, this._z) }
    get braa() { return new Vec4(this._z, this._x, this._w, this._w) }
    get bgra() { return new Vec4(this._z, this._y, this._x, this._w) }
    get bgga() { return new Vec4(this._z, this._y, this._y, this._w) }
    get bgba() { return new Vec4(this._z, this._y, this._z, this._w) }
    get bgar() { return new Vec4(this._z, this._y, this._w, this._x) }
    get bgag() { return new Vec4(this._z, this._y, this._w, this._y) }
    get bgab() { return new Vec4(this._z, this._y, this._w, this._z) }
    get bgaa() { return new Vec4(this._z, this._y, this._w, this._w) }
    get bbra() { return new Vec4(this._z, this._z, this._x, this._w) }
    get bbga() { return new Vec4(this._z, this._z, this._y, this._w) }
    get bbba() { return new Vec4(this._z, this._z, this._z, this._w) }
    get bbar() { return new Vec4(this._z, this._z, this._w, this._x) }
    get bbag() { return new Vec4(this._z, this._z, this._w, this._y) }
    get bbab() { return new Vec4(this._z, this._z, this._w, this._z) }
    get bbaa() { return new Vec4(this._z, this._z, this._w, this._w) }
    get barr() { return new Vec4(this._z, this._w, this._x, this._x) }
    get barg() { return new Vec4(this._z, this._w, this._x, this._y) }
    get barb() { return new Vec4(this._z, this._w, this._x, this._z) }
    get bara() { return new Vec4(this._z, this._w, this._x, this._w) }
    get bagr() { return new Vec4(this._z, this._w, this._y, this._x) }
    get bagg() { return new Vec4(this._z, this._w, this._y, this._y) }
    get bagb() { return new Vec4(this._z, this._w, this._y, this._z) }
    get baga() { return new Vec4(this._z, this._w, this._y, this._w) }
    get babr() { return new Vec4(this._z, this._w, this._z, this._x) }
    get babg() { return new Vec4(this._z, this._w, this._z, this._y) }
    get babb() { return new Vec4(this._z, this._w, this._z, this._z) }
    get baba() { return new Vec4(this._z, this._w, this._z, this._w) }
    get baar() { return new Vec4(this._z, this._w, this._w, this._x) }
    get baag() { return new Vec4(this._z, this._w, this._w, this._y) }
    get baab() { return new Vec4(this._z, this._w, this._w, this._z) }
    get baaa() { return new Vec4(this._z, this._w, this._w, this._w) }
    get arrr() { return new Vec4(this._w, this._x, this._x, this._x) }
    get arrg() { return new Vec4(this._w, this._x, this._x, this._y) }
    get arrb() { return new Vec4(this._w, this._x, this._x, this._z) }
    get arra() { return new Vec4(this._w, this._x, this._x, this._w) }
    get argr() { return new Vec4(this._w, this._x, this._y, this._x) }
    get argg() { return new Vec4(this._w, this._x, this._y, this._y) }
    get argb() { return new Vec4(this._w, this._x, this._y, this._z) }
    get arga() { return new Vec4(this._w, this._x, this._y, this._w) }
    get arbr() { return new Vec4(this._w, this._x, this._z, this._x) }
    get arbg() { return new Vec4(this._w, this._x, this._z, this._y) }
    get arbb() { return new Vec4(this._w, this._x, this._z, this._z) }
    get arba() { return new Vec4(this._w, this._x, this._z, this._w) }
    get arar() { return new Vec4(this._w, this._x, this._w, this._x) }
    get arag() { return new Vec4(this._w, this._x, this._w, this._y) }
    get arab() { return new Vec4(this._w, this._x, this._w, this._z) }
    get araa() { return new Vec4(this._w, this._x, this._w, this._w) }
    get agrr() { return new Vec4(this._w, this._y, this._x, this._x) }
    get agrg() { return new Vec4(this._w, this._y, this._x, this._y) }
    get agrb() { return new Vec4(this._w, this._y, this._x, this._z) }
    get agra() { return new Vec4(this._w, this._y, this._x, this._w) }
    get aggr() { return new Vec4(this._w, this._y, this._y, this._x) }
    get aggg() { return new Vec4(this._w, this._y, this._y, this._y) }
    get aggb() { return new Vec4(this._w, this._y, this._y, this._z) }
    get agga() { return new Vec4(this._w, this._y, this._y, this._w) }
    get agbr() { return new Vec4(this._w, this._y, this._z, this._x) }
    get agbg() { return new Vec4(this._w, this._y, this._z, this._y) }
    get agbb() { return new Vec4(this._w, this._y, this._z, this._z) }
    get agba() { return new Vec4(this._w, this._y, this._z, this._w) }
    get agar() { return new Vec4(this._w, this._y, this._w, this._x) }
    get agag() { return new Vec4(this._w, this._y, this._w, this._y) }
    get agab() { return new Vec4(this._w, this._y, this._w, this._z) }
    get agaa() { return new Vec4(this._w, this._y, this._w, this._w) }
    get abrr() { return new Vec4(this._w, this._z, this._x, this._x) }
    get abrg() { return new Vec4(this._w, this._z, this._x, this._y) }
    get abrb() { return new Vec4(this._w, this._z, this._x, this._z) }
    get abra() { return new Vec4(this._w, this._z, this._x, this._w) }
    get abgr() { return new Vec4(this._w, this._z, this._y, this._x) }
    get abgg() { return new Vec4(this._w, this._z, this._y, this._y) }
    get abgb() { return new Vec4(this._w, this._z, this._y, this._z) }
    get abga() { return new Vec4(this._w, this._z, this._y, this._w) }
    get abbr() { return new Vec4(this._w, this._z, this._z, this._x) }
    get abbg() { return new Vec4(this._w, this._z, this._z, this._y) }
    get abbb() { return new Vec4(this._w, this._z, this._z, this._z) }
    get abba() { return new Vec4(this._w, this._z, this._z, this._w) }
    get abar() { return new Vec4(this._w, this._z, this._w, this._x) }
    get abag() { return new Vec4(this._w, this._z, this._w, this._y) }
    get abab() { return new Vec4(this._w, this._z, this._w, this._z) }
    get abaa() { return new Vec4(this._w, this._z, this._w, this._w) }
    get aarr() { return new Vec4(this._w, this._w, this._x, this._x) }
    get aarg() { return new Vec4(this._w, this._w, this._x, this._y) }
    get aarb() { return new Vec4(this._w, this._w, this._x, this._z) }
    get aara() { return new Vec4(this._w, this._w, this._x, this._w) }
    get aagr() { return new Vec4(this._w, this._w, this._y, this._x) }
    get aagg() { return new Vec4(this._w, this._w, this._y, this._y) }
    get aagb() { return new Vec4(this._w, this._w, this._y, this._z) }
    get aaga() { return new Vec4(this._w, this._w, this._y, this._w) }
    get aabr() { return new Vec4(this._w, this._w, this._z, this._x) }
    get aabg() { return new Vec4(this._w, this._w, this._z, this._y) }
    get aabb() { return new Vec4(this._w, this._w, this._z, this._z) }
    get aaba() { return new Vec4(this._w, this._w, this._z, this._w) }
    get aaar() { return new Vec4(this._w, this._w, this._w, this._x) }
    get aaag() { return new Vec4(this._w, this._w, this._w, this._y) }
    get aaab() { return new Vec4(this._w, this._w, this._w, this._z) }
    get aaaa() { return new Vec4(this._w, this._w, this._w, this._w) }

    set xyzw(xyzw) { if(xyzw instanceof Vec4) {this._x = xyzw.x; this._y = xyzw.y; this._z = xyzw.z; this._w = xyzw.w } else if (typeof xyzw === "number") this._x = this._y = this._z = this._w = xyzw; else throw TypeError(`Vec4 or number expected, got ${typeof xyzw}`)}
    set xywz(xywz) { if(xywz instanceof Vec4) {this._x = xywz.x; this._y = xywz.y; this._w = xywz.z; this._z = xywz.w } else if (typeof xywz === "number") this._x = this._y = this._w = this._z = xywz; else throw TypeError(`Vec4 or number expected, got ${typeof xywz}`)}
    set xzyw(xzyw) { if(xzyw instanceof Vec4) {this._x = xzyw.x; this._z = xzyw.y; this._y = xzyw.z; this._w = xzyw.w } else if (typeof xzyw === "number") this._x = this._z = this._y = this._w = xzyw; else throw TypeError(`Vec4 or number expected, got ${typeof xzyw}`)}
    set xzwy(xzwy) { if(xzwy instanceof Vec4) {this._x = xzwy.x; this._z = xzwy.y; this._w = xzwy.z; this._y = xzwy.w } else if (typeof xzwy === "number") this._x = this._z = this._w = this._y = xzwy; else throw TypeError(`Vec4 or number expected, got ${typeof xzwy}`)}
    set xwyz(xwyz) { if(xwyz instanceof Vec4) {this._x = xwyz.x; this._w = xwyz.y; this._y = xwyz.z; this._z = xwyz.w } else if (typeof xwyz === "number") this._x = this._w = this._y = this._z = xwyz; else throw TypeError(`Vec4 or number expected, got ${typeof xwyz}`)}
    set xwzy(xwzy) { if(xwzy instanceof Vec4) {this._x = xwzy.x; this._w = xwzy.y; this._z = xwzy.z; this._y = xwzy.w } else if (typeof xwzy === "number") this._x = this._w = this._z = this._y = xwzy; else throw TypeError(`Vec4 or number expected, got ${typeof xwzy}`)}
    set yxzw(yxzw) { if(yxzw instanceof Vec4) {this._y = yxzw.x; this._x = yxzw.y; this._z = yxzw.z; this._w = yxzw.w } else if (typeof yxzw === "number") this._y = this._x = this._z = this._w = yxzw; else throw TypeError(`Vec4 or number expected, got ${typeof yxzw}`)}
    set yxwz(yxwz) { if(yxwz instanceof Vec4) {this._y = yxwz.x; this._x = yxwz.y; this._w = yxwz.z; this._z = yxwz.w } else if (typeof yxwz === "number") this._y = this._x = this._w = this._z = yxwz; else throw TypeError(`Vec4 or number expected, got ${typeof yxwz}`)}
    set yzxw(yzxw) { if(yzxw instanceof Vec4) {this._y = yzxw.x; this._z = yzxw.y; this._x = yzxw.z; this._w = yzxw.w } else if (typeof yzxw === "number") this._y = this._z = this._x = this._w = yzxw; else throw TypeError(`Vec4 or number expected, got ${typeof yzxw}`)}
    set yzwx(yzwx) { if(yzwx instanceof Vec4) {this._y = yzwx.x; this._z = yzwx.y; this._w = yzwx.z; this._x = yzwx.w } else if (typeof yzwx === "number") this._y = this._z = this._w = this._x = yzwx; else throw TypeError(`Vec4 or number expected, got ${typeof yzwx}`)}
    set ywxz(ywxz) { if(ywxz instanceof Vec4) {this._y = ywxz.x; this._w = ywxz.y; this._x = ywxz.z; this._z = ywxz.w } else if (typeof ywxz === "number") this._y = this._w = this._x = this._z = ywxz; else throw TypeError(`Vec4 or number expected, got ${typeof ywxz}`)}
    set ywzx(ywzx) { if(ywzx instanceof Vec4) {this._y = ywzx.x; this._w = ywzx.y; this._z = ywzx.z; this._x = ywzx.w } else if (typeof ywzx === "number") this._y = this._w = this._z = this._x = ywzx; else throw TypeError(`Vec4 or number expected, got ${typeof ywzx}`)}
    set zxyw(zxyw) { if(zxyw instanceof Vec4) {this._z = zxyw.x; this._x = zxyw.y; this._y = zxyw.z; this._w = zxyw.w } else if (typeof zxyw === "number") this._z = this._x = this._y = this._w = zxyw; else throw TypeError(`Vec4 or number expected, got ${typeof zxyw}`)}
    set zxwy(zxwy) { if(zxwy instanceof Vec4) {this._z = zxwy.x; this._x = zxwy.y; this._w = zxwy.z; this._y = zxwy.w } else if (typeof zxwy === "number") this._z = this._x = this._w = this._y = zxwy; else throw TypeError(`Vec4 or number expected, got ${typeof zxwy}`)}
    set zyxw(zyxw) { if(zyxw instanceof Vec4) {this._z = zyxw.x; this._y = zyxw.y; this._x = zyxw.z; this._w = zyxw.w } else if (typeof zyxw === "number") this._z = this._y = this._x = this._w = zyxw; else throw TypeError(`Vec4 or number expected, got ${typeof zyxw}`)}
    set zywx(zywx) { if(zywx instanceof Vec4) {this._z = zywx.x; this._y = zywx.y; this._w = zywx.z; this._x = zywx.w } else if (typeof zywx === "number") this._z = this._y = this._w = this._x = zywx; else throw TypeError(`Vec4 or number expected, got ${typeof zywx}`)}
    set zwxy(zwxy) { if(zwxy instanceof Vec4) {this._z = zwxy.x; this._w = zwxy.y; this._x = zwxy.z; this._y = zwxy.w } else if (typeof zwxy === "number") this._z = this._w = this._x = this._y = zwxy; else throw TypeError(`Vec4 or number expected, got ${typeof zwxy}`)}
    set zwyx(zwyx) { if(zwyx instanceof Vec4) {this._z = zwyx.x; this._w = zwyx.y; this._y = zwyx.z; this._x = zwyx.w } else if (typeof zwyx === "number") this._z = this._w = this._y = this._x = zwyx; else throw TypeError(`Vec4 or number expected, got ${typeof zwyx}`)}
    set wxyz(wxyz) { if(wxyz instanceof Vec4) {this._w = wxyz.x; this._x = wxyz.y; this._y = wxyz.z; this._z = wxyz.w } else if (typeof wxyz === "number") this._w = this._x = this._y = this._z = wxyz; else throw TypeError(`Vec4 or number expected, got ${typeof wxyz}`)}
    set wxzy(wxzy) { if(wxzy instanceof Vec4) {this._w = wxzy.x; this._x = wxzy.y; this._z = wxzy.z; this._y = wxzy.w } else if (typeof wxzy === "number") this._w = this._x = this._z = this._y = wxzy; else throw TypeError(`Vec4 or number expected, got ${typeof wxzy}`)}
    set wyxz(wyxz) { if(wyxz instanceof Vec4) {this._w = wyxz.x; this._y = wyxz.y; this._x = wyxz.z; this._z = wyxz.w } else if (typeof wyxz === "number") this._w = this._y = this._x = this._z = wyxz; else throw TypeError(`Vec4 or number expected, got ${typeof wyxz}`)}
    set wyzx(wyzx) { if(wyzx instanceof Vec4) {this._w = wyzx.x; this._y = wyzx.y; this._z = wyzx.z; this._x = wyzx.w } else if (typeof wyzx === "number") this._w = this._y = this._z = this._x = wyzx; else throw TypeError(`Vec4 or number expected, got ${typeof wyzx}`)}
    set wzxy(wzxy) { if(wzxy instanceof Vec4) {this._w = wzxy.x; this._z = wzxy.y; this._x = wzxy.z; this._y = wzxy.w } else if (typeof wzxy === "number") this._w = this._z = this._x = this._y = wzxy; else throw TypeError(`Vec4 or number expected, got ${typeof wzxy}`)}
    set wzyx(wzyx) { if(wzyx instanceof Vec4) {this._w = wzyx.x; this._z = wzyx.y; this._y = wzyx.z; this._x = wzyx.w } else if (typeof wzyx === "number") this._w = this._z = this._y = this._x = wzyx; else throw TypeError(`Vec4 or number expected, got ${typeof wzyx}`)}

    set rgba(rgba) { if(rgba instanceof Vec4) {this._x = rgba.x; this._y = rgba.y; this._z = rgba.z; this._w = rgba.w } else if (typeof rgba === "number") this._x = this._y = this._z = this._w = rgba; else throw TypeError(`Vec4 or number expected, got ${typeof rgba}`)}
    set rgab(rgab) { if(rgab instanceof Vec4) {this._x = rgab.x; this._y = rgab.y; this._w = rgab.z; this._z = rgab.w } else if (typeof rgab === "number") this._x = this._y = this._w = this._z = rgab; else throw TypeError(`Vec4 or number expected, got ${typeof rgab}`)}
    set rbga(rbga) { if(rbga instanceof Vec4) {this._x = rbga.x; this._z = rbga.y; this._y = rbga.z; this._w = rbga.w } else if (typeof rbga === "number") this._x = this._z = this._y = this._w = rbga; else throw TypeError(`Vec4 or number expected, got ${typeof rbga}`)}
    set rbag(rbag) { if(rbag instanceof Vec4) {this._x = rbag.x; this._z = rbag.y; this._w = rbag.z; this._y = rbag.w } else if (typeof rbag === "number") this._x = this._z = this._w = this._y = rbag; else throw TypeError(`Vec4 or number expected, got ${typeof rbag}`)}
    set ragb(ragb) { if(ragb instanceof Vec4) {this._x = ragb.x; this._w = ragb.y; this._y = ragb.z; this._z = ragb.w } else if (typeof ragb === "number") this._x = this._w = this._y = this._z = ragb; else throw TypeError(`Vec4 or number expected, got ${typeof ragb}`)}
    set rabg(rabg) { if(rabg instanceof Vec4) {this._x = rabg.x; this._w = rabg.y; this._z = rabg.z; this._y = rabg.w } else if (typeof rabg === "number") this._x = this._w = this._z = this._y = rabg; else throw TypeError(`Vec4 or number expected, got ${typeof rabg}`)}
    set grba(grba) { if(grba instanceof Vec4) {this._y = grba.x; this._x = grba.y; this._z = grba.z; this._w = grba.w } else if (typeof grba === "number") this._y = this._x = this._z = this._w = grba; else throw TypeError(`Vec4 or number expected, got ${typeof grba}`)}
    set grab(grab) { if(grab instanceof Vec4) {this._y = grab.x; this._x = grab.y; this._w = grab.z; this._z = grab.w } else if (typeof grab === "number") this._y = this._x = this._w = this._z = grab; else throw TypeError(`Vec4 or number expected, got ${typeof grab}`)}
    set gbra(gbra) { if(gbra instanceof Vec4) {this._y = gbra.x; this._z = gbra.y; this._x = gbra.z; this._w = gbra.w } else if (typeof gbra === "number") this._y = this._z = this._x = this._w = gbra; else throw TypeError(`Vec4 or number expected, got ${typeof gbra}`)}
    set gbar(gbar) { if(gbar instanceof Vec4) {this._y = gbar.x; this._z = gbar.y; this._w = gbar.z; this._x = gbar.w } else if (typeof gbar === "number") this._y = this._z = this._w = this._x = gbar; else throw TypeError(`Vec4 or number expected, got ${typeof gbar}`)}
    set garb(garb) { if(garb instanceof Vec4) {this._y = garb.x; this._w = garb.y; this._x = garb.z; this._z = garb.w } else if (typeof garb === "number") this._y = this._w = this._x = this._z = garb; else throw TypeError(`Vec4 or number expected, got ${typeof garb}`)}
    set gabr(gabr) { if(gabr instanceof Vec4) {this._y = gabr.x; this._w = gabr.y; this._z = gabr.z; this._x = gabr.w } else if (typeof gabr === "number") this._y = this._w = this._z = this._x = gabr; else throw TypeError(`Vec4 or number expected, got ${typeof gabr}`)}
    set brga(brga) { if(brga instanceof Vec4) {this._z = brga.x; this._x = brga.y; this._y = brga.z; this._w = brga.w } else if (typeof brga === "number") this._z = this._x = this._y = this._w = brga; else throw TypeError(`Vec4 or number expected, got ${typeof brga}`)}
    set brag(brag) { if(brag instanceof Vec4) {this._z = brag.x; this._x = brag.y; this._w = brag.z; this._y = brag.w } else if (typeof brag === "number") this._z = this._x = this._w = this._y = brag; else throw TypeError(`Vec4 or number expected, got ${typeof brag}`)}
    set bgra(bgra) { if(bgra instanceof Vec4) {this._z = bgra.x; this._y = bgra.y; this._x = bgra.z; this._w = bgra.w } else if (typeof bgra === "number") this._z = this._y = this._x = this._w = bgra; else throw TypeError(`Vec4 or number expected, got ${typeof bgra}`)}
    set bgar(bgar) { if(bgar instanceof Vec4) {this._z = bgar.x; this._y = bgar.y; this._w = bgar.z; this._x = bgar.w } else if (typeof bgar === "number") this._z = this._y = this._w = this._x = bgar; else throw TypeError(`Vec4 or number expected, got ${typeof bgar}`)}
    set barg(barg) { if(barg instanceof Vec4) {this._z = barg.x; this._w = barg.y; this._x = barg.z; this._y = barg.w } else if (typeof barg === "number") this._z = this._w = this._x = this._y = barg; else throw TypeError(`Vec4 or number expected, got ${typeof barg}`)}
    set bagr(bagr) { if(bagr instanceof Vec4) {this._z = bagr.x; this._w = bagr.y; this._y = bagr.z; this._x = bagr.w } else if (typeof bagr === "number") this._z = this._w = this._y = this._x = bagr; else throw TypeError(`Vec4 or number expected, got ${typeof bagr}`)}
    set argb(argb) { if(argb instanceof Vec4) {this._w = argb.x; this._x = argb.y; this._y = argb.z; this._z = argb.w } else if (typeof argb === "number") this._w = this._x = this._y = this._z = argb; else throw TypeError(`Vec4 or number expected, got ${typeof argb}`)}
    set arbg(arbg) { if(arbg instanceof Vec4) {this._w = arbg.x; this._x = arbg.y; this._z = arbg.z; this._y = arbg.w } else if (typeof arbg === "number") this._w = this._x = this._z = this._y = arbg; else throw TypeError(`Vec4 or number expected, got ${typeof arbg}`)}
    set agrb(agrb) { if(agrb instanceof Vec4) {this._w = agrb.x; this._y = agrb.y; this._x = agrb.z; this._z = agrb.w } else if (typeof agrb === "number") this._w = this._y = this._x = this._z = agrb; else throw TypeError(`Vec4 or number expected, got ${typeof agrb}`)}
    set agbr(agbr) { if(agbr instanceof Vec4) {this._w = agbr.x; this._y = agbr.y; this._z = agbr.z; this._x = agbr.w } else if (typeof agbr === "number") this._w = this._y = this._z = this._x = agbr; else throw TypeError(`Vec4 or number expected, got ${typeof agbr}`)}
    set abrg(abrg) { if(abrg instanceof Vec4) {this._w = abrg.x; this._z = abrg.y; this._x = abrg.z; this._y = abrg.w } else if (typeof abrg === "number") this._w = this._z = this._x = this._y = abrg; else throw TypeError(`Vec4 or number expected, got ${typeof abrg}`)}
    set abgr(abgr) { if(abgr instanceof Vec4) {this._w = abgr.x; this._z = abgr.y; this._y = abgr.z; this._x = abgr.w } else if (typeof abgr === "number") this._w = this._z = this._y = this._x = abgr; else throw TypeError(`Vec4 or number expected, got ${typeof abgr}`)}

    constructor(x, y, z, w) {
        if (x instanceof Vec4) {
            super(x.x, x.y, x.z)
            this._w = x.w
            if (y !== undefined || z !== undefined || w !== undefined) console.warn(`Vec4 constructed from Vec4, but extra arguments present: ${y}, ${z}, ${w}`)
            return
        }

        if (x instanceof Vec3 && typeof y === "number") {
            super(x)
            this._w = y
            if (z !== undefined || w !== undefined) console.warn(`Vec4 constructed from Vec3 and number, but extra arguments present: ${z}, ${w}`)
            return
        }
        if (typeof x === "number" && y instanceof Vec3) {
            super(x, y.x, y.y)
            this._w = y.z
            if (z !== undefined || w !== undefined) console.warn(`Vec4 constructed from number and Vec3, but extra arguments present: ${z}, ${w}`)
            return
        }

        if (x instanceof Vec2 && y instanceof Vec2) {
            super(x, y.x)
            this._w = y.y
            if (z !== undefined || w !== undefined) console.warn(`Vec4 constructed from Vec2 and Vec2, but extra arguments present: ${z}, ${w}`)
            return
        }
        if (x instanceof Vec2 && typeof y === "number" && typeof z === "number") {
            super(x, y)
            this._w = z
            if (w !== undefined) console.warn(`Vec4 constructed from Vec2, number and number, but extra argument present: ${w}`)
            return
        }
        if (typeof x === "number" && y instanceof Vec2 && typeof z === "number") {
            super(x, y)
            this._w = z
            if (w !== undefined) console.warn(`Vec4 constructed from number, Vec2 and number, but extra argument present: ${w}`)
            return
        }
        if (typeof x === "number" && typeof y === "number" && z instanceof Vec2) {
            super(x, y, z.x)
            this._w = z.y
            if (w !== undefined) console.warn(`Vec4 constructed from number, number and Vec2, but extra argument present: ${w}`)
            return
        }

        if (typeof x === "number" && typeof y === "number" && typeof z === "number" && typeof w === "number") {
            super(x, y, z)
            this._w = w;
            return
        }
        throw TypeError(`Wrong types of X, Y, Z and/or W: ${typeof x}, ${typeof y}, ${typeof z}, ${typeof w}`)
    }

    static get zero() { return new Vec4(0, 0, 0, 0)}
    static of(val) { return new Vec4(val, val, val, val) }

    plus(other)     { if (other instanceof Vec4) return new Vec4(this._x + other.x, this._y + other.y, this._z + other.z, this._w + other.w); else if (typeof other === "number") return new Vec4(this._x + other, this._y + other, this._z + other, this._w + other); else throw TypeError(`Vec4 or number expected, got ${typeof other}`)}
    minus(other)    { if (other instanceof Vec4) return new Vec4(this._x - other.x, this._y - other.y, this._z - other.z, this._w - other.w); else if (typeof other === "number") return new Vec4(this._x - other, this._y - other, this._z - other, this._w - other); else throw TypeError(`Vec4 or number expected, got ${typeof other}`)}
    times(other)    { if (other instanceof Vec4) return new Vec4(this._x * other.x, this._y * other.y, this._z * other.z, this._w * other.w); else if (typeof other === "number") return new Vec4(this._x * other, this._y * other, this._z * other, this._w * other); else throw TypeError(`Vec4 or number expected, got ${typeof other}`)}
    divide(other)   { if (other instanceof Vec4) return new Vec4(this._x / other.x, this._y / other.y, this._z / other.z, this._w / other.w); else if (typeof other === "number") return new Vec4(this._x / other, this._y / other, this._z / other, this._w / other); else throw TypeError(`Vec4 or number expected, got ${typeof other}`)}
    exponent(other) { if (other instanceof Vec4) return new Vec4(this._x ** other.x, this._y ** other.y, this._z ** other.z, this._w ** other.w); else if (typeof other === "number") return new Vec4(this._x ** other, this._y ** other, this._z ** other, this._w ** other); else throw TypeError(`Vec4 or number expected, got ${typeof other}`)}

    get homogeneous() {
        return new Vec3(this._x / this._w, this._y / this._w, this._z / this._w)
    }

    toString() {
        return `Vec4(${this._x}, ${this._y}, ${this._z}, ${this._w})`
    }
}

export class Matrix4 extends MatrixLike {
    _m_0_0; _m_0_1; _m_0_2; _m_0_3;
    _m_1_0; _m_1_1; _m_1_2; _m_1_3;
    _m_2_0; _m_2_1; _m_2_2; _m_2_3;
    _m_3_0; _m_3_1; _m_3_2; _m_3_3;

    getAt(x, y) {
        if (x === 0) {
            if (y === 0) return this._m_0_0
            if (y === 1) return this._m_0_1
            if (y === 2) return this._m_0_2
            if (y === 3) return this._m_0_3
        }
        if (x === 1) {
            if (y === 0) return this._m_1_0
            if (y === 1) return this._m_1_1
            if (y === 2) return this._m_1_2
            if (y === 3) return this._m_1_3
        }
        if (x === 2) {
            if (y === 0) return this._m_2_0
            if (y === 1) return this._m_2_1
            if (y === 2) return this._m_2_2
            if (y === 3) return this._m_2_3
        }
        if (x === 3) {
            if (y === 0) return this._m_3_0
            if (y === 1) return this._m_3_1
            if (y === 2) return this._m_3_2
            if (y === 3) return this._m_3_3
        }
    }

    setAt(val, x, y) {
        if (x === 0) {
            if (y === 0) { this._m_0_0 = val; return }
            if (y === 1) { this._m_0_1 = val; return }
            if (y === 2) { this._m_0_2 = val; return }
            if (y === 3) { this._m_0_3 = val; return }
        }
        if (x === 1) {
            if (y === 0) { this._m_1_0 = val; return }
            if (y === 1) { this._m_1_1 = val; return }
            if (y === 2) { this._m_1_2 = val; return }
            if (y === 3) { this._m_1_3 = val; return }
        }
        if (x === 2) {
            if (y === 0) { this._m_2_0 = val; return }
            if (y === 1) { this._m_2_1 = val; return }
            if (y === 2) { this._m_2_2 = val; return }
            if (y === 3) { this._m_2_3 = val; return }
        }
        if (x === 3) {
            if (y === 0) { this._m_3_0 = val; return }
            if (y === 1) { this._m_3_1 = val; return }
            if (y === 2) { this._m_3_2 = val; return }
            if (y === 3) { this._m_3_3 = val; }
        }
    }

    matrixDimensions() { return new Vec2(4, 4) }

    get m00() { return this._m_0_0 }
    get m01() { return this._m_0_1 }
    get m02() { return this._m_0_2 }
    get m03() { return this._m_0_3 }
    get m10() { return this._m_1_0 }
    get m11() { return this._m_1_1 }
    get m12() { return this._m_1_2 }
    get m13() { return this._m_1_3 }
    get m20() { return this._m_2_0 }
    get m21() { return this._m_2_1 }
    get m22() { return this._m_2_2 }
    get m23() { return this._m_2_3 }
    get m30() { return this._m_3_0 }
    get m31() { return this._m_3_1 }
    get m32() { return this._m_3_2 }
    get m33() { return this._m_3_3 }

    set m00(v) { if (typeof v === "number") this._m_0_0 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m01(v) { if (typeof v === "number") this._m_0_1 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m02(v) { if (typeof v === "number") this._m_0_2 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m03(v) { if (typeof v === "number") this._m_0_3 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m10(v) { if (typeof v === "number") this._m_1_0 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m11(v) { if (typeof v === "number") this._m_1_1 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m12(v) { if (typeof v === "number") this._m_1_2 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m13(v) { if (typeof v === "number") this._m_1_3 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m20(v) { if (typeof v === "number") this._m_2_0 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m21(v) { if (typeof v === "number") this._m_2_1 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m22(v) { if (typeof v === "number") this._m_2_2 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m23(v) { if (typeof v === "number") this._m_2_3 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m30(v) { if (typeof v === "number") this._m_3_0 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m31(v) { if (typeof v === "number") this._m_3_1 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m32(v) { if (typeof v === "number") this._m_3_2 = v; else throw TypeError(`number expected, got ${typeof v}`) }
    set m33(v) { if (typeof v === "number") this._m_3_3 = v; else throw TypeError(`number expected, got ${typeof v}`) }

    static of(val) {
        return new Matrix4(
            val, val, val, val,
            val, val, val, val,
            val, val, val, val,
            val, val, val, val,
        )
    }

    static get identity() {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        )
    }

    constructor(
        m00, 	m01, 	m02, 	m03,
        m10, 	m11, 	m12, 	m13,
        m20, 	m21, 	m22, 	m23,
        m30, 	m31, 	m32, 	m33,
    ) {
        super()

        if (typeof m00 !== "number") throw TypeError(`number expected for m00, got ${typeof m00}`)
        if (typeof m01 !== "number") throw TypeError(`number expected for m01, got ${typeof m01}`)
        if (typeof m02 !== "number") throw TypeError(`number expected for m02, got ${typeof m02}`)
        if (typeof m03 !== "number") throw TypeError(`number expected for m03, got ${typeof m03}`)
        if (typeof m10 !== "number") throw TypeError(`number expected for m10, got ${typeof m10}`)
        if (typeof m11 !== "number") throw TypeError(`number expected for m11, got ${typeof m11}`)
        if (typeof m12 !== "number") throw TypeError(`number expected for m12, got ${typeof m12}`)
        if (typeof m13 !== "number") throw TypeError(`number expected for m13, got ${typeof m13}`)
        if (typeof m20 !== "number") throw TypeError(`number expected for m20, got ${typeof m20}`)
        if (typeof m21 !== "number") throw TypeError(`number expected for m21, got ${typeof m21}`)
        if (typeof m22 !== "number") throw TypeError(`number expected for m22, got ${typeof m22}`)
        if (typeof m23 !== "number") throw TypeError(`number expected for m23, got ${typeof m23}`)
        if (typeof m30 !== "number") throw TypeError(`number expected for m30, got ${typeof m30}`)
        if (typeof m31 !== "number") throw TypeError(`number expected for m31, got ${typeof m31}`)
        if (typeof m32 !== "number") throw TypeError(`number expected for m32, got ${typeof m32}`)
        if (typeof m33 !== "number") throw TypeError(`number expected for m33, got ${typeof m33}`)

        this._m_0_0 = m00
        this._m_0_1 = m01
        this._m_0_2 = m02
        this._m_0_3 = m03
        this._m_1_0 = m10
        this._m_1_1 = m11
        this._m_1_2 = m12
        this._m_1_3 = m13
        this._m_2_0 = m20
        this._m_2_1 = m21
        this._m_2_2 = m22
        this._m_2_3 = m23
        this._m_3_0 = m30
        this._m_3_1 = m31
        this._m_3_2 = m32
        this._m_3_3 = m33
    }

    static rotationX(angle) {
        let alpha = angle / 180 * Math.PI
        return new Matrix4(
             1, 0, 0, 0,
             0, Math.cos(alpha), -Math.sin(alpha), 0,
             0, Math.sin(alpha), Math.cos(alpha), 0,
             0, 0, 0, 1
        )
    }

    static rotationY(angle) {
        let alpha = angle / 180 * Math.PI
        return new Matrix4(
            Math.cos(alpha), 0, Math.sin(alpha), 0,
            0, 1, 0, 0,
            -Math.sin(alpha), 0, Math.cos(alpha), 0,
            0, 0, 0, 1
        )
    }

    static rotationZ(angle) {
        let alpha = angle / 180 * Math.PI
        return new Matrix4(
            Math.cos(alpha), -Math.sin(alpha), 0, 0,
            Math.sin(alpha), Math.cos(alpha), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        )
    }

    static rotationZYX(yaw, pitch, roll) {
        return MatrixLike.mul(this.rotationZ(yaw), MatrixLike.mul(this.rotationY(pitch), this.rotationX(roll)))
    }

    static translation(x, y, z) {
        let vec = new Vec3(x, y, z)
        return new Matrix4(
            1, 0, 0, vec.x,
            0, 1, 0, vec.y,
            0, 0, 1, vec.z,
            0, 0, 0, 1
        )
    }
}

export class VariableMatrix extends MatrixLike {
    data = []
    dim = new Vec2(0, 0)

    constructor(val, x, y) {
        super();
        if (val instanceof VariableMatrix) {
            this.dim = val.dim

            if (x !== undefined || y !== undefined) console.warn("VariableMatrix constructed from VariableMatrix, but extra arguments present")

            for (let i = 0; i < this.dim.x; i++) {
                let e = []
                for (let j = 0; j < this.dim.y; j++) {
                    e.push(val.matrixGet(i, j))
                }
                this.data.push(e)
            }

            return
        }
        if (typeof val !== "number") throw TypeError(`number expected, got ${typeof val}`)
        this.dim = new Vec2(x, y)
        for (let i = 0; i < this.dim.x; i++) {
            let e = []
            for (let j = 0; j < this.dim.y; j++) {
                e.push(val)
            }
            this.data.push(e)
        }
    }
}