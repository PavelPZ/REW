var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var x;
(function (x) {
    var A = (function () {
        function A() {
            this.p = this.x + 1;
        }
        A.prototype.fnc = function () { return this.p.toString(); };
        return A;
    })();
    x.A = A;
    var B = (function (_super) {
        __extends(B, _super);
        function B() {
            _super.call(this);
            this.p2 = this.x2 + '1';
        }
        B.prototype.fnc = function () { return (2 * this.p).toString(); };
        return B;
    })(A);
    x.B = B;
    var lit = { x: 100, x2: '100' };
    lit.prototype = B.prototype;
    lit.prototype.constructor.apply(lit);
    var res = lit.fnc();
    res = 0;
})(x || (x = {}));
