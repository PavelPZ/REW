module blended {
  export function enocdeUrl(url: string): string {
    if (!url) return url;
    return url.replace(/\//g,'!');
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
      $scope.state = $state.current;
      $scope.params = <learnContext><any>($state.params);
      finishContext($scope.params);
      $scope.events = this;
    }
    $scope: IScope;
  }
  export interface IScope extends ng.IScope {
    state: angular.ui.IState;
    params: learnContext; //query route parametry
    events: Object; //pro View zpristupnuje metody kontroleru
  }


  export var baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu

  export interface learnContext {
    userid: number; adminid: number; companyid: number; loc: LMComLib.Langs; persistence: CourseMeta.IPersistence; producturl: string; url: string; taskid: string;//URL parametry
    $http?: ng.IHttpService, $q?: ng.IQService; //services
  }
  export function cloneContext(ctx: learnContext): learnContext { var res = {}; $.extend(res, ctx); return <learnContext>res; }
  export function finishContext(ctx: learnContext): learnContext {
    if (ctx.$http && ctx.$q) return ctx;
    ctx.producturl = decodeUrl(ctx.producturl);
    ctx.url = decodeUrl(ctx.url);
    var inj = angular.injector(['ng']);
    ctx.$http = <ng.IHttpService>(inj.get('$http'));
    ctx.$q = <ng.IQService>(inj.get('$q'));
    return ctx;
  }


}