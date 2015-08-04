<%@ Page Title="" Language="C#" MasterPageFile="~/Demos/RwModel/Rewise.master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="NavBarPlace" runat="server" />
<asp:Content ID="Content3" ContentPlaceHolderID="OkCancelPlace" runat="server" />
<asp:Content ID="Content2" ContentPlaceHolderID="RwContent" runat="server">
  <div class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
      <!--<a id="brand" href="#" class="brand"><i class="flag-mid flag-mid-english" style="padding: 0; margin: -6px 0 0 0;"></i>&nbsp;LANGMaster RE-WISE</a>-->
      <ul class="nav pull-right">
        <li><a class="btn btn-inverse" href="#">Czech&nbsp;<i class="icon-play icon-white"></i></a></li>
      </ul>
    </div>
  </div>
  <div class="row-fluid">
    <div class="offset1 span10">
      <h1>First time here!</h1>
      <div class="lmcollapsed lmcollapsed-instr">
        <div class="lmcollapsed-heading collapsed" data-toggle="collapse" data-target="#instrBody">
          <i class="iplus icon-chevron-up"></i><i class="iminus icon-chevron-down"></i>To start enter the following information
        </div>
        <div id="instrBody" class="lmcollapsed-body collapse">
          <div class="lmcollapsed-inner">
            Anim pariatur cliche...
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row-fluid">
    <div class="offset1 span10">
      <blockquote>
        <div>
          <a class="btn btn-primary btn-large "><i class="flag-small flag-small-english"></i>&nbsp;Enter your native language&nbsp;<i class="icon-play icon-white"></i></a>
        </div>
        <hr />
        <div>
          <a class="btn btn-primary btn-large "><i class="flag-small flag-small-english"></i>&nbsp;Choose first Language to learn&nbsp;<i class="icon-play icon-white"></i></a>
        </div>
      </blockquote>
    </div>
  </div>
</asp:Content>
