namespace vyzva {

  export class pretestExercise extends blended.exerciseTaskViewController implements IToolbarRun {

    //pageUrls: string;

    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state, resolves);
      if (state.createMode != blended.createControllerModes.navigate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
      this.tbTitle = 'Pokračovat';
      
      //this.pageUrls = this.ctx.productUrl + '|' + this.ctx.moduleUrl + '|' + this.ctx.Url;
    }
    tbClick() {
      var pretest = _.find(this.taskList(), t => t.state.name == stateNames.pretestTask.name);
      if (pretest == null) throw 'pretest==null';
      this.navigate(pretest.goAhead());
    }
    tbTitle: string;
    state: state;
  }

  export class lessonExercise extends blended.exerciseTaskViewController {
  }

}