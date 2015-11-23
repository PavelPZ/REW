var limit = 100000; var range = 1000;
var start = new Date().getTime();
var arr = []; var hash = {};
for (var i = 0; i < limit; i++) {
  arr[i] = { x: 5 }; if (i > range) delete arr[i - range];
  hash[i.toString()] = { x: 5 }; if (i > range) delete hash[(i - range).toString()]; 
}
var end = new Date().getTime();
alert(Math.round((end - start) / 1000).toString()); 