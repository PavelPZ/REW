<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Unlock.aspx.cs" Inherits="web4.Trados.Unlock" %>

<%@ Register src="TopBar.ascx" tagname="TopBar" tagprefix="lm" %>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
  <div>
    <lm:TopBar ID="TopBar2" runat="server" />
    <asp:Repeater runat="server" ID="UnlockRep">
      <ItemTemplate>
        <asp:CheckBox runat="server" Text='<%#Eval("Title") %>' /><br />
      </ItemTemplate>
    </asp:Repeater>
    <asp:Button runat="server" ID="UnlockBtn" Text="Unlock" OnClick="UnlockBtn_Click" />
  </div>
  </form>
</body>
</html>
