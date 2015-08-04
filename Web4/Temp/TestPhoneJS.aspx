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
  <base href="../schools" />
  <title>LANGMaster</title>
  <%=Packager.RewApp.headContent(cfg)%>
  <script type="text/javascript" src="../PhoneJS/Lib/js/globalize.min.js"></script>
  <script type="text/javascript" src="../PhoneJS/Lib/js/localization/globalize.culture.fr.js"></script>
  <script type="text/javascript" src="../PhoneJS/Lib/js/localization/localization.default.js"></script>
  <script type="text/javascript" src="../PhoneJS/Lib/js/localization/localization.fr.js"></script>
  <script type="text/javascript" src="../PhoneJS/Lib/js/dx.phonejs.debug.js"></script>
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/css/dx.common.css" />
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/css/dx.ios.default.css" />
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/css/dx.android.holo-dark.css" />
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/css/dx.win8.black.css" />
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/css/dx.tizen.black.css" />
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/css/dx.generic.light.css" />
  <!-- Layouts -->
  <script type="text/javascript" src="../PhoneJS/Lib/layouts/Empty/EmptyLayout.js"></script>
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/layouts/Empty/EmptyLayout.css" />
  <link rel="dx-template" type="text/html" href="../PhoneJS/Lib/layouts/Empty/EmptyLayout.html" />

  <script type="text/javascript" src="../PhoneJS/Lib/layouts/Navbar/NavbarLayout.js"></script>
  <link rel="stylesheet" type="text/css" href="../PhoneJS/Lib/layouts/Navbar/NavbarLayout.css" />
  <link rel="dx-template" type="text/html" href="../PhoneJS/Lib/layouts/Navbar/NavbarLayout.html" />


  <script type="text/javascript" src="../PhoneJS/demo/index.js"></script>
  <link rel="stylesheet" type="text/css" href="../PhoneJS/demo/index.css" />

  <script type="text/javascript" src="../PhoneJS/demo/home.js"></script>
  <link rel="dx-template" type="text/html" href="../PhoneJS/demo/home.html" />
</head>
<body>
  <div id="viewport" class="dx-viewport dx-ios-stripes"></div>
</body>
</html>
