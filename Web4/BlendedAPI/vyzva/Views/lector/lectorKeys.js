var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var lectorKeysController = (function (_super) {
        __extends(lectorKeysController, _super);
        function lectorKeysController(state) {
            _super.call(this, state);
            this.title = 'Licenční klíče pro ' + this.parent.lectorGroup.title;
            this.breadcrumb = this.breadcrumbBase();
            this.breadcrumb.push({ title: this.title, active: true });
        }
        return lectorKeysController;
    })(vyzva.lectorViewBase);
    vyzva.lectorKeysController = lectorKeysController;
})(vyzva || (vyzva = {}));
