namespace vyzva {

  export class lectorLevelController extends lectorViewBase { 
    constructor(state: blended.IStateService) {
      super(state);
      this.title = 'Licenční klíče pro ' + this.parent.lectorGroup.title;
      this.breadcrumb = this.breadcrumbBase();
      this.breadcrumb.push({ title: this.title, active: true });
    }
    parent: lectorController;
  }

}