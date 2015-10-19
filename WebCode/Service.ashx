<%@ WebHandler Language="C#" Class="Service" %>

using System.Web;

public class Service : IHttpHandler {

  public void ProcessRequest(HttpContext context) {
    Handlers.Request.Process(context, LMComLib.Logger.Error);
  }
  public bool IsReusable { get { return true; } }

}
