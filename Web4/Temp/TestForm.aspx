<%@ Page Language="C#" %>

<script runat="server">
  Packager.Config cfg = new Packager.Config() { target = LMComLib.Targets.web, version = schools.versions.debug, lang = LMComLib.Langs.cs_cz, startProcName = "boot.Dummy" };
  Regex isJQuery = new Regex(@".*jquery(2|)\.(min\.|)js$", RegexOptions.Multiline);
  protected override void OnLoad(EventArgs e) {
    base.OnLoad(e);
  }
</script>

<!DOCTYPE html>
<!--[if lt IE 8]>  
<html class='no-media ie7'> 
<![endif]-->
<!--[if IE 8]>
<html class='no-ie7 no-media ie8'>
<![endif]-->
<!--[if IE 9]>
<html class='ie ie9'> 
<![endif]-->
<!--[if (gt IE 9)|!(IE)]><!-->
<html class='no-ie7 no-ie8'>
<!--<![endif]-->

<head id="Head1" runat='server'>
  <meta http-equiv='X-UA-Compatible' content='IE=Edge' />
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <meta name='viewport' content='width=device-width' />
  <base href="../schools" />
  <title>LANGMaster</title>
  <%=Packager.RewApp.headContent(cfg)%>
  <script type="text/javascript" src="statistics.js"></script>
</head>
<body>
  <div id="root" data-bind="template: 'statRoot'">
  </div>
  <%=Packager.MainPage.htmls(new string[][]{new string[]{"Schools/TopBar.html", "Schools/Statistics.html"}}) %>
  <single-choice id="sch1" correctvalue="0">
    <data>w1</data>
    <data>#word 2</data>
    <data>possibility 3</data>  
  </single-choice>
</body>
</html>
