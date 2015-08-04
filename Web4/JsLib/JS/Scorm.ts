module scorm {

  export class runtimeApi implements API {
    constructor(public api: API) { }
    LMSInitialize(st: string): string { Logger.trace_scorm("==> LMSInitialize"); return this.api ? this.api.LMSInitialize(st) : "true"; }
    LMSGetValue(name: string): string { Logger.trace_scorm("LMSGetValue " + name); return this.api ? this.api.LMSGetValue(name) : ""; }
    LMSSetValue(name: string, value: string): void { Logger.trace_scorm("LMSSetValue " + name); if (this.api) this.api.LMSSetValue(name, value); }
    LMSCommit(newStatus: string): string { Logger.trace_scorm("LMSCommit"); return this.api ? this.api.LMSCommit(newStatus) : "true"; }
    LMSGetDiagnostic(code) { Logger.trace_scorm("LMSGetDiagnostic"); if (this.api) this.api.LMSGetDiagnostic(code); }
    LMSGetErrorString(code): string { Logger.trace_scorm("LMSGetErrorString"); return this.api ? this.api.LMSGetErrorString(code) : "true"; }
    LMSGetLastError(): number { Logger.trace_scorm("LMSGetLastError"); return this.api ? this.api.LMSGetLastError() : 0; }
    LMSFinish(par) { if (this.api) Logger.trace_scorm("==> LMSFinish"); this.api.LMSFinish(par); }
  }

  class lmsDriver {
    ownAttemptId: boolean; //true => attemptId řeší scorm nadstavba ve vlastní režii, jako např. eDoceo. Jinak (pro Moodle) se attemptId ukládá do suspend_data a posila v query parametru 
    getPreviewMode(): boolean {
      return status == cStatusPassed || this.isPreviewWhenFailed() || status == cStatusCompleted || status == cStatusBrowsed || mode == cModeBrowse || mode == cModeReview;
    }
    adjustFirstEnter(): boolean {
      var doCommit = false;
      if (status == cStatusNotAttempted || status == '') {
        doCommit = true;
        status = cStatusIncomplete;
        API.LMSSetValue(cStatus, status);
      }
      //v suspend data je ulozena identifikace Attempt Id (vyuziva se v persistScormEx.attemptId k identifikaci DB zaznamu)
      //Novy course Attempt pak tedy vyuziva nova data.
      var isNotAttempted = false;
      if (_.isEmpty(attemptId)) {
        attemptId = this.createAttemptIdQueryPar();
        isNotAttempted = true; doCommit = true;
        API.LMSSetValue(cSuspendData, attemptId);
      }
      if (doCommit) API.LMSCommit('');
      return isNotAttempted;
    }
    //virtuals
    isPreviewWhenFailed(): boolean { return status == cStatusFailed; }
    createAttemptIdQueryPar(): string { return 'attemptidstr=' + cfg.rootProductId + '|' + new Date().getTime().toString(); }
  }

  class edoceoDriver extends lmsDriver {
    //virtuals
    isPreviewWhenFailed(): boolean { return false; }
    createAttemptIdQueryPar(): string { return 'attemptid=' + Utils.Hash(cfg.rootProductId); }
  }

  //http://scorm.com/scorm-explained/scorm-resources/
  //http://php.langmaster.org/mod/scorm/view.php?id=4, pzika / pzika

  export var inPopup: boolean; //scorm je otevren v popup okne
  export var apiWin: Window = window; //okno s API
  export var apiUrl: string; //URL API
  export var apiSignature: string; //Host a Path URL API
  export var isMoodle: boolean;
  export var status: string;
  export var attemptId: string;
  export var API: runtimeApi = new runtimeApi(null);
  //var sessionStart: Date;
  var mode: string;
  var finished: boolean = true;

  var driver: lmsDriver;
  switch (cfg.scorm_driver) {
    case schools.scormDriver.edoceo:
      driver = new edoceoDriver(); break;
    case schools.scormDriver.no:
      driver = new lmsDriver(); break;
  }

  //export function initDummy() {
  //  //API = new dummyApi();
  //  apiWin = window;
  //}

  $(window).on('unload', () => { if (!API || finished) return; API.LMSCommit(''); finish(); });


  export function init(completed: (compHost: string, id: string, firstName: string, lastName: string, isNotAttempted: boolean) => void): boolean {
    if (!finished) return;
    finished = false;
    if (!API.api) findApi();

    Logger.trace_scorm("API OK: moodle=" + (isMoodle ? "true" : "false") + ", isPopup=" +
      (inPopup ? "true" : "false") + ", url=" + apiUrl);
    if (isError(API.LMSInitialize(''))) {
      API.LMSFinish('');
      if (!checkError(API.LMSInitialize(''))) return false;
    }
    status = API.LMSGetValue(cStatus);
    var stName = API.LMSGetValue(cStudentName); var stId = API.LMSGetValue(cStudentId); var compHost = apiWin.location.host;
    mode = API.LMSGetValue(cMode); if (_.isEmpty(mode)) mode = API.LMSGetValue(cLessMode);
    attemptId = API.LMSGetValue(cSuspendData);
    Logger.trace_scorm("Status=" + status + ", compHost=" + compHost + ", id=" + stId + ", firstName=" + stFirstName + ", lastName=" + stLastName + ", mode=" + mode + ', suspendData=' + attemptId);

    CourseMeta.previewMode = driver.getPreviewMode(); 
    if (CourseMeta.previewMode) { completed(compHost, stId, stFirstName, stLastName, false); return; }

    var isFirstEnter = driver.adjustFirstEnter();

    var parts = stName ? stName.split(",") : [""]; var stLastName = parts[0]; var stFirstName = parts.length > 1 ? parts[1] : "";

    if (completed) completed(compHost, stId, stFirstName, stLastName, isFirstEnter);

  }

  export function reportProgress(timeSec: number, complScore?: number) {
    if (finished || API == null || driver.getPreviewMode()) return;

    //cmi.core.session_time pridava cas k cmi.core.total_time, => TotalTime = TotalTime + (LMTotalTime - TotalTime)
    var total = API.LMSGetValue(cTotalTime);
    if (!total) total = "00:00:00";
    var parts = total.split(":");
    if (parts.length != 3) parts = ["0", "0", "0"];
    var elapsedSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);

    if (elapsedSec < timeSec) { //je kladny pridavek
      var time = secToScormTime(timeSec - elapsedSec);
      API.LMSSetValue(cSessionTime, time);
    }

    if (complScore != null) { //=> completed
      //LMS neumi samo nastavovat passed x failed:
      var mastery = API.LMSGetValue(cMasteryScore);
      var sc = _.isEmpty(mastery) ? 75 : parseInt(mastery);
      status = complScore >= sc ? cStatusPassed : cStatusFailed;
      //LMS umi nastavovat passed x failed:
      //status = cStatusCompleted;
      CourseMeta.previewMode = driver.getPreviewMode();
      API.LMSSetValue(cStatus, status);
      API.LMSSetValue(cScoreRaw, complScore.toString());
      Logger.trace_scorm("progress: completed, score=" + complScore.toString());
    }
    Logger.trace_scorm("progress: elapsed=" + time);
    checkError(API.LMSCommit(''));

    if (CourseMeta.previewMode) finish();
    //if (cfg.scorm_AlowFinish) {
    //  checkError(API.LMSFinish(""));
    //  checkError(API.LMSInitialize(''));
    //}
  }

  export function finish() {
    if (finished || API == null) return;
    checkError(API.LMSFinish(""));
    finished = true;
  }

  //$(window).bind("unload", finish);
  //http://jsfiddle.net/ecmanaut/hQ3AQ/
  //window.onbeforeunload = finish;

  export interface API {
    LMSInitialize(st: string): string;
    LMSGetValue(name: string): string;
    LMSSetValue(name: string, value: string): void;
    LMSCommit(newStatus: string): string; //zapise zmeny po LMSSetValue
    LMSGetDiagnostic(code);
    LMSGetErrorString(code): string;
    LMSGetLastError(): number;
    LMSFinish(par);
  }

  //export class dummyApi implements API {
  //  LMSInitialize(st: string): string { return "true"; }
  //  LMSGetValue(name: string): string { return ""; }
  //  LMSSetValue(name: string, value: string): void { }
  //  LMSCommit(newStatus: string): string { return "true"; }
  //  LMSGetDiagnostic(code) { }
  //  LMSGetErrorString(code): string { return "true"; }
  //  LMSGetLastError(): number { return 0; }
  //  LMSFinish(par) { }
  //}

  var SCORM_TRUE = "true";
  var SCORM_FALSE = "false";

  //http://www.scormcourse.com/scorm12_course/resources/coreLesson_Status.html
  //http://www.vsscorm.net/2009/07/24/step-22-progress-and-completion-cmi-core-lesson_status/
  //http://scorm.com/scorm-explained/technical-scorm/run-time/
  var cStatus = 'cmi.core.lesson_status';
  var cStatusNotAttempted = "not attempted";
  var cStatusIncomplete = "incomplete";
  var cStatusPassed = "passed";
  var cStatusFailed = "failed";
  var cStatusCompleted = "completed";
  var cStatusBrowsed = "browsed";

  var cSuspendData = 'cmi.suspend_data';

  var cLessMode = 'cmi.core.lesson_mode';
  var cMode = 'cmi.mode';
  var cModeBrowse = 'browse';
  var cModeReview = 'review';

  //http://www.scormcourse.com/scorm12_course/resources/coreStudent_Name.html
  var cStudentName = "cmi.core.student_name";

  //http://www.scormcourse.com/scorm12_course/resources/coreStudent_id.html
  var cStudentId = "cmi.core.student_id";

  //http://www.scormcourse.com/scorm12_course/resources/coreSession_Time.html
  var cSessionTime = "cmi.core.session_time";
  var cTotalTime = "cmi.core.total_time";

  //http://www.scormcourse.com/scorm12_course/resources/coreExit.html
  var cExit = "cmi.core.exit";

  //http://www.scormcourse.com/scorm_2004_beginner/Run%20Time/Optional%20Items%20Reference/CMI_STUDENT_DATA.htm
  var cMasteryScore = "cmi.student_data.mastery_score";

  //http://www.scormcourse.com/scorm12_course/resources/coreScoreRaw.html
  var cScoreRaw = "cmi.core.score.raw";

  function isError(res): boolean {
    return !res || (res.toString() != SCORM_FALSE) ? false : true;
  }
  function checkError(res): boolean {
    if (!isError(res)) return true;
    var errorNumber = API.LMSGetLastError();
    var errorString = API.LMSGetErrorString(errorNumber);
    var diagnostic = API.LMSGetDiagnostic(errorNumber);
    var errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
    Logger.trace_scorm("**** ERROR:  - Could not initialize communication with the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
    return false;
  }

  function findApi(): void {
    findAPILow(window);
    if (API.api != null) return;
    var opener = findOpener(window);
    if ((opener == null) || (typeof (opener) == "undefined")) return;
    findAPILow(opener);
    inPopup = API.api != null;
  };

  function findAPILow(win): void {
    var findAPITries = 0;
    while ((win.API == null || typeof (win.API) == 'undefined') && (win.parent != null) && (win.parent != win)) {
      findAPITries++; if (findAPITries > 7) return;
      win = win.parent;
    }
    if (typeof (win.API) == 'undefined') return;
    apiWin = win;
    apiUrl = apiWin.location.href.toLowerCase();
    apiSignature = (apiWin.location.hostname + apiWin.location.pathname).toLowerCase();
    isMoodle = apiUrl.indexOf(moodlePath) >= 0;
    API = new runtimeApi(win.API);
  }

  function findOpener(win) {
    var findAPITries = 0;
    while ((win.opener == null) && (win.parent != null) && (win.parent != win)) {
      findAPITries++; if (findAPITries > 7) return null;
      win = win.parent;
    }
    return win.opener;
  }

  var moodlePath = '/mod/scorm/player.php';

  function updateSessionTime(startDate: Date, endDate: Date, elapsed: string): string {
    var sessSec = (endDate.getTime() - startDate.getTime()) / 1000;
    var parts = elapsed.split(':');
    var elapsedSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    var newSec = elapsedSec + sessSec;
    return secToScormTime(newSec);
  }

  function secToScormTime(ts: number): string {
    var sec = (ts % 60);

    ts -= sec;
    var tmp = (ts % 3600);  //# of seconds in the total # of minutes
    ts -= tmp;              //# of seconds in the total # of hours

    // convert seconds to conform to CMITimespan type (e.g. SS.00)
    sec = Math.round(sec * 100) / 100;

    var strSec = new String(sec);
    var strWholeSec = strSec;
    var strFractionSec = "";

    if (strSec.indexOf(".") != -1) {
      strWholeSec = strSec.substring(0, strSec.indexOf("."));
      strFractionSec = strSec.substring(strSec.indexOf(".") + 1, strSec.length);
    }

    if (strWholeSec.length < 2) {
      strWholeSec = "0" + strWholeSec;
    }
    strSec = strWholeSec;

    if (strFractionSec.length) {
      strSec = strSec + "." + strFractionSec;
    }

    var hour, min;
    if ((ts % 3600) != 0)
      hour = 0;
    else hour = (ts / 3600);
    if ((tmp % 60) != 0)
      min = 0;
    else min = (tmp / 60);

    var h = hour.toString();
    if (h.length < 2) h = "0" + h;
    var m = min.toString();
    if (m.length < 2) m = "0" + m;

    var rtnVal = h + ":" + m + ":" + strSec;

    return rtnVal;
  }


}

//xx/#DEBUG
module Logger {
  export function trace_scorm(msg: string): void {
    Logger.trace("scorm", msg);
  }
}
//xx/#ENDDEBUG
//var noopScorm = null;
