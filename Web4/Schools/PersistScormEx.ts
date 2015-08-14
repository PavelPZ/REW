module persistScormEx {
  export var persistCourse: CourseMeta.IPersistence = {
    loadShortUserData: (userId, companyId, prodUrl, completed) => {
      var reqUrl = url(Utils.string_format("type=get_key1str_data2&userid={0}&{1}&key1int={2}", [LMStatus.scormUserId(), scorm.attemptId, tab_modules]));
      Logger.trace_persistScorm("persistScormEx.loadShortUserDatas start: " + reqUrl);
      Pager.doAjax(false, reqUrl, null, null, (res: string) => {
        var arrRes: { [url: string]: Object; } = {};
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
    loadUserData: (userId, companyId, prodUrl, modUrl, completed) => {
      Logger.trace_persistScorm("persistScormEx.loadUserData start");
      getDataLow("get_data1", modUrl, true, null, false, tab_modules, true, 0, false, (res: string) => {
        if (res && res.indexOf(delim) >= 0) res = res.split(delim)[0];
        var unp = Utils.unpackStr(res);
        Logger.trace_persistScorm("persistScormEx.loadUserData end: " + unp);
        completed(JSON.parse(unp));
      });
    },
    saveUserData: (userId, companyId, prodUrl, data, completed) => {
      Logger.trace_persistScorm("persistScormEx.saveUserData start");
      _.each(data, dt => Logger.trace_persistScorm(dt[0] + "=" + dt[1] + "; " + dt[2]));
      var exs = _.map(data, (dt) => {
        var id = dt[0]; 
        var dfd: JQueryDeferred<string> = $.Deferred();
        setDataLow(dt[0], null, tab_modules, 0, encodeData(dt[2], dt[1]), dfd.resolve);
        return dfd.promise();
      });
      $.when(exs).then(() => { Logger.trace_persistScorm("persistScormEx.saveUserData end"); completed(); }).fail(() => { debugger; throw 'persistScormEx.saveUserData'; });
    },
    readFiles: persistNewEA.persistCourse.readFiles,
    resetExs: (userId: number, companyId: number, prodUrl: string, urls: Array<string>, completed: () => void) => {
      var data = urls.join(delim);
      var reqUrl = url(Utils.string_format("type=del_all_key1str&userid={0}&{1}&key1int={2}", [LMStatus.scormUserId(), scorm.attemptId, tab_modules]));
      Logger.trace_persistScorm("resetModules: " + reqUrl + ", data=" + data);
      Pager.doAjax(true, reqUrl, null, data, res => completed());
    },
    createArchive: (userId, companyId, productId, completed) => {
    },
    testResults: (userId, companyId, productId, completed) => {
    }
  };

  var delim = ";";
  var tab_modules = 1;
  var tab_metadata = 2;

  function encodeData(data1: string, data2: string): string { return (data1 ? Utils.packStr(data1) : '') + delim + (data2 ? Utils.packStr(data2) : '') }

  function setDataLow(key1str: string, key2str: string, key1int: number, key2int: number, data: string, completed: () => void) {
    var reqUrl = url(Utils.string_format("type=set_data&userid={0}&{1}&key1str={2}&key2str={3}&key1int={4}&key2int={5}&date={6}",
      [LMStatus.scormUserId(), scorm.attemptId, key1str, key2str, key1int, key2int, Utils.nowToInt()]));
    //Debug.trace_persistScorm("setData: " + reqUrl + ", data=" + data);
    Pager.doAjax(true, reqUrl, null, data, res => completed());
  }

  function getDataLow(getDataType: string, key1str: string, isKey1str: boolean, key2str: string, isKey2str: boolean, key1int: number, iskey1int: boolean, key2int: number, iskey2int: boolean, completed: (res: any) => void) {
    var query = Utils.string_format("type={0}&userid={1}&{2}", [getDataType, LMStatus.scormUserId(), scorm.attemptId])
    if (isKey1str) query += "&key1str=" + (key1str ? key1str : '');
    if (isKey2str) query += "&key2str=" + (key2str ? key2str : '');
    if (iskey1int) query += "&key1int=" + key1int.toString();
    if (iskey2int) query += "&key2int=" + key2int.toString();
    var reqUrl = url(query);
    //Debug.trace_persistScorm("getData: " + reqUrl);
    Pager.doAjax(false, reqUrl, null, null, (res: string) => {
      //Debug.trace_persistScorm("getData result: " + res);
      completed(res);
    });
  }

  function url(query: string): string {
    var res = Pager.path(Pager.pathType.restServicesScorm);
    res += res.indexOf('?') >= 0 ? '&' : '?';
    return res + query;
  }

  //function attemptId(): string { return 'attemptid=' + CourseMeta.actProduct.url + '|' + scorm.attemptId; }

    //var tab_test = 3;
  //var tab_testmod = 4;

  //function resetModules(lmcomUserId: number, companyId: number, productId: string, modJsonIds: string[], completed: () => void) {
  //  schools.resetModulesLocal(modJsonIds);

  //  var data = modJsonIds.join(delim);
  //  var reqUrl = url(Utils.string_format("type=del_all_key1str&userid={0}&attemptid={1}&key1int={2}", [LMStatus.scormUserId(), attemptId(), tab_modules]));
  //  Logger.trace_persistScorm("resetModules: " + reqUrl + ", data=" + data);
  //  Pager.doAjax(true, reqUrl, null, data, res => completed());
  //}

  //function getData(tableId: number, key: string, completed: (res: any) => void) {
  //  getDataLow("get_data1", key, true, null, false, tableId, true, 0, false, (res: string) => {
  //    if (res && res.indexOf(delim) >= 0) res = res.split(delim)[0];
  //    var unp = Utils.unpackStr(res);
  //    Logger.trace_persistScorm("getData: " + unp);
  //    completed(JSON.parse(unp));
  //  });
  //}

  //function setData(tableId: number, key: string, data1: string, data2: string, completed: () => void) {
  //  Logger.trace_persistScorm("setData: " + data1 + ' ||| ' + data2);
  //  setDataLow(key, null, tableId, 0, encodeData(data1, data2), completed);
  //}

  
  //function readCrsResults(lmcomUserId: number, companyId: number, productId: string, completed: (res: schools.ModUser[]) => void) {
  //  var reqUrl = url(Utils.string_format("type=get_key1str_data2&userid={0}&attemptid={1}&key1int={2}", [LMStatus.scormUserId(), attemptId(), tab_modules]));
  //  Logger.trace_persistScorm("readCrsResults: " + reqUrl);
  //  Pager.doAjax(false, reqUrl, null, null, (res: string) => {
  //    var arrRes = [];
  //    if (res && res.length > 0) {
  //      var parts = res.split(delim);
  //      var i = 0;
  //      while (i < parts.length - 1) {
  //        var unp = Utils.unpackStr(parts[i + 1]);
  //        Logger.trace_persistScorm("readCrsResults " + parts[i] + ': ' + unp);
  //        arrRes[parts[i]] = JSON.parse(unp);
  //        i += 2;
  //      }
  //    }
  //    completed(arrRes);
  //  });
  //}

  //function readModuleResults(lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, completed: (res: schools.ModUser) => void) {
  //  Logger.trace_persistScorm("readModuleResults");
  //  getData(tab_modules, moduleJsonId, completed);
  //}

  //function writeModuleResults(lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, data: schools.ModUser, dataShort: schools.ModUser, completed: () => void) {
  //  Logger.trace_persistScorm("writeModuleResults " + moduleJsonId + ": " + JSON.stringify(dataShort));
  //  setData(tab_modules, moduleJsonId, JSON.stringify(data), JSON.stringify(dataShort), completed);
  //}

  //function setMetaCourse(lmcomUserId: number, companyId: number, productId: string, value: schools.metaCourse, completed: () => void) {
  //  Logger.trace_persistScorm("setMetaCourse");
  //  setData(tab_metadata, "@meta", JSON.stringify(value), null, completed);
  //}

  //function getMetaCourse(lmcomUserId: number, companyId: number, productId: string, completed: (res: schools.metaCourse) => void) {
  //  Logger.trace_persistScorm("readModuleResults");
  //  getData(tab_metadata, "@meta", completed);
  //}

  

  ////v data2 je ulozeno proxy v JSON formatu typu schools.SchoolCmdTestInfoItem
  //function readTestResults(isStart: boolean, testIds: number[], completed: (testResults: schools.SchoolCmdTestInfoItem[]) => void) {
  //  var ids = _.map(testIds, ti => ti.toString()).join(delim);
  //  var query = Utils.string_format("type=get_key2ints_data2&userid={0}&attemptid={1}&key1str=&key2str=&key1int={2}&key2ints={3}", [LMStatus.scormUserId(), attemptId(), tab_test, ids])
  //  var reqUrl = url(query);
  //  Logger.trace_persistScorm("readTestResults: " + reqUrl);
  //  Pager.doAjax(false, reqUrl, null, null, (res: string) => {
  //    Logger.trace_persistScorm("readTestResults result: " + res);
  //    var infos = _.map(_.filter(res.split(delim), (s: string) => s.length > 0), (s: string) => JSON.parse(Utils.unpackStr(s)));
  //    completed(infos);
  //  });
  //}

  //export function slSaveTest(testId: number, data: string, callback) {
  //  setDataLow(null, null, tab_test, testId, data, () => callback.completed(null));
  //}

  //export function slSaveTestModule(testId: number, moduleId: number, data: string, callback) {
  //  setDataLow(testId.toString(), null, tab_testmod, moduleId, data, () => callback.completed(null));
  //}

  //export function slLoadTestModule(moduleId: number, callback) {
  //  getDataLow("get_data1", null, false, null, true, tab_testmod, true, moduleId, true, str => callback.completed(str));
  //}

  //export function slLoadTestInfo(testId: number, callback) {
  //  getDataLow("get_data1", null, true, null, true, tab_test, true, testId, true, str =>
  //    getDataLow("get_data2", testId.toString(), true, null, true, tab_testmod, true, 0, false, modStrs => callback.completed(str + delim + modStrs))
  //    );
  //}

  //export function slTestCreated(metataskId: number, testId: number, callback) {
  //  var actTask: schools.metaTask = _.find(schools.data.metaCourse.tasks, (t: schools.metaTask) => t.jsonId == metataskId.toString());
  //  actTask.test.userTestId = testId;
  //  setMetaCourse(0, 0, 0, schools.data.metaCourse, () => callback.completed(null));
  //}

}

//xx/#DEBUG
module Logger {
  export function trace_persistScorm(msg: string): void {
    Logger.trace("persistScorm", msg);
  }
}
//xx/#ENDDEBUG
//var persistScorm = null;
