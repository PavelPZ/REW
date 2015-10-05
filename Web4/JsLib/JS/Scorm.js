var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var scorm;
(function (scorm) {
    var runtimeApi = (function () {
        function runtimeApi(api) {
            this.api = api;
        }
        runtimeApi.prototype.LMSInitialize = function (st) { Logger.trace_scorm("==> LMSInitialize"); return this.api ? this.api.LMSInitialize(st) : "true"; };
        runtimeApi.prototype.LMSGetValue = function (name) { Logger.trace_scorm("LMSGetValue " + name); return this.api ? this.api.LMSGetValue(name) : ""; };
        runtimeApi.prototype.LMSSetValue = function (name, value) { Logger.trace_scorm("LMSSetValue " + name); if (this.api)
            this.api.LMSSetValue(name, value); };
        runtimeApi.prototype.LMSCommit = function (newStatus) { Logger.trace_scorm("LMSCommit"); return this.api ? this.api.LMSCommit(newStatus) : "true"; };
        runtimeApi.prototype.LMSGetDiagnostic = function (code) { Logger.trace_scorm("LMSGetDiagnostic"); if (this.api)
            this.api.LMSGetDiagnostic(code); };
        runtimeApi.prototype.LMSGetErrorString = function (code) { Logger.trace_scorm("LMSGetErrorString"); return this.api ? this.api.LMSGetErrorString(code) : "true"; };
        runtimeApi.prototype.LMSGetLastError = function () { Logger.trace_scorm("LMSGetLastError"); return this.api ? this.api.LMSGetLastError() : 0; };
        runtimeApi.prototype.LMSFinish = function (par) { if (this.api)
            Logger.trace_scorm("==> LMSFinish"); this.api.LMSFinish(par); };
        return runtimeApi;
    })();
    scorm.runtimeApi = runtimeApi;
    var lmsDriver = (function () {
        function lmsDriver() {
        }
        lmsDriver.prototype.getPreviewMode = function () {
            return scorm.status == cStatusPassed || this.isPreviewWhenFailed() || scorm.status == cStatusCompleted || scorm.status == cStatusBrowsed || mode == cModeBrowse || mode == cModeReview;
        };
        lmsDriver.prototype.adjustFirstEnter = function () {
            var doCommit = false;
            if (scorm.status == cStatusNotAttempted || scorm.status == '') {
                doCommit = true;
                scorm.status = cStatusIncomplete;
                scorm.API.LMSSetValue(cStatus, scorm.status);
            }
            //v suspend data je ulozena identifikace Attempt Id (vyuziva se v persistScormEx.attemptId k identifikaci DB zaznamu)
            //Novy course Attempt pak tedy vyuziva nova data.
            var isNotAttempted = false;
            if (_.isEmpty(scorm.attemptId)) {
                scorm.attemptId = this.createAttemptIdQueryPar();
                isNotAttempted = true;
                doCommit = true;
                scorm.API.LMSSetValue(cSuspendData, scorm.attemptId);
            }
            if (doCommit)
                scorm.API.LMSCommit('');
            return isNotAttempted;
        };
        //virtuals
        lmsDriver.prototype.isPreviewWhenFailed = function () { return scorm.status == cStatusFailed; };
        lmsDriver.prototype.createAttemptIdQueryPar = function () { return 'attemptidstr=' + cfg.rootProductId + '|' + new Date().getTime().toString(); };
        return lmsDriver;
    })();
    var edoceoDriver = (function (_super) {
        __extends(edoceoDriver, _super);
        function edoceoDriver() {
            _super.apply(this, arguments);
        }
        //virtuals
        edoceoDriver.prototype.isPreviewWhenFailed = function () { return false; };
        edoceoDriver.prototype.createAttemptIdQueryPar = function () { return 'attemptid=' + Utils.Hash(cfg.rootProductId); };
        return edoceoDriver;
    })(lmsDriver);
    scorm.apiWin = window; //okno s API
    scorm.API = new runtimeApi(null);
    //var sessionStart: Date;
    var mode;
    var finished = true;
    var driver;
    switch (cfg.scorm_driver) {
        case schools.scormDriver.edoceo:
            driver = new edoceoDriver();
            break;
        case schools.scormDriver.no:
            driver = new lmsDriver();
            break;
    }
    //export function initDummy() {
    //  //API = new dummyApi();
    //  apiWin = window;
    //}
    $(window).on('unload', function () { if (!scorm.API || finished)
        return; scorm.API.LMSCommit(''); finish(); });
    function init(completed) {
        if (!finished)
            return;
        finished = false;
        if (!scorm.API.api)
            findApi();
        Logger.trace_scorm("API OK: moodle=" + (scorm.isMoodle ? "true" : "false") + ", isPopup=" +
            (scorm.inPopup ? "true" : "false") + ", url=" + scorm.apiUrl);
        if (isError(scorm.API.LMSInitialize(''))) {
            scorm.API.LMSFinish('');
            if (!checkError(scorm.API.LMSInitialize('')))
                return false;
        }
        scorm.status = scorm.API.LMSGetValue(cStatus);
        var stName = scorm.API.LMSGetValue(cStudentName);
        var stId = scorm.API.LMSGetValue(cStudentId);
        var compHost = scorm.apiWin.location.host;
        mode = scorm.API.LMSGetValue(cMode);
        if (_.isEmpty(mode))
            mode = scorm.API.LMSGetValue(cLessMode);
        scorm.attemptId = scorm.API.LMSGetValue(cSuspendData);
        Logger.trace_scorm("Status=" + scorm.status + ", compHost=" + compHost + ", id=" + stId + ", firstName=" + stFirstName + ", lastName=" + stLastName + ", mode=" + mode + ', suspendData=' + scorm.attemptId);
        CourseMeta.previewMode = driver.getPreviewMode();
        if (CourseMeta.previewMode) {
            completed(compHost, stId, stFirstName, stLastName, false);
            return;
        }
        var isFirstEnter = driver.adjustFirstEnter();
        var parts = stName ? stName.split(",") : [""];
        var stLastName = parts[0];
        var stFirstName = parts.length > 1 ? parts[1] : "";
        if (completed)
            completed(compHost, stId, stFirstName, stLastName, isFirstEnter);
    }
    scorm.init = init;
    function reportProgress(timeSec, complScore) {
        if (finished || scorm.API == null || driver.getPreviewMode())
            return;
        //cmi.core.session_time pridava cas k cmi.core.total_time, => TotalTime = TotalTime + (LMTotalTime - TotalTime)
        var total = scorm.API.LMSGetValue(cTotalTime);
        if (!total)
            total = "00:00:00";
        var parts = total.split(":");
        if (parts.length != 3)
            parts = ["0", "0", "0"];
        var elapsedSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        if (elapsedSec < timeSec) {
            var time = secToScormTime(timeSec - elapsedSec);
            scorm.API.LMSSetValue(cSessionTime, time);
        }
        if (complScore != null) {
            //LMS neumi samo nastavovat passed x failed:
            var mastery = scorm.API.LMSGetValue(cMasteryScore);
            var sc = _.isEmpty(mastery) ? 75 : parseInt(mastery);
            scorm.status = complScore >= sc ? cStatusPassed : cStatusFailed;
            //LMS umi nastavovat passed x failed:
            //status = cStatusCompleted;
            CourseMeta.previewMode = driver.getPreviewMode();
            scorm.API.LMSSetValue(cStatus, scorm.status);
            scorm.API.LMSSetValue(cScoreRaw, complScore.toString());
            Logger.trace_scorm("progress: completed, score=" + complScore.toString());
        }
        Logger.trace_scorm("progress: elapsed=" + time);
        checkError(scorm.API.LMSCommit(''));
        if (CourseMeta.previewMode)
            finish();
        //if (cfg.scorm_AlowFinish) {
        //  checkError(API.LMSFinish(""));
        //  checkError(API.LMSInitialize(''));
        //}
    }
    scorm.reportProgress = reportProgress;
    function finish() {
        if (finished || scorm.API == null)
            return;
        checkError(scorm.API.LMSFinish(""));
        finished = true;
    }
    scorm.finish = finish;
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
    function isError(res) {
        return !res || (res.toString() != SCORM_FALSE) ? false : true;
    }
    function checkError(res) {
        if (!isError(res))
            return true;
        var errorNumber = scorm.API.LMSGetLastError();
        var errorString = scorm.API.LMSGetErrorString(errorNumber);
        var diagnostic = scorm.API.LMSGetDiagnostic(errorNumber);
        var errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
        Logger.trace_scorm("**** ERROR:  - Could not initialize communication with the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
        return false;
    }
    function findApi() {
        findAPILow(window);
        if (scorm.API.api != null)
            return;
        var opener = findOpener(window);
        if ((opener == null) || (typeof (opener) == "undefined"))
            return;
        findAPILow(opener);
        scorm.inPopup = scorm.API.api != null;
    }
    ;
    function findAPILow(win) {
        var findAPITries = 0;
        while ((win.API == null || typeof (win.API) == 'undefined') && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > 7)
                return;
            win = win.parent;
        }
        if (typeof (win.API) == 'undefined')
            return;
        scorm.apiWin = win;
        scorm.apiUrl = scorm.apiWin.location.href.toLowerCase();
        scorm.apiSignature = (scorm.apiWin.location.hostname + scorm.apiWin.location.pathname).toLowerCase();
        scorm.isMoodle = scorm.apiUrl.indexOf(moodlePath) >= 0;
        scorm.API = new runtimeApi(win.API);
    }
    function findOpener(win) {
        var findAPITries = 0;
        while ((win.opener == null) && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > 7)
                return null;
            win = win.parent;
        }
        return win.opener;
    }
    var moodlePath = '/mod/scorm/player.php';
    function updateSessionTime(startDate, endDate, elapsed) {
        var sessSec = (endDate.getTime() - startDate.getTime()) / 1000;
        var parts = elapsed.split(':');
        var elapsedSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        var newSec = elapsedSec + sessSec;
        return secToScormTime(newSec);
    }
    function secToScormTime(ts) {
        var sec = (ts % 60);
        ts -= sec;
        var tmp = (ts % 3600); //# of seconds in the total # of minutes
        ts -= tmp; //# of seconds in the total # of hours
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
        else
            hour = (ts / 3600);
        if ((tmp % 60) != 0)
            min = 0;
        else
            min = (tmp / 60);
        var h = hour.toString();
        if (h.length < 2)
            h = "0" + h;
        var m = min.toString();
        if (m.length < 2)
            m = "0" + m;
        var rtnVal = h + ":" + m + ":" + strSec;
        return rtnVal;
    }
})(scorm || (scorm = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_scorm(msg) {
        Logger.trace("scorm", msg);
    }
    Logger.trace_scorm = trace_scorm;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var noopScorm = null;
