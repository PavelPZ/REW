<%@ Page Title="" Language="C#" MasterPageFile="~/BS.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
  <%=System.Web.Optimization.Styles.Render("~/cssRewise") %>
  <link href="rewise.css" rel="stylesheet" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">
  <script type="text/javascript">
    //alert(Utils.preferedLanguage());
  </script>
  <div class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
      <!--<a id="brand" href="#" class="brand"><i class="flag-mid flag-mid-english" style="padding: 0; margin: -6px 0 0 0;"></i>&nbsp;LANGMaster RE-WISE</a>-->
      <ul class="nav pull-right">
        <li><a class="btn btn-inverse" href="000_SelectLang.aspx">Czech&nbsp;<i class="icon-play icon-white"></i></a></li>
      </ul>
    </div>
  </div>
  <div class="row-fluid">
    <div class="offset1 span8">
      <h3>Login in one of the following ways:</h3>
      <blockquote>
        <div class="row-fluid">
          <div class="span6 ignore-media">
            <div class="row-fluid">
              <a class="span6 btn btn-large" href="#">Facebook</a>
              <a class="span6 btn btn-large" href="#">Google</a>
            </div>
          </div>
          <div class="span6 ignore-media">
            <div class="row-fluid">
              <a class="span6 btn btn-large" href="#">Yahoo</a>
              <a class="span6 btn btn-large" href="#">LANGMaster</a>
            </div>
          </div>
        </div>
      </blockquote>
    </div>
  </div>
</asp:Content>
