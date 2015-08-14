<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="LookupManager.aspx.cs" Inherits="web4.Trados.LookupManager" %>

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
      Projects:</h2>
    <asp:RadioButtonList runat="server" ID="ProjectsRad" RepeatDirection="Vertical" />
    <h2>
      Exports (to c:\temp\lookup_export.xml):</h2>
    <asp:LinkButton runat="server" ID="ExportBtn" Text="Export all" OnClick="ExportBtn_click" /><br />
    <asp:LinkButton runat="server" ID="ExportDuplBtn" Text="Export duplicities" OnClick="ExportDuplBtn_click" />
    Duplicita znamená jeden zdroj s více překlady...<br />
    <asp:LinkButton runat="server" ID="ExportMultiBtn" Text="Export nepoužívaných lookup vet"
      OnClick="ExportMultiBtn_click" /><br />
    <asp:LinkButton runat="server" ID="SentenceNoLookupBtn" Text="Přeložené věty, které nejsou v Lookup, normalizované texty apod."
      OnClick="SentenceNoLookupBtn_click" />
    Musí být všude nuly, jinak PROBLEM na PZ.<br />
    <asp:LinkButton runat="server" ID="DumpAllBtn" Text="Hromadná kontrola všech projektů"
      OnClick="DumpAllBtn_click" />
    <br />
    <asp:Label runat="server" ID="NoLookupErrorLab" ForeColor="Red" />
    <br />
    <h2>
      Imports (from c:\temp\lookup_import.xml):</h2>
    <h3 style="color: Red" runat="server" id="errorTag">
    </h3>
    <asp:CheckBox runat="server" ID="ReplaceDuplChb" Checked="false" Text="Replace duplicities" />
    je-li zaškrtnut, při vložení položky se vymažou všechny k ní duplicitní. Není-li
    zaškrtnut, duplicitní položky se vypíší do lookup_export.xml.<br />
    <asp:LinkButton runat="server" ID="UploadBtn" Text="Upload" OnClick="UploadBtn_click" /><br />
    <p>
      Ostatní:<br />
      <asp:LinkButton runat="server" ID="OldToNew" OnClick="OldToNew_click" Text="OldToNew" />
      <br />
      <asp:LinkButton runat="server" ID="RepairSentNoLookupBtn" Text="Oprava 'veta neni v lookup'"
        OnClick="RepairSentNoLookupBtn_click" />
      <br />
      <asp:LinkButton runat="server" ID="DeleteLookupDuplicitesBtn" Text="Oprava lookupu a sentences (normalizace a hash)"
        OnClick="DeleteLookupDuplicitesBtn_click" />
    </p>
  </div>
  </form>
</body>
</html>
