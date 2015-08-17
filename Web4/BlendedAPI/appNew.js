var blended;
(function (blended) {
    blended.newStates = {};
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
            name: blended.newStates.ajs_vyzvaproduct = 'pg.ajs.vyzvaproduct.home',
            url: '/home',
            template: "<h1>Home</h1>",
        });
    }
    blended.registerNew = registerNew;
})(blended || (blended = {}));
