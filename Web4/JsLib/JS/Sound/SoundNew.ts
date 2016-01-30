declare var S4N: any;
declare function $page(): any;
declare var Silverlight: SndLow.ISilverlightLib;

module SndLow {

  export class globalMedia {

    constructor() {
      _globalMedia = this;
      try {
        console.log('soundnew.ts: Player.selectDriver start');
        //init result
        playerType = LMComLib.SoundPlayerType.no; recordingType = LMComLib.SoundPlayerType.no;
        //get static info
        var isHtmlAudioVideo = html5_CanPlay(media.audio_mp3) && (html5_CanPlay(media.video_mp4) || html5_CanPlay(media.video_webm));
        var isHtmlCapture = html5Recorder.checkHTML5AudioCapture() && html5_CanPlay(media.audio_wave);
        //compute audio a recording type
        if (isHtmlCapture && isHtmlAudioVideo) { //all HTML5
          playerType = recordingType = LMComLib.SoundPlayerType.HTML5;
        } else if (this.slInstalled) { //all SL
          playerType = recordingType = LMComLib.SoundPlayerType.SL;
        } else if (isHtmlAudioVideo) { //ie9,10,11: audio html5, recording SL. Pri pozadavku na recording se pozaduje instalace SL a pouzije se playerType = recordingType = LMComLib.SoundPlayerType.SL
          playerType = LMComLib.SoundPlayerType.HTML5; recordingType = LMComLib.SoundPlayerType.SL; this.renderSLInstallHTML = true;
        } else {//ie8: all SL
          playerType = recordingType = LMComLib.SoundPlayerType.SL; this.renderSLInstallHTML = true;
        }
        if (this.renderSLInstallHTML)
          Pager.renderTemplateEx('global-media', 'install_sl', this);
        console.log('soundnew.ts: Player.selectDriver end');
      } catch (msg) {
        console.log('Error: Player.selectDriver', msg);
        debugger; throw msg;
      }
    }

    adjustGlobalDriver(isRecorder: boolean, completed: (driver: MediaDriver, disabled: boolean) => void) {
      var doCompleted: (driver: MediaDriver) => void = dr => {
        var disbl = dr == _dummyDriver;
        this.needInstall(disbl); completed(dr, disbl);
      };
      //hotovo
      if (!isRecorder && globalAudioPlayer) { doCompleted(globalAudioPlayer); return; }
      if (isRecorder && globaRecorder) { doCompleted(globaRecorder); return; }

      if (!isRecorder) {
        SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', false, dr => {
          globalAudioPlayer = dr;
          if (dr.type == recordingType) globaRecorder = dr;
          doCompleted(dr);
        });
      } else {
        if (globalAudioPlayer) globalAudioPlayer.htmlClearing();
        SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', true, dr => {
          globaRecorder = globalAudioPlayer = dr;
          doCompleted(dr);
        });
      }
    }

    //slInstalled = false;
    slInstalled = Silverlight.isInstalled(slVersion);
    renderSLInstallHTML: boolean;
    needInstall = ko.observable(false);

  }

  export function getGlobalMedia(): globalMedia { if (!_globalMedia) new globalMedia(); return _globalMedia; } var _globalMedia: globalMedia;
  export var globalAudioPlayer: MediaDriver;
  export var globaRecorder: MediaDriver;
  export function dummyDriver(): MediaDriver {
    if (!_dummyDriver) _dummyDriver = new MediaDriver(false, null, null);
    return _dummyDriver;
  } var _dummyDriver: MediaDriver;
  export function needInstallFalse() {
    if (!_globalMedia) return;
    _globalMedia.needInstall(false);
  }

  //export var globalAudioPlayer: MediaDriver;
  //export var globaRecorder: MediaDriver;
  //export function adjustGlobalDriver(isRecorder: boolean, completed: (driver: MediaDriver) => void) {
  //  //hotovo
  //  if (!isRecorder && globalAudioPlayer) { completed(globalAudioPlayer); return; }
  //  if (isRecorder && globaRecorder) { completed(globaRecorder); return; }
  //  //
  //  selectDriver();

  //  if (!isRecorder) {
  //    SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', false, dr => {
  //      globalAudioPlayer = dr;
  //      if (dr.type == recordingType) globaRecorder = dr;
  //      completed(dr);
  //    });
  //  } else {
  //    SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', true, dr => {
  //      globaRecorder = globalAudioPlayer = dr;
  //      completed(dr);
  //    });
  //  }
  //}

  export function guiBlocker(isStart: boolean): void {
    if (isStart) {
      if (guiBlockerTimer) { debugger; throw 'guiBlockerTimer'; }
      guiBlockerTimer = setTimeout(() => { guiBlockerTimer = 0; guiBlockerLow(true); }, 300);
    } else {
      if (guiBlockerTimer) { clearTimeout(guiBlockerTimer); guiBlockerTimer = 0; }
      guiBlockerLow(false);
    }
  };
  var guiBlockerTimer: number;
  function guiBlockerLow(isStart: boolean) {
    var bg = $('.block-gui'); if (bg.length == 0) return;
    if (isStart) bg.removeClass('hide'); else bg.addClass('hide');
  };


  //http://www.htmlgoodies.com/html5/client/how-to-embed-video-using-html5.html#fbid=XRsS9osNoHa
  export function createDriver(isVideo: boolean, id: string, parentId: string, htmltagClass: string, isRecording: boolean, completed: (driver: MediaDriver) => void): void {
    //selectDriver();
    if (allDrivers[id]) { completed(allDrivers[id]); return; }
    var gm = getGlobalMedia();
    var $parent = _.isEmpty(parentId) ? null : $(parentId);
    var parent = $parent && $parent.length == 1 ? $parent[0] : null;
    var driverType = isRecording ? recordingType : (cfg.forceDriver ? cfg.forceDriver : playerType);
    switch (driverType) {
      case LMComLib.SoundPlayerType.HTML5:
        allDrivers[id] = new MediaDriver_Html5(isVideo, id, parent, htmltagClass);
        completed(allDrivers[id]);
        break;
      case LMComLib.SoundPlayerType.SL:
        if (!gm.slInstalled) {
          //gm.needInstall(true);
          completed(dummyDriver());
        } else {
          allDrivers[id] = new MediaDriver_SL(isVideo, id, parent, htmltagClass, driver => completed(driver));
          break;
        }
    }
  }

  var allDrivers: { [id: string]: MediaDriver; } = {}; //evidence vsech driveru.
  var playerType: LMComLib.SoundPlayerType; //v selectDriver(): staticky zjisteny SoundPlayerType
  export var recordingType: LMComLib.SoundPlayerType;
  //var slInstalled: boolean; //staticky SLInstalled test

  export function htmlClearing(id: string) {
    guiBlocker(false);
    var dr = allDrivers[id]; if (!dr) return;
    dr.htmlClearing();
    delete allDrivers[id];
  }

  export function Stop(actDriver: MediaDriver = null) {
    Logger.trace_lmsnd('soundnew.ts: SndLow.stop');
    for (var id in allDrivers)
      if (allDrivers[id].handler && allDrivers[id] != actDriver) {
        allDrivers[id].stop();
        if (allDrivers[id].recHandler) allDrivers[id].recordEnd(false);
      }
  }

  export enum media { video_mp4 = 0x1, video_webm = 0x2, audio_mp3 = 0x4, audio_wave = 0x8 }

  var canPlayRes = -1;
  export function html5_CanPlay(m: media): boolean {
    if (canPlayRes == -1) {
      canPlayRes = 0;
      var elem = document.createElement('audio');
      if (elem.canPlayType) {
        if (elem.canPlayType('audio/mpeg;').replace(/^no$/, '') != '') canPlayRes |= media.audio_mp3;
        if (elem.canPlayType('audio/wav').replace(/^no$/, '') != '') canPlayRes |= media.audio_wave;
      }
      elem = document.createElement('video');
      if (elem.canPlayType) {
        if (elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '') != '') canPlayRes |= media.video_mp4;
        if (elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '') != '') canPlayRes |= media.video_webm;
      }
    }
    return (canPlayRes & m) != 0;
  }

  function compareBrowserVersion(a: string, b: string): number { return compVerRec(a.split("."), b.split(".")); }
  function compVerRec(a: string[], b: string[]): number {
    if (a.length == 0) a = ['0'];
    if (b.length == 0) b = ['0'];
    if (a[0] != b[0] || (a.length == 1 && b.length == 1)) return parseInt(a[0]) - parseInt(b[0]);
    return compVerRec(a.slice(1), b.slice(1));
  }

  export interface IHandler {
    play(): void;
    pause(): void;
    currentTime: number;
    paused: boolean;
    muted: boolean;
    duration: number;
    videoWidth: number;
    videoHeight: number;
  }

  export interface IRecHandler {
    recordEnd(): void;
    isRecording(): boolean; //prave se nahrava
  }

  //zvuk v pameti (pro html5 i SL)
  export class recordedSound {
    constructor(public driver: MediaDriver, data: ArrayBuffer | string) {
      if (typeof data === 'string') {
        this.url = data;
      } else {
        this.isMemory = true;
        this.url = driver.createObjectURL(data);
      }
    }
    close() { if (this.isMemory) this.driver.revokeObjectURL(this.url); }
    url: string;
    isMemory: boolean;
  }

  export class MediaDriver {

    //Playing
    openFile(url: string) { debugger; }

    //Recording
    recordStart(par: mp3WorkerLib.RecordStartPar): void { debugger; }
    recordEnd(finishAudioFile: boolean): void { debugger; }
    recordStartPar: mp3WorkerLib.RecordStartPar;
    createObjectURL(data: any): string { debugger; return null; }
    revokeObjectURL(url: string): void { debugger; }
    //alowTitle(): string { return ''; }

    constructor(public isVideo: boolean, public id: string, public parent: HTMLElement) { }

    type: LMComLib.SoundPlayerType;
    handler: IHandler; //spolecny Play driver
    recHandler: IRecHandler; //spolecny Record driver
    errorFlag: boolean; //na chvili se nastavi v OnError, aby byla sance vystoupit z timer cyklu.
    url: string; //memory nebo skutecna url
    htmlElement: JQuery;
    timerId = 0;
    actPlayer: JQueryDeferred<any>;

    //driver events:
    onCanplaythrough: () => void;
    onPaused: () => void;
    timeupdate: (msec: number) => void; //callback od driveru o progresu rehravani
    loading: (isStart: boolean) => void;

    htmlClearing() { try { this.stop(); /*this.setTimer(null);*/ delete allDrivers[this.id]; if (!this.htmlElement) return; this.htmlElement.remove(); this.htmlElement = null; } catch (msg) { } }

    //begMsec<0 => pouze open. endMsec<0 => hraje se do konce
    openPlay(url: string, begMsec: number, endMsec: number/*, onBlockGui: (isStart: boolean) => void = null*/): JQueryPromise<number> {
      SndLow.Stop(this);
      var th = this; th.onCanplaythrough = th.onPaused = th.timeupdate = null;
      if (th.actPlayer) th.actPlayer.reject();
      var def = th.actPlayer = $.Deferred<number>();
      th.onPaused = () => { if (th.onCanplaythrough) return /*jeste neni opened => ignoruj pause*/; th.onPaused = null; th.timeupdate = null; def.resolve(); };
      th.timeupdate = msec => {
        if (endMsec > 0 && msec > endMsec) {
          Logger.trace_lmsnd('soundnew.ts timeupdate pause');
          th.handler.pause();
        } else {
          //Logger.trace_lmsnd('soundnew.ts timeupdate: ' + msec.toString());
          def.notify(msec);
        }
      }
      th.onCanplaythrough = () => {
        th.onCanplaythrough = null;
        if (begMsec < 0) def.resolve(); //pouze open
        else {
          th.handler.currentTime = begMsec / 1000;
          th.handler.play();
        }
      };
      th.openFile(url);
      return def.promise();
    }

    doTimeupdate() { if (!this.timeupdate) return; try { this.timeupdate(Math.round(this.handler.currentTime * 1000)); } catch (msg) { } }
    doPaused() { /*Logger.trace_lmsnd('soundnew.ts: MediaDriver.doPaused');*/ if (!this.onPaused) return; try { this.onPaused(); } catch (msg) { } }
    doCanplaythrough() { guiBlocker(false); /*Logger.trace_lmsnd('soundnew.ts: MediaDriver.doCanplaythrough');*/ if (!this.onCanplaythrough) return; try { this.onCanplaythrough(); } catch (msg) { } }
    doLoading(isStart: boolean) { Logger.trace_lmsnd('soundnew.ts: MediaDriver.doLoading'); if (!this.loading) return; try { this.loading(isStart); } catch (msg) { } }

    onError(err: string): void {
      this.errorFlag = true; setTimeout(function () { this.errorFlag = false; }, 100); //nastav na chvili errorFlag, aby byla sance na ukonceni timeru.
      Logger.error_snd('Audio error', err); //LMSnd.options.onError("HTML5 Error code: " + err);
      try { this.stop(); } catch (e) { }
    }

    stop() {
      Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop start');
      try {
        //if (this.actPlayer) { this.actPlayer.reject(); this.actPlayer = null; }
        if (this.handler) this.handler.pause();
        this.recordingChanged(false);
        Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop end');
      } catch (msg) {
        Logger.error_snd('MediaDriver.stop', msg);
        debugger; throw msg;
      }
    }

    doRecordingCompleted() {
      Logger.trace_lmsnd('soundnew.ts: doRecordingCompleted beg');
      delete this.recordWorker;
      if (!this.recordStartPar || !this.recordStartPar.toMemoryCompleted) return;
      this.recordStartPar.toMemoryCompleted(this.recordStartPar.toMemoryCompletedData);
      delete this.recordStartPar;
      Logger.trace_lmsnd('soundnew.ts: doRecordingCompleted end');
    }

    recordingChanged(isRec: boolean) {
      if (!this.recordStartPar || !this.recordStartPar.isRecording) return;
      this.recordStartPar.isRecording(isRec);
      //if (!isRec) { this.recordStartPar.isRecording = null; this.recordStartPar.miliseconds = null; }
    }

    play(url: string, msecPos: number, playProgress: (msec: number) => void) {
      var th = this;
      this.openPlay(url, msecPos, -1).
        done(() => { if (playProgress) playProgress(-1); }).
        progress(msec => { if (playProgress) playProgress(msec + 50); });
    }

    //************* recording
    recordWorker: Worker;
    recordWorkerInitialized: boolean;
    recordedMilisecs: number;

  }

  export function createMP3Worker(driver: MediaDriver): Worker {
    var par = driver.recordStartPar;
    if (mp3WorkerLib.isOldBrowser) {
      return mp3Worker.worker = <any>{
        postMessage: (msg: mp3WorkerLib.message) => {
          switch (msg.cmd) {
            case 'end':
              Logger.trace_lmsnd('createMP3Worker end');
              Pager.blockGui(false);
              driver.doRecordingCompleted();
              break;
          }
        }
      };
    } else {
      var workerJs = 'wavWorker';
      var worker = new Worker('../jslib/js/sound/' + workerJs + '.js');
      var res: Array<Uint8Array> = [];
      worker.onmessage = (ev: mp3WorkerLib.MessageEvent) => {
        switch (ev.data.cmd) {
          case 'data':
          case 'end':
            if (par.toDisc) {
              if (ev.data.cmd == 'end') {
                worker.terminate(); worker = null;
                Logger.trace_lmsnd('createMP3Worker end');
                Pager.blockGui(false);
                driver.doRecordingCompleted();
              }
            } else {
              var data = <Uint8Array> ev.data.data;
              mp3WorkerLib.log('push ' + ev.data.cmd + ' ' + ev.data.id + ': ' + data.byteLength.toString());
              res.push(data);
              if (ev.data.cmd == 'end') {
                worker.terminate(); worker = null;
                Logger.trace_lmsnd('createMP3Worker end');
                //concatenate chunks to one array
                var len = 0;
                _.each(res, r => len += r.length);
                var mp3 = new Uint8Array(len);
                var pos = 0;
                _.each(res, r => { mp3.set(r, pos); pos += r.length; });
                Pager.blockGui(false);
                par.toMemoryCompletedData = mp3.buffer;
                driver.doRecordingCompleted();
                //if (par.toMemoryCompleted) par.toMemoryCompleted(mp3.buffer);
              }
            }
            break;
        }
      }
      return worker;
    }
  }


  //http://code.tutsplus.com/tutorials/html5-audio-and-video-what-you-must-know--net-15545
  //https://developer.mozilla.org/en-US/Apps/Build/Audio_and_video_delivery/buffering_seeking_time_ranges
  export class MediaDriver_Html5 extends MediaDriver {
    //http://www.w3schools.com/tags/ref_av_dom.asp
    //http://msdn.microsoft.com/en-us/library/ie/gg130960(v=vs.85).aspx
    //http://html5doctor.com/multimedia-troubleshooting/
    html5Handler: HTMLVideoElement; //nativni HTML5 driver
    memorySound: Array<Float32Array>;

    recordStart(par: mp3WorkerLib.RecordStartPar): void {
      this.recordStartPar = par;
      this.recordedMilisecs = 0;
      if (!par.toDisc) this.memorySound = [];
      if (par.toDisc) {
        this.recordWorkerInitialized = false;
        this.recordWorker = createMP3Worker(this);
      }
      var cfg: WavePCM.config = null;
      html5Recorder.startRecording(ev => {
        var sampleRate = 8000;
        if (!this.recordWorkerInitialized && par.recordStarting) par.recordStarting();
        if (!cfg) cfg = WavePCM.getConfig(ev.inputBuffer.sampleRate, html5Recorder.bufferLength, sampleRate);
        var floatBuf = new Float32Array(ev.inputBuffer.getChannelData(0));
        var buf = WavePCM.toPCM(cfg, floatBuf);
        if (par.toDisc) {
          if (!this.recordWorkerInitialized) { //start
            this.recordWorkerInitialized = true;
            this.recordingChanged(true);
            var hdr = new Uint16Array(3);
            hdr[0] = sampleRate; hdr[1] = 16; hdr[2] = 1;
            mp3WorkerLib.postInitHTML5Message(this.recordWorker, {
              recordStartPar: mp3WorkerLib.getWorkerRecordStartPar(this.recordStartPar),
              pagerBasicUrl: Pager.basicUrl, firstData: hdr//, in_samplerate: sampleRate, isAbr: null, VBR_mean_bitrate_kbps: null, firstData: hdr, firstData_ieee_float: null, VBR_quality: 0
            });
            mp3WorkerLib.postEncodeHTML5Message(this.recordWorker, buf);
          } else {
            mp3WorkerLib.postEncodeHTML5Message(this.recordWorker, buf);
          }
        } else {
          this.recordStartPar.actHtml5SampleRate = ev.inputBuffer.sampleRate;
          this.memorySound.push(floatBuf);
        }
        this.recordedMilisecs += floatBuf.length / ev.inputBuffer.sampleRate * 1000;
        if (this.recordStartPar.miliseconds) {
          this.recordStartPar.miliseconds(this.recordedMilisecs); //this.recordedMilisecs / ev.inputBuffer.sampleRate * 1000);
        }
      });
    }

    recordEnd(finishAudioFile: boolean): void {
      this.recordingChanged(false);
      html5Recorder.stopRecording();
      if (!this.recordStartPar || !finishAudioFile) return;
      if (this.recordStartPar.toDisc) {
        Pager.blockGui(true);
        mp3WorkerLib.postFinishHTML5Message(this.recordWorker);
      } else {
        var view = html5Recorder.encodeWAV(this.memorySound, this.recordStartPar.actHtml5SampleRate);
        this.recordStartPar.toMemoryCompletedData = view.buffer;
        this.doRecordingCompleted();
        //this.recordStartPar.toMemoryCompleted(view.buffer);
      }
      //this.recordWorker = null; this.recordStartPar = null; this.memorySound = null;
    }
    createObjectURL(data: any): string {
      var blob = new Blob([new DataView(data)], { type: "audio/wav" });
      return URL.createObjectURL(blob);
    }
    revokeObjectURL(url: string): void { URL.revokeObjectURL(url); }

    isRecording(): boolean { return html5Recorder.audioNodesConnected; }

    constructor(isVideo: boolean, id: string, parent: HTMLElement, htmltagClass: string) {
      super(isVideo, id, parent);
      this.type = LMComLib.SoundPlayerType.HTML5;
      try {
        var th = this;
        Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.init start');
        th.htmlElement = $(isVideo ? '<video id="driver-' + id + '" class="cls-video embed-responsive-item' + (htmltagClass ? htmltagClass : '') + '"></video>' : '<audio id="driver-' + id + '" class="cls-audio ' + (htmltagClass ? htmltagClass : '') + '"></audio>');
        th.html5Handler = <HTMLVideoElement>(th.htmlElement[0]);
        th.handler = th.html5Handler;
        th.recHandler = new html5Recorder.RecHandler();
        var $par = parent ? $(parent) : $('body');
        if (isVideo) { //zkopiruj mediaVideo classes, zacinajici na video- do video tagu
          var parClasses = $par.attr('class').split(/\s+/);
          _.each(parClasses, cls => { if (cls.indexOf('video-') != 0) return; th.htmlElement.addClass(cls); });
        }
        $par.prepend(th.htmlElement[0]);
        if (!th.html5Handler.load) { debugger; throw 'MediaDriver_Html5.init: cannot find load method of audio/video tag'; } //kontrola audio objektu
        $(th.html5Handler).
          on('error',() => th.onError(th.html5Handler.error.code.toString())).
          on('loadeddata',() => th.doCanplaythrough()).
          on('ended',() => th.doPaused()).
          on('pause',() => th.doPaused()).
          on('timeupdate',() => th.doTimeupdate());
        Logger.trace_lmsnd('soundnew.ts: HTML5.init end');
      } catch (msg) {
        Logger.error_snd('MediaDriver_Html5.init', msg);
        debugger; throw msg;
      }
    }

    formatCommandline(url: string | ArrayBuffer) {
      var th = this;
      if (typeof url === 'string') {
        var s = url.toLowerCase();
        th.url = url;
      } else
        delete th.url;
    }

    openFile(url: string) {
      var th = this;
      if (!url) { th.url = ''; return; }
      Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile start: url=' + url);
      try {
        var urlLow = url.toLowerCase();
        if (!th.url || th.url.indexOf(urlLow) < 0) {
          Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile jine URL');
          th.html5Handler.src = url; th.url = urlLow;
          th.html5Handler.load();
        } else {
          Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile stejne URL');
          if (th.onCanplaythrough) th.onCanplaythrough();
        }
      } catch (msg) {
        th.html5Handler.src = null;
        Logger.error_snd('MediaDriver_Html5.openFile', msg);
        debugger; throw msg;
      }
    }

  }

  export interface ISlHandler extends IRecHandler, IHandler {
    alowMicrophone(): boolean;
    alowTitle: string;
    recordStart(par: mp3WorkerLib.RecordStartPar): void;
    openFile(url: string): void;
    createObjectURL(): string;
    revokeObjectURL(url: string): string;
    addEventListener(type: string, par: any): void;
    addEventListener(type: "onCanplaythrough", par: any): void;
    addEventListener(type: "onPaused", par: IBoolEventArgument): void;
    addEventListener(type: "timeupdate", par: any): void;
    //addEventListener(type: "OnError", par: IStringEventArgument): void;
    //addEventListener(type: "OnTrace", Msg: IStringEventArgument): void;
  }

  export interface IStringEventArgument { Value: string; }
  export interface IBoolEventArgument { Value: boolean; }
  export interface INumberEventArgument { Value: number; }
  //export interface IPCMEventArgument {
  //  Value: string;
  //  BitsPerSample: number; SamplesPerSecond: number;
  //}

  var slWarning: boolean;
  //var slVersion = "5.0.61118.0";
  var slVersion = "5.1.20913.0";
  export var slInstallUrl = 'http://www.microsoft.com/getsilverlight';
  //var slXapUrl = '../schools/slextension.xap'; //HACHLE
  //var slXapUrl = 'slextension.xap.png'; //HACHLE
  //var slIsInstalled = 0; //-1 ne, 0 nevim, 1 ano 

  //Silverlight <object> tag
  interface slHost {
    content: slExtension;
  }
  export interface slExtension {
    HTML5Like: ISlHandler;
  }
  interface slOnLoadSender {
    getHost(): slHost;
  }

  //q: \LMNet2\WebApps\EduAuthorNew\framework\script\lm\Silverlight.js
  export interface ISilverlightLib {
    isInstalled(version: string): boolean;
    createObject(xap: string, parent: HTMLElement, id: string, props: SilverlightProps, events: SilverlightEvents, initParams?: string): string;
  }
  export interface SilverlightProps {
    autoUpgrade: string;
    background: string;
    minRuntimeVersion: string;
    //width: string;
    //height: string;
    alt: string;
    enablehtmlaccess: string;
  }
  export interface SilverlightEvents {
    onError: (msg: string) => void;
    onLoad: (ev: Object) => void;
  }

  export class MediaDriver_SL extends MediaDriver {

    slHandler: ISlHandler; //nativni SL driver
    isRecording(): boolean { return this.slHandler.isRecording(); }

    recordStart(par: mp3WorkerLib.RecordStartPar): void {
      this.recordStartPar = par;
      this.recordedMilisecs = 0;
      this.recordWorkerInitialized = false;
      this.recordAlowMicrophone(() => {
        this.slHandler.recordStart(par);
        if (!this.recordWorkerInitialized && this.recordStartPar.recordStarting) this.recordStartPar.recordStarting();
        this.recordingChanged(true);
        if (par.toDisc) {
          this.recordWorker = createMP3Worker(this);
        }
      });
    }
    recordAlowMicrophone(completed: () => void): void {
      if (!this.slHandler.alowMicrophone()) {
        this.htmlElement.css('top', '0px');
        this.htmlElement.css('position', 'inherit');
        $(window).scrollTop(0);
        var testMicrophoneTimer = setInterval(() => {
          if (!this.slHandler.alowMicrophone()) return;
          clearInterval(testMicrophoneTimer);
          this.htmlElement.css('top', '-50px');
          this.htmlElement.css('position', 'absolute');
          completed();
        }, 100);
      } else
        completed();
    }
    recordEnd(finishAudioFile: boolean): void {
      this.recordingChanged(false);
      this.slHandler.recordEnd();
      Logger.trace_lmsnd('MediaDriver_SL: after this.slHandler.recordEnd()');
      if (!finishAudioFile) return;
      if (this.recordStartPar.toDisc) {
        Pager.blockGui(true);
        mp3WorkerLib.postFinishSLMessage(this.recordWorker);
      } else {
        this.doRecordingCompleted();
      }
    }
    createObjectURL(data: any): string { return this.slHandler.createObjectURL(); }
    revokeObjectURL(url: string): void { this.slHandler.revokeObjectURL(url); }


    slOnPCMData(rawBase64: string) {
      if (!this.recordStartPar) return; //asi jiz volano recordEnd, dalsi PCM buffery jsou ignorovany
      if (!this.recordWorkerInitialized) { //start
        this.recordWorkerInitialized = true;
        mp3WorkerLib.postInitSLMessage(this.recordWorker, {
          recordStartPar: mp3WorkerLib.getWorkerRecordStartPar(this.recordStartPar),
          pagerBasicUrl: Pager.basicUrl, firstData: rawBase64, //in_samplerate: ev.SamplesPerSecond, isAbr: true, VBR_mean_bitrate_kbps: 56, firstData: ev.Value, firstData_ieee_float: null, VBR_quality: 0
        });
      } else {
        mp3WorkerLib.postEncodeSLMessage(this.recordWorker, rawBase64);
      }
      //this.recordedMilisecs += 1000 * ev.Value.length / (ev.BitsPerSample / 8) / ev.SamplesPerSecond;
      //if (this.recordStartPar.miliseconds) {
      //  this.recordStartPar.miliseconds(this.recordedMilisecs); //this.recordedMilisecs / ev.SamplesPerSecond * 1000);
      //}
    }

    constructor(isVideo: boolean, id: string, parentEl: HTMLElement, htmltagClass: string, completed: (handler: MediaDriver) => void) {
      super(isVideo, id, parentEl);
      this.type = LMComLib.SoundPlayerType.SL;
      try {
        Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init start');
        var self = this;

        var src = Silverlight.createObject(Pager.basicUrl + 'schools/slextension.xap', null, 'driver-' + id,
          //var src = Silverlight.createObject(cfg.baseTagUrl ? cfg.baseTagUrl + '/schools/slextension.xap' : '../schools/slextension.xap', null, 'driver-' + id,
          //var src = Silverlight.createObject('slextension.xap', null, 'driver-' + id,
          { autoUpgrade: 'true', background: 'white', minRuntimeVersion: slVersion, alt: 'LANGMaster', enablehtmlaccess: 'true' },
          {
            onError: (msg: string) => { this.onError(msg); completed(null); },
            onLoad: (sender: slOnLoadSender) => {
              try {
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad start');
                var video: ISlHandler = sender.getHost().content.HTML5Like;

                var slObj = $('#' + id);
                self.handler = self.recHandler = self.slHandler = video; self.isVideo = isVideo;
                video.alowTitle = CSLocalize('f9726cae800748ef83e29f8d3c2cbb98', 'Alow microphone');
                video.addEventListener("onCanplaythrough",() => self.doCanplaythrough());
                video.addEventListener("onPaused",() => self.doPaused());
                video.addEventListener("timeupdate",() => self.doTimeupdate());
                video.addEventListener("OnPCMData",(sender: Object, ev: IStringEventArgument) => { try { self.slOnPCMData(ev.Value); } catch (exp) { exp = null; } });
                video.addEventListener("OnRecordedMilisecs",(sender: Object, ev: INumberEventArgument) => {
                  try {
                    if (self.recordStartPar.miliseconds) this.recordStartPar.miliseconds(ev.Value);
                  } catch (exp) { }
                });
                completed(self);
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad end');
              } catch (msg) {
                Logger.error_snd('soundnew.ts: MediaDriver_SL.constructor: onLoad', msg);
                debugger; 
                throw msg;
              }
            }
          },
          ""
          );
        src = src.replace('<object ', '<object class="cls-' + (isVideo ? 'video ' : 'audio ') + (htmltagClass ? htmltagClass : '') + '" ');
        var $parent = parentEl ? $(parentEl) : $('body');
        this.htmlElement = $(src);
        if (isVideo) { //zkopiruj video-... classes do video tagu
          var parClasses = $parent.attr('class').split(/\s+/);
          _.each(parClasses, cls => { if (cls.indexOf('video-') != 0) return; this.htmlElement.addClass(cls); });
        }
        $parent.prepend(this.htmlElement[0]); this.parent = $parent[0];

        Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init end');
      } catch (msg) {
        Logger.error_snd('soundnew.ts: MediaDriver_SL.constructor: init', msg);
        debugger; throw msg;
      }
    }

    openFile(urlOrBuffer: string) {
      Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.openFile start: url=' + urlOrBuffer);
      this.url = urlOrBuffer;
      this.slHandler.openFile(urlOrBuffer);
    }

  }

}

//******************* Player pro EA
module LMSnd {

  export interface sndFile {
    onPlaying(sec: number): void;
    getFileUrl(): string;
  }

  export class Player {

    static init(_onStoped: () => void) {
      SndLow.getGlobalMedia().adjustGlobalDriver(false,(dr, disabled) => {
        onStoped = _onStoped;
      });
    }

    static playFile(url: string, sec: number) {
      try {
        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile start');
        if (!onStoped) { debugger; throw '!onStoped'; }
        url = url.toLowerCase().replace('.wma', '.mp3');
        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile sec=' + sec.toString() + ', url=' + url);
        SndLow.globalAudioPlayer.play(url, sec * 1000, msec => {
          if (msec < 0) { //zadany usek prehran
            onStoped();
            Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile stoped');
          } else {
            //Logger.trace_lmsnd('****** ' + msec.toString());
            if (file) file.onPlaying(msec);
          }
        });
        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile end');
      } catch (msg) {
        Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
        debugger; throw msg;
      }
    }

    static play(_file: sndFile, msec: number) {
      try {
        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play start');
        file = _file;
        var url = _file.getFileUrl().toLowerCase();
        Player.playFile(url, msec / 1000);
        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play end');
      } catch (msg) {
        Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
        debugger; throw msg;
      }
    }

    static stop() {
      if (!SndLow.globalAudioPlayer || !SndLow.globalAudioPlayer.handler) return;
      try { SndLow.globalAudioPlayer.stop(); } catch (err) { }
    }
  }
  var onStoped: () => void;
  //export var driver: SndLow.MediaDriver;
  var file: sndFile = null;
}

//xx/#DEBUG
module Logger {
  export function trace_lmsnd(msg: string): void {
    Logger.trace("Sound", msg);
  }
  export function error_snd(where, msg) {
    Logger.error("Sound", msg, where);
  };
}
//xx/#ENDDEBUG
//var SoundNoop = null;