namespace vyzva {

  export class lectorEvalController extends lectorViewBase { 
    constructor(state: blended.IStateService) {
      super(state);
      this.tabIdx = 1;
      this.breadcrumb = this.breadcrumbBase();
      this.breadcrumb.push({ title: getLectorTabs()[this.tabIdx].shortTitle, active: true });
    }
  }

}