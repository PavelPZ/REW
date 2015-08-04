using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Configuration;
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
  public partial class Partner_Search : System.Web.UI.Page {
    static LocCommand[] notOkCmds = LowUtils.EnumGetValues<LocCommand>().Except(new LocCommand[] { LocCommand.OK }).ToArray();
    protected string partnerCode = null;

    protected void Page_Load(object sender, EventArgs e) {
      HttpCookie cook = Request.Cookies["PartnerCode"];
      Visible = cook != null; if (!Visible) Response.Redirect("partner.aspx");
      partnerCode = cook.Value;
      if (IsPostBack) return;
      //ProjectsRad.DataSource = LocCfg.Instance().TransDefs(); ProjectsRad.DataBind();
      //GroupsChb.DataSource = Enum.GetNames(typeof(LocPageGroup)).Where(s => s != "other"); GroupsChb.DataBind();
      if (!string.IsNullOrEmpty(Request["id"])) {
        SearchSentId.Text = Request["id"];
        doSearch();
      } else if (!string.IsNullOrEmpty(Request["trans"]) || !string.IsNullOrEmpty(Request["src"])) {
        SearchTransEd.Text = Request["trans"];
        SearchSrcEd.Text = Request["src"];
        doSearch();
      }
    }

    protected void OKBtn_Click(object sender, EventArgs e) {
      if (!string.IsNullOrEmpty(SearchSentId.Text)) {
        Response.Redirect(string.Format("Partner_Search.aspx?id={0}", SearchSentId.Text));
      } else {
        StringBuilder sb = new StringBuilder();
        Response.Redirect(string.Format("Partner_Search.aspx?src={0}&trans={1}&status={2}&id={3}",
          HttpUtility.UrlEncode(SearchSrcEd.Text),
          HttpUtility.UrlEncode(SearchTransEd.Text),
          "",
          SearchSentId.Text
          ));
      }
    }

    void doSearch() {
      //se sentenci laduj i page
      TradosDataContext db = Machines.getTradosContext(false);
      db.CommandTimeout = 30;
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
        Langs srcLang = LowUtils.EnumParse<Langs>(ConfigurationManager.AppSettings["Trados.srcLang." + partnerCode]);
        Langs transLang = LowUtils.EnumParse<Langs>(ConfigurationManager.AppSettings["Trados.transLang." + partnerCode]);
        //Test na jednoznacnost jmena:
        var q3 = db.Sentences.Where(s => s.SrcLang == (short)srcLang && s.TransLang == (short)transLang).
          Where(s => db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).Count() > 1).
          Select(s => s.Name).ToArray();
        if (q3.Length > 0) {
          ErrorLab.Text = "**** Error duplicitni jmena zdroju k prekladu: " + q3.Aggregate((r, i) => r + "; " + i);
          return;
        }
        var q2 = db.Sentences.Where(s => s.SrcLang == (short)srcLang && s.TransLang == (short)transLang).
          Select(s => new {
            id = s.Id,
            oldSrcText = s.SrcText,
            transText = s.TransText,
            pageId = s.PageId,
            fileName = s.Page.FileName,
            newSrcText = db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).Select(s2 => s2.TransText).Single()
            //newSrcText = db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).ToArray()
          });
        //src text filter
        if (!string.IsNullOrEmpty(SearchSrcEd.Text)) q2 = q2.Where(s => s.oldSrcText.Contains(SearchSrcEd.Text) || s.newSrcText.Contains(SearchSrcEd.Text));
        //trans text filter
        if (!string.IsNullOrEmpty(SearchTransEd.Text)) q2 = q2.Where(s => s.transText.Contains(SearchTransEd.Text));
        //do pameti
        var query = q2.ToArray();
        //filter na status
        bool doAll = false;
        if (!doAll)
          query = query.Where(s => notOkCmds.Contains(TradosLib.excelFlag(TradosLib.xmlToExcel(s.oldSrcText, sb), TradosLib.xmlToExcel(s.newSrcText, sb)))).ToArray();
        //dokonceni  
        var group = query.GroupBy(s => s.fileName).OrderBy(g => g.Key);
        PagesRep.DataSource = group.Select(p => new {
          url = "PartnerEdit.aspx?sentIds=" + p.Select(i => i.id.ToString()).Aggregate((act, res) => res + "," + act),
          title = p.Key
        });
      }
      PagesRep.DataBind();
    }
  }
}