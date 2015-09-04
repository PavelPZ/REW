namespace vyzva {

  export class pretestExercise extends blended.exerciseTaskViewController implements IToolbarRun {

    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state, resolves);
      if (state.createMode != blended.createControllerModes.navigate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
      this.tbTitle = 'Pokračovat';
    }
    tbClick() { this.greenClick(); }
    tbBackClick() { this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
  }

  export class lessonExercise extends blended.exerciseTaskViewController implements IToolbarRun {
    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state, resolves);
      if (state.createMode != blended.createControllerModes.navigate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat';
    }
    tbClick() { this.greenClick(); }
    tbBackClick() { this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
    state: state;
  }

  export class lessonTest extends blended.exerciseTaskViewController implements IToolbarRun {
    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state, resolves);
      if (state.createMode != blended.createControllerModes.navigate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat';
    }
    tbClick() { this.greenClick(); }
    tbBackClick() { this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
    state: state;
  }

}