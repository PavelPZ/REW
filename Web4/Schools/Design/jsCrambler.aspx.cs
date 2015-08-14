using LMComLib;
using LMNetLib;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;

namespace JSCrambler {

  public partial class Form : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      JSCrambler.Lib.Protect(new JSCrambler.FileItemLow[] { new JSCrambler.FileItem(@"D:\temp\course.js", @"d:\temp\course.protect.js") }, "localhost", DateTime.UtcNow.AddDays(1));
      //JSCrambler.lib.Protect(new JSCrambler.FileItemLow[] { new JSCrambler.FileItem(@"d:\LMCom\rew\Web4\Schools\_course.js", @"d:\temp\course.protect.js") }, "localhost", DateTime.UtcNow.AddDays(1));
      //JSCrambler.lib.Protect(new JSCrambler.FileItemLow[] { new JSCrambler.FileItem(@"d:\LMCom\rew\Web4\JsLib\Scripts\jqueryObj.js", @"d:\temp\course.protect.js") }, "localhost", DateTime.UtcNow.AddDays(1));
      
    }
  }

}