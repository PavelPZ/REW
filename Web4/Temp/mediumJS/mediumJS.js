//http://rangy.googlecode.com/svn/trunk/demos/
//https://github.com/timdown/rangy/wiki/Rangy-Selection
//https://github.com/timdown/rangy/wiki/Rangy-Range
//https://github.com/timdown/rangy/wiki/Rangy-Object
var mediumJS;
(function (mediumJS) {
    var actDiv = null;
    function start(editorId) {
        new editable($(editorId));
        //var medium = new LMMedium.Medium({
        //  element: $(editorId)[0],
        //  mode: LMMedium.Medium.richMode,
        //  placeholder: 'xxx',
        //  pasteAsText: true,
        //  autoHR: false,
        //});
        //var old = Medium.Action.prototype.enterKey;
        //Medium.Action.prototype.enterKey = ev => {
        //  old();
        //};
        //http://stackoverflow.com/questions/6754275/
        //_.each(editorIds, editorId => {
        //  $(editorId).focus(() => {
        //    new editable($(editorId));
        //  });
        //var medium = new Medium({
        //  element: $(editorId)[0],
        //  mode: Medium.richMode,
        //  placeholder: 'xxx',
        //  pasteAsText: true,
        //  autoHR: false,
        //});
        //var enterKey = medium.action.enterKey;
        //medium.action.enterKey = function (ev) {
        //  enterKey.call(medium.action, ev);
        //};
        //});
        //var old = Medium.Action.prototype.enterKey;
        //Medium.Action.prototype.enterKey = ev => {
        //  old();
        //};
        //var old = medium.action.handledEvents.keydown;
        //medium.action.handledEvents.keydown = (ev: Event) => {
        //  old(ev);
        //};
    }
    mediumJS.start = start;
    var editable = (function () {
        function editable(el) {
            this.el = el;
            el.on("focus blur keydown keyup paste click mousedown", function (ev) {
                //***** ochrana .read-only elementu
                var blocks = $(ev.target).closest(".read-only");
                if (blocks.length == 0 && ev.type == "keydown") {
                    var forw = false;
                    if ((forw = forwardArrowCodes[ev.which]) || backwardArrowCodes[ev.which]) {
                        setTimeout(function () {
                            var range = rangy.getSelection().getRangeAt(0); //aktualni selection range
                            var start = range.startContainer; //vlastnik selekce
                            if (start.nodeType == Node.TEXT_NODE)
                                start = start.parentNode; //text => dej parenta
                            blocks = $(start).closest(".read-only");
                            if (blocks.length == 0)
                                return;
                            if (forw)
                                range.collapseAfter(blocks[0]);
                            else
                                range.collapseBefore(blocks[0]);
                            range.select(); //selection (karet) je v inner elementu - pak neni sance jej z nej dostat, zmen jej
                        }, 1);
                        return;
                    }
                    else if (ev.which == key.backspace || ev.which == key.k_delete) {
                        //var ROs = _.map(el.find('.read-only'), jq => bililiteRange(jq));
                        var isDel = ev.which == key.k_delete;
                        //http://www.w3.org/TR/DOM-Level-3-Events-key/
                        //http://bililite.com/blog/2015/01/14/bililiterange-sendkeys/
                        //http://bililite.com/blog/2011/01/17/cross-browser-text-ranges-and-selections/
                        var rng = bililiteRange(el[0]).bounds('selection');
                        //if (rng._bounds[0] != rng._bounds[1]) return true;
                        //var oldPos = rng._bounds[0];
                        if (rng._bounds[0] == 0 && rng._bounds[1] == 0)
                            return false;
                        else if (isDel && rng._bounds[0] == 0 && rng._bounds[1] == 1)
                            return false;
                        console.log(rng._bounds[0].toString() + '-' + rng._bounds[1].toString());
                        rng.sendkeys(isDel ? '{ArrowRight}' : '{ArrowLeft}').select();
                        var isRO = false;
                        try {
                            var range = rangy.getSelection().getRangeAt(0);
                            var start = range.endContainer;
                            if (start.nodeType == Node.TEXT_NODE)
                                start = start.parentNode; //text => dej parenta
                            if ($(start).closest(".read-only").length > 0)
                                isRO = true;
                        }
                        finally {
                            bililiteRange(el[0]).bounds('selection').sendkeys(!isDel ? '{ArrowRight}' : '{ArrowLeft}').select();
                        }
                        return !isRO;
                        //$(start).trigger(<any>{ type: "keydown", key: 'ArrowRight' });
                        return false;
                        //bililiteRange(this).bounds('selection').sendkeys(x).select();
                        var e = jQuery.Event("keypress");
                        e.which = e.keyCode = key.a;
                        el.trigger(e);
                        //e = jQuery.Event("keyup");
                        //e.which = e.keyCode = key.a;
                        //el.trigger(e);
                        return false;
                        var range = rangy.getSelection().getRangeAt(0);
                        range.moveStart('character', 5);
                        range.collapse(true);
                        var start = range.startContainer;
                        if ($(start.parentNode).closest(".read-only").length > 0)
                            return false;
                    }
                    else if (ev.which == key.k_delete || ev.which == key.backspace) {
                        var isDel = ev.which == key.k_delete;
                        var range = rangy.getSelection().getRangeAt(0);
                        var ros = el.find('.read-only');
                        var start = range.endContainer;
                        var retCode = true;
                        if (start.nodeType == Node.TEXT_NODE) {
                            if ($(start.parentNode).closest(".read-only").length > 0)
                                return false;
                            var text = start;
                            if (isDel && text.length != range.endOffset)
                                return true;
                            else if (!isDel && range.endOffset > 0)
                                return true;
                            _.each(ros, function (ro) {
                                if (!retCode)
                                    return;
                                var rng = rangy.createRange();
                                rng.selectNode(ro);
                                if (isDel) {
                                    var res = range.compareBoundaryPoints(rangy.END_TO_START, rng);
                                    retCode = res > 0;
                                }
                                else {
                                    var res = range.compareBoundaryPoints(rangy.START_TO_END, rng);
                                    retCode = res < 0;
                                }
                            });
                        }
                        else {
                            _.each(ros, function (ro) {
                                if (!retCode)
                                    return;
                                var rng = rangy.createRange();
                                rng.selectNode(ro);
                                if (isDel) {
                                    var res = range.compareBoundaryPoints(rangy.END_TO_START, rng);
                                    retCode = res > 0;
                                }
                                else {
                                    var res = range.compareBoundaryPoints(rangy.START_TO_END, rng);
                                    retCode = res < 0;
                                }
                            });
                        }
                        return retCode;
                        var range = rangy.getSelection().getRangeAt(0);
                        var start = range.endContainer;
                        if ($(start.parentNode).closest(".read-only").length > 0)
                            return false;
                        if (start.nodeType == Node.TEXT_NODE) {
                            var text = start;
                            if (ev.which == key.k_delete) {
                                if ($(start.nextSibling).closest(".read-only").length > 0)
                                    return false;
                            }
                            else {
                                if (range.endOffset != 0)
                                    return true;
                                if ($(start.previousSibling).closest(".read-only").length > 0)
                                    return false;
                            }
                        }
                    }
                    return true;
                }
                var block = blocks.length > 0 ? blocks[0] : null;
                if (block)
                    return false;
                //***** zpracovani eventu
                return true;
            });
            el.attr("contenteditable", "true");
        }
        return editable;
    })();
    mediumJS.editable = editable;
    function range(editorId) {
        $(function () {
            rangy.init();
            var node = $('#code')[0];
            var txt = node.firstChild;
            var range = rangy.createRange();
            //range.selectNode(node.firstChild);
            range.setStart(txt, 16);
            range.setEnd(txt, 23);
            //range.selectNode(txt);
            var sel = rangy.getSelection();
            sel.setSingleRange(range);
            //sel.addRange(range);
        });
    }
    mediumJS.range = range;
    (function (key) {
        key[key["backspace"] = 8] = "backspace";
        key[key["tab"] = 9] = "tab";
        key[key["enter"] = 13] = "enter";
        key[key["shift"] = 16] = "shift";
        key[key["ctrl"] = 17] = "ctrl";
        key[key["alt"] = 18] = "alt";
        key[key["pause"] = 19] = "pause";
        key[key["capsLock"] = 20] = "capsLock";
        key[key["escape"] = 27] = "escape";
        key[key["pageUp"] = 33] = "pageUp";
        key[key["pageDown"] = 34] = "pageDown";
        key[key["end"] = 35] = "end";
        key[key["home"] = 36] = "home";
        key[key["leftArrow"] = 37] = "leftArrow";
        key[key["upArrow"] = 38] = "upArrow";
        key[key["rightArrow"] = 39] = "rightArrow";
        key[key["downArrow"] = 40] = "downArrow";
        key[key["insert"] = 45] = "insert";
        key[key["k_delete"] = 46] = "k_delete";
        key[key["k_0"] = 48] = "k_0";
        key[key["k_1"] = 49] = "k_1";
        key[key["k_2"] = 50] = "k_2";
        key[key["k_3"] = 51] = "k_3";
        key[key["k_4"] = 52] = "k_4";
        key[key["k_5"] = 53] = "k_5";
        key[key["k_6"] = 54] = "k_6";
        key[key["k_7"] = 55] = "k_7";
        key[key["k_8"] = 56] = "k_8";
        key[key["k_9"] = 57] = "k_9";
        key[key["a"] = 65] = "a";
        key[key["b"] = 66] = "b";
        key[key["c"] = 67] = "c";
        key[key["d"] = 68] = "d";
        key[key["e"] = 69] = "e";
        key[key["f"] = 70] = "f";
        key[key["g"] = 71] = "g";
        key[key["h"] = 72] = "h";
        key[key["i"] = 73] = "i";
        key[key["j"] = 74] = "j";
        key[key["k"] = 75] = "k";
        key[key["l"] = 76] = "l";
        key[key["m"] = 77] = "m";
        key[key["n"] = 78] = "n";
        key[key["o"] = 79] = "o";
        key[key["p"] = 80] = "p";
        key[key["q"] = 81] = "q";
        key[key["r"] = 82] = "r";
        key[key["s"] = 83] = "s";
        key[key["t"] = 84] = "t";
        key[key["u"] = 85] = "u";
        key[key["v"] = 86] = "v";
        key[key["w"] = 87] = "w";
        key[key["x"] = 88] = "x";
        key[key["y"] = 89] = "y";
        key[key["z"] = 90] = "z";
        key[key["leftWindow"] = 91] = "leftWindow";
        key[key["rightWindowKey"] = 92] = "rightWindowKey";
        key[key["select"] = 93] = "select";
        key[key["numpad0"] = 96] = "numpad0";
        key[key["numpad1"] = 97] = "numpad1";
        key[key["numpad2"] = 98] = "numpad2";
        key[key["numpad3"] = 99] = "numpad3";
        key[key["numpad4"] = 100] = "numpad4";
        key[key["numpad5"] = 101] = "numpad5";
        key[key["numpad6"] = 102] = "numpad6";
        key[key["numpad7"] = 103] = "numpad7";
        key[key["numpad8"] = 104] = "numpad8";
        key[key["numpad9"] = 105] = "numpad9";
        key[key["multiply"] = 106] = "multiply";
        key[key["add"] = 107] = "add";
        key[key["subtract"] = 109] = "subtract";
        key[key["decimalPoint"] = 110] = "decimalPoint";
        key[key["divide"] = 111] = "divide";
        key[key["f1"] = 112] = "f1";
        key[key["f2"] = 113] = "f2";
        key[key["f3"] = 114] = "f3";
        key[key["f4"] = 115] = "f4";
        key[key["f5"] = 116] = "f5";
        key[key["f6"] = 117] = "f6";
        key[key["f7"] = 118] = "f7";
        key[key["f8"] = 119] = "f8";
        key[key["f9"] = 120] = "f9";
        key[key["f10"] = 121] = "f10";
        key[key["f11"] = 122] = "f11";
        key[key["f12"] = 123] = "f12";
        key[key["numLock"] = 144] = "numLock";
        key[key["scrollLock"] = 145] = "scrollLock";
        key[key["semiColon"] = 186] = "semiColon";
        key[key["equalSign"] = 187] = "equalSign";
        key[key["comma"] = 188] = "comma";
        key[key["dash"] = 189] = "dash";
        key[key["period"] = 190] = "period";
        key[key["forwardSlash"] = 191] = "forwardSlash";
        key[key["graveAccent"] = 192] = "graveAccent";
        key[key["openBracket"] = 219] = "openBracket";
        key[key["backSlash"] = 220] = "backSlash";
        key[key["closeBracket"] = 221] = "closeBracket";
        key[key["singleQuote"] = 222] = "singleQuote";
    })(mediumJS.key || (mediumJS.key = {}));
    var key = mediumJS.key;
    ;
    var forwardArrowCodes = {};
    forwardArrowCodes[key.rightArrow] = true;
    forwardArrowCodes[key.downArrow] = true;
    forwardArrowCodes[key.pageDown] = true;
    forwardArrowCodes[key.end] = true;
    var backwardArrowCodes = {};
    backwardArrowCodes[key.leftArrow] = true;
    backwardArrowCodes[key.upArrow] = true;
    backwardArrowCodes[key.pageUp] = true;
    backwardArrowCodes[key.home] = true;
})(mediumJS || (mediumJS = {}));
