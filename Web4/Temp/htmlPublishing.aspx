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
    <script id="for-recording" type="text/json">
      ["html", ["head", ["title"], ["style", "\r\n.oli-gapfill, .oli-dropdown {\r\n width: 0;}\r\n.oli-gapfill, .oli-dropdown {\r\n width: 0;}\r\n/*\r\n*/\r\n"]], ["body", { "id": "_0", "url": "/lm/examples/temp/testhome" }, ["audio-capture", { "id": "audio-1", "speak-seconds-from": 5, "speak-seconds-to": 10 }], ["media-player", { "id": "mp-1", "_sent-group-id": "seq_0" }], ["_snd-page", ["_snd-file-group", { "media-url": "/temp/media.mp3" }, ["_snd-group", { "id": "seq_0" }, ["_snd-interval", ["_snd-sent", { "idx": 0, "beg-pos": 0, "end-pos": -1 }]]]]], ["_eval-page", { "max-score": 100 }, ["_eval-btn", ["_eval-group", { "eval-control-ids": "audio-1" }]]]]]
    </script>
    <script id="for-playing" type="text/json">
       ["html",["head",["title"],["style","\r\n.oli-gapfill, .oli-dropdown {\r\n width: 0;}\r\n.oli-gapfill, .oli-dropdown {\r\n width: 0;}\r\n/*\r\n*/\r\n"]],["body",{"id":"_0","url":"/testme/forplaying"},["media-player",{"id":"mp-1","media-url":"/testme/forPlaying.mp3","_sent-group-id":"seq_0"}],["_snd-page",["_snd-file-group",{"media-url":"/testme/forPlaying.mp3"},["_snd-group",{"id":"seq_0"},["_snd-interval",["_snd-sent",{"idx":0,"beg-pos":0,"end-pos":-1}]]]]],["_eval-page",{"max-score":0}]]]
    </script>
    <olireplace id="audio-1"></olireplace>
    <br />
    <olireplace id="mp-1"></olireplace>
  </div>
  <script id='dummy' type='text/x-jsrender' data-for='Dummy'>
    {{for ~ActPage()}}{{/for}}
  </script>
  <%=Packager.MainPage.htmls(Packager.RewApp.htmlNewEA(cfg)) %>
</body>
</html>
