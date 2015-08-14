

module anim {

  export function onModalShow(modal: JQuery) {
    if (actModal) {
      console.log('anim: onModalShow, hide old');
      if (_alertInfo) _alertInfo.okClick = undefined;
      actModal.modal('hide'); actModal = null;
    }
    actModal = modal;
  }
  export function onModalHide(modal: JQuery) {
    if (!modal || !modal.data('bs.modal').isShown) return;
    if (modal != actModal) { debugger; throw 'modal!=actModal'; }
    actModal = null;
  }
  var actModal: JQuery;

  //template v d:\LMCom\rew\Web4\JsLib\JS\Bowser.html
  export class alertInfo {
    constructor() {
      Pager.renderTemplateEx('lm-alert-place', 'lm-alert-template', this);
      this.mod = $('#lm-alert-place #modal-alert');
      Pager.renderTemplateEx('lm-console-place', 'lmconsole-dialog', this);
      this.lmconsoleDialog = $('#lm-console-place #modal-lmconsole-dialog');
      Pager.renderTemplateEx('lm-docdlg-place', 'doc-dialog', this);
      this.lmdocDialog = $('#lm-docdlg-place #modal-doc-dialog');
      
      this.mod.on('hide.bs.modal',() => {
        console.log('anim: alert hide');
        if (this.completed) this.completed(this.okClick);
        this.completed = null;
        onModalHide(this.mod);
      }).on('show.bs.modal',() => {
        console.log('anim: alert show');
        onModalShow(this.mod);
      });
    }
    text = ko.observable('');
    caption = ko.observable('');
    isCancelVisible = ko.observable(true);
    completed: (ok: boolean) => void;
    okClick = false;
    mod: JQuery;
    lmconsoleDialog: JQuery;
    lmdocDialog: JQuery;
    show(title: string, completed: (ok: boolean) => void, finishParams: () => void = null) {
      if (actModal) { this.okClick = undefined; actModal.modal('hide'); actModal = null; }
      this.okClick = false; 
      this.text(title); this.completed = completed;
      this.isCancelVisible(true); this.caption('');
      if (finishParams) finishParams();
      this.mod.modal('show');
    }
    click() {
      console.log('anim: alert ok click');
      this.okClick = true;
      this.mod.modal('hide');
    }
    
    lmconsoleShow(onOK: (dlg: JQuery, completed: () => void) => void) {
      var ok = onOK;
      this.lmconsoleClick = () => ok(this.lmconsoleDialog, () => this.lmconsoleDialog.modal('hide'));
      this.lmconsoleDialog.modal('show');
    } lmconsoleClick: () => void = $.noop;

    lmcdocDlgShow(data: string) {
      var txt = this.lmdocDialog.find('#modal-doc-text');
      txt.val(data);
      setTimeout(() => (<HTMLTextAreaElement>(txt[0])).select(),1);
      //var txt = this.lmdocDialog.find('#modal-doc-pre');
      //txt.text(data);
      //setTimeout(() => selectText(txt[0]), 1);

      this.lmdocDialog.modal('show');
    } 
  }
  export function alert(): alertInfo {
    if (!_alertInfo) _alertInfo = new alertInfo();
    return _alertInfo;
  } var _alertInfo: alertInfo;

  function selectText(text: HTMLElement) {
    var doc = document;
    if (window.getSelection) {
      var selection = window.getSelection();
      var range2 = doc.createRange();
      range2.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range2);
    } else if ((<any>(doc)).body.createTextRange) { // ms
      var range = (<any>(doc)).body.createTextRange();
      range.moveToElementText(text);
      range.select();
    }
  }


  /*
  <div data-toggle="collapse" data-target="#menu1">Expand</div>
  <div id="menu1" class="lm-anim" data-role="collapsed">
    Text Text Text Text Text Text Text Text Text Text Text Text 
  </div>

  .lm-menu { position:absolute; }
  <div data-toggle="menu" data-target="#m1">Expand m2</div>
  <div id="m1" class="lm-menu lm-anim" data-role="menu">
    Text Text Text Text Text Text Text Text Text Text Text Text 
  </div>
  */
  //http://www.bennadel.com/blog/1864-Experimenting-With-jQuery-s-Queue-And-Dequeue-Methods.htm
  //http://jsfiddle.net/enf644/6bX28/2/
  var animInterval = 400;

  //rozbal collapsed
  function toggleShow(block) {
    show(block, true);
  }

  export function show(block, isToogle?: boolean) {
    stopAnim(); //ukonci vsechny animace
    $('[data-role=collapsed]:not(:hidden)').not(block).hide(animInterval); //zabal ostatni collapsed
    if (!block) return; //neni co rozbalovat
    //if (isToogle) block.toggle(animInterval); else block.show(animInterval);
    if (isToogle) block.toggle(animInterval); else block.show(animInterval);
  }

  export function hideMenus(self: JQuery) {
    $('[data-role=menu]').not(self).css({ 'opacity': 0, 'visibility': 'hidden' }); //zavri vsechna menu mimo self
  }

  //otevri menu
  export function showMenu(menu: JQuery, ev) {
    stopAnim(); //ukonci vsechny animace
    hideMenus(menu);
    setTimeout(() => {
      menu.css({ 'visibility': 'visible', 'display': 'block', 'opacity': 0 }); //pro jistotu: inicializace menu
      menu.position({ my: "left+10 top+10", of: ev, collision: 'flipfit' }); //umisteni menu
      menu.animate({ "opacity": 1 }, animInterval); //animace opacity
    }, 1);
  }

  //jakykoliv click
  $(document).on('click',(ev: JQueryEventObject) => {
    var self = $(ev.target).closest('[data-role=menu]'); //self neprazdne => je klik do menu
    hideMenus(self);
    setTimeout(() => self.css({ 'opacity': 0, 'visibility': 'hidden' }), 1); //za chvili zavri i self
  });

  //rozbal collapse 
  $(document).on('click', '[data-toggle=collapse], [data-toggle=collapse] *',(ev: JQueryEventObject) => {
    toggleShow($($(ev.target).closest('[data-toggle=collapse]').attr('data-target'))); //animuj element, jehoz id je ulozen v data-target
    ev.stopPropagation();
    return false;
  });

  //objev menu 
  export function toggleMenu(ev: Event) {
    return toggleMenuLow($.event.fix(ev));
  }
  export function toggleMenuLow(ev: JQueryEventObject): boolean {
    ev.stopPropagation();
    //ev.stopPropagation();
    showMenu($($(ev.target).closest('[data-toggle=menu]').attr('data-target')), ev); //animuj element s menu, jehoz id je ulozen v data-target
    return false;
  }

  $(document).on('click', '[data-toggle=menu], [data-toggle=menu] *', toggleMenuLow);

  //uzavri menu
  $(document).on('keydown', '*',(ev: JQueryEventObject) => {
    stopAnim();
    if (ev.keyCode != 27) return;
    hideMenus(null);
    return false;
  });


  export var mousePos: JQueryEventObject; //v mousemove zapamatovana pozice
  //zapamatovani si pozice mysi
  $(document).bind('mousemove',(ev: JQueryEventObject) => mousePos = ev);

  //inicializace (funguje pouze pro existujici elementy)
  $(function () {
    $('[data-role=collapsed]').hide();
    $('[data-role=menu]').css({ 'opacity': 0, 'visibility': 'hidden' });
  });

  //collapse all expandables
  export function collapseExpanded() {
    $('[data-role=collapsed]:not(:hidden)').hide();
  }

  //collapse all expandables slow
  export function collapseExpandedSlow() {
    $('[data-role=collapsed]:not(:hidden)').hide(animInterval);
  }

  //ukonci vsechny animace
  export function stopAnim() {
    $('[data-role=collapsed], [data-role=menu]').finish();
  }

}

module Gui2 {

  export class skin {
    bodyClass() { return ''; }
    getSkinHome(std: string) {
      if (LMStatus.isLogged()) return schools.getHash(schools.tMy, -1, null, null, null);
      var res = this.getHome();
      return _.isEmpty(res) ? std : res;
    }
    getHome() { return null; }
    static instance = new skin();
  }

  var cancelTouch = (ev: JQueryEventObject, t: JQuery) => {
    if (ev != null) {
      (<any>ev).originalEvent = null;
      ev.preventDefault(); ev.stopPropagation();
    }
    t.removeClass("lm-click");
  }

  $(document).delegate(".lm-clickable", "tapstart tapend mousedown mouseup",(ev) => {
    //console.log(ev.type);
    switch (ev.type) {
      case "tapstart":
      case "mousedown":
        var t = $(ev.currentTarget);
        if (t.is('.disabled')) return;
        t.addClass("lm-click");
        setTimeout(() => cancelTouch(ev, t), 800);
        return true;
        break;
      case "tapend":
      case "mouseup":
        cancelTouch(ev, $(ev.currentTarget));
        break;
    }
  });

  function textWidthStart(styleHolder: JQuery): void {
    if (!twEl) {
      twEl = $('<div></div>');
      twEl.css({ position: 'absolute', left: -1000, top: -1000, height: 'auto', width: 'auto', 'white-space': 'nowrap' });
      $('body').append(twEl);
    }
    _.each<string>(twStyles, s => twEl.css(s, styleHolder.css(s)));
  }
  export function textWidth(txt: string, styleHolder: JQuery): number {
    textWidthStart(styleHolder);
    twEl.html(txt);
    return twEl.width();
  }
  export function maxTextWidth(txts: string[], styleHolder: JQuery): number {
    textWidthStart(styleHolder);
    var res = 0;
    _.each<string>(txts, txt => {
      twEl.html(txt);
      res = Math.max(res, twEl.width());
    });
    return res;
  }
  var twStyles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
  var twEl: JQuery = null;
}
