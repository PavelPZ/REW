namespace vyzva {
  //export class exerciseController extends controller implements IToolbar, IToolbarModule {
  //  constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
  //    super($scope, $state, $rootTask);
  //  }
  //  tbTitle = 'Spustit lekci';
  //  tbClick() { alert('click exercise'); }
  //  tbSkipClick() { alert('skip exercise'); }
  //  tbFinishClick() { alert('finish exercise'); }
  //}

  export class pretestExercise extends blended.exerciseTaskViewController implements IToolbarRun {

    pageUrls: string;

    constructor(state: blended.IStateService) {
      super(state);
      if (state.createForCheckUrl != blended.createControllerCtx.navigate) return;
      this.breadcrumb = breadcrumbBase(this.ctx);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat';
      
      this.pageUrls = this.ctx.productUrl + '|' + this.ctx.moduleUrl + '|' + this.ctx.Url;
    }
    tbClick() {
      var pretest = _.find(this.taskList(), t => t.myState.name == stateNames.pretestTask.name);
      if (pretest == null) throw 'pretest==null';
      var url = pretest.goAhead();
      if (url == null) url = { stateName: stateNames.home.name, pars: this.ctx };
      this.navigate(url);
    }
    tbTitle: string;
  }

  export class lessonExercise extends blended.exerciseTaskViewController {
  }

}