var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var test;
(function (test) {
    var Controller = (function () {
        function Controller($scope) {
            this.$scope = $scope;
            //this.$scope.model = this;
        }
        return Controller;
    })();
    test.Controller = Controller;
    var PageController = (function (_super) {
        __extends(PageController, _super);
        function PageController($scope, sitemapNode) {
            _super.call(this, $scope);
            this.$scope = $scope;
            this.sitemapNode = sitemapNode;
            test.root.$scope.actPage = this;
        }
        ;
        PageController.$inject = ['$scope', 'sitemapNode'];
        return PageController;
    })(Controller);
    test.PageController = PageController;
})(test || (test = {}));
//# sourceMappingURL=lib.js.map