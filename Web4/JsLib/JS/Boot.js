//Soucast REW, musi byt po SCORM skupine
//http://blogs.msdn.com/b/kristoffer/archive/2006/12/22/loading-javascript-files-in-parallel.aspx
//http://stackoverflow.com/questions/94141/javascripts-document-write-inline-script-execution-order
var boot;
(function (boot) {
    function Dummy() {
    }
    boot.Dummy = Dummy;
    function Start() {
        bootStart($.noop);
    }
    boot.Start = Start;
    function bootStart(compl) {
        Logger.traceMsg('boot.Start');
        if (cfg.target == LMComLib.Targets.no)
            return;
        var completed = function () { ViewBase.init(); $('#splash').hide(); compl(); };
        if (cfg.target != LMComLib.Targets.web)
            schools.InitModel(completed);
        else {
            Login.InitModel({ logins: cfg.logins ? cfg.logins : [LMComLib.OtherType.LANGMaster, LMComLib.OtherType.Facebook, LMComLib.OtherType.Google, LMComLib.OtherType.Microsoft] }, function () { return schools.InitModel(completed); });
        }
    }
    boot.bootStart = bootStart;
    function rewJSUrl() {
        return cfg.licenceConfig.serviceUrl + '?type=_rew_' + LMComLib.Targets[cfg.target] + '&version=' + cfg.licenceConfig.rewVersion.toString() + '&appUrl=' + Utils.appIdViaUrl() + '&LoggerLogId=' + Logger.logId() + "&LMComVersion=" + Utils.LMComVersion;
    }
    function loadCourseJS(completed) {
        var req = {
            appUrl: typeof (scorm) != 'undefined' ? scorm.apiSignature : Utils.appIdViaUrl(),
            courseVersion: cfg.licenceConfig.courseVersion,
            Type: LMStatus.Cookie.Type,
            TypeId: LMStatus.Cookie.TypeId,
            FirstName: LMStatus.Cookie.FirstName,
            LastName: LMStatus.Cookie.LastName,
            EMail: LMStatus.Cookie.EMail,
            Login: LMStatus.Cookie.Login,
            Target: cfg.target,
            rootCourse: cfg.rootProductId,
        };
        var url = cfg.licenceConfig.serviceUrl + '?type=_course&data=' + encodeURIComponent(Utils.encrypt(req)) + '&appUrl=' + Utils.appIdViaUrl() + '&LoggerLogId=' + Logger.logId() + "&LMComVersion=" + Utils.LMComVersion + "&version=" + cfg.licenceConfig.courseVersion.toString();
        Logger.traceFmt('boot.loadCourseJS', 'appUrl={0}, target={1}, url={2}', req.appUrl, req.Target.toString(), url);
        Pager.renderTemplate('Dummy');
        $('#splash').show();
        $.ajax({
            dataType: "script",
            url: url,
            success: function () {
                Logger.traceMsg('boot.loadCourseJS: success');
                $('#splash').hide();
                completed();
            },
            cache: true,
        });
    }
    boot.loadCourseJS = loadCourseJS;
    function Error() {
        Pager.loadPage(new splash.licenceError());
    }
    boot.Error = Error;
    function minInit() {
        $('body').addClass(Trados.actLangCode);
        var cls;
        if (!_.isEmpty(cls = Gui2.skin.instance.bodyClass()))
            $('body').addClass(cls);
        $('body').addClass("design-" + (cfg.designId ? cfg.designId : ''));
        if (Trados.isRtl)
            $('body').addClass("rtl-able");
    }
    boot.minInit = minInit;
    var doOldApplicationStart = function () {
        if (cfg.startProcName == 'no') {
            minInit();
            return;
        }
        if (_.isEmpty(cfg.startProcName))
            cfg.startProcName = 'boot.Start';
        var parts = cfg.startProcName.split('.');
        var fnc = parts.pop();
        var ctx = window;
        for (var i = 0; i < parts.length; i++)
            ctx = ctx[parts[i]];
        ctx[fnc]();
    };
    function OldApplicationStart() { if (doOldApplicationStart)
        doOldApplicationStart(); doOldApplicationStart = null; }
    boot.OldApplicationStart = OldApplicationStart;
})(boot || (boot = {}));
