module Pager {

  if (typeof proxies!='undefined')
  proxies.invoke = (url: string, type: string, queryPars: Object, body: string, completed: (res) => void)=> {
    var ajaxOption: JQueryAjaxSettings = { type: type, contentType: "application/json" };
    ajaxOption.url = Pager.basicUrl + url; if (queryPars != null) ajaxOption.url += "?" + $.param(queryPars);
    if (body) ajaxOption.data = body;
    $.ajax(ajaxOption).done(data => completed(data)).fail(() => { debugger; Logger.error('proxies.ajax', url, ''); });
  }

  export interface ajaxConfig {
    forceServiceUrl: string;
  }

  export enum pathType {
    //root,
    eTestMe, //lmcom/eTestMe.com/Test.aspx
    restServices, //lmcom/rew/service.ashx
    loggerService, //lmcom/rew/service.ashx pro Moodle apod.
    restServicesScorm, //lmcom/rew/scormEx.ashx
    eaScormServer, //lmcom/services/rpc/ea/scormserver.aspx
    eaData, //comcz/
    relPath, //../ je root aplikace
    //schoolCourse, //lmcom/rew/schools/courses/
    cpv, //
    //
    grammar,
    instructions,
    sitemaps,
    sitemapRoot,
    moduleData,
    dictInfo,
    course2rewiseMap, //lekce k LM kurzum, napr. q:\LMCom\rew\Web4\RwBooks\Runtime\cs-cz\crs2RwMap.rjson
    rewiseIndex, //seznam vsech rewises, q:\LMCom\rew\Web4\RwBooks\Runtime\cs-cz\index.rjson
    rewiseLesson, //rewise lesson, zadana cislem lekce, napr. q:\LMCom\rew\Web4\RwBooks\Runtime\cs-cz\02\10114.rjson
    prod, //
    data, //
    //dictData, //q:\LMCom\rew\Web4\RwDicts\
  }

  //base tag musi byt absolutni URL, neboli je k nicemu
  //var bases = document.getElementsByTagName('base');
  //export var basicDir: string;
  //export var basicUrl: string;
  //if (bases && bases.length == 1) {
  //  var parts = bases[0].href.toLowerCase().split('/');
  //  var schoolIdx = _.indexOf(parts, 'schools');
  //  parts = parts.slice(0, schoolIdx >= 0 ? schoolIdx : parts.length - 2); //odrizni Schools
  //  basicDir = parts.join('/');
  //  basicUrl = basicDir + '/';
  //  //basicDir = basicUrl.substr(0, basicUrl.length - 1);
  //} else {
    //k http://www.langmaster.com/rew/Schools/NewEA.aspx... vrati http://www.langmaster.com/rew/
    var parts = location.pathname.toLowerCase().split('/');
    var schoolIdx = _.indexOf(parts, 'schools');

    ////var href = 'http(s)://server/_layouts/SharePointLearningKit/Frameset/Frameset.aspx'.toLowerCase();
    ////var idx = href.indexOf('/sharepointlearningkit/');
    ////href = href.substr(0, idx + 1) + 'SLMS/SLMSLoadLM.ashx';

    parts = parts.slice(0, schoolIdx >= 0 ? schoolIdx : parts.length - 2); //odrizni Schools/NewEA.aspx
    export var basicDir = location.protocol + '//' + location.host + parts.join('/');
    export var basicUrl = basicDir + '/';
  //}

  //export var cfg: ajaxConfig = { forceServiceUrl: null };

  export function path(type: Pager.pathType, url: string = "", loc: LMComLib.Langs = LMComLib.Langs.no) {
    var res = null;
    switch (type) {
      //case pathType.root: res = '../'; break;
      case pathType.relPath: return '../' + url; break;
      case pathType.restServices: return !cfg.forceServiceUrl ? Pager.basicUrl + 'service.ashx' : serviceUrl(); break;
      case pathType.loggerService: return cfg.forceLoggerUrl ? cfg.forceLoggerUrl : path(pathType.restServices); break;
      case pathType.restServicesScorm: return cfg.forceServiceUrl == null ? Pager.basicUrl + 'scormEx.ashx' : serviceUrl(); break;

      /*********** OBSOLETE **************/
      case pathType.eTestMe: res = 'lmcom/eTestMe.com/Test.aspx'; break;
      case pathType.eaScormServer: res = 'lmcom/services/rpc/ea/scormserver.aspx'; break;
      case pathType.eaData:
        res = LMComLib.LangToEADir[loc.toString()] + "/";
        break;
      case pathType.cpv: res = "lmcom/eTestMe.com/site/" + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&'; break;
      default: throw "NotImplemented";
    }
    return basicUrl + res + url;
  }

  function serviceUrl(): string {
    var cfgUrl = cfg.forceServiceUrl;
    switch (cfgUrl) {
      case 'edoceo':
        return location.protocol + '//' + location.host + '/' + location.pathname.split('/')[1] + '/courseresult/langmaster';
      case 'scomp-sharepoint':
        var href = location.href.toLowerCase();
        var idx = href.indexOf('/sharepointlearningkit/');
        href = href.substr(0, idx + 1);
        href += 'SLMS/SLMSLoadLM.ashx'.toLowerCase();
        //Query GUID
        var frame = window; var guid: string = null;
        var lkpar = 'LearnerAssignmentId'.toLowerCase();
        while (frame != null) {
          guid = LowUtils.getQuery(LowUtils.parseQuery(frame.location.search), lkpar, null);
          if (guid != null) break;
          frame = frame == frame.parent ? null : frame.parent;
        }
        if (guid != null) href += '?AttemptIdGuid=' + guid;
        return href;
      case 'scomp-sharepoint-test':
        return "http://localhost/rew/scormexNet35.ashx";
      case 'moodle-pchelp':
        var href = scorm.apiUrl.replace('mod/scorm/player.php', 'filter/langmaster/service.php');
        return href;
      default:
        return cfgUrl;
    }
  }

  export interface locPaths {
    url: string; urlLoc: string;
  }

  export function replaceJSON(fn: string, replace: boolean): string {
    return replace ? fn.replace('.json', '.js').replace('.rjson', '.js').replace('.lst', '.txt') : fn;
  }

  //export function filePath(type: pathType, id: string, loc: string = null): locPaths {
  //  var dir: string; var ext = "json"; var locExt = "json"; //var urlDict = null;
  //  switch (type) {
  //    case pathType.prod:
  //    //case pathType.data:
  //    //  id = "../" + pathType[type] + "/" + id.toLowerCase() + '.json';
  //    //  return { url: id, urlLoc: id.replace('.', '.' + loc + '.') };
  //    //case pathType.sitemaps: dir = "eacourses"; ext = "rjson"; break;
  //    //case pathType.sitemapRoot: dir = "eacourses"; id = "courses"; ext = "rjson"; break; //id se ignoruje
  //    //case pathType.sitemapRoot: dir = "eacourses"; id = "courses"; break; //id se ignoruje
  //    //case pathType.dictInfo: dir = "eacourses"; id = "dicts"; ext = "rjson"; break; //id se ignoruje
  //    //case pathType.grammar: dir = "eagrammar"; break;
  //    //case pathType.instructions: dir = "eadata"; id = "instructions"; break; //id se ignoruje
  //    //case pathType.moduleData: dir = "eadata"; /*urlDict = "lingDict_" + id;*/ break;
  //    //case pathType.course2rewiseMap: dir = "../rwbooks/runtime"; id = "crs2rwmap"; locExt = "rjson"; break; //id se ignoruje, pouze lokalizovana cast
  //    //case pathType.rewiseIndex: dir = "../rwbooks/runtime"; id = "index"; locExt = "rjson"; break; //id se ignoruje, pouze lokalizovana cast
  //    //case pathType.rewiseLesson: dir = "../rwbooks/runtime"; id = Utils.hashDir1(id, 0x3f) + "/" + id; locExt = "rjson"; break; //pouze lokalizovana cast, id je cislo lekce
  //      //case pathType.dictData: dir = "eadata"; locExt = "rjson";
  //      //pro English?E vezmi English? slovnik
  //      //id = id.replace(/(_english\d)e(_)/i, '$1$2');
  //      break;
  //  }
  //  //if (urlDict != null) urlDict = dir + "/" + loc + "/" + urlDict + ".json";
  //  return { url: dir + "/" + id.toLowerCase() + "." + ext, urlLoc: dir + "/" + loc + "/" + id.toLowerCase() + "." + locExt };
  //}

  ////Ajax z Silverlight, volani pres URL mechanismus (napr. pro edoceo v Schools\PersistScormEx.ts)
  //export function doSLAjax(isPost: boolean, url: string, type: string, data: string, callbackObj): void {
  //  doAjax(isPost, url, type, data, (res: string) => callbackObj.completed(res));
  //}

  ////Ajax z Silverlight, volani pres CMD mechanismus (napr. Schools\PersistNewEA.ts)
  //export function doSLAjaxCmd(isPost: boolean, url: string, type: string, data: string, callbackObj): void {
  //  doAjax(isPost, url, type, data, (str: any) => {
  //    if (str == null) { callbackObj.completed(null); return; }
  //    var res: LMComLib.RpcResponse = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
  //    if (res == null) return;
  //    if (res.error != 0)
  //      Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
  //    else
  //      callbackObj.completed(res.result);
  //  });
  //}

  //Ajax pres CMD mechanismus (napr. Schools\PersistNewEA.ts)
  export function doAjaxCmd(isPost: boolean, url: string, type: string, data: string, completed: (res: any) => void, error: (errId: number, errMsg: string) => void = null): void {
    doAjax(isPost, url, type, data,(str: any) => {
      if (str == null) { completed(null); return; }
      var res: LMComLib.RpcResponse = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
      if (res == null) {
        completed(null); return;
      } else if (res.error != 0) {
        Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
        if (error) error(res.error, res.errorText);
      } else
        completed(res.result);
    });
  }

  export function ajax_download(url: string, data: Object, type: string, input_name: string = "par") {
    var $iframe, iframe_doc, iframe_html;

    if (($iframe = $('#download_iframe')).length === 0) {
      $iframe = $("<iframe id='download_iframe'" +
        " style='display: none' src='about:blank'></iframe>"
        ).appendTo("body");
    }

    url += url.indexOf('?') >= 0 ? "&" : '?';
    url += "timestamp=" + new Date().getTime().toString()
    if (type) url += '&type=' + type;
    if (url.charAt(0) == '/') url = '..' + url;

    iframe_doc = $iframe[0].contentWindow || $iframe[0].contentDocument;
    if (iframe_doc.document) {
      iframe_doc = iframe_doc.document;
    }

    iframe_html = "<html><head></head><body><form method='POST' action='" +
    url + "'>" +
    "<input type=hidden name='" + input_name + "' value='" +
    JSON.stringify(data) + "'/></form>" +
    "</body></html>";

    iframe_doc.open();
    iframe_doc.write(iframe_html);
    $(iframe_doc).find('form').submit();
  }

  //Univerzalni AJAX funkce pro POST x GET. crossdomain x bez
  export function doAjax(isPost: boolean, url: string, type: string, data: string, completed: (res: any) => void/*, error: (id: number, msg: string) => void = null*/): void {
    var isCrossDomain = Utils.isCrossDomain(url);
    //var isCrossDomain = true;
    var timestamp = new Date().getTime().toString();
    url += url.indexOf('?') >= 0 ? "&" : '?';
    url += "timestamp=" + timestamp
    if (type) url += '&type=' + type;
    if (url.charAt(0) == '/') url = '..' + url;
    if (isPost && isCrossDomain) {
      Utils.iFrameSubmit(url + '&LoggerLogId=' + Logger.logId() + "&LMComVersion=" + Utils.LMComVersion, data, completed);
    } else {
      if (!isPost && data) url += "&par=" + encodeURIComponent(data);
      Logger.trace('<#' + timestamp + ' doAjax', 'url=' + url + (isPost ? ', data=' + data : ''));
      $.ajax(url, {
        async: true,
        type: isPost ? 'POST' : 'GET',
        dataType: isCrossDomain ? 'jsonp' : 'text',
        data: isPost ? data : '',
        contentType: "text/plain; charset=UTF-8",
        headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion }
      }).
        done(res => { if (completed) completed(res); }).
        fail(() => { debugger; Logger.error('Ajax.doAjax', url, ''); }
        );
    }
  }

  //Obsolete, POST (nema obecne callback - pro crossdomain) 
  export function ajaxPost(pthType: Pager.pathType, type: string, data: Object, completed: (res: any) => void = null, error: (id: number, msg: string) => void = null): void {
    var url = Pager.path(pthType);
    doAjax(true, url, type, JSON.stringify(data), (str: any) => {
      if (!completed) return;
      var res: LMComLib.RpcResponse = typeof str == 'string' ? (_.isEmpty(str) ? {} : JSON.parse(str)) : str;
      //if (res.error && res.error != 0)
      //  if (res.error == 999) Logger.error('ajaxPost', url + ": " + res.errorText + ", " + url, '');
      //  else {
      //    if (error) error(res.error, res.errorText); else Logger.error('ajaxPost', res.errorText, '');
      //  }
      //else if (completed != null) completed(res.result);
      if (res.error && res.error != 0)
        switch (res.error) {
          case 999:
            Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
            break;
          case 998:
            Logger.error('Warning: User logged under other account', url + ": " + res.errorText, '');
            LMStatus.LogoutLow();
            break;
          default:
            if (error) error(res.error, res.errorText); else Logger.error('ajaxGet', res.errorText, '');
            break;
        }
      else if (completed != null) completed(res.result);
    });
  }

  //export function ajaxGetEx<T>(pthType: Pager.pathType, type: string, objData: T, completed: (res: any) => void, error: (id: number, msg: string) => void = null): void {
  //  var url = Pager.path(pthType);
  //  doAjax(false, url, type, JSON.stringify(objData),
  //    (str: any) => {
  //      var res: LMComLib.RpcResponse = typeof str == 'string' ? JSON.parse(str) : str;
  //      if (res.error && res.error != 0)
  //        switch (res.error) {
  //          case 999:
  //            Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
  //            break;
  //          case 998:
  //            break;
  //          default:
  //            if (error) error(res.error, res.errorText); else Logger.error('ajaxGet', res.errorText, '');
  //            break;
  //        }
  //      else if (completed != null) completed(res.result);
  //    });
  //}

  //Obsolete, GET
  export function ajaxGet(pthType: Pager.pathType, type: string, objData: Object, completed: (res: any) => void, error: (id: number, msg: string) => void = null): void {
    var url = Pager.path(pthType);
    doAjax(false, url, type, JSON.stringify(objData),
      (str: any) => {
        var res: LMComLib.RpcResponse = typeof str == 'string' ? JSON.parse(str) : str;
        if (res.error && res.error != 0)
          switch (res.error) {
            case 999:
              Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
              break;
            case 998:
              Logger.error('Warning: User logged under other account', url + ": " + res.errorText, '');
              LMStatus.LogoutLow();
              break;
            default:
              if (error) error(res.error, res.errorText); else Logger.error('ajaxGet', res.errorText, '');
              break;
          }
        else if (completed != null) completed(res.result);

      });
  }

}

//https://gist.github.com/SaneMethod/7548768
//http://www.artandlogic.com/blog/2013/06/ajax-caching-transports-compatible-with-jquery-deferred/
/**
 * Register ajax transports for blob send/recieve and array buffer send/receive via XMLHttpRequest Level 2
 * within the comfortable framework of the jquery ajax request, with full support for promises.
 *
 * Notice the +* in the dataType string? The + indicates we want this transport to be prepended to the list
 * of potential transports (so it gets first dibs if the request passes the conditions within to provide the
 * ajax transport, preventing the standard transport from hogging the request), and the * indicates that
 * potentially any request with any dataType might want to use the transports provided herein.
 *
 * Remember to specify 'processData:false' in the ajax options when attempting to send a blob or arraybuffer -
 * otherwise jquery will try (and fail) to convert the blob or buffer into a query string.
 */
interface JQueryStatic { ajaxTransport; } interface Window { FormData; Blob; ArrayBuffer; }

$.ajaxTransport("+*", function (options, originalOptions, jqXHR) {
  // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
  // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
  // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
  if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer'))
    || (options.data && ((window.Blob && options.data instanceof Blob)
    || (window.ArrayBuffer && options.data instanceof ArrayBuffer)))
    )) {
    return {
      /**
       * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
       * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
       * into the jquery complete callback (such as the success function, done blocks, etc.)
       *
       * @param headers
       * @param completeCallback
       */
      send: function (headers, completeCallback) {
        var xhr = new XMLHttpRequest(),
          url = options.url || window.location.href,
          type = options.type || 'GET',
          dataType = options.dataType || 'text',
          data = options.data || null,
          async = options.async || true;

        xhr.addEventListener('load', function () {
          var res = {};

          res[dataType] = xhr.response;
          completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders());
        });

        xhr.open(type, url, async);
        xhr.responseType = dataType;
        xhr.send(data);
      },
      abort: function () {
        jqXHR.abort();
      }
    };
  }
});
