var vyzva;
(function (vyzva) {
    var productHomeController = (function () {
        function productHomeController($scope, $state) {
            $scope.state = $state.current;
            $scope.params = ($state.params);
        }
        productHomeController.loadProduct = function (producturl) {
            return blended.loader.adjustProduct({ adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: producturl, url: null });
        };
        productHomeController.$inject = ['$scope', '$state'];
        return productHomeController;
    })();
    vyzva.productHomeController = productHomeController;
})(vyzva || (vyzva = {}));
