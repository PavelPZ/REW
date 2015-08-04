<%@ Page Language="C#" AutoEventWireup="true" EnableViewState="true" EnableSessionState="True" CodeBehind="LANGMasterAuthor.aspx.cs" Inherits="web4.Schools.Design.LANGMasterAuthor" ValidateRequest="false" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
  <style type="text/css">
    *, body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 14px;
    }

    .small {
      font-size: 12px;
    }

    .left-block {
      width: 240px;
      position: absolute;
      left: 10px;
    }

    .left-lab {
      width: 200px;
      position: absolute;
      left: 5px;
      margin-top: -20px;
    }

    /**** LEFT PANEL TOPS */

    .projectsCmb {
      top: 30px;
    }

    #editProjectPlace {
      top: 50px;
    }

    .search-panel {
      top: 90px;
      left: 0px;
    }

    .courseCmb {
      top: 0px;
    }

    .criteriumCmb {
      top: 10px;
    }

    .critValueCmb {
      top: 55px;
    }

    #editCoursePlace {
      top: 25px;
    }

    .lessonCmb {
      top: 90px;
    }

    .moduleCmb {
      top: 135px;
    }

    #editModulePlace {
      top: 160px;
    }

    .pagesLb {
      top: 210px;
      height: 320px;
    }

    #editPagePlace {
      top: 535px;
    }

    #other {
      top: 595px;
    }

    /**** RIGHT PANEL */

    .frame-place {
      position: absolute;
      left: 260px;
      top: 0px;
      width: 800px;
      height: 800px;
    }

    #errorEx {
      color: red;
      font-weight: bold;
      padding: 40px;
    }

    input[type=text], textarea {
      font-family: "Lucida Console",Monaco5,monospace;
    }
  </style>
</head>
<body>
  <script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
  <form id="form" runat="server">
    <asp:Label ID="Label5" runat="server" Text="Projects:" Font-Bold="true" CssClass="left-lab projectsCmb" />
    <div class="left-block projectsCmb">
      <asp:DropDownList ID="ProjectsCmb" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ProjectsCmb_SelectedIndexChanged" Style="width: 150px; margin-right: 8px;" />
      <asp:CheckBox ID="SearchCourseChb" runat="server" Text="Search" CssClass="projectsCmb" AutoPostBack="True" Font-Bold="true" OnCheckedChanged="searchCb_CheckedChanged" /><br />
      <asp:LinkButton ID="BuildProjectBtn" runat="server" Text="Build project" OnClick="BuildProjectBtn_Click" CssClass="small" />
    </div>
    <div runat="server" id="NotSearchPlace" class="left-block search-panel">
      <asp:Label ID="Label1" runat="server" Text="Course:" Font-Bold="true" CssClass="left-lab courseCmb" />
      <asp:DropDownList ID="CoursesCmb" runat="server" AutoPostBack="True" OnSelectedIndexChanged="CoursesCmb_SelectedIndexChanged" CssClass="left-block courseCmb" />
      <div id="editCoursePlace" class="left-block">
        <asp:Button ID="BuildCourseBtn" runat="server" Text="Build course" Style="margin-right: 20px;" OnClick="BuildCourseBtn_Click" />
        <div class="small">
        <asp:LinkButton ID="TtsExportBtn" runat="server" Text="Export for TTS" OnClick="TtsExportBtn_Click" CssClass="small" />
          <%--
          Course TTS:
          &gt; run TTS &gt;
        <asp:LinkButton ID="TtsEndBtn" runat="server" Text="End" OnClick="TtsEndBtn_Click" CssClass="small" />
          (<asp:CheckBox ID="TtsAllChb" runat="server" Text="all" CssClass="small" />)--%>
        </div>
      </div>
      <asp:Label ID="Label2" runat="server" Text="Lesson:" Font-Bold="true" CssClass="left-lab lessonCmb"></asp:Label>
      <asp:DropDownList ID="LessonsCmb" runat="server" AutoPostBack="True" OnSelectedIndexChanged="LessonsCmb_SelectedIndexChanged" CssClass="left-block lessonCmb" />
      <asp:Label ID="Label3" runat="server" Text="Module:" Font-Bold="true" CssClass="left-lab moduleCmb"></asp:Label>
      <asp:DropDownList ID="ModulesCmb" runat="server" CssClass="left-block moduleCmb" AutoPostBack="True" OnSelectedIndexChanged="ModulesCmb_SelectedIndexChanged" />
      <div id="editModulePlace" class="left-block">
        <asp:Button ID="BuildModuleBtn" runat="server" Text="Build module" OnClick="BuildModuleBtn_Click" Style="margin-right: 0px;" />
      </div>
      <asp:Label ID="Label4" runat="server" Text="Pages:" Font-Bold="true" CssClass="pagesLb left-lab"></asp:Label>
      <asp:ListBox ID="PagesLb" runat="server" CssClass="left-block pagesLb" AutoPostBack="True" OnSelectedIndexChanged="PagesLb_SelectedIndexChanged"></asp:ListBox>
      <div id="editPagePlace" class="left-block">
        <asp:CheckBox ID="editModeCb" runat="server" Text="Edit mode" AutoPostBack="True" Font-Bold="true" OnCheckedChanged="editModeCb_CheckedChanged" Style="margin-right: 10px;" /><br />
        <div style="padding-top: 5px" class="small">
          Templ:
          <asp:DropDownList ID="TemplateIdCmb" Width="175px" runat="server" />
          <asp:LinkButton ID="ChangeTemplateBtn" runat="server" Text="OK" OnClick="ChangeTemplateBtn_Click" CssClass="small" OnClientClick="return confirmReset('Confirm reset exercise')" />
        </div>
        <div style="padding-top: 5px" class="small">
          Clipboard:
          <asp:LinkButton ID="expandMacros" runat="server" Text="Expand macro" OnClick="expandMacros_Click" CssClass="small" Style="padding-right: 5px;" />
          <asp:LinkButton ID="urlToClipboard" runat="server" Text="Url" OnClick="url_Click" CssClass="small" />
          <asp:HiddenField runat="server" ID="ClipboardPlace" />
        </div>
      </div>
      <div class="left-block" id="other">
        <hr />
        <div class="small" style="color: lightgray">
          Dangerous actions, don't use it:<br />
          Course:&nbsp;<asp:LinkButton ID="metaFromExs" runat="server" Text="Meta.xml from ex's" OnClick="metaFromExs_Click" ForeColor="LightBlue" CssClass="small" OnClientClick="return confirmReset()" /><br />
          Module:&nbsp;<asp:LinkButton ID="resetModuleBtn" runat="server" Text="Reset" OnClick="resetModuleBtn_Click" ForeColor="LightBlue" CssClass="small" OnClientClick="return confirmReset()" />
        </div>
        <div class="small" runat="server" id="globalError" style="color: red"></div>
      </div>

    </div>
    <div runat="server" id="SearchPlace" class="left-block search-panel">
      <asp:Label ID="Label6" runat="server" Text="Criterium type:" CssClass="left-lab criteriumCmb"></asp:Label>
      <asp:DropDownList ID="CriteriumCmb" CssClass="left-block criteriumCmb" runat="server" AutoPostBack="True" OnSelectedIndexChanged="CriteriumCmb_SelectedIndexChanged" />
      <asp:Label ID="CritValueLab" runat="server" Text="Criterium Value:" CssClass="left-lab critValueCmb"></asp:Label>
      <asp:DropDownList ID="CritTemplateIdCmb" CssClass="left-block critValueCmb" runat="server" />
      <asp:TextBox runat="server" ID="CritTextBox" CssClass="left-block critValueCmb" TextMode="SingleLine" Columns="30" Rows="1" />
      <div style="top: 90px;" class="left-block">
        <asp:Button ID="CritSearchBtn" runat="server" Text="Show search result" OnClick="CritSearchBtn_Click" OnClientClick="openNewWin();" />
      </div>
    </div>

    <iframe runat="server" id="exerciseFrame" class="frame-place"></iframe>
    <div runat="server" id="errorEx" class="frame-place"></div>
    <div runat="server" id="editPlace" class="frame-place">
      <asp:TextBox runat="server" ID="editData" TextMode="MultiLine" Width="100%" Rows="30" Wrap="False" Font-Size="Larger" Style="padding: 10px; margin-bottom: 5px;" />
      Title:&nbsp;<asp:TextBox runat="server" ID="editTitle" TextMode="SingleLine" Columns="80" Rows="1" Style="margin-bottom: 5px; margin-right: 11px;" />
      See&nbsp;Also:&nbsp;<asp:TextBox runat="server" ID="editSeeAlso" TextMode="SingleLine" Columns="30" Rows="1" Style="margin-bottom: 5px;" />
      <br />
      Instr:&nbsp;<asp:TextBox runat="server" ID="editInstr" TextMode="SingleLine" Columns="80" Rows="1" Style="margin-bottom: 5px;" />
      Tech.&nbsp;instr:&nbsp;<asp:TextBox runat="server" ID="editTechInstr" TextMode="SingleLine" Columns="30" Rows="1" Style="margin-bottom: 5px;" />
      <br />
      <asp:Button ID="SaveBtn" runat="server" Text="Save" OnClick="SaveBtn_Click" />
      <asp:Button ID="SaveViewBtn" runat="server" Text="Save &amp; build &amp; view" OnClick="SaveViewBtn_Click" />
      <asp:CheckBox ID="todoChb" runat="server" Text="ToDo" Style="margin-left: 40px; margin-right: 10px;" />
      <asp:LinkButton ID="MakeNotSimpleBtn" runat="server" Text="Details..." OnClick="MakeNotSimpleBtn_Click" />
    </div>
    <script type="text/javascript">
      function onWinResize() {
        var place = $('#exerciseFrame, #errorEx, #editPlace'); var editData = $("#editData");
        var w = $(window).innerWidth(); var h = $(window).innerHeight();
        place.width(w - 285); place.height(h - 10); editData.height(h - 170);
      }
      $(window).resize(onWinResize);
      $(onWinResize);

      //clipboard
      function toClipboard() {
        var hidden = $('#ClipboardPlace');
        var s = hidden.val(); hidden.val(null);
        if (s != null && s != '') window.clipboardData.setData("Text", s);
      }
      $(toClipboard);

      //
      function confirmReset(msg) {
        msg = msg ? msg : 'Confirm';
        return confirm(msg);
      }

      //open in new window hack
      function openNewWin() { $('form').attr('target', '_blank'); setTimeout(resetFormTarget, 500); }
      function resetFormTarget() { $('form').attr('target', ''); }
    </script>
  </form>
</body>
</html>
