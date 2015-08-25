namespace vyzva {
  //export class moduleHomeController extends controller implements IToolbar, IToolbarRun {
  //  constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
  //    super($scope, $state, $rootTask);
  //  }
  //  tbTitle = 'Spustit lekci';
  //  tbClick() { alert('click lesson'); }
  //}

  export class moduleViewController extends blended.taskViewController {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
    }
  }

  export class moduleTaskController extends blended.pretestTaskController {
    constructor(state: blended.IStateService) {
      super(state); 
    }
  }

}