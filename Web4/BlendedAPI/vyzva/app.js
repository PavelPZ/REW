var vyzva;
(function (vyzva) {
    vyzva.newStates = {};
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
            name: vyzva.newStates.ajs_vyzvaproduct = 'pg.ajs.vyzvaproduct.home',
            url: '/home',
            controller: vyzva.productHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/productHome.html',
            resolve: {
                loadProduct: function () { return vyzva.productHomeController.loadProduct('/lm/english_a2_1/'); }
            }
        });
    }
    vyzva.registerNew = registerNew;
})(vyzva || (vyzva = {}));
