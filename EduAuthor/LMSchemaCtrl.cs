using System;
using System.Data;
using System.Configuration;
using System.Collections.Generic;
using System.Web;
using System.Text;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Reflection;
using System.Web.Hosting;
using System.Xml.Serialization;
using System.IO;

using LMComLib;

namespace LMScormLibDOM {

  public partial class LMLiteral : LMScormObj {
    [XmlIgnore]
    public LMScormLib.LocalizeExtension Extension;

    public static string ExpandData(string literalText, string Signature) {
      StringBuilder sb = new StringBuilder();
      StringBuilder res = new StringBuilder();
      sb.Length = 0; res.Length = 0; int status = 0; int i = 0;
      Signature = Signature.ToLower();
      while (i <= literalText.Length) {
        char ch = i == literalText.Length ? '\0' : literalText[i];
        i++;
        switch (status) {
          case 0:
            if (ch == ' ' || ch == '\n' || ch == '\r') continue;
            i--;
            status = 1;
            break;
          case 1:
            if (ch == ' ' || ch == '\n' || ch == '\r' || ch == '\0') {
              if (sb.Length == 0) break;
              res.AppendFormat(@"<span s4n_hideId=""{0}"" class=""htItem htHidden""><span>", Signature);
              res.Append(sb.ToString());
              res.Append("</span></span> ");
              sb.Length = 0;
              status = 0;
              break;
            }
            sb.Append(ch);
            if (ch == '<') status = 2;
            break;
          case 2:
            sb.Append(ch);
            if (ch == '>' || ch == '\0') status = 1;
            break;
        }
      }
      return res.ToString();
    }

    string getText() //pro aktualni jazyk a aktualni Request.Url vrati string.
    {
      string res = Extension == null ? text : Extension.Text;
      if (!string.IsNullOrEmpty(group_hide_text)) res = ExpandData(res, group_hide_text);
      return res;
    }

    public static string getText(LMScormObj obj, string defaultValue) {
      string res = obj == null ? null : ((LMLiteral)obj).getText();
      return string.IsNullOrEmpty(res) ? defaultValue : res;
    }
    public static string getText(LMScormObj obj) {
      return getText(obj, string.Empty);
    }
    public string Text {
      get { return getText(); }
    }
    public override IEnumerable<object> GetChilds() {
      if (Extension == null || Extension.images == null) yield break;
      foreach (img img in Extension.images)
        yield return img;
    }
  }

  public partial class img : LMScormObj {

    [XmlIgnore]
    string _absoluteUrl = null;
    public string absoluteUrl {
      get {
        if (_absoluteUrl != null) return _absoluteUrl;
        if (string.IsNullOrEmpty(src) && symbol != imgSymbol_Type.no)
          src = string.Format("~/Framework/Controls/symbols/{0}.gif", symbol);
        string fn = src;
        try {
          if (!src.StartsWith("~/") && !src.StartsWith("/")) {
            string s = HttpRuntime.AppDomainAppVirtualPath + "/" + Root.PageInfo.FileName.Substring(HttpRuntime.AppDomainAppPath.Length).Replace('\\', '/');
            _absoluteUrl = VirtualPathUtility.Combine(s, src);
          } else
            _absoluteUrl = VirtualPathUtility.ToAbsolute(src);
          fn = EaUrlInfoLib.MapPath(_absoluteUrl);
          if (!LMScormLib.CourseMan.Config.IgnoreWmaBmpFileExist && !File.Exists(fn)) throw new Exception();
        } catch {
          throw new Exception(string.Format("Img file {0}, referenced form {1}, does not exist.", fn, ErrorId));
        }
        _absoluteUrl = _absoluteUrl.ToLower();
        return _absoluteUrl;
      }
    }
    public override void AfterLoad() {
      base.AfterLoad();
      //string url = absoluteUrl;
    }
  }
  public partial class trans : LMScormObj {
  }

  public partial class page : LMScormObj {
    const string lmDataAspxStart = @"
<%@ Page Language=""C#"" {0} %>
<asp:content id=""Content1"" contentplaceholderid=""LessonContent"" runat=""Server"">";
    const string lmDataAspxEnd =
"</asp:content>";

    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its != null)
        foreach (object obj in its)
          yield return obj;
    }


  }
  public partial class tr : LMScormObj {
    public bool isHeader;
    public object[] items;
    public object[] Items {
      get { return items != null ? items : td; }
    }
    public override IEnumerable<object> GetChilds() {
      if (Items != null)
        foreach (object obj in Items)
          yield return obj;
    }
    public table myTable() {
      return (table)Owner.Owner;
    }
    public override void addChildProperties(childProperties props) {
      table tb = myTable();
      if (tb.isHtml) return;
      if (tb.start_with != tableStart_with.evalControl && tb.eval_row == eval_Type.no) return;
      props.Add(new childProperties.childProperty(this, "all", "group_eval", varName));
      if (tb.eval_row == eval_Type.And)
        props.Add(new childProperties.childProperty(this, "eval_group", eval_Type.And.ToString(), varName));
    }
  }
  public partial class row : LMScormObj {
  }

  public partial class td : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public col myCol;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }

    public bool isTh;
    public int cellContent = 0; //0..normalni cell, -1..eval control, -2..levy horni roh prazdneho pridaneho sloupce, else..poradi
    public void setCellContent(int idx, tableStart_with startWith, tr rw, table tb) {
      if (startWith == tableStart_with.evalControl) {
        LMScormLibDOM.eval_mark mark = new LMScormLibDOM.eval_mark();
        mark.group = rw.varName;
        if (tb.is_eval_group != eval_Type.no)
          mark.group_owner = tb.varName;
        Items = new object[] { mark };
      } else if (startWith == tableStart_with.number)
        cellContent = idx + 1;
      else if (startWith == tableStart_with.number_ignoreFirst)
        cellContent = idx == 0 ? -2 : idx;
    }
  }

  public partial class table : LMScormObj {
    public control colGroup;
    public control thead;
    public control tbody;
    public bool isHtml;
    public override void addChildProperties(childProperties props) {
      if (is_eval_group == eval_Type.And)
        props.Add(new childProperties.childProperty(this, "eval_group", eval_Type.And.ToString(), varName));
      if (is_eval_group == eval_Type.no || start_with == tableStart_with.evalControl) return;
      props.Add(new childProperties.childProperty(this, "all", "group_eval", varName));
    }
    public override IEnumerable<object> GetChilds() {
      //bool row_header, col_header; tr[] tr; colStart[] colStart; getData(out row_header, out col_header, out tr, out colStart);
      if (col != null && col.Length > 0)
        foreach (object obj in col)
          yield return obj;
      if (Items != null && Items.Length > 0)
        foreach (object obj in Items)
          yield return obj;
      if (colGroup != null) yield return colGroup;
      if (thead != null) yield return thead;
      if (tbody != null) yield return tbody;
    }
    void noHtmlFinishTree(lm_scorm root) {
      if (Items == null || Items.Length == 0) return;
      //kontrola: kdyz jedna rowStart, tak vsechny rowStart:
      int rowCount = 0;
      foreach (LMScormObj obj in Items)
        if (obj is row) rowCount++;
      if (rowCount > 0 && rowCount != Items.Length)
        throw new Exception(string.Format("All rows or none rows expected in table {0}", ErrorId));
      //kontrola: kdyz rowStart, tak stejny pocet prvku
      if (rowCount > 0) {
        int cnt = -1;
        foreach (row rw in Items)
          if (cnt == -1) cnt = rw.Items == null ? 0 : rw.Items.Length;
          else if (cnt != (rw.Items == null ? 0 : rw.Items.Length))
            throw new Exception(string.Format("Number of row child element must be equal in table {0}", ErrorId));
      }
      bool addCol = start_with != tableStart_with.no; //pridani extra sloupce
      //pridani prvniho colStart:
      if (addCol && col != null) {
        col[] oldCol = col;
        col = new col[oldCol.Length + 1];
        Array.Copy(oldCol, 0, col, 1, oldCol.Length);
        col[0] = new col();
      }
      //pridani rows a dummy cell
      if (rowCount == 0) {
        object[] oldItems = Items;
        Items = new object[oldItems.Length];
        for (int i = 0; i < oldItems.Length; i++) {
          tr rw = new tr(); Items[i] = rw;
          td cl = new td();
          cl.Items = new object[] { oldItems[i] };
          if (addCol) {
            td addCl = new td();
            addCl.setCellContent(i, start_with, rw, this);
            rw.items = new object[] { addCl, cl };
          } else
            rw.items = new object[] { cl };
        }
      } else
        //pridani cells
        for (int rwi = 0; rwi < Items.Length; rwi++) {
          //zamena ROW by TR
          row oldRw = (row)Items[rwi]; tr rw = rowToTr(oldRw); Items[rwi] = rw;
          object[] oldItems = oldRw.Items;
          rw.items = new object[addCol ? oldItems.Length + 1 : oldItems.Length];
          for (int i = 0; i < rw.Items.Length; i++) {
            td cl = new td();
            rw.Items[i] = cl;
            if (addCol && i == 0)
              cl.setCellContent(rwi, start_with, rw, this);
            else {
              cl.Items = new object[] { oldItems[addCol ? i - 1 : i] };
            }
          }
        }
      //dosazeni myCol do celu:
      if (col != null)
        foreach (tr rw in Items) {
          for (int i = 0; i < col.Length; i++) {
            if (rw.Items.Length <= i) continue;
            ((td)rw.Items[i]).myCol = col[i];
          }
        }
    }

    tr rowToTr(row row) {
      tr res = new tr();
      res.id = row.id;
      res.child_attrs = row.child_attrs;
      res.valign = row.valign;
      res.align = row.align;
      res.example = row.example;
      res.small = row.small;
      res.hlite = row.hlite;
      res.padding = row.padding;
      return res;
    }

    public override void finishTreeBeforeLocalize(lm_scorm root) {
      base.finishTreeBeforeLocalize(root);
      isHtml = Items != null && Items.Length > 0 && Items[0] is tr;
      if (!isHtml) noHtmlFinishTree(root);
      if (row_header) //nastaveni isTh priznaku k prvnim celum
        foreach (tr row in Items)
          ((td)row.Items[0]).isTh = true;
      if (col != null || row_header) {
        colGroup = new control("colgroup");
        if (col == null)
          colGroup.Items = new object[] { new col() };
        else
          colGroup.Items = col;
        col = null;
        if (row_header) {
          col firstCl = (col)colGroup.Items[0];
          firstCl.hlite = false;
          firstCl.isHeader = true;
        }
      }
      if (col_header && Items.Length > 0) {
        thead = new control("thead");
        thead.Items = new object[1] { Items[0] };
        tr row = (tr)Items[0];
        row.hlite = false;
        row.isHeader = true;
        if (Items.Length == 1) Items = null;
        else {
          object[] newTr = new object[Items.Length - 1];
          Array.Copy(Items, 1, newTr, 0, newTr.Length);
          Items = newTr;
        }
      }
      if (Items != null) {
        tbody = new control("tbody");
        tbody.Items = Items;
        Items = null;
      }
    }
  }
  public partial class col : LMScormObj {
    public bool isHeader;
  }

  public partial class hide_text_mark : LMScormObj {
    [XmlIgnore]
    public LMGroupHideText GroupHideText;
  }
  public partial class eval_mark : LMScormObj {
    [XmlIgnore]
    public LMGroupEval GroupEval;
    public override void AfterLoad() {
      base.AfterLoad();
      if (visible && (GroupEval == null || GroupEval.Count <= 0)) visible = false;
    }
  }
  public partial class control : LMScormObj {

    public control(string tagName)
      : this() {
      this.tag_name = tagName;
    }

    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }

  public partial class layout_cell : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its != null)
        foreach (object obj in its)
          yield return obj;
    }
  }
  public partial class layout_row : LMScormObj {
  }
  public partial class layout_table : LMScormObj {
  }

  public partial class box : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      if (htmlTitleObj != null) yield return htmlTitleObj;
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }

  public partial class head : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2string), XmlIgnore]
    public LMLiteral localItems;
    public override string Title {
      get { return base.Title + LMLiteral.getText(localItems); }
    }
    public override IEnumerable<object> GetChilds() {
      yield break;
    }
  }

  public partial class two_column : LMScormObj {
    public override IEnumerable<object> GetChilds() {
      if (two_column_left != null)
        yield return two_column_left;
      if (two_column_right != null)
        yield return two_column_right;
    }
  }
  public partial class two_column_left : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }
  public partial class two_column_right : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }
  public partial class memory_box : LMScormObj {
  }
  public partial class hide_control : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      if (htmlTitleObj != null) yield return htmlTitleObj;
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }
}
