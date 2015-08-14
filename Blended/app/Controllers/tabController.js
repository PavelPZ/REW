var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var test;
(function (test) {
    var TabController = (function (_super) {
        __extends(TabController, _super);
        function TabController() {
            _super.apply(this, arguments);
        }
        return TabController;
    })(test.Controller);
    test.TabController = TabController;
})(test || (test = {}));
