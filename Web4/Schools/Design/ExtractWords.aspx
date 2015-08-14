<%@ Page Language="C#" %>

<script runat="server">
  Packager.Config cfg = new Packager.Config() { target = LMComLib.Targets.web, version = schools.versions.debug, lang = LMComLib.Langs.cs_cz, startProcName = "boot.Dummy" };
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

<head id="Head1" runat='server' style="margin:0;">
  <meta http-equiv='X-UA-Compatible' content='IE=Edge' />
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <meta name='viewport' content='width=device-width' />
  <base href="../" />
  <title>LANGMaster</title>
  <%=Packager.RewApp.headContent(cfg)%>
  <script type="text/javascript" src="design/ExtractWords.js"></script>
</head>
<body style="margin:0;">
  <div id="root" data-bind="template: 'statRoot'">
  </div>
  <%=Packager.MainPage.htmls(Packager.RewApp.htmlNewEA(cfg))%>
  Get words from:
  <span class="btn btn-default" onclick="extractWords.RunCourses(function() {alert('Language courses done')})" >Language courses</span>
  <span class="btn btn-default" onclick="extractWords.RunGrafia($.noop)" >Grafia courses</span>
  <div id="exercise"></div>
</body>
</html>
