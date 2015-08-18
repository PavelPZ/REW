var vyzva;
(function (vyzva) {
    var productHomeController = (function () {
        function productHomeController($scope, $state, lp) {
            $scope.state = $state.current;
            $scope.params = ($state.params);
        }
        productHomeController.loadProduct = function (producturl) {
            //proxies.vyzva57services.getCourseUserId(1, 1, '/lm/blended/english/blended.product/', num => alert(num));
            //return blended.loader.adjustProduct({ adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: producturl, url: null, $http: null, $q:null });
            return blended.loader.adjustEx({
                adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: producturl, taskid: 'x',
                url: '/lm/oldea/english1/l01/a/hueex0_l01_a04', $http: null, $q: null
            });
        };
        //static $inject = ['$scope', '$state', 'loadedProduct'];
        productHomeController.$inject = ['$scope', '$state'];
        return productHomeController;
    })();
    vyzva.productHomeController = productHomeController;
})(vyzva || (vyzva = {}));
