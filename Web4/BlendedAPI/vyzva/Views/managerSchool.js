var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var managerSchool = (function (_super) {
        __extends(managerSchool, _super);
        function managerSchool(state, resolves) {
            _super.call(this, state);
            this.msgRequired = 'Povinný údaj!';
            var res = (resolves[0]);
            this.enteredProduct = res.learningData;
            this.order = res.orderData;
            if (!this.order)
                this.order = { groups: [] };
        }
        //************** ORDER
        managerSchool.prototype.addItem = function (line, isPattern3) {
            this.order.groups.push({ title: '', line: line, num: isPattern3 ? 1 : 20, isPattern3: isPattern3 });
        };
        managerSchool.prototype.removeItem = function (idx) {
            this.order.groups.splice(idx, 1);
        };
        managerSchool.prototype.orderOK = function ($invalid) {
            this.showErrors = $invalid;
            //this.
            //this.order.closed = true;
        };
        managerSchool.prototype.disabled = function (line) { return _.any(this.order.groups, function (g) { return g.line == line && g.isPattern3; }); };
        return managerSchool;
    })(blended.controller);
    vyzva.managerSchool = managerSchool;
})(vyzva || (vyzva = {}));
