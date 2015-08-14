<%@ Page Language="C#" MasterPageFile="~/BS.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
  <%=System.Web.Optimization.Scripts.Render("~/jsLogin") %>
</asp:Content>
<asp:Content ContentPlaceHolderID="Content" runat="server">
  <div class="btn" data-bind="visible: isLogin, click: login">Login HTTP</div>
  <div class="btn" data-bind="visible: isLogin, click: login_https">Login HTTPS</div>
  <div class="btn" data-bind="visible: !isLogin, click: logout">Logout</div>
  <div class="well">
    <div class="alert alert-error" data-bind="visible: $data.Error, text: $data.Error"></div>
    <div class="alert alert-error" data-bind="visible: $data.Id, html: $data.Id"></div>
    <div class="alert alert-success" data-bind="visible: $data.EMail, html: $data.EMail"></div>
    <div class="alert alert-success" data-bind="visible: $data.Type, html: $data.Type"></div>
    <div class="alert alert-success" data-bind="visible: $data.TypeId, html: $data.TypeId"></div>
    <div class="alert alert-success" data-bind="visible: $data.FirstName, html: $data.FirstName"></div>
    <div class="alert alert-success" data-bind="visible: $data.LastName, html: $data.LastName"></div>
  </div>
  <script type="text/javascript">
    ko.applyBindings(Login.Dump(), $("body")[0]);
  </script>
</asp:Content>
