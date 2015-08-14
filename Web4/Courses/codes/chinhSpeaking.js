var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    (function (chinhTaskType) {
        chinhTaskType[chinhTaskType["listen"] = 0] = "listen";
        chinhTaskType[chinhTaskType["read"] = 1] = "read";
        chinhTaskType[chinhTaskType["finish"] = 2] = "finish";
    })(Course.chinhTaskType || (Course.chinhTaskType = {}));
    var chinhTaskType = Course.chinhTaskType;
    var chinhSpeaking = (function () {
        function chinhSpeaking(control) {
            var _this = this;
            this.control = control;
            this.actTaskIdx = 0;
            this.remaining = ko.observable(0);
            this.done = ko.observable(false);
            this.actIdx = ko.observable(0);
            this.initProc = function (phase, getTypeOnly, completed) {
                switch (phase) {
                    case Course.initPhase.afterRender:
                        if (!getTypeOnly) {
                            _this.$modal = $('#chinh-speaking-dialog');
                            _this.$modal.click(function () { return false; });
                            _this.$modal.modal({ backdrop: 'static', show: false, keyboard: false });
                            _.each(_this.$modal.find('.modal-body').children(), function (ch) { return $(ch).hide(); });
                        }
                        return Course.initPhaseType.sync;
                }
                return Course.initPhaseType.no;
            };
            Course.extension = this;
            var tasks = control.cdata ? JSON.parse(control.cdata) : {};
            this.tasks = _.map(tasks.tasks, function (t) {
                switch (t.type) {
                    case chinhTaskType.finish: return new ch_finish(t);
                    case chinhTaskType.listen: return new ch_listenAndTalkTask(t);
                    case chinhTaskType.read: return new ch_readAndTalkTask(t);
                    default: throw 'not implemented';
                }
            });
        }
        chinhSpeaking.prototype.getTemplateId = function () { return 'chinhspeaking'; };
        chinhSpeaking.prototype.run = function () {
            var _this = this;
            this.$modal.modal('show');
            setTimeout(function () { return _this.tasks[0].start(); }, 1);
        };
        chinhSpeaking.prototype.runNext = function () {
            Course.extension.actTask().end();
            if (Course.extension.actTaskIdx == Course.extension.tasks.length - 1) {
                Course.extension.$modal.modal('hide');
            }
            else {
                Course.extension.actTaskIdx++;
                Course.extension.actTask().start();
                Course.extension.actIdx(Course.extension.actTaskIdx);
            }
        };
        chinhSpeaking.prototype.actTask = function () { return Course.extension.tasks[Course.extension.actTaskIdx]; };
        chinhSpeaking.prototype.instructionOK = function () { Course.extension.actTask().instructionOK(); };
        return chinhSpeaking;
    })();
    Course.chinhSpeaking = chinhSpeaking;
    Course.extension;
    var ch_task = (function () {
        function ch_task(json) {
            if (json)
                for (var p in json)
                    this[p] = json[p];
        }
        ch_task.prototype.start = function () { };
        ch_task.prototype.end = function () { };
        ch_task.prototype.instructionOK = function () { };
        ch_task.prototype.record = function () {
            var _this = this;
            this.rec.record();
            this.$instr.hide();
            (this.$instr = $('#recording')).show();
            var now = new Date().getTime();
            var recTimer = setInterval(function () {
                if (new Date().getTime() - now < _this.rec.limitMax * 1000)
                    return;
                _this.rec.stopRecording();
                clearInterval(recTimer);
                _this.$instr.hide();
                (_this.$instr = $('#saving-recording')).show();
                setTimeout(function () {
                    _this.$instr.hide();
                    Course.extension.runNext();
                }, 3000);
            }, 500);
        };
        return ch_task;
    })();
    Course.ch_task = ch_task;
    var ch_finish = (function (_super) {
        __extends(ch_finish, _super);
        function ch_finish() {
            _super.apply(this, arguments);
        }
        ch_finish.prototype.start = function () {
            Course.extension.done(true);
            Course.extension.runNext();
        };
        return ch_finish;
    })(ch_task);
    Course.ch_finish = ch_finish;
    var ch_readAndTalkTask = (function (_super) {
        __extends(ch_readAndTalkTask, _super);
        function ch_readAndTalkTask() {
            _super.apply(this, arguments);
        }
        ch_readAndTalkTask.prototype.start = function () {
            var _this = this;
            (this.$taskDiv = $('#' + this.taskDivId)).show();
            this.rec = (Course.extension.control._myPage.getItem(this.recordId));
            //extension.remaining(6);
            Course.extension.remaining(60);
            (this.$instr = $('#thinking')).show();
            var timer = setInterval(function () {
                Course.extension.remaining(Course.extension.remaining() - 1);
                if (Course.extension.remaining() > 0)
                    return;
                clearInterval(timer);
                var mark = (Course.extension.control._myPage.getItem('gong'));
                mark.play();
                setTimeout(function () {
                    $('#' + _this.questId).hide();
                    _this.record();
                }, 1000);
            }, 1000);
        };
        ch_readAndTalkTask.prototype.end = function () {
            this.$taskDiv.hide();
        };
        return ch_readAndTalkTask;
    })(ch_task);
    Course.ch_readAndTalkTask = ch_readAndTalkTask;
    var ch_listenAndTalkTask = (function (_super) {
        __extends(ch_listenAndTalkTask, _super);
        function ch_listenAndTalkTask() {
            _super.apply(this, arguments);
        }
        ch_listenAndTalkTask.prototype.start = function () {
            (this.$instr = $('#instruction1')).show();
        };
        ch_listenAndTalkTask.prototype.end = function () {
            this.$taskDiv.hide();
        };
        ch_listenAndTalkTask.prototype.instructionOK = function () {
            var _this = this;
            this.$instr.hide();
            (this.$instr = $('#playing-question')).show();
            var mark = (Course.extension.control._myPage.getItem(this.questId));
            this.rec = (Course.extension.control._myPage.getItem(this.recordId));
            mark.play();
            var timer = setInterval(function () {
                if (mark.active())
                    return;
                clearInterval(timer);
                _this.$instr.hide();
                _this.record();
            }, 500);
            (this.$taskDiv = $('#' + this.taskDivId)).show();
        };
        return ch_listenAndTalkTask;
    })(ch_task);
    Course.ch_listenAndTalkTask = ch_listenAndTalkTask;
})(Course || (Course = {}));
