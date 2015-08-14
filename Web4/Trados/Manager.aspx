<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Manager.aspx.cs" Inherits="web4.Trados.Manager" %>

<%@ Register src="TopBar.ascx" tagname="TopBar" tagprefix="lm" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title>Untitled Page</title>
</head>
<body>
  <form id="form1" runat="server">
  <div>
    <lm:TopBar ID="TopBar2" runat="server" />
    <table>
      <tr>
        <td valign="top" style="padding: 30px;">
          <h2>
            Cílový jazyk</h2>
          <asp:DropDownList runat="server" ID="DestinationLangs" AutoPostBack="true" OnSelectedIndexChanged="DestLangChanged" />
          <%-- 
          <h2>
            Projekt</h2>
          <asp:RadioButtonList runat="server" ID="ProjectsRad" RepeatDirection="Vertical" />
          --%>
          <br />
          Locked:<br />
          <asp:Repeater runat="server" ID="LockedRep">
            <ItemTemplate>
              <%#Container.DataItem %><br />
            </ItemTemplate>
          </asp:Repeater>
        </td>
        <td valign="top" style="padding: 30px;">
          <h2>
            Skupina souborů</h2>
          <asp:CheckBoxList runat="server" ID="GroupsChb" DataTextField="title" DataValueField="value" />
        </td>
      </tr>
    </table>
    <table>
      <tr>
        <td style="width: 160px; padding: 10px;">
          <asp:Button runat="server" ID="ResxGenBtn" Text="1. Sběr dat do DB" OnClick="Op1_Click" />
        </td>
        <td style="width: 160px; padding: 10px;">
          <asp:Button runat="server" ID="InitTransBtn" Text="2. Připrav DB pro jazyk" OnClick="Oper2_Click" />
        </td>
        <td style="width: 160px; padding: 10px;">
          <asp:Button runat="server" ID="DownloadExcel" Text="3. Překlad v Excelu" OnClick="Oper3_Click" /><br />
          <asp:LinkButton runat="server" ID="DownloadUploadBtn" Text="3+4 pro OK věty" OnClick="DownloadUploadBtn_Click" />
        </td>
        <td style="width: 160px; padding: 10px;">
          <asp:FileUpload ID="FileUpload" runat="server" Width="250" /><br />
          <asp:Button ID="FileUploadOKBtn" runat="server" Text="4. Upload překladu" OnClick="Oper4_Click" />
        </td>
        <td style="width: 160px; padding: 10px;">
          <asp:Button runat="server" ID="ResxExport" Text="5. Použití překladů" OnClick="Oper5_Click" />
        </td>
      </tr>
      <tr>
        <td valign="top" style="width: 160px; padding: 10px;">
          Z LMDATA, ASPX, MASTER, ASCX, JS, CS a LMAP souborů vytáhne stringy k lokalizaci
          a vytvoří RESX soubory.<br />
          Všechny RESX soubory naimportuje do LMTrados databáze.
        </td>
        <td valign="top" style="width: 160px; padding: 10px;">
          <asp:CheckBox runat="server" ID="AdjustStrongChb" Text="Automatický překlad" /><br />
          V LMTrados databázi založí nebo aktualizuje věty k překladu pro zvolený zdrojový
          jazyk.
          <br />
          Musí se zaškrtnout
          <nobr>Jazyk(y).</nobr>
        </td>
        <td valign="top" style="width: 160px; padding: 10px;">
          <b>Filter</b><br>
          <asp:CheckBoxList runat="server" ID="SentFilterChb" />
          <br />
          <asp:CheckBox runat="server" ID="LockChb" Text="Lock?" Checked="false" />
          (<a href="Unlock.aspx">unlock</a>)<br />
          Věty k překladu exportuje do Excelu.
          <br />
          Musí se zaškrtnout právě jedna Skupina souborů a zdrojový Jazyk a zvolit Filter(s).
        </td>
        <td valign="top" style="width: 160px; padding: 10px;">
          <asp:CheckBox runat="server" ID="IgnoreSentenceNotExist" Text="Ignoruje neexistenci sentence" /><br />
          Upload Excel souboru s přeloženými větami.
        </td>
        <td valign="top" style="width: 160px; padding: 10px;">
          Export z LMTrados databáze do národních RESX souborů (např. do *.cs-cz.resx).
          <br />
          Musí se zaškrtnout
          <nobr>Jazyk(y).</nobr>
        </td>
      </tr>
    </table>
    <h2>
      Zpracováno
      <asp:Label runat="server" ID="CountLab" Text="0" />
      souborů</h2>
    <asp:Label runat="server" ID="ErrorLab" ForeColor="Red" />
    <hr />
    <h3>
      Detaily pro export do excelu</h3>
    <b>TRANS</b> prvni preklad (prelozeny zdroj a trans je pradny), neni exact match
    nabidka (z lookup table)<br />
    <b>OK</b> prvni preklad, je exact match nabidka<br />
    <b>CHANGE</b> lisi se aktualni a prelozeny zdroj, neni exact match nabidka<br />
    <b>CHOICE</b> lisi se aktualni a prelozeny zdroj, je exact match nabidka
    <br />
    <b>DONE</b> veta prelozena: shoduje ze aktualni zdroj s prelozenym zdrojem<br />
    <hr />
    <asp:LinkButton runat="server" ID="MultiTrans" Text="Překlad vět s vícenásobným výskytem"
      OnClick="MultiTrans_Click" />
    (Zašrtknout projekt a skupinu(y) souborů), výsledek na serveru v c:\temp\pom.htm.
    Dát jako jediný soubor do EA_Test a přeložit EA_Test.
    <br />
    <asp:LinkButton runat="server" ID="TransToAspxBtn" Text=".Trans to .ASPX" OnClick="TransToAspxBtn_Click" /><br />
    <asp:LinkButton runat="server" ID="TransSrcToApsx" Text=".TransSrc to .ASPX" OnClick="TransSrcToApsx_Click" /><br />
    <asp:LinkButton runat="server" ID="DuplicatedSentencesBtn" Text="Duplicitni Name+TransLang"
      OnClick="DuplicatedSentencesBtn_Click" /><br />
    <h3>
      Využití původního Tradosu</h3>
    <asp:LinkButton runat="server" ID="UseTrados1" Text="Nová data do Resx (to c:\temp\source.resx)"
      OnClick="UseTrados_Click" /><br />
    <asp:LinkButton runat="server" ID="UseTrados2" Text="Po překladu source do trans1.resx (vznikne trans2)"
      OnClick="UseTrados_Click" /><br />
    <asp:LinkButton runat="server" ID="UseTrados3" Text="Po překladu trans2 (vznikne lookup_import.xml s výsledkem)"
      OnClick="UseTrados_Click" /><br />
    <h3>
      Instrukce (&lt;html title="$trans;...) do c:\temp\pom.htm, pak přesun do TradosTest
      a překlad</h3>
    <asp:LinkButton runat="server" ID="ExportInstructionsBtn" Text="Export instrukcí"
      OnClick="ExportInstructionsBtn_Click" />
    volí se pouze Skupina souborů<br />
    <asp:Repeater runat="server" ID="LogRep">
      <ItemTemplate>
        <%#Container.DataItem %><br />
      </ItemTemplate>
    </asp:Repeater>
  </div>
  <p>
    <asp:Button runat="server" ID="TestBtn" Text="Test" OnClick="TestBtn_Click" />
  </p>
  <p>
    <a href="Oper_All.aspx">All</a>
  </p>
<%--  <p>
    <asp:Button runat="server" ID="EAUrlLocalize" Text="EA Url Localize" OnClick="EAUrlLocalize_Click" />
  </p>--%>
  </form>
</body>
</html>
