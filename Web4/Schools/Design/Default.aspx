<%@ Page Language="C#" EnableSessionState="False" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="web4.Schools.Design.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
  <style type="text/css">
    .check-boxes {
      display: -moz-inline-stack;
      display: inline-block;
      zoom: 1;
      *display: inline;
      margin-left: 10px;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <form id="form1" runat="server">
    <div>
     <%-- WEBs: <asp:CheckBoxList runat="server" ID="WebDeploy" RepeatDirection="Horizontal" CssClass="check-boxes" /><br />
      SCORMs: <asp:CheckBoxList runat="server" ID="ScormDeploy" RepeatDirection="Horizontal" CssClass="check-boxes" /><br />
      <asp:LinkButton runat="server" ID="DeployBtn" Text="Deploy" OnClick="DeployBtn_Click" /><br />--%>
      <br />
      <%--      <asp:LinkButton runat="server" Text="All Build" OnCommand="Build" CommandName="release" CommandArgument="@allBuild" />
      | 
      <asp:LinkButton runat="server" Text="All Deploy" OnCommand="Build" CommandName="release" CommandArgument="@allDeploy" />--%>
      <%--<h2>Software, Services</h2>
      <asp:LinkButton runat="server" Text="Build software & services" OnCommand="Build" CommandArgument="@software" />
      (Software, Services, ScormEx Net35 Services) - 
      <asp:LinkButton runat="server" Text="Deploy Software" OnCommand="Build" CommandArgument="rweb:Software" />
      - 
      <asp:LinkButton runat="server" Text="Deploy Services" OnCommand="Build" CommandArgument="rweb:Services" />
      - 
      <asp:LinkButton runat="server" Text="Deploy ScormEx Net35 Services" OnCommand="Build" CommandArgument="rweb:ScormExNet35Services" />
      <h2>SCORMS</h2>
      PCHelp CD Cargo:
      <asp:LinkButton runat="server" Text="Build Scorms" OnCommand="Build" CommandArgument="scorm:PCHelp_cdcargo" />
      -
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rscorm:PCHelp_cdcargo" />
      <br />
      CZU:
      <asp:LinkButton runat="server" Text="Build Scorms" OnCommand="Build" CommandArgument="scorm:Czu" />
      -
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rscorm:Czu" />
      <br />
      English_A1_Lesson3_cs_cz:
      <asp:LinkButton runat="server" Text="Build Scorms" OnCommand="Build" CommandArgument="scorm:English_A1_Lesson3_cs_cz" />
      - 
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rscorm:English_A1_Lesson3_cs_cz" />
      <br />
      English_A1_Lesson3_sk_sk:
      <asp:LinkButton runat="server" Text="Build Scorms" OnCommand="Build" CommandArgument="scorm:English_A1_Lesson3_sk_sk" />
      - 
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rscorm:English_A1_Lesson3_sk_sk" />
      <br />
      Moodle PC Help:
      <asp:LinkButton runat="server" Text="Build Scorms" OnCommand="Build" CommandArgument="scorm:MoodlePChelp" />
      - 
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rscorm:MoodlePChelp" />
      <br />
      SComp:
      <asp:LinkButton runat="server" Text="Build Scorms" OnCommand="Build" CommandArgument="scorm:SComp" />
      - 
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rscorm:SComp" />
      <h2>WEBS</h2>
      Edusoft: 
      <asp:LinkButton runat="server" Text="Build Software" OnCommand="Build" CommandArgument="web:Edusoft_Software" />
      - 
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rweb:Edusoft_Software" />
      | 
      <asp:LinkButton runat="server" Text="Build Data" OnCommand="Build" CommandArgument="web:EduSoft_Data" />
      - 
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rweb:Edusoft_Data" />
      <br />
      Release: 
      <asp:LinkButton runat="server" Text="Build Data" OnCommand="Build" CommandArgument="web:Release" />
      - 
      <asp:LinkButton runat="server" Text="Deploy" OnCommand="Build" CommandArgument="rweb:Release" />
        --%>
      <%--<h2>Build EA dat</h2>--%>
      <%--      <a href="http://www.langmaster.com/comcz/framework/lms/Statistic_CourseStructure.aspx">XML's from SiteMap... (EA*)</a><br />
      (Projde EA sitemaps a jejich lokalizace pro kurzy a gramatiky. Vysledek ulozi do q:\lmcom\LMCom\App_Data\Statistic_*.xml. Je potřeba EA kod, používající jen sitemaps a jejich resx lokalizace.)--%>
<%--      <asp:LinkButton ID="LinkButton1" runat="server" Text="ALL: Generate Courses structure, Generate Instructions, Exercise data from EA, Generate and localize ex. JSONs, Generate Grammar (from EA and localize)" OnClick="AllGenClick" /><br />
      <br />
      <asp:LinkButton ID="Button3" runat="server" Text="Generate Courses structure" OnClick="CoursesClick" /><br />
      Vysledek do d:\LMCom\rew\Web4\Schools\EACourses\. Používá q:\lmcom\LMCom\App_Data\Statistic_*.xml a Q:\lmcom\LMCom\App_Data\DictInfos.xml.<br />
      <asp:LinkButton ID="Button2" runat="server" Text="Generate Instructions" OnClick="InstructionsClick" /><br />
      Výsledek do q:\LMCom\rew\Web4\Schools\EAData\*instructions. Celé probíhá v Rew aplikaci s využitím Trados lokalizace (TradosLib.LocalizeXmlLow).<br />
      <asp:LinkButton ID="LinkButton17" runat="server" Text="Exercise data from EA" OnClick="DataFromEAClick" /><br />
      Vysledek do d:\LMCom\rew\Web4\RwEACourses\. Pouziva EduAuthorNew, EANew-DeployGenerator.aspx. Pouzito pro "Generate and localize Exercise JSONs" a pro "JavaScript get Words from courses"<br />
      <asp:LinkButton runat="server" Text="Generate and localize Exercise JSONs" OnClick="ExercisesClick" /><br />
      Vysledek do q:\LMCom\rew\Web4\Schools\EAData\. Provede generaci stránek se cvičeními (lokalizované části nahradí {{XXX}} závorkami) a sebere potřebné lokalizace.<br />
      <asp:LinkButton ID="Button1" runat="server" Text="Generate Grammar (from EA and localize)" OnClick="GrammarClick" /><br />--%>
      <%--<a href="grammar.aspx">Display Grammar</a><br />--%>
<%--      Vysledek do d:\LMCom\rew\Web4\Schools\EAGrammar\. Pouziva EduAuthorNew, EANew-DeployGenerator.aspx.--%>
      <%--<br />
      Obodba "Exercise data from EA" + "Generate and localize Exercise JSONs"<br />
      <asp:LinkButton ID="LinkButton21" runat="server" Text="New exercises: source for Lingea dict" OnClick="newDataForDict" /><br />
      Vysledek do d:\LMCom\rew\Web4\RwEACourses\. Pouzito pro "JavaScript get Words from courses"<br />
      <asp:LinkButton ID="LinkButton14" runat="server" Text="Dump data" OnClick="dumpData" /><br />
      <br />--%>
<%--      <h3>Lingea dict</h3>
      <a href="ExtractWords.aspx">Get Used words</a>
      <br />
      <asp:LinkButton ID="LinkButton5" runat="server" OnClick="CaptureLingea">Capture Lingea Words</asp:LinkButton><br />
      <asp:LinkButton ID="LinkButton4" runat="server" OnClick="LingeaSound">Capture Lingea Sound</asp:LinkButton><br />
      <asp:LinkButton ID="LinkButton11" runat="server" OnClick="LingeaToModules">Lingea words and sound to Modules</asp:LinkButton><br />
      <asp:LinkButton ID="LinkButton18" runat="server" OnClick="LingeaToGrafiaModules">Lingea words and sound to Grafia Modules</asp:LinkButton><br />
      <asp:HyperLink ID="LinkButton19" runat="server" NavigateUrl="tts.aspx">TST sound</asp:HyperLink><br />
      <asp:LinkButton ID="LinkButton12" runat="server" OnClick="AnalyzeAndNormalizeLingea">Analyze And Normalize Lingea to d:\LMCom\rew\Web4\RwDicts\analyse|normalize</asp:LinkButton><br />
      <br />--%>
      <h2>Merge server + klient log</h2>
      <asp:TextBox ID="MergeLogId" runat="server"/><asp:Button ID="MergeLogBtn" runat="server" Text="OK" OnClick="MergeLogBtn_Click" />
      <br />
      <h2>Other</h2>
      <asp:LinkButton ID="LinkButton15" runat="server" Text="CSharpToTypeScript" OnClick="CSharpToTypeScript" /><br />
      <%--<asp:LinkButton ID="LinkButton13" runat="server" Text="Minify" OnClick="Minify" />--%>
      |
      <%--<asp:LinkButton ID="LinkButton20" runat="server" Text="Debug Minify" OnClick="DebugMinify" /><br />--%>
      <asp:LinkButton runat="server" Text="Decode d:\temp\signature.sign to d:\temp\signature.zip" OnClick="DecodeSign" /><br />
      <br />
      <%--<asp:LinkButton runat="server" Text="BatchIncludes" OnClick="BatchIncludes" /><br />
      <asp:LinkButton ID="LinkButton12" runat="server" Text="CSharpToTypeScript" OnClick="CSharpToTypeScript" /><br />--%>
      <%-- <asp:LinkButton ID="LinkButton14" runat="server" Text="compileTypeScript" OnClick="compileTypeScript" /><br /> 
      <asp:LinkButton ID="LinkButton15" runat="server" Text="homePages" OnClick="homePages" /><br />--%>
      <h2>Rewise with Sound</h2>
      <asp:LinkButton ID="LinkButton6" runat="server" Text="Import Rewise do primárních dat" OnClick="primaryImport" /><br />
      Rewise slovnicky z q:\lmcom\Rw\Rewise\App_Data\rewise\ do q:\LMCom\rew\Web4\Schools\EARwBooks\<br />
      <asp:LinkButton ID="LinkButton10" runat="server" Text="Obohaceni primárních dat o nové lokalizace" OnClick="mergeLocalizations" /><br />
      Merge napr. q:\LMCom\rew\Web4\RwBooks\Texts\hue0.xml s obsahem q:\LMCom\rew\Web4\RwBooks\Texts\hue0\ adresare<br />
      <br />
      Příprava a kontrola zvuků v q:\LMCom\rew\SoundSources\<br />
      <asp:LinkButton ID="LinkButton2" runat="server" Text="Dir sound files to fileList.txt" OnClick="ListSoundFiles" />
      ||| 
      <asp:LinkButton ID="LinkButton7" runat="server" Text="Available sounds to words.xml" OnClick="CreateDirectory" />
      ||| 
      <asp:LinkButton ID="LinkButton8" runat="server" Text="Test oyvučení LM Rewise books (errors to missingSound.txt)" OnClick="MergeSounds" /><br />
      <br />
      <asp:LinkButton ID="LinkButton9" runat="server" Text="Přeložená a ozvučená rewise data pro JS aplikaci" OnClick="ExportJson" /><br />
      q:\LMCom\rew\Web4\Schools\EARewise adresar obsahuje pro každý jazyk: index (všechny rewise books), crs2RwMap (lekce pro LM kurzy), obsah lekcí<br />
      <br />
      <h3>Tests</h3>
      <%--<asp:LinkButton ID="LinkButton3" runat="server" OnClick="CreateMaps">Create Maps</asp:LinkButton><br />--%>
      <h3>Trados</h3>
      <asp:LinkButton ID="LinkButton16" runat="server" OnClick="RefreshTrados">Refresh Trados (do c:\Temp\trados.txt)</asp:LinkButton><br />
    </div>
  </form>
</body>
</html>
