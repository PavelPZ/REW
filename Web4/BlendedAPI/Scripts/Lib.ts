module blended {

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

  export function downloadExcelFile(url: string) {
    var hiddenIFrameID = 'hiddenDownloader';
    var iframe = <HTMLIFrameElement>($('#hiddenDownloader')[0]);
    if (!iframe) {
      iframe = <HTMLIFrameElement>($('<iframe id="hiddenDownloader" style="display:none" src="about:blank"></iframe>')[0]);
      $('body').append(iframe);
    }
    iframe.src = url;
  }

  export interface learnContext {
    //URL parametry
    loginid: number; /*userdataid: number;*/ companyid: number; loc: LMComLib.Langs; persistence: string;
    producturl: string; taskid: string; lickeys: string;
    onbehalfof?: number; //id studenta, jehoz data vyuzivam
    returnurl?: string; //return url pro back tlacitko
    //pro intranet:
    groupid?: string; //identifikace skupiny studentu
    //lectortab?: string, //tab na lector strance
    homelinktype?: string; //typ home: mimo undefined (standardni) jeste vyzvademo
    vyzvademocompanytitle?: string; //companytitle pro homelinktype=vyzvademo

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
    if (_.isString(ctx.onbehalfof)) ctx.onbehalfof = parseInt(<any>(ctx.onbehalfof)); else if (!ctx.onbehalfof) ctx.onbehalfof = <any>'';
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

  export function waitForEvaluation(sc: IExShort): boolean { return !!(sc.flag & CourseModel.CourseDataFlag.needsEval); }
  export function scorePercent(sc: IExShort): number { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
  export function donesPercent(sc: IExShortAgreg): number { return sc.count == 0 ? -1 : Math.round((sc.dones || 0) / sc.count * 100); }
  export function scoreText(sc: IExShort): string { var pr = scorePercent(sc); return pr < 0 ? '' : pr.toString() + '%'; }

  export function agregateShorts(shorts: Array<IExShortAgreg>): IExShortAgreg {
    var res: IExShortAgreg = $.extend({}, shortDefaultAgreg);
    persistUserIsDone(res, true);
    _.each(shorts, short => {
      if (!short) { persistUserIsDone(res, false); return; }
      var done = persistUserIsDone(short);
      res.waitForEvaluation = res.waitForEvaluation || short.waitForEvaluation;
      if (!done) persistUserIsDone(res, false);
      res.count += short.count || 1;
      res.dones += (short.dones ? short.dones : (persistUserIsDone(short) ? 1 : 0));
      if (done) { //zapocitej hotove cviceni
        res.ms += short.ms || 0; res.s += short.s || 0;
      }
      //elapsed, beg a end
      res.beg = setDate(res.beg, short.beg, true); res.end = setDate(res.end, short.end, false);
      res.elapsed += short.elapsed || 0;
      res.sPlay += short.sPlay; res.sPRec += short.sPRec; res.sRec += short.sRec;
    });
    res.score = blended.scorePercent(res);
    res.finished = blended.donesPercent(res);
    return res;
  }
  export interface IAutoHumanResult{ auto: IExShortAgreg, human: IExShortAgreg; }
  export function agregateAutoHuman(node: CourseMeta.data, taskId: string): IAutoHumanResult {
    var res: IAutoHumanResult = <any>{ auto: { ms: 0, s: 0, score: 0 }, human: { ms: 0, s: 0, score: 0 } };
    _.each(node.Items, nd => {
      if (!isEx(nd)) return;
      var us = getPersistWrapper<IExShortAgreg>(nd, taskId);
      var done = us && persistUserIsDone(us.short);
      if (!done || !nd.ms) return;
      if (!!(us.short.flag & CourseModel.CourseDataFlag.pcCannotEvaluate)) {
        res.human.ms += nd.ms; res.human.s += us.short.s;
      } else {
        res.auto.ms += nd.ms; res.auto.s += us.short.s;
      }
    })
    res.auto.score = res.auto.ms ? Math.round(res.auto.s / res.auto.ms * 100) : -1;
    res.human.score = res.human.ms ? Math.round(res.human.s / res.human.ms * 100) : -1;
    return res;
  }
  export function agregateShortFromNodes(node: CourseMeta.data, taskId: string, moduleAlowFinishWhenUndone?: boolean /*do vyhodnoceni zahrn i nehotova cviceni*/): IExShortAgreg {
    var res: IExShortAgreg = $.extend({}, shortDefaultAgreg);
    persistUserIsDone(res, true);
    _.each(node.Items, nd => {
      if (!isEx(nd)) return;
      res.count++;
      var us = getPersistWrapper<IExShortAgreg>(nd, taskId);
      var done = us && persistUserIsDone(us.short);
      res.waitForEvaluation = res.waitForEvaluation || (done && waitForEvaluation(us.short));
      if (done) res.dones += (us.short.dones ? us.short.dones : (persistUserIsDone(us.short) ? 1 : 0));
      if (!done) persistUserIsDone(res, false);
      if (nd.ms) { //aktivni cviceni (se skore)
        if (done) { //hotove cviceni, zapocitej vzdy
          res.ms += nd.ms; res.s += us.short.s;
        } else if (moduleAlowFinishWhenUndone) { //nehotove cviceni, zapocitej pouze kdyz je moduleAlowFinishWhenUndone (napr. pro test)
          res.ms += nd.ms;
        }
      }
      if (us && us.short) { //elapsed, beg a end zapocitej vzdy
        res.beg = setDate(res.beg, us.short.beg, true); res.end = setDate(res.end, us.short.end, false);
        res.elapsed += us.short.elapsed;
        res.sPlay += us.short.sPlay; res.sPRec += us.short.sPRec; res.sRec += us.short.sRec;
      }
    })
    res.score = blended.scorePercent(res);
    res.finished = blended.donesPercent(res);
    return res;
  }
  export var shortDefault: IExShort = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), ms: 0, s: 0, sPlay: 0, sPRec: 0, sRec: 0, flag: 0 };
  export var shortDefaultAgreg: IExShortAgreg = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), ms: 0, s: 0, count: 0, dones: 0, sPlay: 0, sPRec: 0, sRec: 0, waitForEvaluation: false, flag:0 };
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