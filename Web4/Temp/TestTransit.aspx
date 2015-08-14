<%@ Page Language="C#" %>

<script runat="server">
  Packager.Config cfg = new Packager.Config() { target = LMComLib.Targets.web, version = schools.versions.debug, lang = LMComLib.Langs.cs_cz, startProcName = "boot.Dummy" };
</script>

<!DOCTYPE html>
<html>

<head id="Head1" runat='server'>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>LANGMaster</title>
  <base href="../schools" />
  <%=Packager.RewApp.headContent(cfg)%>
  <script type="text/javascript" src="testtransit.js"></script>
  <script type="text/javascript" src="../JsLib/Scripts/jquery.transit.js"></script>
</head>
<body>
  <button class="btn btn-default" data-bind="click: change">Change</button>
  <div style="position: relative">
    <!-- ko with: views[0] -->
    <div data-bind='template: template, fadeVisible: visible' style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
    <!-- /ko -->
    <!-- ko with: views[1] -->
    <div data-bind='template: template, fadeVisible: visible' style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
    <!-- /ko -->
  </div>
  <script id='dummy' type='text/x-jsrender'>
  </script>
  <script id='t0' type='text/x-jsrender'>
    <h1 data-bind="text: title"></h1>
    <p>{{:title}}</p>
  </script>
  <script id='t1' type='text/x-jsrender'>
    <p>{{:title}}</p>
    <h1 data-bind="text: title"></h1>
  </script>
</body>
</html>
