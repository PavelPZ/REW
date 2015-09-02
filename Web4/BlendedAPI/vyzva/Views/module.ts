namespace vyzva {

  export class moduleViewController extends blended.taskViewController {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
    }
  }

  export class moduleTaskController extends blended.moduleTaskController {
    constructor(state: blended.IStateService) {
      super(state); 
    }
  }

}