<%@ Page Language="C#" %>


<script runat="server">
  protected void Page_Load(object sender, EventArgs e) {
    Bundler.addToBundleTable("js", Packager.Consts.jsExternal, Packager.Consts.jsModel, Packager.Consts.jsSchool, Packager.Consts.jsCourse);
    Bundler.addToBundleTable("css", Packager.Consts.cssBootstrap);
  }
</script>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
  <%=System.Web.Optimization.Styles.Render("~/css") %>
  <%=System.Web.Optimization.Scripts.Render("~/js") %>
  <style type="text/css">
.onoffswitch {
    position: relative; width: 138px;
    -webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
}
.onoffswitch-checkbox {
    display: none;
}
.onoffswitch-label {
    display: block; overflow: hidden; cursor: pointer;
    border: 2px solid #999999; border-radius: 29px;
}
.onoffswitch-inner {
    width: 200%; margin-left: -100%;
    -moz-transition: margin 0.3s ease-in 0s; -webkit-transition: margin 0.3s ease-in 0s;
    -o-transition: margin 0.3s ease-in 0s; transition: margin 0.3s ease-in 0s;
}
.onoffswitch-inner:before, .onoffswitch-inner:after {
    float: left; width: 50%; height: 48px; padding: 0; line-height: 48px;
    font-size: 22px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;
    -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;
}
.onoffswitch-inner:before {
    content: "TRUE";
    padding-left: 9px;
    background-color: #2FCCFF; color: #FFFFFF;
}
.onoffswitch-inner:after {
    content: "FALSE";
    padding-right: 9px;
    background-color: #EEEEEE; color: #999999;
    text-align: right;
}
.onoffswitch-switch {
    width: 42px; margin: 3px;
    background: #FFFFFF;
    border: 2px solid #999999; border-radius: 29px;
    position: absolute; top: 0; bottom: 0; right: 86px;
    -moz-transition: all 0.3s ease-in 0s; -webkit-transition: all 0.3s ease-in 0s;
    -o-transition: all 0.3s ease-in 0s; transition: all 0.3s ease-in 0s; 
}
.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
    margin-left: 0;
}
.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
    right: 0px; 
}
  </style>
</head>
<body>
  <div style="margin-left: 100px">
    <div class="onoffswitch">
    <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked />
    <label class="onoffswitch-label" for="myonoffswitch">
        <div class="onoffswitch-inner"></div>
        <div class="onoffswitch-switch"></div>
    </label>
</div>
  </div>
</body>
</html>
