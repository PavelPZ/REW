module vyzva {
  export class testHwController extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise) {
      super($scope, $state);
      this.exService = new blended.exerciseServiceSimple($loadedEx.pageJsonML, $loadedEx.mod.loc, null);
    }
    exService: blended.exerciseServiceSimple;
    static $inject = ['$scope', '$state', '$loadedEx'];
  }
}