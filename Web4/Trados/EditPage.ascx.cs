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
  public partial class EditPage1 : System.Web.UI.UserControl {
    Dictionary<int, string> errorTranstext = new Dictionary<int, string>();
    protected Page page;
    protected Sentence firstSent;

    protected void Page_Load(object sender, EventArgs e) {
      if (Request.UrlReferrer != null && string.IsNullOrEmpty(RefererFld.Value)) RefererFld.Value = Request.UrlReferrer.AbsoluteUri;
    }

    protected void Page_PreRender(object sender, EventArgs e) {
      TradosDataContext db = Machines.getTradosContext(false);
      int[] sentIds = Request["sentIds"].Split(',').Select(w => int.Parse(w)).ToArray();
      //prvni veta
      var sp = db.Sentences.Where(s => s.Id == sentIds[0]).Select(s => new { sent = s, page = s.Page }).Single();
      page = sp.page; firstSent = sp.sent;
      //seznam exportCmlItem
      SentenceRep.DataSource =
        TradosLib.ExportXmlItems(db, page, (Langs)firstSent.SrcLang, (Langs)firstSent.TransLang, null).
        Where(it => sentIds.Contains(it.Id)).Select(it => new {
          it.Id,
          it.Name,
          TransText = errorTranstext.ContainsKey(it.Id) ?
            errorTranstext[it.id] :
            string.IsNullOrEmpty(it.TransText) ? null : HttpUtility.HtmlDecode(it.TransText.Replace(TradosLib.crlfCode, "\r\n")),
          OldSrcText = it.OldSrcText,
          NewSrcText = it.NewSrcText,
          it.newSrcId,
          ActCmd = it.actCmd.ToString()
        }).ToArray();
      SentenceRep.DataBind();
    }

    protected void OKBtn_Click(object sender, EventArgs e) {
      doOk(false);
    }

    protected void OKAllBtn_Click(object sender, EventArgs e) {
      doOk(true);
    }

    protected void CancelBtn_Click(object sender, EventArgs e) {
      Response.Redirect(RefererFld.Value);
    }

    void doOk(bool isAll) {
      StringBuilder sb = new StringBuilder(); StringBuilder log = new StringBuilder();
      ErrorLab.Text = null; errorTranstext.Clear();
      int firstSentId = -1;
      foreach (var item in LowUtils.AllControls(this).
          Where(c => c.ID == "SentencePanel").
          Select(c => new {
            id = int.Parse(((Panel)c).ToolTip),
            childs = LowUtils.AllControls(c)
          }).
          Where(c => isAll || ((CheckBox)c.childs.Where(c2 => c2.ID == "Translated").Single()).Checked).
          Select(c => new {
            id = c.id,
            oldSrcText = c.childs.Where(c2 => c2.ID == "OldSrcText").Select(c2 => ((HiddenField)c2).Value).Single(),
            newSrcText = c.childs.Where(c2 => c2.ID == "NewSrcText").Select(c2 => ((HiddenField)c2).Value).Single(),
            transText = c.childs.Where(c2 => c2.ID == "TransText").Select(c2 => ((TextBox)c2).Text).Single(),
          })) {
        if (firstSentId < 0) firstSentId = item.id;
        if (TradosLib.insertTrans(item.id, null, item.oldSrcText, item.newSrcText, item.transText, log, sb) == null)
          errorTranstext.Add(item.id, item.transText);
      }
      if (log.Length > 0) ErrorLab.Text = log.ToString();
      else if (firstSentId >= 0) {
        TradosDataContext db = Machines.getTradosContext(false);
        var pl = db.Sentences.Where(s => s.Id == firstSentId).Select(s => new { s.Page, s.TransLang }).Single();
        TradosLib.GenerateResx(db, pl.Page, (Langs)pl.TransLang);
        Response.Redirect(RefererFld.Value);
      }
    }
  }
}