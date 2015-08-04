<%@ Page Language="C#" MasterPageFile="~/BS.Master" %>

<script runat="server">
  static string[] models = new string[] { "Home", "Page"};
  string courseTree;

  protected void Page_Load(object sender, EventArgs e) {
    foreach (var ctrl in models.SelectMany(m => scriptControls(m))) ScriptsPlace.Controls.Add(ctrl);
  }
  IEnumerable<Control> scriptControls(string name) {
    yield return Page.LoadControl(string.Format(c_ScriptCtrl, name));
  }
  const string c_ScriptCtrl = "~/Demos/PageTransition/{0}.ascx";
</script>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
  <script type="text/javascript" src="Model.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">
  <div class="container-fluid">
    <div id="root" data-bind="template:rootTemplate"></div>
  </div>
  <vm:JsRenderScript ID="dummy" runat="server" Name="Dummy" IsRoot="true">
  </vm:JsRenderScript>
  <asp:PlaceHolder runat="server" ID="ScriptsPlace" />
  <script type="text/javascript">
    PageTrans.InitModel (ViewBase.initBootStrapApp);
  </script>
</asp:Content>
