<%@ Page Title="" Language="C#" MasterPageFile="~/Schools/Design/Design.Master" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
  <style type="text/css">
    blockquote {
      padding: 0;
      margin: 0;
      padding-left: 20px;
    }

    .grPage {
      border-top: 10px solid gray;
      margin-top: 30px;
    }
    .grTitle {
      border-bottom: 10px solid gray;
      margin-top: 0;
      margin-bottom: 20px;
    }
  </style>
  <div style="padding: 10px;">
    <div id="edit_container">
      <select style="width: 300px;" data-bind="options: locs, value: loc, optionsCaption: 'Choose localization'"></select>
      <select style="width: 300px;" data-bind="options: books, optionsText: 'title', value: book, optionsValue: 'id', optionsCaption: 'Choose grammar...'"></select>
    </div>
<%--    <div data-bind="foreach: tree">
      <div data-bind="text: title"></div>
      <!-- ko if: !Utils.Empty($data.items) -->
      <blockquote>
        <div data-bind="foreach: items">
          <div data-bind="text: title"></div>

          <!-- ko if: !Utils.Empty($data.items) -->
          <blockquote>
            <div data-bind="foreach: items">
              <div data-bind="text: title"></div>

              <!-- ko if: !Utils.Empty($data.items) --> 
              <blockquote>
                <div data-bind="foreach: items">
                  <div data-bind="text: title"></div>
                </div>
              </blockquote>
              <!-- /ko -->

            </div>
          </blockquote>
          <!-- /ko -->


        </div>
      </blockquote>
      <!-- /ko -->
    </div>--%>
    <div data-bind="foreach: pages">
      <div class="grPage">
        <h2 class="grTitle" data-bind="text: title"></h2>
        <div data-bind="html: html"></div>
      </div>
    </div>
  </div>
  <script type="text/javascript">
    design.startProc = design.startGrammar;
  </script>
</asp:Content>
