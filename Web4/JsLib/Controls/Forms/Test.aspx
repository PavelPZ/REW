<%@ Page Language="C#" %>

<%@ Register Src="~/JsLib/Controls/Buttons/render.ascx" TagPrefix="lmc" TagName="OkCancel_render" %>
<!DOCTYPE html>
<!--[if lte IE 7]> <html class="ie7"> <![endif]-->
<!--[if gt IE 7]><!-->
<html class="no-ie7">
<!--<![endif]-->
<head runat="server">
  <title></title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <%=System.Web.Optimization.Styles.Render("~/Bootstrap/css/file") %>
  <%=System.Web.Optimization.Styles.Render("~/jslib/css/file") %>
  <%=System.Web.Optimization.Scripts.Render("~/jsexternal") %>
  <%=System.Web.Optimization.Scripts.Render("~/jsModel") %>
  <link rel="stylesheet" href="../../css/forms.css" media="screen" />
  <!--<script type="text/javascript" src="script.js"></script>-->
</head>
<body>
  <div class="container">
    <div class="row">
      <div class="col-span-6">
        <input type="text" placeholder=".span6">
      </div>
      <div class="col-span-6">
        <input type="text" placeholder=".span6">
      </div>
    </div>
  </div>
</body>
</html>
