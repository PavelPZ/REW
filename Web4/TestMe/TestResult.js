var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var testMe;
(function (testMe) {
    var ResultLow = (function (_super) {
        __extends(ResultLow, _super);
        function ResultLow() {
            _super.apply(this, arguments);
            this.br = [{ title: schools.homeTitle(), iconId: function () { return 'home'; }, url: '' }];
        }
        ResultLow.prototype.breadcrumbs = function () { return this.br; };
        return ResultLow;
    })(schools.Model);
    testMe.ResultLow = ResultLow;
    var Result = (function (_super) {
        __extends(Result, _super);
        function Result(urlParts) {
            _super.call(this, testMe.tResult, urlParts);
            this.appId = testMe.appId;
        }
        Result.prototype.doUpdate = function (completed) {
            var th = this;
            CourseMeta.lib.actPersistence().loadUserData(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, testMe.testImpl.resultKey, function (data) {
                extendResult(data);
                th.data = data;
                th.br.pushArray([
                    { title: th.data.title, iconId: function () { return 'folder-open'; }, url: testMe.createUrlCompl(testMe.tResults, CourseMeta.actCompanyId, th.productUrl.split('|')[0]) },
                    { title: th.data.subTitleShort(), iconId: function () { return 'puzzle-piece'; }, url: '' }
                ]);
                completed();
            });
        };
        Result.prototype.downloadCert = function () {
            Pager.ajax_download(Pager.path(Pager.pathType.restServices), persistNewEA.createCmd(schools.LMComUserId(), CourseMeta.actCompanyId, this.productUrl, function (cmd) { return cmd.loc = Trados.actLang; }), scorm.Cmd_testCert_Type);
        };
        return Result;
    })(ResultLow);
    testMe.Result = Result;
    var Results = (function (_super) {
        __extends(Results, _super);
        function Results(urlParts) {
            _super.call(this, testMe.tResults, urlParts);
            this.appId = testMe.appId;
        }
        Results.prototype.doUpdate = function (completed) {
            var th = this;
            CourseMeta.lib.actPersistence().testResults(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, function (data) {
                _.each(data, function (r) { return extendResult(r); });
                th.tests = data;
                var cnt = 0;
                _.each(th.tests, function (t) { return t.idx = cnt++; });
                th.barTitle = th.tests[0].title;
                th.br.pushArray([
                    { title: th.barTitle, iconId: function () { return 'folder-open'; }, url: '' }
                ]);
                th.gotoTest = function (idx) { return window.location.hash = testMe.createUrlCompl(testMe.tResult, CourseMeta.actCompanyId, th.productUrl + '|' + th.tests[idx].id.toString()); };
                completed();
            });
        };
        return Results;
    })(ResultLow);
    testMe.Results = Results;
    function extendResult(r) {
        Utils.extendObject(r, [resultImpl]);
        _.each(r.skills, function (s) { return Utils.extendObject(s, [skillResultImpl]); });
    }
    var resultImpl = (function () {
        function resultImpl() {
        }
        resultImpl.prototype.started = function () { return Utils.numToDate(_.min(this.skills, function (sk) { return sk.started; }).started); };
        resultImpl.prototype.finished = function () { return Utils.numToDate(_.max(this.skills, function (sk) { return sk.started; }).finished); };
        resultImpl.prototype.elapsed = function () { var res = 0; _.each(this.skills, function (sk) { return res += sk.elapsed; }); return res; };
        resultImpl.prototype.dateTxt = function () { return resultImpl.dateTxtProc(this.started(), this.finished()); };
        resultImpl.dateTxtProc = function (stDt, finDt) {
            var stD = Globalize.format(stDt, 'd');
            var stT = Globalize.format(stDt, 'H:mm:ss');
            var finD = Globalize.format(finDt, 'd');
            var finT = Globalize.format(finDt, 'H:mm:ss');
            var dtSame = stDt.setHours(0, 0, 0, 0) == finDt.setHours(0, 0, 0, 0);
            return dtSame ? stD + ' (' + stT + ' - ' + finT + ')' : stD + ' ' + stT + ' - ' + finD + ' ' + finT;
        };
        resultImpl.prototype.elapsedTxt = function () { return Utils.formatTimeSpan(this.elapsed()); };
        resultImpl.prototype.interruptsTxt = function () {
            if (!this.interrupts || this.interrupts.length == 0)
                return '0';
            var len = 0;
            _.each(this.interrupts, function (it) { return len += it.end - it.beg; });
            return this.interrupts.length.toString() + 'x, ' + CSLocalize('ee6f54e31d3c4743883b7bf5175867a8', 'duration') + ' ' + Utils.formatTimeSpan(len);
        };
        resultImpl.prototype.ipsTxt = function () {
            var ips = _.map(this.interrupts, function (it) { return it.ip; });
            ips.push(this.ip);
            ips = _.uniq(ips);
            var huge = ips.length > 2;
            ips = ips.slice(0, 2);
            var res = ips.join(', ');
            return huge ? res + ',...' : res;
        };
        resultImpl.prototype.subTitleShort = function () { return Globalize.format(this.started(), 'd'); };
        resultImpl.prototype.subTitleLong = function () { return this.title + ': ' + Globalize.format(this.started(), 'd'); };
        //************ interruprions a IP address
        resultImpl.prototype.hasIntIpData = function () { return this.interrupts && this.interrupts.length > 0; };
        resultImpl.prototype.adjustIntIpData = function () {
            if (this.intIpData)
                return this.intIpData;
            var res = [];
            var temp;
            _.each(this.interrupts, function (it) { return res.push([
                Globalize.format(temp = Utils.numToDate(it.beg), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.beg), 'H:mm:ss'),
                Globalize.format(temp = Utils.numToDate(it.end), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.end), 'H:mm:ss'),
                Utils.formatTimeSpan(it.end - it.beg),
                it.ip
            ]); });
            return res;
        };
        resultImpl.prototype.adjustIpData = function () {
            if (this.ipData)
                return this.ipData;
            var res = _.uniq(_.map(this.interrupts, function (it) { return it.ip; }));
            res.push(this.ip);
            res = _.uniq(res);
            return res;
        };
        resultImpl.prototype.waitForHuman = function () { return Course.needsHumanEval(this.flag); };
        return resultImpl;
    })();
    testMe.resultImpl = resultImpl;
    var skillResultImpl = (function () {
        function skillResultImpl() {
        }
        skillResultImpl.prototype.dateTxt = function () { return resultImpl.dateTxtProc(Utils.numToDate(this.started), Utils.numToDate(this.finished)); };
        skillResultImpl.prototype.elapsedTxt = function () { return Utils.formatTimeSpan(this.elapsed); };
        skillResultImpl.prototype.skillText = function () { return testMe.Model.skillText(this.skill); };
        skillResultImpl.prototype.waitForHuman = function () { return Course.needsHumanEval(this.flag); };
        skillResultImpl.prototype.score = function () { return Course.scorePercent(this); };
        return skillResultImpl;
    })();
    testMe.skillResultImpl = skillResultImpl;
    //Pager.registerAppLocator(appId, tResult,(urlParts, completed) => completed(new Result(urlParts)));
    //Pager.registerAppLocator(appId, tResults, (urlParts, completed) => completed(new Results(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, testMe.tResult, testMe.appId, testMe.tResult, 3, function (urlParts) { return new Result(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, testMe.tResults, testMe.appId, testMe.tResults, 3, function (urlParts) { return new Results(urlParts); }); });
})(testMe || (testMe = {}));
