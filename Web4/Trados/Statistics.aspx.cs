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
using System.Xml;
using System.Xml.Linq;
using Trados;

namespace web4.Trados {

  public partial class Statistics : System.Web.UI.Page {

    protected void Page_Load(object sender, EventArgs e) {
      Machines.checkAdminIP(Context);
      TradosDataContext db = Machines.getTradosContext(false);
      var fromDb = db.Sentences.Select(s => new { s.PageId, s.Page.PageGroup, s.Name, s.SrcLang, s.TransLang, s.TransLen }).ToArray();
      var srcOK = fromDb.Select(s =>
        new {
          s.PageId,
          s.PageGroup,
          s.SrcLang,
          Src = fromDb.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).SingleOrDefault(),//.TransLen,
          s.TransLang,
          s.TransLen
        });
      var transOK = srcOK.Select(s =>
        new {
          s.PageGroup,
          s.SrcLang,
          SrcLen = s.SrcLang == (short)Langs.no || s.Src == null ? 0 : s.Src.TransLen,
          s.TransLang,
          TransLen = s.TransLen > 0 ? (s.SrcLang == (short)Langs.no || s.Src == null ? 0 : s.Src.TransLen) : 0
        });

      var grp = transOK.Where(s => s.SrcLang != (short)Langs.no).GroupBy(s => new { s.PageGroup, s.SrcLang, s.TransLang }).
        Select(g => new { g.Key.PageGroup, g.Key.SrcLang, SrcLen = g.Sum(s => s.SrcLen), g.Key.TransLang, TransLen = g.Sum(s => s.TransLen) }).ToArray();
      StatRep.DataSource = grp; StatRep.DataBind();

      ProjectRep.DataSource = grp.
        GroupBy(d => new { d.SrcLang, d.TransLang }).
        Select(g => new { g.Key.SrcLang, g.Key.TransLang, SrcLen = g.Sum(s => s.SrcLen), TransLen = g.Sum(s => s.TransLen) });
      ProjectRep.DataBind();
    }
  }
}