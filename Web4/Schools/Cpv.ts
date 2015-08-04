
module schoolCpv {
  //https://typescript.codeplex.com/workitem/1065 
  //d:\ProgramFiles\Common7\IDE\VWDExpressExtensions\TypeScript\

  var allCpvs: Array<model> = [];


  export enum PlayStatus {
    initializing = 0, //inicializace SL
    toPlay = 1, //nic nebezi, narade je prehrani vzoru
    playFile = 2, //bezi prehrani vzoru
    toRecord = 3, //nic nebezi, narade je nahrani studenta
    recording = 4, //bezi nahravani
    toPlayMemory = 5, //nic nebezi, narade je prehrani studenta
    playMemory = 6, //bezi prehrani studenta
  }

  export class model {
    constructor(public id: string, public xap: string) {
      var self = this;
      allCpvs[id] = this;
      this.play.owner = this.record.owner = this.replay.owner = this;
      //this.destroy = () => {
      //  if (self.driver) {
      //    self.driver.stop();
      //    if (self.driver.recHandler) self.driver.recHandler.recordEnd();
      //  }
      //  if (self.timerId != 0) clearTimeout(self.timerId); self.timerId = 0;
      //}
    }
    play = new btn("play");
    record = new btn("record");
    replay = new btn("replay");
    playStatus: PlayStatus; //typ prehravani
    driver: SndLow.MediaDriver;
    //installSlUrl(): string { return SndLow.slInstallUrl; }
    allDisabled = false; //je potreba instalace SL => buttony jsou disabled

    //showAlowMicrophoneBtn = ko.observable<boolean>(false);
    //needInstall = ko.observable<boolean>(true);
    //slvisible = ko.observable<boolean>(false);
    title = ko.observable<string>('');
    begPos: number;
    endPos: number;
    url: string;
    private recorderSound: SndLow.recordedSound;
    setRecorderSound(recorderSound: SndLow.recordedSound): void {
      if (this.recorderSound) this.recorderSound.close();
      this.recorderSound = recorderSound;
    }

    init(completed: () => void) {
      if (this.driver) { completed(); return; }
      SndLow.getGlobalMedia().adjustGlobalDriver(true,(dr, disabled) => {
        this.driver = dr;
        this.allDisabled = disabled;
        completed();
      });
    }

    htmlClearing() {
      this.setRecorderSound(null);
      SndLow.htmlClearing(this.id);
    }

    setBtn(btn: btn, disabled: boolean, active: boolean, playing: boolean) {
      btn.disabled(disabled); btn.active(active); btn.playing(playing);
    }
    setButtonsStatus() {
      this.setBtn(this.play, this.allDisabled || this.playStatus == PlayStatus.recording, this.playStatus == PlayStatus.toPlay || this.playStatus == PlayStatus.playFile, this.playStatus == PlayStatus.playFile);
      this.setBtn(this.record, this.allDisabled, this.playStatus == PlayStatus.toRecord || this.playStatus == PlayStatus.recording, this.playStatus == PlayStatus.recording);
      //this.setBtn(this.replay, !this.driver || !this.driver.recHandler.recordingExists(), this.playStatus == PlayStatus.toPlayMemory/* || this.playStatus == PlayStatus.playMemory*/, this.playStatus == PlayStatus.playMemory);
      this.setBtn(this.replay, this.allDisabled || this.playStatus == PlayStatus.recording || !this.driver || !this.recorderSound, this.playStatus == PlayStatus.toPlayMemory || this.playStatus == PlayStatus.playMemory, this.playStatus == PlayStatus.playMemory);
    }
    //computeUrl(url: string): string {
    //  var res: string;
    //  switch (this.id) {
    //    case schools.tExCpv:
    //      //return "http://www.langmaster.com/rew/Schools/" + cfg.EADataPath + url.replace('.wma', '.mp3');
    //      //res = url; break; //cfg.EADataPath + url.replace('.wma', '.mp3'); break;
    //    case schools.tDictCpv:
    //    //case schools.tMediaCpv:
    //      res = url; break;
    //    default:
    //      debugger;
    //      throw "not Implemented";
    //  }
    //  return res.toLowerCase();
    //}

    playStop: () => void;

    hide(s, ev) {
      this.setRecorderSound(null);
      this.destroy();
      anim.collapseExpandedSlow();
      //this.slvisible(false);
      if (ev) { ev.cancelBubble = true; ev.stopPropagation(); }
      return false;
    }

    destroy = () => {
      if (this.driver) {
        this.driver.stop();
        if (this.driver.recHandler) this.driver.recordEnd(false);
      }
      if (this.timerId != 0) clearTimeout(this.timerId); this.timerId = 0;
    };

    playSound(isUrl: boolean) {
      var self = this;
      self.driver.url = null;
      self.driver.play(isUrl ? self.url : self.recorderSound.url, isUrl ? self.begPos * 1000 : 0, null);
    }

    show(url: string, title: string, begPos?: number, endPos?: number): void {
      //this.stopStatus = { play: false, record: false, replay: false };
      this.playStatus = PlayStatus.initializing;
      this.url = url.toLowerCase(); /*this.computeUrl(url);*/ this.title(title); this.begPos = begPos ? begPos / 1000 : 0; this.endPos = endPos ? endPos / 1000 : 1000000;
      var self = this;

      //Inicializace SL
      this.init(() => {
        self.playStatus = PlayStatus.toPlay;
        //self.slvisible(true);
        anim.show($('#' + self.id));
        //if (self.driver) self.driver.recHandler.clearRecording();
      });
      //Timer
      this.timerId = setInterval(() => {
        if (self.driver && self.driver.recHandler) {
          //if (!self.driver.recHandler.alowMicrophone()) {//neni dovolen mikrofon
          //  self.showAlowMicrophoneBtn(true); return;
          //}
          //self.showAlowMicrophoneBtn(false);
          //stavy, nastavene klikem na button
          if (!self.driver.handler.paused)
            if (self.isRecordedSound()) self.playStatus = PlayStatus.playMemory;
            else self.playStatus = PlayStatus.playFile;
          else if (self.driver.recHandler.isRecording())
            self.playStatus = PlayStatus.recording;
          //kontrola, zdali jeste bezi prehravani
          switch (self.playStatus) {
            case PlayStatus.playFile: //prehravani vzoru
              if (self.driver.handler.paused) self.playStatus = PlayStatus.toRecord; //prestalo se prehravat vzor
              else if (!self.isRecordedSound() && self.endPos && self.endPos <= self.driver.handler.currentTime) self.driver.stop(); //dosazeno konce prehrani vzoru
              break;
            case PlayStatus.recording: //nahravani
              if (!self.driver.recHandler.isRecording()) self.playStatus = PlayStatus.toPlayMemory; //prestalo se nahravat
              break;
            case PlayStatus.playMemory:
              if (self.driver.handler.paused) self.playStatus = PlayStatus.toPlay; //prestalo se prehravat nahravka studenta
              break;
          }
        }
        //aktualizace stavu butonu
        this.setButtonsStatus();
      }, 50);

    } timerId: number = 0;

    isRecordedSound() {
      //return !this.driver.url || Utils.startsWith(this.driver.url, 'blob');
      return this.recorderSound && this.driver.url.toLowerCase() == this.recorderSound.url.toLowerCase();
    }

  }
  export function show(id: string, url: string, title: string, begPos?: number, endPos?: number): void {
    allCpvs[id].show(url, title, begPos, endPos);
  }
  export function hide(id: string): void {
    allCpvs[id].hide();
  }

  export class btn {
    constructor(public id: string) {
      this.iconClass = ko.computed(() => {
        var cls = "";
        switch (this.id) {
          case "replay":
          case "play": cls = this.playing() ? "stop" : "play"; break;
          case "record": cls = this.playing() ? "stop" : "circle"; break;
        }
        return "fa-" + cls;
      })
    }
    owner: model;
    active = ko.observable<boolean>(false);
    playing = ko.observable<boolean>(false);
    disabled = ko.observable<boolean>(false);
    iconClass;
    text() {
      switch (this.id) {
        case "play": return CSLocalize('4bbab8260cf44783ade8f733a142866d', 'Listen to the original');
        case "record": return CSLocalize('e409b368170645e58cfd835473cb9561', 'Record');
        case "replay": return CSLocalize('0590834dbf264906ae88c717f81170cf', 'Check your recording');
      }
    }
    click(s, ev) {
      if (this.disabled()) return;
      //rec.alowTitle = CSLocalize('7da1fdbb748447bb83e9bbe135e543cc', 'Allow microphone');
      switch (this.id) {
        case "play":
        case "replay":
          if (this.playing()) this.owner.driver.stop(); else this.owner.playSound(this.id == "play");
          break;
        case "record":
          if (this.playing()) setTimeout(() => this.owner.driver.recordEnd(true), 500); else this.owner.driver.recordStart({
            toDisc: false,
            toDiscFileUrl: null,
            toMemoryCompleted: mp3Data => this.owner.setRecorderSound(new SndLow.recordedSound(this.owner.driver, mp3Data)),
            actHtml5SampleRate: 0,
            isRecording: null,
            miliseconds: null,
            recordStarting: null,
            toMemoryCompletedData:null,
          });
          break;
      }
      ev.cancelBubble = true; ev.stopPropagation(); return false;
    }
  }


}


module Pager {

  //klik na mikrofon ve cviceni
  export function callCPV(ev: JQueryEventObject, url: string, title: string, begPos: number, endPos: number): void {
    schoolCpv.show(schools.tExCpv, url, title, begPos, endPos);
  }

}
