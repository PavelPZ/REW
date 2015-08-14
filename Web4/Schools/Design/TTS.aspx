<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="TTS.aspx.cs" Inherits="web4.Schools.Design.TTS" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
    <div>
      <asp:DropDownList ID="LangCmb" runat="server" /><br />
      <asp:Button runat="server" ID="generateRecordingRequestBtn" Text="Generate Recording Request" OnClick="generateRecordingRequestBtn_Click" /><br />
      <asp:Button runat="server" ID="acceptRecording" Text="Accept Recording" OnClick="acceptRecording_Click" /><br />
    </div>
  </form>
</body>
</html>
