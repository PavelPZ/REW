namespace vyzva {

  export class pretestHomeController extends controller implements IToolbar, IToolbarRun {
    constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
      this.title = $rootTask.dataNode.pretest.title;
      this.breadcrumb.push({ title: this.title, url: null, active: true });
    }
    tbTitle = 'Spustit pretest';
    tbClick() { alert('click pretest'); }
  }

  export class pretestViewController extends blended.taskViewController {
    constructor($scope: blended.ITaskControllerScope, $state: angular.ui.IStateService) {
      super($scope, $state);
      this.breadcrumb = breadcrumbBase(this.myControler); 
      this.breadcrumb.push({ title: this.title, url: null, active: true });
    }
  }

  export class pretestTaskController extends blended.pretestTaskController {
    constructor($scope: blended.ITaskControllerScope, $state: angular.ui.IStateService) {
      super($scope, $state, 'pretestUrl');
    }
  }
}