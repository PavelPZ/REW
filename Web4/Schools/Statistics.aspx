<%@ Page Language="C#" MasterPageFile="~/Statistics/Ground.Master" CodeBehind="Statistics.aspx.cs" Inherits="Statistics.StatDefault" %>
<%--<%@ Page Title="" Language="C#" MasterPageFile="~/Statistics/Ground.Master" AutoEventWireup="true" CodeBehind="Statistics.aspx.cs" Inherits="Statistics.StatDefault" %>--%>

<%@ Register Src="../Statistics/Toc.ascx" TagName="Toc" TagPrefix="lm" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxRibbon" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxEditors" TagPrefix="dx" %>
<%@ Register Assembly="DevExpress.Web.v14.1, Version=14.1.5.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web.ASPxHiddenField" TagPrefix="dx" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
  <link href="../JsLib/css/Statistics.css" rel="stylesheet" />
  <script type="text/javascript" src="../Statistics/Statistics.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">
  <asp:PlaceHolder runat="server" ID="contentPlace">

    <div class="app-school gramm">
      <div class="rtl">
        <div class="navbar navbar-inverse">
          <div id="topbar" class="container">
            <a class="navbar-brand lm-logo-black lm-logo-black-small" href="#" onclick="aspx.gotoHome();"></a>
            <div class="btn btn-large btn-info lm-green-btn" onclick="aspx.gotoReturnUrl();">
              <span class="fa-lg fa fa-arrow-circle-o-left"></span>
              <%=locBack %>
            </div>
            <h4 class="title" data-bind="visible: selectedButton, text: title"></h4>
            <div id="selectModel" class="stat-select btn-group pull-right">
              <h4 data-bind="visible: !selectedButton()">Select statistic:</h4>
              <!-- ko foreach: buttons -->
              <button type="button" class="btn btn-success radio-btn" data-bind="click: click, attr: { disabled: isSelected() ? 'disabled' : undefined }">
                <span data-bind="html: data.title"></span>
              </button>
              <!-- /ko -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <lm:Toc ID="Toc" runat="server" />
    </div>
    <script type="text/javascript">
      stat.init();
    </script>
  </asp:PlaceHolder>
</asp:Content>
