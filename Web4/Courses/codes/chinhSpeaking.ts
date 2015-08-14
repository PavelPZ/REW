module Course {

  export enum chinhTaskType {
    listen,
    read,
    finish,
  }


  export class chinhSpeaking implements IExtension {

    $modal: JQuery;
    tasks: Array<ch_task>;
    actTaskIdx = 0;
    remaining = ko.observable(0);
    done = ko.observable(false);
    actIdx = ko.observable(0);

    constructor(public control: extensionImpl) {
      extension = this;
      var tasks: Ich_tasks = control.cdata ? JSON.parse(control.cdata) : {};
      this.tasks = _.map(tasks.tasks, t => {
        switch (t.type) {
          case chinhTaskType.finish: return new ch_finish(t);
          case chinhTaskType.listen: return new ch_listenAndTalkTask(t);
          case chinhTaskType.read: return new ch_readAndTalkTask(t);
          default: throw 'not implemented';
        }
      });
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
    //instrRemaining = ko.observable('');

  }

  export var extension: chinhSpeaking;

  export interface Ich_tasks {
    tasks: Array<Ich_task>;
  }

  export interface Ich_task {
    type: chinhTaskType
  }

  export class ch_task implements Ich_task {

    type: chinhTaskType

    $instr: JQuery;
    rec: audioCaptureImpl;

    constructor(json: Ich_task) {
      if (json) for (var p in json) this[p] = json[p];
    }

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
    start() {
      extension.done(true);
      extension.runNext();
    }
  }

  export interface Ich_readAndTalkTask extends Ich_task {
    taskDivId: string;
    questId: string;
    recordId: string;
  }


  export class ch_readAndTalkTask extends ch_task implements Ich_readAndTalkTask {

    taskDivId: string;
    questId: string;
    recordId: string;

    $taskDiv: JQuery;

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

  export interface Ich_listenAndTalkTask extends Ich_task {
    taskDivId: string;
    questId: string;
    recordId: string;
  }

  export class ch_listenAndTalkTask extends ch_task implements Ich_listenAndTalkTask {

    taskDivId: string;
    questId: string;
    recordId: string;

    $instr: JQuery;
    $taskDiv: JQuery;
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