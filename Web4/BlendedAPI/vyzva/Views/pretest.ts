namespace vyzva {


  export class pretestViewController extends blended.taskViewController {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this.ctx);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
    }
  }

  //export class pretestTaskController extends blended.pretestTaskController {
  //  constructor(state: blended.IStateService) {
  //    super(state); 
  //  }
  //}


}