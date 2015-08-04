<%@ Page Language="C#" MasterPageFile="~/Mobile.Master" %>

<asp:Content runat="server" ContentPlaceHolderID="Head">
  <script type="text/javascript" src="Code.ts"></script>
  <script type="text/javascript">
    ViewBase.Init(true, TestMobileApp.InitModel);
    ViewBase.Run();
  </script>
</asp:Content>

<asp:Content runat="server" ContentPlaceHolderID="Content">
  <div data-role="page" id="root">
    <div id="Div2" data-role="header">
      <a href="#" data-icon="delete" onclick="removeEvent()">Cancel</a>
      <h1>My Title</h1>
    </div>
    <div id="Div3" data-role="content">
      <div id="Div4" data-bind="template:rootTemplate"></div>
    </div>
    <div data-role="footer">
      <p>Footer</p>
    </div>
  </div>

  <script id="Script1" type="text/x-jsrender" data-for="TestMobileApp.Page1Model">
    {{for page1}}
    <p>
      {{jqm_collapsible Title="Title 1" Url="book,1" Collapsed="true"}} {{/jqm_collapsible}}
      {{jqm_collapsible Title="Title 2" Collapsed="true"}} <b>Bold</b> normal{{/jqm_collapsible}}
    </p>
    <ul data-role="listview" data-inset="true" data-filter="true" data-bind="with: page1, delegatedHandler: ['click']">
      <div data-role="collapsible" data-click="goToPage2" data-delegate-index='2' data-finish="fake-collapsible" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-r" data-iconpos="right" data-theme="c">
        <h3 id="header">My Title</h3>
        <p>My Body</p>
      </div>
      {{for cars}}
      <li><a href="#" data-click="goToPage2" data-delegate-index="{{:#index}}">{{:#data}}</a></li>
      {{/for}}
    </ul>
    {{/for}}
  </script>

  <script id="Script2" type="text/x-jsrender" data-for="TestMobileApp.Page2Model">
    {{for page2}}
    <div data-bind="with: page2, delegatedHandler: ['click']">
      <label for="slider-0">{{:title}}</label>
      <input type="range" name="slider" id="slider-0" value="25" min="0" max="100"  />
      <a href="#" data-role="button" data-icon="star" data-click="goToPage1">Star button</a>
    </div>
    {{/for}}
  </script>
</asp:Content>
