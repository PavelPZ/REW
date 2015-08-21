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
        }
        controller.$inject = ['$scope', '$state', '$rootTask'];
        return controller;
    })(blended.controller);
    vyzva.controller = controller;
    //******* Home produktu
    var productHomeController = (function (_super) {
        __extends(productHomeController, _super);
        function productHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
            this.title = "Home";
        }
        return productHomeController;
    })(controller);
    vyzva.productHomeController = productHomeController;
    //******* Home pretestu
    var pretestHomeController = (function (_super) {
        __extends(pretestHomeController, _super);
        function pretestHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
            this.title = "Pretest";
        }
        return pretestHomeController;
    })(controller);
    vyzva.pretestHomeController = pretestHomeController;
    //******* Home pretestItem
    //export class pretestItemHomeController extends controller {
    //  constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
    //    super($scope, $state, $rootTask);
    //  }
    //}
    //******* Home checkTestu
    //export class checkTestHomeController extends controller {
    //  constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
    //    super($scope, $state, $rootTask);
    //  }
    //}
    //******* Home lekce
    var moduleHomeController = (function (_super) {
        __extends(moduleHomeController, _super);
        function moduleHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
        }
        return moduleHomeController;
    })(controller);
    vyzva.moduleHomeController = moduleHomeController;
    //******* Home testu
    var exerciseController = (function (_super) {
        __extends(exerciseController, _super);
        function exerciseController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
        }
        return exerciseController;
    })(controller);
    vyzva.exerciseController = exerciseController;
    //*************** RESOLVERs
    //adjust produkt
    vyzva.loadProduct = ['$stateParams', function ($stateParams) {
            blended.finishContext($stateParams);
            $stateParams.finishProduct = vyzva.finishProdukt;
            return blended.loader.adjustProduct($stateParams);
        }];
    //adjust root task
    vyzva.initRootTasks = ['$stateParams', '$q', '$loadedProduct', function ($stateParams, $q, product) {
            var def = $q.defer();
            $stateParams.product = product;
            blended.finishContext($stateParams);
            new vyzva.blendedCourseTask(product, $stateParams, null, function (t) { return def.resolve(t); });
            return def.promise;
        }];
})(vyzva || (vyzva = {}));
