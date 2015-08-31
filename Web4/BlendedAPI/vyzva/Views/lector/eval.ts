namespace vyzva {

  export class lectorEvalController extends lectorViewBase { 
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = this.breadcrumbBase();
      this.breadcrumb.push({ title: 'xxx', active: true });
    }
  }

}