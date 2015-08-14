<%@ Page Title="" Language="C#" MasterPageFile="~/BS.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
  <%=System.Web.Optimization.Styles.Render("~/cssRewise") %>
  <link href="rewise.css" rel="stylesheet" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">
  <div id="content" style="margin-top: -30px;">
    <h2>Application language:</h2>
    <blockquote>
      <div class="row-fluid">
        <div class="span6 ignore-media">
          <div class="row-fluid">
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Brasilian Portugal</span></a>
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Czech</span></a>
          </div>
        </div>
        <div class="span6 ignore-media">
          <div class="row-fluid">
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Russion</span></a>
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Brasilian Portugal long</span></a>
          </div>
        </div>
      </div>
      <div class="row-fluid">
        <div class="span6 ignore-media">
          <div class="row-fluid">
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Brasilian Portugal</span></a>
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Czech</span></a>
          </div>
        </div>
        <div class="span6 ignore-media">
          <div class="row-fluid">
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Russion</span></a>
            <a href="#" class="span6 flag-box"><i class="flag-mid flag-mid-czech"></i><span>Brasilian Portugal long</span></a>
          </div>
        </div>
      </div>
    </blockquote>
  </div>
</asp:Content>
