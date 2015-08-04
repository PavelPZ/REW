<%@ Page Language="C#" EnableSessionState="False" AutoEventWireup="true" CodeBehind="DefaultDict.aspx.cs" Inherits="web4.Schools.Design.DefaultDict" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
    <div>
      <h2>Dicts to Course</h2>
      <asp:LinkButton ID="LinkButton11" runat="server" OnClick="DictForCourses">Words and sound to course modules</asp:LinkButton><br />
      <a href="ExtractWords.aspx">Extract words from Courses</a><br />
      <h2>Ultralingua</h2>
      <asp:LinkButton ID="FinishBtn" runat="server" OnClick="FinishBtn_Click">Dict from Capture: d:\LMCom\rew\Web4\RwDicts\Sources\Ultralingua.back\dict_X_Y.xml from X_Y_c.xml</asp:LinkButton><br />
      <asp:LinkButton ID="LinkButton4" runat="server" OnClick="WordFormsBtn_Click">Word Forms: d:\LMCom\rew\Web4\RwDicts\Forms\ling_forms_X.xml, forms_X.xml</asp:LinkButton><br />
      <asp:LinkButton ID="MakeWordListBtn" runat="server" OnClick="MakeWordListBtn_Click">Word Lists pro jazyku (misto rustiny je portugalstina), do d:\LMCom\rew\Web4\RwDicts\Sources\Ultralingua.back\design\WordsStems_X.txt</asp:LinkButton><br />
      <h2>Wiktionary</h2>
      <asp:LinkButton ID="LinkButton5" runat="server" OnClick="Wiki_ExtractTexts">Extract Texts</asp:LinkButton><br />
      <h2>Lingea</h2>
      <h4>Old to New Lingea format</h4>
      d:\LMCom\rew\Web4\RwDicts\Sources\: LingeaOld.back=>LingeaOld, navic vznikne \LingeaOld\design\entriesInfo.xml<br />
      <asp:LinkButton ID="LinkButton2" runat="server" OnClick="OldToNew1">Old To New 1</asp:LinkButton><br />
      <asp:LinkButton ID="LinkButton1" runat="server" OnClick="OldToNew2">Old To New 2</asp:LinkButton><br />
      <asp:LinkButton ID="LinkButton3" runat="server" OnClick="OldToNew3">Old To New 3</asp:LinkButton><br />
      <h4>Rucni zatrideni Lingea slovicek do jazyku</h4>
      <a href="DictLingea.aspx">Run</a>
    </div>
  </form>
</body>
</html>
