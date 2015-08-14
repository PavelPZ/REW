<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="web4.Trados.Default" %>

<%@ Register src="TopBar.ascx" tagname="TopBar" tagprefix="lm" %>

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
    <lm:TopBar ID="TopBar2" runat="server" />
    <table>
      <tr>
        <td class="td">
          <h2>
            1. Projekt</h2>
          <asp:RadioButtonList runat="server" ID="ProjectsRad" RepeatDirection="Vertical" />
        </td>
        <td class="td">
          <h2>
            2. Skupina souborů</h2>
          <asp:CheckBoxList runat="server" ID="GroupsChb" RepeatColumns="2" />
        </td>
        <td class="td">
          <h2>
            3. Text filter (option)</h2>
          Ve zdroji:<br />
          <asp:TextBox runat="server" ID="SearchSrcEd" />
          <br />
          V překladu:<br />
          <asp:TextBox runat="server" ID="SearchTransEd" />
          <br />
          V jmenu vety:<br />
          <asp:TextBox runat="server" ID="SearchNameEd" />
          <br />
          V jmenu souboru:<br />
          <asp:TextBox runat="server" ID="SearchFileNameEd" /><br />
          Id vety:<br />
          <asp:TextBox runat="server" ID="SearchSentId" />
        </td>
        <td class="td">
          <h2>
            4. Status filter (option)</h2>
          <asp:CheckBoxList runat="server" ID="SentFilterChb" />
        </td>
        <td class="td">
          <h2>
            5. Výsledek
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
