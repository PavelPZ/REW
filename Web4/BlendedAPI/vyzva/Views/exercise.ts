namespace vyzva {

  export class pretestExercise extends blended.exerciseTaskViewController implements IToolbarRun {

    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
      this.tbTitle = 'Pokračovat v testu';
      this.tbDoneTitle = 'Test dokončen';
    }
    tbClick() { this.greenClick(); }
    tbNavigateProductHome() { this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
    tbDoneTitle: string;
  }

  export class lessonExercise extends blended.exerciseTaskViewController implements IToolbarRun {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat v lekci';
      this.tbDoneTitle = 'Lekce dokončena';
    }
    tbClick() { this.greenClick(); }
    tbNavigateProductHome() { this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
    tbDoneTitle: string;
    state: state;
  }

  export class lessonTest extends blended.exerciseTaskViewController implements IToolbarRun {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat v testu';
      this.tbDoneTitle = 'Test dokončen';
    }
    tbClick() { this.greenClick(); }
    tbNavigateProductHome() { this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
    tbDoneTitle: string;
    state: state;
  }

}