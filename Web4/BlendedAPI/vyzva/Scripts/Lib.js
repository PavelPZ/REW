var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    //******* predchudce vsech stranek. 
    var controller = (function (_super) {
        __extends(controller, _super);
        function controller($scope, $state, $rootTask) {
            _super.call(this, $scope, $state);
            this.$rootTask = $rootTask;
            this.breadcrumb = [
                { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() },
                { title: this.$rootTask.dataNode.title, url: this.href(vyzva.stateNames.productHome), active: false }
            ];
        }
        controller.prototype.gotoHomeUrl = function () { Pager.gotoHomeUrl(); };
        controller.$inject = ['$scope', '$state', '$rootTask'];
        return controller;
    })(blended.controller);
    vyzva.controller = controller;
})(vyzva || (vyzva = {}));
