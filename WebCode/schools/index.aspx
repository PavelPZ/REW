﻿<%@ Page Language="C#" CodeBehind="index.aspx.cs" Inherits="WebCode.index" %>

<!DOCTYPE html>
<html class='no-ie7 no-ie8'>
<head>
  <meta http-equiv='X-UA-Compatible' content='IE=Edge' />
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <meta name='viewport' content='width=device-width' />
  <title><%=pageTitle%></title>
  <%=csss() %>
  <%=writeCfg()%>
  <script type='text/javascript' src='lmconsoleinit.js'></script>
  <%=scripts() %>
</head>
<body>
  <div id="block-gui-element" class="block-gui-cls" style="display: none" onclick="return false">
    <i class='fa fa-spinner fa-spin'></i>
  </div>
  <div id='splash' class='rtl'>
    <div class='container center splash-loading'>
      <i class='fa fa-spinner fa-spin'></i>
      <br />
      <br />
      Loading, it could take a while...
    </div>
  </div>
  <div id='global-media' class='rtl'></div>
  <div id='lm-alert-place' class='rtl'></div>
  <div id='lm-console-place' class='rtl'></div>
  <div id='lm-docdlg-place' class='rtl'></div>
  <div ng-app="appRoot" class="bl">
    <div data-ui-view></div>
  </div>
  <div id='root'></div>
  <script id='dummy' type='text/x-jsrender' data-for='Dummy'>
    {{for ~ActPage()}}{{/for}}
  </script>
  <%=htmls()%>
</body>
</html>