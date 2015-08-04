<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="EditPage.ascx.cs" Inherits="web4.Trados.EditPage1" %>

<asp:HiddenField runat="server" ID="RefererFld" />
<h2>
  <%=page.FileName %></h2>
<asp:Label runat="server" ID="ErrorLab" ForeColor="Red" />
<div>
  <a href="<%=LMComLib.TradosLib.dataPath(page.SeeUrl, (LMComLib.Langs) firstSent.SrcLang, (LMComLib.LocPageGroup) page.PageGroup)%>">
    Source page</a> <a href="<%=LMComLib.TradosLib.dataPath(page.SeeUrl, (LMComLib.Langs) firstSent.TransLang, (LMComLib.LocPageGroup) page.PageGroup)%>">
      Translated page</a>
</div>
<asp:Repeater runat="server" ID="SentenceRep">
  <ItemTemplate>
    <asp:Panel runat="server" ID="SentencePanel" ToolTip='<%#Eval("Id") %>'>
      <div>
        Id:<b><%#Eval("Id") %></b> Name:<%#Eval("Name") %>
        FromId:<%#Eval("newSrcId")%>
        Status:<span class="old-source"><%#Eval("ActCmd")%></span> Old source: <span class="old-source">
          <%#Eval("OldSrcText")%></span><br />
        <asp:HiddenField runat="server" ID="OldSrcText" Value='<%#Eval("OldSrcText")%>' />
      </div>
      <div class="new-source">
        <%#Eval("NewSrcText")%>
        <asp:HiddenField runat="server" ID="NewSrcText" Value='<%#Eval("NewSrcText")%>' />
      </div>
      <asp:TextBox ID="TransText" runat="server" TextMode="MultiLine" Width="100%" Rows="3"
        Text='<%#Eval("TransText") %>' />
      <asp:CheckBox ID="Translated" runat="server" Text="Marked?" /><br />
      ==================================================================================<br />
      <br />
    </asp:Panel>
  </ItemTemplate>
</asp:Repeater>
<asp:Button runat="server" ID="OKBtn" Text="Save marked only" OnClick="OKBtn_Click" />
<asp:Button runat="server" ID="OKAllBtn" Text="Save ALL" OnClick="OKAllBtn_Click" />
<asp:Button runat="server" ID="CancelBtn" Text="Cancel" OnClick="CancelBtn_Click" />
