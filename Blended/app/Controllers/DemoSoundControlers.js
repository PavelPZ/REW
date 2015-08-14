var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var test;
(function (test) {
    var DSController = (function (_super) {
        __extends(DSController, _super);
        function DSController($scope, $state) {
            _super.call(this, $scope, $state);
        }
        DSController.$inject = ['$scope', '$state'];
        return DSController;
    })(test.PageController);
    test.DSController = DSController;
    var DSLangController = (function (_super) {
        __extends(DSLangController, _super);
        function DSLangController() {
            _super.apply(this, arguments);
        }
        return DSLangController;
    })(test.PageController);
    test.DSLangController = DSLangController;
    var DSLangLevelController = (function (_super) {
        __extends(DSLangLevelController, _super);
        function DSLangLevelController() {
            _super.apply(this, arguments);
        }
        return DSLangLevelController;
    })(test.PageController);
    test.DSLangLevelController = DSLangLevelController;
    var DSLangLevelFileController = (function (_super) {
        __extends(DSLangLevelFileController, _super);
        function DSLangLevelFileController() {
            _super.apply(this, arguments);
        }
        return DSLangLevelFileController;
    })(test.PageController);
    test.DSLangLevelFileController = DSLangLevelFileController;
})(test || (test = {}));
