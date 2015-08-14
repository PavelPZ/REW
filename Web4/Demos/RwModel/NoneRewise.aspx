<%@ Page Title="" Language="C#" MasterPageFile="~/BS.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
  <%=System.Web.Optimization.Styles.Render("~/cssRewise") %>
  <link href="rewise.css" rel="stylesheet" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">
  <div class="navbar navbar-fixed-top">
    <div class="navbar-inner">
      <div class="container-fluid">
        <ul class="nav pull-right">
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">My Locales <b class="caret"></b></a>
            <ul class="dropdown-menu">
              <li><a href="#"><i class="flag-small flag-small-czech"></i>&nbsp;Change your Native language</a></li>
              <li><a href="#"><i class="flag-small flag-small-czech"></i>&nbsp;Change language of Application interface</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div id="content">
    <div class="row-fluid">
      <div class="offset2 span8">
        <h1>Language to learn</h1>
        <div class="instruction">
          <div class="instruction-heading">
            <a class="instruction-toggle collapsed" data-toggle="collapse" data-target="#instrBody"><i id="iplus" class="icon-chevron-up"></i><i id="iminus" class="icon-chevron-down"></i>&nbsp;Select your first Language to learn</a>
          </div>
          <div id="instrBody" class="instruction-body collapse">
            <div class="instruction-inner">
              Anim pariatur cliche...
            </div>
          </div>
        </div>
        <blockquote>
          <h5>Choose from 72 available languages:</h5>
          <div class="row-fluid">
            <div class="offset1 span5">
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
            </div>
            <div class="offset1 span5">
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
              <a href="#"><i class="flag-small flag-small-english"></i>&nbsp;English</a><br />
            </div>
          </div>
        </blockquote>
      </div>
    </div>
  </div>
</asp:Content>
