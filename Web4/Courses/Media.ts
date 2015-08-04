module Course {

  //********************************************* MEDIA controls GUI
  export class mediaActivable extends tagImpl { //spolecny predchudce vsech media GUI controls
    active = ko.observable(false);
  }

  export class mediaTagImpl extends mediaActivable implements CourseModel.mediaTag { //spolecny predchudce pro vse mimo replica a sentence
    _sentGroupId: string;
    loading = ko.observable(true);
    myGrp(): sndGroupImpl { return this._myPage.sndPage.grps[this._sentGroupId]; }
    playing = ko.observable(false);
  }

  export class mediaBigMark extends mediaTagImpl implements CourseModel.mediaBigMark {
    play() { if (this.loading()) return; this._myPage.sndPage.play(this._sentGroupId, -1); }
  }

  //ozvuceny text nebo dialog
  export class mediaText extends mediaTagImpl implements CourseModel.mediaText {
    constructor(data: CourseModel.mediaText) {
      if (!data.passive) data.passive = false;
      if (!data.hidden) data.hidden = false;
      //if (!data.inline) data.inline = false;
      super(data);
      if (this.passive) this.loading(false);
    }
    passive: boolean;
    isOldToNew: boolean;
    hidden: boolean;
    //inline: boolean;
    //obsolete
    continueId: string;
  }

  //video, vytvari driver na prehravani
  export class mediaVideo extends mediaTagImpl implements CourseModel.mediaVideo {
    ratioClass = ko.observable('');
  }

  export class mediaReplica extends mediaActivable implements CourseModel._mediaReplica {
    iconId: CourseModel.IconIds;
    actor: string;
    Items: Array<mediaSent>;
    _owner: mediaText;
    dlgLeft: boolean;
    css() { return (_.isString(this.iconId) ? <string><any>(this.iconId) : CourseModel.IconIds[this.iconId]) + " " + (this.dlgLeft ? "dlg-left" : "dlg-right"); }
  }

  export class mediaSent extends mediaActivable implements CourseModel._mediaSent {
    idx: number;
    mySent: sndSentImpl;
    myText(): mediaText { return <mediaText>(this._owner._tg == CourseModel.t_mediaReplica ? this._owner._owner : this._owner); }
    pageCreated() {
      super.pageCreated();
      this.mySent = this._myPage.sndPage.sents[this.idx];
      if (!this.mySent) return; //pro passivni mediaText
      this.mySent.myMediaSents.push(this); //provazani media - snd sentence
      if (!this.Items || this.Items.length == 0) this.Items = [<CourseModel.tag><any>(this.mySent.text)]; //naplneni obsahu mediaSent
    }
    play() { if (this.myText().loading() || this.myText().passive) return; var grp = this.mySent._owner._owner; grp._owner._owner.play(grp.id, this.mySent.begPos); } //play
  }

  //********************************************* SND HELPER OBJECTS

  export class sndFileGroupImpl extends tagImpl implements CourseModel._sndFileGroup {
    //audioUrl: string;
    mediaUrl: string; //v konstruktoru se rozdeli na videoUrl a videoFormat
    //videoFormat: string;
    //isVideo: boolean;
    Items: Array<sndGroupImpl>;
    _owner: sndPageImpl;
    videoRatio: string; //napr. 16by9
    videoFormat: string; //druha cast videoUrl
    duration: number;
    withoutCut: boolean; //soubor bez nastrihani

    //allUrl() { return this.mediaUrl; }// this.audioUrl ? this.audioUrl : this.videoUrl; }
    isVideo() { return this.videoFormat; }
    player: SndLow.MediaDriver; //spolecny player pro vsechny grupu stejneho souboru (pro zvukovy soubor). Pro video drzi kazda grupa svuj player 

    constructor(data: CourseModel.mediaText) {
      super(data);
      if (!this.mediaUrl) return
      var parts = this.mediaUrl.split('@');
      this.mediaUrl = parts[0];
      if (parts.length > 1) this.videoFormat = parts[1];
    }

    //vytvoreni html5 nebo SL driveru a naladovani media souboru
    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      switch (phase) {
        case initPhase.afterRender:
          if (!getTypeOnly) {
            if (this.isVideo()) {
              var allVids = <Array<mediaVideo>>(_.map(this.Items, gr => _.find(gr.myMediaTags, t => t._tg == CourseModel.tmediaVideo)));
              var vid = allVids[0];
              SndLow.createDriver(true, vid.id, '#' + vid.id, null, false, dr => { //vytvor jeho SL nebo HTML5 driver
                var grp = vid.myGrp(); grp._player = dr;
                this.adjustMediaUrl(dr); //spocti mediaUrl, videoRatio
                _.each(allVids, v => v.ratioClass('embed-responsive-' + this.videoRatio)); //nastav velikost videa na strance
                this.driverLoaded(dr,() => { //proved open media (=> naladovani dat do cache) a odblokovani media wait stavu media kontrolek
                  _.each(_.rest(allVids), subVid => SndLow.createDriver(true, subVid.id, '#' + subVid.id, null, false, subDr => { //drivery pro ostatni videa
                    var subGrp = subVid.myGrp(); subGrp._player = subDr;
                    subDr.openPlay(this.mediaUrl, -1, 0);
                  }));
                });
                completed();
              });
            } else
              SndLow.createDriver(false, this.Items[0].id, null, 'cls-audio-unvisible', false, dr => { this.player = dr; completed(); this.adjustMediaUrl(dr); this.driverLoaded(dr); });
          }
          return initPhaseType.async;
      }
      return super.initProc(phase, getTypeOnly, completed);
    }

    driverLoaded(dr: SndLow.MediaDriver, completed: () => void = null) {
      //return; //ladeni loading
      dr.openPlay(this.mediaUrl, -1, 0).done(() => {
        this.duration = dr.handler.duration;
        _.each(this.Items, grp => {
          //dosad duration do single sentence grupy (majici endPos=-1)
          if (grp.withoutCut)
            grp.Items[0].endPos = grp.Items[0].Items[0].endPos = this.duration * 1000;
          grp.loading = false;
          _.each(grp.myMediaTags, t => t.loading(false));
        });
        if (completed) completed();
      });
    }

    adjustMediaUrl(dr: SndLow.MediaDriver): void {
      if (this.medieUrlAdjusted) return;
      this.medieUrlAdjusted = true;
      var start = ((cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + this.mediaUrl).toLowerCase();

      //*** audio url
      if (!this.isVideo()) { this.mediaUrl = /*!Utils.endsWith(this.audioUrl, '.mp3') ? start + '.mp3' :*/ start; return; }

      //*** video url
      //potrebna extension
      var neededEx: string;
      switch (dr.type) {
        case LMComLib.SoundPlayerType.SL:
          neededEx = 'mp4'; break;
        case LMComLib.SoundPlayerType.HTML5:
          if (SndLow.html5_CanPlay(SndLow.media.video_mp4)) neededEx = 'mp4'; break;
          if (SndLow.html5_CanPlay(SndLow.media.video_webm)) neededEx = 'webm'; break;
          debugger; throw 'Can play neither mp4 nor webm';
        default: debugger; throw 'missing driver';
      }

      //dostupne extensions x size
      var parts = this.videoFormat.split(':');
      this.videoRatio = parts[0]; parts = parts[1].split('|');
      var sizeExt: Array<{ limit: number; ext: string; }> = [];
      _.each(parts, p => {
        var pparts = p.split('-');
        var availableExts = pparts[1].split(',');
        var ext = _.find(availableExts, e => Utils.endsWith(e, neededEx));
        if (!ext) return;
        sizeExt.push({ ext: ext, limit: pparts[0] == '*' ? 100000 : parseInt(pparts[0]) });
        return true;
      });
      if (sizeExt.length == 0) { debugger; throw 'cannot find extension for ext=' + neededEx; }

      //najdi optimalni extension dle limitu
      var docWidth = Math.min(10000, $(document).width());
      sizeExt = _.sortBy(sizeExt, s => s.limit);
      var res = _.find(sizeExt, se => docWidth <= se.limit);
      if (!res) res = sizeExt[sizeExt.length - 1];

      this.mediaUrl = start + '.' + res.ext;
    }
    medieUrlAdjusted = false;
  }

  export class sndGroupImpl extends tagImpl implements CourseModel._sndGroup {
    Items: Array<sndIntervalImpl>;
    _owner: sndFileGroupImpl;
    myMediaTags: Array<mediaTagImpl>;
    loading = true;
    withoutCut: boolean; //soubor bez nastrihani

    player(): SndLow.MediaDriver { return this._player ? this._player : this._owner.player; }
    _player: SndLow.MediaDriver;

    //notifikace o zmene pozice nebo aktualni sentence
    playProgress = ko.observable(0);
    actSent = ko.observable<sndSentImpl>(null);

    jsonMLParsed() {
      super.jsonMLParsed();
      //jedna grupa, interval i sentence s endPos==-1. Dosazeno v ObjectModel\Model\CourseSchemaDOM.cs, mediaTag.Generate
      this.withoutCut = this.Items.length == 1 && this.Items[0].Items.length == 1 && this.Items[0].Items[0].endPos == -1;
    }

    pageCreated() {
      super.pageCreated();
      this.myMediaTags = _.filter(this._owner._owner.allMediaTags, m => m._sentGroupId == this.id);
    }

  }

  export class sndIntervalImpl extends tagImpl implements CourseModel._sndInterval {
    //---
    begPos: number;
    endPos: number;
    Items: Array<sndSentImpl>;
    _owner: sndGroupImpl;
    jsonMLParsed() {
      super.jsonMLParsed();
      this.begPos = this.Items[0].begPos;
      this.endPos = this.Items[this.Items.length - 1].endPos;
    }
  }

  export class sndSentImpl extends tagImpl implements CourseModel._sndSent {
    idx: number;
    begPos: number;
    endPos: number;
    text: string;
    actor: string;
    //---
    _owner: sndIntervalImpl;
    myMediaSents: Array<mediaSent> = [];
  }

  export class writingImpl extends humanEvalControlImpl implements CourseModel.writing {
    constructor(staticData: CourseModel.writing) {
      super(staticData);
      if (!this.limitMin) this.limitMin = 0; if (!this.limitMax) this.limitMax = 0; if (!this.limitRecommend) this.limitRecommend = 0;
      if (!this.numberOfRows) this.numberOfRows = 5;
      if (this.limitRecommend < this.limitMin) this.limitRecommend = this.limitMin;
      this.progressBarFrom(!this.limitRecommend ? 0 : (!this.limitMax ? 100 : this.limitRecommend * 100 / this.limitMax));
      var self = this;
      this.textInput.subscribe(value => {
        var actMWords = _.filter(DictConnector.startSplitWord(value), w => !_.isEmpty(w.trim())).length;
        var words = Math.max(self.limitMin, self.limitMax); if (!words) words = 100;
        var txt = CSLocalize('b8c48a0294c149fabcf83d3098d0b7bd', 'written') + ' ' + Math.round(actMWords) + ' ' + CSLocalize('0ed651b15e15485bb16b9a8f6eba61eb', 'words');
        if (self.limitRecommend > 0 && self.limitMax > 0) txt += ' (' + CSLocalize('816063b2c5e248e98d782e6c72ccb0a7', 'minimum') + ' ' + self.limitRecommend.toString() + ', ' + CSLocalize('c33d47b0e8714300b2a0bbebb5dcc0c5', 'maximum') + ' ' + self.limitMax.toString() + ' ' + CSLocalize('876f5ad503044c2a988f59852eedbe03', 'words') + ')';
        else if (self.limitRecommend > 0) txt += ' (' + CSLocalize('6cfd3dde69134155b12a5613a2bd5e90', 'minimum') + ' ' + self.limitRecommend.toString() + ' ' + CSLocalize('1eec4e5b539348bca19de5d8849b8356', 'words') + ')';
        else if (self.limitMax > 0) txt += ' (' + CSLocalize('00c41ba93408472792afc9af724256eb', 'maximum') + ' ' + self.limitMax.toString() + ' ' + CSLocalize('acc174b843a1481b8a0dea1acee2f35f', 'words') + ')';
        self.progressText(txt);
        self.progressBarLimetExceeded(self.limitMax && actMWords > self.limitMax);
        if (!self.progressBarLimetExceeded() && actMWords > words) self.progressBarFrom(0);
        self.progressBarValue((actMWords > words ? actMWords % words : actMWords) / words * 100);
        self.result.text = value; self.result.words = actMWords;
      });

      //var self = this;
      //this.textInput = ko.computed({
      //  read: function () {
      //    return self.result ? self.result.text : '';
      //  },
      //  write: function (value) {
      //    var actMWords = _.filter(DictConnector.startSplitWord(value), w => !_.isEmpty(w.trim())).length;
      //    var words = Math.max(self.wordsMin, self.wordsMax); if (!words) words = 100;
      //    var txt = 'written ' + Math.round(actMWords) + ' words';
      //    if (self.wordsMin > 0 && self.wordsMax > 0) txt += ' (min ' + self.wordsMin.toString() + ', max ' + self.wordsMax.toString() + ' words)';
      //    else if (self.wordsMin > 0) txt += ' (min ' + self.wordsMin.toString() + ' words)';
      //    else if (self.wordsMax > 0) txt += ' (max ' + self.wordsMax.toString() + ' words)';
      //    self.progressText(txt);
      //    self.progressBarLimetExceeded(self.wordsMax && actMWords > self.wordsMax);
      //    if (!self.progressBarLimetExceeded() && actMWords > words) self.progressBarFrom(0);
      //    self.progressBarValue((actMWords > words ? actMWords % words : actMWords) / words * 100);
      //    self.result.text = value; self.result.words = actMWords;
      //  },
      //  owner: this,
      //  pure: true,
      //});
    }

    limitRecommend: number;
    limitMin: number;
    limitMax: number;
    numberOfRows: number;

    result: CourseModel.WritingResult;
    textInput = ko.observable<string>();

    //humanHelpTxt = ko.observable('');

    createResult(forceEval: boolean): CourseModel.WritingResult { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate, text: null, words: forceEval ? (this.limitMin ? this.limitMin : 0) : 0, hPercent: -1, hEmail: null, hDate: 0, hLmcomId: 0, hLevel: this.acTestLevel(), hRecommendMin: this.limitRecommend, hMax: this.limitMax, hMin: this.limitMin }; }
    provideData(): void { //predani dat z kontrolky do persistence
      //this.result.text = this.textInput();
      //this.result.humanPercent = this.human();
      //this.result.words = 
    }
    acceptData(done: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      this.textInput(this.result.text ? this.result.text : '');
      //var txt = this.result.text ? this.result.text : '';
      //$('#' + this.id).find('textarea').val(txt);
      //this.textInput(txt);
      this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
      var tostr = this.limitMax ? ' - ' + this.limitMax.toString() : '';
      this.humanHelpTxt(this.limitRecommend ? this.limitRecommend.toString() + tostr + ' / ' + this.result.words.toString() : '');
      this.humanLevel(this.result.hLevel);
      //this.textInput.evaluateImmediate();
      //this.textInput.valueHasMutated();
      //var t = this.textInput();
      //if (!t) return;
      //this.textInput.notifySubscribers();
      this.isDone(this.done());
    }
    setScore(): void {
      if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
        this.result.ms = this.scoreWeight;
        this.result.s = Math.round(this.result.hPercent);
        return;
      }
      var c = this.limitMin && (this.result.words >= this.limitMin); this.result.ms = this.scoreWeight;
      this.result.s = c ? this.scoreWeight : 0;
      if (c) this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate;
      else this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate) & CourseModel.CourseDataFlag.all;

      //this.result.flag = !c ? 0 : CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.needsEval;
    }

    progressBarValue = ko.observable(0);
    progressBarFrom = ko.observable(0);
    progressText = ko.observable('');
    progressBarLimetExceeded = ko.observable(false);

    isDone = ko.observable(false);

    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      switch (phase) {
        case initPhase.afterRender:
          if (!getTypeOnly) {
            var txt = $('#' + this.id).find('textarea');
            (<any>txt).autosize();
            this.adjustEvalForm();
          }
          return initPhaseType.sync;
      }
      return super.initProc(phase, getTypeOnly, completed);
    }
  }

  export class audioCaptureImpl extends humanEvalControlImpl implements CourseModel.recording {

    //data z XML
    recordInDialog: boolean;
    limitMin: number;
    limitRecommend: number;
    limitMax: number;
    dialogHeaderId: string;
    dialogSize: CourseModel.modalSize;
    singleAttempt: boolean;

    constructor(staticData: CourseModel.recording) {
      super(staticData);
      if (!this.singleAttempt) this.singleAttempt = false;
      if (!this.limitMin) this.limitMin = 0; if (!this.limitMax) this.limitMax = 0;
      if (this.limitMax && this.limitMax < this.limitMin) this.limitMax = this.limitMin;
      if (!this.limitRecommend) this.limitRecommend = 0;
      if (this.limitMin && this.limitRecommend < this.limitMin) this.limitRecommend = this.limitMin;
      //DEBUG
      //this.speakSecondsFrom = 10;
      //this.speakSecondsTo = 15;

      this.iconClass = ko.computed<string>(() => "fa-" + (this.recording() ? 'stop' : 'circle'));
      this.progressBarFrom(!this.limitRecommend ? 0 : (!this.limitMax ? 100 : this.limitRecommend * 100 / this.limitMax));
      this.progressBarValue = ko.computed<number>(() => {
        if (!this.recording()) return 0; //po this.driver.recordEnd(true) nize muze jeste prijit progressBarValue, coz vadi.
        var actMsecs = this.miliseconds();
        //vyprseni casu eTestMe sekce behem nahravani -> uloz vysledky a uzavri dialog
        if ((!this.limitMin || actMsecs >= this.limitMin * 1000) && testMe.notify && testMe.notify.active() && testMe.notify.remaindSeconds <= 3) {
          if (this.modalDialog) this.modalDialog.modal('hide');
          this.driver.recordEnd(true);
          return 100;
        }
        this.saveRecordingDisabled(this.limitMin && actMsecs < this.limitMin * 1000); //neni dosaeno speakSecondsFrom => disabled Save recording button
        if (this.limitMax && actMsecs >= this.limitMax * 1000) { //preteceno speakSecondsTo => konec nahravani
          if (this.modalDialog) this.modalDialog.modal('hide');
          this.driver.recordEnd(true);
          anim.alert().show(CSLocalize('9259ce32c3a14bb29b657b9430be2f83', 'Maximum time limit reached. Your recording was finished and saved.'), $.noop,() => anim.alert().isCancelVisible(false));
          return 100;
        }
        var msecs = Math.max(this.limitMin, this.limitMax) * 1000;
        if (!msecs) msecs = 60000;
        var txt = CSLocalize('94708246af584ffdacf8dd4c8c4521c8', 'recorded') + ' ' + Utils.formatTimeSpan(actMsecs / 1000);
        if (this.limitRecommend > 0 && this.limitMax > 0) txt += ' (' + CSLocalize('23aacf6c308d4ffa95fa6f9cad88285d', 'recommended') + ' ' + Utils.formatTimeSpan(this.limitRecommend) + ' - ' + Utils.formatTimeSpan(this.limitMax) + ')';
        else if (this.limitRecommend > 0) txt += ' (min ' + Utils.formatTimeSpan(this.limitRecommend) + ')';
        else if (this.limitMax > 0) txt += ' (max ' + Utils.formatTimeSpan(this.limitMax) + ')';
        this.progressText(txt);
        if (actMsecs > msecs) this.progressBarFrom(0);
        return (actMsecs > msecs ? actMsecs % msecs : actMsecs) / msecs * 100;
      });
    }

    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      switch (phase) {
        case initPhase.afterRender:
          if (!getTypeOnly) {
            if (this.recordInDialog) {
              this.modalDialog = $('#modal-' + this.id);
              this.modalContent = this.modalDialog.find('.modal-header');
              this.modalDialog.on('hide.bs.modal',() => {
                console.log('audioCaptureImpl: hide.bs.modal');
                anim.onModalHide(this.modalDialog);
                SndLow.Stop(null);
                delete audioCaptureImpl.activeAudioCapture;
              }).on('show.bs.modal',() => {
                console.log('audioCaptureImpl: show.bs.modal');
                anim.onModalShow(this.modalDialog);
                audioCaptureImpl.activeAudioCapture = this;
              });
              //this.modalDialog.modal({ backdrop: 'static', keyboard: true, show: false });
            }
            if (this.driver) { completed(); return; }
            SndLow.getGlobalMedia().adjustGlobalDriver(true,(dr, disabled) => {
              this.driver = dr;
              this.allDisabled(disabled);
              completed();
            });
            this.adjustEvalForm();
          }
          return initPhaseType.async;
      }
      return super.initProc(phase, getTypeOnly, completed);
    }


    static saveAudioAndHideModal(completed: () => void) {
      var act = audioCaptureImpl.activeAudioCapture;
      if (!act) { completed(); return; }
      act.driver.recordEnd(true);
      console.log('audioCaptureImpl: modalAudioDriver.recordEnd');
      setTimeout(completed, 500);
    }
    static activeAudioCapture: audioCaptureImpl;

    //modal dialog
    modalDialogSizeCss = () => { switch (this.dialogSize) { case CourseModel.modalSize.large: return 'modal-lg'; case CourseModel.modalSize.small: return 'modal-sm'; default: return ''; } };
    modalDialog: JQuery;
    modalContent: JQuery;

    //progress bar
    progressBarValue: KnockoutComputed<number>; //aktualni hodnota
    progressBarFrom = ko.observable(0); //hodnota minimalniho casu
    progressText = ko.observable(''); //text v baru
    progressBarLimetExceeded = ko.observable(false); //pro audioCapture nenastane - zobrazeni cervene pri prekroceni hodnoty

    driver: SndLow.MediaDriver; //globalni media driver
    allDisabled = ko.observable(true);

    //Eval control
    createResult(forceEval: boolean): CourseModel.audioCaptureResult { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: 0, audioUrl: createMediaUrl(this.id), recordedMilisecs: forceEval ? (this.limitMin ? this.limitMin * 1000 : 0) : 0, hPercent: -1, hEmail: null, hDate: 0, hLevel: this.acTestLevel(), hLmcomId: 0, hFrom: this.limitMin, hTo: this.limitMax, hRecommendFrom: this.limitRecommend }; }
    provideData(): void { //predani dat z kontrolky do persistence
    }
    acceptData(done: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      this.isRecorded(this.isRecordLengthCorrect());
      this.isDone(this.done());
      this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
      var tostr = this.limitMax ? ' - ' + Utils.formatTimeSpan(this.limitMax) : '';;
      this.humanHelpTxt(this.limitRecommend ? Utils.formatTimeSpan(this.limitRecommend) + tostr + ' / ' + Utils.formatTimeSpan(Math.round(this.result.recordedMilisecs / 1000)) : '');
      this.humanLevel(this.result.hLevel);
      //CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate
    }
    setScore(): void {
      if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
        this.result.ms = this.scoreWeight;
        this.result.s = Math.round(this.result.hPercent);
        return;
      }
      var c = this.isRecordLengthCorrect();
      this.result.ms = this.scoreWeight;
      this.result.s = c ? this.scoreWeight : 0;
      if (c) this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments;
      else this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments) & CourseModel.CourseDataFlag.all;
    }


    isRecordLengthCorrect(): boolean { return this.result.recordedMilisecs > 0 && (!this.limitMin || (this.result.recordedMilisecs >= this.limitMin * 1000)); } //pro 0 x 1 score
    result: CourseModel.audioCaptureResult;

    //stavove info
    saveRecordingDisabled = ko.observable(false);
    recording = ko.observable(false);
    miliseconds = ko.observable(0);
    playing = ko.observable(false);
    iconClass: KnockoutComputed<string>;
    isRecorded = ko.observable(false);
    isDone = ko.observable(false);

    private recorderSound: SndLow.recordedSound;
    setRecorderSound(recorderSound: SndLow.recordedSound): void {
      this.driver.openFile(null); //reset driveru
      if (this.recorderSound) this.recorderSound.close();
      this.recorderSound = recorderSound;
      //uspesne ukonceni nahravani
      this.result.recordedMilisecs = this.recorderSound ? this.miliseconds() : 0;
      var c = this.isRecordLengthCorrect(); if (!c) this.result.recordedMilisecs = 0;
      this.isRecorded(c);
      //vyjimka pro tuto kontrolku: save stavu cviceni
      this.doProvideData();
      this._myPage.result.userPending = true;
      CourseMeta.lib.saveProduct($.noop);
    }
    play() {
      var wasPaused = this.driver.handler.paused;
      SndLow.Stop(null);
      this.playing(false);
      if (!wasPaused) return;
      var url = this.recorderSound ? this.recorderSound.url : ((cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + this.result.audioUrl).toLowerCase();
      this.driver.play(url + '?stamp=' + (audioCaptureImpl.playCnt++).toString(), 0, msec => this.playing(msec >= 0));
    }
    static playCnt = 0;
    stopRecording() {
      setTimeout(() => this.driver.recordEnd(true), 500);
    }
    record() {
      var toDiscUrl = this.result.audioUrl;
      if (this.recording()) this.driver.recordEnd(true);
      else {
        this.miliseconds(0);
        SndLow.Stop(null);
        this.driver.recordStart({
          toDisc: true,
          toDiscFileUrl: this.result.audioUrl,
          toMemoryCompleted: mp3Data => {
            if (this.modalDialog) this.modalDialog.modal('hide');
            this.setRecorderSound(new SndLow.recordedSound(this.driver, !toDiscUrl ? mp3Data : Pager.basicDir + toDiscUrl));
          },
          actHtml5SampleRate: 0,
          isRecording: this.recording,
          miliseconds: this.miliseconds,
          recordStarting: () => {
            if (!this.recordInDialog) return;
            this.saveRecordingDisabled(this.limitMin > 0);
            if (this.dialogHeaderId) {
              this.modalContent.empty();
              this.modalContent.append($('#' + this.dialogHeaderId).clone());
            }
            //this.modalDialog.modal({ backdrop: 'static', keyboard: true });
            this.modalDialog.modal('show');
          },
          toMemoryCompletedData: null,
        });
      }
    }
  }

  export function createMediaUrl(id: string): string {
    var fn = LMStatus.sessionId.toString() + '-' + new Date().getTime() + '-' + id;
    var hash = Utils.Hash(fn) & 0x0000ffff;
    var part1 = hash >> 8; var part2 = hash & 0x000000ff;
    var res = urlBasicPath + part1.toString() + '/' + part2.toString() + '/' + fn + '.mp3';
    return res;
  }
  var urlBasicPath = '/media/';

  //********************************************* SND PAGE

  export enum progressType {
    progress,
    done,
    always
  }

  //sound informace pro jednu stranku
  export class sndPageImpl extends tagImpl implements CourseModel._sndPage {

    //constructor(data: CourseModel.tag) { super(data); bindClick(); }

    jsonMLParsed(): void {
      super.jsonMLParsed();
      this.grps = {}; this.sents = {};
      if (!self) return;
      _.each(this.Items, fgrp => _.each(fgrp.Items, grp => {
        this.grps[grp.id] = grp;
        _.each(grp.Items, interv => _.each(interv.Items, sent => this.sents[sent.idx] = sent));
      }));
    }

    pageCreated() {
      super.pageCreated();
      bindClick();
    }

    leave() {
      unbindClick();
    }

    Items: Array<sndFileGroupImpl>;

    //***** Inicializace odvozenych dat
    grps: { [id: string]: sndGroupImpl; };
    sents: { [id: number]: sndSentImpl; };
    allMediaTags: Array<mediaTagImpl>; //all media controls

    //***** PLAY management
    play(grpId: string, begPos: number) {
      this.onPlay();
      var grp = this.grps[grpId];
      if (grp.loading) return;
      if (begPos < 0) begPos = grp.Items[0].begPos; //begpos<0 => zacni hrat od zacatku
      var interv = _.find(grp.Items, i => begPos >= i.begPos && begPos < i.endPos); //najdi aktualni interval
      if (interv == null) { debugger; throw 'interv == null'; }
      this.playInt(interv, begPos); //hraj prvni interval
    }

    private onPlaying(interv: sndIntervalImpl, msec: number, context: progressType) {
      switch (context) {
        case progressType.progress: //report progress
          interv._owner.playProgress(msec);
          var s = _.find(interv.Items, s => msec < s.endPos);
          this.setActiveSentence(interv._owner, s);
          break;
        case progressType.done: //pokracuj hranim dalsiho intervalu
          var intIdx = _.indexOf(interv._owner.Items, interv);
          if (intIdx < interv._owner.Items.length - 1) {
            var interv = interv._owner.Items[intIdx + 1];
            setTimeout(() => this.playInt(interv, interv.begPos));
          }
          break;
        case progressType.always: //konec hrani
          //SndLow.guiBlocker(false);
          interv._owner.playProgress(-1);
          this.setActiveSentence(interv._owner, null);
          break;
      }
    }

    private playInt(interv: sndIntervalImpl, begPos: number) {
      var self = this; //var intVar = interv; var bp = begPos;
      interv._owner.player().openPlay(interv._owner._owner.mediaUrl, begPos, interv.endPos).
        progress((msec: number) => self.onPlaying(interv, msec < begPos ? begPos : msec /*pri zacatku hrani muze byt notifikovana pozice kousek pred zacatkem*/, progressType.progress)). //pokracovani v hrani intervalu
        done(() => self.onPlaying(interv, -1, progressType.done)). //konec prehrani intervalu
        always(() => self.onPlaying(interv, -1, progressType.always)); //uplny konec
    }

    //***** ACTIVE management
    private actSent: sndSentImpl = null; //aktualni veta
    private allActive: Array<mediaActivable>; //seznam aktualnich ovisualnich objektu

    //vstupni procedura do active managmentu
    private setActiveSentence(grp: sndGroupImpl, s: sndSentImpl) {
      if (this.actSent == s) return;
      Logger.trace_lmsnd('media.ts: sndPageImpl.setActiveSentence, idx=' + (s ? s.idx.toString() : '-1'));
      this.actSent = s; grp.actSent(s);
      if (s == null) { this.setAllActive(null); return; }
      var newActive: Array<mediaActivable> = [];
      _.each(s.myMediaSents, ms => { //mediaSentence a mediaReplica
        newActive.push(ms);
        if (ms._owner._tg == CourseModel.t_mediaReplica) newActive.push(<mediaReplica>(ms._owner));
      });
      newActive.pushArray(s._owner._owner.myMediaTags); //mediaTags
      this.setAllActive(newActive);
    }

    private setAllActive(newActive: Array<mediaActivable>) { //zmena seznamu aktivnich objektu
      if (!newActive && !this.allActive) return; //both null
      if (!newActive) { _.each(this.allActive, a => a.active(false)); delete this.allActive; return; } //newActive null => deactivate allActive
      if (!this.allActive) { _.each(newActive, a => a.active(true)); this.allActive = newActive; return; } //allActive null => activate newActive
      //merge
      var newAllActive: Array<mediaActivable> = [];
      _.each(this.allActive, a => delete a['fl']);
      _.each(this.allActive, a => {
        if (_.indexOf(newActive, a) < 0) a.active(false); //deaktivuj 
        else a['fl'] = true; //oznac jako jiz aktivni
      });
      _.each(newActive, a => { if (a['fl']) delete a['fl']; else a.active(true); }); //aktivuj zbyle
      this.allActive = newActive;
    }

    htmlClearing() { //uvolneni sound a video driveru 
      Logger.trace_lmsnd('media.ts: htmlClearing');
      unbindClick();
      _.each(this.Items, fg => { if (fg.player) SndLow.htmlClearing(fg.player.id); else _.each(fg.Items, g => { if (g.player()) SndLow.htmlClearing(g.player().id); }); });
    }

    //stop play
    onPlay(): void {
      cancelSoundStop();
      //if (pageSound.inOnPlayTimer != 0) { clearTimeout(pageSound.inOnPlayTimer); pageSound.inOnPlayTimer = 0; }
      inOnPlay = true; var self = this;
      setTimeout(() => { inOnPlay = false; }, 10);
    }
  }

  //********************************************* MEDIA PLAYER
  //ovladaci panel (videa apod.)
  export class mediaPlayer extends mediaTagImpl implements CourseModel.mediaPlayer {

    actSent: sndSentImpl;
    withoutCut = () => this.myGrp().withoutCut;
    actor = ko.observable<string>('');
    speech = ko.observable<string>('');
    textVisible = ko.observable<boolean>(true);
    playStop = () => { if (this.loading()) return; var driver = this.myGrp().player(); if (!driver.handler.paused) { driver.stop(); } else this.playFromSlider(); }
    nextSent = () => { if (this.loading()) return; this.prevNext(false); };
    prevSent = () => { if (this.loading()) return; this.prevNext(true); };
    toogleText = () => { if (this.loading()) return; this.textVisible(!this.textVisible()); };

    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      switch (phase) {
        case initPhase.afterRender2: //musi byt az za afterRender, tam se ev. dosazuje endPos jedine sound vety pro nenastrihany media file
          if (!getTypeOnly) {
            var self = this;
            var grp = self.myGrp();
            if (grp.Items.length != 1) { debugger; throw 'Only single sound interval is alowed for media-player'; }
            self.slider = $('#' + this.id + '-slider');
            //http://api.jqueryui.com/slider
            self.slider.slider({
              start: (event, ui) => grp.player().stop(),
              "max": 100000,
              disabled: true,
            });
            grp.playProgress.subscribe(msec => {
              if (msec < 0) { self.playing(false); return; }
              self.playing(true);
              self.sliderFromMsec(msec);
            });
            grp.actSent.subscribe(sent => {
              if (!sent) return;
              this.actSent = sent;
              this.speech(sent.text);
              this.actor(!sent.actor ? '' : sent.actor + ': ');
            });
            self.sliderStart = grp.Items[0].begPos; //???
            this.loading.subscribe(l => { if (!l) self.slider.slider("option", 'disabled', false); });
            if (completed) completed();
          }
          return initPhaseType.async;
      }
      return super.initProc(phase, getTypeOnly, completed);
    }

    playFromSlider() {
      this._myPage.sndPage.play(this._sentGroupId, this.msecFromSlider());
    }
    sliderFromMsec(msec: number) { this.slider.slider("option", "value", 100000 * (msec - this.sliderStart) / this.sliderLen()); }
    msecFromSlider(): number { return this.slider.slider("option", "value") * this.sliderLen() / 100000 + this.sliderStart; }

    slider: JQuery; sliderStart: number;
    sliderLen(): number {
      return this.myGrp().Items[0].endPos - this.sliderStart;
    }

    //initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
    //  switch (phase) {
    //    case initPhase.afterRender:
    //      if (!getTypeOnly) {
    //        super.initProc(initPhase.afterRender, false, null);
    //        var self = this;
    //        var grp = this.myGrp();
    //        grp.actSent.subscribe(sent => {
    //          if (!sent) return;
    //          this.actSent = sent;
    //          this.speech(sent.text);
    //          this.actor(!sent.actor ? '' : sent.actor + ': ');
    //        });
    //        completed();
    //      }
    //      return initPhaseType.async;
    //  }
    //  return super.initProc(phase, getTypeOnly, completed);
    //}

    prevNext(isPrev: boolean) {
      var grp = this.myGrp();
      var newSent: sndSentImpl;
      if (isPrev && this.actSent && grp.playProgress() - this.actSent.begPos > 500) { //pokrocile prehreni vety => jdi na jeji zacatek, nikoliv na predchozi vetu
        newSent = this.actSent;
      } else {
        var sents = grp.Items[0].Items;
        var actSentIdx = this.actSent ? _.indexOf(sents, this.actSent) : (isPrev ? sents.length - 1 : 0);
        if (isPrev) {
          if (actSentIdx == 0) return;
          newSent = sents[actSentIdx - 1];
        } else {
          if (actSentIdx >= sents.length - 1) return;
          newSent = sents[actSentIdx + 1];
        }
      }
      grp.player().stop();
      this.sliderFromMsec(newSent.begPos);
      grp.actSent(newSent);
    }

  }

  // ******** STATIC
  var inOnPlay = false; var inOnPlayTimer = 0;
  function cancelSoundStop() {
    if (inOnPlayTimer != 0) { clearTimeout(inOnPlayTimer); inOnPlayTimer = 0; }
  }

  function bindClick() {
    $('body').bind('click.stopSound', ev => {
      if ($(ev.target).closest('.oli-cancel-stop-sound').length > 0) return;
      if (inOnPlay) return;
      inOnPlayTimer = setTimeout(() => {
        inOnPlayTimer = 0;
        Logger.trace_lmsnd('media.ts: body.click stop');
        SndLow.Stop();
      }, 1);
    });
  }

  function unbindClick() {
    $('body').unbind('click.stopSound');
  }

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndPage, sndPageImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndFileGroup, sndFileGroupImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndGroup, sndGroupImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndInterval, sndIntervalImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndSent, sndSentImpl);

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaBigMark, mediaBigMark);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaPlayer, mediaPlayer);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaText, mediaText);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaVideo, mediaVideo);

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_mediaReplica, mediaReplica);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_mediaSent, mediaSent);

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.trecording, audioCaptureImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twriting, writingImpl);

}
