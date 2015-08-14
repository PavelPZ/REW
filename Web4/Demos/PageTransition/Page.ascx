<%@ Control Language="C#" ClassName="PageTransPage" %>
<vm:JsRenderScript runat="server" Name="page" IsRoot="true">
  <div data-bind="with: Pager.ActPage(), delegatedHandler: ['click']" class="home">
    <h1>Page</h1>
    <p>
      <a href="#homeModel">Home</a>
    </p>
  </div>
</vm:JsRenderScript>

