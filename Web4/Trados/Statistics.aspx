<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Statistics.aspx.cs" Inherits="web4.Trados.Statistics" %>

<%@ Register src="TopBar.ascx" tagname="TopBar" tagprefix="lm" %>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
  <div>
    <lm:TopBar ID="TopBar2" runat="server" />
    <h2>
      Po projektech a skupinách souborů</h2>
    <table border="1">
      <tr>
        <td>
          Skupina a projekt 
        </td>
        <td>
          Znaků k překladu
        </td>
        <td>
          Stránek k překladu
        </td>
        <td>
          Znaků přeloženo
        </td>
        <td>
          Stránek přeloženo
        </td>
      </tr>
      <asp:Repeater runat="server" ID="StatRep">
        <ItemTemplate>
          <tr>
            <td>
              <%#Enum.GetName(typeof(LMComLib.LocPageGroup), Eval("PageGroup"))%>
              (
              <%#Enum.GetName(typeof(LMComLib.Langs),Eval("SrcLang")) %>
              =>
              <%#Enum.GetName(typeof(LMComLib.Langs), Eval("TransLang"))%>
              )
            </td>
            <td>
              <%#Eval("SrcLen") %>
            </td>
            <td>
              <%#((Convert.ToDecimal( Eval("SrcLen"))) / 1800).ToString("N2") %>
            </td>
            <td>
              <%#Eval("TransLen") %>
            </td>
            <td>
              <%#((Convert.ToDecimal( Eval("TransLen"))) / 1800).ToString("N2")%>
            </td>
          </tr>
        </ItemTemplate>
      </asp:Repeater>
    </table>
    <h2>
      Po projektech</h2>
    <table border="1">
      <tr>
        <td>
          Projekt 
        </td>
        <td>
          Znaků k překladu
        </td>
        <td>
          Stránek k překladu
        </td>
        <td>
          Znaků přeloženo
        </td>
        <td>
          Stránek přeloženo
        </td>
      </tr>
      <asp:Repeater runat="server" ID="ProjectRep">
        <ItemTemplate>
          <tr>
            <td>
              <%#Enum.GetName(typeof(LMComLib.Langs),Eval("SrcLang")) %>
              =>
              <%#Enum.GetName(typeof(LMComLib.Langs), Eval("TransLang"))%>
            </td>
            <td>
              <%#Eval("SrcLen") %>
            </td>
            <td>
              <%#((Convert.ToDecimal( Eval("SrcLen"))) / 1800).ToString("N2") %>
            </td>
            <td>
              <%#Eval("TransLen") %>
            </td>
            <td>
              <%#((Convert.ToDecimal( Eval("TransLen"))) / 1800).ToString("N2")%>
            </td>
          </tr>
        </ItemTemplate>
      </asp:Repeater>
    </table>
  </div>
  </form>
</body>
</html>
