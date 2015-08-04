using DevExpress.Web.ASPxClasses;
using DevExpress.Web.ASPxClasses.Internal;
using DevExpress.Web.ASPxPivotGrid;
using DevExpress.Web.ASPxTreeList;
using DevExpress.Web.ASPxTreeList.Internal;
//using DevExpress.XtraPivotGrid;
//using DevExpress.XtraPivotGrid.RowType;
using LMComLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Statistics {

  public partial class TocCtrl : System.Web.UI.UserControl {

    protected void Page_Init(object sender, EventArgs e) {
      StatDefault.instance.registeredPartAction["outline_user_main"] = par => {
        outline_user_mainPar = par; SelectProductCmb.DataBind();
        TreeList.DataBind();
        string levStr;
        if (par.TryGetValue("expandLevel", out levStr)) { par.Remove("expandLevel"); TreeList.CollapseAll(); TreeList.ExpandToLevel(int.Parse(levStr)); }
      };
      StatDefault.instance.registeredPartAction["outline_user_detail"] = par => {
        outline_user_detailPar = par; PivotGrid.CellTemplate = new GridCellTemplate();
        string detailType; if (!outline_user_detailPar.TryGetValue("detailType", out detailType)) return;
        switch (detailType) {
          case "by-users": userTitle_Id.AreaIndex = 0; tocId_Id.AreaIndex = 1; //userTitle_Id.InnerGroupIndex = 0; tocId_Id.InnerGroupIndex = 1;  
            break;
          case "by-toc": userTitle_Id.AreaIndex = 1; tocId_Id.AreaIndex = 0; //userTitle_Id.InnerGroupIndex = 1; tocId_Id.InnerGroupIndex = 0; 
            break;
        }
        PivotGrid.DataBind();
      };
    }

    Dictionary<string, string> outline_user_mainPar;
    Dictionary<string, string> outline_user_detailPar;

    public IEnumerable<TocExsRow> GetTreeListData() {
      if (outline_user_mainPar == null) return Enumerable.Empty<TocExsRow>();
      var cookieComp = StatLib.cookieCompany(); if (cookieComp == null || !outline_user_mainPar.ContainsKey("productUrl")) return Enumerable.Empty<TocExsRow>();
      var root = Lib.company(cookieComp.Id).adjustProductForCompany(outline_user_mainPar["productUrl"]);
      return root == null ? Enumerable.Empty<TocExsRow>() : root.scan();
    }

    public IEnumerable<CurrentProd> GetSelectProductComboData() {
      if (outline_user_mainPar == null) return Enumerable.Empty<CurrentProd>();
      Lib.adjustProducts();
      return Lib.currentProducts;
    }

    //data pro Detail grid
    public IEnumerable<UserEx> GetPivotGridDetailData() {
      if (outline_user_detailPar == null) return null;
      string detailType; if (!outline_user_detailPar.TryGetValue("detailType", out detailType)) return null;
      int tocId = int.Parse(outline_user_detailPar["tocId"]);
      TocExsRow row = getDetailRow(outline_user_detailPar["productUrl"], tocId); if (row == null) return Enumerable.Empty<UserEx>();
      return row.scan().SelectMany(t => t.userExs == null ? Enumerable.Empty<UserEx>() : t.userExs);
    }

    //helper funkce pro ziskani dat Detail gridu nebo zjisteni viditelnosti Details tlacitka
    TocExsRow getDetailRow(string productUrl, int tocId) {
      var cookieComp = StatLib.cookieCompany(); if (cookieComp == null || tocId < 0) return null;
      return Lib.company(cookieComp.Id).adjustProductForCompany(productUrl).find(tocId);
    }

    //hide Detail buttonu kdyz neni zadne vyhodnocene cviceni
    protected void TreeList_CommandColumnButtonInitialize(object sender, TreeListCommandColumnButtonEventArgs e) {
      if (outline_user_mainPar==null) return;
      TocExsRow row = getDetailRow(outline_user_mainPar["productUrl"], int.Parse(e.NodeKey)); 
      if (row == null || row.complNotPassiveCnt == 0) { e.Visible = DevExpress.Utils.DefaultBoolean.False; }
    }

    //this je ObjectDataSource
    protected void Data_ObjectCreating(object sender, ObjectDataSourceEventArgs e) {
      e.ObjectInstance = this;
    }

    //public static Statistics.TocExsRow getData(object Container) { return dxLib.getTreeListData<Statistics.TocExsRow>(Container); }

    //https://documentation.devexpress.com/#AspNet/CustomDocument7272
    class GridCellTemplate : ITemplate {

      void ITemplate.InstantiateIn(Control container) {
        PivotGridCellTemplateContainer templateContainer = (PivotGridCellTemplateContainer)container;
        DevExpress.Web.ASPxPivotGrid.PivotGridField field = templateContainer.DataField;
        if (field != null && field.FieldName == "ProgressBarHtml") adjustContainer(templateContainer, true);
        else if (field != null && field.FieldName == "ScoreBarHtml") adjustContainer(templateContainer, false);
        else templateContainer.Controls.Add(new LiteralControl(templateContainer.Text));
      }

      static void adjustContainer(PivotGridCellTemplateContainer templateContainer, bool isProgress) {
        DevExpress.XtraPivotGrid.PivotDrillDownDataSource ds = templateContainer.Item.CreateDrillDownDataSource();
        if (ds.RowCount == 0) return;
        if (ds.RowCount == 1) {
          var user = (UserEx)ds[0]["self"];
          templateContainer.Controls.Add(new LiteralControl(isProgress ? user.ProgressBarHtml : user.ScoreBarHtml));
        } else {
          TocExsRow row = new TocExsRow();
          row.setUserExs(ds.OfType<DevExpress.XtraPivotGrid.PivotDrillDownDataRow>().Select(r => r["self"]).OfType<UserEx>().ToArray());
          row.finishAfterRefreshNumbers();
          templateContainer.Controls.Add(new LiteralControl(isProgress ? row.ProgressBarHtml : row.ScoreBarHtml));
        }
      }

    }

    //protected void outline_user_main_Callback(object sender, CallbackEventArgsBase e) {
    //  StatDefault.instance.onCallback(e.Parameter);
    //}

    //protected void outline_user_detail_Callback(object sender, CallbackEventArgsBase e) {
    //  StatDefault.instance.onCallback(e.Parameter);
    //}

    //protected void PivotGrid_CustomFieldSort(object sender, PivotGridCustomFieldSortEventArgs e) { }

    protected void TreeList_CustomNodeSort(object sender, TreeListCustomNodeSortEventArgs e) {
      if (e.Column.FieldName != "Title") return;
      e.Result = (int)e.Node1["Id"] - (int)e.Node1["Id"];
      e.Handled = true;
    }

    protected void PivotGrid_FieldValueDisplayText(object sender, PivotFieldDisplayTextEventArgs e) {
      if (e.Field==null) return;
      switch (e.Field.ID) {
        case "tocId_Id":
          var toc = Lib.tocIdsDir[(int)e.Value];
          var path = toc.parents().Select(p => p.Title).Aggregate((r, i) => r + " / " + i) + " / " + toc.Title;
          e.DisplayText = path.Length > 80 ? path.Substring(0, 38) + " ... " + path.Substring(path.Length - 38) : path;
          break;
      }
    }

    //protected void PivotGrid_CustomSummary(object sender, PivotGridCustomSummaryEventArgs e) {
    //  //// Get the record set corresponding to the current cell.
    //  //DevExpress.XtraPivotGrid.PivotDrillDownDataSource ds = e.CreateDrillDownDataSource();

    //  ////var ctrl = 

    //  //// Iterate through the records and count the orders.
    //  //for (int i = 0; i < ds.RowCount; i++) {
    //  //  DevExpress.XtraPivotGrid.PivotDrillDownDataRow rowStart = ds[i];

    //  //}

    //  //// Calculate the percentage.
    //  //if (ds.RowCount > 0) {
    //  //  e.CustomValue = 100;
    //  //}

    //}

  }

  //class FieldValueTemplate : ITemplate {

  //  void ITemplate.InstantiateIn(Control container) {
  //    PivotGridFieldValueTemplateContainer c = (PivotGridFieldValueTemplateContainer)container; 
  //    PivotGridFieldValueHtmlCell cell = c.CreateFieldValue();
  //    DevExpress.XtraPivotGrid.RowType.PivotFieldValueItem valueItem = c.ValueItem;
  //    PivotFieldValueEventArgs helperArgs = new PivotFieldValueEventArgs(valueItem);
  //    DevExpress.XtraPivotGrid.PivotDrillDownDataSource ds = helperArgs.CreateDrillDownDataSource();
  //    //int email = Convert.ToInt32(ds[0]["ProductID"]);
  //    //cell.Controls.AddAt(cell.Controls.IndexOf(cell.TextControl), new MyLink(c.Text, email));
  //    cell.Controls.Remove(cell.TextControl);
  //    c.Controls.Add(new LiteralControl("<b>yyy<b>xxx"));
  //  }
  //}

}
