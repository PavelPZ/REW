<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Partner.aspx.cs" Inherits="web4.Trados.Partner" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
  <h1>LANGMaster Localization Tool</h1>
  <div>
   </b>Enter partner code:</b></p>
    <p>
      <asp:TextBox runat="server" ID="CodeTxt" />
      <asp:Button runat="server" ID="OKBtn" onclick="OKBtn_Click" text="OK"/></p>
  </div>
  </form>
</body>
</html>