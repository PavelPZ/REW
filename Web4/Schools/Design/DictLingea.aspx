<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="DictLingea.aspx.cs" Inherits="web4.Schools.DictLingea" %>

<!DOCTYPE html>
<html class='no-ie7 no-ie8'>

<head id="Head" runat='server'>
  <meta http-equiv='X-UA-Compatible' content='IE=Edge' />
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <meta name='viewport' content='width=device-width' />
  <base href="../" />
  <title>LANGMaster</title>
  <asp:PlaceHolder runat="server">
    <%=Packager.RewApp.headContent(cfg)%>
  </asp:PlaceHolder>
  <script type="text/javascript" src="design/DictLingea.js"></script>
</head>
<body style="margin:20px;">
  <%=Packager.MainPage.htmls(new string[][]{new string[]{"schools/design/DictLingea.html"}}) %>
  <form runat="server" id="form2" class="AspForm">
    <div id="root" data-bind="template: 'dictLinegaRoot'">
    </div>
  </form>
</body>
</html>

