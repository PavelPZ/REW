module persistMemory {

  export var persistCourse: CourseMeta.IPersistence = {
    loadShortUserData: (userId, companyId, prodUrl, completed) => {
      var prodDb = memDb[prodUrl]; if (!prodDb) { completed(null); return; }
      var data: { [url: string]: Object; } = {};
      for (var p in prodDb) data[p] = JSON.parse(prodDb[p].shortdata);
      completed(data);
    },
    loadUserData: (userId, companyId, prodUrl, modUrl, completed) => {
      var prodDb = memDb[prodUrl]; if (!prodDb) { completed(null); return; }
      var m = prodDb[modUrl];
      completed(m && m.data ? JSON.parse(m.data) : null);
    },
    saveUserData: (userId, companyId, prodUrl, data, completed) => {
      var prodDb = memDb[prodUrl];
      if (!prodDb) { prodDb = {}; memDb[prodUrl] = prodDb; }
      _.each(data, dt => prodDb[dt[0]] = { id: dt[0], data: dt[2], shortdata: dt[1] });
      completed();
    },
    resetExs: (userId, companyId, prodUrl, urls, completed) => {
      delete memDb[prodUrl];
      completed();
    },
    readFiles: persistNewEA.persistCourse.readFiles,
    createArchive: (userId, companyId, productId, completed) => {
      completed(archiveId++);
      //var id = archiveId++;
      //var oldProd = memDb[productId]; delete memDb[productId];
      //productId = productId + '|' + id.toString();
      //memDb[productId] = oldProd;
      //completed(id);
    },
    testResults: (userId, companyId, productId, completed) => {
      persistCourse.loadUserData(userId, companyId, productId, 'result', completed); 
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

  export function reset() { memDb = {}; }

  interface mod {
    id: string;
    data: string;
    shortdata: string;
  }

  var memDb: { [prodUrl: string]: { [url: string]: mod }; } = {};
  //export function Init(completed: () => void ): void {
  //  schools.readAppDataAndLoc = schools.libReadAppDataAndLoc;
  //  schools.readAppData = schools.libReadAppData;
  //  schools.readCrsInfo = schools.libReadCrsInfo;

  //  //schools.createTest = createTest;
  //  //schools.readTestResults = readTestResults;
  //  schools.resetModules = resetModules;
  //  schools.readCrsResults = readCrsResults;
  //  schools.readModuleResult = readModuleResults;
  //  schools.writeModuleResult = writeModuleResults;
  //  schools.setMetaCourse = setMetaCourse;
  //  schools.getMetaCourse = getMetaCourse;
  //  completed();
  //}

  //var delim = ";";


  //var modules: mod[] = [];
  //var meta: schools.metaCourse = null;

  //function createTest(testFileName: string, lmcomUserId: number, companyId: number, prodUrl: number, completed: (testId: number) => void ): void {
  //  Pager.ajax(
  //    Pager.pathType.restServices,
  //    schools.SchoolCmdCreateTest_Type,
  //    schools.SchoolCmdCreateTest_Create(testFileName, lmcomUserId, companyId, prodUrl),
  //    (res: string) => completed(parseInt(res)));
  //}

  //function readTestResults(isStart: boolean, testIds: number[], completed: (testResults: schools.SchoolCmdTestInfoItem[]) => void ) {
  //  completed(null);
  //}

  //function resetModules(lmcomUserId: number, companyId: number, prodUrl: string, modJsonIds: string[], completed: () => void) {
  //  schools.resetModulesLocal(modJsonIds);
  //  _.each(modJsonIds, (id: string) => delete modules[id]);
  //  completed();
  //}

  //function readCrsResults(isStart: boolean, lmcomUserId: number, companyId: number, prodUrl: string, completed: (res: schools.ModUser[]) => void) {
  //  completed(_.map(modules, (m: mod) => JSON.parse(m.shortdata)));
  //}

  //function readModuleResults(lmcomUserId: number, companyId: number, prodUrl: string, moduleJsonId: string, completed: (res: schools.ModUser) => void) {
  //  var m = modules[moduleJsonId];
  //  completed(m ? JSON.parse(modules[moduleJsonId].data) : null);
  //}

  //function writeModuleResults(lmcomUserId: number, companyId: number, prodUrl: string, moduleJsonId: string, data: string, dataShort: string, completed: () => void) {
  //  var m: mod = { id: moduleJsonId, data: data, shortdata: dataShort };
  //  modules[moduleJsonId] = m;
  //  if (completed) completed();
  //}

  //function setMetaCourse(lmcomUserId: number, companyId: number, prodUrl: string, value: schools.metaCourse, completed: () => void) {
  //  meta = value;
  //  completed();
  //}

  //function getMetaCourse(lmcomUserId: number, companyId: number, prodUrl: string, completed: (res: schools.metaCourse) => void) {
  //  completed(meta);
  //}

}

//xx/#DEBUG
module Logger {
  export function trace_persistScormLocal(msg: string): void {
    Logger.trace("persistScormLocal", msg);
  }
}
//xx/#ENDDEBUG
//var persistScormL = null;
