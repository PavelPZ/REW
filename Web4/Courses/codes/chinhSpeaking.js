var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Course;
(function (Course) {
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
            this.tasks = [
                new ch_listenAndTalkTask('part1-question1', 'p1-q1', 'p1-a1'),
                new ch_listenAndTalkTask('part1-question2', 'p1-q2', 'p1-a2'),
                new ch_listenAndTalkTask('part1-question3', 'p1-q3', 'p1-a3'),
                new ch_readAndTalkTask('part2-question', 'p2-q1', 'p2-a1'),
                new ch_readAndTalkTask('part3-question1', 'p3-q1', 'p3-a1'),
                new ch_listenAndTalkTask('part3-question2', 'p3-q2', 'p3-a2'),
                new ch_listenAndTalkTask('part3-question3', 'p3-q3', 'p3-a3'),
                new ch_listenAndTalkTask('part3-question4', 'p3-q4', 'p3-a4'),
                new ch_finish()
            ];
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
    var ch_task = (function () {
        function ch_task() {
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
            _super.call(this);
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
        function ch_readAndTalkTask(taskDivId, questId, recordId) {
            _super.call(this);
            this.taskDivId = taskDivId;
            this.questId = questId;
            this.recordId = recordId;
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
        function ch_listenAndTalkTask(taskDivId, questId, recordId) {
            _super.call(this);
            this.taskDivId = taskDivId;
            this.questId = questId;
            this.recordId = recordId;
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
