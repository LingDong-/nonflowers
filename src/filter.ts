// collection of image filters
type color_filter_func=(x:number,y:number,r:number,g:number,b:number,a:number)=>[number,number,number,number];
const Filter:{
    [key:string]:color_filter_func
} = {
    wispy: function(x:number,y:number,r:number,g:number,b:number,a:number){
      var n = Noise.noise(x*0.2,y*0.2)
      var m = Noise.noise(x*0.5,y*0.5,2)
      return [r,g*mapval(m,0,1,0.95,1),b*mapval(m,0,1,0.9,1),a*mapval(n,0,1,0.5,1)]
    },
    fade:function(x:number,y:number,r:number,g:number,b:number,a:number){
      var n = Noise.noise(x*0.01,y*0.01)
      return [r,g,b,a*Math.min(Math.max(mapval(n,0,1,0,1),0),1)]
    },
  }
  