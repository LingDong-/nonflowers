
// seedable pseudo random number generator
class PRNG
{
    constructor(seed?:number)
    {
        this.p = 999979;
        this.q = 999983;
        this.m = this.p * this.q;
        this.seed(seed);
    }
    s:number;
    p:number;
    q:number;
    m:number;
    hash(x:any) {
        const y = window.btoa(JSON.stringify(x)); 
        let z = 0
        for (let i = 0; i < y.length; i++) {
            z += y.charCodeAt(i) * Math.pow(128, i)
        }
        return z
    }
    seed(x?:number) {
        if (x == undefined) { x = (new Date()).getTime() }
        let y = 0; 
        let z = 0;
        const redo=()=> { y = (this.hash(x) + z) % this.m; z += 1 };
        while (y % this.p == 0 || y % this.q == 0 || y == 0 || y == 1) { redo() }
        this.s = y
        console.log(["int seed",x, this.s])
        for (let i = 0; i < 10; i++) { this.next(); }
    }
    next() {
        this.s = (this.s * this.s) % this.m
        return this.s / this.m
    }
    test(f:()=>number) {
        const F = f || function () { return this.next() }
        const t0 = (new Date()).getTime()
        const chart = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (let i = 0; i < 10000000; i++) {
            chart[Math.floor(F() * 10)] += 1
        }
        console.log(chart)
        console.log("finished in " + ((new Date()).getTime() - t0))
        return chart;
    }
}
