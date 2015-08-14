module test {

  interface IEmbedResponsiveScope extends IPageScope {
    params: IEmbedResponsiveParams;
  }

  interface IEmbedResponsiveParams { //route parametry
    src: string;
    ratio: string;
    columns: string;
  }

  export class EmbedResponsiveControler extends PageController {
    constructor($scope: IEmbedResponsiveScope, $state: angular.ui.IStateService) { 
      super($scope, $state);
    }
  }


}