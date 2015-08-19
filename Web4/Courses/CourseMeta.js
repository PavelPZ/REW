var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseModel;
(function (CourseModel) {
    function find(dt, cond) {
        if (cond === void 0) { cond = null; }
        if (cond(dt))
            return dt;
        if (!dt.Items)
            return null;
        var res = null;
        return _.find(dt.Items, function (it) { return (res = find(it, cond)) != null; }) ? res : null;
    }
    CourseModel.find = find;
})(CourseModel || (CourseModel = {}));
var CourseMeta;
(function (CourseMeta) {
    function finishedAndLocked() { return CourseMeta.actCourseRoot.done && CourseMeta.previewMode; }
    CourseMeta.finishedAndLocked = finishedAndLocked;
    CourseMeta.previewMode;
    var dataImpl = (function () {
        function dataImpl() {
        }
        //funkce a akce
        dataImpl.prototype.localize = function (locProc) { this.title = locProc(this.title); };
        dataImpl.prototype.each = function (action) { if (this.Items)
            _.each(this.Items, function (it) { return action(it); }); };
        dataImpl.prototype.find = function (cond) { return (_.find(this.Items, function (it) { return cond(it); })); };
        dataImpl.prototype.findParent = function (cond) {
            var c = this;
            while (c != null) {
                if (cond(c))
                    return c;
                c = c.parent;
            }
            return null;
        };
        dataImpl.prototype.hrefCompl = function (companyId, productUrl, persistence) {
            var tp;
            if (CourseMeta.isType(this, CourseMeta.runtimeType.grammar))
                tp = CourseMeta.isType(this, CourseMeta.runtimeType.ex) ? schools.tGrammPage : schools.tGrammFolder;
            else if (CourseMeta.isType(this, CourseMeta.runtimeType.taskPretest))
                tp = schools.tCoursePretest;
            else
                tp = CourseMeta.isType(this, CourseMeta.runtimeType.ex) ? schools.tEx : schools.tCourseMeta;
            return schools.getHash(tp, companyId, productUrl, persistence, this.url);
        };
        dataImpl.prototype.href = function () {
            return this.hrefCompl(CourseMeta.actCompanyId, encodeUrlHash(CourseMeta.actProduct.url), CourseMeta.actProductPersistence);
        };
        dataImpl.prototype.iconId = function () {
            if (this == CourseMeta.actCourseRoot)
                return "book";
            else if (CourseMeta.isType(this, CourseMeta.runtimeType.ex))
                return CourseMeta.isType(this, CourseMeta.runtimeType.grammar) ? "file-o" : "edit";
            else
                return "folder-open";
        };
        return dataImpl;
    })();
    CourseMeta.dataImpl = dataImpl;
    Utils.applyMixins(dataImpl, []);
    var productImpl = (function (_super) {
        __extends(productImpl, _super);
        function productImpl() {
            _super.apply(this, arguments);
        }
        productImpl.prototype.getNode = function (url) { return (this.allNodes[url]); };
        productImpl.prototype.unloadActProduct = function () {
            if (CourseMeta.actEx)
                CourseMeta.actEx.onUnloadEx();
            if (CourseMeta.actModule)
                CourseMeta.actModule.onUnloadMod();
            CourseMeta.actNode = null;
            CourseMeta.actProduct = null;
            CourseMeta.actGrammar = null;
            CourseMeta.actCourseRoot = null;
            CourseMeta.actModule = null;
            CourseMeta.actEx = null;
        };
        return productImpl;
    })(dataImpl);
    CourseMeta.productImpl = productImpl;
    var grammarRoot = (function (_super) {
        __extends(grammarRoot, _super);
        function grammarRoot() {
            _super.apply(this, arguments);
        }
        return grammarRoot;
    })(dataImpl);
    CourseMeta.grammarRoot = grammarRoot;
    //vsechny uzlu kurzu (mimo vlastniho kurzu)
    var courseNode = (function (_super) {
        __extends(courseNode, _super);
        function courseNode() {
            _super.apply(this, arguments);
        }
        //********** GUI
        courseNode.prototype.getScoreInit = function () {
            return (this.getScoreValue = this.complNotPassiveCnt == 0 || !this.ms ? -1 : Math.round(this.s / this.ms * 100));
        };
        courseNode.prototype.progress = function () { return this.exCount - this.skipedCount == 0 ? 0 : Math.round(100 * (this.complNotPassiveCnt + this.complPassiveCnt - this.skipedCount) / (this.exCount - this.skipedCount)); };
        courseNode.prototype.statusText = function () {
            var pr = this.progress();
            return (pr > 0 ? CSLocalize('f124b261dbf9482d9c92e0c1b029f98a', 'Progress') + ' ' + pr.toString() + '%, ' : '') + this.statusStr();
        };
        courseNode.prototype.statusStr = function () {
            if (this.isSkiped)
                return CSLocalize('d96c8f11b16d4c9aa91ac8d8142267fa', 'skipped');
            return this.done ?
                CSLocalize('01fbc5f8a77c4e2491a9ed3ede74e966', 'completed') :
                (CourseMeta.greenArrowDict[this.url] ? CSLocalize('1fe40e2548924e519e9b226d4ced7bce', 'run') : CSLocalize('b7ed3c7fc67640ceb98417153f731d63', 'browse'));
        };
        courseNode.prototype.labelCls = function () { return CourseMeta.greenArrowDict[this.url] ? 'warning' : 'default'; };
        courseNode.prototype.btnIconId = function () { return CourseMeta.greenArrowDict[this.url] ? 'play' : null; };
        courseNode.prototype.iconId = function () { return 'folder-open'; };
        courseNode.prototype.contentCss = function () { var res = ''; if (_.isEmpty(this.btnIconId()))
            res += 'btn-icon-hidden'; if (this.isSkiped)
            res += ' disabled'; return res; };
        //disabledCss(): string { return this.isSkiped ? 'disabled' : ''; }
        courseNode.prototype.notRunnableMsg = function () { return null; };
        courseNode.prototype.showProgress = function () { return this.complNotPassiveCnt > 0; };
        //menu(): schoolHome.menuItem[] { return []; }
        //btnColor(): string { return }
        courseNode.prototype.btnClick = function () { CourseMeta.gui.gotoData(this); };
        courseNode.prototype.getSkiped = function () {
            var skiped = this.getSkipedTable(false);
            if (!skiped)
                return false;
            var nd = this;
            if (!skiped.allSkiped)
                return false;
            while (nd != null) {
                if (skiped.allSkiped[this.url])
                    return true;
                nd = nd.parent;
            }
            return false;
        };
        courseNode.prototype.setSkiped = function (value, withSave) {
            if (value == this.isSkiped)
                return;
            var skiped = this.getSkipedTable(true);
            if (!skiped)
                return;
            CourseMeta.scan(this, function (d) { delete skiped.allSkiped[d.url]; d.isSkiped = false; });
            if (value)
                skiped.allSkiped[this.url] = true;
            if (withSave)
                CourseMeta.lib.saveProduct(CourseMeta.gui.onReload);
        };
        courseNode.prototype.getSkipedTable = function (willModify) {
            var skRoot = this.findParent(function (it) { return CourseMeta.isType(it, CourseMeta.runtimeType.skipAbleRoot); });
            if (!skRoot)
                return null; //throw 'missin skiped root';
            if (willModify) {
                if (!skRoot.allSkiped)
                    skRoot.allSkiped = {};
                skRoot.userPending = true;
            }
            return skRoot;
        };
        courseNode.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            courseNode.doRefreshNumbers(this, exCountOnly);
        };
        courseNode.doRefreshNumbers = function (th, exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            th.complPassiveCnt = th.complNotPassiveCnt = th.s = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = th.flag = 0;
            th.done = th.isSkiped = false;
            var isTest = CourseMeta.lib.isTest(CourseMeta.actProduct);
            if (!isTest)
                th.ms = 0;
            //skiped => done
            if (th.getSkiped()) {
                th.exCount = 0;
                th.each(function (it) { it.refreshNumbers(true); th.exCount += it.exCount; });
                th.skipedCount = th.exCount;
                th.isSkiped = true;
                return;
            }
            //agregate childs
            _.each(th.Items, function (it) {
                it.refreshNumbers(exCountOnly); //refresh childs
                th.exCount += it.exCount;
                if (exCountOnly)
                    return;
                th.skipedCount += it.skipedCount;
                if (it.getSkiped())
                    return;
                th.complPassiveCnt += it.complPassiveCnt;
                th.complNotPassiveCnt += it.complNotPassiveCnt;
                th.elapsed += it.elapsed;
                //if (it.ms >= 0) th.ms += it.ms; //zaporne score => nevyhodnotitelne
                if (!it.s)
                    it.s = 0;
                //29.4.2015, osetreni starych cviceni. Pro nadrazene uzly jsou spravne tehdy, kdyz je score vetsi nez 0.75%
                if (CourseMeta.isType(it, CourseMeta.runtimeType.ex)) {
                    if (it.complNotPassiveCnt == 1) {
                        //var e = <exImpl>it;
                        //if (e.isOldEa)
                        //  th.s += e.isOldEaPassive ? 0 : (e.ms && e.s / e.ms > 0.75 ? 1 : 0);
                        //else
                        th.s += it.s;
                        if (!isTest)
                            th.ms += it.ms;
                    }
                }
                else {
                    th.s += it.s;
                    if (!isTest)
                        th.ms += it.ms;
                }
                th.flag |= it.flag;
                th.beg = setDate(th.beg, it.beg, true);
                th.end = setDate(th.end, it.end, false);
            });
            if (exCountOnly)
                return;
            if (th.skipedCount > 0 && th.skipedCount == th.exCount) {
                th.isSkiped = true;
                return;
            } //all child skiped => return
            if (th.complNotPassiveCnt + th.complPassiveCnt + th.skipedCount == th.exCount)
                th.done = true;
            //if (th.complNotPassiveCnt == 0 && th.complPassiveCnt > 0) th.score = -1;
            //else if (th.complNotPassiveCnt > 0) th.score = Math.round(th.score / th.complNotPassiveCnt);
        };
        courseNode.prototype.availableActions = function () {
            if (this.isSkiped)
                return CourseMeta.NodeAction.createActions(this, CourseMeta.nodeAction.unskip);
            return this.done ?
                CourseMeta.NodeAction.createActions(this, CourseMeta.nodeAction.browse, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? CourseMeta.nodeAction.reset : CourseMeta.nodeAction.no, CourseMeta.nodeAction.skip) :
                CourseMeta.NodeAction.createActions(this, CourseMeta.greenArrowDict[this.url] ? CourseMeta.nodeAction.run : CourseMeta.nodeAction.browse, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? CourseMeta.nodeAction.reset : CourseMeta.nodeAction.no, CourseMeta.nodeAction.skip);
        };
        //dostupne akce nad node 
        courseNode.prototype.onAction = function (type) {
            switch (type) {
                case CourseMeta.nodeAction.browse:
                case CourseMeta.nodeAction.run:
                    CourseMeta.gui.gotoData(this);
                    break;
                case CourseMeta.nodeAction.skip:
                    this.setSkiped(true, true);
                    break;
                case CourseMeta.nodeAction.unskip:
                    this.setSkiped(false, true);
                    break;
                case CourseMeta.nodeAction.reset:
                    //majdi all a resetable urls
                    var resetableUrls = [];
                    var allUrls = [];
                    CourseMeta.scan(this, function (it) { allUrls.push(it.url); if (!it.doReset)
                        return; if (it.doReset())
                        resetableUrls.push(it.url); });
                    //vlastni reset funkce
                    var resetProc = function () { return CourseMeta.lib.actPersistence().resetExs(schools.LMComUserId(), CourseMeta.actCompanyId, CourseMeta.actProduct.url, resetableUrls, CourseMeta.gui.onReload); };
                    //vyrad je ze skiped a volej resetProc
                    var skiped = this.getSkipedTable(false);
                    if (skiped.allSkiped) {
                        var changed = false;
                        _.each(allUrls, function (u) { delete skiped.allSkiped[u]; changed = true; });
                        if (changed) {
                            skiped.userPending = true;
                            CourseMeta.lib.saveProduct(resetProc);
                        }
                        else
                            resetProc();
                    }
                    else
                        resetProc();
                    break;
                case CourseMeta.nodeAction.runTestAgain:
                    break;
                case CourseMeta.nodeAction.cancelTestSkip:
                    break;
            }
        };
        courseNode.prototype.setUserData = function (data) { };
        courseNode.prototype.getUserData = function (setData) { };
        courseNode.prototype.expandDynamic = function (completed) { if (completed)
            completed(); };
        return courseNode;
    })(dataImpl);
    CourseMeta.courseNode = courseNode;
    var skipAbleRoot = (function (_super) {
        __extends(skipAbleRoot, _super);
        function skipAbleRoot() {
            _super.apply(this, arguments);
        }
        skipAbleRoot.prototype.setUserData = function (data) {
            this.allSkiped = data;
            if (!this.allSkiped)
                this.allSkiped = {};
        };
        skipAbleRoot.prototype.getUserData = function (setData) {
            setData(JSON.stringify(this.allSkiped), null, CourseModel.CourseDataFlag.skipAbleRoot, null);
        };
        skipAbleRoot.prototype.doReset = function () { if (!this.allSkiped)
            return false; delete this.allSkiped; return true; };
        return skipAbleRoot;
    })(courseNode);
    CourseMeta.skipAbleRoot = skipAbleRoot;
    var multiTaskImpl = (function (_super) {
        __extends(multiTaskImpl, _super);
        function multiTaskImpl() {
            _super.apply(this, arguments);
        }
        multiTaskImpl.prototype.iconId = function () { return 'th'; };
        return multiTaskImpl;
    })(courseNode);
    CourseMeta.multiTaskImpl = multiTaskImpl;
    var modImpl = (function (_super) {
        __extends(modImpl, _super);
        function modImpl() {
            _super.apply(this, arguments);
        }
        modImpl.prototype.iconId = function () { return 'book'; };
        modImpl.prototype.setUserData = function (data) {
            this.adjustSitemap(data);
        };
        modImpl.prototype.adjustSitemap = function (urls) {
            var _this = this;
            this.oldItems = this.Items;
            var exDir = {};
            CourseMeta.scan(this, function (e) { if (!CourseMeta.isType(e, CourseMeta.runtimeType.ex))
                return; exDir[e.url] = e; });
            this.Items = _.map(urls, function (url) { var e = exDir[url]; e.parent = _this; CourseMeta.actProduct.allNodes[e.url] = e; return e; });
            this.ms = 0;
            this.each(function (e) {
                //if (e.isOldEa)
                //  //this.ms += e.isOldEaPassive ? 0 : 1;
                //  throw 'oldEA exercise cannot be in test'; //pz 30.4.2015
                //else
                _this.ms += e.ms;
                e.testMode = CSLocalize('b8601c3b0385401b912f5f104b8d728e', 'Test');
            });
        };
        modImpl.prototype.getUserData = function (setData) {
            setData(JSON.stringify(_.map(this.Items, function (it) { return it.url; })), null, CourseModel.CourseDataFlag.modImpl, null);
        };
        modImpl.prototype.onUnloadMod = function () { this.dict = null; this.loc = null; };
        modImpl.prototype.doReset = function () { if (!this.oldItems)
            return false; this.Items = this.oldItems; delete this.oldItems; return true; };
        modImpl.prototype.expandDynamic = function () {
            if (this.Items == null)
                return false;
            var taskGroups = _.filter(this.Items, function (it) { return CourseMeta.isType(it, CourseMeta.runtimeType.testTaskGroup); });
            if (taskGroups.length != this.Items.length)
                return false;
            //var dynData = this.getDynamic(); if (!dynData) return false;
            var urls = _.flatten(_.map(taskGroups, function (grp) { return _.sample(_.map(grp.Items, function (e) { return e.url; }), cfg.testGroup_debug ? 1 : grp.take); }));
            this.adjustSitemap(urls);
            this.userPending = true;
            return true;
        };
        modImpl.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            var th = this;
            var dynData = th.getDynamic();
            if (dynData) {
                th.complPassiveCnt = th.complNotPassiveCnt = th.s = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = 0;
                th.done = th.isSkiped = false;
                //_.each(dynData.groups, g => th.exCount += cfg.testGroup_debug ? 1 : g.take);
                _.each(dynData.Items, function (g) { return th.exCount += cfg.testGroup_debug ? 1 : g.take; });
                if (th.getSkiped()) {
                    th.isSkiped = true;
                    th.skipedCount = th.exCount;
                }
            }
            else
                courseNode.doRefreshNumbers(th, exCountOnly);
        };
        modImpl.prototype.getDynamic = function () {
            var dynData = (this.Items ? this.Items[0] : null);
            return dynData && CourseMeta.isType(dynData, CourseMeta.runtimeType.dynamicModuleData) ? dynData : null;
        };
        return modImpl;
    })(courseNode);
    CourseMeta.modImpl = modImpl;
    function setDate(dt1, dt2, min) {
        if (!dt1)
            return dt2;
        if (!dt2)
            return dt1;
        if (min)
            return dt2 > dt1 ? dt1 : dt2;
        else
            return dt2 < dt1 ? dt1 : dt2;
    }
    var exImpl = (function (_super) {
        __extends(exImpl, _super);
        function exImpl() {
            _super.apply(this, arguments);
            this.flag = 0;
        }
        //isOldEa: boolean;
        //isOldEaPassive: boolean;
        //ms: number;
        exImpl.prototype.iconId = function () {
            if ((this.parent.type & (CourseMeta.runtimeType.taskTestInCourse | CourseMeta.runtimeType.taskTestSkill | CourseMeta.runtimeType.taskPretestTask)) != 0)
                return 'puzzle-piece';
            if (this.findParent(function (it) { return CourseMeta.isType(it, CourseMeta.runtimeType.grammar); }))
                return 'file-o';
            return 'edit';
        };
        exImpl.prototype.doReset = function () {
            var th = this;
            if (!th.result && !th.done)
                return false;
            delete th.done;
            delete th.s;
            delete th.beg;
            delete th.end;
            delete th.elapsed;
            th.onUnloadEx();
            return true;
        };
        exImpl.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            var th = this;
            if (exCountOnly) {
                th.exCount = 1;
                return;
            }
            th.complPassiveCnt = th.complNotPassiveCnt = th.skipedCount = 0;
            th.exCount = 1;
            th.isSkiped = false;
            if (!th.elapsed)
                th.elapsed = 0;
            if (th.getSkiped()) {
                th.skipedCount = 1;
                th.isSkiped = true;
                return;
            } //skiped => done
            if (th.done)
                if (!th.ms)
                    th.complPassiveCnt = 1;
                else
                    th.complNotPassiveCnt = 1;
        };
        exImpl.prototype.onUnloadEx = function () { delete this.page; delete this.result; delete this.evaluator; };
        exImpl.prototype.setUserData = function (user) {
            exImpl.asignResult(user, this);
        };
        exImpl.prototype.getUserData = function (setData) {
            var res = {};
            exImpl.asignResult(this, res);
            if (this.done)
                res.flag |= CourseModel.CourseDataFlag.done;
            if (this.complPassiveCnt == 1)
                res.flag |= CourseModel.CourseDataFlag.passive;
            var flag = CourseModel.CourseDataFlag.ex;
            if (this.parent && CourseMeta.isType(this.parent, CourseMeta.runtimeType.taskTestSkill))
                flag |= CourseModel.CourseDataFlag.testEx;
            setData(JSON.stringify(res), JSON.stringify(this.result), res.flag | flag, null);
        };
        exImpl.prototype.onSetPage = function (page, result) {
            this.page = page;
            if (!result)
                result = {};
            this.result = result;
            if (page.evalPage && !page.isOldEa)
                this.ms = page.evalPage.maxScore; //
            //if (page.evalPage) this.ms = page.isOldEa && !page.oldEaIsPassive ? 1 : page.evalPage.maxScore;
            //if (!page.isOldEa) page.isPassive = !CourseModel.find(page, data => data._tg && CourseModel.hasStatus(data, CourseModel.tgSt.isEval)); //pasivni cviceni nema zadne kontrolky
        };
        exImpl.prototype.setStartTime = function () {
            this.startTime = new Date().getTime();
            if (!this.beg)
                this.beg = Utils.dayToInt(new Date());
        };
        exImpl.asignResult = function (from, to) { to.beg = from.beg; to.elapsed = from.elapsed; to.end = from.end; to.ms = from.ms; to.s = from.s; to.done = from.done; to.flag = from.flag; };
        exImpl.prototype.findGreenEx = function () {
            var _this = this;
            var th = this;
            if (th.isSkiped)
                return null;
            var selfIdx = _.indexOf(th.parent.Items, this);
            var parentCount = 0;
            th.parent.each(function (nd) { if (nd.isSkiped || !CourseMeta.isType(nd, CourseMeta.runtimeType.ex))
                return; parentCount++; });
            var notSkipIdx = 0;
            th.parent.find(function (nd) { if (!nd.isSkiped)
                notSkipIdx++; return nd == th; });
            var idxFrom = ' (' + notSkipIdx.toString() + '/' + parentCount.toString() + ')';
            var res = { grEx: this, info: new CourseMeta.greenArrowInfo(CSLocalize('4f40988151d646308e50bf2225211081', 'Continue'), false, 'success', 'hand-o-right', function () { return CourseMeta.gui.gotoData(_this); }) };
            if (!th.page)
                return res; //pripad, kdy je cviceni na rade ale jsem na jine strance, tudiz jeste neni naladovano};
            var lastInMod;
            var nextEx = null;
            //dalsi cviceni stejneho parenta
            for (var i = selfIdx + 1; i < this.parent.Items.length; i++) {
                var it = (this.parent.Items[i]);
                if (CourseMeta.isType(it, CourseMeta.runtimeType.ex) && !it.isSkiped) {
                    nextEx = it;
                    break;
                }
            }
            lastInMod = nextEx == null;
            //jdi na dalsi node
            var nd = lastInMod && !th.testMode ? th.parent : nextEx; //nd je null pro posledni polozku testu
            //var gotoData = () => gui.gotoData(nd);
            if (CourseMeta.actNode != this) {
                res.info.title = CSLocalize('9a48bff2169240759d9e5b1c87618c1b', 'Continue');
                res.info.greenClick = function () { return CourseMeta.gui.gotoData(th); };
            }
            else if (!th.testMode && !th.page.isPassivePage() && !th.done) {
                res.info.title = CourseMeta.actNode == this ? CSLocalize('0b129b06c25b49908cd4576008025495', 'Evaluate') + idxFrom : CSLocalize('89024e890690456aaaf0251de3225fd6', 'Continue');
                res.info.greenClick = function () {
                    if (_this.evaluate()) {
                        CourseMeta.lib.saveProduct(function () {
                            CourseMeta.actCourseRoot.refreshNumbers();
                            //if (cfg.target == LMComLib.Targets.scorm) {
                            //  scorm.reportProgress(actCourseRoot.elapsed, actCourseRoot.done ? (actCourseRoot.complNotPassiveCnt == 0 ? 100 : Math.round(actCourseRoot.score / actCourseRoot.complNotPassiveCnt)) : null);
                            //}
                            var inf = th.findGreenEx().info;
                            inf.css = CourseMeta.greenCss();
                            CourseMeta.lib.fillArrowInfo(inf);
                            CourseMeta.refreshExerciseBar(th);
                        });
                    }
                };
            }
            else {
                res.info.title = (th.testMode ? th.testMode : (lastInMod ? CSLocalize('d874aa91bc914690ad75fe97a707e196', 'Completed') : CSLocalize('ba88aabeae6d4d59b235c927472c6440', 'Next'))) + idxFrom;
                if (!th.testMode && lastInMod)
                    res.info.iconId = 'th-list';
                res.info.greenClick = function () {
                    if (!th.done) {
                        if (_this.evaluate()) {
                            //if (cfg.target == LMComLib.Targets.scorm) {
                            //  actCourseRoot.refreshNumbers();
                            //  scorm.reportProgress(actCourseRoot.elapsed, actCourseRoot.done ? (actCourseRoot.complNotPassiveCnt == 0 ? 100 : Math.round(actCourseRoot.score / actCourseRoot.complNotPassiveCnt)) : null);
                            //}
                            CourseMeta.lib.saveProduct(function () { return CourseMeta.gui.gotoData(nd); });
                        }
                    }
                    else {
                        //human eval pro kurzy, zatim se asi nepouziva, pouzije se jen 'gui.gotoData(nd)'
                        var humanEval = Course.humanEvalControlImpl.useEvalForms(th);
                        if (humanEval === undefined)
                            CourseMeta.gui.gotoData(nd);
                        else if (humanEval == true)
                            CourseMeta.lib.saveProduct(function () { return CourseMeta.gui.gotoData(nd); });
                        else
                            return;
                    }
                };
            }
            return res;
        };
        exImpl.prototype.evaluate = function () {
            //aktualizace casu na konci cviceni
            var now = new Date().getTime();
            var delta = Math.min(exImpl.maxDelta, Math.round((now - this.startTime) / 1000));
            if (!this.elapsed)
                this.elapsed = 0;
            this.elapsed += delta;
            this.end = Utils.dayToInt(new Date());
            this.userPending = true;
            //pasivni
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                this.done = true;
                return true;
            }
            //zjisteni score
            this.evaluator.provideData(this.result);
            var score = this.evaluator.getScore();
            if (!score) {
                debugger;
                throw "!score"; /*this.page.isPassive = true;*/
                this.done = true;
                return true;
            }
            //cviceni je mozne vyhodnotit
            var exerciseOK = this.testMode ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= 75);
            if (!exerciseOK && !CourseMeta.gui.alert(CourseMeta.alerts.exTooManyErrors, true)) {
                this.userPending = false;
                return false;
            } //je hodne chyb a uzivatel chce cviceni znova
            this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
            if (!this.testMode)
                this.evaluator.acceptData(true, this.result);
            this.done = true;
            if (this.page.isOldEa)
                this.ms = score.ms;
            else if (this.ms != score.ms) {
                debugger;
                throw "this.maxScore != score.ms";
            }
            this.s = score.s;
            this.flag = score.flag;
            return true;
        };
        exImpl.prototype.testEvaluate = function () {
            this.evaluator.provideData(this.result);
            this.userPending = true;
            var score = this.evaluator.getScore();
            this.done = true;
            if (this.ms != score.ms) {
                debugger;
                throw "this.maxScore != score.ms";
            }
            this.s = score.s;
            this.flag = score.flag;
        };
        exImpl.prototype.reset = function () {
            if (!this.done)
                return;
            this.done = false;
            if (!this.page.isPassivePage())
                this.evaluator.resetData(this.result);
            this.userPending = true;
            CourseMeta.saveAndReload();
        };
        exImpl.maxDelta = 10 * 60; //10 minut
        return exImpl;
    })(courseNode);
    CourseMeta.exImpl = exImpl;
    var grammEx = (function (_super) {
        __extends(grammEx, _super);
        function grammEx() {
            _super.apply(this, arguments);
        }
        return grammEx;
    })(exImpl);
    CourseMeta.grammEx = grammEx;
    var courseImpl = (function (_super) {
        __extends(courseImpl, _super);
        function courseImpl() {
            _super.apply(this, arguments);
        }
        return courseImpl;
    })(courseNode);
    CourseMeta.courseImpl = courseImpl;
    var courseTestImpl = (function (_super) {
        __extends(courseTestImpl, _super);
        function courseTestImpl() {
            _super.apply(this, arguments);
        }
        return courseTestImpl;
    })(modImpl);
    CourseMeta.courseTestImpl = courseTestImpl;
    (function (taskPretestStatus) {
        taskPretestStatus[taskPretestStatus["questionaries"] = 0] = "questionaries";
        taskPretestStatus[taskPretestStatus["firstTest"] = 1] = "firstTest";
        taskPretestStatus[taskPretestStatus["lastTest"] = 2] = "lastTest";
        taskPretestStatus[taskPretestStatus["done"] = 3] = "done";
    })(CourseMeta.taskPretestStatus || (CourseMeta.taskPretestStatus = {}));
    var taskPretestStatus = CourseMeta.taskPretestStatus;
    var pretestTaskImpl = (function (_super) {
        __extends(pretestTaskImpl, _super);
        function pretestTaskImpl() {
            _super.apply(this, arguments);
        }
        return pretestTaskImpl;
    })(modImpl);
    CourseMeta.pretestTaskImpl = pretestTaskImpl;
    var pretestImpl = (function (_super) {
        __extends(pretestImpl, _super);
        function pretestImpl() {
            _super.apply(this, arguments);
        }
        pretestImpl.prototype.iconId = function () { return 'puzzle-piece'; };
        pretestImpl.prototype.showProgress = function () { return false; };
        pretestImpl.prototype.doReset = function () { var th = this; if (!th.pretestStatus)
            return false; delete th.pretestStatus; delete th.firstTestIdx; delete th.lastTestIdx; delete th.questionnaire; return true; };
        pretestImpl.prototype.initFields = function () {
            var _this = this;
            if (this.questionnaire)
                return;
            if (!this.pretestStatus)
                this.pretestStatus = taskPretestStatus.questionaries;
            this.questionnaire = CourseMeta.findDeep(this, function (it) { return it.name == 'questionnaire'; });
            this.result = CourseMeta.findDeep(this, function (it) { return it.name == 'result'; });
            this.pretests = [];
            this.each(function (it) { if (CourseMeta.isType(it, CourseMeta.runtimeType.taskPretestTask))
                _this.pretests.push(it); });
        };
        pretestImpl.prototype.findGreenEx = function () {
            var _this = this;
            var th = this;
            return th.pretestStatus == taskPretestStatus.done ? null : { grEx: this, info: new CourseMeta.greenArrowInfo('Pretest', false, 'success', 'hand-o-right', function () { return CourseMeta.gui.gotoData(_this); }) };
        };
        pretestImpl.prototype.pretestContinue = function () {
            var th = this;
            if (CourseMeta.actEx != th.actPretestEx())
                throw 'actEx != th.actPretestEx()';
            th.initFields();
            var nextEx;
            switch (th.pretestStatus) {
                case taskPretestStatus.questionaries:
                    CourseMeta.actEx.evaluate();
                    CourseMeta.actCourseRoot.refreshNumbers();
                    //zpracuj dotaznik
                    //TODO
                    th.firstTestIdx = 0;
                    th.pretestStatus = taskPretestStatus.firstTest;
                    th.userPending = true;
                    nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
                    break;
                case taskPretestStatus.firstTest:
                    CourseMeta.actEx.evaluate();
                    CourseMeta.actCourseRoot.refreshNumbers();
                    nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
                    if (!nextEx) {
                        //zpracuj prvni pretest
                        //TODO
                        th.lastTestIdx = 1;
                        th.pretestStatus = taskPretestStatus.lastTest;
                        th.userPending = true;
                        nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
                    }
                    break;
                case taskPretestStatus.lastTest:
                    CourseMeta.actEx.evaluate();
                    CourseMeta.actCourseRoot.refreshNumbers();
                    nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
                    if (!nextEx) {
                        //zpracuj druhy pretest
                        //TODO
                        th.pretestStatus = taskPretestStatus.done;
                        th.userPending = true;
                        nextEx = th.result;
                    }
                    break;
                case taskPretestStatus.done:
                    break;
            }
            CourseMeta.lib.saveProduct(function () {
                if (nextEx)
                    CourseMeta.lib.adjustEx(nextEx, function () {
                        return CourseMeta.lib.displayEx(nextEx, function (ex) { return Pager.clearHtml(); }, null);
                    });
                else
                    CourseMeta.gui.gotoData(null);
            });
        };
        pretestImpl.prototype.actPretestEx = function () {
            var th = this;
            th.initFields();
            switch (th.pretestStatus) {
                case taskPretestStatus.questionaries: return th.questionnaire;
                case taskPretestStatus.firstTest: return CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
                case taskPretestStatus.lastTest: return CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
                default: return th.result;
            }
        };
        pretestImpl.prototype.initModel = function () {
            var th = this;
            var ex = th.actPretestEx();
            var res = { grEx: ex, info: null };
            if (CourseMeta.actCourseRoot.done)
                res.info = CourseMeta.lib.info_courseFinished();
            else if (ex == th.result)
                res.info = CourseMeta.lib.info_continue();
            else
                res.info = new CourseMeta.greenArrowInfo('Pretest', false, 'success', 'hand-o-right', function () { return th.pretestContinue(); });
            return res;
        };
        pretestImpl.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            var th = this;
            th.initFields();
            var tempItems = th.Items;
            th.Items = [];
            th.Items.push(th.questionnaire);
            if (th.pretestStatus > taskPretestStatus.questionaries)
                th.Items.push(th.pretests[th.firstTestIdx]);
            if (th.pretestStatus > taskPretestStatus.firstTest)
                th.Items.push(th.pretests[th.lastTestIdx]);
            courseNode.doRefreshNumbers(th, exCountOnly);
            th.Items = tempItems;
        };
        pretestImpl.prototype.setUserData = function (user) {
            pretestImpl.asignResult(user, this);
        };
        pretestImpl.prototype.getUserData = function (setData) {
            var res = {};
            pretestImpl.asignResult(this, res);
            setData(JSON.stringify(res), null, CourseModel.CourseDataFlag.pretestImp, null);
        };
        pretestImpl.asignResult = function (from, to) { to.pretestStatus = from.pretestStatus; to.firstTestIdx = from.firstTestIdx; to.lastTestIdx = from.lastTestIdx; };
        return pretestImpl;
    })(courseNode);
    CourseMeta.pretestImpl = pretestImpl;
})(CourseMeta || (CourseMeta = {}));
