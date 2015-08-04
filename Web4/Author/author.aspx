<%@ Page Language="C#" CodeBehind="Author.aspx.cs" Inherits="Author.AuthorForm" %>

<asp:placeholder runat="server" id="contentPlace"></asp:placeholder>

<html runat="server" id="htmlPlace" visible="false">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
    <div>
      <h3><a href="author.aspx?mode=doc">Documentation</a> | <a href="author.aspx?mode=xref">Cross reference</a></h3>
<%--      <b>Mode:</b>
      <asp:RadioButtonList runat="server" ID="modeRb" RepeatLayout="Flow" RepeatDirection="Horizontal" RepeatColumns="5">
        <asp:ListItem Text="display" Selected="true" Value="displayEx"></asp:ListItem>
      </asp:RadioButtonList>--%>
      &nbsp;&nbsp;&nbsp;<b>Url:</b>
      <asp:TextBox ID="urlTxt" runat="server" Width="500"></asp:TextBox>
      &nbsp;&nbsp;&nbsp;<asp:Button ID="urlOK" runat="server" Text="ok" OnClick="urlOK_Click" Font-Bold="true" />
      &nbsp;&nbsp;<asp:LinkButton ID="dumpXml" runat="server" Text="dump xml" OnClick="dumpXml_Click"/>
      &nbsp;&nbsp;<asp:LinkButton ID="oldEA" runat="server" Text="from oldEA" OnClick="oldEA_Click"/>
      <br />
      <br />
      <br />
      <asp:LinkButton runat="server" Text="Check ALL" OnClick="checkAll_Click" />
      <br />
      <asp:LinkButton runat="server" Text="Export All" OnClick="allToRename" />
      <br />
      <br />
      <p>
        <h3>Navod</h3>
        Do Edit boxu lze zadat uplnou cestu nebo URL k cviceni nebo adresari. Po kliku na OK se zobrazi cviceni nebo modul jako ve vs.net.<br /><br />
        Priklady pro cviceni:<br />
        <blockquote>
          p:\rew\Web4\lm\examples\Controls\Correction.xml<br />
          /lm/examples/Controls/Correction<br />
          \\192.168.0.14\q\rew\alpha\rew\Web4\lm\examples\Controls\Correction.xml
        </blockquote>
        Priklady pro adresar:<br />
        <blockquote>
          p:\rew\Web4\lm\examples\Controls\meta.xml<br />
          /lm/examples/Controls/<br />
          p:\rew\Web4\lm\meta.xml
        </blockquote>
      </p>
    </div>
  </form>
</body>
</html>
