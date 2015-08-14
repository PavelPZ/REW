/*
SQL Server word breking and stemming
SELECT  *  FROM sys.dm_fts_parser ('FORMSOF( FREETEXT, "koněm")', 1029, 0, 1)
SELECT * FROM sys.dm_fts_parser (N'FORMSOF ( FREETEXT, "берлинский")', 1049, 0, 1)
select * from sys.fulltext_languages
*/
var DictConnector;
(function (DictConnector) {
    function initDict(add) {
        //if (cfg.dictType == schools.dictTypes.no) { actDictData = null; /*completed();*/ return; }
        //courseLang = LMComLib.LineToLang[line]; actLoc = loc; //dictType = d;
        //readDictInfo(completed);
        DictConnector.actDictData = add;
        if (initialized)
            return;
        initialized = true;
        //**************** events
        $(document).bind('keydown', function (ev) {
            if (DictConnector.actDictData == null)
                return;
            switch (ev.which) {
                case 67: //C           
                case 81:
                    if (!ev.ctrlKey)
                        return;
                    if (ev.which == 67 && selectedText() != '')
                        break;
                    keyMousePos = anim.mousePos; //zapamatuj si aktualni pozici mysi
                    callDict();
                    //readDictInfo(() => setTimeout(callDict, 1));
                    break;
            }
        });
        //*********** popuo okno
        $(function () {
            if (!model) {
                model = new dictModel();
                dlg = JsRenderTemplateEngine.createGlobalTemplate('Dict', model);
                dlg.css('display', 'none');
                dlg.click(function (ev) { ev.cancelBubble = true; ev.stopPropagation(); return false; });
                dlgBody = dlg.find('.panel-content');
            }
            ko.applyBindings(model, dlg[0]);
        });
    }
    DictConnector.initDict = initDict;
    var initialized = false;
    var dictModel = (function () {
        function dictModel() {
            this.height = ko.observable(0);
            this.header = ko.observable("");
            this.body = ko.observable("");
            this.cpv = new schoolCpv.model(schools.tDictCpv, null);
        }
        return dictModel;
    })();
    var dlg; //modalni popup
    var dlgBody; //obsah
    var isCtrlDown = false; /*ctrl key je stisknut*/
    var keyMousePos; /*souradnice mysi, zkopirovane v key-down z current_ev*/
    var model; //model
    DictConnector.actDictData; //data Lingea slovniku pro modul, inicializovano v gramatice a modulu
    //var dicts: LMComLib.Dict[];
    function callDict() {
        if (DictConnector.actDictData == null)
            return;
        schoolCpv.hide(schools.tDictCpv);
        Logger.trace_dict('Dict: wordUnderCursorStart (top=' + keyMousePos.clientY.toString() + ",left=" + keyMousePos.clientX.toString());
        var hit_elem = $(document.elementFromPoint(keyMousePos.clientX, keyMousePos.clientY));
        Logger.trace_dict("top=" + hit_elem.offset().top.toString() + ",left=" + hit_elem.offset().left.toString() + ',html=' + hit_elem.html() + ',parent html=' + hit_elem.parent().html());
        //Logger.trace_dict('Dict: actDictId = ' + actDict.Code);
        var textNodes = [];
        var textNodesText = [];
        hit_elem.contents().filter(function () {
            return this.nodeType == 3;
        }).each(function (i) { textNodes.push($(this)); textNodesText.push($(this).text()); });
        if (textNodes.length <= 0)
            return;
        //proved word wrap 
        var data = startSplitWords(textNodesText);
        Logger.trace_dict('Dict: wordWrap, 1.sent = ' + data[0].join(''));
        //nahrad slova word-spany
        for (var i = 0; i < data.length; i++) {
            var toRepl = [];
            $.each(data[i], function (i, val) {
                //na IE8 se ztraci mezery
                //var el = $('<span class="w">' + val + '</span>')[0];
                var sp = document.createElement('span');
                var att = document.createAttribute("class");
                att.value = 'w';
                sp.setAttributeNode(att);
                sp.appendChild(document.createTextNode(val));
                var el = $(sp);
                toRepl.push(el);
            });
            textNodes[i].replaceWith(toRepl);
        }
        setTimeout(function () {
            var new_nodes = hit_elem.contents().filter('span.w');
            //get the exact word under cursor 
            var el = document.elementFromPoint(keyMousePos.clientX, keyMousePos.clientY);
            var hit_word_elem = $(el);
            if (el == null || !hit_word_elem.hasClass("w")) {
                Logger.trace_dict("null or not w-class" + 'cursor top=' + keyMousePos.clientY.toString() + ",left=" + keyMousePos.clientX.toString());
                for (var i = 0; i < new_nodes.length; i++) {
                    var we = $(new_nodes[i]);
                    Logger.trace_dict("*** element top=" + we.offset().top.toString() + ",left=" + we.offset().left.toString() + ",width=" + we.width().toString() + ",height=" + we.height().toString() + ',html=' + we.html());
                }
                new_nodes.replaceWith(function () { return $(this).contents(); });
                return;
            }
            Logger.trace_dict('cursor top=' + keyMousePos.clientY.toString() + ",left=" + keyMousePos.clientX.toString() +
                "; element top=" + hit_word_elem.offset().top.toString() + ",left=" + hit_word_elem.offset().left.toString() + ",width=" + hit_word_elem.width().toString() + ",height=" + hit_word_elem.height().toString() + ',html=' + hit_word_elem.html());
            var actWord = hit_word_elem.text();
            Logger.trace_dict('Dict: ct_word=' + actWord);
            //return original content:
            new_nodes.replaceWith(function () { return $(this).contents(); });
            //normalize word
            var splitWord = finishSplitWord(actWord, DictConnector.actDictData.crsLang);
            actWord = splitWord.word;
            if (actWord == null)
                return;
            var key = DictConnector.actDictData.Keys[actWord];
            var html;
            if (!key)
                html = "Cannot find " + splitWord.wordRaw;
            else {
                var res = [];
                parseLingeaDict(actWord, DictConnector.actDictData.Entries[key], DictConnector.actDictData.Tags, res);
                html = res.join(' ');
            }
            showWindow(splitWord.wordRaw, html);
        }, 1);
    }
    ;
    function parseLingeaDict(actWord, it, tags, res) {
        if (!it.tag) {
            if (it.text)
                res.push(it.text);
            return;
        }
        var tagStr = tags[it.tag];
        var tg = tagStr.split(' ')[0];
        if (tg == 'sound') {
            if (!cfg.dictNoSound) {
                var url = Pager.basicUrl + it.text;
                //res.push(Utils.string_format(soundMarkHtmlNew, ['../' + url, actWord.replace('\'', '\\\'')]));
                res.push(Utils.string_format(soundMarkHtmlNew, [url, actWord.replace('\'', '\\\'')]));
            }
        }
        else {
            res.push('<' + tagStr + '>');
            if (it.text)
                res.push(it.text);
            if (it.items)
                _.each(it.items, function (subIt) { return parseLingeaDict(actWord, subIt, DictConnector.actDictData.Tags, res); });
            res.push('</' + tg + '>');
        }
    }
    function playFile(url) { setTimeout(function () { return LMSnd.Player.playFile(url, 0); }, 1); }
    DictConnector.playFile = playFile;
    var soundMarkHtmlNew = [
        '<span class="sound-repro-new fa fa-volume-off" onclick="DictConnector.playFile(\'{0}\', 0)"></span>',
        '<span class="sound-listen-talk-new fa fa-microphone" onclick="schoolCpv.show(schools.tDictCpv, \'{0}\', \'{1}\')"></span>',
    ].join('');
    function showWindow(word, html) {
        //vloz data do popup okna
        model.body(html);
        model.header(word);
        anim.showMenu(dlg, anim.mousePos);
    }
    ;
    var selectedText = function () {
        var t = '';
        if (window.getSelection)
            t = window.getSelection();
        else if (document.getSelection)
            t = document.getSelection();
        else if (document.selection)
            t = document.selection.createRange().text;
        return t;
    };
    var russianAccent = "\u0301";
    var wrongCyrilic = { 'á': "а" + russianAccent, 'a': "а", 'p': "р", 'e': "е", 'y': "у", 'c': "с", 'ë': "ё", 'ý': "у" + russianAccent, 'é': "е" + russianAccent, 'x': "х", 'ó': "о" + russianAccent, 'm': "м", 'o': "о" };
    function isWordChar(ch) {
        return Unicode.isLetter(ch) || ch == russianAccent || ch == '-' || ch == "'"; // || ch == "'" || ch == "’" || ch == russianAccent;
    }
    ;
    function normalizeRussian(s) {
        var rep = [];
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            var ok = wrongCyrilic[ch];
            rep.push(ok ? ok.charAt(0) : ch);
        }
        return rep.join('');
    }
    function startSplitWords(sentences) {
        var res = new Array(sentences.length);
        for (var i = 0; i < sentences.length; i++) {
            var sentRes = startSplitWord(sentences[i]);
            res[i] = sentRes;
        }
        return res;
    }
    //funkce musi odpovidat d:\LMCom\rew\NewLMComModel\Design\Dictionaries.cs, wordsForDesignTime
    function startSplitWord(sent) {
        if (_.isEmpty(sent))
            return [];
        var res = [];
        var word = [];
        var wordCharFound = false;
        for (var i = 0; i < sent.length; i++) {
            var ch = sent.charAt(i);
            var isWord = isWordChar(ch);
            if (isWord)
                wordCharFound = true;
            if (wordCharFound && word.length > 0 && !isWord) {
                res.push(word.join(''));
                word = [];
                wordCharFound = false;
            }
            word.push(ch);
        }
        if (word.length > 0)
            res.push(word.join(''));
        return res;
    }
    DictConnector.startSplitWord = startSplitWord;
    function finishSplitWord(word, crsLang) {
        if (_.isEmpty(word))
            return null;
        if (crsLang == LMComLib.Langs.ru_ru)
            word = normalizeRussian(word);
        var res = [];
        var resRaw = [];
        for (var i = 0; i < word.length; i++) {
            var ch = word.charAt(i);
            var isWord = isWordChar(ch);
            if (isWord) {
                resRaw.push(ch);
                if (ch != russianAccent)
                    res.push(ch);
            }
            else if (res.length > 0 && !isWord)
                break;
        }
        return res.length > 0 ? { word: res.join('').toLowerCase(), wordRaw: resRaw.join('') } : null;
    }
    function wordsForDesignTime(sent, crsLang, res) {
        if (_.isEmpty(sent))
            return null;
        sent = sent.toLowerCase();
        if (crsLang == LMComLib.Langs.ru_ru)
            sent = normalizeRussian(sent);
        var word = [];
        for (var i = 0; i <= sent.length; i++) {
            var ch = i < sent.length ? sent.charAt(i) : ' ';
            var isWord = isWordChar(ch);
            if (isWord)
                word.push(ch);
            else if (word.length > 0 && !isWord) {
                res.push(word.join(''));
                word = [];
            }
        }
    }
    DictConnector.wordsForDesignTime = wordsForDesignTime;
})(DictConnector || (DictConnector = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_dict(msg) {
        Logger.trace("Dict", msg);
    }
    Logger.trace_dict = trace_dict;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var noop_dict = null;
