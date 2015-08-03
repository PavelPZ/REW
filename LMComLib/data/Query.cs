using System;
using System.Data;
using System.Text;
using System.Xml;
using System.Reflection;
using System.Xml.Serialization;
using System.Configuration;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Linq;
using System.Data.Linq;
using System.Data.Linq.Mapping;

using LMNetLib;
namespace LMComLib.Admin {

  public class EnumProp : List<Int64> {
    Type EnumType;
    public EnumProp(Type enumType) {
      EnumType = enumType;
    }
    public bool isNegative() {
      foreach (Int64 i in this)
        if (i < 0) return true;
      return false;
    }

    public Int64 GetMask() {
      Int64 mask = 0;
      foreach (Int64 item in this)
        if (item >= 0)
          mask |= item;
      return mask;
    }
  }


  /// <summary>
  /// Typy formularu s databazovym gridem
  /// </summary>
  public enum FormType {
    no,
    /// <summary>
    /// Formular s uzivateli
    /// </summary>
    Users = 1,
    /// <summary>
    /// Formular s objednavkami
    /// </summary>
    Orders = 2,
    /// <summary>
    /// Formular s tasky
    /// </summary>
    Tasks = 3,
    /// <summary>
    /// Formular s EventLog events
    /// </summary>
    EventLog = 4,
    /// <summary>
    /// Prehledy licencnich poplatku
    /// </summary>
    Licencors = 5,
    /// <summary>
    /// Prehledy dle produktu
    /// </summary>
    Products = 6,
    /// <summary>
    /// Prehledy PayPal vypisu
    /// </summary>
    PayPalReport = 7,
    /// <summary>
    /// Prehledy dle produktu v objednavkach
    /// </summary>
    ProductsOrder = 8,
    /// <summary>
    /// Slevy
    /// </summary>
    Discount = 9,
  }

  /// <summary>
  /// Co se stane s dotazem
  /// </summary>
  public enum ActiveStatus {
    /// <summary>
    /// Nic, pouze se objevi kontrolka s parametry dotazu
    /// </summary>
    no,
    /// <summary>
    /// dostaz se provede, vysledek se zobrazi v gridu
    /// </summary>
    grid,
    /// <summary>
    /// dotaz se provede, vysledek se nabidne k downloadu
    /// </summary>
    download,
  }
  /// <summary>
  /// Predchudce objektu, parametrizujicich dotaz
  /// </summary>
  public partial class QueryPar {

    [XmlAttribute]
    public FormType Type;
    /// <summary>
    /// Stav dotazu.
    /// </summary>
    [XmlAttribute]
    public ActiveStatus Status;
    public int? SubType;

    public static QueryPar FromString(string s) {
      return (QueryPar)XmlUtils.StringToObject(c_XmlRemoveStart + s + c_XmlRemoveEnd, typeof(QueryPar));
    }
    const string c_XmlRemoveStart = @"<QueryPar xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" ";
    const string c_XmlRemoveEnd = "</QueryPar>";
    public string ToStringUrl() {
      return HttpUtility.UrlEncode(toString());
    }
    string toString() {
      StringBuilder sb = new StringBuilder();
      XmlWriterSettings set = new XmlWriterSettings();
      set.OmitXmlDeclaration = true; set.NewLineHandling = NewLineHandling.None; set.Indent = false;
      using (XmlWriter wr = XmlWriter.Create(sb, set)) {
        new XmlSerializer(typeof(QueryPar)).Serialize(wr, this);
        string s = sb.ToString();
        int l = s.Length;
        s = s.Substring(c_XmlRemoveStart.Length, l - c_XmlRemoveStart.Length - c_XmlRemoveEnd.Length);
        return s;
      }
    }
    public virtual IQueryable linqQueryExcel() {
      return linqQuery();
    }
    public virtual IQueryable linqQuery() {
      return null;
    }
    public virtual Dictionary<string, double> linqSummary() {
      return null;
    }
    public static string Link(string url, string title) {
      return string.Format(@"<a href=""{0}"">{1}</a>", url, title);
    }
    public static string Link(QueryPar par, string title) {
      return Link("Intranet2.aspx?" + par.ToStringUrl(), title);
    }
    public static string Link(QueryPar par) {
      return "Intranet2.aspx?" + par.ToStringUrl();
    }
    public static string returnQueryString(QueryPar par) {
      if (par == null) return null;
      return "ReturnUrl=" + par.ToStringUrl();
    }

    static void flush(List<string> parts, StringBuilder sb) {
      if (sb.Length == 0) return;
      parts.Add(sb.ToString());
      sb.Length = 0;
    }
    protected string PrepareContains(string query) {
      List<string> parts = new List<string>();
      StringBuilder sb = new StringBuilder();
      int stat = 0; //0..ignore, 1..slovo, 2..fraze
      foreach (char ch in query) {
        switch (stat) {
          case 0:
            if (ch == '"') stat = 2; else if (ch != ' ') { sb.Append(ch); stat = 1; }
            break;
          case 1:
            if (ch == ' ') { flush(parts, sb); stat = 0; } else sb.Append(ch);
            break;
          case 2:
            if (ch == '"') { flush(parts, sb); stat = 0; } else sb.Append(ch);
            break;
        }
      }
      flush(parts, sb);
      foreach (string word in parts) {
        string trim_word = word.Trim();
        if (sb.Length > 0) sb.Append(" AND ");
        sb.Append('"'); sb.Append(word); sb.Append('"');
      }
      return sb.ToString();
    }

  }

  public abstract class IntranetPage : Page {
    public Dictionary<FormType, TabCtrl> Tabs = new Dictionary<FormType, TabCtrl>();
    public Dictionary<FormType, Dictionary<int, SubtabCtrl>> SubTabs = new Dictionary<FormType, Dictionary<int, SubtabCtrl>>();
    public Dictionary<FormType, ExcelColumns> Excel = new Dictionary<FormType, ExcelColumns>();
    public List<QueryItem> QueryItems = new List<QueryItem>();
    public List<GridCtrl> Grids = new List<GridCtrl>();
    public QueryPar ActPar;
    public IntranetPage()
      : base() {
      Excel.Add(FormType.Users, new ExcelColumns(
        new ExcelColumn("Id", ExcelFormat.Number),
        new ExcelColumn("Created", ExcelFormat.Date),
        new ExcelColumn("ActivationMailSent", ExcelFormat.Date)
        ));
      Excel.Add(FormType.Orders, new ExcelColumns(
        new ExcelColumn("Id", ExcelFormat.Number)
        ));
      Excel.Add(FormType.Licencors, new ExcelColumns(
          new ExcelColumn("VarSymb", ExcelFormat.Number),
          new ExcelColumn("Site", LookupType.Domains),
          new ExcelColumn("Licencor", LookupType.LicencorsEx),
          new ExcelColumn("Percent", ExcelFormat.Number),
          new ExcelColumn("Product", LookupType.ProductNew),
          new ExcelColumn("Quantity", ExcelFormat.Number),
          new ExcelColumn("Sum", ExcelFormat.Currency),
          new ExcelColumn("Fee", ExcelFormat.Currency)
        ));
      Excel.Add(FormType.Tasks, new ExcelColumns(
        new ExcelColumn("Id", ExcelFormat.Number)
        ));
      Excel.Add(FormType.EventLog, new ExcelColumns(
        new ExcelColumn("Id", ExcelFormat.Number)
        ));
      Excel.Add(FormType.Products, new ExcelColumns(
        new ExcelColumn("Site", LookupType.Domains),
        new ExcelColumn("ProductId", LookupType.ProductLicence),
        new ExcelColumn("Quantity", ExcelFormat.Number),
        new ExcelColumn("Discounts", ExcelFormat.Currency ),
        new ExcelColumn("Licences", ExcelFormat.Currency ),
        new ExcelColumn("ListPrices", ExcelFormat.Currency ),
        new ExcelColumn("Provisions", ExcelFormat.Currency ),
        new ExcelColumn("Costs", ExcelFormat.Currency),
        new ExcelColumn("Profits", ExcelFormat.Currency)
        ));
      Excel.Add(FormType.ProductsOrder, new ExcelColumns(
        new ExcelColumn("ProductId", LookupType.ProductLicence),
        new ExcelColumn("Quantity", ExcelFormat.Number),
        new ExcelColumn("ListPrice", ExcelFormat.Currency),
        new ExcelColumn("Site", LookupType.Domains),
        new ExcelColumn("VarSymb", ExcelFormat.Number),
        new ExcelColumn("UserId", ExcelFormat.Number),
        new ExcelColumn("Status", LookupType.OrderStatus),
        new ExcelColumn("BillMethod", LookupType.BillingMethods),
        new ExcelColumn("ShipMethod",LookupType.ShippingMethods),
        new ExcelColumn("Created", ExcelFormat.Date),
        new ExcelColumn("PaymentDate", ExcelFormat.Date),
        new ExcelColumn("DueDate", ExcelFormat.Date)
        ));
    }

    public void FromQueryItems() {
      foreach (QueryItem it in QueryItems)
        if (it.Visible)
          it.fromControl(ActPar);
    }
  }

  public abstract class TabLowCtrl : UserControl {
    protected new IntranetPage Page {
      get { return base.Page as IntranetPage; }
    }
    protected string title;
    public string Title {
      get { return title; }
      set { title = value; }
    }
    protected FormType type;
    public FormType Type {
      get { return type; }
      set { type = value; }
    }
  }

  public abstract class TabCtrl : TabLowCtrl {

    protected override void OnInit(EventArgs e) {
      base.OnInit(e);
      ((IntranetPage)Page).Tabs.Add(type, this);
    }

    int initSubType;
    public int InitSubType {
      get { return initSubType; }
      set { initSubType = value; }
    }

    public string UrlQuery() {
      if (initSubType > 0) {
        SubtabCtrl tab = ((IntranetPage)Page).SubTabs[type][initSubType];
        return tab.UrlQuery();
      }
      QueryPar par = new QueryPar();
      par.Type = type;
      return par.ToStringUrl();
    }

    public virtual SubtabCtrl Select(int? sybTabId) {
      LowUtils.FindControlEx(Page, Type.ToString()).Visible = true;
      //Deseleck ostatni tabs
      foreach (Control ctrl in LowUtils.EnumControls(Page, null))
        if (ctrl is TabCtrl && ctrl != this) ((TabCtrl)ctrl).Deselect();
      //Deselect vsechny SubTabs
      SubtabCtrl res = null;
      foreach (Control ctrl in LowUtils.EnumControls(Page, null))
        if (ctrl is SubtabCtrl) {
          SubtabCtrl subCtrl = (SubtabCtrl)ctrl;
          if (sybTabId != null && (int)sybTabId == subCtrl.SubType && type == subCtrl.Type) {
            subCtrl.Select();
            res = subCtrl;
          } else
            subCtrl.Deselect();
        }
      return res;
    }

    public abstract void Deselect();
  }

  public abstract class SubtabCtrl : TabLowCtrl {

    public bool emptyItems;
    public bool EmptyItems {
      get { return emptyItems; }
      set { emptyItems = value; }
    }
    /// <summary>
    /// Typ, odvozeny z QueryPar, schopny vytvorit query
    /// </summary>
    string queryParType;
    public string QueryParType {
      get { return queryParType; }
      set { queryParType = value; }
    }

    protected override void OnInit(EventArgs e) {
      base.OnInit(e);
      Dictionary<int, SubtabCtrl> obj;
      if (!((IntranetPage)Page).SubTabs.TryGetValue(type, out obj)) {
        obj = new Dictionary<int, SubtabCtrl>();
        ((IntranetPage)Page).SubTabs.Add(type, obj);
      }
      obj.Add(subType, this);
    }

    public string UrlQuery() {
      QueryPar par = (QueryPar)Assembly.GetAssembly(typeof(QueryPar)).CreateInstance("LMComLib.Admin." + queryParType);
      par.Type = type;
      par.SubType = subType;
      //Dotaz bez parametru se ihned provede
      par.Status = EmptyItems ? ActiveStatus.grid : ActiveStatus.no;
      return par.ToStringUrl();
    }

    int subType;
    public int SubType {
      get { return subType; }
      set { subType = value; }
    }

    public abstract void Select();

    public abstract void Deselect();

  }

  public abstract class QueryParCtrl : UserControl {
    public new IntranetPage Page {
      get { return base.Page as IntranetPage; }
    }
    protected void OKBtn_Click(object sender, EventArgs e) {
      FromControl(Page.ActPar);
      Page.ActPar.Status = ActiveStatus.grid;
      Response.Redirect("Intranet2.aspx?" + Page.ActPar.ToStringUrl());
    }
    protected void DownloadBtn_Click(object sender, EventArgs e) {
      FromControl(Page.ActPar);
      Page.ActPar.Status = ActiveStatus.download;
      Response.Redirect("Intranet2.aspx?" + Page.ActPar.ToStringUrl());
    }
    public abstract void ToControl(QueryPar par);
    public abstract void FromControl(QueryPar par);
  }

  public abstract class GridCtrl : UserControl {

    protected FormType type;
    public FormType Type {
      get { return type; }
      set { type = value; }
    }
    public new IntranetPage Page {
      get { return base.Page as IntranetPage; }
    }
    protected override void OnInit(EventArgs e) {
      base.OnInit(e);
      Page.Grids.Add(this);
    }
  }

  public delegate int GetEnumValueEvent();
  public delegate void SetEnumValueEvent(int val);

  public abstract class QueryItem : UserControl {
    public new IntranetPage Page {
      get { return base.Page as IntranetPage; }
    }
    protected override void OnInit(EventArgs e) {
      base.OnInit(e);
      Page.QueryItems.Add(this);
    }
    string tit;
    public string Tit {
      get { return tit; }
      set { tit = value; }
    }

    string desc;
    public string Desc {
      get { return desc; }
      set { desc = value; }
    }
    public virtual string Title() {
      if (!Visible) return null;
      return "<td>" + tit + "</td>";
    }
    public virtual string Descr() {
      if (!Visible) return null;
      return "<td>" + desc + "</td>";
    }
    public abstract void toControl(QueryPar par);
    public abstract void fromControl(QueryPar par);
  }

  public abstract class EnumQueryItem : QueryItem {
    public CheckBox IsNegativeChb;
    public ListBox Selection;

    Type EnumType;
    public string EnumName {
      get { return EnumType.FullName; }
      set { EnumType = Assembly.GetAssembly(typeof(LMComLib.OrderStatus)).GetType(value, true); }
    }

    protected abstract EnumProp getEnumProp(QueryPar par);

    public override void toControl(QueryPar par) {
      EnumProp prop = getEnumProp(par);
      Visible = prop != null;
      if (!Visible) return;
      if (Selection.Items.Count == 0)
        foreach (KeyValuePair<ulong, string> kv in EnumDescrAttribute.getInfo(EnumType))
          Selection.Items.Add(new ListItem(kv.Value, kv.Key.ToString()));
      IsNegativeChb.Checked = false;
      foreach (int val in prop)
        if (val < 0) IsNegativeChb.Checked = true;
      foreach (ListItem li in Selection.Items) {
        li.Selected = false;
        foreach (int val in prop)
          if (val >= 0 && val.ToString() == li.Value) { li.Selected = true; break; }
      }
    }
    public override void fromControl(QueryPar par) {
      EnumProp prop = getEnumProp(par);
      prop.Clear();
      foreach (ListItem li in Selection.Items)
        if (li.Selected) prop.Add(int.Parse(li.Value));
      if (IsNegativeChb.Checked) prop.Add(-1);
    }
    public override string Title() {
      if (!Visible) return null;
      return "<td colspan=\"2\">" + Tit + "</td>";
    }
    public override string Descr() {
      if (!Visible) return null;
      return "<td colspan=\"2\">" + Desc + "</td>";
    }
    protected void SelectAllBtn_Click(object sender, EventArgs e) {
      foreach (ListItem li in Selection.Items)
        li.Selected = true;
    }
    protected void UnselectAllBtn_Click(object sender, EventArgs e) {
      foreach (ListItem li in Selection.Items)
        li.Selected = false;
    }
  }

}