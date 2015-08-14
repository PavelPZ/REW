<%@ Control Language="C#" ClassName="PageTransHome" %>
<vm:JsRenderScript runat="server" Name="home" IsRoot="true">
  <div data-bind="with: Pager.ActPage(), delegatedHandler: ['click']" class="home">
    <h1>Home</h1>
    <p>
      <a href="#pageModel">Page</a>
    </p>
  </div>
</vm:JsRenderScript>

