var vyzva;
(function (vyzva) {
    vyzva.stateNames = {};
    function registerNew(params) {
        params.$stateProvider
            .state({
            name: 'pg.ajs',
            url: '/ajs',
            abstract: true,
            controller: function () { Pager.clearHtml(); },
            template: "<div data-ui-view></div>",
        })
            .state({
            name: 'pg.ajs.vyzvaproduct',
            url: "/vyzvaproduct?producturl&persistence&userid&companyid&loc&adminid",
            template: "<div data-ui-view></div>",
        })
            .state({
            name: vyzva.stateNames.ajs_vyzvaproduct = 'pg.ajs.vyzvaproduct.home',
            url: '/home',
            controller: vyzva.productHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/productHome.html',
            resolve: {
                loadedProduct: function () { return vyzva.productHomeController.loadProduct('/lm/english_0_10/'); }
            }
        });
    }
    vyzva.registerNew = registerNew;
})(vyzva || (vyzva = {}));
