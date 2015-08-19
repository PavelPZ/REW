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
            abstract: true,
            controller: vyzva.controler,
            resolve: {
                $loadedProduct: vyzva.loadProduct,
                $loadedTask: vyzva.loadTask
            },
            //template: "_productTemplate <div data-ui-view></div>",
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/_productTemplate.html',
        })
            .state({
            name: vyzva.stateNames.ajs_vyzvaproduct = 'pg.ajs.vyzvaproduct.home',
            url: '/home',
            controller: vyzva.productHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/productHome.html',
        });
    }
    vyzva.registerNew = registerNew;
})(vyzva || (vyzva = {}));
