var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    (function (ordItemStatus) {
        ordItemStatus[ordItemStatus["no"] = 0] = "no"; /*nezarazene*/
        ordItemStatus[ordItemStatus["fake"] = 1] = "fake"; /*posledni fake item, kvul vlozeni na konec*/
        ordItemStatus[ordItemStatus["done"] = 2] = "done"; /*zarazene, nevybrane pro editaci*/
        ordItemStatus[ordItemStatus["edited"] = 3] = "edited"; /*vybrane pro editaci*/
    })(Course.ordItemStatus || (Course.ordItemStatus = {}));
    var ordItemStatus = Course.ordItemStatus;
    var orderItem = (function (_super) {
        __extends(orderItem, _super);
        function orderItem() {
            _super.apply(this, arguments);
        }
        orderItem.prototype.click = function () {
            var inSrc = this.inSrc();
            this.$self.detach();
            (inSrc ? this.owner.$destBlock : this.owner.$srcBlock).append(this.$self[0]);
        };
        orderItem.prototype.inSrc = function () {
            return this.$self[0].parentElement == this.owner.$srcBlock[0];
        };
        return orderItem;
    })(Course.tagImpl);
    Course.orderItem = orderItem;
    var ordering = (function (_super) {
        __extends(ordering, _super);
        function ordering() {
            _super.apply(this, arguments);
            this.evaluated = ko.observable(false);
        }
        ordering.prototype.initProc = function (phase, getTypeOnly, completed) {
            switch (phase) {
                case Course.initPhase.afterRender2:
                    if (!getTypeOnly) {
                        this.$srcBlock = $('#ordering-' + this.id + ' .src-block');
                        this.$destBlock = $('#ordering-' + this.id + ' .dest-block');
                        _.each(_.zip(this.$srcBlock.children('div').toArray(), this.randomItems), function (arr) { return arr[1].$self = $(arr[0]); });
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        ordering.prototype.initRandomize = function () {
            var _this = this;
            var cnt = 0;
            _.each(this.Items, function (it) { it.idx = cnt++; it.owner = _this; });
            var rnd = Utils.randomizeArray(_.range(this.Items.length));
            this.randomItems = _.map(rnd, function (i) { return (_this.Items[i]); });
        };
        ordering.prototype.dones = function () {
            var _this = this;
            if (!this.$destBlock)
                return [];
            return _.filter(_.map(this.$destBlock[0].children, function (ch) { return _.find(_this.Items, function (it) { return it.$self[0] == ch; }); }), function (it) { return !!it; });
        };
        ordering.prototype.createResult = function (forceEval) {
            return {
                ms: 0, s: 0,
                tg: this._tg,
                flag: 0,
                indexes: forceEval ? _.range(this.randomItems.length) : [] //_.map(this.randomItems, it => it.idx)
            };
        };
        ordering.prototype.isCorrect = function () {
            return this.isCorrectEx().isCorrect;
        };
        ordering.prototype.isCorrectEx = function () {
            var res = { isCorrect: false, dones: null };
            res.dones = this.dones();
            if (res.dones.length != this.Items.length)
                return res;
            for (var i = 0; i < res.dones.length; i++)
                if (res.dones[i].idx != i)
                    return res;
            res.isCorrect = true;
            return res;
        };
        ordering.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            try {
                if (!this.result.indexes || this.result.indexes.length == 0)
                    return;
                _.each(this.result.indexes, function (idx) { if (_this.Items[idx].inSrc())
                    _this.Items[idx].click(); });
            }
            finally {
                this.evaluated(done);
            }
        };
        ordering.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.indexes = _.map(this.dones(), function (it) { return it.idx; });
        };
        return ordering;
    })(Course.evalControlImpl);
    Course.ordering = ordering;
    var orderWordItem = (function (_super) {
        __extends(orderWordItem, _super);
        function orderWordItem() {
            _super.apply(this, arguments);
        }
        return orderWordItem;
    })(orderItem);
    Course.orderWordItem = orderWordItem;
    var wordOrdering = (function (_super) {
        __extends(wordOrdering, _super);
        function wordOrdering() {
            _super.apply(this, arguments);
            this.user = ko.observable('');
            this.evalStatus = ko.observable('');
        }
        wordOrdering.prototype.pageCreated = function () {
            this.Items = _.map(this.correctOrder.split('|'), function (txt) {
                var res = new orderWordItem();
                var parts = txt.split('#');
                res.text = parts[0];
                res.evalText = parts[parts.length == 2 ? 1 : 0];
                return res;
            });
            this.teacher = _.map(this.Items, function (it) { return it.evalText; }).join(' ');
            this.initRandomize();
            _super.prototype.pageCreated.call(this);
        };
        wordOrdering.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            if (!done)
                return;
            var corr = this.isCorrectEx();
            this.user(corr.isCorrect ? this.teacher : _.map(corr.dones, function (it) { return it.text; }).join(' '));
            this.evalStatus(corr.isCorrect ? 'eval-green' : (corr.dones.length == 0 ? 'eval-red' : 'eval-strike'));
        };
        return wordOrdering;
    })(ordering);
    Course.wordOrdering = wordOrdering;
    var orderSentenceItem = (function (_super) {
        __extends(orderSentenceItem, _super);
        function orderSentenceItem() {
            _super.apply(this, arguments);
            this.evalStatus = ko.observable('');
            this.teacher = ko.observable('');
        }
        return orderSentenceItem;
    })(orderItem);
    Course.orderSentenceItem = orderSentenceItem;
    var sentenceOrdering = (function (_super) {
        __extends(sentenceOrdering, _super);
        function sentenceOrdering() {
            _super.apply(this, arguments);
        }
        sentenceOrdering.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            _.each(this.Items, function (it) { return it.text = (it.Items[0]); });
            this.initRandomize();
        };
        sentenceOrdering.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            if (!done)
                return;
            var corr = this.isCorrectEx();
            //jiz pretazene
            for (var i = 0; i < corr.dones.length; i++) {
                var it = (corr.dones[i]);
                it.teacher(this.Items[i].text);
                it.evalStatus(it.idx == i ? 'eval-green' : 'eval-strike');
            }
            //nepretazene
            var lastIdx = corr.dones.length;
            var noDones = _.filter(this.Items, function (it) { return _.all(corr.dones, function (d) { return d != it; }); });
            _.each(noDones, function (nd) { nd.click(); nd.evalStatus('eval-red'); nd.teacher(_this.Items[lastIdx++].text); });
        };
        return sentenceOrdering;
    })(ordering);
    Course.sentenceOrdering = sentenceOrdering;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordOrdering, wordOrdering);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tsentenceOrdering, sentenceOrdering);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tsentenceOrderingItem, orderSentenceItem);
})(Course || (Course = {}));
