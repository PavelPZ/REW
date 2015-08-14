<%@ Page Title="" Language="C#" MasterPageFile="~/BS.Master" %>

<script runat="server">
  //static string[] models = new string[] {"Book", "Lesson", "Fact" };
  static string[] models = new string[] { "Home", "SelectLang", "Vocab" };

  protected void Page_Load(object sender, EventArgs e) {
    foreach (var ctrl in models.SelectMany(m => scriptControls(m))) ScriptsPlace.Controls.Add(ctrl);
  }
  IEnumerable<Control> scriptControls(string name) {
    yield return Page.LoadControl(string.Format(c_ScriptCtrl, name));
  }
  const string c_ScriptCtrl = "~/Rewise/{0}BS.ascx";
</script>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
  <%=System.Web.Optimization.Scripts.Render("~/jsRewise") %>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">
  <div class="content" id="root" >
    <div data-bind="template:rootTemplate"></div>
    <vm:JsRenderScript ID="dummy" runat="server" Name="Dummy" IsRoot="true"/>
    <asp:PlaceHolder runat="server" ID="ScriptsPlace" />
  </div>
  <script type="text/javascript">
    //RwPersist = RwPersistLocal;
    Rewise.InitModel({ loc: LMComLib.LineIds.English }, ViewBase.initBootStrapApp);
  </script>
</asp:Content>
