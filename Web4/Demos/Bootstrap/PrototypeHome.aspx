<%@ Page Title="" Language="C#" %>

<!DOCTYPE html>

<html>
<head id="Head1" runat="server">
  <title>My Page</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <%=System.Web.Optimization.Styles.Render("~/Bootstrap/less/Bootstrap.less","~/Bootstrap/css/bootstrap.icon-large.css","~/Bootstrap/lm/schools.less")%>
  <%=System.Web.Optimization.Scripts.Render("~/jslibBS")%>
  <%--=System.Web.Optimization.Styles.Render("~/Bootstrap/less/Bootstrap.less","~/xBootstrap/less/responsive.less","~/Bootstrap/css/bootstrap.icon-large.css","~/Bootstrap/lm/demo-style.less")--%>
</head>
<body>
  <div class="container home">
    <h2>English Course</h2>
    <div class="row-fluid">
      <div class="span8">
        <div class="well">
          <div class="row-fluid">
            <div class="span6 text-align-left">
              <div class="btn-group">
                <button class="btn btn-large disabled" disabled>
                  <div style="text-align: left;">
                    <i class="icon-large icon-ok-2"></i>&nbsp;&nbsp;<b>Beginners, part 1</b><br />
                    <span class="label label-important">waiting</span>
                  </div>
                </button>
                <button class="btn btn-large dropdown-toggle" data-toggle="dropdown">
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="#">xxx</a></li>
                  <li><a href="#">xxx</a></li>
                </ul>
              </div>
            </div>
            <div class="span3">
              <div class="progress progress-success">
                <div class="bar" style="width: 86%;">
                  <div class="text">Score 86%</div>
                </div>
              </div>
              <div class="extra-small">
                1.12.2012 - 12.3.2013<br />
                Elapsed: 3:12:23
              </div>
            </div>
            <div class="span3">
              <div class="progress progress-info">
                <div class="bar" style="width: 100%;">
                  <div class="text">Progress 100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="span4">
        <div class="well">
          <div class="row-fluid">
            <div class="span6 text-align-left">
              <div class="btn-group pull-left">
                <button class="btn btn-large">
                  <div style="text-align: left;">
                    <i class="icon-large icon-ok-2"></i>&nbsp;&nbsp;<b>Test</b><br />
                    <span class="label label-important">waiting</span>
                  </div>
                </button>
                <button class="btn btn-large dropdown-toggle" data-toggle="dropdown">
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="#">xxx</a></li>
                  <li><a href="#">xxx</a></li>
                </ul>
              </div>
            </div>
            <div class="offset1 span5">
              <div class="progress progress-success">
                <div class="bar" style="width: 86%;">
                  <div class="text">Score 86%</div>
                </div>
              </div>
              <div class="extra-small">
                1.12.2012<br />
                interrupts: 1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row-fluid">
      <div class="span8">
        <div class="well">
          <div class="row-fluid">
            <div class="span6 text-align-left">
              <div class="btn-group">
                <button class="btn btn-large btn-success">
                    <div style="text-align: left;">
                      <i class="icon-large icon-ok-2"></i>&nbsp;&nbsp;<b>Beginners, part 1</b><br />
                      <span class="label label-important">waiting</span>
                    </div>
                </button>
                <button class="btn btn-large btn-success dropdown-toggle" data-toggle="dropdown">
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="#">xxx</a></li>
                  <li><a href="#">xxx</a></li>
                </ul>
              </div>
            </div>
            <div class="span3">
              <div class="progress progress-success">
                <div class="bar" style="width: 86%;">
                  <div class="text">Score 86%</div>
                </div>
              </div>
              <div class="extra-small">
                1.12.2012 - 12.3.2013<br />
                Elapsed: 3:12:23
              </div>
            </div>
            <div class="span3">
              <div class="progress progress-info">
                <div class="bar" style="width: 20%;">
                  <div class="text">Progress 20%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="span4">
        <div class="well">
          <div class="row-fluid">
            <div class="span6 text-align-left">
              <div class="btn-group pull-left">
                <button class="btn btn-large"><i class="icon-large icon-ok-2"></i>&nbsp;&nbsp;<b>Test</b></button>
                <button class="btn btn-large dropdown-toggle" data-toggle="dropdown">
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="#">xxx</a></li>
                  <li><a href="#">xxx</a></li>
                </ul>
              </div>
            </div>
            <div class="offset1 span5">
              <div class="progress progress-success">
                <div class="bar" style="width: 86%;">
                  <div class="text">Sccore 86%</div>
                </div>
              </div>
              <div class="extra-small">
                1.12.2012<br />
                interrupts: 1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row-fluid">
      <div class="span8">
        <div class="well">
          <div class="row-fluid">
            <div class="span6 text-align-left">
              <div class="btn-group">
                <button class="btn btn-large disabled" disabled><i class="icon-large icon-ok-2"></i>&nbsp;&nbsp;<b>Beginners, part 1</b></button>
                <button class="btn btn-large dropdown-toggle" data-toggle="dropdown">
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="#">xxx</a></li>
                  <li><a href="#">xxx</a></li>
                </ul>
              </div>
            </div>
            <div class="span6">
              To enable course, run previous course and tests first!
            </div>
          </div>
        </div>
      </div>
      <div class="span4">
        <div class="well">
          <div class="row-fluid">
            <div class="span6 text-align-left">
              <div class="btn-group pull-left">
                <button class="btn btn-large disabled" disabled="disabled"><i class="icon-large icon-ok-2"></i>&nbsp;&nbsp;<b>Test</b></button>
                <button class="btn btn-large dropdown-toggle disabled" disabled="disabled" data-toggle="dropdown">
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="#">xxx</a></li>
                  <li><a href="#">xxx</a></li>
                </ul>
              </div>
            </div>
            <div class="offset1 span5">
              Run course first!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>

