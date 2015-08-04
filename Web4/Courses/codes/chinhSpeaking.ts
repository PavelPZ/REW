module Course {
  export class chinhSpeaking implements IExtension {

    $modal: JQuery;
    tasks: Array<ch_task>;
    actTaskIdx = 0;
    remaining = ko.observable(0);
    done = ko.observable(false);
    actIdx = ko.observable(0);

    constructor(public control: extensionImpl) {
      extension = this;
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
    getTemplateId(): string { return 'chinhspeaking'; }
    initProc: (phase: initPhase, getTypeOnly: boolean, completed: () => void) => initPhaseType = (phase, getTypeOnly, completed) => {
      switch (phase) {
        case initPhase.afterRender:
          if (!getTypeOnly) {
            this.$modal = $('#chinh-speaking-dialog');
            this.$modal.click(() => false);
            this.$modal.modal({ backdrop: 'static', show: false, keyboard: false });
            _.each(this.$modal.find('.modal-body').children(), ch => $(ch).hide());
          }
          return initPhaseType.sync;
      }
      return initPhaseType.no;
    };

    jsonMLParsed: (self: extensionImpl) => void;
    provideData: (self: extensionImpl) => void;
    acceptData: (self: extensionImpl, pageDone: boolean) => void;
    setScore: (self: extensionImpl) => void;
    pageCreated: (self: extensionImpl) => void;
    createResult: (self: extensionImpl, forceEval: boolean) => CourseModel.extensionResult;

    run() {
      this.$modal.modal('show');
      setTimeout(() => this.tasks[0].start(), 1);
    }
    runNext() {
      extension.actTask().end();
      if (extension.actTaskIdx == extension.tasks.length - 1) {
        extension.$modal.modal('hide');
      } else {
        extension.actTaskIdx++;
        extension.actTask().start();
        extension.actIdx(extension.actTaskIdx);
      }
    }
    actTask(): ch_task { return extension.tasks[extension.actTaskIdx]; }

    instructionOK() { extension.actTask().instructionOK(); }

  }

  export var extension: chinhSpeaking;

  export class ch_task {

    $instr: JQuery;
    rec: audioCaptureImpl;

    start() { }
    end() { }
    instructionOK() { }
    record() {
      this.rec.record();
      this.$instr.hide();
      (this.$instr = $('#recording')).show();
      var now = new Date().getTime();
      var recTimer = setInterval(() => {
        if (new Date().getTime() - now < this.rec.limitMax * 1000) return;
        this.rec.stopRecording();
        clearInterval(recTimer);
        this.$instr.hide();
        (this.$instr = $('#saving-recording')).show();
        setTimeout(() => {
          this.$instr.hide();
          extension.runNext();
        }, 3000);
      }, 500);
    }
  }

  export class ch_finish extends ch_task {
    constructor() { super(); }
    start() {
      extension.done(true);
      extension.runNext();
    }
  }

  export class ch_readAndTalkTask extends ch_task {
    $taskDiv: JQuery;
    constructor(public taskDivId: string, public questId: string, public recordId: string) { super(); }
    start() {
      (this.$taskDiv = $('#' + this.taskDivId)).show();
      this.rec = <audioCaptureImpl>(extension.control._myPage.getItem(this.recordId));
      //extension.remaining(6);
      extension.remaining(60);
      (this.$instr = $('#thinking')).show();
      var timer = setInterval(() => {
        extension.remaining(extension.remaining() - 1);
        if (extension.remaining() > 0) return;
        clearInterval(timer);
        var mark: mediaBigMark = <mediaBigMark>(extension.control._myPage.getItem('gong'));
        mark.play();
        setTimeout(() => {
          $('#' + this.questId).hide();
          this.record();
        }, 1000);
      }, 1000);
    }
    end() {
      this.$taskDiv.hide();
    }
  }

  export class ch_listenAndTalkTask extends ch_task {
    $instr: JQuery;
    $taskDiv: JQuery;
    constructor(public taskDivId: string, public questId: string, public recordId: string) { super(); }
    start() {
      (this.$instr = $('#instruction1')).show();
    }
    end() {
      this.$taskDiv.hide();
    }
    instructionOK() {
      this.$instr.hide();
      (this.$instr = $('#playing-question')).show();
      var mark: mediaBigMark = <mediaBigMark>(extension.control._myPage.getItem(this.questId));
      this.rec = <audioCaptureImpl>(extension.control._myPage.getItem(this.recordId));
      mark.play();
      var timer = setInterval(() => {
        if (mark.active()) return;
        clearInterval(timer);
        this.$instr.hide();
        this.record();
      }, 500);
      (this.$taskDiv = $('#' + this.taskDivId)).show();
    }
  }

} 