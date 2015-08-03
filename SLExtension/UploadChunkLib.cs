using ICSharpCode.SharpZipLib.GZip;
using ICSharpCode.SharpZipLib.Zip.Compression.Streams;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;

//namespace uploadChunk {

//  public class lib : IDisposable {

//    static lib() {
//      var parts = Application.Current.Host.Source.AbsoluteUri.Split('/');
//      serviceUrl = parts.Take(parts.Length - 2).Aggregate((r, i) => r + "/" + i) + "/mp3Uploader.ashx";
//    }

//    public lib(Action completed, Func<AudioFormat> audioFormat, string fileUrl) {
//      SLPlayer.JSLog.Write("uploadChunk.lib create");
//      this.completed = completed; this.audioFormat = audioFormat; this.fileUrl = fileUrl;
//      gzipStream = new GZipOutputStream(new ChunkStream(this));
//      isStart = true;
//      //uploadChunkTask(new byte[0], "start").Wait();
//    }

//    //DeflaterOutputStream gzipStream;
//    GZipOutputStream gzipStream; //prubezny gzip stream. vysledku uklada po kouskach do MemoryStreamu
//    //Queue<byte[]> chungStreamWrited = new Queue<byte[]>(); //prubezne vysledky GZipu
//    Queue<byte[]> toUploadChunks = new Queue<byte[]>(); //kdyz je hodne malych kousku v chungStreamWrited, vytvori se vetsi, daji se do toUploadChunks a predaji se k uploadu v jinem threadu.
//    Thread uploadThread; //upload thread pro chunky z toUploadChunks
//    Action completed; //notifikace o ukonceni uploadEnd
//    bool inDispose;
//    public static string serviceUrl;
//    bool isStart;
//    Func<AudioFormat> audioFormat;
//    string fileUrl;

//    public void uploadChunk(byte[] chunk) {
//      lock (this.GetType())
//        gzipStream.Write(chunk, 0, chunk.Length);
//    }

//    public void Dispose() {
//      SLPlayer.JSLog.Write("uploadChunk.lib dispose");
//      inDispose = true;
//      gzipStream.Dispose();
//      //MemoryStream ms = new MemoryStream(10000);
//      //lock (this.GetType()) {
//      //  while (chungStreamWrited.Count > 0) { var b = chungStreamWrited.Dequeue(); ms.Write(b, 0, b.Length); }
//      //}
//      //inDispose = true;
//      //doUploadChunk(ms.ToArray());
//    }

//    //task na synchronni upload chunku. task.SetResult(true) je signal o ukonceni, v tomto okamziku se ukonci cekani v uploadChunk (radek uploadChunkTask(uplCh, ...).Wait())
//    Task uploadChunkTask(byte[] toUploadChunk, string uploadPhase) {
//      TaskCompletionSource<bool> task = new TaskCompletionSource<bool>();
//      //HttpWebRequest webrequest = (HttpWebRequest)WebRequest.Create(new Uri(serviceUrl + "?phase=" + uploadPhase + "&fileUrl=" + fileUrl + (uploadPhase != "endmp3" ? null : "&BitsPerSample=" + audioFormat().BitsPerSample.ToString() + "&SamplesPerSecond=" + audioFormat().SamplesPerSecond.ToString() + "&Channels=" + audioFormat().Channels.ToString()), UriKind.Absolute));
//      HttpWebRequest webrequest = (HttpWebRequest)WebRequest.Create(new Uri(serviceUrl + "?phase=" + uploadPhase + "&fileUrl=" + fileUrl + "&BitsPerSample=" + audioFormat().BitsPerSample.ToString() + "&SamplesPerSecond=" + audioFormat().SamplesPerSecond.ToString() + "&Channels=" + audioFormat().Channels.ToString(), UriKind.Absolute));
//      webrequest.Method = "POST";
//      webrequest.BeginGetRequestStream(reqResult => {
//        Stream requestStream = webrequest.EndGetRequestStream(reqResult);
//        requestStream.Write(toUploadChunk, 0, toUploadChunk.Length);
//        requestStream.Close();
//        webrequest.BeginGetResponse(respResult => {
//          try {
//            HttpWebResponse response = (HttpWebResponse)webrequest.EndGetResponse(respResult);
//            Stream respStream = response.GetResponseStream();
//            using (var ms = new MemoryStream()) respStream.CopyTo(ms);
//            respStream.Close();
//            task.SetResult(true);
//          } catch (Exception exp) {
//            SLPlayer.HTML5Like.error("uploadChunkTask.webrequest.BeginGetResponse", exp);
//          }
//        }, null);
//      }, null);
//      return task.Task;
//    }

//    //predani vetsiho kusu dat k uploadu. Upload se provadi v jinem threadu.
//    void doUploadChunk(byte[] uploadChunk) {
//      lock (this.GetType())
//        toUploadChunks.Enqueue((byte[])uploadChunk.Clone());
//      //zaloz upload thread, pokud jiz neni zalozen
//      if (uploadThread == null) {
//        uploadThread = new Thread(() => {
//          if (inDispose) SLPlayer.JSLog.Write("uploadChunk.lib doUploadChunk inDispose beg");
//          if (isStart) SLPlayer.JSLog.Write("uploadChunk.lib doUploadChunk start beg: " + fileUrl);
//          //proved postupny upload chunku. Pokud jiz zadny neni, zrus thread.
//          while (true) {
//            byte[] uplCh;
//            lock (this.GetType()) {
//              if (toUploadChunks.Count == 0) break;
//              uplCh = toUploadChunks.Dequeue();
//            }
//            uploadChunkTask(uplCh, isStart ? "start" : "body").Wait();
//            isStart = false;
//          }
//          uploadThread = null;
//          if (inDispose) {
//            uploadChunkTask(new byte[0], "gzipedwav2mp3").Wait();
//            if (completed != null) Deployment.Current.Dispatcher.BeginInvoke(completed);
//            completed = null; inDispose = false;
//          }
//          if (inDispose) SLPlayer.JSLog.Write("uploadChunk.lib doUploadChunk inDispose end");
//          if (isStart) SLPlayer.JSLog.Write("uploadChunk.lib doUploadChunk start end");
//        });
//        uploadThread.Start();
//      }
//    }

//    //prebira data ze GZipu a vysledne GZip kousky uklada do chunksBuf
//    //Kdyz je v chunksBuf alespon 50000kb dat, posle je na server
//    public class ChunkStream : Stream {
//      public ChunkStream(lib owner) { this.owner = owner; }
//      public override bool CanRead { get { throw new NotImplementedException(); } }
//      public override bool CanSeek { get { throw new NotImplementedException(); } }
//      public override bool CanWrite { get { return true; } }
//      public override long Length { get { throw new NotImplementedException(); } }
//      public override long Position { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
//      public override int Read(byte[] buffer, int offset, int count) { throw new NotImplementedException(); }
//      public override long Seek(long offset, SeekOrigin origin) { throw new NotImplementedException(); }
//      public override void SetLength(long value) { throw new NotImplementedException(); }
//      public override void Flush() { }

//      public override void Write(byte[] buffer, int offset, int count) {
//        chunksBuf.Write(buffer, offset, count);
//        if (chunksBuf.Length < 50000) return;
//        owner.doUploadChunk(chunksBuf.ToArray());
//        chunksBuf.SetLength(0);
//      }

//      public override void Close() {
//        owner.doUploadChunk(chunksBuf.ToArray());
//        chunksBuf.Close();
//      }

//      lib owner;
//      MemoryStream chunksBuf = new MemoryStream(60000);
//    }

//  }

//}
