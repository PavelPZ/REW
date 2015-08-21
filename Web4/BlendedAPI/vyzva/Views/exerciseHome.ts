namespace vyzva {
  export class exerciseController extends controller implements IToolbar, IToolbarModule {
    constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
    }
    tbTitle = 'Spustit lekci';
    tbClick() { alert('click exercise'); }
    tbSkipClick() { alert('skip exercise'); }
    tbFinishClick() { alert('finish exercise'); }
  }

  export class exerciseTaskController extends blended.exerciseTaskController {
  }

}