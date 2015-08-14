<%@ Page Language="C#" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
  <%=System.Web.Optimization.Styles.Render("~/csslib", "~/css") %>
  <%=System.Web.Optimization.Scripts.Render("~/jslib", "~/js") %>
  <link rel="Stylesheet" href="style.less" />
  <script type="text/javascript" src="Code.ts"></script>
</head>
<body>
  <form id="form1" runat="server">
    <div>
      Hallo
    </div>
  </form>
</body>
</html>
