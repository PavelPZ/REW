using LMNetLib;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace TheWeb.Services {

  public class SystemController : ApiController {

    [ActionName("resetcache"), HttpGet] // http://stackoverflow.com/questions/31622795/webapi-error-when-post-method-is-created-multiple-actions-were-found-that-mat: If you want to use [ActionName] attributes on your controller actions, then your route template needs to include {action}
    public void ResetCache() { Cache.init(); }

    [ActionName("deletelogfiles"), HttpGet]
    public void AzureDeleteLogFiles() {
      LowUtils.TraceErrorCall("Services.SystemController.DeleteLogFiles", () => {
        delDirContent(@"D:\home\LogFiles");
        foreach (var dir in Directory.GetDirectories(@"D:\home\LogFiles")) delDirContent(dir);
      });
    }
    void delDirContent(string dir) {
      foreach (var fn in Directory.GetFiles(dir)) try { File.Delete(fn); } catch { }
    }

    //[ActionName("generateWebApiProxy"), HttpGet]
    //public void generateWebApiProxy() {
    //  //var js = jsWebApiProxy.jsProxyGenerator.LMGetJSProxy();
    //  //File.WriteAllText(@"d:\LMCom\rew\Web4\Schools\GenProxy.ts", js, Encoding.UTF8);
    //}
  }
}