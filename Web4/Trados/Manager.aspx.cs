using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Resources;
using System.Text;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using Trados;

namespace web4.Trados {
  public partial class Manager : System.Web.UI.Page {

    protected void Op1_Click(object sender, EventArgs e) {
      List<string> files = new List<string>();
      foreach (LocPageGroup grp in groups().Where(g => g != LocPageGroup.newEA)) {
        GenResxContext ctx = new GenResxContext(grp);
        foreach (string s in TradosLib.GenResx(ctx)) files.Add(s);
        LocCfgPageGroupFilter group = LocCfg.Instance().findPageGroup(grp);
        //CSharp resources
        string globalRes = group.GlobalResourcePath;
        if (ctx.toTrans.Count > 0) {
          LowUtils.AdjustFileDir(globalRes);
          using (ResXResourceWriter wr = new ResXResourceWriter(globalRes))
            foreach (TradosLib.resxNameValue nv in ctx.toTrans)
              wr.AddResource(nv.Name, nv.Value);
          files.Add(globalRes);
        } else if (File.Exists(globalRes))
          File.Delete(globalRes);
        //JS resources
        string globalResJS = group.GlobalResourcePathJS;
        if (ctx.toTransJS.Count > 0) {
          LowUtils.AdjustFileDir(globalResJS);
          using (ResXResourceWriter wr = new ResXResourceWriter(globalResJS))
            foreach (TradosLib.resxNameValue nv in ctx.toTransJS)
              wr.AddResource(nv.Name, nv.Value);
          files.Add(globalResJS);
        } else if (File.Exists(globalResJS))
          File.Delete(globalResJS);
      }
      string[] filesArr = (from LocPageGroup grp in groups() from string s in TradosLib.oper1(grp) select s).ToArray();
      CountLab.Text = filesArr.Length.ToString();
      LogRep.DataSource = files; LogRep.DataBind();
    }

    protected void Oper2_Click(object sender, EventArgs e) {
      TradosLib.oper2(group(), TransLang, AdjustStrongChb.Checked);
    }

    protected void Oper3_Click(object sender, EventArgs e) {
      Response.Clear();
      Response.ContentType = "application/vnd.ms-excel";
      Response.Charset = "";
      TradosLib.oper3(group(), TransLang, LockChb.Checked, sentCommands(), Response.OutputStream);
      Response.End();
    }
    protected void Oper4_Click(object sender, EventArgs e) {
      ErrorLab.Text = null;
      if (!FileUpload.HasFile) return;
      StringBuilder log = new StringBuilder();
      bool ignoreSentNotExist = IgnoreSentenceNotExist.Checked;
      TradosLib.oper4(Encoding.UTF8.GetString(FileUpload.FileBytes), ignoreSentNotExist, ignoreSentNotExist ? SrcLang : Langs.no, ignoreSentNotExist ? TransLang : Langs.no, log);
      if (log.Length > 0)
        ErrorLab.Text = log.ToString();
    }

    protected void Oper5_Click(object sender, EventArgs e) {
      TradosLib.oper5(group(), TransLang);
    }



    Langs srcLang, transLang;
    LocCfg.GroupSrcLang[] infoForDestLang = new LocCfg.GroupSrcLang[0];

    void refreshGroups() {
      GroupsChb.DataSource = null;
      GroupsChb.DataSource = LowUtils.EnumGetValues<LocPageGroup>().
        Where(g => g != LocPageGroup.other).
        Select(val => new { value = val.ToString(), title = val.ToString() + " (" + (infoForDestLang.FirstOrDefault(dl => dl.Group == val) ?? LocCfg.GroupSrcLang.NullValue).TransDef.Src + "=>" + transLang + ")" });
      GroupsChb.DataBind();
    }

    protected void Page_Load(object sender, EventArgs e) {
      Machines.checkAdminIP(Context);
      //Machines.sb = null;
      LocCfg.Refresh();
      if (IsPostBack) return;
      DestinationLangs.DataSource = new Langs[] { Langs.no }.Concat(CommonLib.FullLangsLingea.OrderBy(l => l.ToString())); DestinationLangs.DataBind();
      //ProjectsRad.DataSource = LocCfg.Instance().TransDefs(); ProjectsRad.DataBind();
      SentFilterChb.DataSource = Enum.GetNames(typeof(LocCommand)).Where(s => s != "NONE"); SentFilterChb.DataBind();
      refreshGroups();
      foreach (ListItem lb in SentFilterChb.Items)
        if (lb.Value != LocCommand.DONE.ToString()) lb.Selected = true;

      /*string action = Request["action"];
      switch (action) {
        case "1":
          GroupsChb.SelectedValue = Request["group"];
          ResxGenBtn_Click(null, null);
          return;
        case "2":
          GroupsChb.SelectedValue = Request["group"];
          ProjectsRad.SelectedValue = Request["project"];
          AdjustStrongChb.Checked = true;
          InitTransBtn_Click(null, null);
          return;
        case "3":
          GroupsChb.SelectedValue = Request["group"];
          ProjectsRad.SelectedValue = Request["project"];
          int cnt;
          using (FileStream fs = new FileStream(string.Format(@"c:\temp\{0}_{1}.xls", Request["project"].Replace("=>", "_"), Request["group"]), FileMode.Create)) {
            cnt = TradosLib.ExportXml(groups().First(), TransLang, fs, sentCommands());
            Response.Clear();
            Response.Write(cnt.ToString());
            Response.End();
          }
          return;
        case "5":
          GroupsChb.SelectedValue = Request["group"];
          ProjectsRad.SelectedValue = Request["project"];
          TradosLib.GenerateResx(groups().First(), TransLang);
          return;
      }*/
      refreshLocked();
    }

    void refreshLocked() {
      TradosDataContext db = Machines.getTradosContext();
      LockedRep.DataSource = db.Locks.Where(l => l.Locked).Select(l => new { l.PageGroup, l.Lang }).Distinct().
        Select(l => string.Format("{0}.{1}", Enum.GetName(typeof(LocPageGroup), l.PageGroup), Enum.GetName(typeof(Langs), l.Lang)));
      LockedRep.DataBind();
    }

    Langs TransLang {
      get {
        if (transLang == Langs.no) throw new Exception("Vyberte nejdříve Cílový jazyk!");
        return transLang;
      }
    }

    Langs SrcLang {
      get {
        readLangs(); if (srcLang == Langs.no) throw new Exception("Select project first!");
        return srcLang;
      }
    }

    IEnumerable<LocPageGroup> groups() {
      return groupsLow().Select(li => (LocPageGroup)Enum.Parse(typeof(LocPageGroup), li.Value));
    }

    LocPageGroup group() {
      readLangs();
      return groupsLow().Select(li => (LocPageGroup)Enum.Parse(typeof(LocPageGroup), li.Value)).First();
    }

    IEnumerable<ListItem> groupsLow() {
      bool selected = false;
      foreach (ListItem li in GroupsChb.Items)
        if (li.Selected) {
          yield return li;
          selected = true;
        }
      if (!selected) throw new Exception("Vyberte nejdříve Skupinu souborů!");
    }

    void readLangs() {
      string[] st = groupsLow().First().Text.Split('(', ')');
      srcLang = Langs.no; //transLang = Langs.no;
      //if (ProjectsRad.SelectedIndex < 0) return;
      LocCfg.decodeLangs(st[1], out srcLang, out transLang);
    }

    protected void DestLangChanged(object sender, EventArgs e) {
      transLang = LowUtils.EnumParse<Langs>(((DropDownList)sender).SelectedValue);
      if (transLang == Langs.sp_sp) transLang = Langs.es_es;
      infoForDestLang = LocCfg.Instance().SrcLangForDestLang(transLang).ToArray();
      refreshGroups();
    }

    protected void DownloadUploadBtn_Click(object sender, EventArgs e) {
      StringBuilder log = new StringBuilder();
      LocPageGroup grp = group();
      //foreach (LocPageGroup grp in groups())
      TradosLib.AutoTranslate(grp, TransLang, log);
      if (log.Length > 0)
        ErrorLab.Text = log.ToString();
    }

    protected void TransToAspxBtn_Click(object sender, EventArgs e) {
      TradosLib.RenameAspx(groups(), true);
    }

    protected void TransSrcToApsx_Click(object sender, EventArgs e) {
      TradosLib.RenameAspx(groups(), false);
    }

    List<LocCommand> sentCommands() {
      List<LocCommand> res = new List<LocCommand>();
      foreach (ListItem li in SentFilterChb.Items)
        if (li.Selected) res.Add((LocCommand)Enum.Parse(typeof(LocCommand), li.Value));
      return res;
    }

    protected void MultiTrans_Click(object sender, EventArgs e) {
      TradosDataContext db = Machines.getTradosContext(false);
      var grps = db.Sentences.
        Where(s => s.TransLang == (short)SrcLang && groups().Select(g => (short)g).Contains(s.Page.PageGroup)).
        Select(s => new { s.Id, s.Page.FileName, s.TransText }).
        GroupBy(s => s.TransText).
        Where(g => g.Count() > 2).
        ToArray().
        OrderBy(g => g.Key);

      XElement htmlRoot = XElement.Parse(
  @"<html xmlns=""htmlPassivePage"">
<head>
<title>titulek</title>
</head>
<body>
</body>
</html>");
      XElement body = htmlRoot.Descendants(TradosLib.html + "body").Single();
      foreach (var grp in grps) {
        XElement trans = XElement.Parse(@"<root xmlns=""htmlPassivePage""> " + grp.Key + " </root>", LoadOptions.PreserveWhitespace);
        body.Add(
        new XElement(TradosLib.html + "div",
          new XElement(TradosLib.html + "trans", trans.Nodes()),
          new XElement(TradosLib.html + "div", new XAttribute("style", "margin-left:20px;"),
            grp.Select(it => new XElement(TradosLib.html + "div", string.Format("id={0}, page={1}", it.Id, it.FileName)))))
        );
      }
      StringUtils.StringToFile(htmlRoot.ToString(SaveOptions.DisableFormatting), @"c:\temp\pom.htm");
    }

    protected void UseTrados_Click(object sender, EventArgs e) {
      switch (((LinkButton)sender).ID) {
        case "UseTrados1":
          Langs lang = SrcLang;
          LocPageGroup grp = groups().FirstOrDefault(); if (grp == LocPageGroup.other) return;
          TradosDataContext db = Machines.getTradosContext(false);
          int id = 0;
          using (ResXResourceWriter wr = new ResXResourceWriter(@"c:\temp\source.resx"))
            foreach (string sent in db.Sentences.Where(s => s.Page.PageGroup == (short)grp && s.TransLang == (short)lang && s.TransText != null).Select(s => s.TransText).Distinct())
              wr.AddResource((id++).ToString(), sent);
          break;
        case "UseTrados2":
          Dictionary<int, string> source = new Dictionary<int, string>();
          using (ResXResourceReader rdr = new ResXResourceReader(@"c:\temp\source.resx"))
            foreach (System.Collections.DictionaryEntry de in rdr)
              source.Add(int.Parse((string)de.Key), (string)de.Value);
          using (ResXResourceWriter wr = new ResXResourceWriter(@"c:\temp\trans2.resx"))
          using (ResXResourceReader rdr = new ResXResourceReader(@"c:\temp\trans1.resx"))
            foreach (System.Collections.DictionaryEntry de in rdr) {
              int trans1Id = int.Parse((string)de.Key); string value = (string)de.Value;
              if (source[trans1Id] == value) continue;
              wr.AddResource(trans1Id.ToString(), value);
            }
          break;
        case "UseTrados3":
          Dictionary<int, string> source3 = new Dictionary<int, string>();
          using (ResXResourceReader rdr = new ResXResourceReader(@"c:\temp\source.resx"))
            foreach (System.Collections.DictionaryEntry de in rdr)
              source3.Add(int.Parse((string)de.Key), (string)de.Value);
          XElement el = new XElement("lookup");
          StringBuilder sb = new StringBuilder();
          using (ResXResourceReader rdr = new ResXResourceReader(@"c:\temp\trans2.resx"))
            foreach (System.Collections.DictionaryEntry de in rdr) {
              int trans2Id = int.Parse((string)de.Key);
              string value1 = TradosLib.xmlToExcel(source3[trans2Id], sb);
              string value2 = TradosLib.xmlToExcel((string)de.Value, sb);
              el.Add(new XElement("item", new XElement("cs_cz", value1), new XElement("en_gb", value2)));
            }
          el.Save(@"c:\temp\lookup_import.xml");
          break;
      }
    }
    bool instrOK(XElement root, out string instr) {
      instr = "??";
      XAttribute attr = root.Attribute("title"); if (attr == null) return false;
      if (attr.Value.IndexOf(TradosLib.attrStart) != 0) return false;
      instr = attr.Value.Substring(TradosLib.attrStart.Length);
      return true;
    }
    protected void ExportInstructionsBtn_Click(object sender, EventArgs e) {
      string instr = null;
      XElement res = XElement.Parse(
  @"<html xmlns=""htmlPassivePage"">
<head>
<title>titulek</title>
</head>
<body>
</body>
</html>");
      XElement root = res.Descendants(TradosLib.html + "body").Single();
      foreach (var grp in
        TradosLib.getFiles(groups()).
          Where(f => Path.GetExtension(f) == ".lmdata").
          Select(f => new { fn = f, el = XElement.Load(f) }).
          Where(fe => instrOK(fe.el, out instr)).
          Select(fe => new { fe.fn, instr }).
          GroupBy(fi => fi.instr).
          Select(g => new { instr = g.Key, count = g.Count(), fn = g.First().fn }).
          OrderBy(g => g.instr)) {
        root.Add(
          new XElement(TradosLib.html + "p",
            new XElement(TradosLib.html + "i", grp.count.ToString() + " (" + grp.fn + ")"),
            new XElement(TradosLib.html + "br"),
            new XElement(TradosLib.html + "trans", grp.instr)
          )
        );
      }
      res.Save(@"c:\temp\pom.htm");
    }

    protected void TestBtn_Click(object sender, EventArgs e) {
      //string s = HtmlToXmlEntity.NormalizeEntities("&gt;");
      TradosLib.NormalizeLookupXml();
    }

    static LineIds[] comLines = new LineIds[] { LineIds.English, LineIds.German, LineIds.Spanish, LineIds.French, LineIds.Italian, LineIds.Russian };

    IEnumerable<LineIds> getLines(Domains site) {
      foreach (LineIds line in comLines) yield return line;
      if (site == Domains.sz) yield return LineIds.Ucto;
    }

    //protected void EAUrlLocalize_Click(object sender, EventArgs e) {
    //  XElement lines = new XElement("root", new XComment("Soubor vytvoren by http://xxx/lmcom/Services/Trados/Manager.aspx, operace 'EA Url Localize'"));
    //  SiteMapNode nd;
    //  foreach (Langs lng in CommonLib.smallLocalizations) {
    //    urlInfo.setCulture(lng);
    //    //string lngStr = lng.ToString().Replace('_', '-');
    //    //if (lngStr == "sp-sp") lngStr = "es-es";
    //    //Thread.CurrentThread.CurrentUICulture = new CultureInfo(lngStr);
    //    string lngStr = lng.ToString().Replace('_', '-');
    //    foreach (LineIds line in getLines(Domains.com)) {
    //      nd = site.lib.HomeNode(line, Domains.com, lng);
    //      lines.Add(new XElement("item",
    //        new XAttribute("site", "com"),
    //        new XAttribute("line", line.ToString()),
    //        new XAttribute("lang", lng.ToString()),
    //        new XAttribute("title", nd.Title),
    //        new XAttribute("url", urlInfo.getUrl(Domains.com, SubDomains.com, LMApps.web, lngStr, "Pages/" + site.lib.lineIdToUrl(line, lng) + ".aspx", true, true)))); //TODO SUBSITE
    //    }
    //    nd = site.lib.HomeNode(Domains.com);
    //    lines.Add(new XElement("item",
    //      new XAttribute("site", "com"),
    //      new XAttribute("line", "no"),
    //      new XAttribute("lang", lng.ToString()),
    //      new XAttribute("title", nd.Title /*site.lib.HomeTitle()*/),
    //      new XAttribute("url", urlInfo.getUrl(Domains.com, SubDomains.com, LMApps.web, lngStr, site.lib.HomeUrl(Domains.com), true, true)))); //TODO SUBSITE
    //    nd = SiteMap.Provider.FindSiteMapNode("~/com/web/lang/Pages/Users/ELandRunCourse.aspx");
    //    lines.Add(new XElement("item",
    //      new XAttribute("site", "com"),
    //      new XAttribute("line", "myELand"),
    //      new XAttribute("lang", lng.ToString()),
    //      new XAttribute("title", CompaniesLoc.LMSRunCourse_Title),
    //      new XAttribute("url", urlInfo.getUrl(Domains.com, SubDomains.com, LMApps.web, lngStr, "Pages/Users/ELandRunCourse.aspx", true, true)))); //TODO SUBSITE
    //  }
    //  /*
    //  Thread.CurrentThread.CurrentUICulture = new CultureInfo("cs-cz");
    //  foreach (LineIds line in getLines(Domains.sz)) {
    //    nd = site.lib.HomeNode(line, Domains.sz);
    //    lines.Add(new XElement("item",
    //      new XAttribute("site", "sz"),
    //      new XAttribute("line", line.ToString()),
    //      new XAttribute("lang", "cs_cz"),
    //      new XAttribute("title", nd.Title),
    //      new XAttribute("url", urlInfo.getUrl(Domains.sz, SubDomains.no, LMApps.web, "cs-cz", "Pages/" + site.lib.lineIdToUrl(line) + ".aspx", true, true)))); //TODO SUBSITE
    //  }
    //  lines.Add(new XElement("item",
    //    new XAttribute("site", "sz"),
    //    new XAttribute("line", "no"),
    //    new XAttribute("lang", "cs_cz"),
    //    new XAttribute("title", "Hlavní"),
    //    new XAttribute("url", urlInfo.getUrl(Domains.sz, SubDomains.no, LMApps.web, "cs-cz", site.lib.HomeUrl(Domains.sz), true, true)))); //TODO SUBSITE
    //   */
    //  lines.Save(@"q:\LMNet2\WebApps\EduAuthorNew\app_data\lines.xml");
    //}

    protected void DuplicatedSentencesBtn_Click(object sender, EventArgs e) {
      TradosDataContext db = Machines.getTradosContext(false);
      var dupl = db.Sentences.GroupBy(g => new { g.Name, g.TransLang, g.PageId }).Where(g => g.Count() > 1).ToArray();
      using (StreamWriter wr = new StreamWriter(@"c:\temp\duplsent.txt")) {
        foreach (var grp in dupl) {
          var first = grp.First();
          wr.WriteLine(string.Format("***** transLang={1}, name={0}", first.Name, (Langs)first.TransLang));
          foreach (var sent in grp) {
            wr.WriteLine(string.Format("id={0}, src={1}, trans={2}", sent.Id, sent.SrcText, sent.TransText));
          }
        }
      }
    }
  }

  public static class CompaniesLoc {

    public static string Format(string str, params object[] pars) {
      try {
        return string.Format(str.Replace('[', '{').Replace(']', '}'), pars);
      } catch (Exception exp) {
        throw new Exception("Error in: " + str, exp);
      }
    }

    public static string ToLongDateString(DateTime dt, Langs lng) {
      if (CommonLib.CompanyLang_isOK(lng)) return dt.ToLongDateString();
      //return res2.ToString(engCulture.DateTimeFormat.LongDatePattern, engCulture);
      return dt.ToString("D", engCulture);
    } static CultureInfo engCulture = CultureInfo.GetCultureInfo("en-gb");

    public static string ToShortDateString(DateTime dt, Langs lng) {
      if (CommonLib.CompanyLang_isOK(lng)) return dt.ToShortDateString();
      //return res2.ToString(engCulture.DateTimeFormat.ShortDatePattern, engCulture);
      return dt.ToString("d", engCulture);
    }

    public static string TimeSpanString(TimeSpan ts, Langs lng) {
      if (CommonLib.CompanyLang_isOK(lng)) return ts.ToString();
      //return ts.ToString(engCulture.DateTimeFormat.ShortTimePattern, engCulture);
      return ts.ToString("g", engCulture);
    }

    public static CultureInfo ActCulture(Langs lng) {
      return CommonLib.CompanyLang_isOK(lng) ? System.Threading.Thread.CurrentThread.CurrentCulture : engCulture;
    }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\BuyCompanyInfo.ascx
    public static string DomenaLMSsystemu { get { return CSLocalize.localize("93dd21511caa406a9e1e052e013ea931", LocPageGroup.compLMCom, "Your LMS system domain name. Two domains or IP addresses are allowed (*), separated by a comma (for example www.company.com, 212.24.151.34)"); } }
    public static string DomenaLMSsystemuInfo { get { return CSLocalize.localize("5d7d8c0da760432fb32a90cb9eccfe00", LocPageGroup.compLMCom, "The domain or IP address is used to the verify validity of your LMS language course license. During the learning process the validity of your license is checked. Domain name or IP address used to launch your LMS courses must correspond to one of the addresses entered below."); } }
    public static string JmenoSpravce { get { return CSLocalize.localize("af653ce9704b463e9fdeae67c532dfc0", LocPageGroup.compLMCom, "Administrator name"); } }
    public static string JmenoFirmy { get { return CSLocalize.localize("ace4e9709fba4170b6b76e763dadb933", LocPageGroup.compLMCom, "Company name"); } }
    public static string WebFirmy { get { return CSLocalize.localize("f26b287b2d9e4b33838e7b3314b52521", LocPageGroup.compLMCom, "Company web"); } }
    public static string VATNumber { get { return CSLocalize.localize("ba3c0df58e124f6aa205469651bfb1e3", LocPageGroup.compLMCom, "VAT number"); } }
    public static string PrvniRadekAdresy { get { return CSLocalize.localize("57a3bbeae2af4ab1b322fee444ce6b4b", LocPageGroup.compLMCom, "First line of address"); } }
    public static string DruhyRadekAdresy { get { return CSLocalize.localize("dfbf4b867901420ba9e2aeddd8d5c39a", LocPageGroup.compLMCom, "Second line of address"); } }
    public static string TretiRadekAdresy { get { return CSLocalize.localize("e6aa0e7825ad4f2fa144bb3eca13766a", LocPageGroup.compLMCom, "Third line of address"); } }
    public static string Stat { get { return CSLocalize.localize("0845bdd47b884d61a42315544ded2bd6", LocPageGroup.compLMCom, "Country"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\BuyConfirm.ascx
    public static string ProdlouzeniLicence { get { return CSLocalize.localize("a56d59ef20d14978aaf515d58784991c", LocPageGroup.compLMCom, "Extension of LMS course licenses"); } }
    public static string ObjednaniRocnichLicenci { get { return CSLocalize.localize("0d3676ffd34c4b1ca6c4047893285a6d", LocPageGroup.compLMCom, "Purchase of new LMS course licenses"); } }
    public static string ObjednaniOnlineLicenci { get { return CSLocalize.localize("d6d6720f45824f84b418932d394a6a88", LocPageGroup.compLMCom, "Purchase of new Online course licenses"); } }
    public static string ObjednaniTestMe { get { return CSLocalize.localize("97ad9f54f3e846cb9298bc63e0565d4d", LocPageGroup.compLMCom, "Purchase of eTestMe.com licenses"); } }
    public static string PridaniNovychUzivatelu { get { return CSLocalize.localize("465da3a216ae4e71bcb22aec84962a35", LocPageGroup.compLMCom, "Purchase of new LMS course licenses"); } }
    public static string PotvrzeniObjednavky { get { return CSLocalize.localize("44d914e00db94156b3e98f35318950d8", LocPageGroup.compLMCom, "Order confirmation"); } }
    public static string Objednavka { get { return CSLocalize.localize("ee0b4c18dfb641428cedf5909030118d", LocPageGroup.compLMCom, "Order"); } }
    public static string TypObjednavky { get { return CSLocalize.localize("524a94ca109a405db75add0a5951f511", LocPageGroup.compLMCom, "Order type"); } }
    public static string ObdobiOd { get { return CSLocalize.localize("ec45d91456c94377863ce4c7bbcccadd", LocPageGroup.compLMCom, "Period: from"); } }
    public static string ObdobiDo { get { return CSLocalize.localize("e346c4bf8bfb443eabce131f8efbace0", LocPageGroup.compLMCom, "until"); } }
    public static string FiremniUdaje { get { return CSLocalize.localize("b68499db26e54dc98908145cdff245b1", LocPageGroup.compLMCom, "Company information"); } }
    public static string ObjednaneLicence { get { return CSLocalize.localize("2f3b430cffc44656ba8abf07eb7e70fc", LocPageGroup.compLMCom, "Licenses ordered"); } }
    public static string CenaObjednavky { get { return CSLocalize.localize("2ef95ff14e424cc4ae2f27781621396f", LocPageGroup.compLMCom, "Order price"); } }
    public static string CelkovaCenaBezDPH { get { return CSLocalize.localize("6df969bb453e4a388486ce5f8f295556", LocPageGroup.compLMCom, "Total price (without VAT)"); } }
    public static string DosavadniObrat { get { return CSLocalize.localize("f74e2d5f238744e49d02c6ea1cce0bcf", LocPageGroup.compLMCom, "Current turnover"); } }
    public static string Sleva { get { return CSLocalize.localize("dc8cac06968b4ee9ae6d4a9386786e0c", LocPageGroup.compLMCom, "Discount based on the current turnover"); } }
    public static string CenaPoSleve { get { return CSLocalize.localize("e8c24af9b87042c588872ade294ce481", LocPageGroup.compLMCom, "Price after discount (without VAT)"); } }
    public static string CenaSDPH { get { return CSLocalize.localize("4531719895de437abf63c29f36a7e4c2", LocPageGroup.compLMCom, "Price including VAT"); } }
    public static string DPH { get { return CSLocalize.localize("149321f12d414de284da713f2fe6a023", LocPageGroup.compLMCom, "VAT"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\BuyFirst.ascx
    public static string ZadejtePoctyRocnichLicenci { get { return CSLocalize.localize("ea5c12148db14a02975cc1e8e89b9e64", LocPageGroup.compLMCom, "Enter the number of licenses"); } }
    public static string ZadejteInformaceOFirme { get { return CSLocalize.localize("042b80a0e4e843b38c1b3ab1fae095b1", LocPageGroup.compLMCom, "Enter company information"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\BuyOther.ascx
    public static string VyberteJednuMoznost { get { return CSLocalize.localize("dd8925d6289f4ea391fbd2adfeefb2fd", LocPageGroup.compLMCom, "Please select one of the following options"); } }
    public static string AktualniLicencePro { get { return CSLocalize.localize("161d89f29950437a81aa913448d0b4c7", LocPageGroup.compLMCom, "Your current licenses are valid until [1]. Select one of the following options for extending your current licenses:"); } }
    public static string ProdlouzitLicenci { get { return CSLocalize.localize("2c2fc109ab35460e9d175df6e9745d53", LocPageGroup.compLMCom, "Extend the current licenses for another period"); } }
    public static string KLicenciPridatUzivatele { get { return CSLocalize.localize("4a36112017ed4124b93a704b5bc8d14e", LocPageGroup.compLMCom, "Buy new licenses"); } }
    public static string ZadejteDelkuProdlouzeni { get { return CSLocalize.localize("e8519652466946c28d14c68980ff4d9d", LocPageGroup.compLMCom, "Enter the length of the license extension"); } }
    public static string Mesicu { get { return CSLocalize.localize("b3dbf9cfac4743d9ae2c4b8fa989e12d", LocPageGroup.compLMCom, "months, i.e. from [0] to [1]"); } }
    public static string ModifikujtePocet { get { return CSLocalize.localize("50a5e15b6c244d7db4bce8a6a6e83bef", LocPageGroup.compLMCom, "You can modify the number of extended licenses"); } }
    public static string ZadejtePocetNovych { get { return CSLocalize.localize("27301ce78e6f403398d0209d8f0a96e8", LocPageGroup.compLMCom, "Enter the number of new licenses"); } }
    public static string UpravteInformaceOFirme { get { return CSLocalize.localize("afc1542f7eb148c9be52f4623f99bc48", LocPageGroup.compLMCom, "Modify company information"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\BuySelectProductRow.ascx
    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\PriceList.aspx
    public static string Produkt { get { return CSLocalize.localize("80dd8b32369e431dbfb2f0359878d571", LocPageGroup.compLMCom, "License name"); } }
    public static string CenaZaLicenci { get { return CSLocalize.localize("89fe1b40f4134c37815684c7a8ffbd9f", LocPageGroup.compLMCom, "Price per license ([0] months)"); } }
    public static string TestCenaZaLicenci { get { return CSLocalize.localize("549dd9d390ac4053af2bc6c96d567bf1", LocPageGroup.compLMCom, "Price per license"); } }
    public static string CenaZaRocniLicenci { get { return CSLocalize.localize("b47adfb913fa4e2eaa43d14476953b23", LocPageGroup.compLMCom, "Price for annual license for one student"); } }
    public static string CenaZaPruchodTestem { get { return CSLocalize.localize("6907af75d3954802b4e0f9a57c8e5ae1", LocPageGroup.compLMCom, "Price for single test for one student"); } }
    public static string MnozstevniSlevy { get { return CSLocalize.localize("26cc74a912974bb3b263e739d7192bd6", LocPageGroup.compLMCom, "Quantity discounts"); } }
    public static string SlevaSePocita { get { return CSLocalize.localize("1c64afb6c77a4ba690cef83a5885a87c", LocPageGroup.compLMCom, "The discount is calculated from your total turnover (all your previous orders)"); } }
    public static string ObratOd { get { return CSLocalize.localize("6355444f5574416085c3024b757cc2b8", LocPageGroup.compLMCom, "Turnover from"); } }
    public static string ObratDo { get { return CSLocalize.localize("2a87060eae014f5da34d0e884181c148", LocPageGroup.compLMCom, "to"); } }
    public static string ObratNad { get { return CSLocalize.localize("88f70668a841499aac3c57c72b549e94", LocPageGroup.compLMCom, "above [0]"); } }
    //public static string Sleva { get { return CSLocalize.localize("fee82b2a595a433cad6de0b6fa363c1d", LocPageGroup.compLMCom, "Discount"); } }

    public static string SoucasnyPocetLicenci { get { return CSLocalize.localize("f2cad02985ee407192a2d9be0948f722", LocPageGroup.compLMCom, "Current number of licenses"); } }
    public static string PridatNovychLicenci { get { return CSLocalize.localize("25130a01e5b04d1abac162e927009b5e", LocPageGroup.compLMCom, "Add new licenses"); } }
    public static string ModifikovatPocetLicenci { get { return CSLocalize.localize("09a29d30816b49758ebdfd6d420af78d", LocPageGroup.compLMCom, "Modify number of licenses"); } }
    public static string PocetLicenci { get { return CSLocalize.localize("86ed89114f9d4cd49a7cd842d99a5ecd", LocPageGroup.compLMCom, "Total number of licenses"); } }
    public static string CenaCelkem { get { return CSLocalize.localize("a1590398c2924f17b69b337810da862f", LocPageGroup.compLMCom, "Total price"); } }
    public static string RocniLicenceZa { get { return CSLocalize.localize("ba27141088834b9082922e228697bf72", LocPageGroup.compLMCom, "annual license for [0]"); } }
    public static string ZadejtePocetLicenci { get { return CSLocalize.localize("41f02bd771654b3a89cb8974c2f47221", LocPageGroup.compLMCom, "Enter the number of licenses"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\BuySelectProducts.ascx
    public static string ZadejteAlesponJednu { get { return CSLocalize.localize("97af8c71cc374216aa6716bd7647816b", LocPageGroup.compLMCom, "Enter at least one license"); } }


    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\EditCtrl.ascx
    public static string PovinnyUdaj { get { return CSLocalize.localize("dfd45d2987fc4f19a86076dfafe494ad", LocPageGroup.compLMCom, "Required field"); } }
    public static string SpatnyFormat { get { return CSLocalize.localize("f094bc82f40c42c8a35e558df163eb6d", LocPageGroup.compLMCom, "Wrong format"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Partnership\DictInfoItem.ascx
    public static string SlovnikObsahuje { get { return CSLocalize.localize("40d17acd40134bb2b240170f9ec79ae2", LocPageGroup.compLMCom, "Contains [0] entries, [1] definitions, [2] examples, [3] translations"); } }
    public static string IdentifikaceSlovniku { get { return CSLocalize.localize("c029f34131af4f2cb33ab58705eedf98", LocPageGroup.compLMCom, "Identification of the dictionary for the use on your pages"); } }
    public static string DetailyZde { get { return CSLocalize.localize("d4013dd0660d485a880f4a5011848279", LocPageGroup.compLMCom, "details here"); } }

    //Q:\lmcom\LMCom\App_Code\LM\CompaniesFramework.cs
    public static string modDescrType_small_num { get { return CSLocalize.localize("3047f728bd5c4582933a1ec06affdd4d", LocPageGroup.compLMCom, "[0] modules (one module for each chapter of the course)"); } }
    public static string modDescrType_big_num { get { return CSLocalize.localize("33222f388284442586480c6244fa3d9d", LocPageGroup.compLMCom, "[0] modules (one module for each level of the course)"); } }
    public static string modDescrType_small_expl { get { return CSLocalize.localize("7cb6f4243a54484888042b2b282ed3cd", LocPageGroup.compLMCom, "[0] Blended learning LMS modules"); } }
    public static string modDescrType_hours { get { return CSLocalize.localize("0cc697d645e640d1b06ce291f7c6a6d0", LocPageGroup.compLMCom, "[0] hours of learning"); } }
    public static string modDescrType_pozn { get { return CSLocalize.localize("7a0e44dfd87d4418910b325c14a66d17", LocPageGroup.compLMCom, "Note: The sample chapter is one of [0] chapters in the course."); } }
    public static string modDescrType_big_expl { get { return CSLocalize.localize("4f5cc9fd3a724181a5ce4a47c51ceccf", LocPageGroup.compLMCom, "[0] Self-study LMS modules ([1])"); } }
    public static string modDescrType_about_1 { get { return CSLocalize.localize("e9c69912d3fb4b5a8752e9914f32981b", LocPageGroup.compLMCom, "[0] hours of learning with [1] levels of proficiency: [2]"); } }
    public static string modDescrType_about_2 { get { return CSLocalize.localize("eb44df9b397049e19b3908e482bbfdef", LocPageGroup.compLMCom, "[0] interactive exercises and tests"); } }
    public static string modDescrType_about_3 { get { return CSLocalize.localize("7ed9b693bd3d456198865676c223d0cf", LocPageGroup.compLMCom, "[0] pictures and photographs"); } }
    public static string modDescrType_download { get { return CSLocalize.localize("f038909f8981452ebe49f07edfb608b7", LocPageGroup.compLMCom, "Download a ZIP file, containing [0] LMS modules (one module for each chapter of the course)"); } }
    //EMaily
    public static string email_ProformaTitle { get { return CSLocalize.localize("a097cd7afbac4d8d92fff51d99eb4609", LocPageGroup.compLMCom, "LANGMaster: proforma invoice"); } }
    public static string email_FakturaTitle { get { return CSLocalize.localize("9146f76d257548809974b3529c2d7db6", LocPageGroup.compLMCom, "LANGMaster: invoice"); } }
    public static string email_InvitationTitle { get { return CSLocalize.localize("a05d10413e1a4a9684a916f436b2f443", LocPageGroup.compLMCom, "Invitation to Online language course"); } }
    public static string email_TestInvitationTitle { get { return CSLocalize.localize("1e8d0041acd445af946bc8b114f20d6e", LocPageGroup.compLMCom, "Invitation to Online language test"); } }
    public static string email_VazenyZakazniku { get { return CSLocalize.localize("e8b4aaecfd5244daa7c3ec6f78bdc6d1", LocPageGroup.compLMCom, "Dear customer,"); } }
    public static string email_ZasilameProformu { get { return CSLocalize.localize("1afb91038ac74fa6a55496b7e6ec4d2d", LocPageGroup.compLMCom, "Thank you for your order. Attached please find a proforma invoice. An invoice (tax certificate) will be sent to you after receipt of payment."); } }
    public static string email_ZasilameFakturu { get { return CSLocalize.localize("91330c851c974a4b96d450540f0b53ab", LocPageGroup.compLMCom, "Thank you for your payment. Attached please find our invoice (tax certificate)."); } }
    public static string email_StavObjednavek { get { return CSLocalize.localize("780a8bb550874da18408bdfae53b814c", LocPageGroup.compLMCom, "The status of all your orders can be tracked [0]here[1]."); } }
    public static string email_PrejemeUspech { get { return CSLocalize.localize("88582e11679341808e387d43c34b4967", LocPageGroup.compLMCom, "We wish you success in your studies."); } }
    public static string email_LMTeam { get { return CSLocalize.localize("997ae5b4aa47466b8b3fbd7f29702972", LocPageGroup.compLMCom, "LANGMaster Team"); } }
    public static string email_PrehledLMSLicenci { get { return CSLocalize.localize("041cbf01e6d14fc8b7897775b346d844", LocPageGroup.compLMCom, "A summary of LMS language course licenses purchased can be found [0]here[1]."); } }
    public static string email_SpravaOnlineUzivatelu { get { return CSLocalize.localize("41b1d86de76e45d98191dde81f0946f6", LocPageGroup.compLMCom, "Use purchased licenses to Online language courses and invite your students to the courses. Administration of students and their licenses can be found [0]here[1]."); } }
    public static string email_SpravaOnlineUzivateluTest { get { return CSLocalize.localize("8b2a75ad295a4164a5e86f44945b75d9", LocPageGroup.compLMCom, "Use purchased licenses to eTestMe.com and invite your students to the tests. Administration of students and their licenses can be found [0]here[1]."); } }
    public static string email_VazenyStudente { get { return CSLocalize.localize("ce4c89f2ae12458da473de02f272c2a6", LocPageGroup.compLMCom, "Dear student,"); } }
    public static string email_Pozvani { get { return CSLocalize.localize("82fed831a7614a458def39a6e1ca2ebd", LocPageGroup.compLMCom, "please accept this Online language course invitation. To accept the invitation and run the course go to the web page: [#url#]."); } }
    public static string email_TestPozvani { get { return CSLocalize.localize("88fa2b7e5a8b40a48f514ddd06511c8c", LocPageGroup.compLMCom, "please accept this Online language test invitation. To accept the invitation and run the test go to the web page: [#url#]."); } }
    public static string email_StudentUspech { get { return CSLocalize.localize("888b44c170ca408980b10899f16bee30", LocPageGroup.compLMCom, "We wish you success in your studies."); } }
    public static string email_Spravce { get { return CSLocalize.localize("b8b8febe557141da9714fa250c805581", LocPageGroup.compLMCom, "Your training manager"); } }


    /*public static string email_LMSCourseProforma { get { return CSLocalize.localize("96746e45ed184b66997dfbc248b730c9", LocPageGroup.compLMCom, ""); } }
    public static string email_LMSCourseInvoice { get { return CSLocalize.localize("0fe761b98907451984204311305a5351", LocPageGroup.compLMCom, ""); } }
    public static string email_OnlineCourseProforma { get { return CSLocalize.localize("8924240a719a43a1871bddbff392680b", LocPageGroup.compLMCom, ""); } }
    public static string email_OnlineCourseInvoice { get { return CSLocalize.localize("1d8c6d3c3ea3467d9b2f4569348d4317", LocPageGroup.compLMCom, ""); } }*/

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\ScormModuleLine.aspx
    public static string AboutLi_1 { get { return CSLocalize.localize("3fca2e9914394574b1cae8d56ac7a1d5", LocPageGroup.compLMCom, "Professionally prepared and up-to-date learning content"); } }
    public static string AboutLi_2 { get { return CSLocalize.localize("be0c653a10cc40028ec29ab5f3c82ad5", LocPageGroup.compLMCom, "The latest teaching methods"); } }
    public static string AboutLi_3 { get { return CSLocalize.localize("5ddd03a175414fa3a7c65686744711bb", LocPageGroup.compLMCom, "Audio recordings made by native speakers"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_Orders.ascx
    public static string PrehledVsechObjednavek { get { return CSLocalize.localize("cdd67eb5315f46cbba7a65726a5a979e", LocPageGroup.compLMCom, "Order Summary"); } }
    public static string Vytvorena { get { return CSLocalize.localize("2b87893bc2cc4e2a9bc043dae7ed4213", LocPageGroup.compLMCom, "Date of order"); } }
    public static string Stav { get { return CSLocalize.localize("34a4b72a59f74ff2a24a4281c5f39fa0", LocPageGroup.compLMCom, "Status"); } }
    public static string Typ { get { return CSLocalize.localize("27d566db2dbb43dd93e157be4c10bf02", LocPageGroup.compLMCom, "Type"); } }
    public static string Cena { get { return CSLocalize.localize("67a6b1a5bf434443b93b0fd2d22b29bd", LocPageGroup.compLMCom, "Price"); } }
    public static string VariabilniSymbol { get { return CSLocalize.localize("9d9d96d59fbf4eab9513d094b83e6508", LocPageGroup.compLMCom, "Variable symbol"); } }
    public static string Processing { get { return CSLocalize.localize("239bf7b4e61d49399c53158c44382bd8", LocPageGroup.compLMCom, "Processing"); } }
    public static string WaitingForPayment { get { return CSLocalize.localize("206aad1da84d42468e8d6d6c7b4c24af", LocPageGroup.compLMCom, "Waiting for Payment"); } }
    public static string Payed { get { return CSLocalize.localize("bc6f70c4255b41a5beca528c38ab0078", LocPageGroup.compLMCom, "Paid "); } }
    public static string CompleteSummary { get { return CSLocalize.localize("2d6a2a57a8bc4dffb635a792d07eabe3", LocPageGroup.compLMCom, "Complete summary of your orders. Orders of LMS language courses + Orders of Online language courses + Orders for eTestMe.com tests."); } }
    public static string NoOrdersAvailable { get { return CSLocalize.localize("b9c242176f0b42b6b9370e725445d48e", LocPageGroup.compLMCom, "No orders available."); } }
    public static string CorporateCoursesCanBeOrdered { get { return CSLocalize.localize("f36d25c6e9544eeca17bb7f8385fc408", LocPageGroup.compLMCom, "Corporate courses can be ordered in one of the following ways:"); } }
    public static string Details { get { return CSLocalize.localize("2b4240eefa624534872d51eabdc3bf17", LocPageGroup.compLMCom, "details ..."); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_OwnLmsLicence.ascx
    public static string PrehledLicenci { get { return CSLocalize.localize("f5360082d3704639882886ec3dcf5022", LocPageGroup.compLMCom, "License Summary"); } }
    public static string LicencePlatneDo { get { return CSLocalize.localize("d420cdca7b054815b63eb71012bab4a6", LocPageGroup.compLMCom, "Licenses valid until [0]"); } }
    public static string SummaryOfLicenses { get { return CSLocalize.localize("5e52c3ccc4eb46bdaff39bea362eb21c", LocPageGroup.compLMCom, "Summary of your current LMS language courses licenses."); } }
    public static string NoAvailableLicenses { get { return CSLocalize.localize("835f13ea64b24ce3af32126f7759cc6c", LocPageGroup.compLMCom, "No available licenses."); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\ScormDownload.aspx
    public static string DownloadSCORMModules { get { return CSLocalize.localize("3a2995d5deff430db05b97746271cd37", LocPageGroup.compLMCom, "Download the course in the form of SCORM 1.2 modules"); } }
    public static string DownloadOneModule { get { return CSLocalize.localize("6657be92890149f5be7817d3e9608369", LocPageGroup.compLMCom, "Download one module for each level of the course"); } }
    public static string TryForFree { get { return CSLocalize.localize("b5307fda208f4eeeb8f8cb57556c4167", LocPageGroup.compLMCom, "Free trial on your LMS"); } }
    public static string ForTrialPeriod { get { return CSLocalize.localize("d57c66fdecfd40458720963b0a2c6b59", LocPageGroup.compLMCom, "You can run the course for free for a two-week trial period."); } }
    //public static string BuyLicense { get { return CSLocalize.localize("c4845e1a55334427bb1a90925135997e", LocPageGroup.compLMCom, "Buy a license for the LMS language course"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\AllDicts.aspx
    public static string AvailableDictionaries { get { return CSLocalize.localize("fe6e7176cb8f493ba1b6001541c8e310", LocPageGroup.compLMCom, "Available dictionaries"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Admin.aspx
    public static string Objednavky { get { return CSLocalize.localize("175d4599c6b9481285707bbe9ed8486a", LocPageGroup.compLMCom, "Orders"); } }
    public static string Licence { get { return CSLocalize.localize("6939c78c766c4e70a44207ce07df4474", LocPageGroup.compLMCom, "LMS courses: Licenses"); } }
    public static string UserManagementTab { get { return CSLocalize.localize("01546e628d644705a0410fa82279edc6", LocPageGroup.compLMCom, "Online courses: Licenses, Students, Study results"); } }
    public static string CompanyInfoTab { get { return CSLocalize.localize("6b08ec87fa0442088c9da7197edc13fc", LocPageGroup.compLMCom, "Company information"); } }
    public static string eTestMeTab { get { return CSLocalize.localize("24a8075e88c64463a9341734f58c2113", LocPageGroup.compLMCom, "eTestMe.com"); } }

    //Q:\lmcom\LMCom\App_Code\LM\CompaniesFramework.cs
    public static string ProfessionalEnglishCourse { get { return CSLocalize.localize("8b753fc6a90449c5a99e084e223ec7d6", LocPageGroup.compLMCom, "Professional English course focused on EU terminology"); } }
    public static string EuroEnglish { get { return CSLocalize.localize("479883135ff2498bad830f04d1734ab7", LocPageGroup.compLMCom, "LMS Course EuroEnglish"); } }
    public static string ELandEuroEnglish { get { return CSLocalize.localize("910c9a488f8146f19ea9a76ece064c90", LocPageGroup.compLMCom, "Online EuroEnglish Course"); } }
    public static string SCORMLMSmodulyProBlended { get { return CSLocalize.localize("e4ee24af8383423e97fc0e56112e906e", LocPageGroup.compLMCom, "SCORM LMS courses for blended learning"); } }
    public static string Beginners { get { return CSLocalize.localize("8ceb9e709d5547cf8645b6e675107eec", LocPageGroup.compLMCom, "Beginners"); } }
    public static string FalseBeginners { get { return CSLocalize.localize("a5fba46caf764a90b95c6644837bef8a", LocPageGroup.compLMCom, "False Beginners"); } }
    public static string PreIntermediate { get { return CSLocalize.localize("a934e2e49a604957bd8601cbd0e0e07a", LocPageGroup.compLMCom, "Pre-intermediate"); } }
    public static string Intermediate { get { return CSLocalize.localize("0f20c27c40d04ab5aac427dc9e82ee31", LocPageGroup.compLMCom, "Intermediate"); } }
    public static string IntermediateAdvanced { get { return CSLocalize.localize("c546c3f39443432ab508ac3bf2ba233b", LocPageGroup.compLMCom, "Intermediate and Advanced"); } }
    public static string Advanced { get { return CSLocalize.localize("7b54ff6d0ba1475a925063549fefc17c", LocPageGroup.compLMCom, "Advanced"); } }
    public static string UpperIntermediate { get { return CSLocalize.localize("6b7f53bffeb140acb84ddcdbb4d2d008", LocPageGroup.compLMCom, "Upper Intermediate"); } }
    public static string LicenceInvitated { get { return CSLocalize.localize("007a8b9931a745c3a16debb566b07496", LocPageGroup.compLMCom, "invitation not accepted"); } }
    public static string LicenceInvitatedLong { get { return CSLocalize.localize("109a0e5bfefd410491c42a648d278974", LocPageGroup.compLMCom, "invitation not accepted for weeks: [0]"); } }
    public static string LicenceVyprsena { get { return CSLocalize.localize("fec1e97ee72b4a6a8d646a48e20eb381", LocPageGroup.compLMCom, "license expired"); } }
    public static string LicenceVyprsiZa { get { return CSLocalize.localize("51a0d7566d1a4e0fbb3d35d69a9d923d", LocPageGroup.compLMCom, "license will expire in weeks: [0]"); } }
    public static string OnlineLangCourses { get { return CSLocalize.localize("04b4e393467b4826a75493dfc66213e5", LocPageGroup.compLMCom, "Online language courses"); } }
    public static string eTestMeCourses { get { return CSLocalize.localize("83a5a10f5167438f8856925d9edc9218", LocPageGroup.compLMCom, "eTestMe.com tests"); } }
    public static string KurzZvoliStudent { get { return CSLocalize.localize("5470062138e643b4930bd7a6687d2c02", LocPageGroup.compLMCom, "Student selects the course"); } }
    public static string eTestMeBig { get { return CSLocalize.localize("e02877f5bbd241ebba4f0e2041b318eb", LocPageGroup.compLMCom, "Complete Test (evaluated by tutor)"); } }
    public static string eTestMeSmall { get { return CSLocalize.localize("c1ad308bacd548adad8cead1040f697a", LocPageGroup.compLMCom, "Standard Test (evaluated by computer)"); } }
    public static string Multilevel { get { return CSLocalize.localize("d36422f3214e4b2ba8d70779d5602bdb", LocPageGroup.compLMCom, "Multilevel"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Buy.aspx
    public static string ZakupteProVasLms { get { return CSLocalize.localize("4bf3052a185c41ca96e16621a66a23e5", LocPageGroup.compLMCom, "Purchase licenses for the LMS language courses"); } }
    public static string ZakupteProLMLms { get { return CSLocalize.localize("0bb86b5e2f5e400e9131c2c5350d6aea", LocPageGroup.compLMCom, "Purchase licenses for the Online language courses"); } }
    public static string ZakupteTest { get { return CSLocalize.localize("72446a1290ba4f83829215f6659565e3", LocPageGroup.compLMCom, "Purchase licenses for eTestMe.com"); } }
    public static string Back { get { return CSLocalize.localize("d69ce4191c5c4febb3e7b5916c3e6dbd", LocPageGroup.compLMCom, "Back"); } }
    public static string Forward { get { return CSLocalize.localize("29a5dfc1cafb42f3ac17adbf6695b6d8", LocPageGroup.compLMCom, "Forward"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_UserManagement.ascx
    public static string Nenastaveno { get { return CSLocalize.localize("6d17976e1cf34a71b5708404a4a1f569", LocPageGroup.compLMCom, "not set"); } }
    public static string Prazdne { get { return CSLocalize.localize("493c37fbb2a14d03b69c001c026f09f2", LocPageGroup.compLMCom, "Empty"); } }
    public static string UserSelectCourse { get { return CSLocalize.localize("2579c4f602af4c8c909774232c5ba001", LocPageGroup.compLMCom, "Course will be selected by student"); } }
    public static string SelectStudentsToDelete { get { return CSLocalize.localize("8fd4ffe569ed4ce8aa8c4fd74dd19dc6", LocPageGroup.compLMCom, "Select students to delete"); } }
    public static string OpravduChceteVymazatStudenty { get { return CSLocalize.localize("e8af341d5eeb40cfa5e66417c407f4fa", LocPageGroup.compLMCom, "Do you really want to delete selected students?"); } }
    public static string SelectStudentsFirst { get { return CSLocalize.localize("5183631422214fe59a81fa86691609d8", LocPageGroup.compLMCom, "Select students first!"); } }
    public static string Course { get { return CSLocalize.localize("48ef282efcee4752876139532272181a", LocPageGroup.compLMCom, "Course"); } }
    public static string Departments { get { return CSLocalize.localize("92395a2136ef47efa22ec0f520ff93d5", LocPageGroup.compLMCom, "Departments"); } }
    public static string InvitationLicenseExpiration { get { return CSLocalize.localize("28294965216a4a94a47c3f1923581bb0", LocPageGroup.compLMCom, "Invitation/License expiration"); } }
    public static string SelectStudents { get { return CSLocalize.localize("996ec333e5304fc4acc718e6c4217cb0", LocPageGroup.compLMCom, "Select students"); } }
    public static string ThereAreNoStudents { get { return CSLocalize.localize("6541b1b2cd0d4d48a6d75c6ce5b792db", LocPageGroup.compLMCom, "There are no students available. Add new students to the system or change the current filter."); } }
    public static string ThereAreNoStudentsTest { get { return CSLocalize.localize("385005892fc747ed83a8e5e733c81261", LocPageGroup.compLMCom, "There are no students available. Add new students to the system."); } }
    public static string MarkTheStudents { get { return CSLocalize.localize("21c7c0e4a9d64f4d93115c840d3d968e", LocPageGroup.compLMCom, "Mark the students that you want to select"); } }
    public static string MarkUnmarkAll { get { return CSLocalize.localize("4d0fe44c55c9486590e7ff1369251dbd", LocPageGroup.compLMCom, "mark x unmark all"); } }
    public static string StudentsLicensesAndInvitations { get { return CSLocalize.localize("f46f331740944bb09c9a2b9186ea664b", LocPageGroup.compLMCom, "Students, their licenses and invitations"); } }
    public static string Edit { get { return CSLocalize.localize("9c85bf6022fa4c8bbc696bdbac14e946", LocPageGroup.compLMCom, "Edit"); } }
    public static string StudentSelectsCourse { get { return CSLocalize.localize("39f939b19a314ae099341ec05f55f374", LocPageGroup.compLMCom, "Invitation 'Student selects the course' means that the selection of the course is up to the student."); } }
    public static string ChooseOperation { get { return CSLocalize.localize("d15a0a03288943ba9237cbff4060afbb", LocPageGroup.compLMCom, "Choose operation for the selected students"); } }
    public static string InviteStudents { get { return CSLocalize.localize("437d9da04bca4c7881060446e9a1192b", LocPageGroup.compLMCom, "Invite students to the courses, extend their licenses etc."); } }
    public static string TestInviteStudents { get { return CSLocalize.localize("4adde0203800422982f5b747f45f48a8", LocPageGroup.compLMCom, "Invite students to the test"); } }
    public static string DeleteSelectedStudents { get { return CSLocalize.localize("b4ceea5c38e548bbbd3dd11b06d4bf04", LocPageGroup.compLMCom, "Delete selected students"); } }
    public static string BulkTreatment { get { return CSLocalize.localize("8e00116347b74ec4845324f1a5696662", LocPageGroup.compLMCom, "Bulk treatment of students"); } }
    public static string Licences { get { return CSLocalize.localize("0345b68cb7d142208ac4ff9049b69a71", LocPageGroup.compLMCom, "Licenses"); } }
    public static string Invitations { get { return CSLocalize.localize("0c9bf67be9ad4655862cc8193302919c", LocPageGroup.compLMCom, "Invitations"); } }
    public static string ExpiredAt { get { return CSLocalize.localize("4a180aaaecae4348840e888079f600e9", LocPageGroup.compLMCom, "valid to [0]"); } }
    public static string CreatedAt { get { return CSLocalize.localize("0598726014db4b54ae221679af31300b", LocPageGroup.compLMCom, "created at [0]"); } }
    public static string ClearFilter { get { return CSLocalize.localize("8be298fdf3674181a9fed021ae82344e", LocPageGroup.compLMCom, "clear the filter"); } }
    public static string DisplayStudyResult { get { return CSLocalize.localize("fd1d2204a23b47dfae5214c91eb6174b", LocPageGroup.compLMCom, "Display study statistics"); } }
    public static string TestDisplayStudyResult { get { return CSLocalize.localize("2c960a966a4040fb93560b3e1cae49d1", LocPageGroup.compLMCom, "Display test results"); } }
    public static string Empty { get { return CSLocalize.localize("56b090302e034a05b8aa9ac7a2bf3703", LocPageGroup.compLMCom, "Empty"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\LoginNeeded.ascx
    public static string LoginNeeded { get { return CSLocalize.localize("d4e436266217480e93864e09f81994a1", LocPageGroup.compLMCom, "Login is required to continue to the next page. Now you will be redirected to the login page."); } }

    public static string ScormModule_Title { get { return CSLocalize.localize("b02b192f08384010b26b4e252cdd8715", LocPageGroup.compLMCom, "Language courses for your SCORM 1.2. compatible LMS"); } }
    public static string EduLand_Title { get { return CSLocalize.localize("b80c7ec0673a4c3f9f91f0821a636950", LocPageGroup.compLMCom, "Online language courses at langmaster.com"); } }
    public static string eTestMe_Title { get { return CSLocalize.localize("aee9c2266d42450ea9d46cbb06a470bf", LocPageGroup.compLMCom, "eTestMe.com: Online language testing"); } }
    public static string Companies_Title { get { return CSLocalize.localize("4ed4e444b9b9483b8b6efc359857e252", LocPageGroup.compLMCom, "e-Learning for companies, language schools and partners"); } }
    public static string Admin_Title { get { return CSLocalize.localize("5e57d76361464ca3bc58b751dec66e7f", LocPageGroup.compLMCom, "Administrator Console"); } }
    public static string SelfStudySupplements_Title { get { return CSLocalize.localize("7dd0996adc5742ad930a54eea09c3401", LocPageGroup.compLMCom, "Self-study supplements"); } }
    public static string LearningServices_Title { get { return CSLocalize.localize("bbdf05f949154822a0c9bceb4b9d494c", LocPageGroup.compLMCom, "Our e-Learning tools on your web pages"); } }
    public static string DictAbout_Title { get { return CSLocalize.localize("5e62ffbc1e6340e1b9535a053251a310", LocPageGroup.compLMCom, "About the dictionary"); } }
    public static string Contacts_Title { get { return CSLocalize.localize("3d9ab208a8ab46fdbe6ca1c1737567a4", LocPageGroup.compLMCom, "Contact us"); } }
    public static string AllDicts_Title { get { return CSLocalize.localize("6ae10871b6da495fab859c8020a1b09f", LocPageGroup.compLMCom, "List of available dictionaries"); } }
    public static string PriceList_OnlineCourses_Title { get { return CSLocalize.localize("2d76bbd020b34ef0bf2f1e76b828cdb3", LocPageGroup.compLMCom, "Online language courses Pricelist"); } }
    public static string PriceList_LMSCourses_Title { get { return CSLocalize.localize("ec6d9216e6234f1aa315e264e1abb924", LocPageGroup.compLMCom, "LMS language courses Pricelist"); } }
    public static string PriceList_eTestMe_Title { get { return CSLocalize.localize("3c7b807133f246618bd35733304ba220", LocPageGroup.compLMCom, "eTestMe.com Pricelist"); } }
    public static string LMSRunCourse_Title { get { return CSLocalize.localize("10c3b70108ef4ee489eb4bcabb8396e8", LocPageGroup.compLMCom, "My Online language courses and tests"); } }
    public static string Localization_Title { get { return CSLocalize.localize("832bf20e182d4d51bccce4286f2a21dd", LocPageGroup.compLMCom, "Localize our products and become one of our partners"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_EditUser.ascx
    public static string StudentEMailExistuje { get { return CSLocalize.localize("2ea9f2e5ebec4c0da341b26c6dd5ead5", LocPageGroup.compLMCom, "Student with this email already exists"); } }
    public static string EMail { get { return CSLocalize.localize("65a71e1737824749ab6202892235462c", LocPageGroup.compLMCom, "e-mail"); } }
    public static string FirstName { get { return CSLocalize.localize("9ca92f5127cc41759ff4caf7ddcd9d46", LocPageGroup.compLMCom, "First Name"); } }
    public static string LastName { get { return CSLocalize.localize("3fd74fbe0535465b9db06a9c92a7a742", LocPageGroup.compLMCom, "Last Name"); } }
    public static string Department { get { return CSLocalize.localize("d8dee198bba343338f8db880280510c1", LocPageGroup.compLMCom, "Department"); } }
    public static string Position { get { return CSLocalize.localize("afafae0d8afb43dc8842d60b9dcc4b22", LocPageGroup.compLMCom, "Position"); } }
    public static string OK { get { return CSLocalize.localize("9a7aea1210b447eba61755997bb4d252", LocPageGroup.compLMCom, "OK"); } }
    public static string Cancel { get { return CSLocalize.localize("e8a5d5ff669d46cab593642ec219866a", LocPageGroup.compLMCom, "Cancel"); } }
    public static string StudentInformations { get { return CSLocalize.localize("adb31f38847142868716ba8c8f510e77", LocPageGroup.compLMCom, "Student information"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_ImportUsers.ascx
    public static string DeleteStudents { get { return CSLocalize.localize("d0c7029d739a4c2ab7614e090706359e", LocPageGroup.compLMCom, "Delete students [0]?"); } }
    public static string ImportUsers { get { return CSLocalize.localize("691e182f425a4a77a5ead5846c0079ff", LocPageGroup.compLMCom, "Import Students"); } }
    public static string EditUsers { get { return CSLocalize.localize("22253090d35b44b487a5b77f6d29a834", LocPageGroup.compLMCom, "Edit Students"); } }
    public static string WrongEmail { get { return CSLocalize.localize("4bdbf733618d4975908b22c1f2dacdb7", LocPageGroup.compLMCom, "Wrong email format"); } }
    public static string DuplicatedEmail { get { return CSLocalize.localize("b10b11951b2b4271b70d436ae4782005", LocPageGroup.compLMCom, "Duplicated email"); } }
    public static string CannotInsertStudent { get { return CSLocalize.localize("69d42e9991854af5a88b951e7d9ce78a", LocPageGroup.compLMCom, "Cannot insert students (check 'Allow insert' first)"); } }
    public static string TooManyValues { get { return CSLocalize.localize("158c3f0174fd4824925cf818acd4248a", LocPageGroup.compLMCom, "Too many values"); } }
    public static string CannotDeleteStudents { get { return CSLocalize.localize("6c8ccff026b9465fbf438af72e318230", LocPageGroup.compLMCom, "Cannot delete students (check 'Allow delete' first)! ([0])"); } }
    public static string StudentsExist { get { return CSLocalize.localize("5f92ae46087d4f999e90644f61e22717", LocPageGroup.compLMCom, "Some students already exist"); } }
    public static string AllowInsert { get { return CSLocalize.localize("86dcf298c00f46d7a11b48b435730d13", LocPageGroup.compLMCom, "Allow Insert"); } }
    public static string AllowDelete { get { return CSLocalize.localize("917bb951d9e8461d967dbcc08667a1b2", LocPageGroup.compLMCom, "Allow Delete"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_InviteUser.ascx
    public static string NemateDostLicenci { get { return CSLocalize.localize("f512e60abfdf45da8d17fee3fcfe8ea6", LocPageGroup.compLMCom, "You do not have sufficient number of licenses. Purchase the missing licenses by clicking 'Buy' button."); } }
    public static string VyberteJednuLicenci { get { return CSLocalize.localize("35ce64aeb8614b2b93fc3a2257e1751a", LocPageGroup.compLMCom, "Select at least one license"); } }
    public static string OpravduZrusitPozvani { get { return CSLocalize.localize("7b5254908224464bb34631d1bb63c0ee", LocPageGroup.compLMCom, "Do you really want to cancel the invitation?"); } }
    public static string SpravaLicenci { get { return CSLocalize.localize("8f31a191f4e74316b40f4db61e8097aa", LocPageGroup.compLMCom, "License Administration"); } }
    public static string Student { get { return CSLocalize.localize("52b0a5608a6c46f8835e2d352925855b", LocPageGroup.compLMCom, "Student"); } }
    public static string PozvatNaRocniStudium { get { return CSLocalize.localize("3a9e95add3bd4daf98370042984847ec", LocPageGroup.compLMCom, "Invite to one year of study"); } }
    public static string PozvatNaTest { get { return CSLocalize.localize("4f43797936ef47b695ba846d9f2279bf", LocPageGroup.compLMCom, "Invite to test"); } }
    public static string InviteProdlouzitLicenci { get { return CSLocalize.localize("b4e53bd907964aa3ab2ace3b25d930d5", LocPageGroup.compLMCom, "Extend the license (valid until [0]) by one year"); } }
    public static string Zaslane { get { return CSLocalize.localize("b13d727275c4473cb563e8f87a0dc9c7", LocPageGroup.compLMCom, "sent [0]"); } }
    public static string LicencePlatna { get { return CSLocalize.localize("3795dc0603a946e3afd9bfffb128d7b2", LocPageGroup.compLMCom, "License valid to [0]"); } }
    public static string ZaskrtnutimMoznosti { get { return CSLocalize.localize("3424e97db5294cbaacc9d3e89cde6fa0", LocPageGroup.compLMCom, "If you mark the option 'Student selects the course' the selection of the course will be up to the student."); } }
    public static string PrehledRocnichLicenci { get { return CSLocalize.localize("6c62973198fa40cda7fcb398e41051c7", LocPageGroup.compLMCom, "Summary of available licenses"); } }
    public static string LicenceKeKurzum { get { return CSLocalize.localize("012f5b8e0958492fbff126ec3947a98e", LocPageGroup.compLMCom, "Licenses"); } }
    public static string DostupnyPocet { get { return CSLocalize.localize("95a6b3e7cb8d4fc190922b2450c945ef", LocPageGroup.compLMCom, "Number of available licenses"); } }
    public static string ZrusitPozvani { get { return CSLocalize.localize("f0aa5946396e47209c0d2e2b8972dd88", LocPageGroup.compLMCom, "Cancel the invitation"); } }
    public static string ZrusitPozvaniProdlouzeni { get { return CSLocalize.localize("7533b23be27f48c58c5743258f6a4ee0", LocPageGroup.compLMCom, "Cancel the invitation to license extension"); } }
    public static string DetailsNoDot { get { return CSLocalize.localize("30c91217950940779a933acf0ba3c1f7", LocPageGroup.compLMCom, "Details"); } }
    public static string History { get { return CSLocalize.localize("96e77c56eb104dc08493262e8451ceff", LocPageGroup.compLMCom, "History"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_InviteUserConfirm.ascx
    public static string NasledujicimStudentum { get { return CSLocalize.localize("a185211e9fdd4fbfa2abb4da22efd921", LocPageGroup.compLMCom, "The following students will receive an email with an invitation:"); } }
    public static string ObsahEmailu { get { return CSLocalize.localize("0772108004a64d31976ac234d7b5d8c9", LocPageGroup.compLMCom, "Content of the e-mail"); } }
    public static string Titulek { get { return CSLocalize.localize("4c853549a60a4d68bbd7963d21db10d3", LocPageGroup.compLMCom, "Title"); } }
    public static string Text { get { return CSLocalize.localize("1ccd6ccdedd8400e863c8feb8d8f7709", LocPageGroup.compLMCom, "Text"); } }
    public static string TextEmailuMusi { get { return CSLocalize.localize("3457621e44184a3b80dc0ab6a2c13d98", LocPageGroup.compLMCom, "Text of the email must contain the string [0]. This string will be replaced by link to the course."); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_CompanyInfo.ascx 
    public static string Save { get { return CSLocalize.localize("aed228377a264481b969922795d0a16f", LocPageGroup.compLMCom, "Save"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_Results.ascx
    public static string Celkem { get { return CSLocalize.localize("0d21adcf463442a597a8c352845f6b5a", LocPageGroup.compLMCom, "Total"); } }
    public static string StudyStatistics { get { return CSLocalize.localize("fbd63279e8e04112b741b115c3597fff", LocPageGroup.compLMCom, "Study statistics"); } }
    public static string Kurz { get { return CSLocalize.localize("9911a6fdafd047839198f41c08fe9fc3", LocPageGroup.compLMCom, "Course"); } }
    public static string ElapsedTime { get { return CSLocalize.localize("debe9ea3ac8a46998e2759c1e35f8d8b", LocPageGroup.compLMCom, "Elapsed time"); } }
    public static string Dokoncena { get { return CSLocalize.localize("96beb855414b40479625bad41c50453a", LocPageGroup.compLMCom, "Completed"); } }
    public static string ElapsedTimeLow { get { return CSLocalize.localize("aedfe3a5f96c4c41be21de709cc4ba92", LocPageGroup.compLMCom, "elapsed time"); } }
    public static string DokoncenychKapitol { get { return CSLocalize.localize("105ef0224c0e49c5814d8274851b934e", LocPageGroup.compLMCom, "Chapters completed"); } }
    public static string SplnenychKapitol { get { return CSLocalize.localize("74dbcd9448764042bce778503946f103", LocPageGroup.compLMCom, "Chapters fulfilled"); } }
    public static string DokoncenychSplnenych { get { return CSLocalize.localize("6f65a8758fe34d99b3ddad4f31d8d260", LocPageGroup.compLMCom, "completed/fulfilled chapters"); } }
    public static string DosazenaUroven { get { return CSLocalize.localize("5b1adeb80e7c4b5a8a12793a89dc9128", LocPageGroup.compLMCom, "Level achieved"); } }
    public static string Score { get { return CSLocalize.localize("49c93921aa9b4d9e9dd2982ce07cd762", LocPageGroup.compLMCom, "Score"); } }
    public static string ScoreLow { get { return CSLocalize.localize("1013b0d5f7e746c79f2fd576e31f7bf4", LocPageGroup.compLMCom, "score"); } }
    public static string Start { get { return CSLocalize.localize("6e62891b40124c6d8dc2c9ffcea5a65a", LocPageGroup.compLMCom, "Start"); } }
    public static string Last { get { return CSLocalize.localize("a33b14ac280740beb94da1d556954cae", LocPageGroup.compLMCom, "Last"); } }
    public static string Intensity { get { return CSLocalize.localize("2235253ca54a4bf982d20d2df05b3ba7", LocPageGroup.compLMCom, "Intensity"); } }
    public static string SortTable { get { return CSLocalize.localize("1750ec995ad84dc58cd605ba129111ce", LocPageGroup.compLMCom, "Tip: Click on the column heading to sort the table by the values from that column."); } }
    public static string NezapocaliStudium { get { return CSLocalize.localize("d36872c23dc84f048c0f48604ca38deb", LocPageGroup.compLMCom, "These students haven't started their studies yet:"); } }
    public static string CelkemCviceni { get { return CSLocalize.localize("3018c239a6ee4c3da6aa80488c095482", LocPageGroup.compLMCom, "exercises in total"); } }
    public static string Kapitol { get { return CSLocalize.localize("02a09f39d0f44ee3bcff34effcfb7fe6", LocPageGroup.compLMCom, "chapters"); } }
    public static string Lekci { get { return CSLocalize.localize("139eab4d3c684f6a98f1594265c54257", LocPageGroup.compLMCom, "lessons"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\Admin_ResultsHistory.ascx
    public static string PrehledPoMesicich { get { return CSLocalize.localize("bfe0e168ffd44e389f6adfa2bce7e307", LocPageGroup.compLMCom, "Summary of study results (by month)"); } }
    public static string Mesic { get { return CSLocalize.localize("583ecd91b92a4cb7bb5380a1b3214567", LocPageGroup.compLMCom, "Month"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\ELandRunCourseItem.ascx
    public static string LicenceValidTill { get { return CSLocalize.localize("8e7b166a8e574c5c9f4d3cdcc42db18e", LocPageGroup.compLMCom, "license valid until [0]"); } }
    public static string OtherLoc { get { return CSLocalize.localize("24dbf50281654252a50be6622fd27691", LocPageGroup.compLMCom, "The course can also be launched in the following language versions:"); } }
    public static string SorryOtherLoc1 { get { return CSLocalize.localize("e70ee775a1a242daa5128f88e77abb1c", LocPageGroup.compLMCom, "Unfortunately, some courses are not available in your native language."); } }
    public static string SorryOtherLoc2 { get { return CSLocalize.localize("ed16799426f14d938b19817937f2ec6c", LocPageGroup.compLMCom, "Please select one of the following language versions:"); } }
    public static string SeeMore { get { return CSLocalize.localize("2e913002d2074b26afbf23b69151c64d", LocPageGroup.compLMCom, "See more..."); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\Controls\CourseContent.ascx
    public static string ExpandAll { get { return CSLocalize.localize("8a6d033b4be74bf9a036a3ed0c925d48", LocPageGroup.compLMCom, "Expand All"); } }
    public static string CollapseAll { get { return CSLocalize.localize("f5f26d95d9294f2fbaaf0397cd47300c", LocPageGroup.compLMCom, "Collapse All"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\ELandRunCourse.aspx
    public static string StudyWelcome { get { return CSLocalize.localize("51cf1f4991e844ceb323756b4ee68a95", LocPageGroup.compLMCom, "Welcome to [0]"); } }
    public static string StudyBookmark { get { return CSLocalize.localize("5ddb4a048b144bcfa6524fa4539a5708", LocPageGroup.compLMCom, "Welcome to 'My Online language courses and tests' page. Your language courses and tests will be launched from this page. Please bookmark this page or remember the address [0], so that you can access it next time."); } }
    public static string MyCourseEmpty { get { return CSLocalize.localize("2e993c20f1b14c3bb62c8e3259870f79", LocPageGroup.compLMCom, "No courses available. Check your mailbox for an email with course invitation or license key."); } }
    public static string MyTestEmpty { get { return CSLocalize.localize("87834246503a44dd8c14b0314db2bc3f", LocPageGroup.compLMCom, "No tests available. Check your mailbox for an email with test invitation or license key."); } }
    public static string RunCourse { get { return CSLocalize.localize("ebfa3f89e34847c2b1ae34518f4f8070", LocPageGroup.compLMCom, "Run one of your courses"); } }
    public static string LoginRequired { get { return CSLocalize.localize("5f66ca59b7854909aae8bd4fd5876238", LocPageGroup.compLMCom, "Login is required to continue"); } }
    public static string LoginFirst { get { return CSLocalize.localize("37032c7e168a46b8b2870ee436c28a85", LocPageGroup.compLMCom, "Please login first!"); } }
    public static string InvitationMishmash { get { return CSLocalize.localize("d727039d1a844060bdd50866636224c5", LocPageGroup.compLMCom, "Unsuccessful acceptance of the invitation: invitation for - [0], logged in user - [1]"); } }
    public static string From_Assigned { get { return CSLocalize.localize("9224ccdccd454796ad34b73701c150b1", LocPageGroup.compLMCom, "from [0], assigned [1]"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\HighSchool\Controls\EnterLicenceKey.ascx
    public static string EnterLicenceKey { get { return CSLocalize.localize("73d72e869d034cd38d2b682eb68fabbb", LocPageGroup.compLMCom, "Enter your License key"); } }
    public static string DoplnteOsobniUdaje { get { return CSLocalize.localize("0560fc1fb8d44c449911f9f96e5780c4", LocPageGroup.compLMCom, "Enter your personal data"); } }
    public static string OficialnEmail { get { return CSLocalize.localize("9bb3624956234c46acf06a6836112966", LocPageGroup.compLMCom, "The official corporate/school email (it may differ from your login email)"); } }
    public static string TestSpustite { get { return CSLocalize.localize("5386b9eafc2a4d93a239a1adb0f7fe52", LocPageGroup.compLMCom, "To run the test click the link: Run eTestMe.com tests (left bottom part)."); } }
    public static string KurzSpustite { get { return CSLocalize.localize("0c57e066535d4a4486c61cf34d46069e", LocPageGroup.compLMCom, "To run the course click the title of the course (on the left)"); } }
    public static string LicenceKeyEntered { get { return CSLocalize.localize("baaee5c90fe943988be83793987f39c9", LocPageGroup.compLMCom, "License key already entered"); } }
    public static string LicenceKeyUsed { get { return CSLocalize.localize("b63a1ac94cde4d9184d45471281f61c8", LocPageGroup.compLMCom, "License key used by another user"); } }
    public static string KeyRequired { get { return CSLocalize.localize("6016f27083554fcea5e66e937cfaedbb", LocPageGroup.compLMCom, "License key required"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\HighSchool\Partner.aspx
    public static string CompanyManager { get { return CSLocalize.localize("c3795f3d95f64c858db8db9ffaa1e778", LocPageGroup.compLMCom, "Company/University Manager"); } }
    public static string Companies { get { return CSLocalize.localize("889b5bd52e394aa2aac5920b4721f567", LocPageGroup.compLMCom, "Companies"); } }
    public static string Courses { get { return CSLocalize.localize("aec5c8d5153845ef8e892a18b5e84404", LocPageGroup.compLMCom, "Courses"); } }
    public static string Tests { get { return CSLocalize.localize("e6ce6d89f8d44c8a803ae6f01318d046", LocPageGroup.compLMCom, "Tests"); } }
    public static string Tutors { get { return CSLocalize.localize("346aa1660ef144a297c9df66ee078140", LocPageGroup.compLMCom, "Tutors"); } }
    public static string TestsToEvaluate { get { return CSLocalize.localize("513f118d16634f48b1e1cfb5836dd802", LocPageGroup.compLMCom, "Tests To Evaluate"); } }
    public static string Logout { get { return CSLocalize.localize("6eba484229184dbab58cbab81d94bdb4", LocPageGroup.compLMCom, "Logout"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\HighSchool\UsersDetail.aspx
    public static string Detail { get { return CSLocalize.localize("5dc67ab86d5147efbd834767a4811412", LocPageGroup.compLMCom, "Detail"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\HighSchool\Controls\Users.ascx
    public static string EntitledToUse { get { return CSLocalize.localize("cd5fd8bfad2b4eacab544c827b1f6246", LocPageGroup.compLMCom, "You are not entitled to use Company/University Manager. Please send email to support@langmaster.com."); } }
    public static string CompaniesUniversities { get { return CSLocalize.localize("5e30e484da4648769336a2a96f017927", LocPageGroup.compLMCom, "Company / University"); } }
    public static string SelectCompany { get { return CSLocalize.localize("9e152f1746dd449a8a236a41b3ba9d87", LocPageGroup.compLMCom, "Select company/university"); } }
    public static string CreateCompany { get { return CSLocalize.localize("cee843be88d84ee9b38440a88755fe54", LocPageGroup.compLMCom, "Create new company/university"); } }
    public static string DefaultSettings { get { return CSLocalize.localize("2d4aa941665c431a95471e75d2d9ed94", LocPageGroup.compLMCom, "Default Settings"); } }
    public static string Orders { get { return CSLocalize.localize("e8e5868519ce41dba03b11b095526c27", LocPageGroup.compLMCom, "Orders"); } }
    public static string OrderedAt { get { return CSLocalize.localize("71891a893b7740ad82efa7b3d906dc9c", LocPageGroup.compLMCom, "Date of order"); } }
    public static string Product { get { return CSLocalize.localize("559a87201ba14004aae2881f5b7ff1f6", LocPageGroup.compLMCom, "Product"); } }
    public static string Amount { get { return CSLocalize.localize("43f6019800af4375b2578149c59e44de", LocPageGroup.compLMCom, "Amount"); } }
    public static string CreateOrder { get { return CSLocalize.localize("5d2903d9881d4bc6acbdfb810fb6e51d", LocPageGroup.compLMCom, "Create new order"); } }
    public static string Settings { get { return CSLocalize.localize("8700fc39053c412f990cabe3390c1550", LocPageGroup.compLMCom, "Settings"); } }
    public static string EmptySettings { get { return CSLocalize.localize("4b520b8ae0d44c5c83d896d5e101d2a2", LocPageGroup.compLMCom, "Empty settings"); } }
    public static string CannotDeleteTutors { get { return CSLocalize.localize("7f41ea668dca43b2832380c0a7019085", LocPageGroup.compLMCom, "Cannot delete these tutors. They already have some tests assigned."); } }
    public static string EnterName { get { return CSLocalize.localize("b50b8ad2b7c546cc90a76544d227430b", LocPageGroup.compLMCom, "Enter name"); } }
    public static string NameExists { get { return CSLocalize.localize("52e10aab5769413f9c37513c27df1ec7", LocPageGroup.compLMCom, "Name already exists"); } }
    public static string SelectProduct { get { return CSLocalize.localize("369057e67a2143529ab5c435ee1d2785", LocPageGroup.compLMCom, "Select product"); } }
    public static string EnterAmount { get { return CSLocalize.localize("20b737df28b44b41a3ac13e85b6464f2", LocPageGroup.compLMCom, "Enter amount"); } }
    public static string Create { get { return CSLocalize.localize("3f206490851d45cc902696805764d86b", LocPageGroup.compLMCom, "Create"); } }
    public static string DownloadKeys { get { return CSLocalize.localize("668786dd038b478cb603386f6414c9c0", LocPageGroup.compLMCom, "Download keys"); } }

    public static string DemoCreating { get { return CSLocalize.localize("4228d3c1bf4145f1b4446694b6e6b083", LocPageGroup.compLMCom, "Creating of a new company/university is not available in the demoversion."); } }
    public static string DemoGenerating { get { return CSLocalize.localize("6bfaf29b45674fc0ab56165bfa683901", LocPageGroup.compLMCom, "Generation of license keys is not available in the demoversion."); } }
    public static string DemoRights { get { return CSLocalize.localize("375f7a2e769643329f99021fd8c54e22", LocPageGroup.compLMCom, "Here you will be able to edit the organizational structure of the company, assign rights to company managers etc."); } }
    public static string DemoSettings { get { return CSLocalize.localize("267c93d6b38547f38c497ba5b226d05e", LocPageGroup.compLMCom, "Note:  Company configuration and its modification is not available in the demoversion"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\HighSchool\Controls\TestMe.ascx
    public static string SelectCompanySmall { get { return CSLocalize.localize("36cf04ba36a94824821dc512a1b8c447", LocPageGroup.compLMCom, "select company"); } }
    public static string SpecifyReport { get { return CSLocalize.localize("7ed59b5c03614565b738641f2cbf42e8", LocPageGroup.compLMCom, "Specify Report"); } }
    public static string SpecifyReportPars { get { return CSLocalize.localize("211226cbbb2040c6a92f353b735bd7dd", LocPageGroup.compLMCom, "Specify Report Parameters"); } }
    public static string Test { get { return CSLocalize.localize("10b88fa2d57b453c92f433327e3a0811", LocPageGroup.compLMCom, "Test"); } }
    public static string Skill { get { return CSLocalize.localize("ed4ff9fc411f4fe6a96ef48790dc3032", LocPageGroup.compLMCom, "Skill"); } }
    public static string IntervalFrom { get { return CSLocalize.localize("38b81d95ad8d4163bdf1507466c3ef84", LocPageGroup.compLMCom, "Interval From"); } }
    public static string IntervalTo { get { return CSLocalize.localize("775d163d013d475888f591771a58998c", LocPageGroup.compLMCom, "Interval To"); } }
    public static string CreateReport { get { return CSLocalize.localize("11da8130b11148558e8b92656f838777", LocPageGroup.compLMCom, "Create Report"); } }
    public static string PreviewReport { get { return CSLocalize.localize("540534a8d089498b8d70d66f605acf42", LocPageGroup.compLMCom, "Preview / Export Report"); } }
    public static string CompleteTest { get { return CSLocalize.localize("238d94290eb24673ab32c6cc2d5f17ef", LocPageGroup.compLMCom, "Complete Test"); } }
    public static string StandardTest { get { return CSLocalize.localize("048067e3fdf8483dbc8970d2abac760e", LocPageGroup.compLMCom, "Standard Test"); } }
    public static string BothTest { get { return CSLocalize.localize("81859ad6846341a0ab5df61a27d199fa", LocPageGroup.compLMCom, "Both"); } }
    public static string AllTest { get { return CSLocalize.localize("c1a9e5b41c584d4d80aa1ce702057c26", LocPageGroup.compLMCom, "All skills"); } }
    public static string UseEnglish { get { return CSLocalize.localize("2946663aab134c79b8578eb64d595737", LocPageGroup.compLMCom, "Use of English"); } }
    public static string Reading { get { return CSLocalize.localize("8493b83638ca4f2c83f7c4e2089ca1c5", LocPageGroup.compLMCom, "Reading"); } }
    public static string Listening { get { return CSLocalize.localize("43e439ab5afd4c50b856ca744d825313", LocPageGroup.compLMCom, "Listening"); } }
    public static string Speaking { get { return CSLocalize.localize("cfb8644ee000445b80f4f9c589831c8f", LocPageGroup.compLMCom, "Speaking"); } }
    public static string Writing { get { return CSLocalize.localize("c752cc046ad54b04aa87608fcaa5eaaf", LocPageGroup.compLMCom, "Writing"); } }

    //Q:\lmcom\LMCom\com\Web\lang\pages\Users\HighSchool\Controls\Users.ascx
    public static string Criteria { get { return CSLocalize.localize("810468532b284e2b8d4a5592780e7ca2", LocPageGroup.compLMCom, "Criteria"); } }
    public static string IntervalType { get { return CSLocalize.localize("5a3a03578fa04913a7c431f805e90309", LocPageGroup.compLMCom, "Interval type"); } }
    public static string LearnedModules { get { return CSLocalize.localize("37156845f46f4b449b2235f1a417cf26", LocPageGroup.compLMCom, "Learned modules"); } }
    public static string EnglishCourse { get { return CSLocalize.localize("52d82a262b6f4218a50b4e1bde4710a4", LocPageGroup.compLMCom, "English Course"); } }
    public static string Week { get { return CSLocalize.localize("7917ecf54cef40d58aa2134941c1d404", LocPageGroup.compLMCom, "Week"); } }
    public static string Month { get { return CSLocalize.localize("45f821bc634f47e7a19e5358078f2ed8", LocPageGroup.compLMCom, "Month"); } }
    public static string Quarter { get { return CSLocalize.localize("1de8c3d71ad5423293d26a7f7a811c08", LocPageGroup.compLMCom, "Quarter"); } }
    public static string ByDepartments { get { return CSLocalize.localize("20dcc3f5d9384ebdaacc4d39b7d6d3be", LocPageGroup.compLMCom, "Sorting by departments"); } }
    public static string ByScore { get { return CSLocalize.localize("766aa2db8a8b4adeb06333775bc3ea46", LocPageGroup.compLMCom, "Sorting by test results"); } }
    public static string ByTimeIntervals { get { return CSLocalize.localize("60fd8cb1b8ed4b18a8fb93b08c9a0dad", LocPageGroup.compLMCom, "Sorting by time intervals"); } }
    public static string DepsAll { get { return CSLocalize.localize("ac4c3c6e3efd447cb1238b861b1df3b4", LocPageGroup.compLMCom, "All"); } }
    public static string DepsHighLevel { get { return CSLocalize.localize("6a7c1a2693474e4aa02114efcbad4f82", LocPageGroup.compLMCom, "Highest level only"); } }

    public static string Studenti { get { return CSLocalize.localize("87815f2e99604d85a495c9fcd8a11c81", LocPageGroup.compLMCom, "Students"); } }
    public static string RepLevel { get { return CSLocalize.localize("39cbef64f7a748069816bc11d2742cbf", LocPageGroup.compLMCom, "Level"); } }
    public static string RepScore { get { return CSLocalize.localize("a2253211b44445079d6eda53f67dda75", LocPageGroup.compLMCom, "Score"); } }
    public static string RepElapsedtime { get { return CSLocalize.localize("5ab13b3b417f4fc693285ff875a586e6", LocPageGroup.compLMCom, "Elapsed time"); } }
    public static string RepLearnedmodules { get { return CSLocalize.localize("f15dd7b83f2c4b3db51d7bb32c5f91bc", LocPageGroup.compLMCom, "Learned modules"); } }
    public static string RepCas { get { return CSLocalize.localize("09728a005e524a2f9aa1f38acc06d075", LocPageGroup.compLMCom, "Time"); } }
    public static string RepUroven { get { return CSLocalize.localize("c51748a142294ffe8c004c04284f52fa", LocPageGroup.compLMCom, "Level"); } }
    public static string RepKapitol { get { return CSLocalize.localize("56ff98e68ee5434c9b4403da0982b35b", LocPageGroup.compLMCom, "Chapters"); } }
    public static string RepPrumerNaStudenta { get { return CSLocalize.localize("e5a58f1b80754b238d9b0e0be778efa2", LocPageGroup.compLMCom, "Average values (per student)"); } }
    public static string RepCelkem { get { return CSLocalize.localize("14137e4f9c964a4599e26dd9e87604b9", LocPageGroup.compLMCom, "Total"); } }
    public static string RepGrammar { get { return CSLocalize.localize("bbf2f8ae6b4b476d9aaf9cd8d3acd9d3", LocPageGroup.compLMCom, "Grammar.."); } }
    public static string RepListening { get { return CSLocalize.localize("fe3b0135b60b4173a0664d53a3d1a7d7", LocPageGroup.compLMCom, "Listening"); } }
    public static string RepWriting { get { return CSLocalize.localize("7e9cfd9aee484a279ffeb8ce6c4c815d", LocPageGroup.compLMCom, "Writing"); } }
    public static string RepReading { get { return CSLocalize.localize("c09d8f1ba3984114925faea7ac61f31f", LocPageGroup.compLMCom, "Reading"); } }
    public static string RepSpeaking { get { return CSLocalize.localize("e0bd5f52514c4711a8225f9cbab99ee1", LocPageGroup.compLMCom, "Speaking"); } }
    public static string RepDleDovedností { get { return CSLocalize.localize("c303f33e506a4cc896233b197f9bb1f2", LocPageGroup.compLMCom, "Average values (by skills)"); } }

  }
}