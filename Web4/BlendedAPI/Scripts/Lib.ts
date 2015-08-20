module blended {
  export function enocdeUrl(url: string): string {
    if (!url) return url;
    return url.replace(/\//g, '!');
  }
  export function decodeUrl(url: string): string {
    if (!url) return url;
    return url.replace(/\!/g, '/');
  }
  export function newGuid(): string { return (new Date().getTime() + (startGui++)).toString(); }
  var startGui = new Date().getTime();

  export class controller {
    static $inject = ['$scope', '$state'];
    constructor($scope: IScope, $state: angular.ui.IStateService) {
      this.$scope = $scope;
      $scope.params = <learnContext><any>($state.params);
      //$scope.state =
      $scope.params.$state = $state;
      finishContext($scope.params);
      $scope.events = this;
    }
    $scope: IScope;
  }
  export interface IScope extends ng.IScope {
    params: learnContext; //query route parametry
    events: Object; //pro View zpristupnuje metody kontroleru
  }

  export var baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu

  export interface learnContext {
    //URL parametry
    userid: number; adminid: number; companyid: number; loc: LMComLib.Langs; persistence: CourseMeta.IPersistence; producturl: string; url?: string; taskid: string; tasktype?: string;
    //normalizovana url
    productUrl?: string; Url?: string; 
    //services
    $http?: ng.IHttpService,
    $q?: ng.IQService; 
    $state?: angular.ui.IStateService;
    //produkt
    product?: IProductEx;
  }
  export function cloneAndModifyContext(ctx: learnContext, modify: (c: learnContext) => void = null): learnContext {
    var res: learnContext = <learnContext>{}; $.extend(res, ctx);
    if (modify) {
      modify(res);
      finishContext(res);
    }
    return res;
  }
  export function finishContext(ctx: learnContext): learnContext {
    ctx.productUrl = decodeUrl(ctx.producturl);
    ctx.Url = decodeUrl(ctx.url);
    if (!ctx.$http) {
      var inj = angular.injector(['ng']);
      ctx.$http = <ng.IHttpService>(inj.get('$http'));
      ctx.$q = <ng.IQService>(inj.get('$q'));
    }
    return ctx;
  }


}