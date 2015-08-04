var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    var pairing = (function (_super) {
        __extends(pairing, _super);
        function pairing() {
            _super.apply(this, arguments);
            this.leftSelected = ko.observable(false);
        }
        pairing.prototype.pageCreated = function () {
            var _this = this;
            _.each(this.Items, function (it) { return it.doRegisterControl(it); });
            var cnt = 0;
            var rnd = Utils.randomizeArray(_.range(this.Items.length));
            this.randomItems = _.map(rnd, function (i) { return (_this.Items[i]); });
            _super.prototype.pageCreated.call(this);
        };
        pairing.prototype.leftWidthCls = function () { return 'left-' + CourseModel.pairingLeftWidth[this.leftWidth]; };
        pairing.prototype.actItems = function () { return this.leftRandom ? this.randomItems : this.Items; };
        pairing.prototype.initProc = function (phase, getTypeOnly, completed) {
            switch (phase) {
                case Course.initPhase.afterRender2:
                    if (!getTypeOnly) {
                        //Nastaveni sirky prave strany jako rozdilu mezi MIN sirkou pairingu a sirkou prave strany (minus 145)
                        var strings = _.map(this.Items, function (it) { return it.right; });
                        var styleHolder = this.selfElement().find('.oli-edit .teacher').first();
                        var maxWidth = Gui2.maxTextWidth(strings, styleHolder);
                        this.selfElement().find('.pairing-item .left-content').width(maxWidth + 10); //145px je sirka pomocnych casti pairingu, bez leveho a praveho obsahu: 
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        pairing.prototype.createResult = function (forceEval) {
            return {
                ms: 0, s: 0,
                tg: this._tg,
                flag: 0,
                Value: forceEval ? _.range(this.Items.length) : _.map(this.randomItems, function (it) { return it.selfIdx; })
            };
        };
        pairing.prototype.setScore = function () {
            var v = this.result.Value;
            var cnt = 0;
            for (var i = 0; i < v.length; i++)
                if (i == v[i])
                    cnt++;
            var sw = this.scoreWeight ? this.scoreWeight : 100 * v.length;
            this.result.ms = sw;
            this.result.s = Math.round(sw / v.length * cnt);
        };
        pairing.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            _.each(this.Items, function (it) {
                it.ok(_this.done());
                it.result = { ms: 0, s: 0, tg: _this._tg, flag: 0, Value: _this.result.Value[it.selfIdx].toString() };
                it.acceptData(_this.done());
            });
        };
        pairing.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.Value = _.map(this.Items, function (it) { return parseInt(it.user()); });
        };
        pairing.prototype.select_left = function (it) {
            if (this.pageDone())
                return;
            this.leftSelected(true);
            _.each(this.Items, function (it) { return it.leftSelected(false); });
            it.leftSelected(true);
        };
        pairing.prototype.select_right = function (it) {
            if (this.pageDone() || !this.leftSelected())
                return;
            var leftSel = _.find(this.Items, function (it) { return it.leftSelected(); }); //levy vybrany na nastaveno leftSelected
            var itu = parseInt(it.user()); //co je nastaveno v pravem vybranem
            var rightSel = _.find(this.Items, function (it) { return it.selfIdx == itu; }); //najdi zdroj pro pravy vybrany
            //Vymena indexu
            var leftUser = leftSel.user();
            leftSel.user(rightSel.selfIdx.toString());
            it.user(leftUser);
            //spojnice
            it.ok(false);
            leftSel.ok(true);
            //pokud chybi pouze jedna spojnice, dopln ji.
            var notOk = null;
            var notOks = 0;
            _.each(this.Items, function (it) { if (it.ok())
                return; notOks++; notOk = it; });
            if (notOks == 1)
                notOk.ok(true);
            //globalni leftSelected stav
            this.leftSelected(false);
            _.each(this.Items, function (it) { return it.leftSelected(false); });
        };
        return pairing;
    })(Course.evalControlImpl);
    Course.pairing = pairing;
    var pairingItem = (function (_super) {
        __extends(pairingItem, _super);
        function pairingItem() {
            _super.apply(this, arguments);
            this.userText = ko.observable('');
            this.leftSelected = ko.observable(false);
            this.ok = ko.observable(false);
        }
        pairingItem.prototype.doRegisterControl = function (data) {
            var _this = this;
            this.selfIdx = _.indexOf(this._owner.Items, this);
            this.user.subscribe(function (val) { return _this.userText(_this._owner.Items[parseInt(val)].right); });
            this.teacherTxt = this.right;
            this.corrects = [this.selfIdx.toString()];
        };
        pairingItem.prototype.pageCreated = function () { };
        pairingItem.prototype.select_left = function () { this._owner.select_left(this); };
        pairingItem.prototype.select_right = function () { this._owner.select_right(this); };
        return pairingItem;
    })(Course.edit);
    Course.pairingItem = pairingItem;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tpairing, pairing);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tpairingItem, pairingItem);
})(Course || (Course = {}));
