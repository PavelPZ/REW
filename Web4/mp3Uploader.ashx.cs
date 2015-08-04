using LMComLib;
using LMNetLib;
using NAudio.Lame.DLL;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Web;

namespace mp3Uploader {
  /// <summary>
  /// Summary description for uploadChunkHandler
  /// </summary>
  public class uploadChunkHandler : IHttpHandler {

    public void ProcessRequest(HttpContext context) {

      string phase; string fileUrl;
      if (context == null || (phase = context.Request["phase"]) == null || (fileUrl = context.Request["fileUrl"]) == null) return;

      string tempFn;
      var fn = context.Server.MapPath("~" + fileUrl);
      if (fileUrl != "") LowUtils.AdjustFileDir(fn);

      Logger.Log("mp3Uploader: phase={0}, dataLen={1}", phase, context.Request.InputStream.Length);
      switch (phase) {
        case "lmconsole-download":
          context.Response.ContentType = "application/octet-stream";
          lmConsole.lib.getZippedLogOnRemoteServer(f => { context.Response.WriteFile(f); context.Response.End(); });
          break;
        case "lmconsole":
          Logger.Log(string.Format("<#{0} send JS log#>", context.Request["timestamp"]));
          using (FileStream fs = File.OpenWrite(fn)) {
            fs.Seek(0, SeekOrigin.End);
            context.Request.InputStream.CopyTo(fs);
          }
          break;
        //Silverlight
        case "sl_init":
        case "sl_encode":
          tempFn = Path.ChangeExtension(fn, ".raw");
          if (phase == "sl_init") File.Create(tempFn).Close();
          using (TextReader rdr = new StreamReader(context.Request.InputStream)) {
            var str = rdr.ReadToEnd();
            byte[] data = Convert.FromBase64String(str);
            using (FileStream fs = File.OpenWrite(tempFn)) {
              fs.Seek(0, SeekOrigin.End);
              fs.Write(data, 0, data.Length);
            }
          }
          break;
        case "sl_finish":
          tempFn = Path.ChangeExtension(fn, ".raw");
          using (var srcStream = File.OpenRead(tempFn)) mp3Compress(context, srcStream, fn);
          File.Delete(tempFn);
          break;

        //HTML5
        case "html_init_finish":
        case "html_init":
        case "html_finish":
        case "html_encode":
          tempFn = Path.ChangeExtension(fn, ".raw");
          if (phase == "html_init_finish" || phase == "html_init") File.Create(fn).Close();
          using (FileStream fs = File.OpenWrite(tempFn)) {
            fs.Seek(0, SeekOrigin.End);
            context.Request.InputStream.CopyTo(fs);
          }
          if (phase == "html_init_finish" || phase == "html_finish") {
            using (var srcStream = File.OpenRead(tempFn)) mp3Compress(context, srcStream, fn);
            File.Delete(tempFn);
            break;
          }
          break;
        //case "wav2mp3":
        ////case "startwav2mp3":
        //case "gzipedwav2mp3":
        //  //if (phase == "startwav2mp3") File.Create(fn).Close(); 
        //  if (phase == "wav2mp3") { // || phase == "startwav2mp3")
        //    using (FileStream fs = File.OpenWrite(fn)) {
        //      fs.Seek(0, SeekOrigin.End);
        //      context.Request.InputStream.CopyTo(fs);
        //    }
        //  }

        //  var isGZip = phase == "gzipedwav2mp3";
        //  Stream pcm; string fnWav = fn + ".wav";


        //  if (isGZip) {
        //    pcm = new MemoryStream();
        //    using (var str = File.OpenRead(fn))
        //    using (var gz = new GZipStream(str, CompressionMode.Decompress)) gz.CopyTo(pcm);
        //    pcm.Seek(0, SeekOrigin.Begin);
        //  } else {
        //    File.Move(fn, fnWav);
        //    //File.WriteAllText(dumpFn, File.ReadAllBytes(fnWav).Take(1000).Select(b => b.ToString()).Aggregate((r, i) => r + "," + i));
        //    pcm = File.OpenRead(fnWav);
        //  }

        //  try {
        //    mp3Compress(context, pcm, fn);
        //  } finally {
        //    pcm.Close();
        //    if (!isGZip) File.Delete(fnWav);
        //  }
        //  //}
        //  break;
        default:
          throw new NotImplementedException();
      }
      context.Response.Write("");
    }

    void mp3Compress(HttpContext context, Stream srcStream, string destFn) {
      int SamplesPerSecond, BitsPerSample, Channels;
      var rdr = new BinaryReader(srcStream);
      SamplesPerSecond = rdr.ReadInt16();
      BitsPerSample = rdr.ReadInt16();
      Channels = rdr.ReadInt16();
      using (var mp3 = File.Create(destFn))
      using (var Lame = new LibMp3Lame()) {
        //init lame
        int sr = SamplesPerSecond / 1000;
        if (sr < 8) sr = 8; else if (sr > 56) sr = 56;
        Lame.InputSampleRate = SamplesPerSecond;
        Lame.NumChannels = 1;
        Lame.Mode = MPEGMode.Mono;
        Lame.VBR = VBRMode.ABR;
        Lame.VBRMeanBitrateKbps = sr;
        Lame.InitParams();
        int pos = 0; int bufLen = 8000; int readed;
        byte[] pcmBytes = new byte[bufLen]; short[] pcm16 = new short[bufLen]; byte[] mp3Buf = new byte[bufLen]; int resLen;
        while ((readed = srcStream.Read(pcmBytes, pos, bufLen)) > 0) {
          int samples;
          //prevod byte[] na short[]
          if (BitsPerSample == 8) {
            samples = readed; for (var i = 0; i < samples; i++) pcm16[i] = (short)(((short)pcmBytes[i] - 128) << 8);
          } else {
            samples = readed / 2;
            Buffer.BlockCopy(pcmBytes, 0, pcm16, 0, readed);
            //samples = readed / 2;
            //for (var i = 0; i < samples; i++) pcm16[i] = BitConverter.ToInt16(pcmBytes, i * 2);
          }
          //mp3 dekomprese
          resLen = Lame.Write(pcm16, samples, mp3Buf, bufLen, Channels == 1);
          if (resLen <= 0) throw new Exception();
          mp3.Write(mp3Buf, 0, resLen);
        }
        resLen = Lame.Flush(mp3Buf, bufLen);
        mp3.Write(mp3Buf, 0, resLen);
      }
    }

    public bool IsReusable { get { return true; } }
  }

}