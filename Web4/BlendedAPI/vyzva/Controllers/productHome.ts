namespace vyzva {

  export class controler extends blended.controller {
    static $inject = ['$scope', '$state', '$q', '$loadedProduct', '$loadedTask'];
    constructor($scope: productHomeScope, $state: angular.ui.IStateService, public product: CourseMeta.IProductEx, public courseTask: blended.blendedCourseTask) {
      super($scope, $state);
    }
    greenBtnClick() { this.courseTask.goAhead({ $q: this.$scope.params.$q }) }
  }

  export class productHomeController extends blended.controller {
    static $inject = ['$scope', '$state'];
    //static $inject = ['$scope', '$state'];

    constructor($scope: productHomeScope, $state: angular.ui.IStateService, prod: CourseMeta.IProductEx, courseTask: blended.IBlendedCourseRepository) {
      super($scope, $state);
    }
  }

  //export var loadProduct = ["$route", ($route) => {
  export var loadProduct = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    return blended.loader.adjustProduct($stateParams);
    //{
    //  adminid: 0, userid: 1, companyid: 1, loc: LMComLib.Langs.cs_cz, persistence: persistNewEA.persistCourse, producturl: prodUrl, taskid: blended.newGuid(), url: '', $http: null, $q: null
    //});
  }];
  export var loadTask = ['$loadedProduct', '$stateParams', (prod: CourseMeta.IProductEx, $stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    var def = $stateParams.$q.defer();
    //other="{'loader':'vyzva57'}" z d:\LMCom\rew\Web4\lm\BLCourse\English\meta.xml. Jak vytvorit task z produktu
    if (!prod.other || JSON.parse(prod.other)['loader'] != 'vyzva57') def.reject('$loadedProduct.loader != vyzva57');
    new blended.blendedCourseTask(prod, $stateParams, t => def.resolve(t));
    return def.promise;
  }];

  export interface productHomeScope extends blended.IScope {
  }

}