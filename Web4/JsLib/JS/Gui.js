var anim;
(function (anim) {
    function onModalShow(modal) {
        if (actModal) {
            console.log('anim: onModalShow, hide old');
            if (_alertInfo)
                _alertInfo.okClick = undefined;
            actModal.modal('hide');
            actModal = null;
        }
        actModal = modal;
    }
    anim.onModalShow = onModalShow;
    function onModalHide(modal) {
        if (!modal || !modal.data('bs.modal').isShown)
            return;
        if (modal != actModal) {
            debugger;
            throw 'modal!=actModal';
        }
        actModal = null;
    }
    anim.onModalHide = onModalHide;
    var actModal;
    //template v d:\LMCom\rew\Web4\JsLib\JS\Bowser.html
    var alertInfo = (function () {
        function alertInfo() {
            var _this = this;
            this.text = ko.observable('');
            this.caption = ko.observable('');
            this.isCancelVisible = ko.observable(true);
            this.okClick = false;
            this.lmconsoleClick = $.noop;
            Pager.renderTemplateEx('lm-alert-place', 'lm-alert-template', this);
            this.mod = $('#lm-alert-place #modal-alert');
            Pager.renderTemplateEx('lm-console-place', 'lmconsole-dialog', this);
            this.lmconsoleDialog = $('#lm-console-place #modal-lmconsole-dialog');
            Pager.renderTemplateEx('lm-docdlg-place', 'doc-dialog', this);
            this.lmdocDialog = $('#lm-docdlg-place #modal-doc-dialog');
            this.mod.on('hide.bs.modal', function () {
                console.log('anim: alert hide');
                if (_this.completed)
                    _this.completed(_this.okClick);
                _this.completed = null;
                onModalHide(_this.mod);
            }).on('show.bs.modal', function () {
                console.log('anim: alert show');
                onModalShow(_this.mod);
            });
        }
        alertInfo.prototype.show = function (title, completed, finishParams) {
            if (finishParams === void 0) { finishParams = null; }
            if (actModal) {
                this.okClick = undefined;
                actModal.modal('hide');
                actModal = null;
            }
            this.okClick = false;
            this.text(title);
            this.completed = completed;
            this.isCancelVisible(true);
            this.caption('');
            if (finishParams)
                finishParams();
            this.mod.modal('show');
        };
        alertInfo.prototype.click = function () {
            console.log('anim: alert ok click');
            this.okClick = true;
            this.mod.modal('hide');
        };
        alertInfo.prototype.lmconsoleShow = function (onOK) {
            var _this = this;
            var ok = onOK;
            this.lmconsoleClick = function () { return ok(_this.lmconsoleDialog, function () { return _this.lmconsoleDialog.modal('hide'); }); };
            this.lmconsoleDialog.modal('show');
        };
        alertInfo.prototype.lmcdocDlgShow = function (data) {
            var txt = this.lmdocDialog.find('#modal-doc-text');
            txt.val(data);
            setTimeout(function () { return (txt[0]).select(); }, 1);
            //var txt = this.lmdocDialog.find('#modal-doc-pre');
            //txt.text(data);
            //setTimeout(() => selectText(txt[0]), 1);
            this.lmdocDialog.modal('show');
        };
        return alertInfo;
    })();
    anim.alertInfo = alertInfo;
    function alert() {
        if (!_alertInfo)
            _alertInfo = new alertInfo();
        return _alertInfo;
    }
    anim.alert = alert;
    var _alertInfo;
    function selectText(text) {
        var doc = document;
        if (window.getSelection) {
            var selection = window.getSelection();
            var range2 = doc.createRange();
            range2.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range2);
        }
        else if ((doc).body.createTextRange) {
            var range = (doc).body.createTextRange();
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
    function show(block, isToogle) {
        stopAnim(); //ukonci vsechny animace
        $('[data-role=collapsed]:not(:hidden)').not(block).hide(animInterval); //zabal ostatni collapsed
        if (!block)
            return; //neni co rozbalovat
        //if (isToogle) block.toggle(animInterval); else block.show(animInterval);
        if (isToogle)
            block.toggle(animInterval);
        else
            block.show(animInterval);
    }
    anim.show = show;
    function hideMenus(self) {
        $('[data-role=menu]').not(self).css({ 'opacity': 0, 'visibility': 'hidden' }); //zavri vsechna menu mimo self
    }
    anim.hideMenus = hideMenus;
    //otevri menu
    function showMenu(menu, ev) {
        stopAnim(); //ukonci vsechny animace
        hideMenus(menu);
        setTimeout(function () {
            menu.css({ 'visibility': 'visible', 'display': 'block', 'opacity': 0 }); //pro jistotu: inicializace menu
            menu.position({ my: "left+10 top+10", of: ev, collision: 'flipfit' }); //umisteni menu
            menu.animate({ "opacity": 1 }, animInterval); //animace opacity
        }, 1);
    }
    anim.showMenu = showMenu;
    //jakykoliv click
    $(document).on('click', function (ev) {
        var self = $(ev.target).closest('[data-role=menu]'); //self neprazdne => je klik do menu
        hideMenus(self);
        setTimeout(function () { return self.css({ 'opacity': 0, 'visibility': 'hidden' }); }, 1); //za chvili zavri i self
    });
    //rozbal collapse 
    $(document).on('click', '[data-toggle=collapse], [data-toggle=collapse] *', function (ev) {
        toggleShow($($(ev.target).closest('[data-toggle=collapse]').attr('data-target'))); //animuj element, jehoz id je ulozen v data-target
        ev.stopPropagation();
        return false;
    });
    //objev menu 
    function toggleMenu(ev) {
        return toggleMenuLow($.event.fix(ev));
    }
    anim.toggleMenu = toggleMenu;
    function toggleMenuLow(ev) {
        ev.stopPropagation();
        //ev.stopPropagation();
        showMenu($($(ev.target).closest('[data-toggle=menu]').attr('data-target')), ev); //animuj element s menu, jehoz id je ulozen v data-target
        return false;
    }
    anim.toggleMenuLow = toggleMenuLow;
    $(document).on('click', '[data-toggle=menu], [data-toggle=menu] *', toggleMenuLow);
    //uzavri menu
    $(document).on('keydown', '*', function (ev) {
        stopAnim();
        if (ev.keyCode != 27)
            return;
        hideMenus(null);
        return false;
    });
    anim.mousePos; //v mousemove zapamatovana pozice
    //zapamatovani si pozice mysi
    $(document).bind('mousemove', function (ev) { return anim.mousePos = ev; });
    //inicializace (funguje pouze pro existujici elementy)
    $(function () {
        $('[data-role=collapsed]').hide();
        $('[data-role=menu]').css({ 'opacity': 0, 'visibility': 'hidden' });
    });
    //collapse all expandables
    function collapseExpanded() {
        $('[data-role=collapsed]:not(:hidden)').hide();
    }
    anim.collapseExpanded = collapseExpanded;
    //collapse all expandables slow
    function collapseExpandedSlow() {
        $('[data-role=collapsed]:not(:hidden)').hide(animInterval);
    }
    anim.collapseExpandedSlow = collapseExpandedSlow;
    //ukonci vsechny animace
    function stopAnim() {
        $('[data-role=collapsed], [data-role=menu]').finish();
    }
    anim.stopAnim = stopAnim;
})(anim || (anim = {}));
var Gui2;
(function (Gui2) {
    var skin = (function () {
        function skin() {
        }
        skin.prototype.bodyClass = function () { return ''; };
        skin.prototype.getSkinHome = function (std) {
            if (LMStatus.isLogged())
                return schools.getHash(schools.tMy, -1, null, null, null);
            var res = this.getHome();
            return _.isEmpty(res) ? std : res;
        };
        skin.prototype.getHome = function () { return null; };
        skin.instance = new skin();
        return skin;
    })();
    Gui2.skin = skin;
    var cancelTouch = function (ev, t) {
        if (ev != null) {
            ev.originalEvent = null;
            ev.preventDefault();
            ev.stopPropagation();
        }
        t.removeClass("lm-click");
    };
    $(document).delegate(".lm-clickable", "tapstart tapend mousedown mouseup", function (ev) {
        //console.log(ev.type);
        switch (ev.type) {
            case "tapstart":
            case "mousedown":
                var t = $(ev.currentTarget);
                if (t.is('.disabled'))
                    return;
                t.addClass("lm-click");
                setTimeout(function () { return cancelTouch(ev, t); }, 800);
                return true;
                break;
            case "tapend":
            case "mouseup":
                cancelTouch(ev, $(ev.currentTarget));
                break;
        }
    });
    function textWidthStart(styleHolder) {
        if (!twEl) {
            twEl = $('<div></div>');
            twEl.css({ position: 'absolute', left: -1000, top: -1000, height: 'auto', width: 'auto', 'white-space': 'nowrap' });
            $('body').append(twEl);
        }
        _.each(twStyles, function (s) { return twEl.css(s, styleHolder.css(s)); });
    }
    function textWidth(txt, styleHolder) {
        textWidthStart(styleHolder);
        twEl.html(txt);
        return twEl.width();
    }
    Gui2.textWidth = textWidth;
    function maxTextWidth(txts, styleHolder) {
        textWidthStart(styleHolder);
        var res = 0;
        _.each(txts, function (txt) {
            twEl.html(txt);
            res = Math.max(res, twEl.width());
        });
        return res;
    }
    Gui2.maxTextWidth = maxTextWidth;
    var twStyles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
    var twEl = null;
})(Gui2 || (Gui2 = {}));
