<%@ Page Language="C#" %>

<%@ Register Src="~/JsLib/Controls/common/MenuItem.ascx" TagPrefix="lmc" TagName="MenuItem_render" %>
<%@ Register Src="~/JsLib/Controls/CrsItem/CrsItem.ascx" TagPrefix="lmc" TagName="CrsItem_render" %>
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
  <%=System.Web.Optimization.Scripts.Render("~/jsSchool") %>
  <link rel="stylesheet" href="../../css/crsitem.css" media="screen" />
  <script type="text/javascript" src="CrsItem.js"></script>
  <style type="text/css">
    .open.dropdown-menu {
      display: block;
    }

    .dropdown-menu {
      position: absolute;
      top: 0;
      display: none;
    }
  </style>
</head>
<body>
  <script id='Test1' type='text/x-jsrender'>
    {{for ~crs_item_par('"tmplBtn":"TBtn", "tmplMore": "TMore", "tmplRight": "TRight"', #data) tmpl=~T('TCrsItem')/}}
  </script>
  <script id='Test2' type='text/x-jsrender'>
    {{for ~crs_item_par('"tmplBtn":"TBtn", "tmplMore": "TMore", "tmplRight": "TRight"', #data) tmpl=~T('TCrsItem')/}}
  </script>
  <script id='Test3' type='text/x-jsrender'>
    {{for ~crs_item_par('"tmplBtn":"TBtn", "hasMenu": true, "tmplRight": "TRight"', #data) tmpl=~T('TCrsItem')/}}
  </script>
  <lmc:CrsItem_render runat="server" />
  <lmc:MenuItem_render runat="server" />
  <script id='TMore' type='text/x-jsrender'>
    More...
  </script>
  <script id='TMenu' type='text/x-jsrender'>
    <ul class="dropdown-menu">
      <li><a tabindex="-1" href="#">Action</a></li>
      <li><a tabindex="-1" href="#">Another action</a></li>
      <li><a tabindex="-1" href="#">Something else here</a></li>
      <li class="divider"></li>
      <li><a tabindex="-1" href="#">Separated link</a></li>
    </ul>
  </script>
  <script id='Script1' type='text/x-jsrender'>
    <div style="width: 100%;" class="open">
      <ul class="dropdown-menu">
        <li><a tabindex="-1" href="#">Action</a></li>
        <li><a tabindex="-1" href="#">Another action</a></li>
        <li><a tabindex="-1" href="#">Something else here</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#">Separated link</a></li>
      </ul>
    </div>
  </script>
  <script id='TBtn' type='text/x-jsrender'>
    <a href="#">XXXXX asd fas f asdf ads f</a> YYY
  </script>
  <script id='TRight' type='text/x-jsrender'>
    right SDasd D d ASD s d SD s d SDsdsa da
  </script>
  <div class="container">
    <div class="row">
      <div class="col-span-6 test1"></div>
      <div class="col-span-6 test3"></div>
    </div>
    <div class="row">
      <div class="col-span-6 test2"></div>
    </div>

  </div>
  <script type="text/javascript">
    $(function () {
      var nop = function () { };
      //test1
      var html = $("#Test1").render({ color: 'purple', isDisabled: true, isMoreDisabled: true, progress: 20 });
      $(".test1").html(html);
      console.log(html);
      //test2
      html = $("#Test2").render({ color: 'green', isDisabled: false, isMoreDisabled: false });
      $(".test2").html(html);
      console.log(html);
      //test3
      html = $("#Test3").render({ color: 'green', isDisabled: false, isMoreDisabled: false, progress: 31, menu: [{ id: 1, title: "menu1", icon: "play", actionName: nop }, { id: 1, title: "menu2", icon: "", actionName: nop }, { id: 1, title: "menu3", icon: "", actionName: nop }] });
      $(".test3").html(html);
      console.log(html);
      $(window).trigger("resize");
      $.fn.dropdown();
    });
  </script>

</body>
</html>
