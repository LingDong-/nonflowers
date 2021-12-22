// Nonflowers
// Procedurally generated paintings of nonexistent flowers.
// (c) Lingdong Huang 2018

//todo by iloseall remove this
for (let i = 1; i < 4; i++){
    function f(i:number){
      Object.defineProperty(Array.prototype, "-"+i, {
          get: function () {
            return this[this.length-i];
          },
          set: function (n) {
            this[this.length-i] = n;
          },
      });
    }
    f(i)
  }
  