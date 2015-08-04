var persistDownload;
(function (persistDownload) {
    var delphiApi;
    var debugVersion = true;
    var debugDelphiApi = (function () {
        function debugDelphiApi() {
        }
        debugDelphiApi.prototype.init = function (appDir, userDir) {
            oldApi.init(appDir, userDir);
        };
        debugDelphiApi.prototype.readAppFile = function (url) {
            Logger.trace_persistDownload("readAppFile: " + url);
            var res = oldApi.readAppFile(url);
            Logger.trace_persistDownload("readAppFile: OK");
            return res;
        };
        debugDelphiApi.prototype.readFile = function (crsId, url) {
            Logger.trace_persistDownload("readFile: " + url);
            var res = oldApi.readFile(crsId, url);
            Logger.trace_persistDownload("readFile: OK");
            return res;
        };
        debugDelphiApi.prototype.writeFile = function (crsId, url, data) {
            Logger.trace_persistDownload("writeFile: " + url);
            oldApi.writeFile(crsId, url, data);
            Logger.trace_persistDownload("writeFile: OK");
        };
        debugDelphiApi.prototype.deleteFile = function (crsId, url) {
            Logger.trace_persistDownload("deleteFile: " + url);
            oldApi.deleteFile(crsId, url);
            Logger.trace_persistDownload("deleteFile: OK");
        };
        debugDelphiApi.prototype.log = function (msg) {
            throw "not implemented";
        };
        return debugDelphiApi;
    })();
    //export function Init(isSl:boolean, completed: () => void ): void {
    //  delphiApi = (isSl ? slApi : window.external);
    //  if (!isSl) Logger.delphiLog = <any>(window.external);
    //  if (isSl) slApi.init("q:\\temp\\LANGMaster.com\\english_0_1\\cs_cz\\data\\schools\\", "q:\\temp\\DebugDownload\\");
    //  if (!delphiApi || typeof delphiApi.readAppFile == 'undefined') { alert("missing window.external.readAppFile"); return; }
    //  schools.readAppDataAndLoc = readAppDataAndLoc;
    //  schools.readAppData = readAppData;
    //  persistLocal.readFile = readFile;
    //  persistLocal.writeFile = writeFile;
    //  persistLocal.deleteFile = deleteFile;
    //  if (debugVersion) {
    //    oldApi = delphiApi;
    //    delphiApi = new debugDelphiApi();
    //  }
    //  completed();
    //}
    var oldApi;
    function readAppDataAndLoc(urls, completed) {
        completed(delphiApi.readAppFile(urls.url), delphiApi.readAppFile(urls.urlLoc)); //, urls.urlDict == null ? null : delphiApi.readAppFile(urls.urlDict)
    }
    function readAppData(url, completed) {
        completed(delphiApi.readAppFile(url));
    }
    function readFile(crsId, url, completed) {
        var res = delphiApi.readFile(crsId, url);
        completed(res == "" ? null : res);
    }
    function writeFile(crsId, url, data, completed) {
        delphiApi.writeFile(crsId, url, data);
        completed();
    }
    function deleteFile(crsId, url, completed) {
        delphiApi.deleteFile(crsId, url);
        completed();
    }
})(persistDownload || (persistDownload = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistDownload(msg) {
        Logger.trace("persistDownload", msg);
    }
    Logger.trace_persistDownload = trace_persistDownload;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var fake_download = null;
