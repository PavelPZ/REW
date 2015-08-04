module persistNewEA {

  export function createCmd<T extends scorm.ScormCmd>(lmcomId: number, companyId: number, productId: string, finish: (par: T) => void = null): T {
    var res = LMStatus.createCmd<T>(r => { r.companyId = companyId; r.productId = productId; r.scormId = null; r.date = Utils.nowToInt(); });
    if (finish) finish(res);
    if (lmcomId) res.lmcomId = lmcomId;
    return res;
  }

  export var persistCourse: CourseMeta.IPersistence = {
    loadShortUserData: (userId, companyId, prodUrl, completed) => {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        scorm.Cmd_readCrsResults_Type,
        createCmd<scorm.Cmd_readCrsResults>(userId, companyId, prodUrl),
        //scorm.Cmd_readCrsResults_Create(companyId, prodUrl, null, userId, 0),
        (res: string[][]) => {
          Logger.trace_persistNewEA("loadShortUserData: " + res.join(" ### "));
          var obj: { [url: string]: Object; } = {};
          _.each(res, kv => obj[kv[0]] = JSON.parse(kv[1]));
          completed(obj);
        });

    },
    loadUserData: (userId, companyId, prodUrl, modUrl, completed) => {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        scorm.Cmd_readModuleResults_Type,
        createCmd<scorm.Cmd_readModuleResults>(userId, companyId, prodUrl, r => { r.key = modUrl }),
        //scorm.Cmd_readModuleResults_Create(modUrl, userId, companyId, prodUrl, null),
        (res: string) => {
          Logger.trace_persistNewEA("loadUserData resp: " + modUrl + ": " + res);
          completed(_.isEmpty(res) ? {} : JSON.parse(res));
        });
    },
    saveUserData: (userId, companyId, prodUrl, data, completed) => {
      Pager.ajaxPost(
        Pager.pathType.restServices,
        scorm.Cmd_saveUserData_Type,
        createCmd<scorm.Cmd_saveUserData>(userId, companyId, prodUrl, r => { r.data = data }),
        //scorm.Cmd_saveUserData_Create(data, userId, companyId, prodUrl, null),
        () => {
          Logger.trace_persistNewEA("saveUserData");
          completed();
        });
    },
    readFiles: (urls, completed) => {
      if (!urls || urls.length == 0) completed([]);
      var data: Array<string> = [];
      var len = urls.length;
      var ajaxDone: (idx: number, fail: boolean) => (res: string) => void; //funkce, vracejici funkci
      ajaxDone = (idx, fail) => (res: string) => {
        data[idx] = fail ? null : (res == null ? "" : res);
        len--;
        if (len == 0) completed(data);
      };
      for (var i = 0; i < urls.length; i++)
        $.ajax({ url: urls[i].charAt(0) == '/' ? '..' + urls[i] : urls[i], dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion } }).
          done(ajaxDone(i, false)).fail(ajaxDone(i, true)); //i a false je znamo v dobe inicializace Ajax, nikoliv az v dobe navratu z ajax
    },
    resetExs: (userId, companyId, prodUrl, urls, completed) => {
      Pager.ajaxPost(
        Pager.pathType.restServices,
        scorm.Cmd_resetModules_Type,
        createCmd<scorm.Cmd_resetModules>(userId, companyId, prodUrl, r => { r.modIds = urls }),
        //scorm.Cmd_resetModules_Create(urls, userId, companyId, prodUrl, null),
        (res: string) => {
          Logger.trace_persistNewEA("resetExs: " + res);
          completed();
        });
    },
    createArchive: (userId, companyId, prodUrl, completed) => {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        scorm.Cmd_createArchive_Type,
        createCmd<scorm.Cmd_createArchive>(userId, companyId, prodUrl),
        //scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null),
        (res: number) => completed(res));
    },
    testResults: (userId, companyId, prodUrl, completed) => {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        scorm.Cmd_testResults_Type,
        createCmd<scorm.Cmd_testResults>(userId, companyId, prodUrl),
        //scorm.Cmd_testResults_Create(LMStatus.Cookie.id, companyId, productId, null),
        (res: string[]) => completed(_.map(res, r => JSON.parse(r))));
    }
  }


  ///****************** TESTS ***********************/
  //function readTestResults(isStart: boolean, testIds: number[], completed: (testResults: schools.SchoolCmdTestInfoItem[]) => void ) {
  //  Pager.doAjaxCmd(
  //    false,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_ReadTests_Type,
  //    JSON.stringify(scorm.Cmd_ReadTests_Create(isStart, testIds, LMStatus.Cookie.id, schools.data.companyId, schools.data.courseId, null)),
  //    (res: string[]) => {
  //      var infos = _.map(_.filter(res, (s: string) => s.length > 0), (s: string) => JSON.parse(Utils.unpackStr(s)));
  //      completed(infos);
  //    });
  //}

  //export function slSaveTest(testId: number, data: string, callback) {
  //  var parts = data.split(delim); if (parts.length != 2) throw "slSaveTest: parts.length != 2";
  //  Pager.doSLAjaxCmd(
  //    true,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_SaveTest_Type,
  //    JSON.stringify(scorm.Cmd_SaveTest_Create(testId, parts[0], parts[1], LMStatus.Cookie.id, schools.data.companyId, schools.data.courseId, null)),
  //    callback
  //    );
  //}

  //export function slSaveTestWithModules(data: string, callback) {
  //  Pager.doSLAjaxCmd(
  //    true,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_SaveTestWithModules_Type,
  //    JSON.stringify(scorm.Cmd_SaveTestWithModules_Create(data, LMStatus.Cookie.id, schools.data.companyId, schools.data.courseId, null)),
  //    callback
  //    );
  //}

  //export function slSaveTestModule(testId: number, moduleId: number, data: string, callback) {
  //  var parts = data.split(delim); if (parts.length != 2) throw "slSaveTest: parts.length != 2";
  //  Pager.doSLAjaxCmd(
  //    true,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_SaveTestModule_Type,
  //    JSON.stringify(scorm.Cmd_SaveTestModule_Create(moduleId, testId, parts[0], parts[1], LMStatus.Cookie.id, schools.data.companyId, schools.data.courseId, null)),
  //    callback
  //    );
  //}

  //export function slLoadTestModule(moduleId: number, callback) {
  //  Pager.doSLAjaxCmd(
  //    false,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_LoadTestModule_Type,
  //    JSON.stringify(scorm.Cmd_LoadTestModule_Create(moduleId, LMStatus.Cookie.id, schools.data.companyId, schools.data.courseId, null)),
  //    callback
  //    )
  //}

  //export function slLoadTestInfo(testId: number, callback) {
  //  Pager.doSLAjaxCmd(
  //    false,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_LoadTestInfo_Type,
  //    JSON.stringify(scorm.Cmd_LoadTestInfo_Create(testId, LMStatus.Cookie.id, schools.data.companyId, schools.data.courseId, null)),
  //    callback
  //    )
  //}

  //export function slTestCreated(metataskId: number, testId: number, callback) {
  //  var actTask: schools.metaTask = _.find(schools.data.metaCourse.tasks, (t: schools.metaTask) => t.jsonId == metataskId.toString());
  //  actTask.test.userTestId = testId;
  //  setMetaCourse(LMStatus.Cookie.id, schools.data.companyId, schools.data.courseId, schools.data.metaCourse, () => callback.completed(null));
  //}

  /****************** COURSES ***********************/

  //function resetModules(lmcomUserId: number, companyId: number, productId: string, modJsonIds: string[], completed: () => void) {
  //  Logger.trace_persistNewEA("resetModules " + modJsonIds.join(", "));
  //  schools.resetModulesLocal(modJsonIds);

  //  Pager.ajaxPost(
  //    Pager.pathType.restServices,
  //    scorm.Cmd_resetModules_Type,
  //    scorm.Cmd_resetModules_Create(modJsonIds, lmcomUserId, companyId, productId, null),
  //    () => completed()
  //    );
  //}

  //function readCrsResults(isStart: boolean, lmcomUserId: number, companyId: number, productId: string, completed: (res: schools.ModUser[]) => void) {
  //  Pager.ajaxGet(
  //    Pager.pathType.restServices,
  //    scorm.Cmd_readCrsResults_Type,
  //    scorm.Cmd_readCrsResults_Create(isStart, lmcomUserId, companyId, productId, null),
  //    (res: string[][]) => {
  //      _.each(res, (kv: string[]) => kv[1] = JSON.parse(kv[1]))
  //      Logger.trace_persistNewEA("readCrsResults: " + res.join(" ### "));
  //      completed(_.object<schools.ModUser[]>(res));
  //    }
  //    );
  //}

  //function readModuleResults(lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, completed: (res: schools.ModUser) => void) {
  //  Pager.ajaxGet(
  //    Pager.pathType.restServices,
  //    scorm.Cmd_readModuleResults_Type,
  //    scorm.Cmd_readModuleResults_Create(moduleJsonId, lmcomUserId, companyId, productId, null),
  //    (res: string) => {
  //      Logger.trace_persistNewEA("readModuleResults " + moduleJsonId + ": " + res);
  //      completed(JSON.parse(res));
  //    }
  //    );
  //}

  //function writeModuleResults(lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, data: schools.ModUser, dataShort: schools.ModUser, completed: () => void) {
  //  Logger.trace_persistNewEA("writeModuleResults " + moduleJsonId + ": " + JSON.stringify(dataShort));
  //  //schools.data.crsUser[moduleJsonId] = dataShort;
  //  Pager.doAjaxCmd(
  //    true,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_writeModuleResults_Type,
  //    JSON.stringify(scorm.Cmd_writeModuleResults_Create(moduleJsonId, JSON.stringify(data), JSON.stringify(dataShort), lmcomUserId, companyId, productId, null)),
  //    completed
  //    );
  //}

  //function setMetaCourse(lmcomUserId: number, companyId: number, productId: string, value: schools.metaCourse, completed: () => void) {
  //  Logger.trace_persistNewEA("setMetaCourse");
  //  Pager.doAjaxCmd(
  //    true,
  //    Pager.path(Pager.pathType.restServices),
  //    scorm.Cmd_setMetaCourse_Type,
  //    JSON.stringify(scorm.Cmd_setMetaCourse_Create(JSON.stringify(value), lmcomUserId, companyId, productId, null)),
  //    completed
  //    );
  //}

  //function getMetaCourse(lmcomUserId: number, companyId: number, productId: string, completed: (res: schools.metaCourse) => void) {
  //  Logger.trace_persistNewEA("getMetaCourse");
  //  Pager.ajaxGet(
  //    Pager.pathType.restServices,
  //    scorm.Cmd_getMetaCourse_Type,
  //    scorm.Cmd_getMetaCourse_Create(lmcomUserId, companyId, productId, null),
  //    (res: string) => completed(JSON.parse(res))
  //    );
  //}

}

//xx/#DEBUG
module Logger {
  export function trace_persistNewEA(msg: string): void {
    Logger.trace("persistNewEA", msg);
  }
}
//xx/#ENDDEBUG
//var scorm_dict = null;
