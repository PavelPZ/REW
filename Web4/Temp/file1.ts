namespace idx {
  export var i1 = 'xxx';
  export var i2 = 'xxx';
}



interface IntrinsicElements {
  "my-element": number;
}

var el: IntrinsicElements = { "my-element": 1 };

const enum A { 
  "x y z",
  "y",
  "z"
}

var rect = { x: 0, y: 10, width: 15, height: 20 };

// Destructuring assignment
var {x, y, width, height} = rect;

var foo = { bar: { bas: 123 } };
var {bar: {bas}} = foo; // Effectively `var bas = foo.bar.bas;`

const enum E {
  y
}

var v = {
  [A.y]: ""
};

var [x, , ...remaining] = [1, 2, 3, 4];


interface I {
  xfoo: string;
  bar: number;
}
var i: I = { xfoo: '', bar: 2 }
var { xfoo, bar } = i;