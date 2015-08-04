var persistScormEx;
(function (persistScormEx) {
    persistScormEx.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
            var reqUrl = url(Utils.string_format("type=get_key1str_data2&userid={0}&{1}&key1int={2}", [LMStatus.scormUserId(), scorm.attemptId, tab_modules]));
            Logger.trace_persistScorm("persistScormEx.loadShortUserDatas start: " + reqUrl);
            Pager.doAjax(false, reqUrl, null, null, function (res) {
                var arrRes = {};
                if (res && res.length > 0) {
                    var parts = res.split(delim);
                    var i = 0;
                    while (i < parts.length - 1) {
                        var unp = Utils.unpackStr(parts[i + 1]);
                        Logger.trace_persistScorm("readCrsResults " + parts[i] + ': ' + unp);
                        arrRes[parts[i]] = JSON.parse(unp);
                        i += 2;
                    }
                }
                Logger.trace_persistScorm("persistScormEx.loadShortUserDatas end");
                completed(arrRes);
            });
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
            Logger.trace_persistScorm("persistScormEx.loadUserData start");
            getDataLow("get_data1", modUrl, true, null, false, tab_modules, true, 0, false, function (res) {
                if (res && res.indexOf(delim) >= 0)
                    res = res.split(delim)[0];
                var unp = Utils.unpackStr(res);
                Logger.trace_persistScorm("persistScormEx.loadUserData end: " + unp);
                completed(JSON.parse(unp));
            });
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            Logger.trace_persistScorm("persistScormEx.saveUserData start");
            _.each(data, function (dt) { return Logger.trace_persistScorm(dt[0] + "=" + dt[1] + "; " + dt[2]); });
            var exs = _.map(data, function (dt) {
                var id = dt[0];
                var dfd = $.Deferred();
                setDataLow(dt[0], null, tab_modules, 0, encodeData(dt[2], dt[1]), dfd.resolve);
                return dfd.promise();
            });
            $.when(exs).then(function () { Logger.trace_persistScorm("persistScormEx.saveUserData end"); completed(); }).fail(function () { debugger; throw 'persistScormEx.saveUserData'; });
        },
        readFiles: persistNewEA.persistCourse.readFiles,
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            var data = urls.join(delim);
            var reqUrl = url(Utils.string_format("type=del_all_key1str&userid={0}&{1}&key1int={2}", [LMStatus.scormUserId(), scorm.attemptId, tab_modules]));
            Logger.trace_persistScorm("resetModules: " + reqUrl + ", data=" + data);
            Pager.doAjax(true, reqUrl, null, data, function (res) { return completed(); });
        },
        createArchive: function (userId, companyId, productId, completed) {
        },
        testResults: function (userId, companyId, productId, completed) {
        }
    };
    var delim = ";";
    var tab_modules = 1;
    var tab_metadata = 2;
    function encodeData(data1, data2) { return (data1 ? Utils.packStr(data1) : '') + delim + (data2 ? Utils.packStr(data2) : ''); }
    function setDataLow(key1str, key2str, key1int, key2int, data, completed) {
        var reqUrl = url(Utils.string_format("type=set_data&userid={0}&{1}&key1str={2}&key2str={3}&key1int={4}&key2int={5}&date={6}", [LMStatus.scormUserId(), scorm.attemptId, key1str, key2str, key1int, key2int, Utils.nowToInt()]));
        //Debug.trace_persistScorm("setData: " + reqUrl + ", data=" + data);
        Pager.doAjax(true, reqUrl, null, data, function (res) { return completed(); });
    }
    function getDataLow(getDataType, key1str, isKey1str, key2str, isKey2str, key1int, iskey1int, key2int, iskey2int, completed) {
        var query = Utils.string_format("type={0}&userid={1}&{2}", [getDataType, LMStatus.scormUserId(), scorm.attemptId]);
        if (isKey1str)
            query += "&key1str=" + (key1str ? key1str : '');
        if (isKey2str)
            query += "&key2str=" + (key2str ? key2str : '');
        if (iskey1int)
            query += "&key1int=" + key1int.toString();
        if (iskey2int)
            query += "&key2int=" + key2int.toString();
        var reqUrl = url(query);
        //Debug.trace_persistScorm("getData: " + reqUrl);
        Pager.doAjax(false, reqUrl, null, null, function (res) {
            //Debug.trace_persistScorm("getData result: " + res);
            completed(res);
        });
    }
    function url(query) {
        var res = Pager.path(Pager.pathType.restServicesScorm);
        res += res.indexOf('?') >= 0 ? '&' : '?';
        return res + query;
    }
})(persistScormEx || (persistScormEx = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistScorm(msg) {
        Logger.trace("persistScorm", msg);
    }
    Logger.trace_persistScorm = trace_persistScorm;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var persistScorm = null;
