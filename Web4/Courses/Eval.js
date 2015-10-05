var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Course;
(function (Course) {
    var _evalObj = (function (_super) {
        __extends(_evalObj, _super);
        function _evalObj() {
            _super.apply(this, arguments);
        }
        _evalObj.prototype.controlData = function (id) { return this._myPage.result.result[id]; };
        return _evalObj;
    })(Course.tagImpl);
    Course._evalObj = _evalObj;
    var evalPageImpl = (function (_super) {
        __extends(evalPageImpl, _super);
        function evalPageImpl() {
            _super.apply(this, arguments);
        }
        evalPageImpl.prototype.pageCreated = function () {
            var _this = this;
            _super.prototype.pageCreated.call(this);
            if (this.radioGroups) {
                //provazani radiobutton nebo wordSelection s radio grupou
                var radGrps = {};
                _.each(_.map(this.radioGroups.split('|'), function (str) { return str.split(':'); }), function (kv) { return radGrps[kv[0]] = _.map(kv[1].split(','), function (id) { return (_this._myPage.tags[id]); }); });
                _.each(radGrps, function (radios) { return _.each(radios, function (r) { return r.myEvalGroup = radios; }); });
            }
        };
        evalPageImpl.prototype.provideData = function () {
            _.each(this.Items, function (btn) { return btn.provideData(); }); //btn ma vlastni persistenci
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return grp.provideData(); }); }); //persistence podrizenych evalGroupImpl
        };
        evalPageImpl.prototype.acceptData = function (done) {
            _.each(this.Items, function (btn) { return btn.acceptData(done); });
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return grp.acceptData(done); }); });
        };
        evalPageImpl.prototype.resetData = function () {
            _.each(this.Items, function (btn) { return btn.resetData(); });
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return grp.resetData(); }); });
        };
        evalPageImpl.prototype.getScore = function () {
            var res = { ms: 0, s: 0, flag: 0 };
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return addORScore(res, grp.score()); }); });
            return res;
        };
        evalPageImpl.prototype.findBtn = function (b) {
            return _.find(this.Items, function (eb) { return eb.myBtn == b; });
        };
        return evalPageImpl;
    })(_evalObj);
    Course.evalPageImpl = evalPageImpl;
    var evalBtnImpl = (function (_super) {
        __extends(evalBtnImpl, _super);
        function evalBtnImpl() {
            _super.apply(this, arguments);
        }
        evalBtnImpl.prototype.pageCreated = function () {
            _super.prototype.pageCreated.call(this);
            this.myBtn = _.isEmpty(this.btnId) ? null : (this._myPage.tags[this.btnId]);
        };
        evalBtnImpl.prototype.provideData = function () { if (!this.myBtn)
            return; /*this.myBtn.result = this.controlData(this.btnId);*/ this.myBtn.doProvideData(); };
        evalBtnImpl.prototype.acceptData = function (done) { if (!this.myBtn)
            return; /*this.myBtn.result = this.controlData(this.btnId);*/ this.myBtn.acceptData(done); };
        evalBtnImpl.prototype.resetData = function () { if (!this.myBtn)
            return; this.myBtn.resetData(this._myPage.result.result); };
        evalBtnImpl.prototype.click = function (doneResult) {
            var _this = this;
            if (!this.myBtn)
                return null;
            _.each(this.Items, function (grp) {
                if (!doneResult) {
                    grp.resetData();
                    return null;
                }
                else {
                    grp.provideData();
                    var res = createORScoreObj(_.map(_this.Items, function (it) { return it.score(); }));
                    grp.acceptData(true);
                    return res;
                }
            });
            return doneResult ? createORScoreObj(_.map(this.Items, function (it) { return it.score(); })) : null;
        };
        return evalBtnImpl;
    })(_evalObj);
    Course.evalBtnImpl = evalBtnImpl;
    var evalGroupImpl = (function (_super) {
        __extends(evalGroupImpl, _super);
        function evalGroupImpl() {
            _super.apply(this, arguments);
            this.evalControls = [];
        }
        evalGroupImpl.prototype.pageCreated = function () {
            var _this = this;
            _super.prototype.pageCreated.call(this);
            this.evalControls = [];
            _.each(this.evalControlIds, function (t) {
                var ctrl = (_this._myPage.tags[t]);
                _this.evalControls.push(ctrl);
                //ctrl.myEvalGroup = this;
                ctrl.myEvalBtn = _this._owner.myBtn;
            });
        };
        evalGroupImpl.prototype.provideData = function () {
            _.each(this.evalControls, function (c) { return c.doProvideData(); });
            if (this.isExchangeable) {
                var res = this._myPage.result.result[this.id] = this.provideExchangeable();
                this.acceptExchangeable(res);
            }
        };
        evalGroupImpl.prototype.acceptData = function (done) {
            var _this = this;
            if (this.isExchangeable)
                this.acceptExchangeable(this.controlData(this.id));
            _.each(this.evalControls, function (c) { c.result = _this.controlData(c.id); c.acceptData(done); });
        };
        evalGroupImpl.prototype.resetData = function () {
            var _this = this;
            if (this.isExchangeable)
                delete this.controlData[this.id];
            _.each(this.evalControls, function (c) { return c.resetData(_this._myPage.result.result); });
            if (this.isExchangeable)
                this.provideExchangeable();
        };
        evalGroupImpl.prototype.score = function () {
            if (this.isAnd) {
                return createAndScoreObj(_.map(this.evalControls, function (c) { return c.result; }));
            }
            else {
                return createORScoreObj(_.map(this.evalControls, function (c) { return c.result; }));
            }
        };
        evalGroupImpl.prototype.acceptExchangeable = function (res) {
            if (!res || !res.onBehavMap)
                return;
            //adresar vsech eval group edits
            var edits = {};
            _.map(Course.edit.filter(this.evalControls), function (ed) { return edits[ed.id] = ed; });
            //vypln editum jejich onBehav
            for (var p in res.onBehavMap) {
                if (!edits[p]) {
                    delete res.onBehavMap;
                    _.each(edits, function (ed) { return ed.onBehav(ed); });
                    return;
                }
                edits[p].onBehav(edits[res.onBehavMap[p]]);
            }
        };
        evalGroupImpl.prototype.provideExchangeable = function () {
            var res = { tg: undefined, flag: 0, onBehavMap: {}, ms: 0, s: 0 };
            var edits = Course.edit.filter(this.evalControls);
            var isDropDown = edits[0]._tg == CourseModel.tdropDown && !(edits[0]).gapFillLike;
            var resultValue = function (ed) {
                if (!isDropDown)
                    return ed.result.Value;
                if (_.isEmpty(ed.result.Value))
                    return null;
                return ed.source.findDropDownViaId(ed.result.Value.substr(1)).correctValue;
            };
            //normalizovane uzivatelovy odpovedi
            var userVals = _.map(edits, function (e) { return { ed: e, val: resultValue(e), norm: isDropDown ? resultValue(e) : e.doNormalize(resultValue(e)) }; });
            //normalizovane spravne odpovedi
            var corrects = _.map(edits, function (e) { return { ed: e, vals: _.map(e.correctValue.split('|'), function (c) { return isDropDown ? c : e.doNormalize(c); }) }; });
            //jsou vsechny spravne odpovedi rozdilne?
            var corrAll = _.flatten(_.map(corrects, function (c) { return c.vals; }));
            if (_.uniq(corrAll).length < corrAll.length) {
                debugger;
                throw '_.uniq(corrAll).length < corrAll.length';
            }
            //sparovani spravnych odpoved
            for (var i = 0; i < userVals.length; i++) {
                var userVal = userVals[i];
                for (var j = 0; j < corrects.length; j++) {
                    var correct = corrects[j];
                    if (!correct || !_.any(correct.vals, function (v) { return v == userVal.norm; }))
                        continue; //uzivatelova odpoved v spravnych odpovedich nenalezena
                    res.onBehavMap[userVal.ed.id] = correct.ed.id; //nalezena => dosad do persistence
                    userVals[i] = null;
                    corrects[j] = null; //odstran uzivatelovu odpoved i nalezeny edit ze seznamu
                }
                ;
            }
            //pouziti spatnych odpovedi
            _.each(_.zip(_.filter(userVals, function (u) { return !!u; }), _.filter(corrects, function (u) { return !!u; })), function (uc) {
                var userVal = uc[0];
                var correct = uc[1];
                res.onBehavMap[userVal.ed.id] = correct.ed.id;
            });
            //je potreba znova spocitat score
            this.acceptExchangeable(res); //doplni onBehav
            _.each(this.evalControls, function (ctrl) { return ctrl.setScore(); }); //do vysledku dosadi score
            return res;
        };
        return evalGroupImpl;
    })(_evalObj);
    Course.evalGroupImpl = evalGroupImpl;
    //k SUM prida agregatabe priznaky
    function agregateFlag(sum, flag) {
        return sum | (flag & addAbleFlags) /*k sum prida addAbleTags z flag*/;
    }
    Course.agregateFlag = agregateFlag;
    //do SUM nastavi agregatabe priznaky
    function setAgregateFlag(sum, flag) {
        return (sum & ~addAbleFlags /*v sum vynuluje addAbleTags*/) | (flag & addAbleFlags /*prida addAbleTags z flag do sum*/);
    }
    Course.setAgregateFlag = setAgregateFlag;
    var addAbleFlags = CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments;
    function addORScore(res, sc) {
        res.ms += sc.ms;
        res.s += sc.s;
        res.flag = agregateFlag(res.flag, sc.flag);
    }
    function createORScoreObj(scs) {
        var res = { ms: 0, s: 0, flag: 0 };
        _.each(scs, function (sc) { return addORScore(res, sc); });
        return res;
    }
    function _createAndScoreObj(scs) {
        //var allOK = _.all(this.evalControls, ctrl => ctrl.result.ms == ctrl.result.s);
        //return { ms: 1, s: allOK ? 1 : 0, flag: 0 };
        var res = { ms: 1, s: 1, flag: 0 };
        var hasWrong = false;
        _.each(scs, function (sc) { hasWrong = hasWrong || sc.ms != sc.s; res.flag = agregateFlag(res.flag, sc.flag); });
        if (hasWrong)
            res.s = 0;
        return res;
    }
    function createAndScoreObj(scs) {
        var res = { ms: 0, s: 0, flag: 0 };
        var cnt = 0;
        _.each(scs, function (sc) { res.ms += sc.ms; res.s += sc.s; res.flag = agregateFlag(res.flag, sc.flag); cnt++; });
        var ok = res.ms == res.s;
        res.ms = Math.round(res.ms / cnt);
        res.s = ok ? res.ms : 0;
        return res;
    }
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalPage, evalPageImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalGroup, evalGroupImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalBtn, evalBtnImpl);
})(Course || (Course = {}));
