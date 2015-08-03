using System;
using System.Data;
using System.IO;
using System.Text;
using System.Configuration;
using System.Collections.Generic;
using System.Globalization;
using System.Web;
using System.Xml;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Threading;
using System.Web.Script.Serialization;
using System.Linq;

using LMNetLib;
using LMScormLibDOM;
using LMComLib;

namespace LMScormLib {

  // Places jsou 3 literals (head v headu, body na zacatku a konci body) 
  // Places se zjistuji v onPageInit (volanem z HTTPModule)
  // ScriptPlace definuje 
  // - zpusob generace (viz ClientScriptGenerate) 
  // - umisteni generace (viz onPagePreRender): head (HeadStart, StyleSheet, Script, PageScriptLow, PageScript, HeadEnd), bodyStart(BodyStart), body (BodyEnd, StartupScript, EvalGroupScript)
  public enum ClientScriptPlace {
    no,
    //HEAD:
    HeadStart,
    StyleSheet, //odkaz na CSS soubor: relativni cesta
    StyleDef, //definice stylu
    Script, //odkaz na JS soubor: relativni cesta
    ScriptEx, //odkaz na JS soubor: relativni cesta. Neni v LANGMasterAjax.js
    PageScript, //obaleni <script> tagem, v head
    HeadEnd,
    BodyStart,
    BodyEnd,
    //BeforeStartupScript,
    StartupScript, //obaleni <script> tagem, v body end
    //EvalGroupScript, //obaleni <script> tagem, za StartupScript
    AtlasScript, //<script type="text/oldNew-script">  <page xmlns:script="http://schemas.microsoft.com/oldNew-script/2005">  <components>
    WGetUrl, //fake URL reference kvuli stahovani pomoci WGet
    relUrlConst, //javascript konstanta s relativni adresou bitmapy
  }
  public delegate void addAtlasScriptEvent(StringBuilder sb);

  public static class LMScormClientScript {
    static string itemId = Guid.NewGuid().ToString();
    public const string atlasNameSpace = "http://schemas.microsoft.com/xml-script/2005";

    public const string scriptMask = @"
<script type=""text/javascript""> 
  var anonymousUser = {3};
  var actUserId = {0}; 
  var actLicence = new S4N.RegLicenceServer ({1}, {2});
  var email = '{4}';
  var actStatus = {5};
</script>
";

    /*
    public const string scriptMask_Auth = @"
<script type=""text/javascript""> 
  var actStatus = {'isAuthenticated':true,'email':36468389,'server':'Google','courseId':'English','compId':'kubakaca@gmail.com','site':'com','country':'','lang':'cs-cz'};
</script>
";

    public const string scriptMask_Anonym = @"
<script type=""text/javascript""> 
  var actStatus = {'isAuthenticated':false,'site':'com','lang':'cs-cz'};
</script>
";*/

    const string c_topLicencePlayer = @"
<script type=""text/javascript"">
  LicencePlayer = new ContentLicencePlayer();
</script>
";
    const string c_empty = @"
";
    const string c_SilverlightControlPart1 = @"
<script type=""text/javascript"">
  var hasSoundsJs = !S4N.Sys.IsEmpty(S4N.SoundSilverlight);
  if (hasSoundsJs) S4N.SoundSilverlight.testInstalled ();
  function onSilverlightLoad () {{
    if (hasSoundsJs) S4N.SoundSilverlight.SlLoaded();
  }};
  function onSilverlightError (sender, args) {{
    alert('Silverlight Application Error: ' + args.ErrorMessage);
  }};
  function DictConnector_listenTalk(url, word) {{
    return serviceRoot ('{2}', true) + '/site/{1}/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(url) + '&FactTitle=' + encodeURIComponent(word);
  }};
  function DictConnector_listenTalkSentence(pars) {{
    return serviceRoot ('{2}', true) + '/site/{1}/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(listenTalkBase('{2}') + '/' + pars.url) + '&sentBeg=' + pars.beg + '&sentEnd=' + pars.end + '&FactTitle=' + encodeURIComponent(pars.title);
  }};
  function DictConnector_service () {{return serviceRoot('{2}',false) + '/lmcom/services/DictConnector.aspx?';}}
  var xapPath = '{0}';
  var actLms = {2};
";
    const string c_SilverlightControlPart2SL = @"
  if (S4N.SoundPlayer && S4N.SoundDriver) S4N.SoundPlayer.version = S4N.SoundDriver.Silverlight;
  new SilverlightLicencePlayer(function () {{ var res = $('#SilverlightPlayer')[0].content.Player; return res; }});
</script>
<!--
    <object id=""SilverlightPlayer"" data=""data:application/x-silverlight-2,"" type=""application/x-silverlight-2""
      width=""1px"" height=""1px"">
      <param name=""source"" value=""{0}"" />
      <param name=""onError"" value=""onSilverlightError"" />
      <param name=""onLoad"" value=""onSilverlightLoad"" />
      <param name=""background"" value=""white"" />
      <param name=""minRuntimeVersion"" value=""4.0.60129.0"" />
      <param name=""autoUpgrade"" value=""true"" />
      <param name=""initParams"" value=""lms={2},lang={3},site={4},subsite={5},crsid={6},lms_size={7}"" />
      <a href=""http://go.microsoft.com/fwlink/?LinkID=149156&v=4.0.60129.0"" style=""text-decoration: none"">
        <img src=""http://go.microsoft.com/fwlink/?LinkId=108181"" alt=""Get Microsoft Silverlight""
          style=""border-style: none"" />
      </a>
    </object>
-->
";

    const string c_SilverlightControlPart2HTML5 = @"
    if (S4N.SoundPlayer && S4N.SoundDriver) S4N.SoundPlayer.version = S4N.SoundDriver.HTML5;
    if (LMComLib && LMComLib.LMJsContext) LMComLib.LMJsContext.actLocale = '{1}';
    var op = new SLPlayer.LicencePlayerOptions();
    op.lms = {2};
    op.lang = {3};
    op.site = {4};
    op.subsite = {5};
    op.crsid = {6};
    op.lms_size = {7};
    $(document).ready(function() {{
      LicencePlayer.Init();
    }});
    //create sound player i pro stranky bez zvuku: kvuli zvuku ve slovniku
    Sys.Application.add_init(function() {{
      $create(S4N.SoundPlayer, {{'id':'soundPlayer'}}, {{'onSentFocus':typeof snd_sentenceFocus=='undefined' ? null : snd_sentenceFocus, 'onMarkFocus':typeof snd_markFocus == 'undefined' ? null : snd_markFocus}}, {{}}, null)
    }});
</script>
";


    public static string runtimeUserInfo(HttpContext context) {
      LMCookie cook;
      if (Machines.EA_as_LMCom_Auth == "ok_auth")
        cook = new LMCookie() { EMail = "kubakaca@gmail.com", Type = OtherType.Google, id = 36468389 };
      //return scriptMask_Auth;
      else if (Machines.EA_as_LMCom_Auth == "ok_notauth")
        cook = new LMCookie();
      else
        cook = LMStatus.GetCookieLow(context);
      urlInfo ui = urlInfo.GetUrlInfo();
      ProductInfo prod = ProductInfos.GetProductEx(ui.EACourse);
      //ProductRight actLic = ProductRight.full; // TODO RegLicenceServer.getActLicenceType(ui.SiteId, ui.EACourse, LMStatus.email, out prod);
      string anonym = string.IsNullOrEmpty(cook.EMail) ? "true" : "false";
      return string.Format(scriptMask, LMStatus.UserId, (short)prod.Id, 0, anonym, cook.EMail, LMStatus.GetActStatus(context, cook));
    }

    public static string runtimeUserEMail(HttpContext context) {
      return context.User.Identity.Name ?? "";
    }

    internal class scriptDict : List<string>//Dictionary<string,string>
    {
      int emptyNameCount = 0;
      Dictionary<string, bool> exist = new Dictionary<string, bool>();
      internal void add(string name, string value) {
        if (string.IsNullOrEmpty(value)) return;
        if (string.IsNullOrEmpty(name))
          name = (emptyNameCount++).ToString();
        if (exist.ContainsKey(name)) return;
        Add(value);
        exist.Add(name, true);
      }
    }

    internal class scriptDicts : Dictionary<ClientScriptPlace, scriptDict> {
      public scriptDicts()
        : base() {
        ProductInfo prod = lm_scorm.getActProduct();
        var root = lm_scorm.getActRoot().PageInfo;
        LMScormClientScript.RegisterAjaxScript(AjaxScriptBuf, "S4N.Config",
          new AjaxPairs(
            "courseId", "#sS4N.CourseIds." + lm_scorm.getActCourse().Id.ToString(), //crsConfig.CrsId.ToString(),
            "productId", "#sS4N.CourseIds." + prod.Id.ToString(), //crsConfig.ProdInfo.compId.ToString(),
            "lmsType", "#sS4N.LMSType." + Deployment.actConfig(null).LMS.ToString(),
            "site", Deployment.Domain().ToString(),
            "regLimitedFree", prod.RegLimitedFree,
          //"basicPath", lib.RelativeUrl("~/")), null, null, null);
            "basicPath", "lm/oldea/data/" + root.SpaceId + "/" + root.GlobalId.Replace(".htm", null)), null, null, null);
      }
      internal Literal head;
      internal Literal body;
      internal Literal bodyStart;
      internal List<addAtlasScriptEvent> afterAtlasScript;
      internal StringBuilder AjaxScriptBuf = new StringBuilder();
      internal void finishAjaxScriptBuf() {
        //Page: musi byt na konci scriptu
        lm_scorm root = lm_scorm.getActRoot();
        LMScormClientScript.RegisterAjaxScript(AjaxScriptBuf, "S4N.Page",
          new AjaxPairs("id", "page",
            "spaceId", AjaxPairs.adjustString(root.PageInfo.SpaceId), "globalId", AjaxPairs.adjustString(root.PageInfo.GlobalId),
            "title", lm_scorm.pageTitle(root, null)), null, null, null);
        LMGroupRoots groups = lm_scorm.getActRoot().Groups;
        if (groups != null) groups.GroupAtlasScript();
      }
      internal static scriptDicts getDicts() {
        scriptDicts res = (scriptDicts)HttpContext.Current.Items[itemId];
        if (res == null) {
          res = new scriptDicts();
          HttpContext.Current.Items[itemId] = res;
        }
        return res;
      }
      internal static scriptDict getDict(ClientScriptPlace place) {
        scriptDicts dicts = getDicts();
        scriptDict res;
        if (dicts.TryGetValue(place, out res)) return res;
        res = new scriptDict();
        dicts.Add(place, res);
        return res;
      }
    }

    public static void AddControl(Control ctrl, ClientScriptPlace place) {
      scriptDicts dicts = scriptDicts.getDicts();
      ControlCollection col;
      switch (place) {
        case ClientScriptPlace.HeadStart: dicts.head.Controls.AddAt(0, ctrl); break;
        case ClientScriptPlace.HeadEnd: dicts.head.Controls.Add(ctrl); break;
        case ClientScriptPlace.BodyStart:
          col = dicts.bodyStart.Parent.Controls;
          col.AddAt(col.IndexOf(dicts.bodyStart), ctrl);
          break;
        case ClientScriptPlace.BodyEnd:
          col = dicts.body.Parent.Controls;
          col.AddAt(col.IndexOf(dicts.body), ctrl);
          break;
      }
    }

    public static void Register(string name, string script, ClientScriptPlace place) {
      scriptDicts.getDict(place).add(name, script);
    }

    public static void RegisterScriptInclude(params string[] names) {
      foreach (string pth in names)
        Register(pth, "~/framework/Script/" + pth + ".js", ClientScriptPlace.Script);
    }

    public static void RegisterCssInclude(params string[] names) {
      foreach (string pth in names)
        Register(pth, "~/framework/Controls/" + pth + ".css", ClientScriptPlace.StyleSheet);
    }

    public static void RegisterWGets(IEnumerable<string> files) {
      string basicPath = HttpContext.Current.Request.Url.AbsolutePath;
      foreach (string pth in files) {
        if (string.IsNullOrEmpty(pth)) continue;
        LMScormClientScript.Register(pth.ToLower(),
          VirtualPathUtility.MakeRelative(basicPath, VirtualPathUtility.ToAbsolute(pth)),
          ClientScriptPlace.WGetUrl);
      }
    }

    public static void RegisterWGets(string fn) {
      fn = HttpContext.Current.Server.MapPath(fn);
      RegisterWGets(StringUtils.FileToString(fn).Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries));
    }

    public static void RegisterWGetDir(string dir) {
      dir = HttpContext.Current.Server.MapPath(dir);
      DirectoryInfo di = new DirectoryInfo(dir);
      RegisterWGets(di.GetFiles().Select(fi => "~/" + fi.FullName.ToLower().Replace(@"q:\lmnet2\webapps\eduauthornew\", null).Replace('\\', '/')));
    }

    public static StringBuilder getAjaxScriptBuf() {
      return scriptDicts.getDicts().AjaxScriptBuf;
    }

    public static void registerAfterAtlasScript(addAtlasScriptEvent ev) {
      scriptDicts dict = scriptDicts.getDicts();
      if (dict.afterAtlasScript == null)
        dict.afterAtlasScript = new List<addAtlasScriptEvent>();
      dict.afterAtlasScript.Add(ev);
    }

    internal static void onPageInit(object sender, EventArgs e) {
      //Zajisti existenci literal statControls
      Page pg = (Page)sender;
      scriptDicts dicts = scriptDicts.getDicts();
      dicts.head = (Literal)LowUtils.FindControlEx(pg, "LMScorm_HeadEnd");
      if (dicts.head == null) {
        dicts.head = new Literal();
        if (pg.Header != null)
          pg.Header.Controls.Add(dicts.head);
      }
      if (pg is NoScriptPage)
        dicts.body = new Literal();
      else {
        dicts.body = (Literal)LowUtils.FindControlEx(pg, "lm4a_BodyEnd");
        if (dicts.body == null) {
          dicts.body = new Literal();
          if (pg.Form != null) {
            //Vloz za Form kontrolku
            ControlCollection col = pg.Form.Parent.Controls;
            col.AddAt(col.IndexOf(pg.Form) + 1, dicts.body);
          }
        }
      }
      if (pg is NoScriptPage)
        dicts.bodyStart = new Literal();
      else {
        dicts.bodyStart = (Literal)LowUtils.FindControlEx(pg, "lm4a_BodyStart");
        if (dicts.bodyStart == null) {
          dicts.bodyStart = new Literal();
          if (false/*pg.Form != null*/) {
            //Vloz pred Form kontrolku
            ControlCollection col = pg.Form.Parent.Controls;
            col.AddAt(col.IndexOf(pg.Form), dicts.bodyStart);
          }
        } else if (Machines.isLMCom && !LMScormLib.HTTPModule.Hack()) {
          //vlozeni email a UserRights
          Control ctrl = pg.LoadControl("~/Framework/Controls/CommonParts/RuntimeUserInfo.ascx");
          ControlCollection col = dicts.bodyStart.Parent.Controls;
          col.AddAt(col.IndexOf(dicts.bodyStart) + 1, ctrl);
          LMScormClientScript.RegisterScriptInclude("lm/reglicence");
        }
      }
      //Registrace spolecnych scriptu na strance
      registerCommonScripts(pg);
    }

    internal static void onPreRenderComplete(object sender, EventArgs e) {
      scriptDicts dicts = (scriptDicts)HttpContext.Current.Items[itemId];
      if (dicts == null) return;
      dicts.head.Text = ClientScriptGenerate(dicts,
        ClientScriptPlace.HeadStart, LMScormLib.HTTPModule.Hack() ? ClientScriptPlace.no : ClientScriptPlace.StyleSheet, ClientScriptPlace.StyleDef, ClientScriptPlace.HeadEnd);
      dicts.body.Text = ClientScriptGenerate(dicts,
        ClientScriptPlace.BodyEnd, ClientScriptPlace.StartupScript, ClientScriptPlace.AtlasScript);
      dicts.bodyStart.Text = ClientScriptGenerate(dicts,
        ClientScriptPlace.relUrlConst, ClientScriptPlace.Script, LMScormLib.HTTPModule.Hack() ? ClientScriptPlace.no : ClientScriptPlace.ScriptEx, ClientScriptPlace.PageScript, ClientScriptPlace.BodyStart, LMScormLib.HTTPModule.Hack() ? ClientScriptPlace.no : ClientScriptPlace.WGetUrl);
    }

    public static string writeSignature() {
      string sign = getSignature(Deployment.actConfig(null));
      if (sign == null) return null;
      return string.Format(@"<script type=""text/javascript""> window.signature = '{0}'; </script>", sign);
    }

    public static string getSignature(ConfigLow cfg) {
      //Kontrola
      if (!(cfg is ConfigCourse)) return null;
      ConfigCourse crsCfg = (ConfigCourse)cfg;
      if (crsCfg.LMS != LMSType.NewEE && crsCfg.LMS != LMSType.SlNewEE) return null;
      //Key
      string[] parts = HttpContext.Current.Request.Url.LocalPath.Split('/');
      string keyStr = parts[parts.Length - 1].ToLower();
      keyStr = keyStr.Replace(".aspx", null);
      byte[] keyBytes = Encoding.ASCII.GetBytes(keyStr);
      ushort key = 0;
      foreach (byte k in keyBytes) key += k;
      //Encode loc_CourseId
      string crs = crsCfg.ProductId.ToString();
      byte[] code = Encoding.ASCII.GetBytes(crs);
      LowUtils.Encrypt(ref code, 0, code.Length, key);
      //To Hexastring
      string res = "";
      foreach (byte b in code)
        res += string.Format("{0:x2}", b);
      return res;
    }
    static string ClientScriptGenerate(scriptDicts dicts, params ClientScriptPlace[] places) {
      StringBuilder res = new StringBuilder();
      scriptDict scripts;
      foreach (ClientScriptPlace place in places.Where(p => p != ClientScriptPlace.no)) {
        if (!dicts.TryGetValue(place, out scripts) && place != ClientScriptPlace.AtlasScript && place != ClientScriptPlace.Script) continue;
        HttpRequest req = HttpContext.Current.Request;
        HttpResponse resp = HttpContext.Current.Response;
        switch (place) {
          case ClientScriptPlace.ScriptEx:
            if (scripts != null)
              foreach (string val in scripts) {
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>",
                  Lib.RelativeUrl(val.ToLower()));
                res.AppendLine();
              }
            break;
          case ClientScriptPlace.Script:
            ConfigLow cfg = Deployment.actConfig(null);
            bool isHomeTop = req.Path.IndexOf("hometop.htm") >= 0;
            //CultureInfo
            res.AppendLine(@"<script type=""text/javascript"">");
            if (Machines.isEABuildCD) {
              res.AppendLine("var urlBasicPath = null;");
              res.AppendLine("var urlAuthority = null;");
            } else {
              /*string auth;
              if (Machines.isBuildEACache) {
                auth = SiteInfos.getDefaultAuthority(urlInfo.GetUrlInfo().SiteId, "app", "handler");
                Uri uri = new Uri(auth); 
                auth = uri.Authority;
              } else
                auth = req.Url.Authority;*/
              //dbInfo.AppendLine(string.Format("var urlAuthority = '{0}';", "http://" + auth));
              string virtPath = ConfigLow.isLMComCacheDeployment() ? "/" + urlInfo.LangToEADir(cfg.LangId) : HttpRuntime.AppDomainAppVirtualPath;
              if (virtPath == "/") virtPath = null;
              //dbInfo.AppendLine(string.Format("var urlBasicPath = '{0}';", "http://" + auth + virtPath + "/"));
              res.AppendLine(string.Format("var urlBasicPath = 'http://' + window.location.hostname + '{0}' + '/';", virtPath));
              res.AppendLine("var urlAuthority = 'http://' + window.location.hostname;");
            }
            LMGroupRoots grps = lm_scorm.getActRoot().Groups;
            bool hasSound = grps != null && grps.Roots[(int)LMGroupType.sound] != null;
            if (hasSound) {
              if (cfg.SoundPlayer == SoundPlayerType.Flash) {
                res.AppendLine("var flashPlayerUrl = '" + Lib.RelativeUrl("~/Framework/Script/LM/Player").ToLower() + "';");
              } else
                res.AppendLine("var flashPlayerUrl = null;");
            }
            if (LMScormLib.HTTPModule.Hack()) {
              lm_scorm root = lm_scorm.getActRoot();

              string instrTitle = null;
              if (root.localtitle != null) {
                if (root.localtitle.Extension == null) instrTitle = root.localtitle.Text;
                else if (!root.localtitle.Extension.datas.TryGetValue(cfg.Lang, out instrTitle) && !root.localtitle.Extension.datas.TryGetValue("en-gb", out instrTitle)) instrTitle = root.localtitle.Extension.data;
              }

              CourseModel.body pg = new CourseModel.body {
                //title = lm_scorm.pageTitle(root, null),
                instrTitle = instrTitle,
                instrs = new string[] { root.instr.ToString(), root.instr2.ToString(), root.instr3.ToString() }.Where(s => s != "no").Select(i => i.ToLowerInvariant()).DefaultIfEmpty().ToArray(),
                seeAlsoStr = CourseModel.seeAlsoLink.encode(root.SiteNode == null ? null : LMScormLib.Lib.seeAlsoLinks(root.SiteNode, true).ToArray()),
                //CrsId = root.PageInfo.CrsInfo.compId,
                //evalPage = LMGroupRoots.isPassive(root) ? null : new CourseModel._evalPage { maxScore = 1 },
                oldEaIsPassive = LMGroupRoots.isPassive(root),
                isOldEa = cfg.newFileExisted ? false : true,
              };
              //CourseModel.Ex testEx = new CourseModel.Ex() {
              //  //title = lm_scorm.pageTitle(root, null),
              //  instr = instrTitle,
              //  tech_instr = root.instr.ToString(), root.instr2.ToString(), root.instr3.ToString() }.Where(s => s != "no").Select(i => i.ToLowerInvariant()).Aggregate((r,i) => r + "|" + i),
              //  seeAlso = root.SiteNode == null ? null : LMScormLib.lib.seeAlsoLinks(root.SiteNode, true).ToArray(),
              //  CrsId = root.PageInfo.CrsInfo.compId,
              //  isPassive = LMGroupRoots.isPassive(root)
              //};
              //res2.AppendLine("var exerciseInfo = " + LowUtils.JSONEncode(pg) + ";");
              res.AppendLine();
              res.AppendLine(@"</script>");
              res.AppendLine(@"<script type=""text/xml"" id=""pageInfo"">");
              //res2.AppendLine(XmlUtils.ObjectToString(pg));
              res.AppendLine(XmlUtils.ObjectToString(pg).Replace(@"<?xml version=""1.0"" encoding=""utf-16""?>", null).Replace(@"xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema""", null));
              res.AppendLine(@"</script>");
            } else {
              res.AppendLine(ClientCultureInfo.GetClientCultureScriptBlock());
              string sign = getSignature(cfg);
              if (sign != null)
                res.AppendLine(string.Format("window.signature = '{0}';", sign));
              res.AppendLine();
              res.AppendLine(@"</script>");

              string tradosJS = "~/Framework/Script/LM/tradosData." + Thread.CurrentThread.CurrentUICulture.Name + ".js";
              if (!File.Exists(HttpContext.Current.Server.MapPath(tradosJS))) tradosJS = null;
              //Scripts
              //if (hasSound && cfg.SoundPlayer == SoundPlayerType.Silverlight) {
              if (!isHomeTop && cfg.SoundPlayer == SoundPlayerType.Silverlight) {
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/silverlight.js"));
              }
              res.AppendLine();
              res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/LM/StartTrace.js"));
              if (tradosJS != null) {
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl(tradosJS));
              }
              res.AppendLine();
              if (cfg.DebugMode) {
                //dbInfo.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", lib.RelativeUrl("~/Framework/Script/Atlas/MicrosoftAjaxDebug.js"));
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/Atlas/jquery.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/Atlas/MicrosoftAjax.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/LM/LMSys.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/LM/Doctor.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/LM/lmcommon.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/LM/LicencePlayer.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/framework/controls/commonparts/Schools.js"));

                if (cfg.SoundPlayer == SoundPlayerType.HTML5 || cfg.SoundPlayer == SoundPlayerType.Silverlight || cfg.SoundPlayer == SoundPlayerType.Flash) {
                  //Register("lm/sounds", "~/framework/Script/lm/sounds.js", ClientScriptPlace.Script);
                  foreach (string pth in LMComLib.JSPlayerInclude.JSPlayerIncludes2)
                    Register("js/" + pth, "~/" + pth + ".js", ClientScriptPlace.Script);
                  LMScormClientScript.RegisterScriptInclude("lm/sounds");
                }
                if (scripts != null) foreach (string val in scripts) {
                    res.AppendLine();
                    res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl(val.ToLower()));
                  }
              } else {
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/Atlas/jquery.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/Atlas/MicrosoftAjax.js"));
                res.AppendLine();
                res.AppendFormat(@"<script type=""text/javascript"" src=""{0}""></script>", Lib.RelativeUrl("~/Framework/Script/LM/LANGMasterAjax.js"));
              }
              res.AppendLine();
            }
            if (cfg.SoundPlayer == SoundPlayerType.Silverlight || cfg.SoundPlayer == SoundPlayerType.HTML5) {
              if (isHomeTop)
                res.AppendLine(c_topLicencePlayer);
              else {
                urlInfo ui = urlInfo.GetUrlInfo(); ;
                Domains site = ui == null ? Domains.com : ui.SiteId;
                SubDomains subSite = ui == null ? SubDomains.com : ui.SubSite;
                pageInfo page = lm_scorm.getActRoot().PageInfo;
                CourseIds crs = page.CrsInfo.Id;
                LMSSize lmsMod = cfg is ConfigModule ? (cfg.Root is ConfigLmsCourse ? LMSSize.self : LMSSize.blend) : LMSSize.no;
                string c_SilverlightControl;
                if (LMScormLib.HTTPModule.Hack())
                  c_SilverlightControl = c_empty;
                else
                  c_SilverlightControl = c_SilverlightControlPart1 + (cfg.SoundPlayer == SoundPlayerType.HTML5 ? c_SilverlightControlPart2HTML5 : c_SilverlightControlPart2SL);
                if (cfg.SoundPlayer == SoundPlayerType.HTML5)
                  res.AppendLine(string.Format(c_SilverlightControl, Lib.RelativeUrl("~/"), cfg.Lang, (int)cfg.LMS, (int)cfg.LangId, (int)site, (int)subSite, (int)crs, (int)lmsMod));
                else
                  res.AppendLine(string.Format(c_SilverlightControl, Lib.RelativeUrl("~/"), cfg.Lang, cfg.LMS, cfg.LangId, site, subSite, crs, lmsMod));
              }
            }
            break;
          case ClientScriptPlace.StyleSheet:
            foreach (string val in scripts) {
              res.AppendFormat(@"<link rel=""StyleSheet"" type=""text/css"" href=""{0}"" />",
                Lib.RelativeUrl(val));
              res.AppendLine();
            }
            res.AppendFormat(@"<link rel=""StyleSheet"" type=""text/css"" href=""{0}"" />",
              Lib.RelativeUrl("~/framework/controls/commonparts/Schools.css"));
            res.AppendLine();
            res.AppendLine(string.Format(ieCss,
              Lib.RelativeUrl("~/Framework/Controls/Css/ie.css"),
              Lib.RelativeUrl("~/Framework/Controls/Css/ie7.css")));
            if (isPeckaPage)
              res.AppendLine(string.Format(iePeckaCss,
                Lib.RelativeUrl("~/Framework/Controls/Css2/course-ie.css")));
            if (lm_scorm.getActProduct().Id == CourseIds.Chinese)
              res.AppendFormat(@"<link rel=""StyleSheet"" type=""text/css"" href=""{0}"" />",
                Lib.RelativeUrl("~/Framework/Controls/Css/Chinese.css"));
            break;
          case ClientScriptPlace.StyleDef:
            res.AppendLine(@"<style type=""text/css"">");
            foreach (string val in scripts) res.AppendLine(val);
            res.AppendLine(@"</style>");
            break;
          case ClientScriptPlace.PageScript:
            res.AppendLine(@"<script type=""text/javascript"">");
            foreach (string val in scripts) res.AppendLine(val);
            res.AppendLine(@"</script>");
            break;
          case ClientScriptPlace.StartupScript:
            res.AppendLine(@"<script type=""text/javascript"">");
            if (scripts != null) foreach (string val in scripts) res.AppendLine(val);
            res.AppendLine(@"</script>");
            break;
          case ClientScriptPlace.AtlasScript:
            dicts.finishAjaxScriptBuf();
            if (dicts.afterAtlasScript != null)
              foreach (addAtlasScriptEvent ev in dicts.afterAtlasScript)
                ev(dicts.AjaxScriptBuf);
            res.AppendLine(@"<script type=""text/javascript"">");
            if (LMScormLib.HTTPModule.Hack()) {
              res.AppendLine(@"var oldEAInitialization = function(completed) {");
              res.AppendLine(@"EA.startAjax();");
              res.AppendLine(@"Sys.Application.add_init(function() {
                $create(S4N.SoundPlayer, {'id':'soundPlayer', 'forceVersion':S4N.SoundDriver.HTML5}, {'onSentFocus':typeof snd_sentenceFocus=='undefined' ? null : snd_sentenceFocus, 'onMarkFocus':typeof snd_markFocus == 'undefined' ? null : snd_markFocus}, {}, null)
              });");
            }
            res.AppendLine(dicts.AjaxScriptBuf.ToString());
            if (LMScormLib.HTTPModule.Hack()) {
              res.AppendLine(@"EA.endAjax(completed);");
              res.AppendLine(@"}");
            }
            res.AppendLine(@"</script>");
            break;
          case ClientScriptPlace.WGetUrl:
            if (Machines.isLMCom) break;
            res.AppendLine(@"<span style=""display:none;"">");
            foreach (string val in scripts) {
              res.Append(@"<a href=""");
              res.Append(val.ToLower());
              res.Append(@"""></a>");
            }
            res.AppendLine("</span>");
            break;
          case ClientScriptPlace.relUrlConst:
            res.AppendLine(@"<script type=""text/javascript"">");
            foreach (string val in scripts)
              res.AppendLine(val);
            res.AppendLine(@"</script>");
            break;
          default:
            foreach (string val in scripts) res.AppendLine(val);
            break;
        }
      }
      return res.ToString();
    }

    const string c_pageInfo = @"
<xml id=""EpaPageInfo"">
  <epa:tepapageinfo xmlns:epa=""www.epaonline.com/epaclasses"" spaceid=""{0}""
    globalid=""{1}"" url=""{2}"" title=""{3}"" myoutline=""{4}"" />
</xml>
<object id=""EpaBehavior"" classid=""clsid:908c44c9-baeb-44e7-8828-c746eb6eebb8"">
</object>
";
    const string ieCss =
@"<!--[if lte IE 6]>
		<link rel=""stylesheet"" type=""text/css"" href=""{0}"" media=""all"" />
<![endif]-->
<!--[if IE 7]>
	<link rel=""stylesheet"" type=""text/css"" href=""{1}"" media=""all"" />
<![endif]-->
";
    const string iePeckaCss =
@"<!--[if IE]>
		<link rel=""stylesheet"" type=""text/css"" href=""{0}"" media=""all"" />
<![endif]-->
";
    public static bool isPeckaPage {
      get { return true; }
    }
    static void registerCommonScripts(Control pg) {
      RegisterCssInclude("css/common");
      if (isPeckaPage) {
        RegisterCssInclude("css2/course");
        RegisterCssInclude(string.Format("css2/css-{0}/course", Thread.CurrentThread.CurrentUICulture.Name));
      }
      if (urlInfo.isSeznam()) {
        RegisterCssInclude("css2/seznam/course");
      }
      Register("ie6", Lib.RelativeUrl("~/Framework/Controls/css/ie.css"), ClientScriptPlace.WGetUrl);
      Register("ie7", Lib.RelativeUrl("~/Framework/Controls/css/ie7.css"), ClientScriptPlace.WGetUrl);
      Register("ie", Lib.RelativeUrl("~/Framework/Controls/css2/course-ie.css"), ClientScriptPlace.WGetUrl);
      Register("doctor", Lib.RelativeUrl("~/Framework/Doctor.html"), ClientScriptPlace.WGetUrl);
      Register("bullet1", Lib.RelativeUrl("~/Framework/Controls/Css/img/bullet1.gif"), ClientScriptPlace.WGetUrl);
    }

    internal class ClientCultureInfo {
      // Fields
      public DateTimeFormatInfo dateTimeFormat;
      public string name;
      public NumberFormatInfo numberFormat;

      // Methods
      private ClientCultureInfo(CultureInfo cultureInfo) {
        this.name = cultureInfo.Name;
        this.numberFormat = cultureInfo.NumberFormat;
        this.dateTimeFormat = cultureInfo.DateTimeFormat;
      }

      internal static string GetClientCultureScriptBlock() {
        CultureInfo ci = Thread.CurrentThread.CurrentUICulture;
        if ((ci == null) || string.Equals(ci.Name, "EN-US", StringComparison.OrdinalIgnoreCase)) return null;
        ClientCultureInfo obj = new ClientCultureInfo(ci);
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        string text = serializer.Serialize(obj);
        if (text.Length > 0)
          return ("var __cultureInfo = '" + text + "';");
        return null;
      }
    }

    /*public static void registerCss2(string imgs, string langImgs) {
      string pth = HttpContext.Current.Request.Url.AbsolutePath;
      if (imgs != null)
        foreach (string s in imgs.Split(',')) {
          string id = "~/Framework/Controls/Css2/img/" + s + (s.IndexOf('.') < 0 ? ".png" : null);
          id = id.ToLower();
          Register(id, VirtualPathUtility.MakeRelative(pth, id), ClientScriptPlace.WGetUrl);
        }
      if (langImgs != null)
        foreach (string s in langImgs.Split(',')) {
          string id = "~/Framework/Controls/Css2/css-" + Thread.CurrentThread.CurrentUICulture.Name + "/img/" + s + (s.IndexOf('.') < 0 ? ".png" : null);
          id = id.ToLower();
          Register(id, VirtualPathUtility.MakeRelative(pth, id), ClientScriptPlace.WGetUrl);
        }
    }*/

    public static void registerFiles(params string[] imgs) {
      string pth = HttpContext.Current.Request.Url.AbsolutePath;
      foreach (string s in imgs) {
        string name = "~/Framework/Controls/" + s;
        name = name.ToLower();
        Register(name, VirtualPathUtility.MakeRelative(pth, name), ClientScriptPlace.WGetUrl);
      }
    }

    public static void doRegister(IEnumerable<string> absUrls) {
      if (absUrls == null) return;
      string myUrl = HttpContext.Current.Request.Url.AbsolutePath;
      foreach (string url in absUrls)
        if (url != null) LMScormClientScript.Register(url, VirtualPathUtility.MakeRelative(myUrl, url), ClientScriptPlace.WGetUrl);
    }

    public static void doRegister(IEnumerable<SiteMapNode> nodes) {
      if (nodes == null) return;
      string myUrl = HttpContext.Current.Request.Url.AbsolutePath;
      foreach (SiteMapNode nd in nodes)
        if (nd != null) LMScormClientScript.Register(nd.Url, VirtualPathUtility.MakeRelative(myUrl, nd.Url), ClientScriptPlace.WGetUrl);
    }

    public static void RegisterAjaxScript(string compType, AjaxPairs pars, AjaxPairs events, AjaxPairs references, string elementId) {
      RegisterAjaxScript(getAjaxScriptBuf(), compType, pars, events, references, elementId);
    }

    public static void RegisterAjaxScript(StringBuilder sb, string compType, AjaxPairs pars, AjaxPairs events, AjaxPairs references, string elementId) {
      sb.AppendLine("  Sys.Application.add_init(function() {");
      sb.Append("    $create(");
      sb.Append(compType);
      sb.Append(", ");
      if (pars == null || pars.isEmpty()) sb.Append("null"); else pars.ToString(sb, false);
      sb.Append(", ");
      if (events == null) sb.Append("null"); else events.ToString(sb, true);
      sb.Append(", ");
      if (references == null) sb.Append("{}"); else references.ToString(sb, false);
      sb.Append(", ");
      sb.Append(elementId == null ? "null" : string.Format("$get('{0}')", elementId));
      sb.AppendLine(")");
      sb.AppendLine("  });");
      //hack kvuli LM COM subdomains
      sb.Replace("'http://www.langmaster.com", "urlAuthority + '");
    }

    /*============== bitmapy z CSS, specialni CSS ==================*/
    static string[] c_Css_css = new string[] {
      "~/framework/controls/css/common.css",
      "~/framework/controls/css/gapFill.css",
      "~/framework/controls/css/hiddenText.css",
      "~/framework/controls/css/ordering.css",
      "~/framework/controls/css/passiveBox.css",
      "~/framework/controls/css/selections.css",
      "~/framework/controls/css/sound.css",
      "~/framework/controls/css/drag.css",
      "~/framework/controls/css/ie.css",
      "~/framework/controls/css/ie7.css",
      "~/framework/controls/css/passiveTable.css",
      "~/framework/controls/css/passiveLayout.css",
      "~/framework/controls/css/evalMark.css",
      "~/framework/controls/css/hideControl.css",
      "~/framework/controls/css/eva.css",
      "~/framework/controls/css/navigPanel.css",
      "~/framework/controls/css/crossWord.css",
      "~/framework/controls/css/Chinese.css",
      "~/framework/controls/css/passiveGrammarChinese.css"};

    static string[] c_Css_css2 = new string[] {
      "~/framework/controls/css2/course.css",
      "~/framework/controls/css2/course-ie.css"};

    /*static Dictionary<Langs, string> c_Css_lang = fill_c_Css_lang();
    static Dictionary<Langs, string> fill_c_Css_lang() {
      Dictionary<Langs, string> dbInfo = new Dictionary<Langs, string>();
      dbInfo.Add(Langs.de_de, "~/framework/statControls/css2/css-de-de/course.css");
      dbInfo.Add(Langs.cs_cz, "~/framework/statControls/css2/css-cs-cz/course.css");
      return dbInfo;
    }*/

    static Dictionary<string, string> c_Css_course = fill_c_Css_course();
    static Dictionary<string, string> fill_c_Css_course() {
      Dictionary<string, string> res = new Dictionary<string, string>();
      res.Add("ajnej", "~/framework/controls/css2/css-ajnej/course.css");
      res.Add("euro", "~/framework/controls/css2/css-euro/course.css");
      res.Add("mv", "~/framework/controls/css2/css-mv/course.css");
      res.Add("nno", "~/framework/controls/css2/css-nno/course.css");
      res.Add("ucto", "~/framework/controls/css2/css-ucto/course.css");
      res.Add("berlitz", "~/framework/controls/css2/css-berlitz/course.css");
      res.Add("ahold", "~/framework/controls/css2/css-ahold/course.css");
      return res;
    }
    //if (place == ClientScriptPlace.StyleSheet)
    //RegisterWGets(parseCssBmp(VirtualPathUtility.ToAbsolute(script), HttpContext.Current.Server.MapPath(script)));
    static IEnumerable<string> parseCssBmp(string cssUrl, string fn) {
      if (!File.Exists(fn)) yield break;
      List<string> res = new List<string>();
      string cont = StringUtils.FileToString(fn);
      string[] parts = cont.Split(new string[] { "url(" }, StringSplitOptions.RemoveEmptyEntries);
      for (int i = 1; i < parts.Length; i++) {
        string part = parts[i];
        int endIdx = part.IndexOf(')'); if (endIdx < 0) continue;
        string rawUrl = part.Substring(0, endIdx);
        rawUrl = rawUrl.Trim(' ', '\'');
        if (!string.IsNullOrEmpty(rawUrl)) yield return VirtualPathUtility.Combine(cssUrl, rawUrl);
      }
    }

    //LMScormClientScript.registerCssBmp(LMScormClientScript.registerCssUrls(true, true, lang, productToSpecialCssId(productId)));
    static IEnumerable<string> registerCssUrls(bool isCss, bool isCss2, Langs lang, string crsSpecialId) {
      if (isCss)
        foreach (string url in c_Css_css) yield return url;
      if (isCss2)
        foreach (string url in c_Css_css2) yield return url;
      if (lang != Langs.no)
        yield return "~/framework/controls/css2/css-" + lang.ToString().Replace('_', '-') + "/course.css";
      //yield return c_Css_lang[lang];
      if (crsSpecialId != null) {
        string s = null;
        try {
          s = c_Css_course[crsSpecialId];
        } catch {
          throw new Exception(@"Missing code in Q:\LMNet2\WebApps\eduauthornew\app_code\ClientScript.cs, fill_c_Css_course");
        }
        yield return s;
      }
    }

    static void registerCssBmp(IEnumerable<string> urls) {
      foreach (string fn in urls)
        RegisterWGets(parseCssBmp(VirtualPathUtility.ToAbsolute(fn), HttpContext.Current.Server.MapPath(fn)));

    }

    static string productToSpecialCssId(CourseIds prodId) {
      switch (prodId) {
        case CourseIds.NNOUcto:
          return "nno";
        case CourseIds.MVtesty:
          return "mv";
        case CourseIds.ZSAJ61:
        case CourseIds.ZSAJ71:
        case CourseIds.ZSAJ81:
        case CourseIds.ZSAJ91:
        case CourseIds.ZSNJ61:
        case CourseIds.ZSNJ71:
        case CourseIds.ZSNJ81:
        case CourseIds.ZSNJ91:
        case CourseIds.ZSAJ62:
        case CourseIds.ZSAJ72:
        case CourseIds.ZSAJ82:
        case CourseIds.ZSAJ92:
        case CourseIds.ZSNJ62:
        case CourseIds.ZSNJ72:
        case CourseIds.ZSNJ82:
        case CourseIds.ZSNJ92:
          return "ajnej";
        case CourseIds.EuroEnglish:
          return "euro";
        case CourseIds.Ucto1:
        case CourseIds.Ucto2:
        case CourseIds.Ucto3:
        case CourseIds.UctoAll:
          return "ucto";
        case CourseIds.EnglishBerlitz:
        case CourseIds.GermanBerlitz:
        case CourseIds.ItalianBerlitz:
        case CourseIds.FrenchBerlitz:
        case CourseIds.RussianBerlitz:
        case CourseIds.SpanishBerlitz:
        case CourseIds.ChineseBerlitz:
          return "berlitz";
        case CourseIds.AholdDemoAnim:
        case CourseIds.AholdDemoVideo:
          return "ahold";
        default:
          return null;
      }
    }

    public static void WGetBitmapsFromCss(Langs lang, CourseIds productId) {
      LMScormClientScript.registerCssBmp(LMScormClientScript.registerCssUrls(true, true, lang, productToSpecialCssId(productId)));
    }

    public static void includeSpecialCss(CourseIds productId) {
      string specId = productToSpecialCssId(productId); if (specId == null) return;
      LMScormClientScript.RegisterCssInclude("css2/css-" + specId + "/course");
    }

  }

  public class AjaxPairs {
    object[] pars;
    static char[] wch = new char[] { '\b', '\f', '\n', '\r', '\t', '\\', '\'' };
    static char[] wrongChars;
    static AjaxPairs() {
      wrongChars = new char[32 + wch.Length];
      wch.CopyTo(wrongChars, 0);
      for (int i = 0; i < 32; i++)
        wrongChars[i + wch.Length] = Convert.ToChar(i);
    }
    public static string adjustString(string s) {
      return s == null ? "" : s;
    }
    public AjaxPairs(params object[] pars) {
      this.pars = pars;
    }
    public void addPar(string name, object value) {
      int len = pars == null ? 0 : pars.Length;
      object[] newPars = new object[len + 2];
      if (pars != null) pars.CopyTo(newPars, 0);
      newPars[len] = name; newPars[len + 1] = value;
      pars = newPars;
    }
    public static string StringsToJavaArray(IEnumerable<string> strings, bool incBracket) {
      StringBuilder sb = new StringBuilder();
      if (incBracket) sb.Append('[');
      foreach (string s in strings) {
        sb.Append("'"); sb.Append(s); sb.Append("',");
      }
      if (sb.Length > 1) sb.Remove(sb.Length - 1, 1);
      if (incBracket) sb.Append(']');
      return sb.ToString();
    }

    public static string stringToJavaArray(string str, bool noArrayWhenEmpty) {
      StringBuilder sb = new StringBuilder();
      sb.Append("#s");
      if (string.IsNullOrEmpty(str))
        sb.Append(noArrayWhenEmpty ? "''" : "[]");
      else {
        string[] parts = ControlHelper.splitDels(str);
        if (parts.Length == 1 && noArrayWhenEmpty) {
          sb.Append("'"); toJavaString(parts[0], sb); sb.Append("'");
        } else {
          sb.Append("[");
          foreach (string s in parts) {
            sb.Append("'"); toJavaString(s, sb); sb.Append("',");
          }
          sb[sb.Length - 1] = ']';
        }
      }
      return sb.ToString();
    }

    static void toJavaString(string s, StringBuilder sb) {
      if (s.IndexOfAny(wrongChars) < 0) {
        sb.Append(s);
        return;
      }
      foreach (char ch in s) {
        if (ch >= ' ') {
          if (ch == '\\' || ch == '\'') sb.Append('\\');
          sb.Append(ch);
        } else switch (ch) {
            case '\b':
              sb.Append("\\b");
              break;
            case '\f':
              sb.Append("\\f");
              break;
            case '\n':
              sb.Append("\\n");
              break;
            case '\r':
              sb.Append("\\r");
              break;
            case '\t':
              sb.Append("\\t");
              break;
            default:
              sb.Append("????toJavaString");
              break;
          }
      }
    }
    public const string defaultValue = "(*(@%&(*@:+}{:";
    public static object def(int val, int defVal) {
      return val == defVal ? (object)defaultValue : (object)val;
    }
    public static object def(string val, string defVal) {
      return val == defVal ? (object)defaultValue : (object)val;
    }
    public static object def(bool val, bool defVal) {
      return val == defVal ? (object)defaultValue : (object)val;
    }

    public bool isEmpty() { return pars == null || pars.Length <= 0; }

    public void ToString(StringBuilder sb, bool isEvent) {
      if (pars == null || pars.Length <= 0) return;
      sb.Append('{');
      for (int i = 1; i < pars.Length; i += 2) {
        if (!(pars[i - 1] is string))
          throw new Exception();
        if ((pars[i] is string) && ((string)pars[i] == defaultValue)) continue;
        if (i > 1) sb.Append(", ");
        sb.Append('\''); sb.Append((string)pars[i - 1]); sb.Append('\'');
        sb.Append(':');
        if (pars[i] is string) {
          string s = (string)pars[i];
          if (isEvent)
            sb.Append(s);
          else if (s.IndexOf("#a") == 0) {
            sb.Append('['); sb.Append(s.Substring(2)); sb.Append(']');
          } else if (s.IndexOf("#s") == 0)
            sb.Append(s.Substring(2));
          else {
            sb.Append('\''); toJavaString(s, sb); sb.Append('\'');
          }
        } else if (pars[i] is int)
          sb.Append(((int)pars[i]).ToString());
        else if (pars[i] is long)
          sb.Append(((long)pars[i]).ToString());
        else if (pars[i] is bool)
          sb.Append(((bool)pars[i]).ToString().ToLower());
        else
          throw new Exception();
      }
      sb.Append('}');
    }
    public static string getElement(string id, string subId) {
      return string.Format("#s$get('{0}{1}')", id, subId);
    }
  }
}

