module persistLocal {

  export var persistCourse: CourseMeta.IPersistence = {
    loadShortUserData: (userId, companyId, prodUrl, completed) => {
    },
    loadUserData: (userId, companyId, prodUrl, modUrl, completed) => {
    },
    saveUserData: (userId, companyId, prodUrl, data, completed) => {
    },
    readFiles: (urls, completed) => void {
    },
    resetExs: (userId, companyId, prodUrl, urls, completed) => {
    },
    createArchive: (userId, companyId, productId, completed) => {
    },
    testResults: (userId, companyId, productId, completed) => {
    }
  };
  //export function Init(target: LMComLib.Targets, completed: () => void ): void {
  //  schools.resetModules = resetModules;
  //  schools.readCrsResults = readCrsResults;
  //  schools.readModuleResult = readModuleResult;
  //  schools.writeModuleResult = writeModuleResult;
  //  schools.setMetaCourse = setMetaCourse;
  //  schools.getMetaCourse = getMetaCourse;
  //  //schools.createTest = createTest;
  //  //schools.readTestResults = readTestResults;

  //  schools.readCrsInfo = schools.libReadCrsInfo;
  //  switch (target) {
  //    case LMComLib.Targets.download:
  //    //case LMComLib.Targets.sl:
  //      //persistDownload.Init(target == LMComLib.Targets.sl, completed);
  //      persistDownload.Init(false, completed);
  //      break;
  //    case LMComLib.Targets.phoneGap:
  //      persistPhonegap.Init(completed);
  //      break;
  //    default: throw "not implemented";
  //  }
  //}

  export var readFile: (crsId: string, url: string, completed: (data: string) => void) => void;
  export var writeFile: (crsId: string, url: string, data: string, completed: () => void) => void;
  export var deleteFile: (crsId: string, url: string, completed: () => void) => void;

  var modCache: schools.ModUser[] = [];

  var fCrsResults = "crs_result.txt";
  var fMetaCourse = "meta_course.txt";
  function fModule(modId: string) { return "mod_" + modId + ".txt"; }

  function resetModules(lmcomUserId: number, companyId: number, crsId: string, modJsonIds: string[], completed: () => void) {
    schools.resetModulesLocal(modJsonIds);

    var defs = _.map(modJsonIds, (mi: string) => {
      var modId = mi; var cId = crsId;
      var dfd: JQueryDeferred<string> = $.Deferred();
      deleteFile(cId, fModule(modId), dfd.resolve);
      return dfd.promise();
    });
    $.when(defs).then(() => {
      _.each(modJsonIds, (modId: string) => delete modCache[modId]);
      writeCrsResults(crsId, completed);
    }, () => alert("fail"));
  }

  function readCrsResults(isStart: boolean, lmcomUserId: number, companyId: number, crsId: string, completed: (res: schools.ModUser[]) => void) {
    readFile(crsId, fCrsResults, res => completed(modCache = (res == null ? [] : JSON.parse(res))));
  }

  function readModuleResult(lmcomUserId: number, companyId: number, crsId: string, moduleJsonId: string, completed: (res: schools.ModUser) => void) {
    readFile(crsId, fModule(moduleJsonId), str => completed(str == null ? null : JSON.parse(str)));
  }

  function writeModuleResult(lmcomUserId: number, companyId: number, crsId: string, moduleJsonId: string, data: schools.ModUser, dataShort: schools.ModUser, completed: () => void) {
    writeFile(crsId, fModule(moduleJsonId), JSON.stringify(data), () => {
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

  function writeCrsResults(crsId: string, completed: () => void) {
    writeFile(crsId, fCrsResults, JSON.stringify(modCache), completed);
  }

  //function createTest(testFileName: string, lmcomUserId: number, companyId: number, crsId: string, completed: (testId: number) => void ): void {
  //  debugger; throw "notImplemented";
  //}

  //function readTestResults(isStart: boolean, testIds: number[], completed: (testResults: schools.SchoolCmdTestInfoItem[]) => void ) {
  //  completed(null);
  //}

}

