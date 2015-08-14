<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="EditPage.aspx.cs" Inherits="web4.Trados.EditPage" %>

<%@ Register Src="EditPage.ascx" TagName="EditPage" TagPrefix="lm" %>
<%@ Register Src="TopBar.ascx" TagName="TopBar" TagPrefix="lm" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
  <title></title>
  <style type="text/css">
    .new-source
    {
      font-weight: bold;
    }
    .old-source
    {
      font-style: italic;
    }
  </style>
</head>
<body>
  <form id="form1" runat="server">
  <div>
    <lm:TopBar ID="TopBar1" runat="server" />
    <lm:EditPage runat="server" />
  </div>
  </form>
</body>
</html>
