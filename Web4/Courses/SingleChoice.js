var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Course;
(function (Course) {
    var radioEvalImpl = (function (_super) {
        __extends(radioEvalImpl, _super);
        function radioEvalImpl(staticData) {
            _super.call(this, staticData);
        }
        return radioEvalImpl;
    })(Course.evalControlImpl);
    Course.radioEvalImpl = radioEvalImpl;
    var radioButton = (function (_super) {
        __extends(radioButton, _super);
        function radioButton(staticData) {
            _super.call(this, staticData);
            this.selected = ko.observable(false);
            this.myCss = ko.observable('');
            if (this.readOnly || this.skipEvaluation) {
                this.correctValue = this.initValue;
                this.result = this.createResult(false);
            }
        }
        radioButton.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, isSelected: forceEval ? this.correctValue : this.initValue }; }; //inicializace objektu s vysledkem kontrolky
        radioButton.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            if (!done) {
                this.selected(this.result.isSelected);
                this.myCss('');
                return;
            }
            if (!!this.result.isSelected == !!this.correctValue)
                this.myCss(this.result.isSelected ? "black" : "no");
            else
                this.myCss(this.correctValue ? "red" : "strike");
        };
        radioButton.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.isSelected = this.selected();
            if (this.skipEvaluation)
                this.correctValue = this.result.isSelected; //pro isSkipEvaluation je vse co se vyplni spravne
        };
        radioButton.prototype.isCorrect = function () {
            return !!this.correctValue == !!this.result.isSelected;
        };
        radioButton.prototype.click = function () {
            var _this = this;
            if (this.pageDone())
                return;
            _.each(this.myEvalGroup, function (it) { return it.selected(_this == it); });
        };
        radioButton.prototype.isReadOnly = function () { return this.readOnly; };
        radioButton.prototype.isSkipEvaluation = function () { return this.skipEvaluation; };
        return radioButton;
    })(radioEvalImpl);
    Course.radioButton = radioButton;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tradioButton, radioButton);
    var wordSelectionLow = (function (_super) {
        __extends(wordSelectionLow, _super);
        function wordSelectionLow() {
            _super.apply(this, arguments);
        }
        wordSelectionLow.prototype.click_item = function (it) { };
        return wordSelectionLow;
    })(radioEvalImpl);
    Course.wordSelectionLow = wordSelectionLow;
    var wordSelection = (function (_super) {
        __extends(wordSelection, _super);
        function wordSelection(data) {
            var _this = this;
            _super.call(this, data);
            var words = this.words.split('|');
            this.correctValue = -1;
            for (var i = 0; i < words.length; i++)
                if (words[i].charAt(0) == '#') {
                    this.correctValue = i;
                    break;
                }
            var cnt = 0;
            //###jsonML
            this.items = _.map(words, 
            //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
            function (w) { return new choiceItem(w.replace(/^#/, ''), _this, cnt++); });
        }
        wordSelection.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.correctValue : -1 }; }; //inicializace objektu s vysledkem kontrolky
        wordSelection.prototype.provideData = function () {
            if (this.done())
                return;
            var actItem = _.find(this.items, function (it) { return it.selected(); });
            this.result.Value = actItem == null ? -1 : actItem.selfIdx;
        };
        wordSelection.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            var corr = this.correctValue;
            _.each(this.items, function (it) { return it.acceptItemData(_this.done(), corr, _this.result.Value); });
        };
        wordSelection.prototype.isCorrect = function () {
            var actItem = _.find(this.items, function (it) { return it.selected(); });
            if (this.correctValue == -1)
                return !actItem;
            else
                return actItem != null && actItem.selfIdx == this.correctValue;
        };
        wordSelection.prototype.click_item = function (it) {
            if (this.pageDone())
                return;
            _.each(this.myEvalGroup || [this], function (grp) { return _.each(grp.items, function (t) {
                if (t == it)
                    t.selected(!t.selected());
                else
                    t.selected(false);
            }); });
        };
        return wordSelection;
    })(wordSelectionLow);
    Course.wordSelection = wordSelection;
    var wordMultiSelection = (function (_super) {
        __extends(wordMultiSelection, _super);
        function wordMultiSelection(data) {
            var _this = this;
            _super.call(this, data);
            var words = this.words.split('|');
            this.correctValues = [];
            for (var i = 0; i < words.length; i++)
                if (words[i].charAt(0) == '#')
                    this.correctValues.push(i);
            var cnt = 0;
            //###jsonML
            this.items = _.map(words, 
            //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
            function (w) { return new choiceItem(w.replace(/^#/, ''), _this, cnt++); });
        }
        wordMultiSelection.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Values: forceEval ? this.correctValues : [] }; }; //inicializace objektu s vysledkem kontrolky
        wordMultiSelection.prototype.provideData = function () {
            var _this = this;
            if (this.done())
                return;
            this.result.Values = [];
            _.each(this.items, function (it) { if (!it.selected())
                return; _this.result.Values.push(it.selfIdx); });
        };
        wordMultiSelection.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            _.each(this.items, function (it) {
                var corr = _.contains(_this.correctValues, it.selfIdx) ? it.selfIdx : -1;
                var res = _.contains(_this.result.Values, it.selfIdx) ? it.selfIdx : -1;
                it.acceptItemData(_this.done(), corr, res);
            });
        };
        wordMultiSelection.prototype.isCorrect = function () {
            var union = _.union(this.correctValues, this.result.Values);
            return union.length == this.correctValues.length && union.length == this.result.Values.length;
        };
        wordMultiSelection.prototype.click_item = function (it) {
            if (this.pageDone())
                return;
            it.selected(!it.selected());
        };
        return wordMultiSelection;
    })(wordSelectionLow);
    Course.wordMultiSelection = wordMultiSelection;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordSelection, wordSelection);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordMultiSelection, wordMultiSelection);
    var choiceItem = (function () {
        function choiceItem(content, _owner, selfIdx) {
            this.content = content;
            this._owner = _owner;
            this.selfIdx = selfIdx;
            this.selected = ko.observable(false);
            this.myCss = ko.observable('');
        }
        choiceItem.prototype.acceptItemData = function (done, correctIdx, userSelectedIdx) {
            if (!done) {
                this.selected(userSelectedIdx == this.selfIdx);
                this.myCss('');
                return;
            }
            this.selected(this.selfIdx == userSelectedIdx);
            if (correctIdx == userSelectedIdx)
                this.myCss(this.selfIdx == correctIdx ? "black" : "no");
            else
                this.myCss(this.selfIdx == correctIdx ? "red" : (this.selfIdx == userSelectedIdx ? "strike" : "no"));
        };
        choiceItem.prototype.click = function () { this._owner.click_item(this); };
        return choiceItem;
    })();
    Course.choiceItem = choiceItem;
})(Course || (Course = {}));
