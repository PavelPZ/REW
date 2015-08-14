<%@ Page Title="" Language="C#" MasterPageFile="~/BS.Master" %>

<asp:content id="Content2" contentplaceholderid="Content" runat="server">
  <div class="container">
    <h3>Hallo</h3>
    <div class="progress-btn">
      <div class="text">
        <h3>Text</h3>
      </div>
      <div class="bar" style="width: 59%;"></div>
      <div class="toggle"><i class="icon-large icon-glass"></i></div>
      <div class="bkgnd"></div>
    </div>
    <table class="table">
      <caption>CAPTION</caption>
      <thead>
        <tr>
          <th style="width: 1%">#</th>
          <th style="width: 100%">Course</th>
          <th style="width: 1%">Test</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="#" class="btn"><i class="icon-glass"></i></a>
          </td>
          <td>
            <a href="#" class="btn btn-block text-align-left">
              <h4 class="inline-block align-middle">Beginners, part 1</h4>
              <div class="inline-block align-middle">
                Kurz 
                <br />
                text text text text text text text text text text text text 
              </div>
            </a></td>
          <td>
            <a href="#" class="btn btn-block" style="width: 100px;">Test</a></td>
        </tr>
        <tr>
          <td>
            <i class="icon-large icon-glass"></i>
          </td>
          <td>
            <a href="#" class="btn btn-block">Beginners</a></td>
          <td>
            <a href="#" class="btn btn-block" style="width: 100px;">Test</a></td>
        </tr>
      </tbody>
    </table>

    <div style="width: 120px; padding: 20px">
      Ahoj, jak se
    <div class="inline-block gradient-horizontal paddingLarge borderRadiusLarge" style="vertical-align: middle; line-height: 14px;">
      xxx<br />
      yyy
    </div>
      mas?
    </div>
    <div class="bkgnd-danger paddingLarge borderRadiusLarge"><i class="icon-white icon-large icon-glass"></i><span class="h1 align-middle">Test</span><i class="icon-white icon-large icon-glass"></i></div>

    <div class="btn btn-large btn-danger">
      <i class="icon-white icon-large icon-glass"></i>
      <div class="h1 align-middle inline-block">Test</div>
      <div class="inline-block">
        Test<br />
        test
      </div>
      <i class="icon-white icon-large icon-glass"></i>
    </div>
    <div class="row-fluid">
      <div class="span9">
        <div class="well" style="padding: 0px;">
          <div class="row-fluid">
            <div class="span6 text-align-left ">
              <h3><i class="icon-large icon-glass"></i><span class="align-middle">Beginners, part 1</span></h3>
            </div>
            <div class="span3">
              <table class="table">
                <thead style="height: 1px;">
                  <tr>
                    <th style="width: 1%"></th>
                    <th style="width: 100%"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Progress <span class="badge" style="padding: 3px; width: 25px; text-align: center;">10%</span></td>
                    <td>
                      <div class="progress" style="height: 10px;">
                        <div class="bar" style="width: 20%;"></div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="span3">
        <div class="well" style="padding: 0px;">
        </div>
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="btn btn-block btn-large" style="padding: 0">
      <div class="row-fluid">
        <div class="span4 text-align-left">
          <h3>Beginners, part 1</h3>
        </div>
        <div class="span8">
          <form class="form-horizontal">
            <div class="control-group">
              <label class="control-label" for="inputEmail">Email</label>
              <div class="controls">
                <input type="text" id="inputEmail" placeholder="Email">
              </div>
            </div>
            <div class="control-group">
              <label class="control-label" for="inputPassword">Password</label>
              <div class="controls">
                <input type="password" id="inputPassword" placeholder="Password">
              </div>
            </div>
            <div class="control-group">
              <div class="controls">
                <label class="checkbox">
                  <input type="checkbox">
                  Remember me
                </label>
                <button type="submit" class="btn">Sign in</button>
              </div>
            </div>
          </form>
          <span>Hotovo: </span>
          <div class="progress">
            <div class="bar" style="width: 60%;"></div>
          </div>
          yyyy<br>
          zzzz<i class="icon-white icon-large icon-glass"></i>
        </div>
      </div>
    </div>
    <div style="width: 150px">
      <p class="gradient-horizontal borderRadiusLarge">Text</p>
      <p class="gradient-vertical">Text</p>
      <p class="gradient-directional">Text</p>
      <p class="gradient-vertical-three-colors">Text</p>
      <p class="gradient-radial">Text</p>
      <p class="gradient-striped">Text</p>
    </div>

    <div class="fade-ex" onmouseover="this.className = 'fade-ex in'; return true;" onmouseout="this.className = 'fade-ex'; return true;">
      <h1>Animation</h1>
    </div>

    <h3 class="bkgnd-primary"><i class="icon-white icon-large icon-glass"></i>Text</h3>
    <h3 class="bkgnd-primary"><i class="icon-white icon-glass"></i>Text</h3>
    <h3 class="bkgnd-primary"><i class="icon-large icon-glass"></i>Text</h3>
    <h3 class="bkgnd-primary"><i class="icon-glass"></i>Text</h3>


    <!--

  <h1 class="nav-header">nav header</h1>

  <h1 class="bkgnd-important">important <small class="bkgnd-important">Xxx</small></h1>
  <h1 class="bkgnd-warning">warning <small class="bkgnd-warning">Xxx</small></h1>
  <h1 class="bkgnd-success">success <small class="bkgnd-success">Xxx</small></h1>
  <h1 class="bkgnd-info">info <small class="bkgnd-info">Xxx</small></h1>
  <h1 class="bkgnd-inverse">inverse <small class="bkgnd-inverse">Xxx</small></h1>
  <h1 class="bkgnd-primary">primary <small class="bkgnd-primary">Xxx</small></h1>
  <h1 class="bkgnd-warning2">warning2 <small class="bkgnd-warning2">Xxx</small></h1>
  <h1 class="bkgnd-danger">danger <small class="bkgnd-danger">Xxx</small></h1>
  <h1 class="bkgnd-success2">success2 <small class="bkgnd-success2">Xxx</small></h1>
  <h1 class="bkgnd-info2">info2 <small class="bkgnd-info2">Xxx</small></h1>
  <h1 class="bkgnd-inverse2">inverse2 <small class="bkgnd-inverse2">Xxx</small></h1>
  -->
  </div>
  </asp:content>

