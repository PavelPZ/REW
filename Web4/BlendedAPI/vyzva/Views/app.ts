module vyzva {

  export interface ISstateNames {
    ajs_vyzvaproduct?: string;
  }
  export var stateNames: ISstateNames = {};

  export function registerNew(params: blended.createStatePars) {
    params.$stateProvider
      .state({
        name: 'pg.ajs',
        url: '/ajs',
        abstract: true,
        controller: () => { Pager.clearHtml(); }, //vyhozeni old obsahu
        template: "<div data-ui-view></div>",
      })
      .state({
        name: 'pg.ajs.vyzvaproduct',
        url: "/vyzvaproduct?producturl&persistence&userid&companyid&loc&adminid",
        abstract: true,
        controller: controler,
        resolve: {
          $loadedProduct: vyzva.loadProduct,
          $loadedTask: vyzva.loadTask
        },
        //template: "_productTemplate <div data-ui-view></div>",
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/_productTemplate.html',
      })
      .state({
        name: stateNames.ajs_vyzvaproduct = 'pg.ajs.vyzvaproduct.home',
        url: '/home',
        controller: productHomeController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/productHome.html',
      })
    ;
  }
}