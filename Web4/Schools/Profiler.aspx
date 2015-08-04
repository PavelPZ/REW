<%@ Page Language="C#" %>

<script runat="server">
  Packager.Config cfg = new Packager.Config() { target = LMComLib.Targets.web, version = Packager.versions.debug }; 
  
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
  <title>LANGMaster</title>
  <%=Packager.RewApp.headContent(cfg)%>
</head>
<body>
  <div class="container">
    <a href="#" onclick="SndLow.test();"><h3>RUN</h3></a>
    <div class="row">
      <div id="sldiv_sl"></div>
      <div id="slduration_sl"></div>
      <div id="slerror_sl"></div>
      <br /><br />
      <div id="sldiv_html5"></div>
      <div id="slduration_html5"></div>
      <div id="slerror_html5"></div>
    </div>
  </div>
  <%=Packager.MainPage.htmls(Packager.RewApp.htmlNewEA(cfg))%>
  <script type="text/javascript">
    
  </script>
</body>
</html>
