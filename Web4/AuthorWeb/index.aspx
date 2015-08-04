<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs" Inherits="web4.AuthorWeb.index" %>

<!DOCTYPE html>
<html>
<head>
  <title>index</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="language" content="en" />

  <!--************** JQUERY ****************** -->
  <!--[if lt IE 9]>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.js"></script>
  <![endif]-->
  <!--[if (gte IE 9)]><!-->
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.js"></script>
  <!--<![endif]-->
  <script type="text/javascript" src="externals/jquery-ui-core.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore.js"></script>

  <!--************** BOOTSTRAP font-awesome ****************** -->
  <script type="text/javascript" src="externals/bootstrap.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.css" />
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.css" />

  <!--************** knockout, jsrender ****************** -->
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-debug.js"></script>
  <script type="text/javascript" src="externals/jsrender.js"></script>

  <!--************** commonMark ****************** -->
  <script type="text/javascript" src="externals/commonMark/dist/commonmark.js"></script>

  <!--************** LM ****************** -->
  <asp:PlaceHolder runat="server" ID="jsPlace" />
  <script type="text/javascript" src="js/jquery-textrange.js"></script>
  <script type="text/javascript" src="js/metaJSGen.js"></script>
  <script type="text/javascript" src="js/marksLow.js"></script>
  <script type="text/javascript" src="js/metaMarks.js"></script>
  <script type="text/javascript" src="js/metaJS.js"></script>
  <script type="text/javascript" src="js/encodeLib.js"></script>
  <script type="text/javascript" src="js/docObjects.js"></script>
  <script type="text/javascript" src="js/marks.js"></script>
  <script type="text/javascript" src="js/marksInline.js"></script>
  <script type="text/javascript" src="js/docText.js"></script>
  <script type="text/javascript" src="js/docBlock.js"></script>
  <script type="text/javascript" src="dialogs/dialogs.js"></script>
  <script type="text/javascript" src="js/compiler.js"></script>
  <script type="text/javascript" src="js/compRenderTag.js"></script>
  <%--<script type="text/javascript" src="js/compTags.js"></script>--%>
  <link rel="stylesheet" type="text/css" href="smartText.css" />

  <script type="text/javascript">
    waObjs.test();
  </script>
</head>
<body>
  <div class="container-fluid">
    <div class="row">
      <div class="col-xs-6">
        <div id="edit-content" class="sm-edit-content">
        </div>
      </div>
      <div class="col-xs-6">
        <pre id="preview-content"></pre>
      </div>
    </div>
  </div>

  <%= System.IO.File.ReadAllText(@"d:\LMCom\rew\Web4\AuthorWeb\dialogs\dlg-open-bracket.html") %>
  <%= System.IO.File.ReadAllText(@"d:\LMCom\rew\Web4\AuthorWeb\dialogs\dlg-edit-block.html") %>
  <%= System.IO.File.ReadAllText(@"d:\LMCom\rew\Web4\AuthorWeb\dialogs\dlg-edit-inline.html") %>
  <%= System.IO.File.ReadAllText(@"d:\LMCom\rew\Web4\AuthorWeb\dialogs\dlg-enum-value.html") %>
  <%= System.IO.File.ReadAllText(@"d:\LMCom\rew\Web4\AuthorWeb\dialogs\dlg-prop-name.html") %>
  <%= System.IO.File.ReadAllText(@"d:\LMCom\rew\Web4\AuthorWeb\dialogs\ed-prop-name.html") %>
  <%= System.IO.File.ReadAllText(@"d:\LMCom\rew\Web4\AuthorWeb\dialogs\ed-enum.html") %>

  <!-- ******************************  modal-open-bracket ************************ -->
  <%--<div id="modal-open-bracket" tabindex="-1" class="modal modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        Select bracket using arrow keys and press Enter
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="exampleInputEmail1">{+...element...}:</label><br />
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-warning sm-btn-inline" data-sm-gen="{+gap-fill() |}" data-dlg-res="inline:gap-fill" data-focus-grid="0:0">gap-fill</button>
            <button class="btn btn-sm btn-warning sm-btn-inline" data-sm-gen="{+word-selection() |}" data-dlg-res="inline:word-selection" data-focus-grid="0:1">word-selection</button>
            <button class="btn btn-sm btn-warning sm-btn-inline" data-sm-gen="{+drop-down() |}" data-dlg-res="inline:drop-down" data-focus-grid="0:2">drop-down</button>
            <button class="btn btn-sm btn-warning sm-btn-inline" data-sm-gen="{+offering() |}" data-dlg-res="inline:offering" data-focus-grid="0:3">offering</button>
          </div>
        </div>
        <div class="form-group">
          <label for="exampleInputEmail1">{*...text formating...*}:</label><br />
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-success sm-btn-span" data-sm-gen="{*| *}" data-dlg-res="span:" data-focus-grid="1:0">formating</button><br />
          </div>
        </div>
        <div class="form-group">
          <label for="exampleInputEmail1">{#...block...#}:</label><br />
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-primary sm-btn-block" data-dlg-res="block:table" data-focus-grid="2:0">Table</button>
            <button class="btn btn-sm btn-primary sm-btn-block" data-dlg-res="block:panel" data-focus-grid="2:1">Panel</button>
            <button class="btn btn-sm btn-primary sm-btn-block" data-dlg-res="block:alert" data-focus-grid="2:2">Alert</button>
            <button class="btn btn-sm btn-primary sm-btn-block" data-dlg-res="block:pairing" data-focus-grid="2:3">Pairing</button>
            <button class="btn btn-sm btn-primary sm-btn-block" data-dlg-res="block:gap-fill-offering" data-focus-grid="2:4">Gap-fill Offering</button>
            <button class="btn btn-sm btn-primary sm-btn-block" data-dlg-res="block:drop-down-offering" data-focus-grid="2:5">Drop-down Offering</button>
            <button class="btn btn-sm btn-primary sm-btn-block" data-dlg-res="block:block" data-focus-grid="2:6">Default</button>
          </div>
        </div>
        <div class="form-group">
          <label for="exampleInputEmail1">{!...special style...}:</label><br />
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-info sm-btn-style" data-sm-gen="{!|}" data-dlg-res="style:" data-focus-grid="3:0">special style</button>
          </div>
        </div>
      </div>
    </div>
  </div>--%>

  <!-- ******************************  modal-edit-inline ************************ -->
  <div id="modal-prop-name" tabindex="-1" class="modal modal-dialog lm-modal-enum">
    <div class="modal-content">
      <span id="title"></span>
      <div id="search-block" class="input-group">
        <span class="input-group-addon"><i class="fa fa-search"></i></span>
        <input id="filter-ed" type="text" class="form-control" placeholder="Filter..." data-dlg-res="prop" data-focus-grid="0:0" />
      </div>
      <select id="prop-names" class="form-control" size="4" data-dlg-res="prop" data-focus-grid="1:0" data-arrow-ignore="trye">
      </select>
      <div id="descr"></div>
      <div id="buttons">
        <%--<a href="#">Del attribute</a>--%>
        <a href="#">Del element</a>
      </div>
    </div>
  </div>

  <div id="modal-prop-value" tabindex="-1" class="modal modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <span class="dlg-title"></span>prop value
      </div>
      <div class="modal-body">
      </div>
    </div>
  </div>

  <!-- ******************************  modal-edit-block ************************ -->
  <%--<div id="modal-edit-block" tabindex="-1" class="modal modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        Which part of block to delete
      </div>
      <div class="modal-body">
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-info" data-dlg-res="content" data-focus-grid="0:0">Content only</button>
          <button class="btn btn-sm btn-info" data-dlg-res="bracket" data-focus-grid="0:1">Bracket only</button>
          <button class="btn btn-sm btn-info" data-dlg-res="both" data-focus-grid="0:2">Both</button>
        </div>
      </div>
    </div>
  </div>--%>
</body>
</html>
