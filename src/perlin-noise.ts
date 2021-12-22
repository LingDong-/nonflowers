
const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

const scaled_cosine = function (i: number) { return 0.5 * (1.0 - Math.cos(i * Math.PI)); };


//perlin noise adapted from p5.js
class PerlinNoise
{
    constructor(_random?:()=>number) {
        this._random=_random??Math.random;
    }
    private _random:()=>number;
    private perlin: number[];
    private perlin_octaves = 4;
    private perlin_amp_falloff = 0.5;

    noise(x: number, y?: number, z?: number) {
        y = y || 0; z = z || 0;
        if (this.perlin == null) {
            this.noiseSeed();
            /*
            this.perlin = new Array(PERLIN_SIZE + 1);
            for (var i = 0; i < PERLIN_SIZE + 1; i++) {
                this.perlin[i] = Math.random();
            }
            */
        }
        if (x < 0) { x = -x; } 
        if (y < 0) { y = -y; } 
        if (z < 0) { z = -z; }
        let xi = Math.floor(x);
        let yi = Math.floor(y);
        let zi = Math.floor(z);
        let xf = x - xi; 
        let yf = y - yi; 
        let zf = z - zi;
        let r = 0; 
        let ampl = 0.5;
        for (var o = 0; o < this.perlin_octaves; o++) {
            let n1:number;
            let n2:number;
            let n3:number;

            var of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
            let rxf = scaled_cosine(xf); 
            let ryf = scaled_cosine(yf);
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
            xi <<= 1; xf *= 2; yi <<= 1; yf *= 2; zi <<= 1; zf *= 2;
            if (xf >= 1.0) { xi++; xf--; }
            if (yf >= 1.0) { yi++; yf--; }
            if (zf >= 1.0) { zi++; zf--; }
        }
        return r;
    }

    noiseDetail(lod:number, falloff:number) {
        if (lod > 0) { 
            this.perlin_octaves = lod; 
        }
        if (falloff > 0) { 
            this.perlin_amp_falloff = falloff; 
        }
    }

    noiseSeed(seed?:number) {
        const lcg =(()=> {
            const m = 4294967296;
            const a = 1664525;
            const c = 1013904223;
            let _seed=0, z=0;
            return {
                setSeed: (val?:number)=>{
                    _seed = (val == null ? this._random() * m : val) >>> 0;
                    z = _seed;
                },
                getSeed: ()=>{ return _seed; },
                rand:()=>{ 
                    z = (a * z + c) % m; 
                    return z / m; 
                }
            };
        })();
        lcg.setSeed(seed);
        this.perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) { 
            this.perlin[i] = lcg.rand(); 
        }
    };
}