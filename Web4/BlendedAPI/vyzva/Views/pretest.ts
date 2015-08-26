namespace vyzva {


  export class pretestViewController extends blended.taskViewController {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
    }
  }

}