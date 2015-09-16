var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var testHwController = (function (_super) {
        __extends(testHwController, _super);
        function testHwController($scope, $state, $loadedEx) {
            _super.call(this, $scope, $state);
            this.exService = new blended.exerciseServiceSimple($loadedEx.pageJsonML, $loadedEx.mod.loc, null);
        }
        testHwController.$inject = ['$scope', '$state', '$loadedEx'];
        return testHwController;
    })(blended.controller);
    vyzva.testHwController = testHwController;
})(vyzva || (vyzva = {}));
