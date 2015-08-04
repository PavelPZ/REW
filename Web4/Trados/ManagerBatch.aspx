<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ManagerBatch.aspx.cs" Inherits="web4.Trados.ManagerBatch" %>

<%LMComLib.Machines.checkAdminIP(Context);%>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
  <div>
    <asp:Button runat="server" Text="RUN!" OnClick="RunClick" />
    <p>
      Example:<br />
      ManagerBatch.aspx?file=Q:\lmcom\LMCom\Services\Trados\BatchExample.xml
    </p>
  </div>
  </form>
</body>
</html>