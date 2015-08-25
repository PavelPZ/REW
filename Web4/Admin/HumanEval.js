var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    //*************************************************************
    //  home stranka hodnotitele - vyber testu k evaluaci
    //*************************************************************
    var HumanEval = (function (_super) {
        __extends(HumanEval, _super);
        function HumanEval(urlParts) {
            _super.call(this, schoolAdmin.humanEvalTypeName, urlParts);
        }
        // UPDATE
        HumanEval.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalGet_Type, Login.CmdHumanEvalGet_Create(LMStatus.Cookie.id, this.CompanyId), function (res) {
                _this.data = res;
                _this.items = _.sortBy(_.map(res.todo, function (td) { return new HumanEvalCrs(td, _this); }), function (it) { return it.assigned; });
                completed();
            });
        };
        HumanEval.prototype.close = function () {
            location.hash = schools.createHomeUrlStd();
        };
        return HumanEval;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEval = HumanEval;
    var HumanEvalCrs = (function () {
        function HumanEvalCrs(data, owner) {
            this.data = data;
            this.owner = owner;
            this.title = CourseMeta.lib.findProduct(data.productId.split('|')[0]).title;
            this.assigned = Globalize.format(Utils.numToDate(data.assigned), 'd');
        }
        HumanEvalCrs.prototype.click = function () {
            location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalExTypeName, this.owner.CompanyId) + hashDelim +
                this.owner.data.companyUserId.toString() + hashDelim +
                this.data.courseUserId.toString() + hashDelim +
                encodeUrlHash(this.data.productId);
        };
        return HumanEvalCrs;
    })();
    schoolAdmin.HumanEvalCrs = HumanEvalCrs;
    //*************************************************************
    //  cviceni jednoho testu k evaluaci
    //*************************************************************
    var HumanEvalEx = (function (_super) {
        __extends(HumanEvalEx, _super);
        function HumanEvalEx(urlParts) {
            _super.call(this, schoolAdmin.humanEvalExTypeName, urlParts);
            this.greenTitle = ko.observable(CSLocalize('be62382f71e84e96a1837a8a5c565f66', 'Next'));
            this.companyUserId = parseInt(urlParts[1]);
            this.courseUserId = parseInt(urlParts[2]);
            this.productId = decodeUrlHash(urlParts[3]);
            this.productTitle = CourseMeta.lib.findProduct(this.productId.split('|')[0]).title;
        }
        HumanEvalEx.prototype.update = function (completed) {
            var _this = this;
            if (this.items)
                this.initEx(completed);
            else
                this.init(function () { return _this.initEx(completed); });
        };
        // UPDATE
        HumanEvalEx.prototype.init = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalTest_Type, Login.CmdHumanEvalTest_Create(this.companyUserId, this.courseUserId), function (res) {
                _this.testUser_lmcomId = res.testUser_lmcomId;
                CourseMeta.lib.adjustProduct(_this.productId, null, function (justLoaded) {
                    _this.items = [];
                    _.each(res.urls, function (r) {
                        var ex = (CourseMeta.actProduct.getNode(r)); //if (ex.s == 0 || (ex.flag & CourseModel.CourseDataFlag.needsEval) == 0) return;
                        _this.items.push(new humanEx(ex));
                    });
                    _this.actIdx = 0;
                    completed();
                }, _this.testUser_lmcomId);
            });
        };
        HumanEvalEx.prototype.initEx = function (completed) {
            if (this.items.length == 0) {
                this.greenTitle(CSLocalize('8817520256884045b0e94bcb005f02d0', 'Finish'));
                completed();
                return;
            }
            this.greenTitle(this.isFinished() ? CSLocalize('9c834aec8bd94de284855521356f2fbd', 'Finish') : CSLocalize('232eaf4801724f4e9dc69ce12091c26d', 'Next'));
            var actEx = this.items[this.actIdx].ex;
            CourseMeta.lib.adjustEx(actEx, function () {
                actEx.page.humanEvalMode = true;
                CourseMeta.lib.displayEx(actEx, null, null);
            }, this.testUser_lmcomId);
        };
        HumanEvalEx.prototype.finishEx = function (completed) {
            var _this = this;
            if (this.items.length == 0) {
                completed(false);
                return;
            }
            var actEx = this.items[this.actIdx];
            if (Course.humanEvalControlImpl.useEvalForms(actEx.ex) != true) {
                completed(false);
                return;
            } //validator error => exit
            Pager.blockGui(true);
            actEx.done(true);
            //donut save Skills, Testu a Test.result
            var skill = actEx.ex.parent;
            skill.userPending = true;
            var test = skill.parent;
            test.userPending = true;
            //procedura pro modifikaci test.result (zmeni flag a skore jak skills tak testu)
            var processTestResult = function () {
                test.adjustResult();
                CourseMeta.lib.saveProduct(function () { completed(true); Pager.blockGui(false); }, _this.testUser_lmcomId);
            };
            //volej processTestResult (ev. nejdrive nacti test.result z DB)
            if (!test.result)
                CourseMeta.lib.actPersistence().loadUserData(this.testUser_lmcomId, CourseMeta.actCompanyId, CourseMeta.actProduct.url, testMe.testImpl.resultKey, function (data) { test.result = data; processTestResult(); });
            else
                processTestResult();
        };
        HumanEvalEx.prototype.doExClick = function (idx) {
            var _this = this;
            if (this.items.length == 0)
                return;
            this.finishEx(function (ok) { if (!ok)
                return; _this.actIdx = idx; Pager.reloadPage(); });
        };
        HumanEvalEx.prototype.nextClick = function () {
            var _this = this;
            if (this.isFinished()) {
                location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, this.CompanyId);
                return;
            }
            this.finishEx(function (ok) { if (!ok)
                return; _this.actIdx++; if (_this.actIdx >= _this.items.length)
                _this.actIdx = 0; Pager.reloadPage(); });
        };
        //close() {
        //  this.finishEx(() => location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, this.CompanyId));
        //}
        HumanEvalEx.prototype.isFinished = function () {
            return this.items.length == 0 || _.all(this.items, function (it) { return !Course.needsHumanEval(it.ex.flag); });
        };
        return HumanEvalEx;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalEx = HumanEvalEx;
    var humanEx = (function () {
        function humanEx(ex) {
            this.ex = ex;
            this.done = ko.observable(false);
        } //this.needsEval((ex.flag & CourseModel.CourseDataFlag.needsEval) != 0); }
        return humanEx;
    })();
    schoolAdmin.humanEx = humanEx;
    //Pager.registerAppLocator(appId, humanEvalTypeName,(urlParts, completed) => completed(new HumanEval(urlParts)));
    //Pager.registerAppLocator(appId, humanEvalExTypeName,(urlParts, completed) => completed(new HumanEvalEx(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.humanEvalTypeName, schoolAdmin.appId, schoolAdmin.humanEvalTypeName, 1, function (urlParts) { return new HumanEval(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.humanEvalExTypeName, schoolAdmin.appId, schoolAdmin.humanEvalExTypeName, 4, function (urlParts) { return new HumanEvalEx(urlParts); }); });
})(schoolAdmin || (schoolAdmin = {}));
