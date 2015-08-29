var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var lectorLevelController = (function (_super) {
        __extends(lectorLevelController, _super);
        function lectorLevelController(state) {
            _super.call(this, state);
            this.title = 'Licenční klíče pro ' + this.parent.lectorGroup.title;
            this.breadcrumb = this.breadcrumbBase();
            this.breadcrumb.push({ title: this.title, active: true });
        }
        return lectorLevelController;
    })(vyzva.lectorViewBase);
    vyzva.lectorLevelController = lectorLevelController;
})(vyzva || (vyzva = {}));
