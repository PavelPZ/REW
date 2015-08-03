//http://www.xml-rpc.net/faq/xmlrpcnetfaq.html
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Web.Hosting;
using System.Text;
using System.Configuration;
using System.Web;
using System.Diagnostics;
using CookComputing.XmlRpc;

using LMComLib;
using LMNetLib;

//Debug jmeno a heslo: bizi/asdf
namespace LMComLib.Seznam {

  public class SeznamApiException : Exception {

    public SeznamApiException()
      : base() {
    }

    public SeznamApiException(string message)
      : base(message) {
    }
  }

  public static class Utils {
    public static string ProxyUrl = ConfigurationManager.AppSettings["Seznam.ProxyUrl"];
    public static string LideProxyUrl = ConfigurationManager.AppSettings["Seznam.LideProxyUrl"];
    public static string loginUrl = ConfigurationManager.AppSettings["Seznam.LoginUrl"];
    public static string serviceId = ConfigurationManager.AppSettings["Seznam.ServiceId"];
    public static string cookieName = ConfigurationManager.AppSettings["Seznam.CookieName"];

    public static string loginBasicUrl() {
      return Machines.isSeznamDebug() ? "~/Services/DebugSeznamLogin.aspx?loggedURL=" : loginUrl;
    }
    public static string LoginUrl() {
      urlInfo ui = urlInfo.GetUrlInfo();
      return loginBasicUrl() + HttpUtility.UrlEncode(ui.AbsoluteUri);
    }
    public static string LoginUrl(LMApps appId, string path, bool virtualRootAdded) {
      return LoginUrl(appId, path, virtualRootAdded, false);
    }
    public static string LoginUrl(LMApps appId, string path, bool virtualRootAdded, bool isDefault) {
      return loginBasicUrl() + HttpUtility.UrlEncode(urlInfo.getUrl(Domains.sz, SubDomains.no, appId, "cs-cz", path, virtualRootAdded));
    }


    public static string EaLoginUrl(CourseIds crsId) {
      return LoginUrl(LMApps.ea, crsId.ToString() + "/home.htm", false, Machines.isBuildEACache);
    }

    public static void Logout(HttpContext ctx) {
      try {
        //new DebugEvent("LMComLib.Seznam.Utils.Logout", 0).Raise();
        HttpCookie seznamCook = ctx.Request.Cookies[cookieName];
        if (seznamCook == null || string.IsNullOrEmpty(seznamCook.Value)) return;
        //vymazani anonymniho LM cookie z prohlizece
        HttpCookie delCook = new HttpCookie(cookieName);
        delCook.Expires = DateTime.UtcNow.AddDays(-1);
        ctx.Response.Cookies.Set(delCook);
        ctx.Request.Cookies.Remove(cookieName);
        //vymazani Cookie pro LastRequest
        HttpCookie lastReqCook = new HttpCookie("LastReqSave");
        lastReqCook.Expires = DateTime.UtcNow.AddDays(-1);
        ctx.Response.Cookies.Set(lastReqCook);
        //vymazani anonymniho LM cookie z temporary promenne
        LMStatus.logout();
        //HttpContext.Current.Items[LMStatus.c_cookieName] = null;
        //notifikace Seznamu - session.close
        session.ISession sess = (session.ISession)XmlRpcProxyGen.Create(typeof(session.ISession));
        SeznamLogger.AttachProxy(sess, SeznamProxyId.ISession, false);
        session.closeAttributes attr = new session.closeAttributes();
        attr.clientIp = ctx.Request.UserHostAddress;
        attr.serviceId = serviceId;
        attr.userAgent = ctx.Request.UserAgent;
        session.closeResponse resp = sess.close(seznamCook.Value, attr);
        if (resp.status == 402) return;
        if (resp.status != 200) {
          throw new Exception("Seznam RPC Error" + resp.statusMessage);
        }
      } catch (Exception exp) {
        //new DebugEvent("LMComLib.Seznam.Utils.Logout", 2).Raise();
        new ErrorEvent(System.Diagnostics.TraceLevel.Error, TraceCategory.All, exp.Message).Raise();
      }
    }

    static void initProfile(int userId, ProfileData profile, bool isDebug) {
      if (isDebug) {
        profile.Email = Math.Abs(userId).ToString() + "@seznam.cz";
        return;
      }
      user.IUser IUserInst = (user.IUser)XmlRpcProxyGen.Create(typeof(user.IUser));
      SeznamLogger.AttachProxy(IUserInst, SeznamProxyId.IUser, false);
      user.userAttribsResponse userAttribs = getUserAttributes(IUserInst, userId);
      //new DebugEvent("initProfile " + userAttribs.userData.username, 1).Raise();
      profile.Email = userAttribs.userData.username + "@" + userAttribs.userData.domain;
      profile.Address.City = userAttribs.userData.city;
      profile.Address.Country = userAttribs.userData.country;
      profile.Address.FirstName = userAttribs.userData.nameFirst;
      profile.Address.LastName = userAttribs.userData.nameLast;
      profile.Address.Street = userAttribs.userData.address;
      profile.Address.Zip = userAttribs.userData.zip;
      profile.Phone = userAttribs.userData.phone;
      profile.Male = userAttribs.userData.sex == "M";
      //new DebugEvent("initProfile " + userAttribs.userData.username, 2).Raise();
    }

    static ProfileData createSeznamProfile(HttpContext ctx, int seznamId, bool isDebug) {
      //vytvoreni profilu
      ProfileData prof = LMComDataProvider.readOtherProfile(OtherType.Seznam, seznamId.ToString());
      //new DebugEvent("createSeznamProfile ", 1).Raise();
      if (prof == null) { //profil neni zalozen v databazi - zaloz
        prof = LMComDataProvider.createProfileStart(Domains.sz);
        //new DebugEvent("createSeznamProfile " + prof.Id.ToString(), 2).Raise();
        prof.OtherType = OtherType.Seznam;
        prof.OtherId = seznamId.ToString();
        prof.Roles = 0;
        initProfile(seznamId, prof, isDebug);
        LMComDataProvider.WriteProfile(prof);
        //new DebugEvent("createSeznamProfile " + prof.Id.ToString(), 3).Raise();
      }
      LMComDataProvider.setProfileToCache(prof);
      return prof;
    }

    public static void simulateSeznamLogin(HttpContext ctx, string seznamId) {
      int id;
      if (!int.TryParse(seznamId, out id)) return;
      //id = -Math.Abs(id);
      HttpCookie seznamCook = new HttpCookie(cookieName);
      seznamCook.Value = id.ToString();
      ctx.Response.Cookies.Add(seznamCook);
    }


    public static LMCookie getSeznamCookie(HttpContext ctx, LMCookie oldCook, urlInfo ui) {
      try {
        //Existence Seznam cookie
        HttpCookie seznamCook = ctx.Request.Cookies[cookieName];
        //new DebugEvent("getSeznamCookie", 1).Raise();
        if (seznamCook == null || string.IsNullOrEmpty(seznamCook.Value)) return null;
        //new DebugEvent("getSeznamCookie", 2).Raise();
        ProfileData profile = null; int seznamId = -1;
        //new DebugEvent("getSeznamCookie " + seznamCook.Value, 1).Raise();
        //DEBUG mode pro PZ pocitac
        if (Machines.isSeznamDebug()) {
          if (!int.TryParse(seznamCook.Value, out seznamId)) return null;
          if (oldCook.seznamId == seznamId) return oldCook;
          profile = createSeznamProfile(ctx, seznamId, true);
        } else {
          //Parse cookie string
          session.ISession sess = (session.ISession)XmlRpcProxyGen.Create(typeof(session.ISession));
          SeznamLogger.AttachProxy(sess, SeznamProxyId.no, false);
          session.checkAttributes attr = new session.checkAttributes();
          attr.clientIp = ctx.Request.UserHostAddress;
          attr.serviceId = serviceId;
          attr.userAgent = ctx.Request.UserAgent;
          //new DebugEvent("getSeznamCookie " + attr.clientIp + "/" + attr.serviceId + "/" + attr.userAgent, 21).Raise();
          //new DebugEvent("getSeznamCookie", 31).Raise();
          session.checkResponse resp = sess.check(seznamCook.Value, attr);
          //new DebugEvent("getSeznamCookie", 3).Raise();
          if (resp.status == 402) return null;
          if (resp.status != 200)
            throw new Exception("Seznam RPC Error 1 " + resp.statusMessage);
          //new DebugEvent("getSeznamCookie " + resp.userId.ToString(), 3).Raise();
          //zjisteni SeznamID, zalozeni profilu
          //new DebugEvent("getSeznamCookie", 4).Raise();
          seznamId = resp.userId;
          if (oldCook != null && oldCook.seznamId == seznamId) return oldCook;
          //new DebugEvent("getSeznamCookie", 5).Raise();
          profile = createSeznamProfile(ctx, seznamId, false);
          //new DebugEvent("getSeznamCookie " + profile.Id.ToString(), 4).Raise();
          //Aktualizace Seznam cookie
          seznamCook.Value = resp.session; seznamCook.HttpOnly = true; /*seznamCook.Expires = DateTime.UtcNow.AddMinutes(30);*/ seznamCook.Domain = "lide.cz";
          ctx.Response.Cookies.Add(seznamCook);
        }
        //Vytvoreni LM Cookie
        LMCookie cook = new LMCookie();
        cook.EMail = profile.Email;
        cook.id = profile.Id;
        cook.seznamId = seznamId;
        //new DebugEvent("getSeznamCookie", 6).Raise();
        return cook;
      } catch (Exception exp) {
        //vymazani Seznam cookie
        HttpCookie delCook = new HttpCookie(cookieName);
        delCook.Expires = DateTime.UtcNow.AddDays(-1);
        ctx.Response.Cookies.Add(delCook);
        //new DebugEvent("getSeznamCookie " + exp.Message, 9).Raise();
        //new DebugEvent(exp.Message, 6).Raise();
        //new ErrorEvent(System.Diagnostics.TraceLevel.Error, TraceCategory.All, "Seznam.Utils.getSeznamCookie" + exp.Message).Raise();
        SeznamLogger.error(exp);
        return null;
      }
    }

    public static string getTicketQuery(HttpContext ctx) {
      LMCookie cook = LMCookie.DeserializeCookie();
      if (cook == null) return null;
      if (string.IsNullOrEmpty(cook.EMail) || cook.seznamId <= 0) return null;
      ticket.ITicket ITicketInst = (ticket.ITicket)XmlRpcProxyGen.Create(typeof(ticket.ITicket));
      SeznamLogger.AttachProxy(ITicketInst, SeznamProxyId.ITicket, false);
      ticket.createResponse resp = ITicketInst.create(cook.seznamId, false);
      if (resp.status != 200) return null;
      return HttpUtility.UrlEncode(resp.ticket);
    }

    public static user.userAttribsResponse getUserAttributes(user.IUser usrInfo, int SeznamId) {
      user.getServiceMappingResponse servMap = usrInfo.getServiceMapping(SeznamId, serviceId);
      if (servMap.status != 200) {
        user.mapServiceResponse ms = usrInfo.mapService(SeznamId, serviceId);
        if (ms.status != 200)
          throw new SeznamApiException("Seznam.Utils.getUserAttributes.mapService - " + ms.status + ": " + ms.statusMessage + ", userId=" + SeznamId);
      }
      user.userAttribsResponse usrAttrResp = usrInfo.getAttributes(SeznamId);
      if (usrAttrResp.status != 200)
        throw new SeznamApiException("Seznam.Utils.getUserAttributes.getAttributes - " + usrAttrResp.status + ": " + usrAttrResp.statusMessage + ", userId=" + SeznamId);
      return usrAttrResp;
    }

    public static string getPortraitUrl(int seznamId, lideUser.IUser IUserLideInst, user.userAttributes userData) {
      string iconUrl = null;
      try {
        lideUser.userGetPortraitResponse lidePortrait = IUserLideInst.getPortrait(new int[] { seznamId });
        if (lidePortrait.status == 200 && lidePortrait.portraits != null && lidePortrait.portraits.Length > 0)
          iconUrl = lidePortrait.portraits[0].portraitUrl;
      } catch {
        iconUrl = null;
      }
      if (string.IsNullOrEmpty(iconUrl))
        iconUrl = VirtualPathUtility.ToAbsolute(userData.sex == "M" ? "~/App_Themes/site/img/profileM.gif" : "~/App_Themes/site/img/profileF.gif");
      return iconUrl;
    }

    public const string iconUrlPrefix = "http://i.im.cz";

    public static string userName(user.userAttributes data) {
      return data.username + "@" + data.domain;
    }

    public static string JSONProfile(HttpContext context) {
      LMCookie cook = LMCookie.DeserializeCookie(context);
      if (cook == null || cook.EMail == null || cook.seznamId == 0) return "{isAuthenticated:false}";
      StringBuilder sb = new StringBuilder();
      try {
        sb.Append("{isAuthenticated:true");
        //SeznamId
        sb.Append(",id:"); sb.Append(cook.id);
        //Seznam profil
        user.IUser IUserInst = (user.IUser)XmlRpcProxyGen.Create(typeof(user.IUser));
        SeznamLogger.AttachProxy(IUserInst, SeznamProxyId.IUser, false);
        user.userAttribsResponse usrAttrResp = getUserAttributes(IUserInst, cook.seznamId);
        //informace o kontaktech z lide.cz
        lideUser.IUser IUserLideInst = (lideUser.IUser)XmlRpcProxyGen.Create(typeof(lideUser.IUser));
        SeznamLogger.AttachProxy(IUserLideInst, SeznamProxyId.ILideUser, true);
        lideUser.userGetHeadResponse lideHead;
        try {
          lideHead = IUserLideInst.getHead(cook.seznamId);
        } catch {
          lideHead = new lideUser.userGetHeadResponse(); lideHead.status = 0;
        }

        //UserName
        sb.Append(",userName:'"); sb.Append(usrAttrResp.userData.username); sb.Append("'");
        //Sex
        sb.Append(",male:"); sb.Append(usrAttrResp.userData.sex == "M" ? "true" : "false");
        //Lide - head
        if (lideHead.status == 200) {
          //novych mailu
          sb.Append(",newEmails:"); sb.Append(lideHead.head.newEmails);
          //novych zprav
          sb.Append(",newMessages:"); sb.Append(lideHead.head.newMessages);
          //pratel online
          sb.Append(",onlineFriends:"); sb.Append(lideHead.head.onlineFriends);
        } else
          sb.Append(",newEmails:0,newMessages:0,onlineFriends:0");
        //Lide - portret
        //sb.Append(",portraitUrl:'"); sb.Append(getPortraitUrl(cook.seznamId, IUserLideInst, usrAttrResp.userData)); sb.Append("'");
        sb.Append(",portraitUrl:'"); sb.Append(iconUrlPrefix + usrAttrResp.userData.iconUrl); sb.Append("'");
        sb.Append(",userName:'"); sb.Append(userName(usrAttrResp.userData)); sb.Append("'");
        //return result
        sb.Append('}');
        return sb.ToString();
      } catch {
        sb.Length = 0;
        sb.Append("{isAuthenticated:true");
        //SeznamId
        sb.Append(",id:"); sb.Append(cook.id);
        sb.Append(",userName:'"); sb.Append("'");
        //Sex
        sb.Append(",male:"); sb.Append("true");
        sb.Append(",newEmails:0,newMessages:0,onlineFriends:0");
        sb.Append(",portraitUrl:'"); sb.Append("'");
        sb.Append(",userName:'"); sb.Append("'");
        //return result
        sb.Append('}');
        return sb.ToString();
      }
    }
    public static string JSONProfileNew(HttpContext ctx) {
      LMCookie cook = LMStatus.GetCookieLow(ctx);
      if (cook == null || cook.EMail == null || cook.seznamId == 0) return "{isAuthenticated:false}";
      StringBuilder sb = new StringBuilder();
      try {
        sb.Append("{isAuthenticated:true");
        //SeznamId
        sb.Append(",id:"); sb.Append(cook.id);
        //Seznam profil
        user.IUser IUserInst = (user.IUser)XmlRpcProxyGen.Create(typeof(user.IUser));
        SeznamLogger.AttachProxy(IUserInst, SeznamProxyId.IUser, false);
        user.userAttribsResponse usrAttrResp = getUserAttributes(IUserInst, cook.seznamId);
        //informace o kontaktech z lide.cz
        lideUser.IUser IUserLideInst = (lideUser.IUser)XmlRpcProxyGen.Create(typeof(lideUser.IUser));
        SeznamLogger.AttachProxy(IUserLideInst, SeznamProxyId.ILideUser, true);
        lideUser.userGetHeadResponse lideHead;
        try {
          lideHead = IUserLideInst.getHead(cook.seznamId);
        } catch {
          lideHead = new lideUser.userGetHeadResponse(); lideHead.status = 0;
        }

        //UserName
        sb.Append(",userName:'"); sb.Append(usrAttrResp.userData.username); sb.Append("'");
        //Sex
        sb.Append(",male:"); sb.Append(usrAttrResp.userData.sex == "M" ? "true" : "false");
        //Lide - head
        if (lideHead.status == 200) {
          //novych mailu
          sb.Append(",newEmails:"); sb.Append(lideHead.head.newEmails);
          //novych zprav
          sb.Append(",newMessages:"); sb.Append(lideHead.head.newMessages);
          //pratel online
          sb.Append(",onlineFriends:"); sb.Append(lideHead.head.onlineFriends);
        } else
          sb.Append(",newEmails:0,newMessages:0,onlineFriends:0");
        //Lide - portret
        //sb.Append(",portraitUrl:'"); sb.Append(getPortraitUrl(cook.seznamId, IUserLideInst, usrAttrResp.userData)); sb.Append("'");
        sb.Append(",portraitUrl:'"); sb.Append(iconUrlPrefix + usrAttrResp.userData.iconUrl); sb.Append("'");
        sb.Append(",userName:'"); sb.Append(userName(usrAttrResp.userData)); sb.Append("'");
        //return result
        sb.Append('}');
        return sb.ToString();
      } catch {
        sb.Length = 0;
        sb.Append("{isAuthenticated:true");
        //SeznamId
        sb.Append(",id:"); sb.Append(cook.id);
        sb.Append(",userName:'"); sb.Append("'");
        //Sex
        sb.Append(",male:"); sb.Append("true");
        sb.Append(",newEmails:0,newMessages:0,onlineFriends:0");
        sb.Append(",portraitUrl:'"); sb.Append("'");
        sb.Append(",userName:'"); sb.Append("'");
        //return result
        sb.Append('}');
        return sb.ToString();
      }
    }
  }

  public class SeznamLogger : XmlRpcLogger {

    static SeznamLogger() {
      isLog = System.Configuration.ConfigurationManager.AppSettings["Seznam.LogRpc"] == "true";
      timeOut = int.Parse(System.Configuration.ConfigurationManager.AppSettings["Seznam.ProxyTimeOut"]);
    }
    static bool isLog;
    static int timeOut;

    SeznamLogger(IXmlRpcProxy proxy, SeznamProxyId id) {
      url = proxy.Url;
      this.id = id;
      Attach(proxy);
    }

    /*public static void AttachProxy(IXmlRpcProxy proxy, bool isLideUrl) {
      proxy.Url = isLideUrl ? Utils.LideProxyUrl : Utils.ProxyUrl;
      if (timeOut > 0) proxy.Timeout = timeOut;
      SeznamLogger logg = new SeznamLogger();
      logg.url = proxy.Url;
    }*/

    public static void AttachProxy(IXmlRpcProxy proxy, SeznamProxyId id, bool isLideUrl) {
      proxy.Url = isLideUrl ? Utils.LideProxyUrl : Utils.ProxyUrl;
      if (timeOut > 0) proxy.Timeout = timeOut;
      if (!isLog) return;
      new SeznamLogger(proxy, id);
    }

    SeznamProxyId id;
    string url;
    StringBuilder _sb;
    StringBuilder sb {
      get {
        if (!isLog) return null;
        if (_sb == null) _sb = getSb();
        return _sb;
      }
    }

    static StringBuilder getSb() {
      if (!isLog) return null;
      StringBuilder res = (StringBuilder)HttpContext.Current.Items["SeznamLogger"];
      if (res != null) return res;
      res = new StringBuilder();
      HttpContext.Current.Items["SeznamLogger"] = res;
      return res;
    }

    void makeEvent(bool isReq, Stream str, long num) {
      if (!isLog) return;
      string xml = SeznamRpcEvent.streamToString(str);
      if (sb != null) {
        _sb.AppendLine(SeznamRpcEvent.makeMessage(true, id, url, xml, num));
        _sb.AppendLine("================");
        _sb.AppendLine(HttpUtility.HtmlEncode (xml));
        _sb.AppendLine(null); sb.AppendLine(null);
      } else 
        new SeznamRpcEvent(true, id, url, xml, num).Raise();
    }

    protected override void OnRequest(object sender, XmlRpcRequestEventArgs e) {
      makeEvent(true, e.RequestStream, e.RequestNum);
    }

    protected override void OnResponse(object sender, XmlRpcResponseEventArgs e) {
      if (!isLog) return;
      if (e.RequestNum < 0) {//ERROR
        HttpContext.Current.Items["SeznamLoggerError"] = true;
        e.ResponseStream.Position = 0;
        byte[] data = new byte[e.ResponseStream.Length];
        e.ResponseStream.Read(data, 0, data.Length);
        string err = Encoding.UTF8.GetString(data);
        if (sb != null) {
          _sb.AppendLine("=== ERROR =============");
          _sb.AppendLine(err);
          _sb.AppendLine(null); sb.AppendLine(null);
        } else
          new SeznamRpcEvent(id, Math.Abs(e.RequestNum), err).Raise();
      } else
        makeEvent(true, e.ResponseStream, e.RequestNum);
    }

    public static void reqEnd() {
      if (!isLog) return;
      StringBuilder res = (StringBuilder)HttpContext.Current.Items["SeznamLogger"];
      if (res == null || res.Length==0) return;
      bool isError = (bool)(HttpContext.Current.Items["SeznamLoggerError"] ?? false);
      if (!isError) return;
      new ErrorEvent(System.Diagnostics.TraceLevel.Error, TraceCategory.All, res.ToString()).Raise();
    }

    public static void error(Exception exp) {
      if (!isLog) return;
      StringBuilder sb = getSb();
      if (sb == null) return;
      HttpContext.Current.Items["SeznamLoggerError"] = true;
      sb.AppendLine("=== ERROR =============");
      sb.AppendLine(exp.Message);
      sb.AppendLine(null); sb.AppendLine(null);
    }
  }
}
