<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="Default.ascx.cs" Inherits="Statistics.Default" %>
<!DOCTYPE html>
<html class='no-ie7 no-ie8'>
<head id="Head" runat='server'>
  <meta http-equiv='X-UA-Compatible' content='IE=Edge' />
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <meta name='viewport' content='width=device-width' />
  <title>LANGMaster</title>
  <asp:PlaceHolder runat="server">
    <%=new NewData.Design.Templates.groundHead().TransformText()%>
  </asp:PlaceHolder>
  <link href='../jslib/css/statistics.css' rel='stylesheet' />
</head>
<body class="lm-stat <%=getLangStr() %>">
  <form runat="server" id="form2" class="AspForm">
    <div runat="server" id="contentDiv"></div>
  </form>
</body>
</html>

