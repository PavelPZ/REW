var Pager;
(function (Pager) {
    (function (pathType) {
        //root,
        pathType[pathType["eTestMe"] = 0] = "eTestMe";
        pathType[pathType["restServices"] = 1] = "restServices";
        pathType[pathType["loggerService"] = 2] = "loggerService";
        pathType[pathType["restServicesScorm"] = 3] = "restServicesScorm";
        pathType[pathType["eaScormServer"] = 4] = "eaScormServer";
        pathType[pathType["eaData"] = 5] = "eaData";
        pathType[pathType["relPath"] = 6] = "relPath";
        //schoolCourse, //lmcom/rew/schools/courses/
        pathType[pathType["cpv"] = 7] = "cpv";
        //
        pathType[pathType["grammar"] = 8] = "grammar";
        pathType[pathType["instructions"] = 9] = "instructions";
        pathType[pathType["sitemaps"] = 10] = "sitemaps";
        pathType[pathType["sitemapRoot"] = 11] = "sitemapRoot";
        pathType[pathType["moduleData"] = 12] = "moduleData";
        pathType[pathType["dictInfo"] = 13] = "dictInfo";
        pathType[pathType["course2rewiseMap"] = 14] = "course2rewiseMap";
        pathType[pathType["rewiseIndex"] = 15] = "rewiseIndex";
        pathType[pathType["rewiseLesson"] = 16] = "rewiseLesson";
        pathType[pathType["prod"] = 17] = "prod";
        pathType[pathType["data"] = 18] = "data";
    })(Pager.pathType || (Pager.pathType = {}));
    var pathType = Pager.pathType;
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
    Pager.basicDir = location.protocol + '//' + location.host + parts.join('/');
    Pager.basicUrl = Pager.basicDir + '/';
    //}
    //export var cfg: ajaxConfig = { forceServiceUrl: null };
    function path(type, url, loc) {
        if (url === void 0) { url = ""; }
        if (loc === void 0) { loc = LMComLib.Langs.no; }
        var res = null;
        switch (type) {
            //case pathType.root: res = '../'; break;
            case pathType.relPath:
                return '../' + url;
                break;
            case pathType.restServices:
                return !cfg.forceServiceUrl ? Pager.basicUrl + 'service.ashx' : serviceUrl();
                break;
            case pathType.loggerService:
                return cfg.forceLoggerUrl ? cfg.forceLoggerUrl : path(pathType.restServices);
                break;
            case pathType.restServicesScorm:
                return cfg.forceServiceUrl == null ? Pager.basicUrl + 'scormEx.ashx' : serviceUrl();
                break;
            /*********** OBSOLETE **************/
            case pathType.eTestMe:
                res = 'lmcom/eTestMe.com/Test.aspx';
                break;
            case pathType.eaScormServer:
                res = 'lmcom/services/rpc/ea/scormserver.aspx';
                break;
            case pathType.eaData:
                res = LMComLib.LangToEADir[loc.toString()] + "/";
                break;
            case pathType.cpv:
                res = "lmcom/eTestMe.com/site/" + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&';
                break;
            default: throw "NotImplemented";
        }
        return Pager.basicUrl + res + url;
    }
    Pager.path = path;
    function serviceUrl() {
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
                var frame = window;
                var guid = null;
                var lkpar = 'LearnerAssignmentId'.toLowerCase();
                while (frame != null) {
                    guid = LowUtils.getQuery(LowUtils.parseQuery(frame.location.search), lkpar, null);
                    if (guid != null)
                        break;
                    frame = frame == frame.parent ? null : frame.parent;
                }
                if (guid != null)
                    href += '?AttemptIdGuid=' + guid;
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
    function replaceJSON(fn, replace) {
        return replace ? fn.replace('.json', '.js').replace('.rjson', '.js').replace('.lst', '.txt') : fn;
    }
    Pager.replaceJSON = replaceJSON;
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
    function doAjaxCmd(isPost, url, type, data, completed, error) {
        if (error === void 0) { error = null; }
        doAjax(isPost, url, type, data, function (str) {
            if (str == null) {
                completed(null);
                return;
            }
            var res = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
            if (res == null) {
                completed(null);
                return;
            }
            else if (res.error != 0) {
                Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
                if (error)
                    error(res.error, res.errorText);
            }
            else
                completed(res.result);
        });
    }
    Pager.doAjaxCmd = doAjaxCmd;
    function ajax_download(url, data, type, input_name) {
        if (input_name === void 0) { input_name = "par"; }
        var $iframe, iframe_doc, iframe_html;
        if (($iframe = $('#download_iframe')).length === 0) {
            $iframe = $("<iframe id='download_iframe'" +
                " style='display: none' src='about:blank'></iframe>").appendTo("body");
        }
        url += url.indexOf('?') >= 0 ? "&" : '?';
        url += "timestamp=" + new Date().getTime().toString();
        if (type)
            url += '&type=' + type;
        if (url.charAt(0) == '/')
            url = '..' + url;
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
    Pager.ajax_download = ajax_download;
    //Univerzalni AJAX funkce pro POST x GET. crossdomain x bez
    function doAjax(isPost, url, type, data, completed /*, error: (id: number, msg: string) => void = null*/) {
        var isCrossDomain = Utils.isCrossDomain(url);
        //var isCrossDomain = true;
        var timestamp = new Date().getTime().toString();
        url += url.indexOf('?') >= 0 ? "&" : '?';
        url += "timestamp=" + timestamp;
        if (type)
            url += '&type=' + type;
        if (url.charAt(0) == '/')
            url = '..' + url;
        if (isPost && isCrossDomain) {
            Utils.iFrameSubmit(url + '&LoggerLogId=' + Logger.logId() + "&LMComVersion=" + Utils.LMComVersion, data, completed);
        }
        else {
            if (!isPost && data)
                url += "&par=" + encodeURIComponent(data);
            Logger.trace('<#' + timestamp + ' doAjax', 'url=' + url + (isPost ? ', data=' + data : ''));
            $.ajax(url, {
                async: true,
                type: isPost ? 'POST' : 'GET',
                dataType: isCrossDomain ? 'jsonp' : 'text',
                data: isPost ? data : '',
                contentType: "text/plain; charset=UTF-8",
                headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion }
            }).
                done(function (res) { if (completed)
                completed(res); }).
                fail(function () { debugger; Logger.error('Ajax.doAjax', url, ''); });
        }
    }
    Pager.doAjax = doAjax;
    //Obsolete, POST (nema obecne callback - pro crossdomain) 
    function ajaxPost(pthType, type, data, completed, error) {
        if (completed === void 0) { completed = null; }
        if (error === void 0) { error = null; }
        var url = Pager.path(pthType);
        doAjax(true, url, type, JSON.stringify(data), function (str) {
            if (!completed)
                return;
            var res = typeof str == 'string' ? (_.isEmpty(str) ? {} : JSON.parse(str)) : str;
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
                        if (error)
                            error(res.error, res.errorText);
                        else
                            Logger.error('ajaxGet', res.errorText, '');
                        break;
                }
            else if (completed != null)
                completed(res.result);
        });
    }
    Pager.ajaxPost = ajaxPost;
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
    function ajaxGet(pthType, type, objData, completed, error) {
        if (error === void 0) { error = null; }
        var url = Pager.path(pthType);
        doAjax(false, url, type, JSON.stringify(objData), function (str) {
            var res = typeof str == 'string' ? JSON.parse(str) : str;
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
                        if (error)
                            error(res.error, res.errorText);
                        else
                            Logger.error('ajaxGet', res.errorText, '');
                        break;
                }
            else if (completed != null)
                completed(res.result);
        });
    }
    Pager.ajaxGet = ajaxGet;
})(Pager || (Pager = {}));
$.ajaxTransport("+*", function (options, originalOptions, jqXHR) {
    // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
    // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
    // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
    if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer'))
        || (options.data && ((window.Blob && options.data instanceof Blob)
            || (window.ArrayBuffer && options.data instanceof ArrayBuffer))))) {
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
                var xhr = new XMLHttpRequest(), url = options.url || window.location.href, type = options.type || 'GET', dataType = options.dataType || 'text', data = options.data || null, async = options.async || true;
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
