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
  public partial class LookupManager : System.Web.UI.Page {
    Langs SrcLang, TransLang;

    protected void Page_Load(object sender, EventArgs e) {
      Machines.checkAdminIP(Context);
      if (IsPostBack) return;
      ProjectsRad.DataSource = LocCfg.Instance().TransDefs(); ProjectsRad.DataBind();
    }
    bool readLangs() {
      if (ProjectsRad.SelectedIndex < 0) return false;
      LocCfg.decodeLangs(ProjectsRad.SelectedValue, out SrcLang, out TransLang);
      return true;
    }

    /*IQueryable<Lookup> allLookups;
    IQueryable<Sentence> allSent;

    void readAll() {
      TradosDataContext db = Machines.getTradosContext(false);
      db.CommandTimeout = 100000;
      allLookups = db.Lookups;
      allSent = db.Sentences;
    }*/
    protected void ExportBtn_click(object sender, EventArgs e) {
      errorTag.InnerHtml = null;
      if (!readLangs()) return;
      TradosDataContext db = Machines.getTradosContext(false);
      XElement res = new XElement("lookup");
      StringBuilder sb = new StringBuilder();
      foreach (var sent in db.Lookups.Where(lkp => lkp.SrcLang == (short)SrcLang && lkp.TransLang == (short)TransLang).Select(lkp => new { lkp.SrcText, lkp.TransText }))
        res.Add(new XElement("item", new XElement(SrcLang.ToString(), new XCData(sent.SrcText)), new XElement(TransLang.ToString(), new XCData(sent.TransText))));
      res.Save(@"c:\temp\lookup_export.xml");
    }
    protected void ExportDuplBtn_click(object sender, EventArgs e) {
      errorTag.InnerHtml = null;
      //readAll();
      NoLookupErrorLab.Text = exportDupl(true);
    }
    string exportDupl(bool withDump) {
      if (!readLangs()) return null;
      TradosDataContext db = Machines.getTradosContext(false);
      System.Data.Linq.DataLoadOptions opt = new System.Data.Linq.DataLoadOptions(); opt.LoadWith<Sentence>(s => s.Page);
      db.LoadOptions = opt;
      XElement res = new XElement("lookup");
      StringBuilder sb = new StringBuilder();
      //Duplicity, grupovane dle Srctext
      var q1 = db.Lookups.
        Where(lkp => lkp.SrcLang == (short)SrcLang && lkp.TransLang == (short)TransLang).
        Select(lkp => new { lkp.SrcText, lkp.TransText, lkp.Hash, lkp.Id, /*debug*/ lkp.SrcHash }).
        ToArray(); //nejak nefunguje grupovani
      var query = q1.GroupBy(st => st.SrcText).Where(g => g.Count() >= 2).ToArray();
      //Vety s duplicitami
      if (withDump) {
        int[] hashes = query.SelectMany(g => g).Select(l => l.Hash).ToArray();
        Sentence[] duplSent = db.Sentences.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang && hashes.Contains(s.Hash)).ToArray();
        foreach (var grp in query) {
          res.Add(new XElement("item", new XElement(SrcLang.ToString(), grp.Key.IndexOf('<') >= 0 ? (object)new XCData(grp.Key) : (object)grp.Key),
            grp.Select(s => new XElement(TransLang.ToString() + "_dupl", new XElement("text", s.TransText.IndexOf('<') >= 0 ? (object)new XCData(s.TransText) : (object)s.TransText),
              duplSent.Where(d => d.SrcText == grp.Key && d.TransText == s.TransText).
              Select(d => new XElement("page", d.Page.FileName + "(" + d.Id.ToString() + ")"))
          ))));
        }
        res.Save(@"c:\temp\lookup_export.xml");
      }
      return "Počet duplicit = " + query.Length.ToString();
    }
    protected void ExportMultiBtn_click(object sender, EventArgs e) {
      errorTag.InnerHtml = null;
      //readAll();
      NoLookupErrorLab.Text = notUsed(true);
    }
    string notUsed(bool withDump) {
      if (!readLangs()) return null;
      TradosDataContext db = Machines.getTradosContext(false);
      System.Data.Linq.DataLoadOptions opt = new System.Data.Linq.DataLoadOptions(); opt.LoadWith<Sentence>(s => s.Page);
      db.LoadOptions = opt;
      XElement res = new XElement("lookup");
      StringBuilder sb = new StringBuilder();
      //Vety k lookupu
      var query = db.Lookups.
        Where(lkp => lkp.SrcLang == (short)SrcLang && lkp.TransLang == (short)TransLang).
        Select(lkp => new {
          srcText = lkp.SrcText,
          transText = lkp.TransText,
          pages = db.Sentences.
            Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang && s.Hash == lkp.Hash && s.SrcText == lkp.SrcText && s.TransText == lkp.TransText).
            Select(s => s.Page.FileName)
          //}).Where(ls => ls.pages.Count() != 1); 
          //foreach (var ls in queryObj.ToArray().OrderBy(l => l.pages.Count())) {
        }).Where(ls => ls.pages.Count() == 0);
      var q = query.ToArray();
      if (withDump) {
        foreach (var ls in q) {
          res.Add(new XElement("item",
            //new XAttribute("count", ls.pages.Count().ToString()),
            new XElement(SrcLang.ToString(), new XCData(ls.srcText)),
            new XElement(TransLang.ToString(), new XCData(ls.transText)),
            ls.pages.Select(p => new XElement("page", p))
          ));
        }
        res.Save(@"c:\temp\lookup_export.xml");
      }
      return "Počet nepoužívaných = " + q.Length.ToString();
    }

    protected void SentenceNoLookupBtn_click2(object sender, EventArgs e) {
      TradosDataContext db = Machines.getTradosContext();
      foreach (Lookup lkp in db.Lookups.ToArray().
        Where(l => l.SrcHash != LowUtils.crc(l.SrcText) || l.TransHash != LowUtils.crc(l.TransText) || l.Hash != LowUtils.crc(l.SrcText + l.TransText)
          || l.SrcLen != l.SrcText.Length || l.TransLen != l.TransText.Length)) {
        lkp.finish();
      }
      db.SubmitChanges();

      /*StringBuilder sb = new StringBuilder();
      var wrongSentSrc = db.Sentences.Select(s => s.SrcText).Distinct().ToArray().Where(w => w != TradosLib.normalizeXmlText(w, sb)).ToArray();
      foreach (int email in db.Sentences.Select(s => new { email = s.compId, txt = s.TransText }).Distinct().ToArray().Where(w => w.txt != TradosLib.normalizeXmlText(w.txt, sb)).Select(w => w.email)) {
        Sentence sent = db.Sentences.Where(s => s.compId == email).Single();
        sent.TransText = TradosLib.normalizeXmlText(sent.TransText, sb);
      };
      var wrongLookupSrc = db.Lookups.Select(s => s.SrcText).Distinct().ToArray().Where(w => w != TradosLib.normalizeXmlText(w, sb)).ToArray();
      foreach (int email in db.Lookups.Select(s => new { email = s.compId, txt = s.TransText }).Distinct().ToArray().Where(w => w.txt != TradosLib.normalizeXmlText(w.txt, sb)).Select(w => w.email)) {
        Lookup sent = db.Lookups.Where(s => s.compId == email).Single();
        sent.TransText = TradosLib.normalizeXmlText(sent.TransText, sb);
      };
      db.SubmitChanges();
      var wrongLookupTrans = db.Lookups.Select(s => s.TransText).Distinct().ToArray().Where(w => w != TradosLib.normalizeXmlText(w, sb)).Count();
      var wrongSentTrans = db.Sentences.Select(s => s.TransText).Distinct().ToArray().Where(w => w != TradosLib.normalizeXmlText(w, sb)).Count();*/
    }

    protected void RepairSentNoLookupBtn_click(object sender, EventArgs e) {
      TradosDataContext db = Machines.getTradosContext(false);
      Langs SrcLang, TransLang;
      StringBuilder sb = new StringBuilder();
      foreach (string proj in LocCfg.Instance().TransDefs()) {
        LocCfg.decodeLangs(proj, out SrcLang, out TransLang);
        var wrong = db.Sentences.
          Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang && s.SrcText != null && s.TransText != null).
          Select(s => s.Id).
          Except(
            db.Sentences.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang &&
              db.Lookups.Where(
                lkp => lkp.SrcLang == (short)SrcLang && lkp.TransLang == (short)TransLang && lkp.Hash == s.Hash && lkp.SrcText == s.SrcText && lkp.TransText == s.TransText).
              Any()
            ).Select(s => s.Id)).
          Select(id => db.Sentences.First(s => s.Id == id)).
          ToArray();
        TradosDataContext editDb = Machines.getTradosContext();
        foreach (Sentence sent in wrong)
          TradosLib.RefreshLookup(editDb, sent, null, null, sb, null);
        editDb.SubmitChanges();

      }
      //if (TradosLib.insertTrans(item.email, null, item.oldSrcText, item.newSrcText, item.transText, log, sb) == null)
    }

    protected string dumpAll(bool withDump) {
      int[] counts = new int[12];
      TradosDataContext db = Machines.getTradosContext(false);


      var wrong = db.Sentences.
        Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang && s.SrcText != null && s.TransText != null).
        Select(s => s.Id).
        Except(
          db.Sentences.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang &&
            db.Lookups.Where(
              lkp => lkp.SrcLang == (short)SrcLang && lkp.TransLang == (short)TransLang && lkp.Hash == s.Hash && lkp.SrcText == s.SrcText && lkp.TransText == s.TransText).
            Any()
          ).Select(s => s.Id)).
        ToArray();
      StringBuilder sb = new StringBuilder();

      dumpIds(ref counts[0], withDump, "sentsNotInLookup", false, wrong);

      var texts = db.Lookups.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang).Select(s => new { s.Id, Text = s.SrcText }).ToArray();
      dumpIds(ref counts[1], withDump, "lookupSrcBlank", true, texts.Where(w => !TradosLib.checkBlank(w.Text)).Select(w => w.Id));
      dumpIds(ref counts[2], withDump, "lookupSrc", true, texts.Where(w => w.Text != TradosLib.normalizeXmlText(w.Text, sb)).Select(w => w.Id));

      texts = db.Lookups.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang).Select(s => new { s.Id, Text = s.TransText }).ToArray();
      dumpIds(ref counts[3], withDump, "lookupTransBlank", true, texts.Where(w => !TradosLib.checkBlank(w.Text)).Select(w => w.Id));
      dumpIds(ref counts[4], withDump, "lookupTrans", true, texts.Where(w => w.Text != TradosLib.normalizeXmlText(w.Text, sb)).Select(w => w.Id));

      texts = db.Sentences.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang).Select(s => new { s.Id, Text = s.SrcText }).ToArray();
      dumpIds(ref counts[5], withDump, "sentSrcBlank", false, texts.Where(w => !TradosLib.checkBlank(w.Text)).Select(w => w.Id));
      dumpIds(ref counts[6], withDump, "sentSrc", false, texts.Where(w => w.Text != TradosLib.normalizeXmlText(w.Text, sb)).Select(w => w.Id));

      texts = db.Sentences.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang).Select(s => new { s.Id, Text = s.TransText }).ToArray();
      dumpIds(ref counts[7], withDump, "sentTransBlank", false, texts.Where(w => !TradosLib.checkBlank(w.Text)).Select(w => w.Id));
      dumpIds(ref counts[8], withDump, "sentTrans", false, texts.Where(w => w.Text != TradosLib.normalizeXmlText(w.Text, sb)).Select(w => w.Id));

      dumpIds(ref counts[9], withDump, "sentNoSource", false,
        db.Sentences.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang && !db.Sentences.Where(s2 => s2.PageId == s.PageId && s2.TransLang == s.SrcLang && s2.Name == s.Name).Any()).Select(s => s.Id));

      dumpIds(ref counts[10], withDump, "wrongLookupHash", true,
        db.Lookups.ToArray().
        Where(l => l.SrcHash != LowUtils.crc(l.SrcText) || l.TransHash != LowUtils.crc(l.TransText) || l.Hash != LowUtils.crc(l.SrcText + l.TransText)
          || l.SrcLen != l.SrcText.Length || l.TransLen != l.TransText.Length).
        Select(l => l.Id));

      var ids = db.Lookups.Where(s => s.SrcLang == (short)SrcLang && s.TransLang == (short)TransLang).
        GroupBy(lk => new { lk.SrcText, lk.TransText, lk.SrcLang, lk.TransLang }).
        Where(g => g.Count() > 1).SelectMany(g => g.Skip(1)).Select(s => s.Id);
      dumpIds(ref counts[11], withDump, "lookupDupl", true, ids);


      return string.Format(
        "sentsNotInLookup={0}, lookupSrcBlank={1}, lookupSrc={2}, lookupTransBlank={3}, lookupTrans={4}, sentSrcBlank={5}, sentSrc={6}, sentTransBlank={7}, sentTrans={8}, sentNoSource = {9}, wrongLookupHash = {10}, lookupDupl = {11}",
        counts[0],
        counts[1],
        counts[2],
        counts[3],
        counts[4],
        counts[5],
        counts[6],
        counts[7],
        counts[8],
        counts[9],
        counts[10],
        counts[11]
        );
    }

    protected void DeleteLookupDuplicitesBtn_click(object sender, EventArgs e) {
      TradosDataContext db = Machines.getTradosContext(); db.CommandTimeout = 100000;
      StringBuilder sb = new StringBuilder();
      //Lookup duplicity
      db.Lookups.DeleteAllOnSubmit(db.Lookups.GroupBy(lk => new { lk.SrcText, lk.TransText, lk.SrcLang, lk.TransLang }).
        Where(g => g.Count() > 1).SelectMany(g => g.Skip(1)));
      //nenormalizovane lookups
      foreach (Lookup sent in db.Lookups) {
        sent.TransText = TradosLib.normalizeXmlText(sent.TransText, sb);
        sent.SrcText = TradosLib.normalizeXmlText(sent.SrcText, sb);
        sent.finish();
      }
      //nenormalizovane sentences
      foreach (Sentence sent in db.Sentences) {
        sent.TransText = TradosLib.normalizeXmlText(sent.TransText, sb);
        sent.SrcText = TradosLib.normalizeXmlText(sent.SrcText, sb);
        sent.finish();
      }
      db.SubmitChanges();
    }

    protected void SentenceNoLookupBtn_click(object sender, EventArgs e) {
      if (!readLangs()) return;
      //readAll();
      NoLookupErrorLab.Text = dumpAll(true);
    }

    protected void DumpAllBtn_click(object sender, EventArgs e) {
      StringBuilder sb = new StringBuilder();
      //readAll();
      foreach (string proj in LocCfg.Instance().TransDefs()) {
        ProjectsRad.SelectedValue = proj;
        if (!readLangs()) return;
        sb.Append("<b>" + proj + "</b><br/>");
        sb.Append(dumpAll(false)); sb.Append("<br/>");
        sb.Append(exportDupl(false)); sb.Append("<br/>");
        sb.Append(notUsed(false)); sb.Append("<br/>");
      }
      NoLookupErrorLab.Text = sb.ToString();
    }

    void dumpIds(ref int count, bool withDump, string fn, bool isLookup, IEnumerable<int> idsEnum) {
      int[] ids = idsEnum.Distinct().ToArray();
      count = ids.Length;
      TradosDataContext db = Machines.getTradosContext();
      if (count == 0 || !withDump) return;
      var data = isLookup ?
        db.Lookups.Where(l => ids.Contains(l.Id)).Select(l => new { l.Id, l.SrcText, l.TransText, name = "" }).ToArray() :
        db.Sentences.Where(l => ids.Contains(l.Id)).Select(l => new { l.Id, l.SrcText, l.TransText, name = l.Name }).ToArray();
      XElement root = new XElement("root", data.Select(d => new XElement("item",
        new XElement("id", d.Id.ToString()),
        isLookup ? null : new XElement("name", d.name),
        new XElement("src", d.SrcText == null ? (object)"" : new XCData(d.SrcText)),
        new XElement("trans", d.TransText == null ? (object)"" : new XCData(d.TransText)))));
      root.Save(@"c:\temp\" + fn + ".xml");
    }

    protected void UploadBtn_click(object sender, EventArgs e) {
      errorTag.InnerHtml = null;
      if (!readLangs()) return;
      XElement res = XElement.Load(@"c:\temp\lookup_import.xml");
      XElement duplXml = new XElement("lookup");
      StringBuilder log = new StringBuilder();
      foreach (var st in res.Elements().Select(el => new {
        ScrText = el.Element(SrcLang.ToString()).Value,
        TransText = el.Element(TransLang.ToString()).Value,
        isDelete = el.Attribute("del") != null
      })) {
        TradosDataContext db = Machines.getTradosContext();
        if (st.isDelete) {
          //Delete?
          var toDel = db.Lookups.
              Where(lkp => lkp.SrcLang == (short)SrcLang && lkp.TransLang == (short)TransLang && lkp.SrcHash == LowUtils.crc(st.ScrText) && lkp.SrcText == st.ScrText && lkp.TransHash == LowUtils.crc(st.TransText) && lkp.TransText == st.TransText).ToArray();
          if (toDel.Length != 1) throw new Exception("");
          db.Lookups.DeleteOnSubmit(toDel[0]);
          db.SubmitChanges();
          continue;
        }
        //Kontrola validity textu
        //if (!TradosLib.checkTrans(0, ref srcRes, ref transRes, sb, log)) throw new Exception(log.ToString());
        //srcRes = st.ScrText; transRes = st.TransText;
        string srcRes = st.ScrText; string transRes = st.TransText;
        int srcHash = LowUtils.crc(srcRes);
        //vsechny zaznamy dle Source
        var dupl = db.Lookups.
            Where(lkp => lkp.SrcLang == (short)SrcLang && lkp.TransLang == (short)TransLang && lkp.SrcHash == srcHash && lkp.SrcText == srcRes).ToArray();
        //Neni co delat: v lookup tabulce je totez co se tam ma vlozit 
        if (dupl.Length == 1 && dupl[0].TransText == transRes) continue;
        if (dupl.Length == 0)
          //Duplicita neexistuje: k SrcText neni zadny zaznam v lookup tabulce
          Lookup.insert(db, srcRes, SrcLang, transRes, TransLang);
        else {
          //Duplicita existuje
          if (ReplaceDuplChb.Checked) {
            //Smaz duplicity
            db.Lookups.DeleteAllOnSubmit(db.Lookups.Where(lkp => dupl.Select(s => s.Id).Contains(lkp.Id)));
            //vloz novy prvek
            Lookup.insert(db, srcRes, SrcLang, transRes, TransLang);
          } else {
            //Reportuj duplicity do duplXml
            duplXml.Add(new XElement("item", new XElement(SrcLang.ToString(), st.ScrText), new XElement(TransLang.ToString() + "_dupl", st.TransText),
              dupl.Where(s => s.TransText != st.TransText).Select(s => new XElement(TransLang.ToString() + "_dupl", s))
              ));
          }
        }
        db.SubmitChanges();
      }
      if (duplXml.Elements().Any()) {
        duplXml.Save(@"c:\temp\lookup_export.xml");
        errorTag.InnerHtml = @"Nenaimportovane duplicity v c:\temp\lookup_export.xml!!!";
      }
    }

    protected void OldToNew_click(object sender, EventArgs e) {
      StringBuilder sb = new StringBuilder();
      XElement res = XElement.Load(@"c:\temp\lookup_import.xml");
      foreach (XText el in res.DescendantNodes().Where(t => t.NodeType == XmlNodeType.Text).Cast<XText>().ToArray()) {
        XCData dt = new XCData(TradosLib.normalizeXmlText(TradosLib.excelTextToXmlText(el.Value, null), sb));
        XElement p = el.Parent;
        p.RemoveAll(); p.Add(dt);
      }
      res.Save(@"c:\temp\lookup_export.xml");
    }

  }
}