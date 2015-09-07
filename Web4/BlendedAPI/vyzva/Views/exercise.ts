﻿namespace vyzva {

  export class moduleTaskController extends blended.moduleTaskController {
    //constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService) {
    //  super($scope, $state);
    //}
    //static $inject = ['$scope', '$state', '$modal'];
  }

  export class exerciseViewLow extends blended.exerciseTaskViewController implements IToolbarRun {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, public $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData);
    }
    tbClick() { this.greenClick(); }
    tbNavigateProductHome() { this.navigateProductHome() } //this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
    tbDoneTitle: string;
    confirmWrongScoreDialog(): ng.IPromise<any> {
      return this.$modal.open({
        templateUrl: 'vyzva$exercise$wrongscore.html',
      }).result;
    }
    congratulationDialog(): ng.IPromise<any> {
      return this.$modal.open({
        templateUrl: 'vyzva$exercise$congratulation.html',
      }).result;
    }
    static $inject = ['$scope', '$state', '$loadedEx', '$loadedLongData', '$modal'];
  }

  export class pretestExercise extends exerciseViewLow {

    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
      this.tbTitle = 'Pokračovat v testu';
      this.tbDoneTitle = 'Test dokončen';
    }
  }

  export class lessonExercise extends exerciseViewLow {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat v lekci';
      this.tbDoneTitle = 'Lekce dokončena';
    }
    state: state;
  }

  export class lessonTest extends exerciseViewLow {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat v testu';
      this.tbDoneTitle = 'Test dokončen';
    }
    state: state;
  }

}