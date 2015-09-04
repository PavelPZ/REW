module vyzva {

  //blended.rootModule
  //  .directive('vyzva$toolbar$greenbuttons', () => new toolbarGreenButtons())
  //;

  //export class toolbarGreenButtons {
  //  link = (scope, el: ng.IAugmentedJQuery) => {
  //  }
  //  templateUrl = vyzvaRoot + 'views/toolbar/run.html';
  //}

  export interface IToolbarRun {
    tbClick();
    tbBackClick();
    tbTitle:string;
  }
}