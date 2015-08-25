module blended {

  export enum levelIds {
    A1 = 0, A2 = 1, B1 = 2, B2 = 3,
  }

  export interface breadcrumbItem {
    title: string;
    url: string;
    active?: boolean;
  }

  export function encodeUrl(url: string): string {
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
    constructor($scope: IControllerScope, public $state: angular.ui.IStateService) {
      var params = <learnContext><any>($state.params);
      finishContext(params);
      $.extend(this, $scope, $state.current.data);
      $scope.ts = this;
      this.urlParams = params;
    }
    href(state: string, params?: {}): string {
      return this.$state.href(state, params);
    }
    urlParams: {};
  }
  export interface IControllerScope {
    ts: controller;
  }

  export var baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu

  export interface learnContext {
    //URL parametry
    userid: number; subuserid: number; companyid: number; loc: LMComLib.Langs; persistence: CourseMeta.IPersistence;
    producturl: string; taskid: string;
    pretesturl?: string; moduleurl?: string; url?: string; 
    //normalizovana url
    productUrl?: string; Url?: string; pretestUrl?: string; moduleUrl?: string; 
    //services
    $http?: ng.IHttpService,
    $q?: ng.IQService;
    $state?: angular.ui.IStateService;
    //produkt
    product?: IProductEx;
    finishProduct?: (prod: IProductEx) => void;
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
    ctx.productUrl = decodeUrl(ctx.producturl); ctx.Url = decodeUrl(ctx.url);
    ctx.pretestUrl = decodeUrl(ctx.pretesturl); ctx.moduleUrl = decodeUrl(ctx.moduleurl);
    if (!ctx.$http) {
      var inj = angular.injector(['ng']);
      ctx.$http = <ng.IHttpService>(inj.get('$http'));
      ctx.$q = <ng.IQService>(inj.get('$q'));
    }
    return ctx;
  }

  //export function getStateChain($state: angular.ui.IStateService): Array<angular.ui.IState> {
  //  var res = [];
  //  var stWrapper = <any>$state.$current;
  //  while (stWrapper) {
  //    res.push(stWrapper);
  //    stWrapper = stWrapper.parent;
  //  }
  //  return res;
  //}

  
 

  //************ LOGGING functions
  export function traceRoute() {
    // Credits: Adam's answer in http://stackoverflow.com/a/20786262/69362
    var $rootScope = angular.element(document.querySelectorAll("[ui-view]")[0]).injector().get('$rootScope');

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeError - fired when an error occurs during transition.');
      console.log(arguments);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
    });

    $rootScope.$on('$viewContentLoaded', function (event) {
      console.log('$viewContentLoaded - fired after dom rendered', event);
    });

    $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
      console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
      console.log(unfoundState, fromState, fromParams);
    });

  }
  https://gist.github.com/mkropat/6de4e1dc3a9577789917
  export function routerLogging($provide) {
    $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
      wrapMethod($delegate, '$broadcast', function (method, args) {
        if (isNonSystemEvent(args[0]))
          logCall('$broadcast', args);

        return method.apply(this, args);
      });

      wrapMethod($delegate, '$emit', function (method, args) {
        if (isNonSystemEvent(args[0]))
          logCall('$emit', args);

        return method.apply(this, args);
      });

      return $delegate;

      function isNonSystemEvent(eventName) {
        return eventName && eventName[0] && eventName[0] !== '$';
      }
    }]);

    $provide.decorator('$state', ['$delegate', function ($delegate) {
      wrapMethod($delegate, 'go', function (method, args) {
        logCall('$state.go', args);

        return method.apply(this, args);
      });

      return $delegate;
    }]);

    function wrapMethod(obj, methodName, wrapper) {
      var original = obj[methodName];

      obj[methodName] = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return wrapper.call(this, original, args);
      };
    }

    function logCall(funcName, args) {
      var prettyArgs = args.map(function (a) { return repr(a) })
        .join(', ');
      console.log(funcName + '(' + prettyArgs + ')');
    }

    function repr(obj) {
      return JSON.stringify(obj, function (k, v) {
        if (k !== '' && v instanceof Object)
          return '[Obj]';
        else
          return v;
      });
    }
  };


}