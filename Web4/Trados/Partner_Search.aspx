<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Partner_Search.aspx.cs" Inherits="web4.Trados.Partner_Search" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title>Untitled Page</title>
  <style type="text/css">
    .td
    {
      vertical-align: top;
      padding: 30px;
    }
  </style>
</head>
<body>
  <form id="form1" runat="server">
  <div>
    <h1>LANGMaster Localization Tool for <%= ConfigurationManager.AppSettings["Trados.title." + partnerCode]%></h1>
    <table>
      <tr>
        <td class="td">
          <h2>
            Filter</h2>
          Source text:<br />
          <asp:TextBox runat="server" ID="SearchSrcEd" />
          <br />
          Translation text:<br />
          <asp:TextBox runat="server" ID="SearchTransEd" />
          <br />
          Sentence ID:<br />
          <asp:TextBox runat="server" ID="SearchSentId" />
        </td>
        <td class="td">
          <h2>
            Result
          </h2>
          <asp:Button runat="server" ID="OKBtn" Text="OK" OnClick="OKBtn_Click" />
        </td>
      </tr>
    </table>
    <asp:Repeater runat="server" ID="PagesRep">
      <ItemTemplate>
        <a href='<%#Eval("url")%>'>
          <%#Eval("title")%></a><br />
      </ItemTemplate>
    </asp:Repeater>
    <p>
      <asp:Label runat="server" ID="ErrorLab" />
    </p>
  </div>
  </form>
</body>
</html>