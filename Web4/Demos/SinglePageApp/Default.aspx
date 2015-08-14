<%@ Page Language="C#" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
  <link rel="Stylesheet" href="http://learn.knockoutjs.com/Content/App/coderunner.css" />
  <link rel="Stylesheet" href="http://learn.knockoutjs.com/Content/TutorialSpecific/webmail.css" />
  <%=System.Web.Optimization.Styles.Render("~/csslib", "~/css") %>
  <%=System.Web.Optimization.Scripts.Render("~/jslib", "~/js") %>
</head>
<body>
  <div id="appcontent2" data-bind="template:'tEmail_root'"></div>

  <script id="tEmail_root" type="text/x-jsrender">
    <div data-bind="delegatedHandler: ['click', 'mouseover', 'mouseout']">
      <ul class="folders">
        {{for folders}}
            <li data-bind="css: { selected: $data.actFolder() == '{{:#data}}'}" data-click="goToFolder" data-click-data="{{:#data}}">{{:#data}}</li>
        {{/for}}
      </ul>
      <div data-bind="template:templateName"></div>
    </div>
  </script>

  <script id="tEmail_folder" type="text/x-jsrender">
    <table class="mails" data-bind="with: folderModel">
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Subject</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {{for mails}}
        <tr data-mouseover="showMessage" data-mouseout="clearMessage" data-click="goToMail">
          <td>{{:from}}</td>
          <td>{{:to}}</td>
          <td>{{:subject}}</td>
          <td>{{:date}}</td>
        </tr>
        {{/for}}
      </tbody>
    </table>
  </script>

  <script id="tEmail_mailid" type="text/x-jsrender">
    <div class="viewMail" data-bind="with: emailModel">
      <div class="mailInfo">
        <h1>{{:subject}}</h1>
        <p>
          <label>From</label>: <span>{{:from}}</span>
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
  </script>

  <%-- 
  <div id="appcontent" data-bind="delegatedHandler: ['click', 'mouseover', 'mouseout']">
    <!-- Folders -->
    <ul class="folders" data-bind="foreach: folders">
      <li data-bind="text: $data, css: { selected: $data == $root.chosenFolderId()}" data-click="goToFolder"></li>
    </ul>

    <!-- Mails grid -->
    <table class="mails" data-bind="with: chosenFolderData">
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Subject</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody data-bind="foreach: mails">
        <tr data-mouseover="showMessage" data-mouseout="clearMessage" data-click="goToMail">
          <td data-bind="text: from"></td>
          <td data-bind="text: to"></td>
          <td data-bind="text: subject"></td>
          <td data-bind="text: date"></td>
        </tr>
      </tbody>
    </table>

    <!-- Chosen mail -->
    <div class="viewMail" data-bind="with: chosenMailData">
      <div class="mailInfo">
        <h1 data-bind="text: subject"></h1>
        <p>
          <label>From</label>: <span data-bind="text: from"></span>
        </p>
        <p>
          <label>To</label>: <span data-bind="text: to"></span>
        </p>
        <p>
          <label>Date</label>: <span data-bind="text: date"></span>
        </p>
      </div>
      <p class="message" data-bind="html: messageContent" />
    </div>
  </div>
    --%>
  <div id="logging">
    <h2>Logging</h2>
    <div>
      <div class="alert" data-bind="text: message, visible: message"></div>
    </div>
  </div>
  <script type="text/javascript" src="Code.ts"></script>
</body>
</html>
