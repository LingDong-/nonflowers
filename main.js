var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// seedable pseudo random number generator
var PRNG = /** @class */ (function () {
    function PRNG(seed) {
        this.p = 999979;
        this.q = 999983;
        this.m = this.p * this.q;
        this.seed(seed);
    }
    PRNG.prototype.hash = function (x) {
        var y = window.btoa(JSON.stringify(x));
        var z = 0;
        for (var i = 0; i < y.length; i++) {
            z += y.charCodeAt(i) * Math.pow(128, i);
        }
        return z;
    };
    PRNG.prototype.seed = function (x) {
        var _this = this;
        if (x == undefined) {
            x = (new Date()).getTime();
        }
        var y = 0;
        var z = 0;
        var redo = function () { y = (_this.hash(x) + z) % _this.m; z += 1; };
        while (y % this.p == 0 || y % this.q == 0 || y == 0 || y == 1) {
            redo();
        }
        this.s = y;
        console.log(["int seed", x, this.s]);
        for (var i = 0; i < 10; i++) {
            this.next();
        }
    };
    PRNG.prototype.next = function () {
        this.s = (this.s * this.s) % this.m;
        return this.s / this.m;
    };
    PRNG.prototype.test = function (f) {
        var F = f || function () { return this.next(); };
        var t0 = (new Date()).getTime();
        var chart = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < 10000000; i++) {
            chart[Math.floor(F() * 10)] += 1;
        }
        console.log(chart);
        console.log("finished in " + ((new Date()).getTime() - t0));
        return chart;
    };
    return PRNG;
}());
// Nonflowers
// Procedurally generated paintings of nonexistent flowers.
// (c) Lingdong Huang 2018
//todo by iloseall remove this
for (var i = 1; i < 4; i++) {
    function f(i) {
        Object.defineProperty(Array.prototype, "-" + i, {
            get: function () {
                return this[this.length - i];
            },
            set: function (n) {
                this[this.length - i] = n;
            },
        });
    }
    f(i);
}
// math constants
var rad2deg = 180 / Math.PI;
var deg2rad = Math.PI / 180;
var PI = Math.PI;
var sin = Math.sin;
var cos = Math.cos;
var abs = Math.abs;
var pow = Math.pow;
function rad(x) { return x * deg2rad; }
function deg(x) { return x * rad2deg; }
var Filter = {
    wispy: function (x, y, r, g, b, a) {
        var n = Noise.noise(x * 0.2, y * 0.2);
        var m = Noise.noise(x * 0.5, y * 0.5, 2);
        return [r, g * mapval(m, 0, 1, 0.95, 1), b * mapval(m, 0, 1, 0.9, 1), a * mapval(n, 0, 1, 0.5, 1)];
    },
    fade: function (x, y, r, g, b, a) {
        var n = Noise.noise(x * 0.01, y * 0.01);
        return [r, g, b, a * Math.min(Math.max(mapval(n, 0, 1, 0, 1), 0), 1)];
    },
};
// parse url arguments
function parseArgs() {
    var query_part = window.location.href.split("?")[1];
    if (query_part == undefined) {
        return {};
    }
    var pairs = query_part.split("&");
    var params = {};
    for (var i = 0; i < pairs.length; i++) {
        var p = pairs[i].split("=");
        params[p[0]] = p[1];
    }
    return params;
}
// seedable pseudo random number generator
var _random;
var SEED;
//perlin noise adapted from p5.js
var Noise;
var CTX;
var BGCANV;
var PAPER_COL0 = [1, 0.99, 0.9];
var PAPER_COL1 = [0.98, 0.91, 0.74];
function _init() {
    //CTX = Layer.empty();
    var int_seed = 0;
    var url_params = parseArgs();
    var url_seed_param = url_params["seed"];
    if (url_seed_param) {
        int_seed = parseInt(url_seed_param, 10);
        if (isNaN(int_seed)) {
            int_seed = (new Date()).getTime();
        }
    }
    else {
        int_seed = (new Date()).getTime();
    }
    SEED = (int_seed.toString());
    var Prng = new PRNG(int_seed);
    console.log("seed:" + int_seed + "," + SEED);
    _random = function () { return Prng.next(); };
    Noise = new PerlinNoise(_random);
}
// distance between 2 coordinates in 2D
function distance(p0, p1) {
    return Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2));
}
// map float from one range to another
function mapval(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) * 1.0 / (istop - istart));
}
// random element from array
function randChoice(arr) {
    return arr[Math.floor(arr.length * _random())];
}
// normalized random number
function normRand(m, M) {
    return mapval(_random(), 0, 1, m, M);
}
// weighted randomness
function wtrand(func) {
    var x = _random();
    var y = _random();
    if (y < func(x)) {
        return x;
    }
    else {
        return wtrand(func);
    }
}
// gaussian randomness
function randGaussian() {
    return wtrand(function (x) { return Math.pow(Math.E, -24 * Math.pow(x - 0.5, 2)); }) * 2 - 1;
}
// sigmoid curve
function sigmoid(x, k) {
    k = (k != undefined) ? k : 10;
    return 1 / (1 + Math.exp(-k * (x - 0.5)));
}
// pseudo bean curve
function bean(x) {
    return pow(0.25 - pow(x - 0.5, 2), 0.5) * (2.6 + 2.4 * pow(x, 1.5)) * 0.54;
}
// interpolate between square and circle
var squircle = function (r, a) {
    return function (th) {
        while (th > PI / 2) {
            th -= PI / 2;
        }
        while (th < 0) {
            th += PI / 2;
        }
        return r * pow(1 / (pow(cos(th), a) + pow(sin(th), a)), 1 / a);
    };
};
// mid-point of an array of points
function midPt(p1, p2) {
    return v3.lerp(p1, p2, 0.5);
    //return [(p1[0]+p2[0])*0.5,(p1[1]+p2[1])*0.5,(p1[2]+p2[2])*0.5];
    /*
    const plist = (arguments.length == 1) ? arguments[0] : Array.apply(null, arguments)
    return plist.reduce(function(acc:[number,number,number],v:[number,number,number]){
      return [v[0]/plist.length+acc[0],
              v[1]/plist.length+acc[1],
              v[2]/plist.length+acc[2]]
    },[0,0,0]);
    */
}
// rational bezier curve
function bezmh(P, w) {
    if (P.length == 2) {
        P = [P[0], midPt(P[0], P[1]), P[1]];
    }
    var plist = [];
    for (var j = 0; j < P.length - 2; j++) {
        var p0 = void 0;
        var p1 = void 0;
        var p2 = void 0;
        if (j == 0) {
            p0 = P[j];
        }
        else {
            p0 = midPt(P[j], P[j + 1]);
        }
        p1 = P[j + 1];
        if (j == P.length - 3) {
            p2 = P[j + 2];
        }
        else {
            p2 = midPt(P[j + 1], P[j + 2]);
        }
        var pl = 20 + ((j == P.length - 3) ? 1 : 0);
        for (var i = 0; i < pl; i += 1) {
            var t = i / pl;
            var u = (Math.pow(1 - t, 2) + 2 * t * (1 - t) * w + t * t);
            plist.push([
                (Math.pow(1 - t, 2) * p0[0] + 2 * t * (1 - t) * p1[0] * w + t * t * p2[0]) / u,
                (Math.pow(1 - t, 2) * p0[1] + 2 * t * (1 - t) * p1[1] * w + t * t * p2[1]) / u,
                (Math.pow(1 - t, 2) * p0[2] + 2 * t * (1 - t) * p1[2] * w + t * t * p2[2]) / u
            ]);
        }
    }
    return plist;
}
// rgba to css color string
function rgba(r, g, b, a) {
    /*
    r = (r != undefined) ? r:255;
    g = (g != undefined) ? g:r;
    b = (b != undefined) ? b:g;
    */
    a = (a != undefined) ? a : 1.0;
    return "rgba(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + "," + a.toFixed(3) + ")";
}
// hsv to css color string
function hsv(h, s, v, a) {
    var c = v * s;
    var x = c * (1 - abs((h / 60) % 2 - 1));
    var m = v - c;
    var list = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]];
    var index = Math.floor(h / 60);
    if (index >= 6)
        index %= 6;
    var _a = __read(list[index], 3), rv = _a[0], gv = _a[1], bv = _a[2];
    var _b = __read([(rv + m) * 255, (gv + m) * 255, (bv + m) * 255], 3), r = _b[0], g = _b[1], b = _b[2];
    return rgba(r, g, b, a);
}
function polygon(args) {
    var ctx = args.ctx;
    var xof = (args.xof != undefined) ? args.xof : 0;
    var yof = (args.yof != undefined) ? args.yof : 0;
    var pts = (args.pts != undefined) ? args.pts : [];
    var col = (args.col != undefined) ? args.col : "black";
    var fil = (args.fil != undefined) ? args.fil : true;
    var str = (args.str != undefined) ? args.str : !fil;
    ctx.beginPath();
    if (pts.length > 0) {
        ctx.moveTo(pts[0][0] + xof, pts[0][1] + yof);
    }
    for (var i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0] + xof, pts[i][1] + yof);
    }
    if (fil) {
        ctx.fillStyle = col;
        ctx.fill();
    }
    if (str) {
        ctx.strokeStyle = col;
        ctx.stroke();
    }
}
// lerp hue wrapping around 360 degs
function lerpHue(h0, h1, p) {
    var methods = [
        [abs(h1 - h0), mapval(p, 0, 1, h0, h1)],
        [abs(h1 + 360 - h0), mapval(p, 0, 1, h0, h1 + 360)],
        [abs(h1 - 360 - h0), mapval(p, 0, 1, h0, h1 - 360)]
    ];
    methods.sort(function (x, y) { return (x[0] - y[0]); });
    return (methods[0][1] + 720) % 360;
}
// get rotation at given index of a poly-line
//ind :number, -4,-3,-2,-1,0,1,2,....
function grot(P, ind) {
    var d = v3.subtract(P[ind], P[ind - 1]);
    return v3.toeuler(d);
}
// generate 2d tube shape from list of points
function tubify(args) {
    //args = (args != undefined) ? args : {};
    //const pts = (args.pts != undefined) ? args.pts : [];
    //const wid = (args.wid != undefined) ? args.wid : (x:number)=>(10);
    var pts = args.pts, wid = args.wid;
    var vtxlist0 = [];
    var vtxlist1 = [];
    var vtxlist = [];
    for (var i = 1; i < pts.length - 1; i++) {
        var w = wid(i / pts.length);
        var a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
        var a2 = Math.atan2(pts[i][1] - pts[i + 1][1], pts[i][0] - pts[i + 1][0]);
        var a = (a1 + a2) / 2;
        if (a < a2) {
            a += PI;
        }
        vtxlist0.push([pts[i][0] + w * cos(a), (pts[i][1] + w * sin(a)), 0]);
        vtxlist1.push([pts[i][0] - w * cos(a), (pts[i][1] - w * sin(a)), 0]);
    }
    var l = pts.length - 1;
    var a0 = Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]) - Math.PI / 2;
    var a1 = Math.atan2(pts[l][1] - pts[l - 1][1], pts[l][0] - pts[l - 1][0]) - Math.PI / 2;
    var w0 = wid(0);
    var w1 = wid(1);
    vtxlist0.unshift([pts[0][0] + w0 * Math.cos(a0), (pts[0][1] + w0 * Math.sin(a0)), 0]);
    vtxlist1.unshift([pts[0][0] - w0 * Math.cos(a0), (pts[0][1] - w0 * Math.sin(a0)), 0]);
    vtxlist0.push([pts[l][0] + w1 * Math.cos(a1), (pts[l][1] + w1 * Math.sin(a1)), 0]);
    vtxlist1.push([pts[l][0] - w1 * Math.cos(a1), (pts[l][1] - w1 * Math.sin(a1)), 0]);
    return [vtxlist0, vtxlist1];
}
// line work with weight function
function stroke(args) {
    var wid = (args.wid != undefined) ? args.wid :
        function (x) { return (1 * sin(x * PI) * mapval(Noise.noise(x * 10), 0, 1, 0.5, 1)); };
    var _a = __read(tubify({ pts: args.pts, wid: wid }), 2), vtxlist0 = _a[0], vtxlist1 = _a[1];
    polygon({ pts: vtxlist0.concat(vtxlist1.reverse()),
        ctx: args.ctx, fil: true, col: args.col, xof: args.xof, yof: args.yof });
    return [vtxlist0, vtxlist1];
}
// generate paper texture
function paper(args) {
    var args = (args != undefined) ? args : {};
    var col = (args.col != undefined) ? args.col : [0.98, 0.91, 0.74];
    var tex = (args.tex != undefined) ? args.tex : 20;
    var spr = (args.spr != undefined) ? args.spr : 1;
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext("2d");
    if (ctx == null) {
        throw new Error("paper,canvas.getContext(\"2d\") is null");
    }
    var reso = 512;
    for (var i = 0; i < reso / 2 + 1; i++) {
        for (var j = 0; j < reso / 2 + 1; j++) {
            var c = (255 - Noise.noise(i * 0.1, j * 0.1) * tex * 0.5);
            c -= _random() * tex;
            var r = (c * col[0]);
            var g = (c * col[1]);
            var b = (c * col[2]);
            if (Noise.noise(i * 0.04, j * 0.04, 2) * _random() * spr > 0.7
                || _random() < 0.005 * spr) {
                var r = (c * 0.7);
                var g = (c * 0.5);
                var b = (c * 0.2);
            }
            ctx.fillStyle = rgba(r, g, b);
            ctx.fillRect(i, j, 1, 1);
            ctx.fillRect(reso - i, j, 1, 1);
            ctx.fillRect(i, reso - j, 1, 1);
            ctx.fillRect(reso - i, reso - j, 1, 1);
        }
    }
    return canvas;
}
function leaf(args) {
    var ctx = args.ctx;
    var xof = (args.xof != undefined) ? args.xof : 0;
    var yof = (args.yof != undefined) ? args.yof : 0;
    var rot = (args.rot != undefined) ? args.rot : [PI / 2, 0, 0];
    var len = (args.len != undefined) ? args.len : 500;
    var seg = (args.seg != undefined) ? args.seg : 40;
    var wid = (args.wid != undefined) ? args.wid : function (x) { return (sin(x * PI) * 20); };
    var vei = (args.vei != undefined) ? args.vei : [1, 3];
    var flo = (args.flo != undefined) ? args.flo : false;
    var col = (args.col != undefined) ? args.col :
        { min: [90, 0.2, 0.3, 1], max: [90, 0.1, 0.9, 1] };
    var cof = (args.cof != undefined) ? args.cof : function (x) { return (x); };
    var ben = (args.ben != undefined) ? args.ben :
        function (x) { return [normRand(-10, 10), 0, normRand(-5, 5)]; };
    var disp = v3.zero;
    var crot = v3.zero;
    var P = [disp];
    var ROT = [crot];
    var L = [disp];
    var R = [disp];
    var orient = function (v) { return (v3.roteuler(v, rot)); };
    for (var i = 0; i < seg; i++) {
        var p = i / (seg - 1);
        crot = v3.add(crot, v3.scale(ben(p), 1 / seg));
        disp = v3.add(disp, orient(v3.roteuler([0, 0, len / seg], crot)));
        var w = wid(p);
        var l = v3.add(disp, orient(v3.roteuler([-w, 0, 0], crot)));
        var r = v3.add(disp, orient(v3.roteuler([w, 0, 0], crot)));
        if (i > 0) {
            var v0 = v3.subtract(disp, L[-1]);
            var v1 = v3.subtract(l, disp);
            var v2 = v3.cross(v0, v1);
            if (!flo) {
                var lt = mapval(abs(v3.ang(v2, [0, -1, 0])), 0, PI, 1, 0);
            }
            else {
                var lt = p * normRand(0.95, 1);
            }
            lt = cof(lt) || 0;
            var h = lerpHue(col.min[0], col.max[0], lt);
            var s = mapval(lt, 0, 1, col.min[1], col.max[1]);
            var v = mapval(lt, 0, 1, col.min[2], col.max[2]);
            var a = mapval(lt, 0, 1, col.min[3], col.max[3]);
            polygon({ ctx: ctx, pts: [l, L[-1], P[-1], disp],
                xof: xof, yof: yof, fil: true, str: true, col: hsv(h, s, v, a) });
            polygon({ ctx: ctx, pts: [r, R[-1], P[-1], disp],
                xof: xof, yof: yof, fil: true, str: true, col: hsv(h, s, v, a) });
        }
        P.push(disp);
        ROT.push(crot);
        L.push(l);
        R.push(r);
    }
    if (vei[0] == 1) {
        for (var i = 1; i < P.length; i++) {
            for (var j = 0; j < vei[1]; j++) {
                var p = j / vei[1];
                var p0 = v3.lerp(L[i - 1], P[i - 1], p);
                var p1 = v3.lerp(L[i], P[i], p);
                var q0 = v3.lerp(R[i - 1], P[i - 1], p);
                var q1 = v3.lerp(R[i], P[i], p);
                polygon({ ctx: ctx, pts: [p0, p1],
                    xof: xof, yof: yof, fil: false, col: hsv(0, 0, 0, normRand(0.4, 0.9)) });
                polygon({ ctx: ctx, pts: [q0, q1],
                    xof: xof, yof: yof, fil: false, col: hsv(0, 0, 0, normRand(0.4, 0.9)) });
            }
        }
        stroke({ ctx: ctx, pts: P, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.3) });
    }
    else if (vei[0] == 2) {
        for (var i = 1; i < P.length - vei[1]; i += vei[2]) {
            polygon({ ctx: ctx, pts: [P[i], L[i + vei[1]]],
                xof: xof, yof: yof, fil: false, col: hsv(0, 0, 0, normRand(0.4, 0.9)) });
            polygon({ ctx: ctx, pts: [P[i], R[i + vei[1]]],
                xof: xof, yof: yof, fil: false, col: hsv(0, 0, 0, normRand(0.4, 0.9)) });
        }
        stroke({ ctx: ctx, pts: P, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.3) });
    }
    stroke({ ctx: ctx, pts: L, xof: xof, yof: yof, col: rgba(120, 100, 0, 0.3) });
    stroke({ ctx: ctx, pts: R, xof: xof, yof: yof, col: rgba(120, 100, 0, 0.3) });
    return P;
}
// generate stem-like structure
function stem(args) {
    var ctx = args.ctx;
    var xof = (args.xof != undefined) ? args.xof : 0;
    var yof = (args.yof != undefined) ? args.yof : 0;
    var rot = (args.rot != undefined) ? args.rot : [PI / 2, 0, 0];
    var len = (args.len != undefined) ? args.len : 400;
    var seg = (args.seg != undefined) ? args.seg : 40;
    var wid = (args.wid != undefined) ? args.wid : function (x) { return (6); };
    var col = (args.col != undefined) ? args.col :
        { min: [250, 0.2, 0.4, 1], max: [250, 0.3, 0.6, 1] };
    var ben = (args.ben != undefined) ? args.ben :
        function (x) { return [normRand(-10, 10), 0, normRand(-5, 5)]; };
    var disp = v3.zero;
    var crot = v3.zero;
    var P = [disp];
    var ROT = [crot];
    var orient = function (v) { return (v3.roteuler(v, rot)); };
    for (var i = 0; i < seg; i++) {
        var p = i / (seg - 1);
        crot = v3.add(crot, v3.scale(ben(p), 1 / seg));
        disp = v3.add(disp, orient(v3.roteuler([0, 0, len / seg], crot)));
        ROT.push(crot);
        P.push(disp);
    }
    var _a = __read(tubify({ pts: P, wid: wid }), 2), L = _a[0], R = _a[1];
    var wseg = 4;
    for (var i = 1; i < P.length; i++) {
        for (var j = 1; j < wseg; j++) {
            var m = (j - 1) / (wseg - 1);
            var n = j / (wseg - 1);
            var p = i / (P.length - 1);
            var p0 = v3.lerp(L[i - 1], R[i - 1], m);
            var p1 = v3.lerp(L[i], R[i], m);
            var p2 = v3.lerp(L[i - 1], R[i - 1], n);
            var p3 = v3.lerp(L[i], R[i], n);
            var lt = n / p;
            var h = lerpHue(col.min[0], col.max[0], lt) * mapval(Noise.noise(p * 10, m * 10, n * 10), 0, 1, 0.5, 1);
            var s = mapval(lt, 0, 1, col.max[1], col.min[1]) * mapval(Noise.noise(p * 10, m * 10, n * 10), 0, 1, 0.5, 1);
            var v = mapval(lt, 0, 1, col.min[2], col.max[2]) * mapval(Noise.noise(p * 10, m * 10, n * 10), 0, 1, 0.5, 1);
            var a = mapval(lt, 0, 1, col.min[3], col.max[3]);
            polygon({ ctx: ctx, pts: [p0, p1, p3, p2],
                xof: xof, yof: yof, fil: true, str: true, col: hsv(h, s, v, a) });
        }
    }
    stroke({ ctx: ctx, pts: L, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.5) });
    stroke({ ctx: ctx, pts: R, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.5) });
    return P;
}
// generate fractal-like branches
function branch(args) {
    var ctx = args.ctx;
    var xof = (args.xof != undefined) ? args.xof : 0;
    var yof = (args.yof != undefined) ? args.yof : 0;
    var rot = (args.rot != undefined) ? args.rot : [PI / 2, 0, 0];
    var len = (args.len != undefined) ? args.len : 400;
    var seg = (args.seg != undefined) ? args.seg : 40;
    var wid = (args.wid != undefined) ? args.wid : 1;
    var twi = (args.twi != undefined) ? args.twi : 5;
    var col = (args.col != undefined) ? args.col :
        { min: [50, 0.2, 0.8, 1], max: [50, 0.2, 0.8, 1] };
    var dep = (args.dep != undefined) ? args.dep : 3;
    var frk = (args.frk != undefined) ? args.frk : 4;
    var jnt = [];
    for (var i = 0; i < twi; i++) {
        jnt.push([Math.floor(_random() * seg), normRand(-1, 1)]);
    }
    function jntdist(x) {
        var m = seg;
        var j = 0;
        for (var i = 0; i < jnt.length; i++) {
            var n = Math.abs(x * seg - jnt[i][0]);
            if (n < m) {
                m = n;
                j = i;
            }
        }
        return [m, jnt[j][1]];
    }
    var wfun = function (x) {
        var _a = __read(jntdist(x), 2), m = _a[0], j = _a[1];
        if (m < 1) {
            return wid * (3 + 5 * (1 - x));
        }
        else {
            return wid * (2 + 7 * (1 - x) * mapval(Noise.noise(x * 10), 0, 1, 0.5, 1));
        }
    };
    var bfun = function (x) {
        var _a = __read(jntdist(x), 2), m = _a[0], j = _a[1];
        if (m < 1) {
            return [0, j * 20, 0];
        }
        else {
            return [0, normRand(-5, 5), 0];
        }
    };
    var P = stem({ ctx: ctx,
        xof: xof, yof: yof,
        rot: rot,
        len: len, seg: seg,
        wid: wfun,
        col: col,
        ben: bfun });
    var child = [];
    if (dep > 0 && wid > 0.1) {
        for (var i = 0; i < frk * _random(); i++) {
            var ind = Math.floor(normRand(1, P.length));
            var r = grot(P, ind);
            var L = branch({ ctx: ctx,
                xof: xof + P[ind][0], yof: yof + P[ind][1],
                rot: [r[0] + normRand(-1, 1) * PI / 6, r[1] + normRand(-1, 1) * PI / 6, r[2] + normRand(-1, 1) * PI / 6],
                seg: seg,
                len: len * normRand(0.4, 0.6),
                wid: wid * normRand(0.4, 0.7),
                twi: twi * 0.7,
                dep: dep - 1
            });
            //child = child.concat(L.map((v)=>([v[0],[v[1][0]+P[ind][0],v[1][1]+P[ind][1],v[1][2]]])))
            child = child.concat(L);
        }
    }
    var parent = {
        dep: dep,
        pts: P.map(function (v) { return [v[0] + xof, v[1] + yof, v[2]]; })
    };
    return ([parent]).concat(child);
}
// vizualize parameters into HTML table & canvas
function vizParams(_PAR) {
    var PAR = _PAR;
    var div = document.createElement("div");
    var viz = "";
    var tabstyle = "style='border: 1px solid grey'";
    viz += "<table><tr><td " + tabstyle + ">Summary</td></tr><tr><td " + tabstyle + "><table><tr>";
    var cnt = 0;
    for (var k in PAR) {
        if (typeof (PAR[k]) == "number") {
            cnt += 1;
            viz += "<td><td " + tabstyle + ">" + k + "</td><td " + tabstyle + ">" + fmt(PAR[k]) + "</td></td>";
            if (cnt % 4 == 0) {
                viz += "</tr><tr>";
            }
        }
    }
    viz += "</tr></table>";
    function fmt(a) {
        if (typeof (a) == "number") {
            return a.toFixed(3);
        }
        else if (typeof (a) == "object") {
            var r = "<table><tr>";
            for (var k in a) {
                r += "<td " + tabstyle + ">" + fmt(a[k]) + "</td>";
            }
            return r + "</tr></table>";
        }
    }
    viz += "<table><tr>";
    cnt = 0;
    for (var k in PAR) {
        if (typeof (PAR[k]) == "object") {
            viz += "<td " + tabstyle + "><table><tr><td colspan='2' " + tabstyle + ">" + k + "</td></tr>";
            for (var i in PAR[k]) {
                viz += "<tr><td " + tabstyle + ">" + i + "</td><td " + tabstyle + ">" + fmt(PAR[k][i]) + "</td>";
                if (k.includes("olor")) {
                    var v = PAR[k][i];
                    viz += "<td " + tabstyle + ">" + "<div style='background-color:" + hsv.apply(void 0, __spreadArray([], __read(v), false))
                        + "'>&nbsp&nbsp&nbsp&nbsp&nbsp</div></td>";
                }
                viz += "</tr>";
            }
            viz += "</table><td>";
            if (cnt % 2 == 1) {
                viz += "</tr><tr>";
            }
            cnt += 1;
        }
    }
    viz += "</tr></table>";
    viz += "</td></tr><tr><td align='left' " + tabstyle + "></td></tr></table>";
    var graphs = document.createElement("div");
    for (var k in PAR) {
        if (typeof (PAR[k]) == "function") {
            var lay = Layer.empty(100);
            lay.fillStyle = "silver";
            for (var i_1 = 0; i_1 < 100; i_1++) {
                lay.fillRect(i_1, 100 - 100 * PAR[k](i_1 / 100, 0.5), 2, 2);
            }
            lay.fillText(k, 2, 10);
            lay.canvas.setAttribute("style", "border: 1px solid grey");
            graphs.appendChild(lay.canvas);
        }
    }
    //console.log(viz)
    div.innerHTML += viz;
    div.lastChild.lastChild.lastChild.lastChild.appendChild(graphs);
    get_elment_by_id_not_null("summary").appendChild(div);
}
// generate random parameters
function genParams() {
    var randint = function (x, y) { return (Math.floor(normRand(x, y))); };
    var PAR = {};
    var flowerShapeMask = function (x) { return (pow(sin(PI * x), 0.2)); };
    var leafShapeMask = function (x) { return (pow(sin(PI * x), 0.5)); };
    PAR.flowerChance = randChoice([normRand(0, 0.08), normRand(0, 0.03)]);
    PAR.leafChance = randChoice([0, normRand(0, 0.1), normRand(0, 0.1)]);
    PAR.leafType = randChoice([
        [1, randint(2, 5)],
        [2, randint(3, 7), randint(3, 8)],
        [2, randint(3, 7), randint(3, 8)],
    ]);
    var flowerShapeNoiseSeed = _random() * PI;
    var flowerJaggedness = normRand(0.5, 8);
    PAR.flowerShape = function (x) { return (Noise.noise(x * flowerJaggedness, flowerShapeNoiseSeed) * flowerShapeMask(x)); };
    var leafShapeNoiseSeed = _random() * PI;
    var leafJaggedness = normRand(0.1, 40);
    var leafPointyness = normRand(0.5, 1.5);
    PAR.leafShape = randChoice([
        //todo iloseall flowerShapeNoiseSeed => leafShapeNoiseSeed
        function (x) { return (Noise.noise(x * leafJaggedness, flowerShapeNoiseSeed) * leafShapeMask(x)); },
        function (x) { return (pow(sin(PI * x), leafPointyness)); }
    ]);
    var flowerHue0 = (normRand(0, 180) - 130 + 360) % 360;
    var flowerHue1 = Math.floor((flowerHue0 + normRand(-70, 70) + 360) % 360);
    var flowerValue0 = Math.min(1, normRand(0.5, 1.3));
    var flowerValue1 = Math.min(1, normRand(0.5, 1.3));
    var flowerSaturation0 = normRand(0, 1.1 - flowerValue0);
    var flowerSaturation1 = normRand(0, 1.1 - flowerValue1);
    PAR.flowerColor = { min: [flowerHue0, flowerSaturation0, flowerValue0, normRand(0.8, 1)],
        max: [flowerHue1, flowerSaturation1, flowerValue1, normRand(0.5, 1)] };
    PAR.leafColor = { min: [normRand(10, 200), normRand(0.05, 0.4), normRand(0.3, 0.7), normRand(0.8, 1)],
        max: [normRand(10, 200), normRand(0.05, 0.4), normRand(0.3, 0.7), normRand(0.8, 1)] };
    var curveCoeff0 = [normRand(-0.5, 0.5), normRand(5, 10)];
    var curveCoeff1 = [_random() * PI, normRand(1, 5)];
    var curveCoeff2 = [_random() * PI, normRand(5, 15)];
    var curveCoeff3 = [_random() * PI, normRand(1, 5)];
    var curveCoeff4 = [_random() * 0.5, normRand(0.8, 1.2)];
    PAR.flowerOpenCurve = randChoice([
        function (x, op) { return ((x < 0.1) ?
            2 + op * curveCoeff2[1]
            : Noise.noise(x * 10, curveCoeff2[0])); },
        function (x, op) { return ((x < curveCoeff4[0]) ? 0 : 10 - x * mapval(op, 0, 1, 16, 20) * curveCoeff4[1]); }
    ]);
    PAR.flowerColorCurve = randChoice([
        function (x) { return (sigmoid(x + curveCoeff0[0], curveCoeff0[1])); },
        //(x)=>(Noise.noise(x*curveCoeff1[1],curveCoeff1[0]))
    ]);
    PAR.leafLength = normRand(30, 100);
    PAR.flowerLength = normRand(5, 55); //* (0.1-PAR.flowerChance)*10
    PAR.pedicelLength = normRand(5, 30);
    PAR.leafWidth = normRand(5, 30);
    PAR.flowerWidth = normRand(5, 30);
    PAR.stemWidth = normRand(2, 11);
    PAR.stemBend = normRand(2, 16);
    PAR.stemLength = normRand(300, 400);
    PAR.stemCount = randChoice([2, 3, 4, 5]);
    PAR.sheathLength = randChoice([0, normRand(50, 100)]);
    PAR.sheathWidth = normRand(5, 15);
    PAR.shootCount = normRand(1, 7);
    PAR.shootLength = normRand(50, 180);
    PAR.leafPosition = randChoice([1, 2]);
    PAR.flowerPetal = Math.round(mapval(PAR.flowerWidth, 5, 50, 10, 3));
    PAR.innerLength = Math.min(normRand(0, 20), PAR.flowerLength * 0.8);
    PAR.innerWidth = Math.min(randChoice([0, normRand(1, 8)]), PAR.flowerWidth * 0.8);
    PAR.innerShape = function (x) { return (pow(sin(PI * x), 1)); };
    var innerHue = normRand(0, 60);
    PAR.innerColor = { min: [innerHue, normRand(0.1, 0.7), normRand(0.5, 0.9), normRand(0.8, 1)],
        max: [innerHue, normRand(0.1, 0.7), normRand(0.5, 0.9), normRand(0.5, 1)] };
    PAR.branchWidth = normRand(0.4, 1.3);
    PAR.branchTwist = Math.round(normRand(2, 5));
    PAR.branchDepth = randChoice([3, 4]);
    PAR.branchFork = randChoice([4, 5, 6, 7]);
    var branchHue = normRand(30, 60);
    var branchSaturation = normRand(0.05, 0.3);
    var branchValue = normRand(0.7, 0.9);
    PAR.branchColor = { min: [branchHue, branchSaturation, branchValue, 1],
        max: [branchHue, branchSaturation, branchValue, 1] };
    console.log(PAR);
    vizParams(PAR);
    return PAR;
}
// generate a woody plant
function woody(args) {
    var ctx = args.ctx;
    var xof = (args.xof != undefined) ? args.xof : 0;
    var yof = (args.yof != undefined) ? args.yof : 0;
    var PAR = (args.PAR != undefined) ? args.PAR : genParams();
    var cwid = 1200;
    var lay0 = Layer.empty(cwid);
    var lay1 = Layer.empty(cwid);
    var PL = branch({
        ctx: lay0, xof: cwid * 0.5, yof: cwid * 0.7,
        wid: PAR.branchWidth,
        twi: PAR.branchTwist,
        dep: PAR.branchDepth,
        col: PAR.branchColor,
        frk: PAR.branchFork,
    });
    console.log(PL);
    for (var i = 0; i < PL.length; i++) {
        if (i / PL.length > 0.1) {
            for (var j = 0; j < PL[i].pts.length; j++) {
                if (_random() < PAR.leafChance) {
                    leaf({ ctx: lay0,
                        xof: PL[i].pts[j][0], yof: PL[i].pts[j][1],
                        len: PAR.leafLength * normRand(0.8, 1.2),
                        vei: PAR.leafType,
                        col: PAR.leafColor,
                        rot: [normRand(-1, 1) * PI, normRand(-1, 1) * PI, normRand(-1, 1) * 0],
                        wid: function (x) { return (PAR.leafShape(x) * PAR.leafWidth); },
                        ben: function (x) { return ([
                            mapval(Noise.noise(x * 1, i), 0, 1, -1, 1) * 5,
                            0,
                            mapval(Noise.noise(x * 1, i + PI), 0, 1, -1, 1) * 5
                        ]); } });
                }
                if (_random() < PAR.flowerChance) {
                    var hr = [normRand(-1, 1) * PI, normRand(-1, 1) * PI, normRand(-1, 1) * 0];
                    var P_ = stem({ ctx: lay0,
                        xof: PL[i].pts[j][0], yof: PL[i].pts[j][1],
                        rot: hr,
                        len: PAR.pedicelLength,
                        col: { min: [50, 1, 0.9, 1], max: [50, 1, 0.9, 1] },
                        wid: function (x) { return (sin(x * PI) * x * 2 + 1); },
                        ben: function (x) { return ([
                            0, 0, 0
                        ]); } });
                    var op = _random();
                    var r = grot(P_, -1);
                    var hhr = r;
                    for (var k = 0; k < PAR.flowerPetal; k++) {
                        leaf({ ctx: lay1, flo: true,
                            xof: PL[i].pts[j][0] + P_[-1][0], yof: PL[i].pts[j][1] + P_[-1][1],
                            rot: [hhr[0], hhr[1], hhr[2] + k / PAR.flowerPetal * PI * 2],
                            len: PAR.flowerLength * normRand(0.7, 1.3),
                            wid: function (x) { return (PAR.flowerShape(x) * PAR.flowerWidth); },
                            vei: [0],
                            col: PAR.flowerColor,
                            cof: PAR.flowerColorCurve,
                            ben: function (x) { return ([
                                PAR.flowerOpenCurve(x, op),
                                0,
                                0,
                            ]); }
                        });
                        leaf({ ctx: lay1, flo: true,
                            xof: PL[i].pts[j][0] + P_[-1][0], yof: PL[i].pts[j][1] + P_[-1][1],
                            rot: [hhr[0], hhr[1], hhr[2] + k / PAR.flowerPetal * PI * 2],
                            len: PAR.innerLength * normRand(0.8, 1.2),
                            wid: function (x) { return (sin(x * PI) * 4); },
                            vei: [0],
                            col: PAR.innerColor,
                            cof: function (x) { return (x); },
                            ben: function (x) { return ([
                                PAR.flowerOpenCurve(x, op),
                                0,
                                0,
                            ]); } });
                    }
                }
            }
        }
    }
    Layer.filter(lay0, Filter.fade);
    Layer.filter(lay0, Filter.wispy);
    Layer.filter(lay1, Filter.wispy);
    var b1 = Layer.bound(lay0);
    var b2 = Layer.bound(lay1);
    var bd = {
        xmin: Math.min(b1.xmin, b2.xmin),
        xmax: Math.max(b1.xmax, b2.xmax),
        ymin: Math.min(b1.ymin, b2.ymin),
        ymax: Math.max(b1.ymax, b2.ymax)
    };
    var xref = xof - (bd.xmin + bd.xmax) / 2;
    var yref = yof - bd.ymax;
    Layer.blit(ctx, lay0, { ble: "multiply", xof: xref, yof: yref });
    Layer.blit(ctx, lay1, { ble: "normal", xof: xref, yof: yref });
}
// generate a herbaceous plant
function herbal(args) {
    var ctx = args.ctx;
    var xof = (args.xof != undefined) ? args.xof : 0;
    var yof = (args.yof != undefined) ? args.yof : 0;
    var PAR = (args.PAR != undefined) ? args.PAR : genParams();
    var cwid = 1200;
    var lay0 = Layer.empty(cwid);
    var lay1 = Layer.empty(cwid);
    var x0 = cwid * 0.5;
    var y0 = cwid * 0.7;
    var _loop_1 = function (i_2) {
        var r = [PI / 2, 0, normRand(-1, 1) * PI];
        P = stem({ ctx: lay0, xof: x0, yof: y0,
            len: PAR.stemLength * normRand(0.7, 1.3),
            rot: r,
            wid: function (x) { return (PAR.stemWidth *
                (pow(sin(x * PI / 2 + PI / 2), 0.5) * Noise.noise(x * 10) * 0.5 + 0.5)); },
            ben: function (x) { return ([
                mapval(Noise.noise(x * 1, i_2), 0, 1, -1, 1) * x * PAR.stemBend,
                0,
                mapval(Noise.noise(x * 1, i_2 + PI), 0, 1, -1, 1) * x * PAR.stemBend,
            ]); } });
        if (PAR.leafPosition == 2) {
            for (var j = 0; j < P.length; j++)
                if (_random() < PAR.leafChance * 2) {
                    leaf({ ctx: lay0,
                        xof: x0 + P[j][0], yof: y0 + P[j][1],
                        len: 2 * PAR.leafLength * normRand(0.8, 1.2),
                        vei: PAR.leafType,
                        col: PAR.leafColor,
                        rot: [normRand(-1, 1) * PI, normRand(-1, 1) * PI, normRand(-1, 1) * 0],
                        wid: function (x) { return (2 * PAR.leafShape(x) * PAR.leafWidth); },
                        ben: function (x) { return ([
                            mapval(Noise.noise(x * 1, i_2), 0, 1, -1, 1) * 5,
                            0,
                            mapval(Noise.noise(x * 1, i_2 + PI), 0, 1, -1, 1) * 5
                        ]); } });
                }
        }
        hr = grot(P, -1);
        if (PAR.sheathLength != 0) {
            stem({ ctx: lay0, xof: x0 + P[-1][0], yof: y0 + P[-1][1],
                rot: hr,
                len: PAR.sheathLength,
                col: { min: [60, 0.3, 0.9, 1], max: [60, 0.3, 0.9, 1] },
                wid: function (x) { return PAR.sheathWidth * (pow(sin(x * PI), 2) - x * 0.5 + 0.5); },
                ben: function (x) { return ([0, 0, 0]); } });
        }
        for (var j = 0; j < Math.max(1, PAR.shootCount * normRand(0.5, 1.5)); j++) {
            P_ = stem({ ctx: lay0, xof: x0 + P[-1][0], yof: y0 + P[-1][1],
                rot: hr,
                len: PAR.shootLength * normRand(0.5, 1.5),
                col: { min: [70, 0.2, 0.9, 1], max: [70, 0.2, 0.9, 1] },
                wid: function (x) { return (2); },
                ben: function (x) { return ([
                    mapval(Noise.noise(x * 1, j), 0, 1, -1, 1) * x * 10,
                    0,
                    mapval(Noise.noise(x * 1, j + PI), 0, 1, -1, 1) * x * 10
                ]); } });
            op = _random();
            hhr = [normRand(-1, 1) * PI, normRand(-1, 1) * PI, normRand(-1, 1) * PI];
            for (var k = 0; k < PAR.flowerPetal; k++) {
                leaf({ ctx: lay1, flo: true,
                    xof: x0 + P[-1][0] + P_[-1][0], yof: y0 + P[-1][1] + P_[-1][1],
                    rot: [hhr[0], hhr[1], hhr[2] + k / PAR.flowerPetal * PI * 2],
                    len: PAR.flowerLength * normRand(0.7, 1.3) * 1.5,
                    wid: function (x) { return (1.5 * PAR.flowerShape(x) * PAR.flowerWidth); },
                    vei: [0],
                    col: PAR.flowerColor,
                    cof: PAR.flowerColorCurve,
                    ben: function (x) { return ([
                        PAR.flowerOpenCurve(x, op),
                        0,
                        0,
                    ]); } });
                leaf({ ctx: lay1, flo: true,
                    xof: x0 + P[-1][0] + P_[-1][0], yof: y0 + P[-1][1] + P_[-1][1],
                    rot: [hhr[0], hhr[1], hhr[2] + k / PAR.flowerPetal * PI * 2],
                    len: PAR.innerLength * normRand(0.8, 1.2),
                    wid: function (x) { return (sin(x * PI) * 4); },
                    vei: [0],
                    col: PAR.innerColor,
                    cof: function (x) { return (x); },
                    ben: function (x) { return ([
                        PAR.flowerOpenCurve(x, op),
                        0,
                        0,
                    ]); } });
            }
        }
    };
    var P, hr, P_, op, hhr;
    for (var i_2 = 0; i_2 < PAR.stemCount; i_2++) {
        _loop_1(i_2);
    }
    if (PAR.leafPosition == 1) {
        for (var i = 0; i < PAR.leafChance * 100; i++) {
            leaf({ ctx: lay0,
                xof: x0, yof: y0, rot: [PI / 3, 0, normRand(-1, 1) * PI],
                len: 4 * PAR.leafLength * normRand(0.8, 1.2),
                wid: function (x) { return (2 * PAR.leafShape(x) * PAR.leafWidth); },
                vei: PAR.leafType,
                ben: function (x) { return ([
                    mapval(Noise.noise(x * 1, i), 0, 1, -1, 1) * 10,
                    0,
                    mapval(Noise.noise(x * 1, i + PI), 0, 1, -1, 1) * 10
                ]); } });
        }
    }
    Layer.filter(lay0, Filter.fade);
    Layer.filter(lay0, Filter.wispy);
    Layer.filter(lay1, Filter.wispy);
    var b1 = Layer.bound(lay0);
    var b2 = Layer.bound(lay1);
    var bd = {
        xmin: Math.min(b1.xmin, b2.xmin),
        xmax: Math.max(b1.xmax, b2.xmax),
        ymin: Math.min(b1.ymin, b2.ymin),
        ymax: Math.max(b1.ymax, b2.ymax)
    };
    var xref = xof - (bd.xmin + bd.xmax) / 2;
    var yref = yof - bd.ymax;
    Layer.blit(ctx, lay0, { ble: "multiply", xof: xref, yof: yref });
    Layer.blit(ctx, lay1, { ble: "normal", xof: xref, yof: yref });
}
// download generated image
function makeDownload() {
    var down = document.createElement('a');
    down.innerHTML = "[Download]";
    down.addEventListener('click', function () {
        var ctx = Layer.empty();
        for (var i = 0; i < ctx.canvas.width; i += 512) {
            for (var j = 0; j < ctx.canvas.height; j += 512) {
                ctx.drawImage(BGCANV, i, j);
            }
        }
        ctx.drawImage(CTX.canvas, 0, 0);
        this.href = ctx.canvas.toDataURL();
        this.download = SEED;
    }, false);
    document.body.appendChild(down);
    down.click();
    document.body.removeChild(down);
}
// toggle visibility of sub menus
function toggle(x, disp) {
    disp = (disp != undefined) ? disp : "block";
    var alle = ["summary", "settings", "share"];
    var d = get_elment_by_id_not_null(x).style.display;
    for (var i = 0; i < alle.length; i++) {
        get_elment_by_id_not_null(alle[i]).style.display = "none";
    }
    if (d == "none") {
        get_elment_by_id_not_null(x).style.display = disp;
    }
}
// fill HTML background with paper texture
function makeBG() {
    setTimeout(_makeBG, 10);
    function _makeBG() {
        BGCANV = paper({ col: PAPER_COL0, tex: 10, spr: 0 });
        var img = BGCANV.toDataURL("image/png");
        document.body.style.backgroundImage = 'url(' + img + ')';
    }
}
// generate new plant
function generate() {
    CTX = Layer.empty();
    CTX.fillStyle = "white";
    CTX.fillRect(0, 0, CTX.canvas.width, CTX.canvas.height);
    //document.body.appendChild(CTX.canvas)
    var ppr = paper({ col: PAPER_COL1 });
    for (var i = 0; i < CTX.canvas.width; i += 512) {
        for (var j = 0; j < CTX.canvas.height; j += 512) {
            CTX.drawImage(ppr, i, j);
        }
    }
    if (_random() <= 0.5) {
        woody({ ctx: CTX, xof: 300, yof: 550, });
    }
    else {
        herbal({ ctx: CTX, xof: 300, yof: 600, });
    }
    Layer.border(CTX, squircle(0.98, 3));
}
// reload page with given seed
function reloadWSeed(s) {
    var u = window.location.href.split("?")[0];
    window.location.href = u + "?seed=" + s;
}
function get_elment_by_id_not_null(id) {
    var e = document.getElementById(id);
    if (e == null) {
        throw new Error("HTML Element (" + id + ") should exists");
    }
    return e;
}
// initialize everything
function load() {
    _init();
    makeBG();
    setTimeout(_load, 100);
    function _load() {
        generate();
        get_elment_by_id_not_null("canvas-container").appendChild(CTX.canvas);
        get_elment_by_id_not_null("loader").style.display = "none";
        get_elment_by_id_not_null("content").style.display = "block";
        get_elment_by_id_not_null("inp-seed").value = SEED;
        get_elment_by_id_not_null("share-twitter").href =
            "https://twitter.com/share?url="
                + window.location.href
                + "&amp;text=" + window.location.href + ";hashtags=nonflowers";
    }
}
// canvas context operations
var Layer = {
    empty: function (w, h) {
        w = (w != undefined) ? w : 600;
        h = (h != undefined) ? h : w;
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var context = canvas.getContext('2d');
        if (context == null) {
            throw new Error("canvas.getContext('2d') failed!");
        }
        return context;
    },
    blit: function (ctx0, ctx1, args) {
        var args = (args != undefined) ? args : {};
        var ble = (args.ble != undefined) ? args.ble : "normal";
        var xof = (args.xof != undefined) ? args.xof : 0;
        var yof = (args.yof != undefined) ? args.yof : 0;
        ctx0.globalCompositeOperation = ble;
        ctx0.drawImage(ctx1.canvas, xof, yof);
    },
    filter: function (ctx, f) {
        var imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var _a = __read(pix.slice(i, i + 4), 4), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            var x = (i / 4) % (ctx.canvas.width);
            var y = Math.floor((i / 4) / (ctx.canvas.width));
            var _b = __read(f(x, y, r, g, b, a), 4), r1 = _b[0], g1 = _b[1], b1 = _b[2], a1 = _b[3];
            pix[i] = r1;
            pix[i + 1] = g1;
            pix[i + 2] = b1;
            pix[i + 3] = a1;
        }
        ctx.putImageData(imgd, 0, 0);
    },
    border: function (ctx, f) {
        var imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var _a = __read(pix.slice(i, i + 4), 4), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            var x = (i / 4) % (ctx.canvas.width);
            var y = Math.floor((i / 4) / (ctx.canvas.width));
            var nx = (x / ctx.canvas.width - 0.5) * 2;
            var ny = (y / ctx.canvas.height - 0.5) * 2;
            var theta = Math.atan2(ny, nx);
            var r_ = distance([nx, ny], [0, 0]);
            var rr_ = f(theta);
            if (r_ > rr_) {
                pix[i] = 0;
                pix[i + 1] = 0;
                pix[i + 2] = 0;
                pix[i + 3] = 0;
            }
        }
        ctx.putImageData(imgd, 0, 0);
    },
    // find the dirty region - potentially optimizable
    bound: function (ctx) {
        var xmin = ctx.canvas.width;
        var xmax = 0;
        var ymin = ctx.canvas.height;
        var ymax = 0;
        var imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var _a = __read(pix.slice(i, i + 4), 4), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            var x = (i / 4) % (ctx.canvas.width);
            var y = Math.floor((i / 4) / (ctx.canvas.width));
            if (a > 0.001) {
                if (x < xmin) {
                    xmin = x;
                }
                if (x > xmax) {
                    xmax = x;
                }
                if (y < ymin) {
                    ymin = y;
                }
                if (y > ymax) {
                    ymax = y;
                }
            }
        }
        return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
    },
};
var PERLIN_YWRAPB = 4;
var PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
var PERLIN_ZWRAPB = 8;
var PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
var PERLIN_SIZE = 4095;
var scaled_cosine = function (i) { return 0.5 * (1.0 - Math.cos(i * Math.PI)); };
//perlin noise adapted from p5.js
var PerlinNoise = /** @class */ (function () {
    function PerlinNoise(_random) {
        this.perlin_octaves = 4;
        this.perlin_amp_falloff = 0.5;
        this._random = _random !== null && _random !== void 0 ? _random : Math.random;
    }
    PerlinNoise.prototype.noise = function (x, y, z) {
        y = y || 0;
        z = z || 0;
        if (this.perlin == null) {
            this.noiseSeed();
            /*
            this.perlin = new Array(PERLIN_SIZE + 1);
            for (var i = 0; i < PERLIN_SIZE + 1; i++) {
                this.perlin[i] = Math.random();
            }
            */
        }
        if (x < 0) {
            x = -x;
        }
        if (y < 0) {
            y = -y;
        }
        if (z < 0) {
            z = -z;
        }
        var xi = Math.floor(x);
        var yi = Math.floor(y);
        var zi = Math.floor(z);
        var xf = x - xi;
        var yf = y - yi;
        var zf = z - zi;
        var r = 0;
        var ampl = 0.5;
        for (var o = 0; o < this.perlin_octaves; o++) {
            var n1 = void 0;
            var n2 = void 0;
            var n3 = void 0;
            var of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
            var rxf = scaled_cosine(xf);
            var ryf = scaled_cosine(yf);
            n1 = this.perlin[of & PERLIN_SIZE];
            n1 += rxf * (this.perlin[(of + 1) & PERLIN_SIZE] - n1);
            n2 = this.perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
            n2 += rxf * (this.perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
            n1 += ryf * (n2 - n1);
            of += PERLIN_ZWRAP;
            n2 = this.perlin[of & PERLIN_SIZE];
            n2 += rxf * (this.perlin[(of + 1) & PERLIN_SIZE] - n2);
            n3 = this.perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
            n3 += rxf * (this.perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
            n2 += ryf * (n3 - n2);
            n1 += scaled_cosine(zf) * (n2 - n1);
            r += n1 * ampl;
            ampl *= this.perlin_amp_falloff;
            xi <<= 1;
            xf *= 2;
            yi <<= 1;
            yf *= 2;
            zi <<= 1;
            zf *= 2;
            if (xf >= 1.0) {
                xi++;
                xf--;
            }
            if (yf >= 1.0) {
                yi++;
                yf--;
            }
            if (zf >= 1.0) {
                zi++;
                zf--;
            }
        }
        return r;
    };
    PerlinNoise.prototype.noiseDetail = function (lod, falloff) {
        if (lod > 0) {
            this.perlin_octaves = lod;
        }
        if (falloff > 0) {
            this.perlin_amp_falloff = falloff;
        }
    };
    PerlinNoise.prototype.noiseSeed = function (seed) {
        var _this = this;
        var lcg = (function () {
            var m = 4294967296;
            var a = 1664525;
            var c = 1013904223;
            var _seed = 0, z = 0;
            return {
                setSeed: function (val) {
                    _seed = (val == null ? _this._random() * m : val) >>> 0;
                    z = _seed;
                },
                getSeed: function () { return _seed; },
                rand: function () {
                    z = (a * z + c) % m;
                    return z / m;
                }
            };
        })();
        lcg.setSeed(seed);
        this.perlin = new Array(PERLIN_SIZE + 1);
        for (var i = 0; i < PERLIN_SIZE + 1; i++) {
            this.perlin[i] = lcg.rand();
        }
    };
    ;
    return PerlinNoise;
}());
var forward = [0, 0, 1];
var up = [0, 1, 0];
var right = [1, 0, 0];
var zero = [0, 0, 0];
function rotvec(vec, axis, th) {
    var _a = __read(axis, 3), l = _a[0], m = _a[1], n = _a[2];
    var _b = __read(vec, 3), x = _b[0], y = _b[1], z = _b[2];
    var _c = __read([Math.cos(th), Math.sin(th)], 2), costh = _c[0], sinth = _c[1];
    var sub_1_costh = 1 - costh;
    var mat_11 = l * l * sub_1_costh + costh;
    var mat_12 = m * l * sub_1_costh - n * sinth;
    var mat_13 = n * l * sub_1_costh + m * sinth;
    var mat_21 = l * m * sub_1_costh + n * sinth;
    var mat_22 = m * m * sub_1_costh + costh;
    var mat_23 = n * m * sub_1_costh - l * sinth;
    var mat_31 = l * n * sub_1_costh - m * sinth;
    var mat_32 = m * n * sub_1_costh + l * sinth;
    var mat_33 = n * n * sub_1_costh + costh;
    return [
        x * mat_11 + y * mat_12 + z * mat_13,
        x * mat_21 + y * mat_22 + z * mat_23,
        x * mat_31 + y * mat_32 + z * mat_33,
    ];
}
function roteuler(vec, rot) {
    if (rot[2] != 0) {
        vec = rotvec(vec, forward, rot[2]);
    }
    if (rot[0] != 0) {
        vec = rotvec(vec, right, rot[0]);
    }
    if (rot[1] != 0) {
        vec = rotvec(vec, up, rot[1]);
    }
    return vec;
}
function scale(vec, p) {
    return [vec[0] * p, vec[1] * p, vec[2] * p];
}
function copy(v0) {
    return [v0[0], v0[1], v0[2]];
}
function add(v0, v) {
    return [v0[0] + v[0], v0[1] + v[1], v0[2] + v[2]];
}
function subtract(v0, v) {
    return [v0[0] - v[0], v0[1] - v[1], v0[2] - v[2]];
}
function mag(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}
function normalize(v) {
    var p = 1 / mag(v);
    return [v[0] * p, v[1] * p, v[2] * p];
}
function dot(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}
function cross(u, v) {
    return [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];
}
function angcos(u, v) {
    return dot(u, v) / (mag(u) * mag(v));
}
function ang(u, v) {
    return Math.acos(angcos(u, v));
}
function toeuler(v0) {
    var ep = 5;
    var ma = 2 * PI;
    var mr = [0, 0, 0];
    var cnt = 0;
    for (var x = -180; x < 180; x += ep) {
        for (var y = -90; y < 90; y += ep) {
            cnt++;
            var r = [rad(x), rad(y), 0];
            var v = roteuler([0, 0, 1], r);
            var a = ang(v0, v);
            if (a < rad(ep)) {
                return r;
            }
            if (a < ma) {
                ma = a;
                mr = r;
            }
        }
    }
    return mr;
}
function lerp(u, v, p) {
    return [
        u[0] * (1 - p) + v[0] * p,
        u[1] * (1 - p) + v[1] * p,
        u[2] * (1 - p) + v[2] * p,
    ];
}
var v3 = {
    forward: forward,
    up: up,
    right: right,
    zero: zero,
    rotvec: rotvec,
    roteuler: roteuler,
    scale: scale,
    copy: copy,
    add: add,
    subtract: subtract,
    mag: mag,
    normalize: normalize,
    dot: dot,
    cross: cross,
    angcos: angcos,
    ang: ang,
    toeuler: toeuler,
    lerp: lerp,
};
//# sourceMappingURL=main.js.map