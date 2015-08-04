<%@ Page Language="C#" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>ko.mustache.js example</title>
  <%=System.Web.Optimization.Styles.Render("~/csslib", "~/css") %>
  <%=System.Web.Optimization.Scripts.Render("~/jslib", "~/js") %>
</head>
<body>
  <input type="radio" name="choices" value="summary" data-bind="checked: selectedView" />Summary
  <input type="radio" name="choices" value="details" data-bind="checked: selectedView" />Details
  <hr />

  <div data-bind="template: { name: templateToUse, foreach: articles }, delegatedHandler: ['click']"></div>
  <div data-bind="template: templateName"></div>

  <script id="summary" type="text/html">
    <div>{{:title}}</div>
  </script>

  <script id="details" type="text/html">
    <div>
      <h2>{{:title}}</h2>
      <p>{{:content}}</p>
      <button data-click="doSelectArticle">Edit</button>
    </div>
  </script>

  <script id="edit" type="text/html">
    <div>
      <input data-bind="value: title" /><br />
      <input data-bind="value: content" />
    </div>
  </script>

  <script id="temp1" type="text/html">
    <div>
      <h2 data-bind="text:selectedView"></h2>
      <p>temp1</p>
    </div>
  </script>

  <script id="temp2" type="text/html">
    <div>
      <h2 data-bind="text:selectedView"></h2>
      <p>temp2</p>
    </div>
  </script>

  <script type="text/javascript">
    var viewModel = {
      articles: [{
        id: 1,
        title: "Article One",
        content: "Content for article one."
      },
      {
        id: 2,
        title: "Article Two",
        content: "Content for article two."
      },
      {
        id: 3,
        title: "Article Three",
        content: "Content for article three."
      }
      ],
      selectedView: ko.observable("summary"),
      selectedArticle: ko.observable(),
      doSelectArticle: function (data) {
        this.selectedArticle(data);
      },
      templateName: ko.observable('temp1'),
    };

    viewModel.templateToUse = function (item) {
      return item === this.selectedArticle() ? 'edit' : this.selectedView();
    }.bind(viewModel);
    viewModel.selectedView.subscribe(function (newValue) {
      if (newValue == 'summary') viewModel.selectedArticle(null);
      if (viewModel.templateName() == 'temp1') viewModel.templateName('temp2'); else viewModel.templateName('temp1');
    });

    ko.applyBindings(viewModel);
  </script>
 
</body>
</html>
