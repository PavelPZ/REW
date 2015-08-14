var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var test;
(function (test) {
    var HomeController = (function (_super) {
        __extends(HomeController, _super);
        function HomeController($scope, $state) {
            _super.call(this, $scope, $state);
        }
        ;
        return HomeController;
    })(test.PageController);
    test.HomeController = HomeController;
})(test || (test = {}));
