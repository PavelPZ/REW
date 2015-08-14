var persistMemory;
(function (persistMemory) {
    persistMemory.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
            var prodDb = memDb[prodUrl];
            if (!prodDb) {
                completed(null);
                return;
            }
            var data = {};
            for (var p in prodDb)
                data[p] = JSON.parse(prodDb[p].shortdata);
            completed(data);
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
            var prodDb = memDb[prodUrl];
            if (!prodDb) {
                completed(null);
                return;
            }
            var m = prodDb[modUrl];
            completed(m && m.data ? JSON.parse(m.data) : null);
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            var prodDb = memDb[prodUrl];
            if (!prodDb) {
                prodDb = {};
                memDb[prodUrl] = prodDb;
            }
            _.each(data, function (dt) { return prodDb[dt[0]] = { id: dt[0], data: dt[2], shortdata: dt[1] }; });
            completed();
        },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            delete memDb[prodUrl];
            completed();
        },
        readFiles: persistNewEA.persistCourse.readFiles,
        createArchive: function (userId, companyId, productId, completed) {
            completed(archiveId++);
            //var id = archiveId++;
            //var oldProd = memDb[productId]; delete memDb[productId];
            //productId = productId + '|' + id.toString();
            //memDb[productId] = oldProd;
            //completed(id);
        },
        testResults: function (userId, companyId, productId, completed) {
            persistMemory.persistCourse.loadUserData(userId, companyId, productId, 'result', completed);
            //var results: Array<testMe.result> = [];
            //for (var p in memDb) {
            //  var key: string = p;
            //  if (productId.indexOf(key) != 0) continue;
            //  persistCourse.loadUserData(userId, companyId, key, 'result', res => { if (!res) return; results.push(res); });  
            //  completed(results);
            //}
        }
    };
    var archiveId = 0;
    function reset() { memDb = {}; }
    persistMemory.reset = reset;
    var memDb = {};
})(persistMemory || (persistMemory = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistScormLocal(msg) {
        Logger.trace("persistScormLocal", msg);
    }
    Logger.trace_persistScormLocal = trace_persistScormLocal;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var persistScormL = null;
