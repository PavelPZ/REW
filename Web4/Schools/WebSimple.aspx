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

<head id="Head1" runat='server'>
  <meta http-equiv='X-UA-Compatible' content='IE=Edge' />
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <meta name='viewport' content='width=device-width' />
  <title>LANGMaster</title>
  <%=Packager.RewApp.headContent(cfg)%>
  <script type="text/javascript" src="../temp/file1.js"></script>
</head>
<body>
  <div class="container">
    <div class="row">
      <div id="btn" class="col-md-6">
        <div id="d1" style="background-color: lightgreen; position: absolute; top: 0px; bottom: 0px"></div>
        <div id="d2" style="background-color: aliceblue; position: absolute; top: 0px; bottom: 0px"></div>
        <div id="d3" style="background-color: antiquewhite; position: absolute; top: 0px; bottom: 0px"></div>
        <div style="position: relative">
          text text text text text text text text text text text text text text text text text text 
      text text text text text text text text text text text text text text text text text text 
      text text text text text text text text text text text text text text text text text text 
      text text text text text text text text text text text text text text text text text text 
      text text text text text text text text text text text text text text text text text text 
        </div>
      </div>
    </div>
  </div>
</body>
</html>
