module vyzva {

  export interface INewStates {
    ajs_vyzvaproduct?: string;
  }
  export var newStates: INewStates = {};

  export function registerNew(params: blended.createStatePars) {
    params.$stateProvider
      .state({
        name: 'pg.ajs',
        url: '/ajs',
        abstract: true,
        controller: () => { Pager.clearHtml(); },
        template: "<div data-ui-view></div>",
      })
      .state({
        name: 'pg.ajs.vyzvaproduct',
        url: "/vyzvaproduct?producturl&persistence&userid&companyid&loc&adminid",
        template: "<div data-ui-view></div>",
      })
      .state({
        name: newStates.ajs_vyzvaproduct = 'pg.ajs.vyzvaproduct.home',
        url: '/home',
        controller: productHomeController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/productHome.html',
        resolve: {
          loadProduct: () => productHomeController.loadProduct('/lm/english_a2_1/')
        }
      })
    ;
  }
}