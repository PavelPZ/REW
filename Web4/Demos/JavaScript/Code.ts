/*
module Mod {
  export class Test {
    name2: string = 'name2';
    static name3: string = 'name3';
    call3: any;
    constructor(public name: string) {
      this.call3 = (s: string) => { alert(this.name); };
    }
  }
  var name4: string;
  export var name5: string;
  export var call2 = (s: string) => { alert(this); };
  export class Test2 extends Test {
    constructor(name: string) {
      super(name);
    }
    call(): void { if (this == null) return; }
  }
}
class test {
  constructor () {
    this.prop = ko.DeferedRead(this.prop2, (val) => {
      return (2 * val).toString();
  });
  }
  prop2 = ko.InitObservable(() => 1);
  prop:any; 
  
}
var t = new test();
alert('afterNew');
alert(t.prop2());
alert(t.prop());
t.prop2(2);
alert(t.prop());
*/