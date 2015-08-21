namespace vyzva {

  //******* predchudce vsech stranek. 
  export class controller extends blended.controller {
    static $inject = ['$scope', '$state', '$rootTask'];
    constructor($scope: ng.IScope, $state: angular.ui.IStateService, public $rootTask: blendedCourseTask) {
      super($scope, $state);
    }
    title: string;
  }

  //******* Home produktu
  export class productHomeController extends controller {
    constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
      this.title = "Home"
    }
  }

  //******* Home pretestu
  export class pretestHomeController extends controller {
    constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
      this.title = "Pretest"
    }
  }

  //******* Home pretestItem
  //export class pretestItemHomeController extends controller {
  //  constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
  //    super($scope, $state, $rootTask);
  //  }
  //}

  //******* Home checkTestu
  //export class checkTestHomeController extends controller {
  //  constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
  //    super($scope, $state, $rootTask);
  //  }
  //}

  //******* Home lekce
  export class moduleHomeController extends controller {
    constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
  }

  //******* Home testu
  export class exerciseController extends controller {
    constructor($scope: ng.IScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
  }

  //*************** RESOLVERs
  //adjust produkt
  export var loadProduct = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    $stateParams.finishProduct = finishProdukt;
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