﻿module blended {

  export enum levelIds {
    A1 = 0, A2 = 1, B1 = 2, B2 = 3,
  }

  export interface breadcrumbItem {
    title: string;
    url?: string;
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

  export var baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu

  export interface learnContext {
    //URL parametry
    loginid: number; /*userdataid: number;*/ companyid: number; loc: LMComLib.Langs; persistence: string;
    producturl: string; taskid: string; lickeys: string;
    onbehalfof?: number; //id studenta, jehoz data vyuzivam
    returnurl?: string; //return url pro back tlacitko
    //pro intranet:
    groupid?:string, //identifikace skupiny studentu
    //lectortab?: string, //tab na lector strance

    pretesturl?: string; moduleurl?: string; url?: string; 
    //normalizovana url
    productUrl?: string; Url?: string; pretestUrl?: string; moduleUrl?: string; 
    //services
    $http?: ng.IHttpService,
    $q?: ng.IQService;
    //$state?: angular.ui.IStateService;
    //produkt
    //product?: IProductEx;
    finishProduct?: (prod: IProductEx) => void;
    userDataId?: () => number;
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
    ctx.userDataId = () => ctx.onbehalfof || ctx.loginid;
    if (_.isString(ctx.onbehalfof)) ctx.onbehalfof = parseInt(<any>(ctx.onbehalfof));
    if (_.isString(ctx.loginid)) ctx.loginid = parseInt(<any>(ctx.loginid));
    if (_.isString(ctx.companyid)) ctx.companyid = parseInt(<any>(ctx.companyid));
    if (_.isString(ctx.loc)) ctx.loc = parseInt(<any>(ctx.loc));

    if (!ctx.$http) {
      var inj = angular.injector(['ng']);
      ctx.$http = <ng.IHttpService>(inj.get('$http'));
      ctx.$q = <ng.IQService>(inj.get('$q'));
    }
    return ctx;
  }

  export function scorePercent(sc: IExShort) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
  export function donesPercent(sc: IExShort) { return sc.count == 0 ? -1 : Math.round((sc.dones || 0) / sc.count * 100); }
  export function scoreText(sc: IExShort) { var pr = scorePercent(sc); return pr < 0 ? '' : pr.toString() + '%'; }

  export function agregateShorts(shorts: Array<IExShort>): IExShort {
    var res: IExShort = $.extend({}, shortDefault);
    res.done = true;
    _.each(shorts, short => {
      if (!short) { res.done = false; return; }
      var done = short.done;
      res.done = res.done && done;
      res.count += short.count || 1;
      res.dones += (short.dones ? short.dones : (short.done ? 1 : 0));
      if (done) { //zapocitej hotove cviceni
        res.ms += short.ms || 0; res.s += short.s || 0;
      }
      //elapsed, beg a end
      res.beg = setDate(res.beg, short.beg, true); res.end = setDate(res.end, short.end, false);
      res.elapsed += short.elapsed || 0;
    });
    res.score = blended.scorePercent(res);
    res.finished = blended.donesPercent(res);
    return res;
  }
  export function agregateShortFromNodes(node: CourseMeta.data, taskId: string, moduleAlowFinishWhenUndone?: boolean /*do vyhodnoceni zahrn i nehotova cviceni*/): IExShort {
    var res: IExShort = $.extend({}, shortDefault);
    res.done = true;
    _.each(node.Items, nd => {
      if (!isEx(nd)) return;
      res.count++;
      var us = getPersistWrapper<IExShort>(nd, taskId);
      var done = us && us.short.done;
      if (done) res.dones += (us.short.dones ? us.short.dones : (us.short.done ? 1 : 0));
      res.done = res.done && done;
      if (nd.ms) { //aktivni cviceni (se skore)
        if (done) { //hotove cviceni, zapocitej vzdy
          res.ms += nd.ms; res.s += us.short.s;
        } else if (moduleAlowFinishWhenUndone) { //nehotove cviceni, zapocitej pouze kdyz je moduleAlowFinishWhenUndone (napr. pro test)
          res.ms += nd.ms;
        }
      }
      if (us) { //elapsed, beg a end zapocitej vzdy
        res.beg = setDate(res.beg, us.short.beg, true); res.end = setDate(res.end, us.short.end, false);
        res.elapsed += us.short.elapsed;
        res.sumPlay += us.short.sumPlay; res.sumPlayRecord += us.short.sumPlayRecord; res.sumRecord += us.short.sumRecord;
      }
    })
    res.score = blended.scorePercent(res);
    res.finished = blended.donesPercent(res);
    return res;
  }
  export var shortDefault: IExShort = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0, count: 0, dones: 0, sumPlay: 0, sumPlayRecord: 0, sumRecord: 0 };
  function setDate(dt1: number, dt2: number, min: boolean): number { if (!dt1) return dt2; if (!dt2) return dt1; if (min) return dt2 > dt1 ? dt1 : dt2; else return dt2 < dt1 ? dt1 : dt2; }

  ////************ LOGGING functions
  //export function traceRoute() {
  //  // Credits: Adam's answer in http://stackoverflow.com/a/20786262/69362
  //  var $rootScope = angular.element(document.querySelectorAll("[ui-view]")[0]).injector().get('$rootScope');

  //  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
  //    console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
  //  });

  //  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
  //    console.log('$stateChangeError - fired when an error occurs during transition.');
  //    console.log(arguments);
  //  });

  //  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
  //    console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
  //  });

  //  $rootScope.$on('$viewContentLoaded', function (event) {
  //    console.log('$viewContentLoaded - fired after dom rendered', event);
  //  });

  //  $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
  //    console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
  //    console.log(unfoundState, fromState, fromParams);
  //  });

  //}
  //https://gist.github.com/mkropat/6de4e1dc3a9577789917
  //export function routerLogging($provide) {
  //  $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
  //    wrapMethod($delegate, '$broadcast', function (method, args) {
  //      if (isNonSystemEvent(args[0]))
  //        logCall('$broadcast', args);

  //      return method.apply(this, args);
  //    });

  //    wrapMethod($delegate, '$emit', function (method, args) {
  //      if (isNonSystemEvent(args[0]))
  //        logCall('$emit', args);

  //      return method.apply(this, args);
  //    });

  //    return $delegate;

  //    function isNonSystemEvent(eventName) {
  //      return eventName && eventName[0] && eventName[0] !== '$';
  //    }
  //  }]);

  //  $provide.decorator('$state', ['$delegate', function ($delegate) {
  //    wrapMethod($delegate, 'go', function (method, args) {
  //      logCall('$state.go', args);

  //      return method.apply(this, args);
  //    });

  //    return $delegate;
  //  }]);

  //  function wrapMethod(obj, methodName, wrapper) {
  //    var original = obj[methodName];

  //    obj[methodName] = function () {
  //      var args = Array.prototype.slice.call(arguments, 0);
  //      return wrapper.call(this, original, args);
  //    };
  //  }

  //  function logCall(funcName, args) {
  //    var prettyArgs = args.map(function (a) { return repr(a) })
  //      .join(', ');
  //    console.log(funcName + '(' + prettyArgs + ')');
  //  }

  //  function repr(obj) {
  //    return JSON.stringify(obj, function (k, v) {
  //      if (k !== '' && v instanceof Object)
  //        return '[Obj]';
  //      else
  //        return v;
  //    });
  //  }
  //};

}