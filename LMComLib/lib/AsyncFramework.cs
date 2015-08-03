using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
//using System.Net;
using System.Text;
using System.Threading;
//using System.Windows.Threading;
#if SILVERLIGHT
using System.Windows.Browser;
using System.Net.Browser;
using System.Windows.Threading;
#endif
using System.Windows;
using LMNetLib;
using System.Net;
using System.Reactive.Linq;
using System.Reactive.Subjects;
//using System.Windows.Threading;
#if WINDOWS_PHONE
using Microsoft.Phone.Reactive;
#endif

namespace LMComLib {

#if SILVERLIGHT
  public static class AsyncAppContext {

    public static IObservable<bool> IsBussySource { get { return ((IObservable<bool>)isBussySource).ObserveOn(MainThread); } } static Subject<bool> isBussySource = new Subject<bool>();
    public static IObservable<string> MessageSource { get { return ((IObservable<string>)messageSource).ObserveOn(MainThread); } } static Subject<string> messageSource = new Subject<string>();

    static List<WeakReference> AllDisposable = new List<WeakReference>();
    public static void DisposeOnExit(IDisposable disp) {
      AllDisposable.Add(new WeakReference(disp));
    }

    public static showExceptionEvent showException;
    public static bool AppExiting {
      get { return _AppExiting; }
      set {
        if (_AppExiting == value) return; _AppExiting = value;
        if (!value) return;
        var d = AllDisposable.Where(w => w.IsAlive).ToArray();
        foreach (WeakReference wf in AllDisposable.Where(w => w.IsAlive)) ((IDisposable)wf.Target).Dispose();
      }
    } static bool _AppExiting;

    public static void ShowException(Exception exp) { if (showException != null) showException(exp); }

    public static SynchronizationContext MainThread;

    public static void ExecuteInMainThread(LMEventHandler ev) {
      if (AppExiting) return;
      if (MainThread == null) ev(); else MainThread.Post(st => { if (AppExiting) return; ev(); }, null);
    }

    public static void ExecuteTimer(LMEventHandler ev) {
      ExecuteTimer(1, ev);
    }

    public static void ExecuteTimer(int msec, LMEventHandler ev) {
      DispatcherTimer t = new DispatcherTimer() { Interval = TimeSpan.FromMilliseconds(msec) };
      t.Tick += (s, a) => { ((DispatcherTimer)t).Stop(); ev(); };
      t.Start();
    }

    public static void ChangeMessage(string message) {
      if (AppExiting) return;
      messageSource.OnNext(message);
    }

    public static void Freeze(string message) {
      if (AppExiting) return;
      if (message != null) messageSource.OnNext(message);
      changeShowCount(true);
    }

    public static bool UnfreezeStr(string errorTxt) {
      if (AppExiting) return true;
      changeShowCount(false);
      if (errorTxt != null) throw new Exception(errorTxt);
      return false;
    }

    public static bool Unfreeze(Exception e) {
      if (AppExiting) return true;
      changeShowCount(false);
      if (e != null) throw e;
      return false;
    }

    public static void Clear() {
      _showCount = 0;
      isBussySource.OnNext(false);
    }

    static void changeShowCount(bool isAdd) {
      if (isAdd) {
        if (_showCount == 0) isBussySource.OnNext(true);
        _showCount++;
      } else {
        if (_showCount == 0) throw new Exception("showCount <= 0");
        _showCount--;
        if (_showCount == 0) DisposeOnExit(Observable.Interval(TimeSpan.FromMilliseconds(100)).Take(1).Subscribe((t) => {
          if (_showCount == 0) isBussySource.OnNext(false);
        }));
      }
    } static int _showCount;

    public delegate void showExceptionEvent(Exception exp);

  }
#else
  public static class AsyncAppContext {
    public static bool AppExiting;
    public static void ShowException(Exception exp) {  }
    public static void Progress(int p) { }
    public static void ExecuteInMainThread(LMEventHandler ev) { ev(); }
  }
#endif

  public static class WebDownloads {

#if SILVERLIGHT
    //public static string selfDomain;
    static string proxyUrl;
    public static string rootUrl;

    public static void InitCrossDomainDownload(string proxyPath) {
      string bp = Application.Current.Host.Source.AbsoluteUri;
      rootUrl = bp.Substring(0, bp.LastIndexOf('/') + 1).ToLower();
      proxyUrl = rootUrl + proxyPath.ToLower() + "?";
    }

    static string AddCrossDomainUrl(string url) {
      if (rootUrl == null || url.ToLower().StartsWith(rootUrl)) return url;
      return proxyUrl + HttpUtility.UrlEncode(url);
    }
#else
    static string AddCrossDomainUrl(string url) {return url;}
#endif

    /*static string RemoveCrossDomainUrl(string url) {
      if (!url.ToLower().StartsWith(proxyUrl)) return url;
      return HttpUtility.UrlDecode(url.Substring(proxyUrl.Length));
    }*/

    public class DownloadResult<T> {
      public T Doc;
      public Encoding Enc;
      public string Url;
      public Exception Exp;
    }

    public delegate T StreamToObject<T>(Stream str, Encoding enc, string url);

    public static void OpenRead(this WebClient wc, Uri uri, LMEventHandler<Stream> onContinue) {
      wc.OpenReadCompleted += new OpenReadCompletedEventHandler((s2, e2) => { //after downloading
        if (AsyncAppContext.AppExiting) return;
        if (e2.Error != null) AsyncAppContext.ShowException(e2.Error);
        AsyncAppContext.ExecuteInMainThread(() => onContinue(e2.Result)); //continue action after successfull downloading
      });
      /*wc.DownloadProgressChanged += new DownloadProgressChangedEventHandler((s3, e3) => {
        AsyncAppContext.Progress(e3.ProgressPercentage); //downloading progress
      });*/
      wc.OpenReadAsync(uri); //start downloading
    }

    public static void OpenWrite(this WebClient wc, Uri uri, LMEventHandler<Stream> onWrite, LMEventHandler onContinue) {
      wc.OpenWriteCompleted += new OpenWriteCompletedEventHandler((s, e) => {
        onWrite(e.Result);
        e.Result.Close();
      });
#if SILVERLIGHT
      wc.WriteStreamClosed += new WriteStreamClosedEventHandler((s, e) => {
        if (e.Error != null) AsyncAppContext.ShowException(e.Error);
        AsyncAppContext.ExecuteInMainThread(onContinue);
      });
#endif
      wc.OpenWriteAsync(uri);
    }

#if SILVERLIGHT
    public static void Download(string url, string msg, LMEventHandler<Stream> completed) {
      AsyncAppContext.Freeze(msg);
      Download(url).Subscribe(inStr => {
        using (inStr) {
          if (AsyncAppContext.Unfreeze(null)) return;
          completed(inStr);
        }
      }, exp => {
        AsyncAppContext.Unfreeze(new Exception(url, exp));
      });
    }
#endif

    public static IObservable<Stream> Download(string url) {
      var req = (HttpWebRequest)WebRequest.Create(new Uri(AddCrossDomainUrl(url)));
      return Observable.FromAsyncPattern<WebResponse>(req.BeginGetResponse, req.EndGetResponse)().Select(resp => resp.GetResponseStream());
    }
    //http://blogs.microsoft.co.il/blogs/bnaya/archive/2010/02/25/rx-for-beginners-toc.aspx
    public static void Download<T>(IEnumerable<string> urls, int timeoutMSec, StreamToObject<T> createObject, LMEventHandler<List<DownloadResult<T>>> completed) {
      List<DownloadResult<T>> res = new List<DownloadResult<T>>();
      var obs = Observable.Merge(urls.Select(url => StartDownload<T>(url, timeoutMSec, createObject)));
      obs.Subscribe(r => res.Add(r), exp => { }, () => completed(res));
    }

    public const string binContentType = "application/x-www-form-urlencoded";
    public const string textContentType = "text/plain";

    public static void DoWebRequest(string url, Action<Stream> writePostData, string contentType, Action<Stream> completed, Action<Exception> error) {
      var request = (HttpWebRequest)WebRequest.Create(url);
      request.Method = "POST";
      request.ContentType = contentType;

      request.BeginGetRequestStream(
          req => {
            using (var stream = request.EndGetRequestStream(req)) writePostData(stream);
            request.BeginGetResponse(ar => { 
               var r = (HttpWebRequest)ar.AsyncState;
               var resp = r.EndGetResponse(ar);
               using (var outStr = ((HttpWebResponse)resp).GetResponseStream()) completed(outStr);
            }, request);
          },
          null);
    }

    public static void DoWebRequest(Uri uri, Stream postData, Stream downloadData, Action<Exception> error, Action completed, string contentType = "application/x-www-form-urlencoded") {
      var request = (HttpWebRequest)WebRequest.Create(uri);
      request.Method = "POST";
      request.ContentType = contentType;

      var fetchRequestStream = Observable.FromAsyncPattern<Stream>(request.BeginGetRequestStream, request.EndGetRequestStream);
      var fetchResponse = Observable.FromAsyncPattern<WebResponse>(request.BeginGetResponse, request.EndGetResponse);

      var req = fetchRequestStream().SelectMany(stream => {
        LowUtils.CopyStream(postData, stream);
        return fetchResponse();
      });
      var resp = req.Select(webResponse => {
        using (var outStr = ((HttpWebResponse)webResponse).GetResponseStream()) LowUtils.CopyStream(outStr, downloadData, 64000);
        return true;
      });
      resp.Subscribe(
        ok => {
          if (ok) return;
        },
        err => {
          if (err == null) return;
        },
        () => {
          postData = null;
        }
      );
    }

    public abstract class UploadInfo {
      public abstract Stream uploadRequest();
      public abstract void saveResponse(Stream str);
    }

    public static IObservable<int> Upload(string url, UploadInfo info) {
      return Observable.Create<int>(obs => {
#if SILVERLIGHT
        HttpWebRequest httpRequest = (HttpWebRequest)WebRequestCreator.ClientHttp.Create(new Uri(url));
#else
        HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(new Uri(url));
#endif
#if SILVERLIGHT
        LMComLib.Logging.log("Upload Start " + url);
#endif
        Stream inStr = info.uploadRequest();
        httpRequest.Method = "POST";
        httpRequest.ContentLength = inStr.Length;
        httpRequest.AllowWriteStreamBuffering = false;
        httpRequest.ContentType = "application/x-www-form-urlencoded";
        Observable.FromAsyncPattern<Stream>(httpRequest.BeginGetRequestStream, httpRequest.EndGetRequestStream)().Subscribe(
          requestStream => {
            using (requestStream) {
              byte[] bs = new byte[32768];
              int numRead;
              while ((numRead = inStr.Read(bs, 0, bs.Length)) > 0) {
                requestStream.Write(bs, 0, numRead);
#if SILVERLIGHT
                LMComLib.Logging.log("Upload Progress " + numRead.ToString());
#endif
                obs.OnNext(numRead);
              }
            }
          },
          exp => { throw exp; },
          () => {
            Observable.FromAsyncPattern<WebResponse>(httpRequest.BeginGetResponse, httpRequest.EndGetResponse)().Subscribe(
              webResponse => { using (webResponse) using (Stream str = webResponse.GetResponseStream()) info.saveResponse(str); },
              exp2 => { throw exp2; },
              () => obs.OnCompleted()
            );
          }
        );
        return () => { };
      });
    }


    static IObservable<DownloadResult<T>> StartDownload<T>(string url, int timeoutMSec, StreamToObject<T> createObject) {
      var okObs = Observable.Create<DownloadResult<T>>(obs => {
        var req = (HttpWebRequest)WebRequest.Create(new Uri(AddCrossDomainUrl(url)));
        Observable.FromAsyncPattern<WebResponse>(req.BeginGetResponse, req.EndGetResponse)().Timeout(TimeSpan.FromMilliseconds(timeoutMSec)).Subscribe(resp => {
          DownloadResult<T> res = new DownloadResult<T>() { Exp = null, Url = url };
          using (Stream str = resp.GetResponseStream()) { res.Doc = createObject(str, EncodingFromContentType(resp.ContentType), url); }
          obs.OnNext(res);
        }, exp => obs.OnError(exp), () => obs.OnCompleted());
        return () => { req.Abort(); };
      });
      return okObs.Catch<DownloadResult<T>, Exception>(exp => Observable.Return<DownloadResult<T>>(new DownloadResult<T>() { Exp = exp, Url = url }));
    }

    static Encoding EncodingFromContentType(string cnt) {
      if (string.IsNullOrEmpty(cnt)) return Encoding.UTF8;
      //string[] parts = cnt.Split(new string[] { "charset=" }, StringSplitOptions.RemoveEmptyEntries); TODO
      return Encoding.UTF8;
    }


  }

}
