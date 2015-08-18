namespace vyzva {

  export class productHomeController {
    //static $inject = ['$scope', '$state', 'loadedProduct'];
    static $inject = ['$scope', '$state'];

    constructor($scope: productHomeScope, $state: angular.ui.IStateService, lp) {
      $scope.state = $state.current;
      $scope.params = <productHomePars><{}>($state.params);
    }
    static loadProduct(producturl: string): ng.IPromise<CourseMeta.product> {
      //proxies.vyzva57services.getCourseUserId(1, 1, '/lm/blended/english/blended.product/', num => alert(num));
      //return blended.loader.adjustProduct({ adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: producturl, url: null, $http: null, $q:null });
      return blended.loader.adjustEx({
        adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: producturl, taskid:'x',
        url: '/lm/oldea/english1/l01/a/hueex0_l01_a04', $http: null, $q: null
      });
    }
  }
  export interface productHomeScope extends ng.IScope {
    state: angular.ui.IState;
    params: productHomePars; //query route parametry
  }
  //url paprametry
  export interface productHomePars extends blended.learnContext {
  }

}