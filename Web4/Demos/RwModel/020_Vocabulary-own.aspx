<%@ Page Title="" Language="C#" MasterPageFile="~/Demos/RwModel/Rewise.master" %>

<asp:Content ID="Content3" ContentPlaceHolderID="OkCancelPlace" runat="server" />
<asp:Content ID="Content2" ContentPlaceHolderID="RwContent" runat="Server">
  <h2>Vocabulary - Own words</h2>
  <div class="row-fluid">
    <div class="span12">
      <div class="lmcollapsed lmcollapsed-instr">
        <div class="lmcollapsed-heading collapsed" data-toggle="collapse" data-target="#instrBody">
          <i class="iplus icon-chevron-up"></i><i class="iminus icon-chevron-down"></i>Add own words
        </div>
        <div id="instrBody" class="lmcollapsed-body collapse">
          <div class="lmcollapsed-inner">
            Anim pariatur cliche...
          </div>
        </div>
      </div>
    </div>
  </div>  <div class="row-fluid">
    <div class="span12">
      <blockquote>
        <label>English:</label>
        <textarea rows="2" class="span12"></textarea>
        <label>Czech:</label>
        <textarea rows="2" class="span12"></textarea>
        <label class="checkbox">
          <input type="checkbox">
          is Phrase
        </label>
        <button class="btn">OK</button>
        <h3>Archive:</h3>
        <div class="lmprogress lmprogress-primary lmprogress-large">
          <div class="bar" style="width: 100%;">
            <div class="text">
              <i class="icon-play icon-white"></i>Words entered at 2013
            </div>
          </div>
        </div>
        <div class="lmprogress lmprogress-primary lmprogress-large">
          <div class="bar" style="width: 100%;">
            <div class="text">
              <i class="icon-play icon-white"></i>Words entered at 2012
            </div>
          </div>
        </div>
      </blockquote>
    </div>
  </div>
  <script type="text/javascript">
    $(function () {
      //$('.large-vocab>a, .small-vocab>a').removeClass('btn-inverse');
    })
  </script>
</asp:Content>
