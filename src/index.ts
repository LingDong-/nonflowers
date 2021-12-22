
interface IColorRange
{
  min:[number,number,number,number],
  max:[number,number,number,number],
}


// parse url arguments
function parseArgs(){
  const query_part = window.location.href.split("?")[1]
  if (query_part == undefined){
    return {};
  }
  const pairs = query_part.split("&")
  const params:{[key:string]:string}={};
  for (let i = 0; i < pairs.length; i++){
    const p = pairs[i].split("=")
    params[p[0]]=p[1];
  }
  return params;
}

// seedable pseudo random number generator

let _random:()=>number;
let SEED:string;
//perlin noise adapted from p5.js
let Noise:PerlinNoise;
let CTX:IDrawContext;
let BGCANV:HTMLCanvasElement;

const PAPER_COL0:[number,number,number] = [1,0.99,0.9];
const PAPER_COL1:[number,number,number] = [0.98,0.91,0.74];

function _init()
{
  //CTX = Layer.empty();
  let int_seed=0; 
  const url_params=parseArgs();
  const url_seed_param=url_params["seed"];
  if(url_seed_param)
  {
    int_seed=parseInt(url_seed_param,10);
    if(isNaN(int_seed))
    {
      int_seed=(new Date()).getTime();
    }
  }
  else
  {
    int_seed=(new Date()).getTime();
  }
  
  SEED = (int_seed.toString());
  const Prng = new PRNG(int_seed);
  console.log("seed:"+int_seed+","+SEED)

  _random = function(){return Prng.next()};
  Noise=new PerlinNoise(_random);
}


// distance between 2 coordinates in 2D
function distance(p0:[number,number],p1:[number,number]){
  return Math.sqrt(Math.pow(p0[0]-p1[0],2) + Math.pow(p0[1]-p1[1],2));
}
// map float from one range to another
function mapval(value:number,istart:number,istop:number,ostart:number,ostop:number){
    return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
}
// random element from array
function randChoice<T>(arr:T[]):T {
  return arr[Math.floor(arr.length * _random())];
}
// normalized random number
function normRand(m:number,M:number){
  return mapval(_random(),0,1,m,M);
}

// weighted randomness
function wtrand(func:(v:number)=>number):number{
  var x = _random()
  var y = _random()
  if (y<func(x)){
    return x
  }else{
    return wtrand(func)
  }
}
// gaussian randomness
function randGaussian(){
  return wtrand((x)=>Math.pow(Math.E,-24*Math.pow(x-0.5,2)) )*2-1
}

// sigmoid curve
function sigmoid(x:number,k?:number):number{
  k = (k != undefined) ? k : 10
  return 1/(1+Math.exp(-k*(x-0.5)))
}

// pseudo bean curve
function bean(x:number):number{
  return pow(0.25-pow(x-0.5,2),0.5)*(2.6+2.4*pow(x,1.5))*0.54
}
// interpolate between square and circle
const squircle = function(r:number,a:number){
  return function(th:number){
    while (th > PI/2){
      th -= PI/2
    }
    while (th < 0){
      th += PI/2
    }
    return r*pow(1/(pow(cos(th),a)+pow(sin(th),a)),1/a)
  }
}

// mid-point of an array of points
function midPt(p1:vec3,p2:vec3):vec3{
  return v3.lerp(p1,p2,0.5);
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
function bezmh(P:vec3[], w:number){
  if (P.length == 2){
    P = [P[0],midPt(P[0],P[1]),P[1]];
  }
  const plist:vec3[] = [];
  for (let j = 0; j < P.length-2; j++){
    let p0;
    let p1;
    let p2;
    if (j == 0){p0 = P[j];}else{p0 = midPt(P[j],P[j+1]);}
    p1 = P[j+1];
    if (j == P.length-3){p2 = P[j+2];}else{p2 = midPt(P[j+1],P[j+2]);}
    const pl = 20+((j==P.length-3)?1:0);
    for (var i = 0; i < pl; i+= 1){
      const t = i/pl;
      const u = (Math.pow (1 - t, 2) + 2 * t * (1 - t) * w + t * t);
      plist.push([
        (Math.pow(1-t,2)*p0[0]+2*t*(1-t)*p1[0]*w+t*t*p2[0])/u,
        (Math.pow(1-t,2)*p0[1]+2*t*(1-t)*p1[1]*w+t*t*p2[1])/u,
        (Math.pow(1-t,2)*p0[2]+2*t*(1-t)*p1[2]*w+t*t*p2[2])/u]);
    }
  }
  return plist;
}

// rgba to css color string
function rgba(r:number,g:number,b:number,a?:number){
  /*
  r = (r != undefined) ? r:255;
  g = (g != undefined) ? g:r;
  b = (b != undefined) ? b:g;
  */
  a = (a != undefined) ? a:1.0;
  return "rgba("+Math.floor(r)+","+Math.floor(g)+","+Math.floor(b)+","+a.toFixed(3)+")"
}
// hsv to css color string
function hsv(h:number,s:number,v:number,a:number){
    const c = v*s
    const x = c*(1-abs((h/60)%2-1))
    const m = v-c
    const list=[[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]];
    let index=Math.floor(h/60);
    if(index>=6)index%=6;
    const [rv,gv,bv] =list[index];
    const [r,g,b] = [(rv+m)*255,(gv+m)*255,(bv+m)*255]
    return rgba(r,g,b,a);
}


// polygon for HTML canvas
interface IPolygonContext
{
  ctx:IDrawContext;
  xof:number;
  yof:number;
  pts:[number,number,number][];
  col:string;
  fil:boolean;
  str?:boolean;
}
function polygon(args:IPolygonContext){
  var ctx = args.ctx;
  var xof = (args.xof != undefined) ? args.xof : 0;  
  var yof = (args.yof != undefined) ? args.yof : 0;  
  var pts = (args.pts != undefined) ? args.pts : [];
  var col = (args.col != undefined) ? args.col : "black";
  var fil = (args.fil != undefined) ? args.fil : true;
  var str = (args.str != undefined) ? args.str : !fil;

  ctx.beginPath();
  if (pts.length > 0){
    ctx.moveTo(pts[0][0]+xof,pts[0][1]+yof);
  }
  for (var i = 1; i < pts.length; i++){
    ctx.lineTo(pts[i][0]+xof,pts[i][1]+yof);
  }
  if (fil){
    ctx.fillStyle = col;
    ctx.fill();
  }
  if (str){
    ctx.strokeStyle = col;
    ctx.stroke();
  }
}
// lerp hue wrapping around 360 degs
function lerpHue(h0:number,h1:number,p:number):number{
  const methods = [
    [abs(h1-h0),     mapval(p,0,1,h0,h1)],
    [abs(h1+360-h0), mapval(p,0,1,h0,h1+360)],
    [abs(h1-360-h0), mapval(p,0,1,h0,h1-360)]
   ]
  methods.sort((x,y)=>(x[0]-y[0]))
  return (methods[0][1]+720)%360
}

// get rotation at given index of a poly-line
//ind :number, -4,-3,-2,-1,0,1,2,....
function grot(P:vec3[],ind:number){
  var d = v3.subtract(P[ind],P[ind-1])
  return v3.toeuler(d)
}
// generate 2d tube shape from list of points
function tubify(args:{
  pts:vec3[],
  wid:(x:number)=>number,
}){
  //args = (args != undefined) ? args : {};
  //const pts = (args.pts != undefined) ? args.pts : [];
  //const wid = (args.wid != undefined) ? args.wid : (x:number)=>(10);
  const {pts,wid}=args;
  const vtxlist0:[number,number,number][] = []
  const vtxlist1:[number,number,number][] = []
  const vtxlist:[number,number,number][] = []
  for (var i = 1; i < pts.length-1; i++){
    var w = wid(i/pts.length)
    var a1 = Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0]);
    var a2 = Math.atan2(pts[i][1]-pts[i+1][1],pts[i][0]-pts[i+1][0]);
    var a = (a1+a2)/2;
    if (a < a2){a+=PI}
    vtxlist0.push([pts[i][0]+w*cos(a),(pts[i][1]+w*sin(a)),0]);
    vtxlist1.push([pts[i][0]-w*cos(a),(pts[i][1]-w*sin(a)),0]);
  }
  var l = pts.length-1
  var a0 = Math.atan2(pts[1][1]-pts[0][1],pts[1][0]-pts[0][0]) - Math.PI/2;
  var a1 = Math.atan2(pts[l][1]-pts[l-1][1],pts[l][0]-pts[l-1][0]) - Math.PI/2;
  var w0 = wid(0)
  var w1 = wid(1)
  vtxlist0.unshift([pts[0][0]+w0*Math.cos(a0),(pts[0][1]+w0*Math.sin(a0)),0])
  vtxlist1.unshift([pts[0][0]-w0*Math.cos(a0),(pts[0][1]-w0*Math.sin(a0)),0])
  vtxlist0.push([pts[l][0]+w1*Math.cos(a1),(pts[l][1]+w1*Math.sin(a1)),0])
  vtxlist1.push([pts[l][0]-w1*Math.cos(a1),(pts[l][1]-w1*Math.sin(a1)),0])
  return [vtxlist0,vtxlist1]
}

// line work with weight function
function stroke(args:{
  ctx:IDrawContext,
  pts:vec3[];
  xof:number;
  yof:number;
  col:string;
  wid?:(x:number)=>number;
}){

  var wid = (args.wid != undefined) ? args.wid :
    (x:number)=>(1*sin(x*PI)*mapval(Noise.noise(x*10),0,1,0.5,1));

  var [vtxlist0,vtxlist1] = tubify({pts:args.pts,wid:wid})

  polygon({pts:vtxlist0.concat(vtxlist1.reverse()),
    ctx:args.ctx,fil:true,col:args.col,xof:args.xof,yof:args.yof})
  return [vtxlist0,vtxlist1]
}
// generate paper texture
function paper(args:{
  col?:[number,number,number],
  tex?:number,
  spr?:number,
}){
  var args =(args != undefined) ? args : {};
  var col = (args.col != undefined) ? args.col : [0.98,0.91,0.74];
  var tex = (args.tex != undefined) ? args.tex : 20;
  var spr = (args.spr != undefined) ? args.spr : 1;

  var canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  var ctx = canvas.getContext("2d");
  if(ctx==null)
  {
    throw new Error(`paper,canvas.getContext("2d") is null`);
  }
  var reso = 512
  for (var i = 0; i < reso/2+1; i++){
    for (var j = 0; j < reso/2+1; j++){
      var c = (255-Noise.noise(i*0.1,j*0.1)*tex*0.5)
      c -= _random()*tex;
      var r = (c*col[0])
      var g = (c*col[1])
      var b = (c*col[2])
      if (Noise.noise(i*0.04,j*0.04,2)*_random()*spr>0.7 
       || _random()<0.005*spr){
        var r = (c*0.7)
        var g = (c*0.5)
        var b = (c*0.2)
      }
      ctx.fillStyle = rgba(r,g,b);
      ctx.fillRect(i,j,1,1);
      ctx.fillRect(reso-i,j,1,1);
      ctx.fillRect(i,reso-j,1,1);
      ctx.fillRect(reso-i,reso-j,1,1);
    }
  }
  return canvas
}
// generate leaf-like structure
interface ILeafContext
{
  ctx:IDrawContext;
  xof:number;
  yof:number;
  rot:vec3;
  len:number;
  seg?:number;
  flo?:boolean;
  vei:number[];
  col?:IColorRange;
  ben:(x:number)=>[number,number,number];
  wid:(x:number)=>number;
  cof?:(x:number)=>number;
}
function leaf(args:ILeafContext){
  var ctx = args.ctx;
  var xof = (args.xof != undefined) ? args.xof : 0;  
  var yof = (args.yof != undefined) ? args.yof : 0;  
  const rot:vec3 = (args.rot != undefined) ? args.rot : [PI/2,0,0];
  var len = (args.len != undefined) ? args.len : 500;
  var seg = (args.seg != undefined) ? args.seg : 40;
  var wid = (args.wid != undefined) ? args.wid : (x:number) => (sin(x*PI)*20);
  var vei = (args.vei != undefined) ? args.vei : [1,3];
  var flo = (args.flo != undefined) ? args.flo : false
  var col:IColorRange = (args.col != undefined) ? args.col : 
    {min:[90,0.2,0.3,1],max:[90,0.1,0.9,1]}
  var cof = (args.cof != undefined) ? args.cof : (x:number) => (x)
  var ben = (args.ben != undefined) ? args.ben : 
    (x:number) => ([normRand(-10,10),0,normRand(-5,5)] as vec3)

  var disp = v3.zero
  var crot = v3.zero
  var P = [disp]
  var ROT = [crot]
  var L = [disp]
  var R = [disp]

  var orient = (v:vec3) => (v3.roteuler(v,rot));

  for (let i = 0; i < seg; i++){
    var p = i/(seg-1)
    crot= v3.add(crot,v3.scale(ben(p),1/seg))
    disp = v3.add(disp,orient(v3.roteuler([0,0,len/seg],crot)))
    var w = wid(p);
    var l = v3.add(disp,orient(v3.roteuler([-w,0,0],crot)));
    var r = v3.add(disp,orient(v3.roteuler([w,0,0],crot)));
    
    if (i > 0){
      var v0 = v3.subtract(disp,L[-1]);
      var v1 = v3.subtract(l,disp);
      var v2 = v3.cross(v0,v1)
      if (!flo){
        var lt = mapval(abs(v3.ang(v2,[0,-1,0])),0,PI,1,0);
      }else{
        var lt = p*normRand(0.95,1);
      }
      lt = cof(lt) || 0

      var h = lerpHue(col.min[0],col.max[0],lt)
      var s = mapval(lt,0,1,col.min[1],col.max[1])
      var v = mapval(lt,0,1,col.min[2],col.max[2])
      var a = mapval(lt,0,1,col.min[3],col.max[3])

      polygon({ctx:ctx,pts:[l,L[-1],P[-1],disp],
        xof:xof,yof:yof,fil:true,str:true,col:hsv(h,s,v,a)})
      polygon({ctx:ctx,pts:[r,R[-1],P[-1],disp],
        xof:xof,yof:yof,fil:true,str:true,col:hsv(h,s,v,a)})
    }
    P.push(disp);
    ROT.push(crot)
    L.push(l)
    R.push(r)
  }
  if (vei[0] == 1){
    for (let i = 1; i < P.length; i++){
      for (let j = 0; j < vei[1]; j++){
        var p = j/vei[1];

        var p0 = v3.lerp(L[i-1],P[i-1],p)
        var p1 = v3.lerp(L[i],P[i],p)

        var q0 = v3.lerp(R[i-1],P[i-1],p)
        var q1 = v3.lerp(R[i],P[i],p)
        polygon({ctx:ctx,pts:[p0,p1],
          xof:xof,yof:yof,fil:false,col:hsv(0,0,0,normRand(0.4,0.9))})
        polygon({ctx:ctx,pts:[q0,q1],
          xof:xof,yof:yof,fil:false,col:hsv(0,0,0,normRand(0.4,0.9))})

      }
    }
    stroke({ctx:ctx,pts:P,xof:xof,yof:yof,col:rgba(0,0,0,0.3)})
  }else if (vei[0] == 2){
    for (let i = 1; i < P.length-vei[1]; i+=vei[2]){
      polygon({ctx:ctx,pts:[P[i],L[i+vei[1]]],
        xof:xof,yof:yof,fil:false,col:hsv(0,0,0,normRand(0.4,0.9))})
      polygon({ctx:ctx,pts:[P[i],R[i+vei[1]]],
        xof:xof,yof:yof,fil:false,col:hsv(0,0,0,normRand(0.4,0.9))})
    }
    stroke({ctx:ctx,pts:P,xof:xof,yof:yof,col:rgba(0,0,0,0.3)})
  }

  stroke({ctx:ctx,pts:L,xof:xof,yof:yof,col:rgba(120,100,0,0.3)})
  stroke({ctx:ctx,pts:R,xof:xof,yof:yof,col:rgba(120,100,0,0.3)})
  return P
}


interface IStemContext
{
  ctx:IDrawContext;
  xof:number;
  yof:number;
  rot:vec3;
  len:number;
  seg?:number;
  col?:IColorRange;
  ben:(x:number)=>[number,number,number];
  wid:(x:number)=>number;
}
// generate stem-like structure
function stem(args:IStemContext){
  var ctx = args.ctx;
  var xof = (args.xof != undefined) ? args.xof : 0;  
  var yof = (args.yof != undefined) ? args.yof : 0;  
  var rot = (args.rot != undefined) ? args.rot : [PI/2,0,0] as vec3;
  var len = (args.len != undefined) ? args.len : 400;
  var seg = (args.seg != undefined) ? args.seg : 40;
  var wid = (args.wid != undefined) ? args.wid : (x:number) => (6);
  const col:IColorRange = (args.col != undefined) ? args.col : 
    {min:[250,0.2,0.4,1],max:[250,0.3,0.6,1]}
  var ben = (args.ben != undefined) ? args.ben : 
    (x:number) => ([normRand(-10,10),0,normRand(-5,5)] as vec3)

  var disp = v3.zero
  var crot = v3.zero
  var P = [disp]
  var ROT = [crot]

  var orient = (v:vec3) => (v3.roteuler(v,rot));
  
  for (var i = 0; i < seg; i++){
    var p = i/(seg-1)
    crot= v3.add(crot,v3.scale(ben(p),1/seg))
    disp = v3.add(disp,orient(v3.roteuler([0,0,len/seg],crot)))
    ROT.push(crot);
    P.push(disp);
  }
  var [L,R] = tubify({pts:P,wid:wid})
  var wseg = 4;
  for (var i = 1; i < P.length; i++){
    for (var j = 1; j < wseg; j++){
      var m = (j-1)/(wseg-1);
      var n = j/(wseg-1);
      var p = i/(P.length-1)

      var p0 = v3.lerp(L[i-1],R[i-1],m)
      var p1 = v3.lerp(L[i],R[i],m)

      var p2 = v3.lerp(L[i-1],R[i-1],n)
      var p3 = v3.lerp(L[i],R[i],n)

      var lt = n/p
      var h = lerpHue(col.min[0],col.max[0],lt)*mapval(Noise.noise(p*10,m*10,n*10),0,1,0.5,1)
      var s = mapval(lt,0,1,col.max[1],col.min[1])*mapval(Noise.noise(p*10,m*10,n*10),0,1,0.5,1)
      var v = mapval(lt,0,1,col.min[2],col.max[2])*mapval(Noise.noise(p*10,m*10,n*10),0,1,0.5,1)
      var a = mapval(lt,0,1,col.min[3],col.max[3])

      polygon({ctx:ctx,pts:[p0,p1,p3,p2],
        xof:xof,yof:yof,fil:true,str:true,col:hsv(h,s,v,a)})

    }
  }
  stroke({ctx:ctx,pts:L,xof:xof,yof:yof,col:rgba(0,0,0,0.5)})
  stroke({ctx:ctx,pts:R,xof:xof,yof:yof,col:rgba(0,0,0,0.5)})
  return P
}


interface IBranchContext
{
  ctx:IDrawContext;
  xof:number;
  yof:number;
  rot?:vec3;
  len?:number;
  seg?:number;
  wid:number;
  twi:number;
  col?:{min:[number,number,number,number],max:[number,number,number,number]};
  dep:number;
  frk?:number;
}

interface IBranchItem
{
  dep:number;
  pts:vec3[];
}
// generate fractal-like branches
function branch(args:IBranchContext):IBranchItem []{
  var ctx = args.ctx;  
  var xof = (args.xof != undefined) ? args.xof : 0;  
  var yof = (args.yof != undefined) ? args.yof : 0;  
  var rot = (args.rot != undefined) ? args.rot : [PI/2,0,0] as vec3;
  var len = (args.len != undefined) ? args.len : 400;
  var seg = (args.seg != undefined) ? args.seg : 40;
  var wid = (args.wid != undefined) ? args.wid : 1;
  var twi = (args.twi != undefined) ? args.twi : 5;
  var col:IColorRange = (args.col != undefined) ? args.col : 
    {min:[50,0.2,0.8,1],max:[50,0.2,0.8,1]}
  var dep = (args.dep != undefined) ? args.dep : 3
  var frk = (args.frk != undefined) ? args.frk : 4

  const jnt:[number,number][] = [];
  for (var i = 0; i < twi; i++){
    jnt.push([Math.floor(_random()*seg),normRand(-1,1)])
  }

  function jntdist(x:number){
    var m = seg
    var j = 0
    for (var i = 0; i< jnt.length; i++){
      var n = Math.abs(x*seg - jnt[i][0]);
      if (n < m){
        m = n
        j = i
      }
    }
    return [m,jnt[j][1]]
  }

  var wfun = function (x:number) {
    var [m,j] = jntdist(x)
    if (m < 1){
      return wid*(3+5*(1-x))
    }else{ 
      return wid*(2+7*(1-x)*mapval(Noise.noise(x*10),0,1,0.5,1))
    }
  }
  
  var bfun = function (x:number):vec3 {
    var [m,j] = jntdist(x)
    if (m < 1){
      return [0,j*20,0]
    }else{
      return [0,normRand(-5,5),0]
    }
  }

  var P = stem({ctx:ctx,
    xof:xof,yof:yof,
    rot:rot,
    len:len,seg:seg,
    wid:wfun,
    col:col,
    ben:bfun})
  
  let child:IBranchItem [] = [];
  if (dep > 0 && wid > 0.1){
    for (var i = 0; i < frk*_random(); i++){
      var ind = Math.floor(normRand(1,P.length))

      var r = grot(P,ind)
      var L = branch({ctx:ctx,
        xof:xof+P[ind][0],yof:yof+P[ind][1],
        rot:[r[0]+normRand(-1,1)*PI/6,r[1]+normRand(-1,1)*PI/6,r[2]+normRand(-1,1)*PI/6],
        seg:seg,
        len:len*normRand(0.4,0.6),
        wid:wid*normRand(0.4,0.7),
        twi:twi*0.7,
        dep:dep-1
       })
       //child = child.concat(L.map((v)=>([v[0],[v[1][0]+P[ind][0],v[1][1]+P[ind][1],v[1][2]]])))
       child = child.concat(L);
    }
  }
  const parent:IBranchItem={
    dep,
    pts:P.map((v)=>([v[0]+xof,v[1]+yof,v[2]] as vec3))
  };
  return ([parent]).concat(child);

}

// vizualize parameters into HTML table & canvas
function vizParams(_PAR:IGenParams){
  const PAR=_PAR as any;
  var div = document.createElement("div")
  var viz = ""
  var tabstyle = "style='border: 1px solid grey'"
  viz += "<table><tr><td "+tabstyle+">Summary</td></tr><tr><td "+tabstyle+"><table><tr>"
  var cnt = 0
  for (var k in PAR){
    if (typeof(PAR[k]) == "number"){
      cnt += 1
      viz += "<td><td "+tabstyle+">"+k+"</td><td "+tabstyle+">"+fmt(PAR[k])+"</td></td>"
      if (cnt % 4 == 0){
        viz += "</tr><tr>"
      }
    }
  }
  viz += "</tr></table>"
  function fmt(a:any){
    if (typeof(a) == "number"){
      return a.toFixed(3)
    }else if (typeof(a)=="object"){
      var r = "<table><tr>"
      for (var k in a){
        r += "<td "+tabstyle+">"+fmt(a[k])+"</td>"
      }
      return r+"</tr></table>"
    }
  }
  viz += "<table><tr>"
  cnt = 0
  for (var k in PAR){
    if (typeof(PAR[k]) == "object"){

      viz += "<td "+tabstyle+"><table><tr><td colspan='2' "+tabstyle+">"+k+"</td></tr>"
      
      for (var i in PAR[k]){
        viz += "<tr><td "+tabstyle+">"+i+"</td><td "+tabstyle+">"+fmt(PAR[k][i])+"</td>"
        if (k.includes("olor")){
          const v=PAR[k][i] as [number,number,number,number];
          viz += "<td "+tabstyle+">"+"<div style='background-color:"+hsv(...v)
              +"'>&nbsp&nbsp&nbsp&nbsp&nbsp</div></td>"
        }
        viz += "</tr>"
      }
      viz += "</table><td>"

      if (cnt % 2 == 1){
        viz += "</tr><tr>"
      }
      cnt += 1;
    }
  }
  viz += "</tr></table>"
  viz += "</td></tr><tr><td align='left' "+tabstyle+"></td></tr></table>"
  var graphs = document.createElement("div")
  for (var k in PAR){
    if (typeof(PAR[k]) == "function"){
      var lay = Layer.empty(100)
      lay.fillStyle ="silver"
      for (let i = 0; i < 100; i++){
        lay.fillRect(i,100-100*PAR[k](i/100,0.5),2,2)
      }
      lay.fillText(k,2,10);
      lay.canvas.setAttribute("style", "border: 1px solid grey");
      graphs.appendChild(lay.canvas)
    }
  }
  //console.log(viz)
  div.innerHTML += viz;
  (div as any).lastChild.lastChild.lastChild.lastChild.appendChild(graphs)
  get_elment_by_id_not_null("summary").appendChild(div)
  

}


interface IGenParams
{
  flowerChance:number;
  leafChance:number;
  leafType:number[];
  flowerShape:(x:number)=>number;
  leafShape:(x:number)=>number;
  flowerColor:IColorRange;
  leafColor:IColorRange;

  flowerOpenCurve:(x:number,op:number)=>number;
  flowerColorCurve:(x:number)=>number;

  leafLength:number;
  flowerLength:number;
  pedicelLength:number;

  leafWidth:number;

  flowerWidth:number;

  stemWidth:number;
  stemBend:number;
  stemLength:number;
  stemCount:number;

  sheathLength:number;
  sheathWidth:number;
  shootCount:number;
  shootLength:number;
  leafPosition:number;

  flowerPetal:number;

  innerLength:number;
  innerWidth:number;
  innerShape:(x:number)=>number;
  
  innerColor:IColorRange;
  
  branchWidth:number;
  branchTwist:number;
  branchDepth:number;
  branchFork:number;

  branchColor:IColorRange;

}

// generate random parameters
function genParams(){
  const randint = (x:number,y:number) => (Math.floor(normRand(x,y)))

  const PAR:IGenParams = {

  }as any;
  
  const flowerShapeMask = (x:number) => (pow(sin(PI*x),0.2))
  const leafShapeMask = (x:number) => (pow(sin(PI*x),0.5))

  PAR.flowerChance = randChoice([normRand(0,0.08),normRand(0,0.03)])
  PAR.leafChance = randChoice([0, normRand(0,0.1), normRand(0,0.1)])
  PAR.leafType = randChoice([
    [1,randint(2,5)],
    [2,randint(3,7),randint(3,8)],
    [2,randint(3,7),randint(3,8)],
  ])

  const flowerShapeNoiseSeed = _random()*PI
  const flowerJaggedness = normRand(0.5,8)
  PAR.flowerShape = (x:number) => (Noise.noise(x*flowerJaggedness,flowerShapeNoiseSeed)*flowerShapeMask(x))


  var leafShapeNoiseSeed = _random()*PI;
  var leafJaggedness = normRand(0.1,40)
  var leafPointyness = normRand(0.5,1.5)
  PAR.leafShape = randChoice([
    //todo iloseall flowerShapeNoiseSeed => leafShapeNoiseSeed
    (x) => (Noise.noise(x*leafJaggedness,flowerShapeNoiseSeed)*leafShapeMask(x)),
    (x) => (pow(sin(PI*x),leafPointyness))
  ])

  var flowerHue0 = (normRand(0,180)-130+360)%360
  var flowerHue1 = Math.floor((flowerHue0 + normRand(-70,70) + 360)%360)
  var flowerValue0 = Math.min(1,normRand(0.5,1.3))
  var flowerValue1 = Math.min(1,normRand(0.5,1.3))
  var flowerSaturation0 = normRand(0,1.1-flowerValue0)
  var flowerSaturation1 = normRand(0,1.1-flowerValue1)

  PAR.flowerColor = {min:[flowerHue0,flowerSaturation0,flowerValue0,normRand(0.8,1)],
                     max:[flowerHue1,flowerSaturation1,flowerValue1,normRand(0.5,1)]}
  PAR.leafColor = {min:[normRand(10,200),normRand(0.05,0.4),normRand(0.3,0.7),normRand(0.8,1)],
                   max:[normRand(10,200),normRand(0.05,0.4),normRand(0.3,0.7),normRand(0.8,1)]}

  var curveCoeff0 = [normRand(-0.5,0.5),normRand(5,10)]
  var curveCoeff1 = [_random()*PI, normRand(1,5)]

  var curveCoeff2 = [_random()*PI,normRand(5,15)]
  var curveCoeff3 = [_random()*PI,normRand(1,5)]
  var curveCoeff4 = [_random()*0.5,normRand(0.8,1.2)]

  PAR.flowerOpenCurve = randChoice([
    (x:number,op:number) => (
      (x < 0.1) ? 
        2+op*curveCoeff2[1]
      : Noise.noise(x*10,curveCoeff2[0])),
    (x:number,op:number) => (
      (x < curveCoeff4[0]) ? 0 : 10-x*mapval(op,0,1,16,20)*curveCoeff4[1]
    )
  ])
 
  PAR.flowerColorCurve = randChoice([
      (x)=>(sigmoid(x+curveCoeff0[0],curveCoeff0[1])),
      //(x)=>(Noise.noise(x*curveCoeff1[1],curveCoeff1[0]))
  ])
  PAR.leafLength = normRand(30,100)
  PAR.flowerLength = normRand(5,55) //* (0.1-PAR.flowerChance)*10
  PAR.pedicelLength = normRand(5,30)

  PAR.leafWidth = normRand(5,30)

  PAR.flowerWidth = normRand(5,30)

  PAR.stemWidth = normRand(2,11)
  PAR.stemBend = normRand(2,16)
  PAR.stemLength = normRand(300,400)
  PAR.stemCount = randChoice([2,3,4,5])

  PAR.sheathLength = randChoice([0,normRand(50,100)])
  PAR.sheathWidth = normRand(5,15)
  PAR.shootCount = normRand(1,7)
  PAR.shootLength = normRand(50,180)
  PAR.leafPosition = randChoice([1,2])

  PAR.flowerPetal = Math.round(mapval(PAR.flowerWidth,5,50,10,3))

  PAR.innerLength = Math.min(normRand(0,20),PAR.flowerLength*0.8)
  PAR.innerWidth = Math.min(randChoice([0,normRand(1,8)]),PAR.flowerWidth*0.8)
  PAR.innerShape = (x) => (pow(sin(PI*x),1))
  var innerHue = normRand(0,60)
  PAR.innerColor = {min:[innerHue,normRand(0.1,0.7),normRand(0.5,0.9),normRand(0.8,1)],
                    max:[innerHue,normRand(0.1,0.7),normRand(0.5,0.9),normRand(0.5,1)]}
  
  PAR.branchWidth = normRand(0.4,1.3)
  PAR.branchTwist = Math.round(normRand(2,5))
  PAR.branchDepth = randChoice([3,4])
  PAR.branchFork = randChoice([4,5,6,7])

  var branchHue = normRand(30,60)
  var branchSaturation = normRand(0.05,0.3)
  var branchValue = normRand(0.7,0.9)
  PAR.branchColor = {min:[branchHue,branchSaturation,branchValue,1],
                     max:[branchHue,branchSaturation,branchValue,1]}

  console.log(PAR)

  vizParams(PAR)
  return PAR
}
interface IWoodyContext
{
  ctx:IDrawContext;
  xof:number;
  yof:number;
  PAR?:IGenParams;
}
// generate a woody plant
function woody(args:IWoodyContext){
  var ctx = args.ctx;  
  var xof = (args.xof != undefined) ? args.xof : 0;  
  var yof = (args.yof != undefined) ? args.yof : 0;  
  var PAR = (args.PAR != undefined) ? args.PAR : genParams();

  var cwid = 1200
  var lay0 = Layer.empty(cwid)
  var lay1 = Layer.empty(cwid)

  var PL = branch({
    ctx:lay0,xof:cwid*0.5,yof:cwid*0.7,
    wid:PAR.branchWidth,
    twi:PAR.branchTwist,
    dep:PAR.branchDepth,
    col:PAR.branchColor,
    frk:PAR.branchFork,
   })
  console.log(PL);
  for (var i = 0; i < PL.length; i++){
    if (i/PL.length > 0.1){
      for (var j = 0; j < PL[i].pts.length; j++){
        if (_random() < PAR.leafChance){
          leaf({ctx:lay0,
            xof:PL[i].pts[j][0], yof:PL[i].pts[j][1],
            len:PAR.leafLength *normRand(0.8,1.2),
            vei:PAR.leafType,
            col:PAR.leafColor,
            rot:[normRand(-1,1)*PI,normRand(-1,1)*PI,normRand(-1,1)*0],
            wid:(x) => (PAR.leafShape(x)*PAR.leafWidth),
            ben:(x) => ([
              mapval(Noise.noise(x*1,i),0,1,-1,1)*5,
              0,
              mapval(Noise.noise(x*1,i+PI),0,1,-1,1)*5
             ])})                
        }


        if (_random() < PAR.flowerChance){

          const hr:vec3 = [normRand(-1,1)*PI,normRand(-1,1)*PI,normRand(-1,1)*0]

          var P_ = stem({ctx:lay0,
            xof:PL[i].pts[j][0], yof:PL[i].pts[j][1],
            rot:hr,
            len:PAR.pedicelLength,
            col:{min:[50,1,0.9,1],max:[50,1,0.9,1]},
            wid:(x) => (sin(x*PI)*x*2+1),
            ben:(x) => ([
                0,0,0
               ])})

          var op = _random()
          
          var r = grot(P_,-1)
          var hhr = r
          for (var k = 0; k < PAR.flowerPetal; k++){

            leaf({ctx:lay1,flo:true,
              xof:PL[i].pts[j][0]+P_[-1][0], yof:PL[i].pts[j][1]+P_[-1][1],
              rot:[hhr[0],hhr[1],hhr[2]+k/PAR.flowerPetal*PI*2],
              len:PAR.flowerLength *normRand(0.7,1.3),
              wid:(x) => ( PAR.flowerShape(x)*PAR.flowerWidth ),
              vei:[0],
              col:PAR.flowerColor,
              cof:PAR.flowerColorCurve,
              ben:(x) => ([
                PAR.flowerOpenCurve(x,op),
                0,
                0,
               ])
             })

            leaf({ctx:lay1,flo:true,
              xof:PL[i].pts[j][0]+P_[-1][0], yof:PL[i].pts[j][1]+P_[-1][1],
              rot:[hhr[0],hhr[1],hhr[2]+k/PAR.flowerPetal*PI*2],
              len:PAR.innerLength *normRand(0.8,1.2),
              wid:(x) => ( sin(x*PI)*4 ),
              vei:[0],
              col:PAR.innerColor,
              cof:(x) => (x),
              ben:(x) => ([
                PAR.flowerOpenCurve(x,op),
                0,
                0,
               ])})

          }
        }
      }
    }
  }
  Layer.filter(lay0,Filter.fade)
  Layer.filter(lay0,Filter.wispy)
  Layer.filter(lay1,Filter.wispy)
  var b1 = Layer.bound(lay0)
  var b2 = Layer.bound(lay1)
  var bd = {
    xmin:Math.min(b1.xmin,b2.xmin),
    xmax:Math.max(b1.xmax,b2.xmax),
    ymin:Math.min(b1.ymin,b2.ymin),
    ymax:Math.max(b1.ymax,b2.ymax)
  }
  var xref = xof-(bd.xmin+bd.xmax)/2
  var yref = yof-bd.ymax
  Layer.blit(ctx,lay0,{ble:"multiply",xof:xref,yof:yref})
  Layer.blit(ctx,lay1,{ble:"normal",xof:xref,yof:yref})

}


interface IHerbalContext
{
  ctx:IDrawContext;
  xof:number;
  yof:number;
  PAR?:IGenParams;
}

// generate a herbaceous plant
function herbal(args:IHerbalContext){
  var ctx = args.ctx;  
  var xof = (args.xof != undefined) ? args.xof : 0;  
  var yof = (args.yof != undefined) ? args.yof : 0;
  var PAR = (args.PAR != undefined) ? args.PAR : genParams();

  var cwid = 1200
  var lay0 = Layer.empty(cwid)
  var lay1 = Layer.empty(cwid)

  var x0 = cwid*0.5
  var y0 = cwid*0.7
    
  for (let i = 0; i < PAR.stemCount; i++){
    const r:vec3 = [PI/2,0,normRand(-1,1)*PI]
    var P = stem({ctx:lay0,xof:x0,yof:y0,
      len:PAR.stemLength*normRand(0.7,1.3),
      rot:r,
      wid:(x) => (PAR.stemWidth*
        (pow(sin(x*PI/2+PI/2),0.5)*Noise.noise(x*10)*0.5+0.5)),
      ben:(x) => ([
          mapval(Noise.noise(x*1,i),0,1,-1,1)*x*PAR.stemBend,
          0,
          mapval(Noise.noise(x*1,i+PI),0,1,-1,1)*x*PAR.stemBend,
         ])})
    

    if (PAR.leafPosition == 2){
      for (var j = 0; j < P.length; j++)
        if (_random() < PAR.leafChance*2){
          leaf({ctx:lay0,
            xof:x0+P[j][0], yof:y0+P[j][1],
            len:2*PAR.leafLength *normRand(0.8,1.2),
            vei:PAR.leafType,
            col:PAR.leafColor,
            rot:[normRand(-1,1)*PI,normRand(-1,1)*PI,normRand(-1,1)*0],
            wid:(x) => (2*PAR.leafShape(x)*PAR.leafWidth),
            ben:(x) => ([
              mapval(Noise.noise(x*1,i),0,1,-1,1)*5,
              0,
              mapval(Noise.noise(x*1,i+PI),0,1,-1,1)*5
             ])})                
        }      
    }


    var hr = grot(P,-1)
    if (PAR.sheathLength != 0){
      stem({ctx:lay0,xof:x0+P[-1][0],yof:y0+P[-1][1],
        rot:hr,
        len:PAR.sheathLength,
        col:{min:[60,0.3,0.9,1],max:[60,0.3,0.9,1]},
        wid:(x) => PAR.sheathWidth*(pow(sin(x*PI),2)-x*0.5+0.5),
        ben:(x) => ([0,0,0]
           )})
    }
    for (var j = 0; j < Math.max(1,PAR.shootCount*normRand(0.5,1.5)); j++){
      var P_ = stem({ctx:lay0,xof:x0+P[-1][0],yof:y0+P[-1][1],
      rot:hr,
      len:PAR.shootLength*normRand(0.5,1.5),
      col:{min:[70,0.2,0.9,1],max:[70,0.2,0.9,1]},
      wid:(x) => (2),
      ben:(x) => ([
          mapval(Noise.noise(x*1,j),0,1,-1,1)*x*10,
          0,
          mapval(Noise.noise(x*1,j+PI),0,1,-1,1)*x*10
         ])})
      var op = _random()
      var hhr = [normRand(-1,1)*PI,normRand(-1,1)*PI,normRand(-1,1)*PI]
      for (var k = 0; k < PAR.flowerPetal; k++){
        leaf({ctx:lay1,flo:true,
          xof:x0+P[-1][0]+P_[-1][0], yof:y0+P[-1][1]+P_[-1][1],
          rot:[hhr[0],hhr[1],hhr[2]+k/PAR.flowerPetal*PI*2],
          len:PAR.flowerLength *normRand(0.7,1.3)*1.5,
          wid:(x) => ( 1.5*PAR.flowerShape(x)*PAR.flowerWidth ),
          vei:[0],
          col:PAR.flowerColor,
          cof:PAR.flowerColorCurve,
          ben:(x) => ([
            PAR.flowerOpenCurve(x,op),
            0,
            0,
           ])})

        leaf({ctx:lay1,flo:true,
          xof:x0+P[-1][0]+P_[-1][0], yof:y0+P[-1][1]+P_[-1][1],
          rot:[hhr[0],hhr[1],hhr[2]+k/PAR.flowerPetal*PI*2],
          len:PAR.innerLength *normRand(0.8,1.2),
          wid:(x) => ( sin(x*PI)*4 ),
          vei:[0],
          col:PAR.innerColor,
          cof:(x) => (x),
          ben:(x) => ([
            PAR.flowerOpenCurve(x,op),
            0,
            0,
           ])})
      }
    }

  }
  if (PAR.leafPosition == 1){
    for (var i = 0; i < PAR.leafChance*100; i++){
      leaf({ctx:lay0,
        xof:x0,yof:y0,rot:[PI/3,0,normRand(-1,1)*PI],
        len: 4*PAR.leafLength *normRand(0.8,1.2),
        wid:(x) => (2*PAR.leafShape(x)*PAR.leafWidth),
        vei:PAR.leafType,
        ben:(x) => ([
          mapval(Noise.noise(x*1,i),0,1,-1,1)*10,
          0,
          mapval(Noise.noise(x*1,i+PI),0,1,-1,1)*10
         ])})
    }
  }
  Layer.filter(lay0,Filter.fade)
  Layer.filter(lay0,Filter.wispy)
  Layer.filter(lay1,Filter.wispy)
  var b1 = Layer.bound(lay0)
  var b2 = Layer.bound(lay1)
  var bd = {
    xmin:Math.min(b1.xmin,b2.xmin),
    xmax:Math.max(b1.xmax,b2.xmax),
    ymin:Math.min(b1.ymin,b2.ymin),
    ymax:Math.max(b1.ymax,b2.ymax)
  }
  var xref = xof-(bd.xmin+bd.xmax)/2
  var yref = yof-bd.ymax
  Layer.blit(ctx,lay0,{ble:"multiply",xof:xref,yof:yref})
  Layer.blit(ctx,lay1,{ble:"normal",xof:xref,yof:yref})

}


// download generated image
function makeDownload(){
  var down = document.createElement('a')
  down.innerHTML = "[Download]"
  down.addEventListener('click', function() {
    var ctx = Layer.empty()
    for (var i = 0; i < ctx.canvas.width; i+= 512){
      for (var j = 0; j < ctx.canvas.height; j+= 512){
        ctx.drawImage(BGCANV,i,j);
      }
    }
    ctx.drawImage(CTX.canvas,0,0)
    this.href = ctx.canvas.toDataURL();
    this.download = SEED;
  }, false);
  document.body.appendChild(down);
  down.click()
  document.body.removeChild(down);
}

// toggle visibility of sub menus
function toggle(x:string,disp:"block"|"none"|"inline-block"){
  disp = (disp != undefined) ? disp : "block"
  var alle = ["summary","settings","share"]
  var d = get_elment_by_id_not_null(x).style.display;
  for (var i = 0; i < alle.length; i++){
    get_elment_by_id_not_null(alle[i]).style.display = "none"
  }
  if (d == "none"){
    get_elment_by_id_not_null(x).style.display = disp
  }
}

// fill HTML background with paper texture
function makeBG(){
  setTimeout(_makeBG,10)
  function _makeBG(){
    BGCANV = paper({col:PAPER_COL0,tex:10,spr:0})
    var img = BGCANV.toDataURL("image/png");
    document.body.style.backgroundImage = 'url('+img+')';
  }
}

// generate new plant
function generate(){
  CTX = Layer.empty();
  CTX.fillStyle ="white"
  CTX.fillRect(0,0,CTX.canvas.width,CTX.canvas.height)
  //document.body.appendChild(CTX.canvas)
  var ppr = paper({col:PAPER_COL1})
  for (var i = 0; i < CTX.canvas.width; i+= 512){
    for (var j = 0; j < CTX.canvas.height; j+= 512){
      CTX.drawImage(ppr,i,j);
    }
  }
  if (_random() <= 0.5){
    woody({ctx:CTX,xof:300,yof:550,})
  }else{
    herbal({ctx:CTX,xof:300,yof:600,})
  }
  Layer.border(CTX,squircle(0.98,3))
}

// reload page with given seed
function reloadWSeed(s:string){
  var u = window.location.href.split("?")[0]
  window.location.href = u + "?seed=" + s;
}


function get_elment_by_id_not_null(id:string)
{
  const e=document.getElementById(id);
  if(e==null)
  {
    throw new Error(`HTML Element (${id}) should exists`);
  }
  return e!;
}

// initialize everything
function load(){
  _init();
  makeBG();
  setTimeout(_load,100)
  function _load(){
    generate();
    get_elment_by_id_not_null("canvas-container").appendChild(CTX.canvas)
    get_elment_by_id_not_null("loader").style.display = "none";
    get_elment_by_id_not_null("content").style.display = "block";
    (get_elment_by_id_not_null("inp-seed") as HTMLInputElement).value = SEED;
    (get_elment_by_id_not_null("share-twitter")as  HTMLLinkElement).href=
      "https://twitter.com/share?url="
      +window.location.href
      +"&amp;text="+window.location.href+";hashtags=nonflowers";
  }
}



