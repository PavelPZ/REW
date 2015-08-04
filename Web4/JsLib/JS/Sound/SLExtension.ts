/// <reference path="../../jsd/jquery.d.ts" />
/// <reference path="../../js/utils.ts" />
//q: \LMNet2\WebApps\EduAuthorNew\framework\script\lm\Silverlight.js
declare var Silverlight: SLLib.ISilverlightLib;

//Q:\LMCom\rew\web4\JsLib\JS\Sound\Sound.js
declare module LMSnd {
  export class audio {
    static playFile(url: string, pos: number): void;
  }
}

module SLLib {
  /************* Silverlight **********************/
  //var version = "5.0.61118.0";
  var version = "5.1.20513.0";

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

  //Silverlight <object> tag
  interface HTMLSilverlight extends HTMLElement {
    content: SLExtension;
  }

  //Q:\LMCom\rew\SLExtension\Media\Player.cs, Host.cs, Recorder.cs
  export interface SLExtension {
    Player: Player;
    Test: TestScriptable; //Q:\LMCom\rw2\client\App.xaml.cs, Resizer
    //Cpv: Cpv;
  }

  export interface TestScriptable {
    DoResize(width: number, height: number);
    addEventListener(type: "OnTitleChanged", par: TitleChangedEventArgument): void;
    addEventListener(type: string, par: Object): void;
  }

  export interface Player {
    openFile(url: string);
    playOpened();
    setPosition(msec: number);
    isPlaying(): boolean;
    setVolume(val: number): void;
    getVolume(): number;

    playFile(url: string, startMsec: number): void;
    play(spaceId: string, globalId: string, startMsec: number): void;
    stop(): void;
    pause(): void;
    //recording
    recordStart(): void;
    recordEnd(): void;
    playRecorded(): void;
    alowMicrophone(): boolean;
    alowTitle(msg: string): void;
    hasRecording(): boolean;

    addEventListener(type: "OnFileOpened", par: FileOpenedChangedEventArgument): void;
    addEventListener(type: "OnStatusChanged", par: StatusChangedEventArgument): void;
    addEventListener(type: "OnTrace", par: TraceEventArgument): void;
    addEventListener(type: "OnAlowMicrophone", par: MicrophoneEventArgument): void;
    addEventListener(type: string, par: Object): void;
  }

  export enum Status {
    no = 0,
    playFile = 1,
    playMemory = 2,
    recording = 3,
  }

  export enum Mode {
    player = 0,
    cpv = 1,
    test = 2,
    //video = 3,
  }

  export interface FileOpenedChangedEventArgument {
    Width: number;
    Height: number;
    Duration: number; //delka zvuku v msec
    Error: string;
  }

  export interface TitleChangedEventArgument {
    Title: string;
  }
  export interface StatusChangedEventArgument {
    Time: number;
    Position: number;
    Status: Status;
  }
  export var memorySource = "memory";

  export interface TraceEventArgument {
    Msg: string;
  }
  export interface MicrophoneEventArgument {
    alowMicrophone: boolean;
  }
  //export interface RecordChangedEventArgument {
  //  IsRecording: boolean;
  //}

  export interface Options {
    Mode: Mode;
    OnStatusChanged: (arg: StatusChangedEventArgument) => void;
    OnFileOpened: (arg: FileOpenedChangedEventArgument) => void;
    OnAlowMicrophone: (alow: boolean) => void;
    ControlId: string;
    Params: string;
  }

  export function isInstalled(): boolean {
    return Silverlight.isInstalled(version);
  }

  export var installUrl = 'http://www.microsoft.com/getsilverlight';

  //Umisteni kontrolky do stranky
  export function init(xapUrl: string, parent: JQuery, options: Options, completed: (ext: SLExtension) => void ) {
    try {
      Debug.trace_lmsnd('SL: init start');
      if (slWarning) return;
      if (!Silverlight.isInstalled(version)) {
        Debug.trace_lmsnd('SL: not installed');
        if (confirm('Microsoft Silverlight Installation required!'))
          window.top.location.href = installUrl;
        else {
          slWarning = true;
          alert('Without the Silvetlight installation some didactic features will be unavailable!');
        }
      } else {
        var id = options.ControlId;
        var src = Silverlight.createObject(xapUrl, parent == null ? null : parent[0], id,
          { autoUpgrade: 'true', background: 'white', minRuntimeVersion: version, alt: 'LANGMaster', enablehtmlaccess: 'true' },
          {
            onError: (msg: string) => alert(msg),
            onLoad: (ev) => {
              try {
                Debug.trace_lmsnd('SL: onLoad start');
                var slObj = $('#' + id);
                var ext: SLExtension = (<HTMLSilverlight>(slObj[0])).content;
                if (options.Mode == Mode.cpv) {
                  var alow = ext.Player.alowMicrophone();
                  if (options.OnAlowMicrophone) options.OnAlowMicrophone(alow);
                  if (!alow) ext.Player.alowTitle(CSLocalize('f9726cae800748ef83e29f8d3c2cbb98', 'Allow microphone'));
                }
                if (options.OnStatusChanged)
                  ext.Player.addEventListener("OnStatusChanged", (sender: Object, ev: StatusChangedEventArgument) => { try { options.OnStatusChanged(ev); } catch (exp) { Debug.error_snd('SL: OnStatusChanged', exp); } });
                if (options.OnFileOpened)
                  ext.Player.addEventListener("OnFileOpened", (sender: Object, ev: FileOpenedChangedEventArgument) => { try { options.OnFileOpened(ev); } catch (exp) { Debug.error_snd('SL: OnFileOpened', exp); } });
                if (options.OnAlowMicrophone)
                  ext.Player.addEventListener("OnAlowMicrophone", (sender: Object, ev: MicrophoneEventArgument) => { try { options.OnAlowMicrophone(ev.alowMicrophone); } catch (exp) { Debug.error_snd('SL: OnAlowMicrophone', exp); } });
                if (options.Mode != Mode.test) {
                  ext.Player.addEventListener("OnTrace", (sender: Object, ev: TraceEventArgument) => { try { Debug.trace_lmsnd('SLExtension: ' + ev.Msg); } catch (exp) { } });
                }

                completed(ext);
                Debug.trace_lmsnd('SL: onLoad end');
              } catch (msg) {
                Debug.error_snd('SL: onLoad', msg);
                throw msg;
              }
            }
          }, 
          "mode=" + options.Mode.toString() + (options.Params ? "," + options.Params : '')); 
        if (!parent) { 
          var div = $(src);
          $('body').prepend(div[0]);
        }
      }
      Debug.trace_lmsnd('SL: init end');
    } catch (msg) {
      Debug.error_snd('SL: init', msg);
      throw msg;
    }
  }
  var slWarning = false;

  export function initPlayer(xap: string, id: string, mode: Mode, completed: (pl: Player) => void , setStatus: (arg: StatusChangedEventArgument) => void , alowMicrophone: (low: boolean) => void , fileOpened: (arg: FileOpenedChangedEventArgument)=> void = null ): void {
    setTimeout(() =>
      SLLib.init(
        xap,
        $('#sldiv' + id),
        {
          Mode: mode,
          OnStatusChanged: (arg: StatusChangedEventArgument) => {
            if (!setStatus) return; setStatus(arg);
          },
          OnAlowMicrophone: (alow: boolean) => {
            if (!alowMicrophone) return; alowMicrophone(alow);
          },
          ControlId: "sl" + id,
          Params: null,
          OnFileOpened: fileOpened,
        },
        (ext: SLExtension) => completed(ext.Player)
        ),
      1);
  }

}

///#DEBUG
module Debug {
  export function trace_lmsnd(msg: string): void {
    Debug.trace("Sound", msg);
  }
  export function error_snd(where, msg) {
    Debug.error("Sound", where, msg);
  };
}
///#ENDDEBUG
var SoundNoop = null;
