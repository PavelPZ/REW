<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="lmConsole.aspx.cs" Inherits="web4.Schools.Design.lmConsole" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
    <p>
      <asp:Button runat="server" Text="Download all" ID="DownloadAllBtn" OnClick="DownloadAllBtn_Click" />
    </p>
    <p>
      <a href="file:///p:\rew\Web4\App_Data\globalLogs\index.htm">View logs</a>
    </p>
    <p>
      <asp:LinkButton ID="SimulateErrorBtn" runat="server" OnClick="SimulateErrorBtn_Click">Simulate server error</asp:LinkButton></p>
  </form>
</body>
</html>
