var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var controler = (function (_super) {
        __extends(controler, _super);
        function controler($scope, $state, product, courseTask) {
            _super.call(this, $scope, $state);
            this.product = product;
            this.courseTask = courseTask;
        }
        controler.prototype.greenBtnClick = function () { this.courseTask.goAhead({ $q: this.$scope.params.$q }); };
        controler.$inject = ['$scope', '$state', '$q', '$loadedProduct', '$loadedTask'];
        return controler;
    })(blended.controller);
    vyzva.controler = controler;
    var productHomeController = (function (_super) {
        __extends(productHomeController, _super);
        //static $inject = ['$scope', '$state'];
        function productHomeController($scope, $state, prod, courseTask) {
            _super.call(this, $scope, $state);
        }
        productHomeController.$inject = ['$scope', '$state'];
        return productHomeController;
    })(blended.controller);
    vyzva.productHomeController = productHomeController;
    //export var loadProduct = ["$route", ($route) => {
    vyzva.loadProduct = ['$stateParams', function ($stateParams) {
            blended.finishContext($stateParams);
            return blended.loader.adjustProduct($stateParams);
            //{
            //  adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: prodUrl, taskid: blended.newGuid(), url: '', $http: null, $q: null
            //});
        }];
    vyzva.loadTask = ['$loadedProduct', '$stateParams', function (prod, $stateParams) {
            blended.finishContext($stateParams);
            var def = $stateParams.$q.defer();
            //other="{'loader':'vyzva57'}" z d:\LMCom\rew\Web4\lm\BLCourse\English\meta.xml. Jak vytvorit task z produktu
            if (!prod.other || JSON.parse(prod.other)['loader'] != 'vyzva57')
                def.reject('$loadedProduct.loader != vyzva57');
            new blended.blendedCourseTask(prod, $stateParams, function (t) { return def.resolve(t); });
            return def.promise;
        }];
})(vyzva || (vyzva = {}));
