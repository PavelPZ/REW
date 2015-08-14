<%@ Page Language="C#" MasterPageFile="~/Desktop.Master" %>

<asp:Content ID="Content1" runat="server" ContentPlaceHolderID="Head">
  <link rel="Stylesheet" href="http://learn.knockoutjs.com/Content/App/coderunner.css" />
  <link rel="Stylesheet" href="http://learn.knockoutjs.com/Content/TutorialSpecific/webmail.css" />
  <script type="text/javascript" src="Code.ts"></script>
  <script type="text/javascript">
    ViewBase.Init(false, SinglePageApp2.InitModel);
    ViewBase.Run();
  </script>
</asp:Content>

<asp:Content ID="Content2" runat="server" ContentPlaceHolderID="Content">
  <div id="root" data-bind="template:rootTemplate"></div>

  <script id="tEmail_root" type="text/x-jsrender" data-for="SinglePageApp2.RootModel">
    <div data-bind="delegatedHandler: ['click']">
      <ul class="folders">
        {{for folders}}
            <li data-bind="with: folders[{{:#index}}], css: { selected: actFolder() == '{{:#data}}'}" data-click="goToFolder" data-delegate-index="{{:#index}}">{{:#data}}</li>
        {{/for}}
      </ul>
      <div data-bind="template:subTemplate"></div>
    </div>
  </script>

  <script id="tEmail_folder" type="text/x-jsrender" data-for="SinglePageApp2.folderView">
    {{for folderVM}}
      <table class="mails" data-bind="with: folderVM, delegatedHandler: ['click']">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Subject</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {{for emails}}
          <tr data-bind="with: emails[{{:#index}}]" data-click="goToMail" data-delegate-index="{{:#index}}">
            <td data-bind="text: from"></td>
            <td>{{:to}}</td>
            <td>{{:subject}}</td>
            <td>{{:date}}</td>
          </tr>
          {{/for}}
        </tbody>
      </table>
    {{/for}}
  </script>

  <script id="tEmail_mailid" type="text/x-jsrender" data-for="SinglePageApp2.emailView">
    {{for emailVM.email}}
      <div class="viewMail" data-bind="with: emailVM.email">
        <div class="mailInfo">
          <h1>{{:subject}}</h1>
          <p>
            <label>From</label>: <span data-bind="text: from"></span>
          </p>
          <p>
            <label>To</label>: <span>{{:to}}</span>
          </p>
          <p>
            <label>Date</label>: <span>{{:date}}</span>
          </p>
        </div>
        <p class="message">{{:messageContent}}</p>
      </div>
    {{/for}}
  </script>
</asp:Content>