<%@ Page Language="C#" %>


<script runat="server">
  protected void Page_Load(object sender, EventArgs e) {
    Bundler.addToBundleTable("js", Packager.Consts.jsExternal, Packager.Consts.jsModel, Packager.Consts.jsEA, Packager.Consts.jsSchool, Packager.Consts.jsCourse);
    Bundler.addToBundleTable("css", Packager.Consts.cssBootstrap, Packager.Consts.cssSchool);
    Bundler.addToBundleTable("cssIE7", Packager.Consts.cssBootstrapIE7);
  }
</script>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
  <title></title>
  <%=System.Web.Optimization.Styles.Render("~/css") %>
  <!--[if IE 7]>
  <%=System.Web.Optimization.Styles.Render("~/cssIE7") %>
  <![endif]-->
  <%=System.Web.Optimization.Scripts.Render("~/js") %>
  <script type="text/javascript">
  </script>
</head>
<body>
  <a href="#" id="drop3" role="button" class="dropdown-toggle" data-toggle="dropdown">Dropdown 3 <b class="caret"></b></a>
  <ul class="dropdown-menu" role="menu" aria-labelledby="drop3">
    <li role="presentation"><a role="menuitem" tabindex="-1" href="http://twitter.com/fat">Action</a></li>
    <li role="presentation"><a role="menuitem" tabindex="-1" href="http://twitter.com/fat">Another action</a></li>
    <li role="presentation"><a role="menuitem" tabindex="-1" href="http://twitter.com/fat">Something else here</a></li>
    <li role="presentation" class="divider"></li>
    <li role="presentation"><a role="menuitem" tabindex="-1" href="http://twitter.com/fat">Separated link</a></li>
  </ul>

</body>
</html>
