var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var lectorEvalController = (function (_super) {
        __extends(lectorEvalController, _super);
        function lectorEvalController(state) {
            _super.call(this, state);
            this.breadcrumb = this.breadcrumbBase();
            this.breadcrumb.push({ title: 'xxx', active: true });
        }
        return lectorEvalController;
    })(vyzva.lectorViewBase);
    vyzva.lectorEvalController = lectorEvalController;
})(vyzva || (vyzva = {}));
