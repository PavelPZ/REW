namespace vyzva {

  export class lectorController extends blended.controller {
    constructor(state: blended.IStateService) {
      super(state);
      var lectorGroups = (<homeTaskController>(this.taskRoot())).lectorGroups;
      var gid = parseInt(this.ctx.groupid);
      this.lectorGroup = _.find(lectorGroups, grp => grp.groupId == gid);
    }
    lectorGroup: intranet.IStudyGroup; //aktualni skupina
  }

  export class lectorViewBase extends blended.controller {
    constructor(state: blended.IStateService) {
      super(state);
      this.title = 'Studijní skupina ' + this.parent.lectorGroup.title;
      this.breadcrumb = this.breadcrumbBase(); this.breadcrumb[this.breadcrumb.length - 1].active = true;
    }
    breadcrumbBase(): Array<blended.breadcrumbItem> {
      var res = vyzva.breadcrumbBase(this);
      res.push({ title: this.title, url: this.href({ stateName: stateNames.lectorHome.name, pars: this.ctx }) });
      return res;
    }
    parent: lectorController;
    tabIdx: number;
  }

  export class lectorViewController extends lectorViewBase {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb[this.breadcrumb.length - 1].active = true;
      this.tabIdx = 0;
    }
  }

}