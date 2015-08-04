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
  <base href="../rew/schools" />
  <title>LANGMaster</title>
  <%=Packager.RewApp.headContent(false, cfg)%>
  <script type="text/javascript" src="../temp/htmlpublishing/ko-comp.js"></script>
</head>
<body>
  <div id="block-gui-element" class="block-gui-cls" style="display: none" onclick="return false">
    <i class='fa fa-spinner fa-spin'></i>
  </div>
  <div id='global-media' class='rtl'></div>
  <div id='lm-alert-place' class='rtl'></div>
  <div class="container">
    <pairing id="p1" random="true"><pairing-item right="Right 1">Left 1</pairing-item><pairing-item right="Right 2">Left 2</pairing-item></pairing>
    <br />
    <audio-capture id="audio1" stop-in-modal-dialog="true" speak-seconds-to="20" speak-seconds-from="10" modal-dialog-header="content-2"></audio-capture>
    <br />
    <media-player media-url="media/Media3.mp3"></<media-player media-url="media/Media3.mp3"></media-player>>
  </div>
  <script id='dummy' type='text/x-jsrender' data-for='Dummy'>
    {{for ~ActPage()}}{{/for}}
  </script>
  <%=Packager.MainPage.htmls(Packager.RewApp.htmlNewEA(cfg)) %>
</body>
</html>
