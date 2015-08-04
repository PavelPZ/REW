module x {
  export class A {
    constructor() {
      this.p = this.x + 1;
    }
    fnc() { return this.p.toString(); }
    p: number;
    x: number;
  }
  export class B extends A {
    constructor() {
      super();
      this.p2 = this.x2 + '1';
    }
    fnc() { return (2 * this.p).toString(); }
    p2: string;
    x2: string;
  }
  var lit: any = { x: 100, x2: '100' };

  lit.prototype = B.prototype;
  lit.prototype.constructor.apply(lit);
  var res = lit.fnc();
  res = 0;
}
