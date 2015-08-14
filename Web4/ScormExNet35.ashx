<%@ WebHandler Language="C#" Class="ScormExNet35" %>

using System.Web;
using System.IO;

public class ScormExNet35 : IHttpHandler {
  public void ProcessRequest(HttpContext context) {
    //LMComLibNet35.Lib.connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["ScormExNet35Container"].ConnectionString;
    LMComLibNet35.Lib.connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Container"].ConnectionString;
    LMComLibNet35.Logger.onLog = (id, msg) => {
      lock (typeof(ScormExNet35)) {
        using (StreamWriter wr = new StreamWriter(System.Web.Hosting.HostingEnvironment.MapPath(@"~/app_data/newdatanet35.log"), true))
          wr.WriteLine(msg);
      }
    };

    if (context.Request["waitfor"] != null) { context.Response.Write("{}"); return; }
    if (context.Request["type"] == null) { context.Response.Write(LMComLibNet35.Lib.Test()); return; }

    LMComLibNet35.RewRpcLib.ProcessRequest(context, LMComLibNet35.Logger.Error, service);
  }

  public bool IsReusable { get { return true; } }

  static NewDataNet35.ScormExServer.ScormExServerPar service = new NewDataNet35.ScormExServer.ScormExServerPar();

}