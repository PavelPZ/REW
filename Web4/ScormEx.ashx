<%@ WebHandler Language="C#" Class="ScormExService" %>

using System.Web;

public class ScormExService : IHttpHandler {
  public void ProcessRequest(HttpContext context) {
    Handlers.Request.Process(context, LMComLib.Logger.Error);
  }

  public bool IsReusable { get { return true; } }

}