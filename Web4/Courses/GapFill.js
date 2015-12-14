var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Course;
(function (Course) {
    var c_used = "used";
    var fakeEdit = '???ignore???';
    var edit = (function (_super) {
        __extends(edit, _super);
        function edit(staticData) {
            var _this = this;
            _super.call(this, staticData);
            this.onBehav = ko.observable(null); //pro isExchangeable evalGroup: tento edit control se chova jako onBehav edit control (vypocet isCorrect a hodnota teacher)
            this.user = ko.observable('');
            this.teacher = ko.computed(function () { var th = _this.onBehav(); return th ? th.getTeacher() : ''; });
            this.st = ko.observable('');
            if (!this.correctValue)
                this.correctValue = '';
            else if (Utils.startsWith(this.correctValue, fakeEdit)) {
                this.isFakeEdit = true;
            }
            this.onBehav(this);
        }
        edit.prototype.getTeacher = function () { return ''; };
        edit.prototype.createResult = function (forceEval) { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.correctValue.split('|')[0] : "" }; };
        edit.prototype.setScore = function () {
            if (this.onBehav().isFakeEdit) {
                this.result.ms = 0;
                return;
            }
            _super.prototype.setScore.call(this);
        };
        edit.prototype.isCorrect = function () {
            if (this.isSkipEvaluation())
                return true;
            var res = this.doNormalize(this.result.Value);
            return _.any(this.onBehav().corrects, function (s) { return s == res; });
        };
        edit.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.Value = this.user();
            if (this.isSkipEvaluation())
                this.corrects = [this.result.Value]; //pro isSkipEvaluation je vse co se vyplni spravne
        };
        edit.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.user(this.result.Value);
            var val = this.doNormalize(this.result.Value);
            if (!this.done())
                this.st('edit');
            else if (this.isCorrect())
                this.st('ok');
            else
                this.st(!val || val == '' ? 'empty' : 'wrong');
        };
        edit.prototype.doNormalize = function (s) { return this.caseSensitive ? s : s.toLowerCase(); };
        edit.filter = function (ctrls) {
            return (_.filter(ctrls, function (c) { return c._tg == CourseModel.tgapFill || c._tg == CourseModel.tdropDown; }));
        };
        edit.adjustSmartWidths = function (pg) {
            var offers = (_.filter(pg.items, function (c) { return c._tg == CourseModel.toffering; }));
            var usedEdits = {};
            //zpracuj offering
            _.each(offers, function (off) {
                var both = _.partition(off.words.split('|'), function (w) { return w.length > 2 && w.charAt(0) == "#"; }); //rozdel words na id a word
                var words = both[1];
                var eds = (_.map(both[0], function (id) { return pg.tags[id.substr(1)]; })); //offering edits
                _.each(eds, function (ed) { return usedEdits[ed.id] = true; }); //edits hotovy
                //zjisti maximum z sirek
                var firstEd = true;
                var max = 0;
                _.each(eds, function (ed) {
                    var w = ed.smartWidthPropAction(undefined, firstEd ? words : null); //v prvnim edit se zpracuji i offering words
                    firstEd = false;
                    if (w > max)
                        max = w;
                });
                //dosat maximim z sirek
                _.each(eds, function (ed) { return ed.smartWidthPropAction(max); });
            });
            //zpracuj zbyle edits (s smartWidth i bez)
            var edits = (_.filter(pg.items, function (c) { return (c._tg == CourseModel.tgapFill || c._tg == CourseModel.tdropDown) && !usedEdits[c.id]; }));
            var grps = _.groupBy(edits, function (e) { return e.widthGroup; });
            for (var p in grps) {
                if (p == 'undefined') {
                    _.each(grps[p], function (ed) {
                        var w = ed.smartWidthPropAction(undefined);
                        if (w > 0)
                            ed.smartWidthPropAction(w);
                    });
                }
                else {
                    var eds = _.map(grps[p], function (ed) { return { ed: ed, width: ed.smartWidthPropAction(undefined) }; });
                    var max = _.max(eds, function (e) { return e.width; });
                    if (max.width > 0)
                        _.each(eds, function (e) { if (e.width >= 0)
                            e.ed.smartWidthPropAction(max.width); });
                }
            }
        };
        //vrati nebo nastavi spolecnou sirku
        edit.prototype.smartWidthPropAction = function (setw, offerWords) {
            if (offerWords === void 0) { offerWords = null; }
            var selfEl = this.selfElement();
            var isGapFill = this._tg == CourseModel.tgapFill;
            if (setw == undefined) {
                //if (selfEl.width() > 10) return -1; //odstraneno 19.5.2015, k cemu bylo?
                if (this.width > 0)
                    return this.width;
                var arr = this.correctValue.split('|');
                arr = _.map(arr, function (a) { return a.length == 1 ? 'x' : (a.length == 2 ? 'xx' : (a.length == 3 ? 'xxx' : a)); });
                if (isGapFill) {
                    var gp = this;
                    if (gp.initValue)
                        arr.push(gp.initValue);
                    if (gp.hint)
                        arr.push(gp.hint);
                }
                if (offerWords != null && offerWords.length > 0)
                    arr.pushArray(offerWords);
                var growby = 1;
                if (isGapFill) {
                    var charnum = _.max(arr, function (s) { return s.length; }).length;
                    if (charnum == 0)
                        return 20;
                    if (charnum == 1)
                        growby = 4;
                    else if (charnum == 2)
                        growby = 2;
                    else if (charnum == 3)
                        growby = 1.5;
                    else if (charnum < 5)
                        growby = 1.7;
                    else if (charnum < 10)
                        growby = 1.5;
                    else if (charnum < 15)
                        growby = 1.3;
                    else
                        growby = 1.2;
                }
                return Math.round(growby * Gui2.maxTextWidth(arr, selfEl));
            }
            else {
                var w = setw + (isGapFill ? 26 : 44);
                selfEl.css('width', w.toString() + 'px'); //nejaky bug, spatne se do sirky zapocitavaji padding a margin, jen ale po Eval x reset.
            }
        };
        return edit;
    })(Course.evalControlImpl);
    Course.edit = edit;
    var gapFill = (function (_super) {
        __extends(gapFill, _super);
        function gapFill(staticData) {
            var _this = this;
            _super.call(this, staticData);
            if (!this.initValue)
                this.initValue = '';
            if (this.readOnly || this.skipEvaluation) {
                this.correctValue = this.initValue;
                this.result = this.createResult(false);
            }
            this.corrects = _.map(this.correctValue.split('|'), function (s) { return _this.doNormalize(s); });
        }
        gapFill.prototype.getTeacher = function () { var res = this.correctValue.split('|')[0]; return Utils.startsWith(res, fakeEdit) ? '' : res; };
        gapFill.prototype.createResult = function (forceEval) {
            return {
                ms: 0, s: 0, tg: this._tg, flag: 0,
                Value: forceEval ? this.correctValue.split('|')[0] : this.initValue
            };
        };
        gapFill.prototype.doNormalize = function (s) { return Course.normalize(s, this.caseSensitive); };
        gapFill.prototype.isReadOnly = function () { return this.readOnly; };
        gapFill.prototype.isSkipEvaluation = function () { return this.skipEvaluation; }; // || this.onBehav().isFakeEdit; }
        return gapFill;
    })(edit);
    Course.gapFill = gapFill;
    var dropDown = (function (_super) {
        __extends(dropDown, _super);
        function dropDown(staticData) {
            var _this = this;
            _super.call(this, staticData);
            this.userText = ko.observable(''); //uzivatelem vybrany text
            this.click = function (data, ev) {
                clickedDropDown = _this;
                anim.toggleMenuLow(ev);
            }; //dragList.target = this; dragList.show(); } //klik na sipku u dragTarget slova
            this.corrects = this.gapFillLike ? _.map(this.correctValue.split('|'), function (s) { return _this.doNormalize(s); }) : ['#' + this.id];
            var self = this;
            this.user.subscribe(function (userVal) {
                if (_.isEmpty(userVal)) {
                    self.userText('');
                    return;
                } //odstraneni
                if (userVal[0] != '#') {
                    self.userText(userVal);
                    return;
                } //text
                self.userText(self.source.findDropDownViaId(userVal.substr(1)).getTeacher());
            });
        }
        dropDown.prototype.getTeacher = function () { return Utils.startsWith(this.correctValue, fakeEdit) ? '' : this.correctValue; };
        dropDown.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.corrects[0] : '' }; };
        dropDown.prototype.resetData = function (allData) {
            _super.prototype.resetData.call(this, allData);
            if (this.source)
                this.source.resetData();
        };
        return dropDown;
    })(edit);
    Course.dropDown = dropDown;
    var dragTarget = (function (_super) {
        __extends(dragTarget, _super);
        function dragTarget() {
            _super.apply(this, arguments);
        }
        return dragTarget;
    })(dropDown);
    Course.dragTarget = dragTarget;
    var offering = (function (_super) {
        __extends(offering, _super);
        function offering(staticData) {
            _super.call(this, staticData);
        }
        offering.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.beforeRender:
                    if (!getTypeOnly) {
                        this.edits = [];
                        this.wordItems = [];
                        var hasDropDown = false;
                        _.each(this.words.split('|'), function (w) {
                            if (w[0] == '#') {
                                var ed = (_this._myPage.tags[w.substr(1)]);
                                ed.widthGroup = '@sw-' + _this.id;
                                ed.source = _this;
                                hasDropDown = ed._tg == CourseModel.tdropDown && !ed.gapFillLike;
                                _this.edits.push(ed);
                                ed.source = _this;
                                if (!ed.isFakeEdit)
                                    _this.wordItems.pushArray(_.map(ed.correctValue.split('|'), function (c) { return new dragWord(hasDropDown ? ed : c); }));
                            }
                            else
                                _this.wordItems.push(new dragWord(w));
                        });
                        this.passive = !hasDropDown || this.mode == CourseModel.offeringDropDownMode.dropDownKeep;
                        if (this.passive)
                            this.wordItems = _.uniq(this.wordItems, function (w) { return w.title(); });
                        this.wordItems = _.sortBy(this.wordItems, function (wi) { return wi.title(); }); //BT 2168 
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        offering.prototype.resetData = function () { _.each(this.wordItems, function (w) { return w.st(''); }); };
        offering.prototype.findWordViaValue = function (value) { return _.isEmpty(value) ? null : _.find(this.wordItems, function (w) { return w.value() == value; }); };
        offering.prototype.findEditViaSelected = function (selected) { return _.isEmpty(selected) ? null : _.find(this.edits, function (ed) { return ed.user() == selected; }); };
        offering.prototype.findDropDownViaId = function (id) { return (_.find(this.edits, function (ed) { return ed.id == id; })); };
        return offering;
    })(Course.tagImpl);
    Course.offering = offering;
    var dragWord = (function () {
        function dragWord(content) {
            var _this = this;
            this.st = ko.observable(''); //'' nebo used
            this.click = function () {
                try {
                    var selected = _this.value();
                    if (clickedDropDown.source.passive) {
                        clickedDropDown.user(selected);
                        return;
                    }
                    var oldVal = clickedDropDown.user(); //obsah clicked dropdown
                    if (oldVal == selected) {
                        _this.st('');
                        clickedDropDown.user('');
                        return;
                    } //vybrano to same slovo => undo (zrus vyber)
                    //najdi dropdown, ktery ma vybrany selected word
                    var withSelected = clickedDropDown.source.findEditViaSelected(selected);
                    if (withSelected != null)
                        withSelected.user('');
                    //vrat doposud vybrane slovo v dragList.target mezi nepouzite
                    var oldWord = clickedDropDown.source.findWordViaValue(oldVal);
                    if (oldWord != null)
                        oldWord.st('');
                    //aktualizuje clicked dropdown a selected word status
                    clickedDropDown.user(selected); //pouzij newVal
                    _this.st(c_used);
                }
                finally {
                    anim.hideMenus(null);
                }
            };
            if (_.isString(content))
                this.word = content;
            else {
                this.myDropDown = content;
                this.myDropDown.myWord = this;
            }
        }
        dragWord.prototype.title = function () { return this.word ? this.word : this.myDropDown.teacher(); };
        dragWord.prototype.value = function () { return this.word ? this.word : '#' + this.myDropDown.id; };
        return dragWord;
    })();
    Course.dragWord = dragWord;
    var clickedDropDown;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.toffering, offering);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tgapFill, gapFill);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tdropDown, dropDown);
})(Course || (Course = {}));
