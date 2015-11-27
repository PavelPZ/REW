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

    [ActionName("resetcache"), HttpGet] // api/system/resetcache, http://stackoverflow.com/questions/31622795/webapi-error-when-post-method-is-created-multiple-actions-were-found-that-mat: If you want to use [ActionName] attributes on your controller actions, then your route template needs to include {action}
    public void ResetCache() { Cache.init(); }

    [ActionName("deletelogfiles"), HttpGet] // api/system/deletelogfiles
    public void DeleteLogFiles() {
      LowUtils.TraceErrorCall("Services.SystemController.DeleteLogFiles", () => {
        delDirContent(@"D:\home\LogFiles", false);
        foreach (var dir in Directory.GetDirectories(@"D:\home\LogFiles")) delDirContent(dir, true);
      });
    }
    void delDirContent(string dir, bool incDirs) {
      //foreach (var fn in Directory.GetFiles(dir)) try { File.Delete(fn); } catch { }
      if (incDirs) foreach (var subDir in Directory.GetDirectories(dir)) try { Directory.Delete(subDir, true); } catch { }
    }
  }
}