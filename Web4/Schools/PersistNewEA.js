var persistNewEA;
(function (persistNewEA) {
    function createCmd(lmcomId, companyId, productId, finish) {
        if (finish === void 0) { finish = null; }
        var res = LMStatus.createCmd(function (r) { r.companyId = companyId; r.productId = productId; r.scormId = null; r.date = Utils.nowToInt(); });
        if (finish)
            finish(res);
        if (lmcomId)
            res.lmcomId = lmcomId;
        return res;
    }
    persistNewEA.createCmd = createCmd;
    persistNewEA.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_readCrsResults_Type, createCmd(userId, companyId, prodUrl), 
            //scorm.Cmd_readCrsResults_Create(companyId, prodUrl, null, userId, 0),
            function (res) {
                Logger.trace_persistNewEA("loadShortUserData: " + res.join(" ### "));
                var obj = {};
                _.each(res, function (kv) { return obj[kv[0]] = JSON.parse(kv[1]); });
                completed(obj);
            });
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_readModuleResults_Type, createCmd(userId, companyId, prodUrl, function (r) { r.key = modUrl; }), 
            //scorm.Cmd_readModuleResults_Create(modUrl, userId, companyId, prodUrl, null),
            function (res) {
                Logger.trace_persistNewEA("loadUserData resp: " + modUrl + ": " + res);
                completed(_.isEmpty(res) ? {} : JSON.parse(res));
            });
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            Pager.ajaxPost(Pager.pathType.restServices, scorm.Cmd_saveUserData_Type, createCmd(userId, companyId, prodUrl, function (r) { r.data = data; }), 
            //scorm.Cmd_saveUserData_Create(data, userId, companyId, prodUrl, null),
            function () {
                Logger.trace_persistNewEA("saveUserData");
                completed();
            });
        },
        readFiles: function (urls, completed) {
            if (!urls || urls.length == 0)
                completed([]);
            var data = [];
            var len = urls.length;
            var ajaxDone; //funkce, vracejici funkci
            ajaxDone = function (idx, fail) { return function (res) {
                data[idx] = fail ? null : (res == null ? "" : res);
                len--;
                if (len == 0)
                    completed(data);
            }; };
            for (var i = 0; i < urls.length; i++)
                $.ajax({ url: urls[i].charAt(0) == '/' ? '..' + urls[i] : urls[i], dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion } }).
                    done(ajaxDone(i, false)).fail(ajaxDone(i, true)); //i a false je znamo v dobe inicializace Ajax, nikoliv az v dobe navratu z ajax
        },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            Pager.ajaxPost(Pager.pathType.restServices, scorm.Cmd_resetModules_Type, createCmd(userId, companyId, prodUrl, function (r) { r.modIds = urls; }), 
            //scorm.Cmd_resetModules_Create(urls, userId, companyId, prodUrl, null),
            function (res) {
                Logger.trace_persistNewEA("resetExs: " + res);
                completed();
            });
        },
        createArchive: function (userId, companyId, prodUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_createArchive_Type, createCmd(userId, companyId, prodUrl), 
            //scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null),
            function (res) { return completed(res); });
        },
        testResults: function (userId, companyId, prodUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_testResults_Type, createCmd(userId, companyId, prodUrl), 
            //scorm.Cmd_testResults_Create(LMStatus.Cookie.id, companyId, productId, null),
            function (res) { return completed(_.map(res, function (r) { return JSON.parse(r); })); });
        }
    };
})(persistNewEA || (persistNewEA = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistNewEA(msg) {
        Logger.trace("persistNewEA", msg);
    }
    Logger.trace_persistNewEA = trace_persistNewEA;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var scorm_dict = null;
