namespace vyzva {

  export class productHomeController {
    static $inject = ['$scope', '$state'];

    constructor($scope: productHomeScope, $state: angular.ui.IStateService) {
      $scope.state = $state.current;
      $scope.params = <productHomePars><{}>($state.params);
    }
    static loadProduct(producturl:string): ng.IPromise<CourseMeta.product> {
      return blended.loader.adjustProduct({ adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: producturl, url:null });
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