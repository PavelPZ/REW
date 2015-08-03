using System;
using System.Net;
using System.Windows;
using System.Linq;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.IO;
using System.Windows.Browser;
using System.Text;
//using LMComLib;

namespace LMMedia {
  public static class Recorder {

    static MyAudioSink sink = new MyAudioSink();
    static bool deviceOK;
    static CaptureSource captureSource;
    public static AudioFormat audioFormat;

    public class MyAudioSink : AudioSink {
      public Action<byte[]> onPCMData;
      protected override void OnSamples(long sampleTime, long sampleDuration, byte[] sampleData) {
        //sb.Append(sampleData.Select(b => b.ToString()).Aggregate((r,i) => r + "," + i));
        onPCMData(sampleData);
      }
      protected override void OnCaptureStarted() {
      }
      protected override void OnCaptureStopped() {
        //sb.Length = 1000;
      }
      protected override void OnFormatChange(AudioFormat audioFormat) {
        Recorder.audioFormat = audioFormat;
      }

      //StringBuilder sb = new StringBuilder();

    }

    //http://msdn.microsoft.com/en-us/library/ff602282(VS.95).aspx
    public static bool RecordStart(SLPlayer.RecordStartPar par, Action<byte[]> onPCMData) {
      //if (obs == null) throw new Exception();
      if (captureSource != null) captureSource.Stop();
      //RecordInit();
      //result.Format = actFormat;
      sink.onPCMData = onPCMData;
      //sink.WithWavHeader = withWavHeader;
      if (captureSource == null) {
        captureSource = new CaptureSource() { AudioCaptureDevice = CaptureDeviceConfiguration.GetDefaultAudioCaptureDevice(), VideoCaptureDevice = null };
        AudioFormat fmt = null;
        if (captureSource.AudioCaptureDevice == null || captureSource.AudioCaptureDevice.SupportedFormats == null)
          error("RecordStart", new Exception("AudioCaptureDevice == null || SupportedFormats == null"));
        if (captureSource.AudioCaptureDevice != null && captureSource.AudioCaptureDevice.SupportedFormats != null) {
          fmt = captureSource.AudioCaptureDevice.SupportedFormats.Where(f => f.BitsPerSample == 16 && f.Channels == 1 && f.SamplesPerSecond >= 11025).OrderBy(f => f.SamplesPerSecond).FirstOrDefault();
          //if (!par.slOldBrowser && par.toDisc)
          //  //Minimalni pozadavky na LAME MP3 layer 1 nebo 2 (Silverlight Mp3MediaStreamSource neumi layer 2.5):
          //  fmt = captureSource.AudioCaptureDevice.SupportedFormats.Where(f => f.BitsPerSample == 16 && f.Channels == 1 && f.SamplesPerSecond >= 16000).OrderBy(f => f.SamplesPerSecond).FirstOrDefault();
          //else
          //  fmt = captureSource.AudioCaptureDevice.SupportedFormats.Where(f => f.BitsPerSample == 16 && f.Channels == 1).OrderBy(f => f.SamplesPerSecond).FirstOrDefault();
          trace("RecordStart: Selected format: BitsPerSample={0}, Channels={1}, SamplesPerSecond={2}", fmt.BitsPerSample, fmt.Channels, fmt.SamplesPerSecond);
          if (fmt != null) captureSource.AudioCaptureDevice.DesiredFormat = fmt;
        }
        if (fmt == null) {
          captureSource = null;
          error("RecordStart", new Exception("Missing microphone. You cannot use eTestMe.com recording features without microphone!"));
          MessageBox.Show("Missing microphone. You cannot use eTestMe.com recording features without microphone!");
          return false;
        }
      }
      if (!deviceOK && !AdjustMicrophone() && !MicrophoneOK()) return false;
      deviceOK = true;
      try {
        sink.CaptureSource = captureSource;
        trace("RecordStart: captureSource.Start");
        captureSource.Start();
        return true;
      } catch (Exception exp) {
        error("RecordStart error", exp);
        throw new Exception("There was a problem starting the sound recording " +
              "If using a Mac, verify default devices are set correctly.  " +
              "Right click on a Silverlight app to access the Configuration setings.", exp);
      }
    }

    public static void RecordEnd() {
      if (captureSource == null) return;
      captureSource.Stop();
      captureSource = null;
      sink.onPCMData = null;
    }

    public static void trace(string msg, params object[] args) {
      try {
        SLPlayer.JSLog.Write("recorder: " + msg, args);
      } catch {
        SLPlayer.JSLog.Write("trace error");
      }
      //SLPlayer.HTML5Like.Instance.trace(string.Format(msg, args));
      //PlayerObj.trace(string.Format(msg, args));
      //Log.log("Recorder", string.Format(msg, args));
    }

    public static void error(string msg, Exception exp) {
      SLPlayer.JSLog.Write("ERROR: " + msg + "\r\n" + exp.Message + "\r\n" + exp.StackTrace);
      //trace("Error: " + exp.Message + msg);
      //Log.error("Recorder", msg, exp);
    }

    //public static int MSecDuration { get { return result == null ? 0 : (int)(result.Duration / 10000); } }

    public static bool IsRecording() { return captureSource != null && captureSource.State == CaptureState.Started; }

    public static AudioFormat actFormat;

    public static bool MicrophoneOK() {
      return CaptureDeviceConfiguration.AllowedDeviceAccess;
    }

    public static bool AdjustMicrophone() {
      return CaptureDeviceConfiguration.RequestDeviceAccess();
    }
  }
}
