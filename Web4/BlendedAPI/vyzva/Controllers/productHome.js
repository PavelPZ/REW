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
        }
        return productHomeController;
    })(controller);
    vyzva.productHomeController = productHomeController;
    //******* Home pretestu
    var pretestHomeController = (function (_super) {
        __extends(pretestHomeController, _super);
        function pretestHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
            $scope.greenBtnStatus = $rootTask.greenBtnStatus();
        }
        pretestHomeController.prototype.greenBtnClick = function () {
            window.location.hash = this.$rootTask.greenBtnHash();
        };
        return pretestHomeController;
    })(controller);
    vyzva.pretestHomeController = pretestHomeController;
    //******* Home pretestItem
    var pretestItemHomeController = (function (_super) {
        __extends(pretestItemHomeController, _super);
        function pretestItemHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
        }
        return pretestItemHomeController;
    })(controller);
    vyzva.pretestItemHomeController = pretestItemHomeController;
    //******* Home checkTestu
    var checkTestHomeController = (function (_super) {
        __extends(checkTestHomeController, _super);
        function checkTestHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
        }
        return checkTestHomeController;
    })(controller);
    vyzva.checkTestHomeController = checkTestHomeController;
    //******* Home lekce
    var lessonHomeController = (function (_super) {
        __extends(lessonHomeController, _super);
        function lessonHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
        }
        return lessonHomeController;
    })(controller);
    vyzva.lessonHomeController = lessonHomeController;
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
