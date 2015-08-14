
module schools {

  //export var readFiles: (urls: string[], completed: (data: string[]) => void) => void;

  //export var readAppDataAndLoc: (urls: Pager.locPaths, completed: (data, loc: string) => void) => void;

  //export var readAppData: (urls: string, completed: (data: string) => void) => void;

  ////nacte soubor z q:\LMCom\rew\Web4\Schools\EAData\ i s lokalizaci
  ////export var readStaticModuleData: (urls: Pager.locPaths, completed: (res, locRes: string) => void ) => void; 

  //export var resetModules: (LMComUserId: number, companyId: number, productId: string, modJsonIds: string[], completed: () => void) => void;

  ////nacte strucne vysledky vsech modulu kurzu
  //export var readCrsResults: (isStart: boolean, lmcomUserId: number, companyId: number, productId: string, completed: (res: ModUser[]) => void) => void;

  ////nacte podrobne vysledky modulu
  //export var readModuleResult: (lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, completed: (data: ModUser) => void) => void;

  ////zapise podrobne vysledky modulu
  //export var writeModuleResult: (lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, data: ModUser, dataShort: ModUser, completed: () => void) => void;

  ////metainformace o kurzu v puvodni lm.com DB. V nove verzi musi byt nahrazeny by metaCourse
  //export var readCrsInfo: (lmcomUserId: number, companyId: number, productId: string, completed: (res: CourseInfo) => void) => void;

  //export var setMetaCourse: (lmcomUserId: number, companyId: number, productId: string, value: metaCourse, completed: () => void) => void;

  //export var getMetaCourse: (lmcomUserId: number, companyId: number, productId: string, completed: (res: metaCourse) => void) => void;

  ////export var createTest: (testFileName: string, lmcomUserId: number, companyId: number, productId: string, completed: (testId: number) => void) => void;

  ////export var readTestResults: (isStart: boolean, testIds: number[], completed: (testResults: schools.SchoolCmdTestInfoItem[]) => void) => void;

  export function resetModulesLocal(modJsonIds: string[]) {
    ////uvolni data aktualniho modulu
    //schools.data.modId = null; schools.data.exStatic = null; schools.data.modUser = null;
    ////vymaz moduly na klientovi
    //_.each(modJsonIds, (key: string) => delete schools.data.crsUser[key]);
  }

  function addTimespan(url: string, replace: boolean): string {
    return replace ? url + "?timestamp=" + new Date().getTime() : url;
  }

 // export function libReadFiles(urls: string[], completed: (data: string[]) => void): void {
 //   if (!urls || urls.length == 0) completed([]);
 //   var data: Array<string> = [];
 //   var len = urls.length;
 //   var ajaxDone: (idx: number, fail: boolean) => (res: string) => void; //funkce, vracejici funkci
 //   ajaxDone = (idx, fail) => (res: string) => {
 //     data[idx] = fail ? null : (res == null ? "" : res);
 //     len--;
 //     if (len == 0) completed(data);
 //   };
 //   for (var i = 0; i < urls.length; i++)
 //     $.ajax({ url: urls[i], dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion } }).
 //       done(ajaxDone(i, false)).fail(ajaxDone(i, true)); //i a false je znamo v dobe inicializace Ajax, nikoliv az v dobe navratu z ajax
 //}

  //export function libReadAppDataAndLoc(urls: Pager.locPaths, completed: (data, loc: string) => void) {
  //  $.when(
  //    $.ajax({
  //      url: addTimespan(Pager.replaceJSON(urls.url, cfg.replaceJSON), cfg.debug_AddTimespanToJsonUrl), dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion },
  //    }),
  //    $.ajax({
  //      url: addTimespan(Pager.replaceJSON(urls.urlLoc, cfg.replaceJSON), cfg.debug_AddTimespanToJsonUrl), dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion },
  //    })
  //    )
  //    .done((dataRes: string[], locRes: string[]) => completed(dataRes[0], locRes[0]))
  //    .fail(() => Logger.error('Persist.libReadAppDataAndLoc', "Error in: " + urls.url + "; " + urls.urlLoc, ''));
  //}

  //export function libReadAppData(url: string, completed: (data: string) => void): void {
  //  $.ajax({
  //    url: addTimespan(Pager.replaceJSON(url, cfg.replaceJSON), cfg.debug_AddTimespanToJsonUrl), dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion },
  //  }).
  //    done((data: string) => completed(data)).
  //    fail(() => Logger.error('Persist.libReadAppData', url, ''));
  //}
  //export function libReadCrsInfo(lmcomUserId: number, companyId: number, productId: string, completed: (res: schools.CourseInfo) => void) {
  //  completed({ testUrl: null, testMode: schools.PretestMode.first, firstId: null, tempFirstIdTitle: null, tempFirstId: null, testHistory: null, licenceAgreeOK: true });
  //}

}

