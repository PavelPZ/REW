namespace vyzva {

  //******* predchudce vsech stranek. 
  export class controller extends blended.controller {
    static $inject = ['$scope', '$state', '$rootTask'];
    constructor($scope: IControlScope, $state: angular.ui.IStateService, public $rootTask: blendedCourseTask) {
      super($scope, $state);
    }
  }
  export interface IControlScope extends blended.IScope {
    greenBtnStatus: greenStatus;
  }

  //******* Home produktu
  export class productHomeController extends controller {
    constructor($scope: IProductHomeScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
  }
  export interface IProductHomeScope extends IControlScope {
  }

  //******* Home pretestu
  export class pretestHomeController extends controller {
    constructor($scope: IPretestHomeScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
      $scope.greenBtnStatus = $rootTask.greenBtnStatus();
    }
    greenBtnClick() {
      window.location.hash = this.$rootTask.greenBtnHash();
    }
  }
  export interface IPretestHomeScope extends IControlScope { }

  //******* Home pretestItem
  export class pretestItemHomeController extends controller {
    constructor($scope: IPretestItemHomeScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
  }
  export interface IPretestItemHomeScope extends IControlScope { }

  //******* Home checkTestu
  export class checkTestHomeController extends controller {
    constructor($scope: ICheckTestHomeScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
  }
  export interface ICheckTestHomeScope extends IControlScope { }

  //******* Home lekce
  export class lessonHomeController extends controller {
    constructor($scope: ILessonHomeScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
  }
  export interface ILessonHomeScope extends IControlScope { }

  //******* Home testu
  export class exerciseController extends controller {
    constructor($scope: IExerciseHomeScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
  }
  export interface IExerciseHomeScope extends IControlScope { }

  //*************** RESOLVERs
  //adjust produkt
  export var loadProduct = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    return blended.loader.adjustProduct($stateParams);
  }];

  //adjust root task
  export var initRootTasks = ['$stateParams', '$q', '$loadedProduct', ($stateParams: blended.learnContext, $q: ng.IQService, product: blended.IProductEx) => {
    var def = $q.defer<blendedCourseTask>();
    $stateParams.product = product;
    blended.finishContext($stateParams);
    new blendedCourseTask(product, $stateParams, null, t => def.resolve(<blendedCourseTask>t));
    return def.promise;
  }];

}