/// <reference path="GenCourseModel.ts" />
/// <reference path="GapFill.ts" />
/// <reference path="Pairing.ts" />
/// <reference path="SingleChoice.ts" />
/// <reference path="CheckItem.ts" />
/// <reference path="Media.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/***** nemazat reference, nejde pak prelozit *****/
var Course;
(function (Course) {
    (function (initPhase) {
        initPhase[initPhase["beforeRender"] = 0] = "beforeRender";
        initPhase[initPhase["afterRender"] = 1] = "afterRender";
        initPhase[initPhase["afterRender2"] = 2] = "afterRender2";
    })(Course.initPhase || (Course.initPhase = {}));
    var initPhase = Course.initPhase;
    ;
    (function (initPhaseType) {
        initPhaseType[initPhaseType["no"] = 0] = "no";
        initPhaseType[initPhaseType["sync"] = 1] = "sync";
        initPhaseType[initPhaseType["async"] = 2] = "async";
    })(Course.initPhaseType || (Course.initPhaseType = {}));
    var initPhaseType = Course.initPhaseType;
    ;
    function scorePercent(sc) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
    Course.scorePercent = scorePercent;
    function needsHumanEval(flag) { return (flag & CourseModel.CourseDataFlag.needsEval) != 0; }
    Course.needsHumanEval = needsHumanEval;
    Course.dummyTag = { _tg: CourseModel.tspan, 'class': null, id: null, Items: null, _owner: null, srcpos: '' };
    //function getEvalData(ev: control) { return <evalControlImpl>ev; }
    var tagImpl = (function () {
        function tagImpl(data) {
            if (data)
                for (var p in data)
                    if (data.hasOwnProperty(p))
                        this[p] = data[p];
        }
        tagImpl.prototype.jsonMLParsed = function () {
            this._myPage = (_.find(this.parents(true), function (t) { return t._tg == CourseModel.tbody; }));
        };
        tagImpl.prototype.pageCreated = function () {
            this.blended = this._myPage.blendedExtension;
        };
        tagImpl.prototype.parents = function (incSelf) { var res = []; var t = incSelf ? this : this._owner; while (t) {
            res.push(t);
            t = t._owner;
        } return res; };
        tagImpl.prototype.isEval = function () { return CourseModel.hasStatus(this, CourseModel.tgSt.isEval); };
        tagImpl.prototype.isCtrl = function () { return CourseModel.hasStatus(this, CourseModel.tgSt.jsCtrl); };
        tagImpl.prototype.isMedia = function () { return _.any(CourseModel.ancestorsAndSelf(this._tg), function (anc) { return anc == CourseModel.tmediaTag; }); };
        tagImpl.prototype.initProc = function (phase, getTypeOnly, completed) { return initPhaseType.no; };
        tagImpl.prototype.getItem = function (id) { return this._myPage.tags[id]; };
        tagImpl.prototype.srcPosition = function () { return _.isEmpty(this.srcpos) ? '' : ' srcpos="' + this.srcpos + '"'; };
        return tagImpl;
    })();
    Course.tagImpl = tagImpl;
    var imgImpl = (function (_super) {
        __extends(imgImpl, _super);
        function imgImpl() {
            _super.apply(this, arguments);
        }
        imgImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            if (_.isEmpty(this.src))
                return;
            this.src = Utils.fullUrl(this.src) ? this.src : (cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + Utils.combineUrl(this._myPage.url, this.src);
        };
        return imgImpl;
    })(tagImpl);
    Course.imgImpl = imgImpl;
    var aImpl = (function (_super) {
        __extends(aImpl, _super);
        function aImpl() {
            _super.apply(this, arguments);
        }
        aImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            if (!this.href)
                return;
            this.href = this.href.toLowerCase();
            if (this.href.match(/^(\/?\w)+$/)) {
                this['-href'] = this.href;
                this.href = '#';
            }
        };
        return aImpl;
    })(tagImpl);
    Course.aImpl = aImpl;
    $(document).on('click', 'a[-href]', function (ev) {
        var href = $(ev.target).attr('-href');
        if (_.isEmpty(href))
            return;
        alert('TODO: ' + href);
        //gotoHref(null, href);
    });
    var evalControlImpl = (function (_super) {
        __extends(evalControlImpl, _super);
        function evalControlImpl(data) {
            _super.call(this, data);
            this.done = ko.observable(false); //priznak kontrolky ve stavu Done
            if (!this.id)
                this.id = "_id_" + (evalControlImpl.idCnt++).toString();
        }
        evalControlImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            if (!this.scoreWeight) {
                if (this._tg != CourseModel.tpairingItem && this._tg != CourseModel.tpairing)
                    this.scoreWeight = 100;
            }
        };
        evalControlImpl.prototype.pageDone = function () { return this._myPage.result.done; };
        //getTagProps(): Array<CourseModel.tag> { //tagy, ulozene v property
        //  var res: Array<CourseModel.tag> = [];
        //  _.each(CourseModel.getPropInfos(this.tg), prop => {
        //    //if (!CourseModel.hasStatusLow(prop.meta.st, CourseModel.tgSt.inItems)) return;
        //    if (_.isEmpty(prop.meta.childPropTypes)) return;
        //    var val = this[Utils.toCammelCase(prop.name)]; if (!val) return;
        //    if (CourseModel.hasStatusLow(prop.meta.st, CourseModel.tgSt.isArray)) res.pushArray(val); else res.push(val);
        //  });
        //  return res;
        //}
        evalControlImpl.prototype.isReadOnly = function () { return false; };
        evalControlImpl.prototype.isSkipEvaluation = function () { return false; };
        evalControlImpl.prototype.createResult = function (forceEval) { throw "not overwrited"; }; //inicializace objektu s vysledkem kontrolky
        evalControlImpl.prototype.provideData = function () { throw "not overwrited"; }; //predani dat z kontrolky do persistence
        evalControlImpl.prototype.acceptData = function (done) { this.done(done || (this.myEvalBtn && this.myEvalBtn.doneResult)); }; //zmena stavu kontrolky na zaklade persistentnich dat
        evalControlImpl.prototype.resetData = function (allData) { this.result = allData[this.id] = this.doCreateResult(false); this.acceptData(false); };
        //**** jedna z nasledujicich 2 metod musi byt v kontrolce prepsana. Pouziva se 1. result (zjisteny pomoci provideData z HTML), 2. source (xml) data 
        evalControlImpl.prototype.setScore = function () { var c = this.isCorrect(); this.result.ms = this.scoreWeight; this.result.s = c ? this.scoreWeight : 0; };
        evalControlImpl.prototype.isCorrect = function () { throw "not overwrited"; };
        //getResultScore(): CourseModel.Score { return { ms: this.result.ms, s: this.result.s }; }
        evalControlImpl.prototype.doProvideData = function () { this.provideData(); this.setScore(); };
        evalControlImpl.prototype.doCreateResult = function (forceEval) { this.result = this.createResult(forceEval); this.setScore(); return this.result; };
        evalControlImpl.prototype.selfElement = function () { return idToElement(this.id); };
        evalControlImpl.prototype.pageCreated = function () {
            _super.prototype.pageCreated.call(this);
            if (!this.id)
                throw 'eval control mush have id';
            var pgRes = this._myPage.result;
            if (!pgRes.result) {
                pgRes.result = {};
                this._myPage.result.userPending = true;
            }
            var ress = pgRes.result;
            if (pgRes.designForceEval || !ress[this.id]) {
                ress[this.id] = this.doCreateResult(pgRes.designForceEval);
                this._myPage.result.userPending = true;
            }
        };
        evalControlImpl.idCnt = 0;
        return evalControlImpl;
    })(tagImpl);
    Course.evalControlImpl = evalControlImpl;
    var humanEvalControlImpl = (function (_super) {
        __extends(humanEvalControlImpl, _super);
        function humanEvalControlImpl() {
            _super.apply(this, arguments);
            this.human = ko.observable('');
            this.humanLevel = ko.observable('');
            this.humanHelpTxt = ko.observable('');
        }
        humanEvalControlImpl.prototype.isHumanEvalMode = function () { return cfg.humanEvalMode || this._myPage.humanEvalMode; };
        humanEvalControlImpl.prototype.adjustEvalForm = function () {
            if (!this.isHumanEvalMode())
                return;
            this.form = $('#form-' + this.id);
            var par = { onsubmit: false, rules: {} };
            par.rules['human-ed-' + this.id] = { required: true, range: [0, 100], number: true };
            this.form.validate(par);
        };
        humanEvalControlImpl.prototype.acTestLevel = function () {
            var ex;
            var test;
            if (!this._myPage || !(ex = this._myPage.result) || !ex.parent || !(test = ex.parent.parent))
                return null;
            if (!CourseMeta.isType(test, CourseMeta.runtimeType.test))
                return null;
            return test.level;
        };
        humanEvalControlImpl.useEvalForms = function (ex) {
            if (!cfg.humanEvalMode && !ex.page.humanEvalMode)
                return undefined;
            //var toEvals: Array<{ hc: humanEvalControlImpl; visible: boolean; }> = [];
            var toEvals = [];
            for (var p in ex.page.tags) {
                var hc = (ex.page.tags[p]);
                if (CourseModel.isDescendantOf(hc._tg, CourseModel.thumanEval))
                    //toEvals.push({ hc: hc, visible: hc.form.css('display') != 'none' });
                    if (hc.form.css('display') != 'none')
                        toEvals.push(hc);
            }
            //if (!_.all(toEvals, f => !f.visible || f.hc.form.valid())) return false;
            if (!_.all(toEvals, function (f) { return f.form.valid(); }))
                return false;
            _.each(toEvals, function (ev) {
                ev.result.hPercent = parseInt(ev.human()) / 100 * ev.scoreWeight;
                ev.result.hEmail = LMStatus.Cookie.EMail;
                ev.result.hLmcomId = LMStatus.Cookie.id;
                ev.result.hDate = Utils.nowToNum();
                ev.result.flag = ev.result.flag & ~CourseModel.CourseDataFlag.needsEval;
                ev.setScore();
            });
            ex.userPending = true;
            var score = ex.evaluator.getScore();
            ex.s = score.s;
            ex.flag = score.flag;
            CourseMeta.actCourseRoot.refreshNumbers();
            return true;
        };
        humanEvalControlImpl.prototype.isKBeforeHumanEval = function () { throw 'notimplemented'; };
        humanEvalControlImpl.prototype.setScore = function () {
            this.result.ms = this.scoreWeight;
            if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
                this.result.s = Math.round(this.result.hPercent);
                return;
            }
            var c = this.isKBeforeHumanEval();
            this.result.s = 0;
            //Oprava 9.9.2015 kvuli Blended. 
            //this.result.s = c ? this.scoreWeight : 0;
            if (c) {
                this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate;
            }
            else {
                this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate) & CourseModel.CourseDataFlag.all;
            }
            //this.result.flag = !c ? 0 : CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.needsEval;
        };
        return humanEvalControlImpl;
    })(evalControlImpl);
    Course.humanEvalControlImpl = humanEvalControlImpl;
    function idToElement(id) { return $('#' + id).first(); }
    Course.idToElement = idToElement;
    function finishCreatePage(exImpl) { var page = exImpl.page; page.finishCreatePage(exImpl); return page; }
    Course.finishCreatePage = finishCreatePage;
    var Page = (function (_super) {
        __extends(Page, _super);
        function Page() {
            _super.apply(this, arguments);
            this.tags = {}; //all named tags
        }
        Page.prototype.isPassivePage = function () { return this.isOldEa ? this.oldEaIsPassive : !this.evalPage || this.evalPage.maxScore == 0; };
        Page.prototype.finishCreatePage = function (userData) {
            var _this = this;
            //finishCreatePage(userData: CourseMeta.IExUser) {
            _super.prototype.pageCreated.call(this);
            this.result = userData;
            //nalezni vsechny controls
            var res = [];
            scan(this, res);
            _.each(this.propertyTags, function (t) { return scan(t, res); });
            this.items = _.filter(res, function (t) { return t.isCtrl && t.isCtrl(); });
            this.sndPage.allMediaTags = _.filter(res, function (t) { return t.isMedia && t.isMedia(); });
            _.each(res, function (t) { if (t.id)
                _this.tags[t.id] = t; });
            //dokonci vytvoreni kontrolek
            _.each(res, function (c) { if (c.pageCreated)
                c.pageCreated(); });
        };
        Page.prototype.callInitProcs = function (phase, completed) {
            var _this = this;
            //synchronni init akce
            _.each(_.filter(this.items, function (ctrl) { return ctrl.initProc(phase, true, null) == initPhaseType.sync; }), function (ctrl) { return ctrl.initProc(phase, false, null); });
            //asynchronni init akce
            var promises = _.compact(_.map(_.filter(this.items, function (ctrl) { return ctrl.initProc(phase, true, null) == initPhaseType.async; }), function (ctrl) {
                var defered = $.Deferred();
                ctrl.initProc(phase, false, defered.resolve);
                return defered.promise();
            }));
            $.whenall(promises).done(function () {
                if (phase == initPhase.afterRender2)
                    Course.edit.adjustSmartWidths(_this);
                completed();
            });
        };
        /*** IScoreProvider ***/
        Page.prototype.provideData = function (allData) {
            //_.each(this.evalItems, ctrl => ctrl.provideData(allData[ctrl.id]));
            this.evalPage.provideData();
        };
        Page.prototype.acceptData = function (done, allData) {
            this.evalPage.acceptData(done);
            //readonly a skip-eval kontrolky
            this.processReadOnlyEtc(done, false);
        };
        Page.prototype.resetData = function (allData) {
            this.evalPage.resetData();
        };
        Page.prototype.getScore = function () { return this.evalPage.getScore(); }; // getORScore(this.evalItems); }
        Page.prototype.processReadOnlyEtc = function (done, provideData) {
            _.each(_.filter(this.items, function (it) { return it.isEval(); }), function (ev) {
                if (!ev.isReadOnly() && !ev.isSkipEvaluation())
                    return;
                if (provideData && ev.isSkipEvaluation())
                    ev.provideData();
                ev.acceptData(ev.isReadOnly() || done);
            });
        };
        return Page;
    })(tagImpl);
    Course.Page = Page;
    function finishTag(data) {
        switch (data._tg) {
            //case CourseModel.ta: var a = <CourseModel.a>data; if (a.href) a.href = a.href.toLowerCase(); break;
            case CourseModel.tp:
                var p = data;
                p._tg = CourseModel.tdiv;
                if (!p['class'])
                    p['class'] = [];
                else if (_.any(p['class'], function (c) { return c.indexOf('oli-par') == 0; }))
                    break;
                p['class'].push('oli-par');
                break; //knockout error, viz http://stackoverflow.com/questions/18869466/knockout-bug-cannot-match-comment-end
        }
    }
    ;
    var tag_helper = (function () {
        function tag_helper() {
        }
        tag_helper.prototype.c_unescape = function (data) {
            //if (data.indexOf('<') > 0 || data.indexOf('>') > 0)
            //  return data.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')
            //else
            return data;
        };
        tag_helper.prototype.c_isCtrl = function (data) {
            if (_.isString(data))
                return false;
            return data.isCtrl && data.isCtrl();
        };
        tag_helper.prototype.c_tagstart = function (data) {
            try {
                if (data._tg == CourseModel.tnode)
                    return '';
                var sb = [];
                finishTag(data);
                sb.push("<" + data._tg);
                for (var p in data) {
                    if (p == 'Items' || p.charAt(0) == '_')
                        continue;
                    //Muze atribut zacinat velkym pismenem? Dej exception.
                    var firstCh = p.charAt(0);
                    if (firstCh != firstCh.toLowerCase())
                        throw 'something wrong'; //continue;
                    var val = data[p];
                    if (_.isFunction(val))
                        continue;
                    sb.push(' ' + p + '="' + (p == 'class' ? val.join(' ') : val) + '"');
                }
                sb.push(openCloseTags[data._tg] ? "/>" : ">");
                return sb.join('');
            }
            catch (msg) {
                debugger;
                throw msg;
            }
        };
        tag_helper.prototype.cT = function (data) {
            try {
                if (_.isString(data))
                    return JsRenderTemplateEngine.tmpl('c_textnew');
                //var st = CourseModel.meta.types[data.tg].st; 
                var tmpl;
                if (CourseModel.hasStatus(data, CourseModel.tgSt.jsCtrl))
                    tmpl = "c_" + Utils.toCammelCase(data._tg);
                else
                    tmpl = 'c_tag';
                return JsRenderTemplateEngine.tmpl(tmpl);
            }
            catch (msg) {
                debugger;
                throw msg;
            }
        };
        tag_helper.prototype.classes = function (data) {
            var clss = "oli-" + Utils.toCammelCase(data._tg);
            //_.each(CourseModel.ancestorsAndSelf(data.tg).reverse(), (t: string) => clss += "c-" + Utils.toCammelCase(t) + " ");
            clss += data['class'] ? " " + data['class'].join(' ') : "";
            return clss.toLowerCase();
        };
        tag_helper.prototype.c_tagend = function (data) {
            if (data._tg == CourseModel.tnode)
                return '';
            return openCloseTags[data._tg] ? '' : "</" + data._tg + ">";
        };
        return tag_helper;
    })();
    var openCloseTags = {};
    _.each([CourseModel.thr, CourseModel.tbr, CourseModel.timg], function (t) { return openCloseTags[t] = true; });
    //export function scan(dt: CourseModel.tag, action: (dt: CourseModel.tag) => void, cond: (dt: CourseModel.tag) => boolean = null): void {
    //  if (dt.Items) _.each(dt.Items, it => scan(it, action, cond));
    //  if (!cond || cond(dt)) action(dt);
    //}
    function scan(dt, res) {
        res.push(dt);
        _.each(dt.Items, function (it) { return scan(it, res); });
    }
    Course.scan = scan;
    function scanEx(dt, action) {
        if (!dt.Items)
            return;
        for (var i = 0; i < dt.Items.length; i++) {
            scanEx(dt.Items[i], action);
            action(dt, i);
        }
    }
    Course.scanEx = scanEx;
    function localize(pg, locProc) {
        pg.title = locProc(pg.title);
        pg.instrTitle = locProc(pg.instrTitle);
        scanEx(pg, function (parent, idx) {
            if (!parent.Items)
                return;
            var item = parent.Items[idx];
            //localize string
            if (_.isString(item)) {
                parent.Items[idx] = (locProc(item));
                return;
            }
            //localize pairing-item.right
            var pairItem = (item);
            if (pairItem._tg != CourseModel.tpairingItem)
                return;
            if (pairItem.right)
                pairItem.right = locProc(pairItem.right);
        });
    }
    Course.localize = localize;
    function getCourseAbsoluteUrl(rootUrl, url) {
        var parts = rootUrl.toLowerCase().split('/');
        parts[parts.length - 1] = url.toLowerCase();
        return Pager.basicUrl + "rwcourses/" + parts.join('/');
    }
    Course.getCourseAbsoluteUrl = getCourseAbsoluteUrl;
    $.views.helpers(new tag_helper());
    var writing = (function (_super) {
        __extends(writing, _super);
        function writing() {
            _super.apply(this, arguments);
        }
        return writing;
    })(evalControlImpl);
    Course.writing = writing;
    var speaking = (function (_super) {
        __extends(speaking, _super);
        function speaking() {
            _super.apply(this, arguments);
        }
        return speaking;
    })(evalControlImpl);
    Course.speaking = speaking;
    //var gf_normTable: { [charCode: number]: string; };
    //function normalizeChars(s: string) {
    //  if (_.isEmpty(s)) return s;
    //  if (gf_normTable == null) {
    //    gf_normTable = [];
    //    for (var i = 1; i < gf_nt.length; i += 2)
    //      gf_normTable[parseInt(gf_nt[i - 1])] = gf_nt[i];
    //  }
    //  for (var i = 0; i < s.length; i++) {
    //    var nw = gf_normTable[s.charCodeAt(i)];
    //    if (typeof (nw) != 'undefined') s = s.substring(0, i) + nw + s.substring(i + 1);
    //  }
    //  return s;
    //};
    function relevantChars(ch) {
        var nw = CourseModel.gaffFill_normTable[ch.charCodeAt(0)];
        if (nw)
            ch = nw;
        return Unicode.isLetter(ch) || Unicode.isNumber(ch);
    }
    //**** normalize GapFill string
    //algoritmus musi byt stejny s d:\LMCom\rew\ObjectModel\Model\CourseSchemaDOM.cs, public static string normalize(
    function normalize(value, caseSensitive) {
        if (caseSensitive === void 0) { caseSensitive = false; }
        if (_.isEmpty(value))
            return value;
        if (!caseSensitive)
            value = value.toLowerCase();
        var chars = value.split('');
        var res = [];
        var st = 0; //0..zacatek, 1..no space, 2..space 
        var charsNum = 0;
        var otherNum = 0;
        for (var i = 0; i < chars.length; i++) {
            var ch = chars[i];
            switch (st) {
                //case 0: if (!relevantChars(ch)) continue; st = 1; res.push(ch); break; //mezery na zacatku
                //case 1: if (relevantChars(ch)) { res.push(ch); continue; } st = 2; break; //nemezery 
                //case 2: if (!relevantChars(ch)) continue; st = 1; res.push(' '); res.push(ch); break; //mezery uprostred
                case 0:
                    if (!relevantChars(ch)) {
                        otherNum++;
                        continue;
                    }
                    st = 1;
                    charsNum++;
                    res.push(ch);
                    break; //mezery na zacatku
                case 1:
                    if (relevantChars(ch)) {
                        charsNum++;
                        res.push(ch);
                        continue;
                    }
                    otherNum++;
                    st = 2;
                    break; //nemezery 
                case 2:
                    if (!relevantChars(ch)) {
                        otherNum++;
                        continue;
                    }
                    st = 1;
                    res.push(' ');
                    res.push(ch);
                    break; //mezery uprostred
            }
        }
        if (charsNum <= 2 && otherNum >= charsNum)
            return value;
        return res.join('');
    }
    Course.normalize = normalize;
    var evalBtn = (function (_super) {
        __extends(evalBtn, _super);
        function evalBtn() {
            var _this = this;
            _super.apply(this, arguments);
            this.st = ko.observable('');
            this.click = function () {
                if (_this.pageDone())
                    return;
                _this.doneResult = !_this.doneResult;
                var btn = _this._myPage.evalPage.findBtn(_this);
                if (!btn)
                    return; //BT 2176
                var score = btn.click(_this.doneResult);
                if (_this.doneResult)
                    _this.scoreText(_this.scoreAsRatio ? score.s.toString() + '/' + score.ms.toString() : Math.round(100 * score.s / score.ms).toString() + '%');
                //var allData = this.myPage.result.result;
                //var myCtrls = _.filter(this.myPage.evalItems, c => (<evalControlImpl>c).evalBtnId == this.id);
                //_.each(myCtrls, ctrl => { //vsechny kontrolku z self eval grupy
                //  if (!this.doneResult) { //cilovy stav je Normal => reset
                //    ctrl.resetData(allData); // allData[ctrl.data.id] = ctrl.createResult(); ctrl.acceptData(false, ctrl.result);
                //  } else { //cilovy stav je doneResult => prevezmi data a zobraz vyhodnocenou kontrolku
                //    ctrl.provideData(ctrl.result);
                //    ctrl.acceptData(true, ctrl.result);
                //  }
                //});
                //if (this.doneResult) {
                //  var sc = getORScore(myCtrls);
                //  this.scoreText(Math.round(100 * sc.s / sc.ms).toString() + '%');
                //}
                _this.st(_this.doneResult ? 'evaluated' : 'no');
            };
            this.scoreText = ko.observable();
        }
        evalBtn.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: false }; };
        evalBtn.prototype.provideData = function () {
            if (this.pageDone())
                return;
            if (!this.result)
                this.result = this.createResult(false);
            this.result.Value = this.doneResult;
        };
        evalBtn.prototype.acceptData = function (pageDone) {
            this.doneResult = this.result && this.result.Value;
            if (pageDone)
                this.st('disabled');
            else
                this.st(this.doneResult ? 'evaluated' : 'no');
        };
        evalBtn.prototype.setScore = function () { this.result.ms = 0; this.result.s = 0; };
        return evalBtn;
    })(evalControlImpl);
    Course.evalBtn = evalBtn;
    var extensionImpl = (function (_super) {
        __extends(extensionImpl, _super);
        function extensionImpl() {
            _super.apply(this, arguments);
        }
        extensionImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            switch (this.data) {
                case 'chinh-speaking':
                    this.myExtension = new Course.chinhSpeaking(this);
                    break;
                case 'doc-reference':
                    this.myExtension = new docreference.ext(this);
                    break;
                default: throw this.data;
            }
            if (this.myExtension && this.myExtension.jsonMLParsed)
                this.myExtension.jsonMLParsed(this);
        };
        extensionImpl.prototype.createResult = function (forceEval) { return this.myExtension && this.myExtension.createResult ? this.myExtension.createResult(this, forceEval) : { ms: 0, s: 0, tg: this._tg, flag: 0, Value: null }; };
        extensionImpl.prototype.provideData = function () {
            if (this.myExtension && this.myExtension.provideData)
                this.myExtension.provideData(this);
        };
        extensionImpl.prototype.acceptData = function (pageDone) {
            if (this.myExtension && this.myExtension.acceptData)
                this.myExtension.acceptData(this, pageDone);
        };
        extensionImpl.prototype.setScore = function () { if (this.myExtension && this.myExtension.setScore)
            this.myExtension.setScore(this);
        else {
            this.result.ms = 0;
            this.result.s = 0;
        } ; };
        extensionImpl.prototype.pageCreated = function () { if (this.myExtension && this.myExtension.pageCreated)
            this.myExtension.pageCreated(this);
        else
            _super.prototype.pageCreated.call(this); };
        extensionImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            if (this.myExtension && this.myExtension.initProc)
                return this.myExtension.initProc(phase, getTypeOnly, completed);
            else
                return initPhaseType.no;
        };
        return extensionImpl;
    })(evalControlImpl);
    Course.extensionImpl = extensionImpl;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.ta, aImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.timg, imgImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tbody, Page);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tevalButton, evalBtn);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.textension, extensionImpl);
})(Course || (Course = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_course(msg) {
        Logger.trace("Course", msg);
    }
    Logger.trace_course = trace_course;
    function error_course(where, msg) {
        Logger.error("Sound", msg, where);
    }
    Logger.error_course = error_course;
    ;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var SoundNoop = null;
