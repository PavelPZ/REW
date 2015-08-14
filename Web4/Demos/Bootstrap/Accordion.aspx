<%@ Page Title="" Language="C#" %>

<!DOCTYPE html>

<html>
<head id="Head1" runat="server">
  <title>My Page</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <%=System.Web.Optimization.Styles.Render("~/Bootstrap/less/Bootstrap.less","~/Bootstrap/less/responsive.less","~/Bootstrap/css/bootstrap.icon-large.css","~/Bootstrap/lm/style.less")%>
  <%=System.Web.Optimization.Scripts.Render(
  "~/Scripts/jquery-1.8.3.js",
  "~/Scripts/knockout-2.2.0.debug.js",
  "~/Scripts/jsRender.js",
  "~/Bootstrap/js/bootstrap.js",
  "~/Scripts/underscore.js",
  "~/Bootstrap/lm/accordion.ts",
  "~/JS/Utils.ts"
    )
  %>
  <style type="text/css">
    .accordion-group
    {
      border-radius: 12px;
      background-color: yellow;
    }
    .accordion-body
    {
      background-color: white;
    }

    .blue
    {
      background-color: blue;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>xxx</h1>
    <!--Accordion: http://jsfiddle.net/D2RLR/251/-->
    <script type="text/javascript">
      //********* MODEL
      var body = 'asdf asd fa sdf asd f asd fas df asd fa sdfasd f as df asd fa sdf asd f as df asd f asd fa sdf as df asd fa sdf as df asd fas df asdasdf asd fa sdf asd f asd fas df asd fa sdfasd f as df asd fa sdf asd f as df asd f asd fa sdf as df asd fa sdf as df asd fas df asdasdf asd fa sdf asd f asd fas df asd fa sdfasd f as df asd fa sdf asd f as df asd f asd fa sdf as df asd fa sdf as df asd fas df asd';
      var myViewModel = {
        items: [{ multi: true, id: 1, title: 'Collapsible Group Item #1', body: body }, { multi: false }, { multi: true, id: 3, title: 'Collapsible Group Item #2', body: body }, { multi: true, id: 5, title: 'Collapsible Group Item #2', body: body }],
        idx: ko.observable(3),
      };
      myViewModel.idx.subscribe(function (val) { $('#selIdx').html(val ? val.toString() : 'undefined'); });

      //********* JsRender a knockout
      $(function () {
        var html = $.templates('#accordion').render(myViewModel);
        $("#rendered").html(html);
        ko.applyBindings(myViewModel);
      });
    </script>
    <script id='accordion' type='text/x-jsrender'>
    {{accordion Bind='idx'}}
      {{for items}}
        {{if multi}}
          {{acc_item Id=id}}
            {{acc_header}}
              {{:title}}
            {{/acc_header}}
            {{acc_content}}
              {{:body}}
            {{/acc_content}}
          {{/acc_item}}
        {{else}}
          <h1>Text</h1>
        {{/if}}
      {{/for}}
    {{/accordion}}
    </script>
    <div id="rendered"></div>
    <div class="btn-group">
      <button class="btn" onclick="myViewModel.idx(myViewModel.items[0].id);">1</button>
      <button class="btn" onclick="myViewModel.idx(myViewModel.items[1].id);">2</button>
      <button class="btn" onclick="myViewModel.idx(myViewModel.items[2].id);">3</button>
      <button class="btn" onclick="myViewModel.idx(undefined);">undefined</button>
    </div>
    <p>Selected: <span id="selIdx"></span></p>
    <div class='accordion' id='acc_1'>



      <div class='accordion-group'>
        <div class="accordion-heading">
          <div class="row-fluid">
            <div class="span10 ">
              <a class="accordion-toggle h3" data-toggle="collapse" data-parent="#acc_1" data-target="#acci_"><i class="icon-large icon-down-arrow"></i>
                Cambridge
              </a>
            </div>
            <div class="span2 ">
              <button type="button" class="btn btn-block"><i class="icon-large icon-bin"></i></button>
            </div>
          </div>
        </div>
        <div id="acci_" class="accordion-body collapse" data-id="">
          <div class="accordion-inner">
            <blockquote>
              <button href='#' class="btn btn-block ">
                Cambridge Course 1
              </button>

              <button href='#' class="btn btn-block ">
                Cambridge Course 2
              </button>

              <button href='#' class="btn btn-block ">
                Cambridge Course 3
              </button>
            </blockquote>
          </div>
        </div>
      </div>
    </div>


  </div>
</body>
</html>

