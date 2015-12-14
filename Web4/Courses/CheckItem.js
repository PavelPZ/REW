var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Course;
(function (Course) {
    var checkItem = (function (_super) {
        __extends(checkItem, _super);
        function checkItem(data) {
            var _this = this;
            _super.call(this, data);
            this.yesClick = function () { return _this.clickLow(true); };
            this.noClick = function () { return _this.clickLow(false); };
            this.click = function () { return _this.clickLow(); };
            this.clickLow = function (isYes) {
                if (_this.yes() || _this.no()) {
                    _this.yes(!_this.yes());
                    _this.no(!_this.no());
                }
                else if (isYes === true) {
                    _this.yes(true);
                    _this.no(false);
                }
                else if (isYes === false) {
                    _this.yes(false);
                    _this.no(true);
                }
                else {
                    _this.yes(true);
                    _this.no(false);
                }
            };
            this.yes = ko.observable(false);
            this.no = ko.observable(false);
            this.yesEval = ko.observable('');
            this.noEval = ko.observable('');
            if (this.readOnly || this.skipEvaluation) {
                this.result = this.createResult(false);
            }
            if (!this.textType)
                data.textType = this.textType = CourseModel.CheckItemTexts.yesNo;
            var txt;
            switch (data.textType) {
                case CourseModel.CheckItemTexts.yesNo:
                    txt = CSLocalize('88d6dd9f77994a68a8035f5809c24703', 'Yes|No');
                    break;
                case CourseModel.CheckItemTexts.trueFalse:
                    txt = CSLocalize('7f51a49e0ad14a848362eb7282d62116', 'True|False');
                    break;
                default:
                    txt = null;
                    break;
            }
            if (txt) {
                this.textTypeAsStr = CourseModel.CheckItemTexts[data.textType].toLowerCase();
                var txts = txt.split('|');
                this.trueText = txts[0];
                this.falseText = txts[1];
            }
        }
        checkItem.prototype.createResult = function (forceEval) {
            this.done(false);
            return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? (this.correctValue ? true : false) : undefined };
        };
        checkItem.prototype.provideData = function () {
            if (this.done())
                return;
            if (this.yes())
                this.result.Value = true;
            else if (this.no())
                this.result.Value = false;
            else
                this.result.Value = undefined;
        };
        checkItem.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            //this.isSkipEvaluation sdili s readonly modem stav done
            if (this.readOnly || (done && this.skipEvaluation)) {
                var val = this.readOnly ? this.initValue : this.boolTothreeState(this.result.Value);
                this.yes(val == CourseModel.threeStateBool.true);
                this.no(val == CourseModel.threeStateBool.false);
                this.yesEval(val == CourseModel.threeStateBool.true ? "black" : "no");
                this.noEval(val == CourseModel.threeStateBool.false ? "black" : "no");
                return;
            }
            if (this.done()) {
                var corrv = this.correctValue ? true : false;
                this.yesEval(this.evalStyle(true, this.result.Value === true, corrv));
                this.noEval(this.evalStyle(false, this.result.Value === false, corrv));
                this.yes(corrv);
                this.no(!corrv);
            }
            else {
                //this.isSkipEvaluation sdili s normalnim modem stav !done
                if (this.result.Value != undefined) {
                    this.yes(this.result.Value);
                    this.no(!this.result.Value);
                }
                else {
                    this.yes(this.initValue == CourseModel.threeStateBool.true);
                    this.no(this.initValue == CourseModel.threeStateBool.false);
                }
            }
        };
        checkItem.prototype.boolTothreeState = function (bool) {
            if (bool === undefined)
                return CourseModel.threeStateBool.no;
            else if (bool === true)
                return CourseModel.threeStateBool.true;
            else
                return CourseModel.threeStateBool.false;
        };
        checkItem.prototype.isCorrect = function () {
            var corrv = this.correctValue === true;
            return this.result.Value === corrv;
        };
        checkItem.prototype.isReadOnly = function () { return this.readOnly; };
        checkItem.prototype.isSkipEvaluation = function () { return this.skipEvaluation; };
        checkItem.prototype.evalStyle = function (isYesPart, partIsChecked, correctValue) {
            if (isYesPart) {
                if (partIsChecked)
                    return correctValue ? "black" : "strike";
                else
                    return correctValue ? "red" : "no";
            }
            else {
                if (partIsChecked)
                    return correctValue ? "strike" : "black";
                else
                    return correctValue ? "no" : "red";
            }
        };
        checkItem.prototype.yesNoEval = function (val) { return this.yesEval() == val || this.noEval() == val; };
        return checkItem;
    })(Course.evalControlImpl);
    Course.checkItem = checkItem;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tcheckItem, checkItem);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tcheckBox, checkItem);
})(Course || (Course = {}));
