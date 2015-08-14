<%@ WebHandler Language="C#" Class="Service" %>

using System;
using System.Web;
using LMComLib;
using LMNetLib;
using System.IO;
using System.IO.Compression;
using System.Linq;

public class resp {
  public string errorText;
  public int error;
  public object result;
}

public class Service : IHttpHandler {

  public void ProcessRequest(HttpContext context) {
    string parTxt = context.Request.Form[0];
    if (string.IsNullOrEmpty(parTxt)) return;
    object data = null;
    resp resp = new resp();
    var type = context.Request["type"];
    try {
        /* OTHER LOGIN */
      if (type == typeof(Login.CmdAdjustUser).FullName) {
        var par = LowUtils.JSONDecode<Login.CmdAdjustUser>(context.Request["par"]);
        context.Response.ContentType = "text/plain";
        data = LMStatus.rew_OnOtherLogin(par.provider, par.providerId, par.email, par.firstName, par.lastName);
        
      /* LM LOGIN */
      } else if (type == typeof(Login.CmdLmLogin).FullName) {
        var par = LowUtils.JSONDecode<Login.CmdLmLogin>(context.Request["par"]);
        var prof = LMComDataProvider.rew_readProfile(par.email, par.login, par.password);
        if (prof == null || prof.Anonymous) {
          data = null;
          resp.error = (int)Login.CmdLmLoginError.cannotFindUser;
          resp.errorText = "";
        } else {
          Login.CmdProfile res = new Login.CmdProfile() {
            Cookie = new LMCookieJS() {
              EMail = prof.Email,
              FirstName = prof.Address.FirstName,
              LastName = prof.Address.LastName,
              LoginEMail = prof.LoginEMail,
              id = prof.Id,
              Type = prof.OtherType != OtherType.LANGMasterNoEMail ? OtherType.LANGMaster : OtherType.LANGMasterNoEMail,
              TypeId = null,
              Login = prof.Login,
            }
          };
          data = LowUtils.JSONEncode(res);
        }

        /* REGISTER */
      } else if (type == typeof(Login.CmdRegister).FullName) {
        var par = LowUtils.JSONDecode<Login.CmdRegister>(context.Request["par"]);
        var lmcomId = LMStatus.rew_createUserStart(par.subSite, par.Cookie.EMail, par.Cookie.Login, prof => {
          prof.Password = par.password;
          prof.Address.FirstName = par.Cookie.FirstName; prof.Address.LastName = par.Cookie.LastName;
          prof.OtherType = par.Cookie.Type; prof.OtherId = par.Cookie.TypeId;
          prof.LoginEMail = par.Cookie.LoginEMail;
        });
        //if (false && lmcomId < 0) { //DEBUG
        if (lmcomId < 0) {
          data = null;
          resp.error = (int)Login.CmdLmLoginError.userExist;
          resp.errorText = "";
        } else
          data = lmcomId;

        /* SAVE CHANGED PROFILE */
      } else if (type == typeof(Login.CmdProfile).FullName) {
        var par = LowUtils.JSONDecode<Login.CmdProfile>(context.Request["par"]);
        if (!LMStatus.rew_fillProfile(par.lmcomId, prof => {
          prof.LoginEMail = par.Cookie.LoginEMail;
          prof.Address.FirstName = par.Cookie.FirstName;
          prof.Address.LastName = par.Cookie.LastName;
          return true;
        })) {
          resp.error = (int)Login.CmdLmLoginError.passwordNotExists;
        }

        /* CONFIRM REGISTRATION */
      } else if (type == typeof(Login.CmdConfirmRegistration).FullName) {
        var par = LowUtils.JSONDecode<Login.CmdConfirmRegistration>(context.Request["par"]);
        LMStatus.rew_createUserEnd(par.lmcomId);

        /* CHANGE PASSWORD */
      } else if (type == typeof(Login.CmdChangePassword).FullName) {
        var par = LowUtils.JSONDecode<Login.CmdChangePassword>(context.Request["par"]);
        if (!LMStatus.rew_fillProfile(par.lmcomId, prof => {
          if (prof.Password != par.oldPassword) return false;
          prof.Password = par.newPassword;
          return true;
        })) {
          resp.error = (int)Login.CmdLmLoginError.passwordNotExists;
        }

        /* SEND EMAIL */
      } else if (type == typeof(LMComLib.CmdEMail).FullName) {
        var par = LowUtils.JSONDecode<LMComLib.CmdEMail>(context.Request["par"]);
        if (par.isForgotPassword) { //poslani emailu se zapomenutym heslem: dopln heslo z databaze do emailu
          var psw = LMStatus.getPassword(par.To.ToLower());
          if (psw == null)
            resp.error = (int)Login.CmdLmLoginError.cannotFindUser;
          else
            par.Html = par.Html.Replace("####", psw);
        }
        LMComLib.Emailer.SendEMail(par.To, par.From, par.Subject, par.Html, true, null, par.Cc);
      }
    }
    catch (Exception exp) {
      data = null;
      resp.error = 1;
      resp.errorText = LowUtils.ExceptionToString(exp, true);
    }
    resp.result = data;
    var txt = LowUtils.JSONEncode(resp);
    context.Response.Write(txt);
    context.Response.Flush();
    context.Response.End();
  }

  public bool IsReusable { get { return true; } }

}