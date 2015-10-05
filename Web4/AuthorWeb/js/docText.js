var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var waObjs;
(function (waObjs) {
    (function (keyDownResult) {
        keyDownResult[keyDownResult["no"] = 0] = "no";
        keyDownResult[keyDownResult["true"] = 1] = "true";
        keyDownResult[keyDownResult["false"] = 2] = "false";
    })(waObjs.keyDownResult || (waObjs.keyDownResult = {}));
    var keyDownResult = waObjs.keyDownResult;
    //export interface editorLow {
    //  $self: JQuery;
    //  edit: JQuery;
    //  view: JQuery;
    //  text: string;
    //}
    //export function editorConstructor(self: editorLow) {
    //  self.edit = self.$self.find('> textarea');
    //  var pre = self.$self.find('> pre');
    //  self.view = pre.find('> span');
    //}
    //************* TEXT *****************
    var text = (function (_super) {
        __extends(text, _super);
        //escaped: string;
        function text(data, $parent, parent) {
            _super.call(this, data, $parent, parent);
            this.selfProps = waObjs.ITextProps;
            this.lastRefresh = 0;
            if (!data)
                return;
            var self = this;
            self.edit = self.$self.find('> textarea');
            var pre = self.$self.find('> pre');
            self.view = pre.find('> span');
            if (bowser.agent.msie) {
                self.edit.css('whiteSpace', 'pre');
                self.view.css('whiteSpace', 'pre');
                pre.css('whiteSpace', 'pre');
            }
            //http://stackoverflow.com/questions/2823733/textarea-onchange-detection
            self.edit.on('input onpropertychange', function () {
                self.text = self.edit.val();
                //self.setText();
                self.notifyTextChanged(true);
            });
            self.edit.on("keydown", function (ev) {
                //IE hack: DEL a BACKSPACE se nevola v on('input onpropertychange')
                if (bowser.agent.msie && (ev.keyCode == key.k_delete || ev.keyCode == key.backspace)) {
                    setTimeout(function () { return self.notifyTextChanged(true); }, 1);
                    return;
                }
                var rng = textRange.getRange(self.edit); //text a range
                if (rng.start > 0 && self.text[rng.start - 1] == '\\')
                    return true; // '\<any>' => continue
                var mark = self.marks.findMark(rng.start).mark; //mark ve ktere je caret
                if (mark != null && mark.type == waObjs.markType.inline && rng.start == rng.end) {
                    var res = mark.keyDown(self, rng, ev); //inline pars editor
                    switch (res) {
                        case keyDownResult.true: return true;
                        case keyDownResult.false: return false;
                        default: break; //continue procesing
                    }
                }
                if (ev.keyCode != key.openBracket)
                    return true;
                //edit or insert?
                if (mark == null)
                    mark = self.marks.insertCaretMark(rng.start); //neni => vloz a vrat specialni caret mark
                if (mark.type != waObjs.markType.caret) {
                    alert('Edit todo');
                }
                else {
                    new waObjs.DlgOpenBracket(self.edit, rng, mark.$self, function ($btn) {
                        //dlgOpenBracket.showForText(self.edit, rng, mark.$self,($btn: JQuery) => {
                        var dlgRes = ($btn.data('dlgRes'));
                        var parts = dlgRes.split(':');
                        var grp = parts[0];
                        var grpItem = parts[1];
                        if (grp == 'inline' || grp == 'style' || (grp == 'span' && rng.start == rng.end)) {
                            return self.insertSnipset($btn.data('sm-gen'), rng);
                        }
                        else if (grp == 'span') {
                            return self.surroundSpan(rng);
                        }
                        else if (grp == 'block') {
                            self.parent.insert(self, rng, self.text, grpItem); //vloz block
                        }
                        else
                            throw 'not implemented';
                        return null;
                    });
                }
                return false;
            });
            self.notifyTextChanged(false);
        }
        text.prototype.setText = function (text) {
            if (text === void 0) { text = null; }
            if (text != null)
                this.edit.val(text);
            else
                text = this.edit.val();
            this.text = text;
            this.marks = new waObjs.viewmarks(text, this.view);
        };
        text.prototype.toHTMLString = function () {
            return '<div class="sm-text"><textarea>' + this.text + '</textarea><pre class="sm-view"><span></span><br /></pre></div>';
        };
        text.prototype.notifyTextChanged = function (inUserAction) {
            var self = this;
            if (self.refreshTimer) {
                clearTimeout(self.refreshTimer);
                self.refreshTimer = 0;
            }
            if (!inUserAction || self.text.length < 400) {
                self.setText();
                self.lastRefresh = new Date().getTime();
                self.root.notifyDataChanged();
                return;
            }
            var now = new Date().getTime();
            if (self.lastRefresh == 0 || now - self.lastRefresh < text.updateSpeed) {
                self.setText();
                self.lastRefresh = now;
                self.root.notifyDataChanged();
                return;
            }
            self.refreshTimer = setTimeout(function () {
                clearTimeout(self.refreshTimer);
                self.refreshTimer = 0;
                self.lastRefresh = new Date().getTime();
                self.setText();
                self.root.notifyDataChanged();
            }, text.updateSpeed);
        };
        //vlozeni mask na pozici caret
        text.prototype.insertSnipset = function (mask, rng) {
            var self = this;
            var caretIdx = mask.indexOf('|');
            self.setText(self.text.substr(0, rng.start) + mask.replace('|', '') + self.text.substr(rng.start));
            self.notifyTextChanged(false);
            return { start: rng.start + caretIdx, end: rng.start + caretIdx };
        };
        //obaleni selekce {**} zavorkou
        text.prototype.surroundSpan = function (rng) {
            var self = this;
            if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx) {
                return self.insertSnipset('{*| *}', rng);
            }
            self.setText(self.text.substr(0, rng.start) + '{* ' + self.text.substring(rng.start, rng.end) + '*}' + self.text.substr(rng.end));
            self.notifyTextChanged(false);
            return { start: rng.start + 2, end: rng.start + 2 };
        };
        text.updateSpeed = 500;
        return text;
    })(waObjs.item);
    waObjs.text = text;
    //http://www.javascripter.net/faq/keycodes.htm
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
    })(waObjs.key || (waObjs.key = {}));
    var key = waObjs.key;
    ;
    function isEq(code) { return bowser.agent.firefox ? code == 61 : code == 187; }
    waObjs.isEq = isEq;
    function isSemicolon(code) { return bowser.agent.firefox ? code == 59 : code == 186; }
    waObjs.isSemicolon = isSemicolon;
})(waObjs || (waObjs = {}));
//if (ch == '{') { //automaticke doplneni } po zapsani {
//  var rng = textRange.getRange(self.edit);
//  if (rng.start > 0 && self.edit.val()[rng.start - 1] == '\\') return true; //\{
//  textRange.replace(self.edit, '{}');
//  textRange.setcursor(self.edit, rng.start + 1);
//  self.notifyTextChanged();
//  return false;
//} else if (ch == '*' || ch == 'x#') { //automaticke doplneni * nebo # po zapsani {* nebo {#
//  var edVal: string = self.edit.val(); var edEscaped = waCompiler.escape(edVal);
//  var rng = textRange.getRange(self.edit);
//  if (rng.start > 0 && edEscaped.substr(rng.start - 1, 2) != '{}') return true; //not {}
//  var newEd = edVal.substr(0, rng.start - 1) + '{' + ch + /*' ' +*/ ch + '}' + edVal.substr(rng.start + 1);
//  self.edit.val(newEd);
//  textRange.setcursor(self.edit, rng.start + 1);
//  self.notifyTextChanged();
//  return false;
//} else if (ch == '#') {
//  var edVal: string = self.edit.val(); var rng = textRange.getRange(self.edit);
//  edVal = edVal.substr(0, rng.start) + setRangeSpan(rng.start, rng.end, '') + edVal.substr(rng.start);
//  self.view.html(edVal);
//  modalOpenBracketInst.show(self, rng, () => {
//    return true;
//  });
//  return false;
//DEL v IE 
//if (bowser.agent.msie)
//  self.edit.on('keypress', ev => {
//    if (ev.keyCode == key.k_delete) self.notifyTextChanged();
//  });
//self.edit.on("focus blur keydown keyup paste click mousedown", ev => {
//self.edit.on('contextmenu', ev => {
//self.edit.trigger('click');
//var span = _.find(this.marks.marks, m => {
//  var off = m.$self.offset(); var w = m.$self.width(); var h = m.$self.height();
//  var res = ev.pageX >= off.left && ev.pageX <= off.left + w && ev.pageY >= off.top && ev.pageY <= off.top + h;
//  return res;
//});
//return false;
//});
/*
//var cloneCSSProperties = [
//  'lineHeight', 'textDecoration', 'letterSpacing',
//  'fontSize', 'fontFamily', 'fontStyle', 'fontVariant',
//  'fontWeight', 'textTransform', 'textAlign',
//  'direction', 'fontSizeAdjust',
//  'wordSpacing', 'wordWrap', 'wordBreak',
//  'whiteSpace',
//];
*/
