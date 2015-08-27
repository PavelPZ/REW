var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var managerLANGMaster = (function (_super) {
        __extends(managerLANGMaster, _super);
        function managerLANGMaster(state, resolves) {
            _super.call(this, state);
            this.enteredProduct = resolves[0];
        }
        return managerLANGMaster;
    })(blended.controller);
    vyzva.managerLANGMaster = managerLANGMaster;
})(vyzva || (vyzva = {}));
