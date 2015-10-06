using LMMedia;
//using Media;
using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Windows;
using System.Windows.Browser;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;
//using LMComLib;

namespace SLPlayer {

  public class HTML5Like {

    //public static HTML5Like Instance;

    public HTML5Like(SLExtension.MainPage pg, bool isVideo) {
      this.player = pg.Player; this.isVideo = isVideo; page = pg;
      player.AutoPlay = false; player.Volume = 1.0;

      //player.MediaFailed += new EventHandler<ExceptionRoutedEventArgs>((sender, arg) => {
      //  if (OnError != null) OnError(null, new StringEventArgument("Silverlight error: " + arg.ErrorException.Message));
      //});

      //http://blogs.msdn.com/b/randomnumber/archive/2009/02/09/troubleshooting-the-silverlight-mediaelement-4001-error.aspx
      player.MediaFailed += (sender, arg) => {
        JSLog.Write("***** ERROR " + arg.ErrorException.Message);
        //if (OnError != null) OnError(null, new StringEventArgument("Silverlight error: " + arg.ErrorException.Message));
      };

      System.Windows.Threading.DispatcherTimer timer = null;
      player.CurrentStateChanged += (sender, arg) => {
        switch (player.CurrentState) {
          case MediaElementState.Paused:
          case MediaElementState.Closed:
          case MediaElementState.Stopped:
            trace("callback " + player.CurrentState.ToString());
            if (timer != null) {
              timer.Stop(); timer = null;
              if (onPaused != null) onPaused(null, null);
            }
            break;
          case MediaElementState.Playing:
            if (timer == null) {
              trace("callback.playing, new timer, timeupdate" + (timeupdate!=null ? "!=" : "==") + "null");
              timer = new System.Windows.Threading.DispatcherTimer();
              timer.Interval = new TimeSpan(0, 0, 0, 0, 100);
              timer.Tick += new EventHandler((o, a2) => {
                if (timeupdate != null) {
                  timeupdate(null, null);
                }
              });
              timer.Start();
            }
            break;
        }
      };

      player.MediaOpened += (s, a) => {
        _duration = player.NaturalDuration.TimeSpan.TotalSeconds;
        trace(string.Format("player.MediaOpened, duration={0}", _duration));
        _videoWidth = player.NaturalVideoWidth;
        _videoHeight = player.NaturalVideoHeight;
        if (_videoWidth > 0 && _videoHeight > 0) {
          //nastav velikost videa dle elementu
          //dle skutecne velikosti videa se nastavuji ostatni elementy
          //player.Width = _videoWidth; player.Height = _videoHeight;
          //HtmlElement plugin = HtmlPage.Plugin;
          //plugin.SetStyleAttribute("width", _videoWidth.ToString() + "px");
          //plugin.SetStyleAttribute("height", _videoHeight.ToString() + "px");
          //plugin.Parent.SetStyleAttribute("width", _videoWidth.ToString() + "px");
          //plugin.Parent.SetStyleAttribute("height", _videoHeight.ToString() + "px");
        } else {
          player.Width = 1; player.Height = 1;
        }
      };
    }

    public void trace(string msg) {
      JSLog.Write(DateTime.Now.ToString("s.fff") + ": " + msg);
      //if (OnTrace != null) OnTrace(null, new StringEventArgument("Silverlight: " + msg)); 
    }

    public static void error(string msg, Exception exp) {
      SLPlayer.JSLog.Write("ERROR: " + msg + "\r\n" + exp.Message + "\r\n" + exp.StackTrace);
    }

    MediaElement player;
    bool isVideo;
    SLExtension.MainPage page;

    [ScriptableMember()]
    public void openFile(string playUrl) {
      try {
        LMMedia.Recorder.RecordEnd();
        if (playUrl == null) { player.Stop(); url = null; }
        trace("js.openFile start, oldUrl=" + url + ", newUrl=" + playUrl);
        MemoryStream mem;
        if (url != playUrl) {
          _duration = -1.0;
          url = playUrl;
          player.Stop();
          if (objectUrls.TryGetValue(playUrl.ToLower(), out mem)) {
            //play sound from memory
            player.SetSource(new WaveMediaStreamSource2(mem));
          } else {
            //play sound from web
            trace(string.Format("new URL {0}", url));
            player.Source = new Uri(url, UriKind.RelativeOrAbsolute);
          }
          var timer = new System.Windows.Threading.DispatcherTimer();
          timer.Interval = new TimeSpan(0, 0, 0, 0, 100);
          timer.Tick += new EventHandler((o, arg) => {
            if (_duration < 0) return;
            trace("openFile Opened");
            if (player.DownloadProgress < 1.0) return;
            trace("openFile Downloaded: " + url);
            timer.Stop();
            if (onCanplaythrough != null) onCanplaythrough(null, null);
          });
          timer.Start();
        } else {
          trace("openFile Paused: url=" + url);
          player.Pause();
          if (onCanplaythrough != null) onCanplaythrough(null, null);
        }
      } catch (Exception exp) {
        error("openFile", exp);
      }
    }
    //static int mp3Count = 0;


    [ScriptableMember()]
    public event EventHandler<EventArgs> onCanplaythrough;
    [ScriptableMember()]
    public event EventHandler<EventArgs> onPaused;
    [ScriptableMember()]
    public event EventHandler<EventArgs> timeupdate;
    //[ScriptableMember()]
    //public event EventHandler<StringEventArgument> OnError;
    //[ScriptableMember()]
    //public event EventHandler<StringEventArgument> OnTrace;
    [ScriptableMember()]
    public event EventHandler<StringEventArgument> OnPCMData;
    [ScriptableMember()]
    public event EventHandler<NumberEventArgument> OnRecordedMilisecs;

    [ScriptableMember()]
    public void play() { trace("js.play, CurrentState=" + player.CurrentState.ToString()); if (player.CurrentState != MediaElementState.Playing) player.Play(); }
    [ScriptableMember()]
    public void pause() { trace("js.pause"); player.Pause(); }
    [ScriptableMember()]
    public string url { get; set; }

    [ScriptableMember()]
    public double currentTime {
      get { return player.CurrentState == MediaElementState.Playing || player.CurrentState == MediaElementState.Paused ? (double)player.Position.Ticks / 10000000 : 0.0; }
      set {
        trace("js.set currentTime " + value.ToString());
        if (player.CurrentState != MediaElementState.Playing && player.CurrentState != MediaElementState.Paused) trace("**** Error: player.CurrentState != MediaElementState.Playing && player.CurrentState != MediaElementState.Paused");
        player.Position = new TimeSpan((Int64)(value * 10000000));
      }
    }
    [ScriptableMember()]
    public bool paused { get { return player.CurrentState != MediaElementState.Playing && player.CurrentState != MediaElementState.Buffering; } }
    //public bool paused { get { return player.CurrentState == MediaElementState.Paused || player.CurrentState == MediaElementState.Stopped; } }
    [ScriptableMember()]
    public bool muted { get { return player.IsMuted; } set { player.IsMuted = value; } }
    [ScriptableMember()]
    public double duration { get { return _duration; } } double _duration;
    [ScriptableMember()]
    public int videoWidth { get { return _videoWidth; } } int _videoWidth;
    [ScriptableMember()]
    public int videoHeight { get { return _videoHeight; } } int _videoHeight;

    /******************* recording *********************/

    [ScriptableMember()]
    public void recordStart(ScriptObject so) {
      try {
        trace("recordStart begin");
        player.Stop(); url = null;
        recordStartPar = new RecordStartPar {
          toDisc = (bool)so.GetProperty("toDisc"),
          //slOldBrowser = (bool)so.GetProperty("slOldBrowser"),
          toDiscFileUrl = (string)so.GetProperty("toDiscFileUrl"),
        };
        recordedBytes = 0;
        //if (recordStartPar.slOldBrowser && recordStartPar.toDisc) recordStartPar.toDiscLib = new uploadChunk.lib(null, () => Recorder.audioFormat, recordStartPar.toDiscFileUrl);
        if (recordedStream == null) recordedStream = new MemoryStream(); else recordedStream.SetLength(0);
        LMMedia.Recorder.RecordStart(recordStartPar, buf => {
          recordedBytes += buf.Length;
          if (OnRecordedMilisecs != null) Deployment.Current.Dispatcher.BeginInvoke(() => OnRecordedMilisecs(null, new NumberEventArgument { Value = (int)((long)8 * 1000 * recordedBytes / Recorder.audioFormat.SamplesPerSecond / Recorder.audioFormat.BitsPerSample) }));
          if (recordStartPar.toDisc) { //zapis na disk
            //if (recordStartPar.slOldBrowser) { //stary browser uploaduje na disk PCM data a po ukonceni provede MP3 kompresi
            //  recordStartPar.toDiscLib.uploadChunk(buf);
            //} else { //novy browser posle PCM do JS, kde se vse zpravuje podobne, jako pro Chrome nebo FF
            if (recordedStream.Position == 0) {
              var wr = new BinaryWriter(recordedStream);
              wr.Write((UInt16)Recorder.audioFormat.SamplesPerSecond); wr.Write((UInt16)Recorder.audioFormat.BitsPerSample); wr.Write((UInt16)Recorder.audioFormat.Channels);
            }
            recordedStream.Write(buf, 0, buf.Length);

            //var dump = buf.Take(10).Select(b => b.ToString()).Aggregate((r, i) => r + "," + i);

            Deployment.Current.Dispatcher.BeginInvoke(() => onPCMData(false));
            //XXX
            //trace("recordStart data " + buf.Take(10).Select(b => b.ToString()).Aggregate((r, i) => r + "," + i));
            //UInt16[] pcm = new UInt16[buf.Length / 2];
            //for (var i = 0; i < pcm.Length; i++) pcm[i] = BitConverter.ToUInt16(buf, i * 2);
            //swap double bytes
            //var bytes = buf.Select(b => Convert.ToChar(b)).ToArray();
            //for (var i = 0; i < bytes.Length / 2; i++) {
            //  var b = bytes[i * 2]; bytes[i * 2] = bytes[i * 2 + 1]; bytes[i * 2 + 1] = b;
            //}
            //var str = new string(bytes);
            //  OnPCMData(null, new PCMEventArgument {
            //    //Value = new List<byte>(buf),
            //    //Value = ByteArrayToHex(buf),
            //    BitsPerSample = Recorder.audioFormat.BitsPerSample,
            //    SamplesPerSecond = Recorder.audioFormat.SamplesPerSecond
            //  });
            //});
            //}
          } else { //zapis do pameti
            if (recordedStream.Position == 0) LMMedia.WaveFormatExtensible.WriteHeaderStart(recordedStream, Recorder.audioFormat);
            recordedStream.Write(buf, 0, buf.Length);
          }
        });
        trace("recordStart end");
      } catch (Exception exp) {
        error("recordStart", exp);
      }
    }

    void onPCMData(bool inEnd) {
      if (!inEnd && recordedStream.Length < 50000) return;
      var str = Convert.ToBase64String(recordedStream.ToArray()); recordedStream.SetLength(0);
      trace("onPCMData " + (inEnd ? "in end" : null) + ", len=" + str.Length.ToString() + '/' + recordedBytes.ToString());
      OnPCMData(null, new StringEventArgument(str));
      //BitsPerSample = Recorder.audioFormat.BitsPerSample,
      //SamplesPerSecond = Recorder.audioFormat.SamplesPerSecond
      //});
      //OnPCMData(null, new PCMEventArgument {
      //  Value = str,
      //  //BitsPerSample = Recorder.audioFormat.BitsPerSample,
      //  //SamplesPerSecond = Recorder.audioFormat.SamplesPerSecond
      //});
    }

    MemoryStream recordedStream;
    int recordedBytes;
    RecordStartPar recordStartPar;
    Dictionary<string, MemoryStream> objectUrls = new Dictionary<string, MemoryStream>();

    [ScriptableMember()]
    public void recordEnd() {
      if (recordStartPar == null) return;
      try {
        trace("recordEnd, begin");
        LMMedia.Recorder.RecordEnd();
        if (recordStartPar.toDisc) { //zapis na disk
          //if (recordStartPar.slOldBrowser) //ukonceni uploadu PCM na disk a vyvolani server side MP3 komprese 
          //  recordStartPar.toDiscLib.Dispose();
          //else
          onPCMData(true);
        } else { //nahravka je v recorded
          LMMedia.WaveFormatExtensible.WriteHeaderEnd(recordedStream);
        }
        recordStartPar = null;
        trace("recordEnd, end");
      } catch (Exception exp) {
        error("recordEnd", exp);
      }
    }

    [ScriptableMember()]
    public string createObjectURL() {
      try {
        if (recordedStream == null) return null;
        string res = "blob:" + Guid.NewGuid().ToString().ToLower();
        objectUrls[res] = recordedStream; recordedStream = null;
        return res;
      } catch (Exception exp) {
        error("createObjectURL", exp);
        return null;
      }
    }

    [ScriptableMember()]
    public void revokeObjectURL(string url) {
      objectUrls.Remove(url.ToLower());
    }

    [ScriptableMember()]
    public bool isRecording() {
      return LMMedia.Recorder.IsRecording();
    }

    public bool microphoneButtonVisible() {
      var micOK = LMMedia.Recorder.MicrophoneOK();
      page.alowBtn.Visibility = micOK ? Visibility.Collapsed : Visibility.Visible;
      return micOK;
    }

    [ScriptableMember()]
    public bool alowMicrophone() {
      return microphoneButtonVisible();
    }

    [ScriptableMember()]
    public string alowTitle { set { page.alowBtn.Content = value; } }

  }

  public class RecordStartPar {
    public bool toDisc { get; set; } //mod ulozeni dat na disk
    public string toDiscFileUrl { get; set; } //pro toDisc==true: jmeno souboru x URL
    //public bool slOldBrowser { get; set; } //ie8, ie9
    //public uploadChunk.lib toDiscLib;
  }

  [ScriptableType()]
  public class StringEventArgument : EventArgs {
    public StringEventArgument() { }
    public StringEventArgument(string value) { Value = value; }
    [ScriptableMember()]
    public string Value { get; set; }
  }
  [ScriptableType()]
  public class NumberEventArgument : EventArgs {
    [ScriptableMember()]
    public long Value { get; set; }
  }
  [ScriptableType()]
  public class BoolEventArgument : EventArgs {
    public BoolEventArgument() { }
    public BoolEventArgument(bool value) { Value = value; }
    [ScriptableMember()]
    public bool Value { get; set; }
  }

  //[ScriptableType()]
  //public class PCMEventArgument : EventArgs {
  //  //XXX
  //  [ScriptableMember()]
  //  //public UInt16[] Value { get; set; }
  //  //public System.Collections.IList Value { get; set; }
  //  public string Value { get; set; }
  //  [ScriptableMember()]
  //  public int BitsPerSample { get; set; }
  //  [ScriptableMember()]
  //  public int SamplesPerSecond { get; set; }
  //}

  public class JSLog {

    public static void Write(object message, params object[] values) {
      Action doWrite = () => {
        HtmlWindow window = HtmlPage.Window;
        var isConsoleAvailable = (bool)window.Eval("typeof(console) != 'undefined' && typeof(console.log) != 'undefined'");
        if (!isConsoleAvailable) return;
        var createLogFunction = (bool)window.Eval("typeof(sllog) == 'undefined'");
        if (createLogFunction) {
          // Load the logging function into global scope:
          string logFunction = "function sllog(msg) { console.log(msg); }";
          string code = string.Format(@"if(window.execScript) {{ window.execScript('{0}'); }} else {{ eval.call(null, '{0}'); }}", logFunction);
          window.Eval(code);
        }
        // Prepare the message
        string output = "SLExtension: " + string.Format(message.ToString(), values);
        // Invoke the logging function:
        var logger = window.Eval("sllog") as ScriptObject;
        if (logger != null) {
          logger.InvokeSelf(output);
          // Workaround: Cannot call InvokeSelf outside of UI thread, without dispatcher
          //Dispatcher d = Deployment.Current.Dispatcher;
          //if (!d.CheckAccess()) {
          //  d.BeginInvoke((ThreadStart)(() => logger.InvokeSelf(output)));
          //} else {
          //  logger.InvokeSelf(output);
          //}
        }
      };
      Dispatcher d = Deployment.Current.Dispatcher;
      if (!d.CheckAccess()) {
        d.BeginInvoke((ThreadStart)(() => doWrite()));
      } else {
        doWrite();
      }
    }
  }
}
