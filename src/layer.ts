
// canvas context operations

type IDrawContext =CanvasRenderingContext2D;

const Layer= {
    empty:function(w?: number, h?: number) {
        w = (w != undefined) ? w : 600;
        h = (h != undefined) ? h : w;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const context = canvas.getContext('2d');
        if(context==null)
        {
            throw new Error(`canvas.getContext('2d') failed!`);
        }
        return context!;
    },
    blit:function(ctx0:IDrawContext, ctx1:IDrawContext, args:{
        ble?:string;
        xof?:number;
        yof?:number;
    }) {
        var args = (args != undefined) ? args : {};
        var ble = (args.ble != undefined) ? args.ble : "normal";
        var xof = (args.xof != undefined) ? args.xof : 0;
        var yof = (args.yof != undefined) ? args.yof : 0;
        ctx0.globalCompositeOperation = ble;
        ctx0.drawImage(ctx1.canvas, xof, yof)
    },
    filter:function(ctx:IDrawContext, f:color_filter_func) {
        var imgd = ctx.getImageData(0, 0,
            ctx.canvas.width, ctx.canvas.height);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var [r, g, b, a] = pix.slice(i, i + 4)
            var x = (i / 4) % (ctx.canvas.width)
            var y = Math.floor((i / 4) / (ctx.canvas.width))
            var [r1, g1, b1, a1] = f(x, y, r, g, b, a)
            pix[i] = r1
            pix[i + 1] = g1
            pix[i + 2] = b1
            pix[i + 3] = a1
        }
        ctx.putImageData(imgd, 0, 0);
    },
    border:function(ctx:IDrawContext, f:(th:number)=>number)
    {
        var imgd = ctx.getImageData(0, 0,
            ctx.canvas.width, ctx.canvas.height);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var [r, g, b, a] = pix.slice(i, i + 4)
            var x = (i / 4) % (ctx.canvas.width)
            var y = Math.floor((i / 4) / (ctx.canvas.width))

            var nx: number = (x / ctx.canvas.width - 0.5) * 2
            var ny: number = (y / ctx.canvas.height - 0.5) * 2
            var theta = Math.atan2(ny, nx)
            var r_ = distance([nx, ny], [0, 0])
            var rr_ = f(theta)

            if (r_ > rr_) {
                pix[i] = 0
                pix[i + 1] = 0
                pix[i + 2] = 0
                pix[i + 3] = 0
            }
        }
        ctx.putImageData(imgd, 0, 0);
    },
    // find the dirty region - potentially optimizable
    bound:function(ctx:IDrawContext) {
        var xmin = ctx.canvas.width
        var xmax = 0
        var ymin = ctx.canvas.height
        var ymax = 0
        var imgd = ctx.getImageData(0, 0,
            ctx.canvas.width, ctx.canvas.height);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var [r, g, b, a] = pix.slice(i, i + 4)
            var x = (i / 4) % (ctx.canvas.width)
            var y = Math.floor((i / 4) / (ctx.canvas.width))
            if (a > 0.001) {
                if (x < xmin) { xmin = x }
                if (x > xmax) { xmax = x }
                if (y < ymin) { ymin = y }
                if (y > ymax) { ymax = y }
            }
        }
        return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax }
    },
}
