using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Resources;
using System.Text;
using System.Web;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using Trados;

namespace web4.Trados {
  public partial class Default : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      Machines.checkAdminIP(Context);
      if (IsPostBack) return;

      /*TradosDataContext db = Machines.getTradosContext(false);
      var txts = db.Sentences.Select(s => s.compId + "|" + s.SrcText + "|" + s.TransText).Where (t => t.IndexOf("</span>")>0).ToArray();
      Regex re = new Regex(@"<span class=""\w*""></span>");
      string res2 = txts.Where(s => re.IsMatch(s, 0)).Aggregate((r,i) => r + "\r\n" + i);
      return;*/

      /*TradosDataContext db = Machines.getTradosContext(false);
      var arr = db.Sentences.GroupBy(s => new { s.PageId, s.TransLang, s.Name }).Where(g => g.Count() > 1).Select(g => g.First().SrcText).ToArray();
      return;*/

      ProjectsRad.DataSource = LocCfg.Instance().TransDefs(); ProjectsRad.DataBind();
      GroupsChb.DataSource = Enum.GetNames(typeof(LocPageGroup)).Where(s => s != "other"); GroupsChb.DataBind();
      SentFilterChb.DataSource = Enum.GetNames(typeof(LocCommand)).Where(s => s != "NONE"); SentFilterChb.DataBind();
      foreach (ListItem li in SentFilterChb.Items.Cast<ListItem>().Where(li => li.Value != "DONE")) li.Selected = true;
      if (!string.IsNullOrEmpty(Request["project"])) {
        ProjectsRad.SelectedValue = Request["project"];
        Request["group"].Split(',').
          Select(w => GroupsChb.Items.Cast<ListItem>().Where(li => li.Value == w).Single()).
          ToList().ForEach(li => li.Selected = true);
        SearchTransEd.Text = Request["trans"];
        SearchSrcEd.Text = Request["src"];
        SearchFileNameEd.Text = Request["filename"];
        SearchNameEd.Text = Request["name"];
        if (!string.IsNullOrEmpty(Request["status"])) Request["status"].Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries).
          Select(w => SentFilterChb.Items.Cast<ListItem>().Where(li => li.Value == w).Single()).
          ToList().ForEach(li => li.Selected = true);
        doSearch();
      } else if (!string.IsNullOrEmpty(Request["id"])) {
        SearchSentId.Text = Request["id"];
        doSearch();
      }
    }

    protected void OKBtn_Click(object sender, EventArgs e) {
      if (!string.IsNullOrEmpty(SearchSentId.Text)) {
        Response.Redirect(string.Format("Default.aspx?id={0}", SearchSentId.Text));
      } else {
        if (ProjectsRad.SelectedIndex < 0 || GroupsChb.SelectedIndex < 0) return;
        StringBuilder sb = new StringBuilder();
        Response.Redirect(string.Format("Default.aspx?project={0}&group={1}&src={2}&trans={3}&status={4}&filename={5}&id={6}&name={7}",
          ProjectsRad.SelectedValue,
          GroupsChb.Items.Cast<ListItem>().Where(li => li.Selected).Select(li => li.Value).Aggregate((act, result) => result + "," + act),
          HttpUtility.UrlEncode(SearchSrcEd.Text),
          HttpUtility.UrlEncode(SearchTransEd.Text),
          SentFilterChb.Items.Cast<ListItem>().Where(li => li.Selected).Select(li => li.Value).Aggregate("", (act, result) => result + "," + act),
          HttpUtility.UrlEncode(SearchFileNameEd.Text),
          SearchSentId.Text,
          HttpUtility.UrlEncode(SearchNameEd.Text)
          ));
      }
    }

    void doSearch() {
      //se sentenci laduj i page
      TradosDataContext db = Machines.getTradosContext(false);
      System.Data.Linq.DataLoadOptions opt = new System.Data.Linq.DataLoadOptions();
      opt.LoadWith<Sentence>(s => s.Page);
      db.LoadOptions = opt;
      StringBuilder sb = new StringBuilder();
      //zakladni podminka na vsechny sentence v grupe: vyber sentenci a aktualni trans text
      if (!string.IsNullOrEmpty(SearchSentId.Text)) {
        PagesRep.DataSource = db.Sentences.Where(s => s.Id == int.Parse(SearchSentId.Text)).Select(s => new {
          url = "EditPage.aspx?sentIds=" + s.Id,
          title = s.Page.FileName
        });
      } else {
        Langs srcLang, transLang;
        LocCfg.decodeLangs(ProjectsRad.SelectedValue, out srcLang, out transLang);
        //LocCfgTransDef log = LocCfg.Instance().TransDef[ProjectsRad.SelectedIndex];
        IEnumerable<short> groups = Request["group"].Split(',').Select(s => Convert.ToInt16(Enum.Parse(typeof(LocPageGroup), s)));
        //Test na jednoznacnost jmena:
        var q3 = db.Sentences.Where(s => s.SrcLang == (short)srcLang && s.TransLang == (short)transLang && groups.Contains(s.Page.PageGroup)).
          Where(s => db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).Count() > 1).
          Select(s => s.Name).ToArray();
        //var q3 = db.Sentences.Where(s => s.SrcLang == (short)srcLang && s.TransLang == (short)transLang && groups.Contains(s.Page.PageGroup)).
        //Select(s => new {sent=s, other=db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).ToArray}).
        //Where(s => s.other.Count() > 1).
        //ToArray();
        if (q3.Length > 0) {
          ErrorLab.Text = "**** Error duplicitni jmena zdroju k prekladu: " + q3.Aggregate((r, i) => r + "; " + i);
          return;
        }
        var q2 = db.Sentences.Where(s => s.SrcLang == (short)srcLang && s.TransLang == (short)transLang && groups.Contains(s.Page.PageGroup)).
          Select(s => new {
            id = s.Id,
            oldSrcText = s.SrcText,
            transText = s.TransText,
            pageId = s.PageId,
            fileName = s.Page.FileName,
            name = s.Name,
            newSrcText = db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).Select(s2 => s2.TransText).Single()
            //newSrcText = db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).ToArray()
          });
        //src text filter
        if (!string.IsNullOrEmpty(SearchSrcEd.Text)) q2 = q2.Where(s => s.oldSrcText.Contains(SearchSrcEd.Text) || s.newSrcText.Contains(SearchSrcEd.Text));
        //trans text filter
        if (!string.IsNullOrEmpty(SearchTransEd.Text)) q2 = q2.Where(s => s.transText.Contains(SearchTransEd.Text));
        //filename text filter
        if (!string.IsNullOrEmpty(SearchFileNameEd.Text)) q2 = q2.Where(s => s.fileName.Contains(SearchFileNameEd.Text));
        //filename text filter
        if (!string.IsNullOrEmpty(SearchNameEd.Text)) q2 = q2.Where(s => s.name.Contains(SearchNameEd.Text));
        //do pameti
        var query = q2.ToArray();
        //filter na status
        LocCommand[] cmds = SentFilterChb.Items.Cast<ListItem>().Where(li => li.Selected).Select(li => (LocCommand)Enum.Parse(typeof(LocCommand), li.Value)).ToArray();
        if (cmds.Length > 0)
          query = query.Where(s => cmds.Contains(TradosLib.excelFlag(TradosLib.xmlToExcel(s.oldSrcText, sb), TradosLib.xmlToExcel(s.newSrcText, sb)))).ToArray();
        //dokonceni  
        var group = query.GroupBy(s => s.fileName).OrderBy(g => g.Key);
        PagesRep.DataSource = group.Select(p => new {
          url = "EditPage.aspx?sentIds=" + p.Take(250).Select(i => i.id.ToString()).Aggregate((act, res) => res + "," + act),
          title = p.Key
        });
      }
      PagesRep.DataBind();
    }
  }
}