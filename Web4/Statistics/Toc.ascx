<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="Toc.ascx.cs" Inherits="Statistics.TocCtrl" %>
<%@ Register Assembly="DevExpress.Web.ASPxTreeList.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxTreeList" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.ASPxTreeList.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxTreeList.Export" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.ASPxPivotGrid.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxPivotGrid" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxEditors" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxTabControl" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxClasses" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxCallbackPanel" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxPanel" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxHiddenField" TagPrefix="dx" %>
<%@ Import Namespace="Statistics" %>

<div id="outline_user_main_place" style="display: none">
  <dx:ASPxCallbackPanel runat="server" ID="outline_user_main" ClientInstanceName="outline_user_main" RenderMode="Div" EnableCallbackAnimation="false" ShowLoadingPanel="false" >
    <ClientSideEvents EndCallback="stat.tocTreeList.endCallback" />
    <PanelCollection>
      <dx:PanelContent ID="PanelContent1" runat="server">
        <div id="outline_user_main_panel" class="panel panel-warning stat-content">
          <div class="panel-heading">
            <div runat="server" id="outline_user_main_title" data-bind="html: title"></div>
            <div class="close-btn btn btn-default fa fa-times" onclick="stat.viewsManager.close()"></div>
          </div>
          <div class="panel-body">
            <div class="row">
              <div class="col-md-6">
                <label class="control-label">Course</label>
                <dx:ASPxComboBox ID="SelectProductCmb" runat="server" DropDownStyle="DropDown" IncrementalFilteringMode="Contains"
                  DataSourceID="SelectProductDS" TextField="Title" ValueField="Url"
                  Width="100%">
                  <ClientSideEvents SelectedIndexChanged="stat.tocTreeList.selectedProductChanged" />
                </dx:ASPxComboBox>
                <asp:ObjectDataSource ID="SelectProductDS" runat="server" SelectMethod="GetSelectProductComboData" TypeName="Statistics.TocCtrl" OnObjectCreating="Data_ObjectCreating" />
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <div class="list-expand-levels">
                  <div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-warning" onclick="stat.tocTreeList.expandLevelClick(1);">1</button>
                    <button type="button" class="btn btn-warning" onclick="stat.tocTreeList.expandLevelClick(2);">2</button>
                    <button type="button" class="btn btn-warning" onclick="stat.tocTreeList.expandLevelClick(3);">3</button>
                  </div>
                </div>
                <dx:ASPxTreeList ID="TreeList" runat="server" AutoGenerateColumns="False" KeyFieldName="Id" ParentFieldName="ParentId" Theme="Office2003Blue"
                  DataSourceID="TreeListData" Width="100%" OnCustomNodeSort="TreeList_CustomNodeSort" OnCommandColumnButtonInitialize="TreeList_CommandColumnButtonInitialize">
                  <ClientSideEvents CustomButtonClick="stat.tocTreeList.callDetailFromTree" />
                  <Columns>
                    <dx:TreeListTextColumn FieldName="Title" ReadOnly="True" Caption="Title" VisibleIndex="0" AllowSort="true" />
                    <dx:TreeListTextColumn FieldName="elapsed" ReadOnly="True" Caption="Elapsed" VisibleIndex="10" />
                    <dx:TreeListTextColumn FieldName="exCount" ReadOnly="True" Caption="Exercises * Users" VisibleIndex="20" />
                    <dx:TreeListTextColumn FieldName="ProgressBarHtml" Caption="Progress (Skipped/Evaluated/ToDo)" ReadOnly="True" PropertiesTextEdit-EncodeHtml="false" VisibleIndex="30">
                      <PropertiesTextEdit EncodeHtml="False"></PropertiesTextEdit>
                    </dx:TreeListTextColumn>
                    <dx:TreeListTextColumn FieldName="complNotPassiveCnt" ReadOnly="True" Caption="Evaluated" VisibleIndex="40" />
                    <dx:TreeListTextColumn FieldName="ScoreBarHtml" Caption="Score" ReadOnly="True" PropertiesTextEdit-EncodeHtml="false" VisibleIndex="50">
                      <PropertiesTextEdit EncodeHtml="False"></PropertiesTextEdit>
                    </dx:TreeListTextColumn>
                    <dx:TreeListTextColumn FieldName="Id" ReadOnly="True" Visible="False" VisibleIndex="100" />
                    <dx:TreeListTextColumn FieldName="ParentId" ReadOnly="True" Visible="False" VisibleIndex="101" />
                    <dx:TreeListCommandColumn VisibleIndex="90" ButtonType="Button" Caption="Details (with score only)">
                      <UpdateButton Visible="False" />
                      <CancelButton Visible="False" />
                      <CustomButtons>
                        <dx:TreeListCommandColumnCustomButton Text="detail..." ID="MoreBtn" />
                      </CustomButtons>
                    </dx:TreeListCommandColumn>
                  </Columns>
                  <SettingsDataSecurity AllowDelete="False" AllowEdit="False" AllowInsert="False" />
                  <Settings GridLines="Both" />
                  <SettingsBehavior ExpandCollapseAction="NodeDblClick" />
                </dx:ASPxTreeList>
                <asp:ObjectDataSource ID="TreeListData" runat="server" SelectMethod="GetTreeListData" TypeName="Statistics.TocCtrl" OnObjectCreating="Data_ObjectCreating" />
                <dx:ASPxTreeListExporter ID="ASPxTreeListExporter" runat="server" TreeListID="treeList" />
              </div>
            </div>
          </div>
        </div>
      </dx:PanelContent>
    </PanelCollection>
  </dx:ASPxCallbackPanel>
</div>

<div id="outline_user_detail_place" style="display: none">
  <dx:ASPxCallbackPanel runat="server" ID="outline_user_detail" ClientInstanceName="outline_user_detail" RenderMode="Div" EnableCallbackAnimation="false" ShowLoadingPanel="false" ><%--OnCallback="outline_user_detail_Callback"--%>
    <ClientSideEvents EndCallback="stat.tocTreeListDetail.endCallback" />
    <PanelCollection>
      <dx:PanelContent ID="PanelContent3" runat="server">
        <div id="outline_user_detail_panel" class="panel panel-warning stat-content">
          <div class="panel-heading">
            <div data-bind="html: title"></div>
            <div class="close-btn btn btn-default fa fa-times" onclick="stat.viewsManager.close()"></div>
          </div>
          <div class="panel-body">
            <div class="row">
              <div class="col-md-6">
                <!-- ko foreach: buttons -->
                <button type="button" class="btn btn-success radio-btn" data-bind="click: click, attr: { disabled: isSelected() ? 'disabled' : undefined }">
                  <span data-bind="html: title"></span>
                </button>
                <!-- /ko -->
              </div>
            </div>
            <dx:ASPxPivotGrid ID="PivotGrid" runat="server" Theme="Office2010Blue" DataSourceID="PivotData" EncodeHtml="false" Width="100%" OnFieldValueDisplayText="PivotGrid_FieldValueDisplayText" >
              <OptionsView RowTotalsLocation="Tree" ShowFilterHeaders="False" ShowColumnHeaders="False" ShowDataHeaders="False" ShowRowHeaders="False" />
              <Fields>
                <%--<dx:PivotGridField ID="Lev0Id" Area="RowArea" AreaIndex="0" FieldName="lev0Id" GroupIndex="0" InnerGroupIndex="0" />
                    <dx:PivotGridField ID="UserTitle" Area="RowArea" AreaIndex="0" FieldName="userTitle" GroupIndex="0" InnerGroupIndex="1" />--%>
<%--                <dx:PivotGridField ID="userTitle_Id" Caption="User" Area="RowArea" AreaIndex="0" FieldName="userTitle" GroupIndex="0" InnerGroupIndex="1" />
                <dx:PivotGridField id="tocId_Id" Caption="Course Part" Area="RowArea" AreaIndex="1" FieldName="tocId" GroupIndex="0" InnerGroupIndex="0" />--%>
                <dx:PivotGridField ID="userTitle_Id" Caption="User" Area="RowArea" AreaIndex="0" FieldName="userTitle" />
                <dx:PivotGridField ID="tocId_Id" Caption="Course Part" Area="RowArea" AreaIndex="1" FieldName="tocId" />
                <%--<dx:PivotGridField FieldName="Title" Area="DataArea" Caption="Title" AreaIndex="0" />--%>
                <dx:PivotGridField FieldName="elapsed" Area="DataArea" Caption="Elapsed" AreaIndex="0" SummaryType="Sum" />
                <dx:PivotGridField FieldName="exCount" Area="DataArea" Caption="Exercises" AreaIndex="1" SummaryType="Sum" />
                <%--<dx:PivotGridField FieldName="ProgressBarHtml" Area="DataArea" Caption="Progress" AreaIndex="2" />--%>
                <dx:PivotGridField FieldName="complNotPassiveCnt" Area="DataArea" Caption="Evaluated" AreaIndex="3" />
                <dx:PivotGridField FieldName="ScoreBarHtml" Caption="Score" Area="DataArea" AreaIndex="4" SummaryType="Sum" />
              </Fields>
              <%--<Groups>
                <dx:PivotGridWebGroup ShowNewValues="True" />
              </Groups>--%>
            </dx:ASPxPivotGrid>
            <asp:ObjectDataSource ID="PivotData" runat="server" SelectMethod="GetPivotGridDetailData" TypeName="Statistics.TocCtrl" OnObjectCreating="Data_ObjectCreating" />
          </div>
        </div>
      </dx:PanelContent>
    </PanelCollection>
  </dx:ASPxCallbackPanel>
</div>
