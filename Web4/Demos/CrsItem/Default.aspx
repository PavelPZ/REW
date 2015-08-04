<%@ Page Language="C#" %>

<%@ Register Src="~/JsLib/Controls/CrsItem/render.ascx" TagPrefix="lmc" TagName="CrsItem" %>
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
  <link rel="stylesheet" href="../../jslib/controls/crsitem/style.css" media="screen" />
  <script type="text/javascript" src="../../jslib/controls/crsitem/script.js"></script>
</head>
<body>
  <lmc:CrsItem runat="server" hasMenu="false" tmplMore="TMore" tmplBtn="TBtn" tmplRight="TRight" />
  <script id='TMore' type='text/x-jsrender'>
    more asdfasdf
  </script>
  <script id='TBtn' type='text/x-jsrender'>
    <a href="#">XXXXX</a>
  </script>
  <script id='TRight' type='text/x-jsrender'>
    right SDasd D d ASD s d SD s d SDsdsa da
  </script>
  <div class="test1"></div>
  <div class="test2" style="margin-top:20px;"></div>
  <script type="text/javascript">
    $(function () {
      //test1
      var data = { disabled: '', iconstyle: 'icon-white', };
      var html = $("#TCrsItem").render(data);
      $(".test1").html(html);
      console.log(html);
      //test2
      data = { disabled: 'disabled', iconstyle: 'icon-white', };
      html = $("#TCrsItem").render(data);
      $(".test2").html(html);
      console.log(html);
    });
  </script>
</body>
</html>
