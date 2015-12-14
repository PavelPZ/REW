var persistLocal;
(function (persistLocal) {
    persistLocal.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
        },
        readFiles: function (urls, completed) { return void {}; },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
        },
        createArchive: function (userId, companyId, productId, completed) {
        },
        testResults: function (userId, companyId, productId, completed) {
        }
    };
    var modCache = [];
    var fCrsResults = "crs_result.txt";
    var fMetaCourse = "meta_course.txt";
    function fModule(modId) { return "mod_" + modId + ".txt"; }
    function resetModules(lmcomUserId, companyId, crsId, modJsonIds, completed) {
        schools.resetModulesLocal(modJsonIds);
        var defs = _.map(modJsonIds, function (mi) {
            var modId = mi;
            var cId = crsId;
            var dfd = $.Deferred();
            persistLocal.deleteFile(cId, fModule(modId), dfd.resolve);
            return dfd.promise();
        });
        $.when(defs).then(function () {
            _.each(modJsonIds, function (modId) { return delete modCache[modId]; });
            writeCrsResults(crsId, completed);
        }, function () { return alert("fail"); });
    }
    function readCrsResults(isStart, lmcomUserId, companyId, crsId, completed) {
        persistLocal.readFile(crsId, fCrsResults, function (res) { return completed(modCache = (res == null ? [] : JSON.parse(res))); });
    }
    function readModuleResult(lmcomUserId, companyId, crsId, moduleJsonId, completed) {
        persistLocal.readFile(crsId, fModule(moduleJsonId), function (str) { return completed(str == null ? null : JSON.parse(str)); });
    }
    function writeModuleResult(lmcomUserId, companyId, crsId, moduleJsonId, data, dataShort, completed) {
        persistLocal.writeFile(crsId, fModule(moduleJsonId), JSON.stringify(data), function () {
            modCache[moduleJsonId] = dataShort;
            writeCrsResults(crsId, completed);
        });
    }
    //function setMetaCourse(lmcomUserId: number, companyId: number, crsId: string, value: schools.metaCourse, completed: () => void) {
    //  writeFile(crsId, fMetaCourse, JSON.stringify(value), completed);
    //}
    //function getMetaCourse(lmcomUserId: number, companyId: number, crsId: string, completed: (res: schools.metaCourse) => void) {
    //  readFile(crsId, fMetaCourse, res => completed(res == null ? null : JSON.parse(res)));
    //}
    function writeCrsResults(crsId, completed) {
        persistLocal.writeFile(crsId, fCrsResults, JSON.stringify(modCache), completed);
    }
})(persistLocal || (persistLocal = {}));
