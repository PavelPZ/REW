<%@ Page Title="" Language="C#" MasterPageFile="~/bs.Master" %>

<asp:Content ContentPlaceHolderID="Head" runat="server">
  <script type="text/javascript">
    $(function () {
      Resizer.on(
        { selector: ".gui-width-height-root", onResize: true, action: Resizer.width },
        { selector: ".gui-width-height-root", onResize: true, action: Resizer.height },
        { selector: ".gui-progress", onResize: true, action: Resizer.progress}
      );
    })
  </script>
</asp:Content>
<asp:Content ContentPlaceHolderID="Content" runat="server">
  <div class="gui-width-height-root">
    <div class="btnex btnex-green btnex-left gui-height gui-width gui-progress" id="p1" data-width="2*" data-progress="48">XXXXS hhh XXXXS hhh XXXXS hhh XXXXS hhh</div>
    <div class="btnex btnex-green btnex-middle gui-height gui-width gui-progress" id="p2" data-width="200" data-progress="48">
      XXXXS hhh XXXXS hhh XXXXS hhh XXXXS hhh
        <br />
      yyy
    </div>
    <div class="btnex btnex-green btnex-right gui-height gui-width gui-progress" id="p3" data-width="1*" data-progress="48">
      XXXXS hhh XXXXS hhh XXXXS hhh XXXXS hhh
        <br />
      yyy
    </div>
  </div>

  <a href="#" onclick="$('.gui-width-height-root').html('');">remove</a>
</asp:Content>
