/// <reference path="../jslib/js/GenLMComLib.ts" />
/// <reference path="../schools/GenSchools.ts" />
var CourseModel;
(function (CourseModel) {
    (function (IconIds) {
        IconIds[IconIds["no"] = 0] = "no";
        IconIds[IconIds["a"] = 1] = "a";
        IconIds[IconIds["b"] = 2] = "b";
        IconIds[IconIds["c"] = 3] = "c";
        IconIds[IconIds["d"] = 4] = "d";
        IconIds[IconIds["e"] = 5] = "e";
        IconIds[IconIds["f"] = 6] = "f";
    })(CourseModel.IconIds || (CourseModel.IconIds = {}));
    var IconIds = CourseModel.IconIds;
    (function (CheckItemTexts) {
        CheckItemTexts[CheckItemTexts["yesNo"] = 0] = "yesNo";
        CheckItemTexts[CheckItemTexts["trueFalse"] = 1] = "trueFalse";
        CheckItemTexts[CheckItemTexts["no"] = 2] = "no";
    })(CourseModel.CheckItemTexts || (CourseModel.CheckItemTexts = {}));
    var CheckItemTexts = CourseModel.CheckItemTexts;
    (function (inlineControlTypes) {
        inlineControlTypes[inlineControlTypes["no"] = 0] = "no";
        inlineControlTypes[inlineControlTypes["GapFill"] = 1] = "GapFill";
        inlineControlTypes[inlineControlTypes["GapFill_Correction"] = 2] = "GapFill_Correction";
        inlineControlTypes[inlineControlTypes["WordSelection"] = 3] = "WordSelection";
        inlineControlTypes[inlineControlTypes["DragTarget"] = 4] = "DragTarget";
        inlineControlTypes[inlineControlTypes["img"] = 5] = "img";
        inlineControlTypes[inlineControlTypes["TtsSound"] = 6] = "TtsSound";
    })(CourseModel.inlineControlTypes || (CourseModel.inlineControlTypes = {}));
    var inlineControlTypes = CourseModel.inlineControlTypes;
    (function (JSStatus) {
        JSStatus[JSStatus["no"] = 0] = "no";
        JSStatus[JSStatus["genericHtml"] = 1] = "genericHtml";
        JSStatus[JSStatus["ctrl"] = 2] = "ctrl";
    })(CourseModel.JSStatus || (CourseModel.JSStatus = {}));
    var JSStatus = CourseModel.JSStatus;
    (function (CourseDataFlag) {
        CourseDataFlag[CourseDataFlag["needsEval"] = 1] = "needsEval";
        CourseDataFlag[CourseDataFlag["pcCannotEvaluate"] = 2] = "pcCannotEvaluate";
        CourseDataFlag[CourseDataFlag["hasExternalAttachments"] = 4] = "hasExternalAttachments";
        CourseDataFlag[CourseDataFlag["done"] = 8] = "done";
        CourseDataFlag[CourseDataFlag["passive"] = 16] = "passive";
        CourseDataFlag[CourseDataFlag["testImpl_result"] = 32] = "testImpl_result";
        CourseDataFlag[CourseDataFlag["testImpl"] = 64] = "testImpl";
        CourseDataFlag[CourseDataFlag["testSkillImpl"] = 128] = "testSkillImpl";
        CourseDataFlag[CourseDataFlag["ex"] = 256] = "ex";
        CourseDataFlag[CourseDataFlag["skipAbleRoot"] = 512] = "skipAbleRoot";
        CourseDataFlag[CourseDataFlag["modImpl"] = 1024] = "modImpl";
        CourseDataFlag[CourseDataFlag["pretestImp"] = 2048] = "pretestImp";
        CourseDataFlag[CourseDataFlag["multiTestImpl"] = 4096] = "multiTestImpl";
        CourseDataFlag[CourseDataFlag["testEx"] = 8192] = "testEx";
        CourseDataFlag[CourseDataFlag["all"] = 16127] = "all";
    })(CourseModel.CourseDataFlag || (CourseModel.CourseDataFlag = {}));
    var CourseDataFlag = CourseModel.CourseDataFlag;
    (function (modalSize) {
        modalSize[modalSize["normal"] = 0] = "normal";
        modalSize[modalSize["small"] = 1] = "small";
        modalSize[modalSize["large"] = 2] = "large";
    })(CourseModel.modalSize || (CourseModel.modalSize = {}));
    var modalSize = CourseModel.modalSize;
    (function (tgSt) {
        tgSt[tgSt["jsCtrl"] = 1] = "jsCtrl";
        tgSt[tgSt["cdata"] = 2] = "cdata";
        tgSt[tgSt["csControl"] = 4] = "csControl";
        tgSt[tgSt["isEval"] = 8] = "isEval";
        tgSt[tgSt["isArray"] = 32] = "isArray";
        tgSt[tgSt["noJSONQuote"] = 64] = "noJSONQuote";
        tgSt[tgSt["docIgnore"] = 128] = "docIgnore";
        tgSt[tgSt["xsdIgnore"] = 256] = "xsdIgnore";
        tgSt[tgSt["xmlIgnore"] = 512] = "xmlIgnore";
        tgSt[tgSt["jsonIgnore"] = 1024] = "jsonIgnore";
        tgSt[tgSt["obsolete"] = 2048] = "obsolete";
        tgSt[tgSt["xsdHtmlEl"] = 4096] = "xsdHtmlEl";
        tgSt[tgSt["xsdNoMixed"] = 8192] = "xsdNoMixed";
        tgSt[tgSt["xsdString"] = 16384] = "xsdString";
        tgSt[tgSt["xsdNoGlobal"] = 32768] = "xsdNoGlobal";
        tgSt[tgSt["xsdIgnoreTagAttrs"] = 65536] = "xsdIgnoreTagAttrs";
        tgSt[tgSt["xsdMixed"] = 131072] = "xsdMixed";
        tgSt[tgSt["xsdRequiredAttr"] = 262144] = "xsdRequiredAttr";
        tgSt[tgSt["metaJS_browse"] = 524288] = "metaJS_browse";
    })(CourseModel.tgSt || (CourseModel.tgSt = {}));
    var tgSt = CourseModel.tgSt;
    (function (offeringDropDownMode) {
        offeringDropDownMode[offeringDropDownMode["dropDownDiscard"] = 0] = "dropDownDiscard";
        offeringDropDownMode[offeringDropDownMode["dropDownKeep"] = 1] = "dropDownKeep";
        offeringDropDownMode[offeringDropDownMode["gapFillIgnore"] = 2] = "gapFillIgnore";
    })(CourseModel.offeringDropDownMode || (CourseModel.offeringDropDownMode = {}));
    var offeringDropDownMode = CourseModel.offeringDropDownMode;
    (function (smartOfferingMode) {
        smartOfferingMode[smartOfferingMode["gapFill"] = 0] = "gapFill";
        smartOfferingMode[smartOfferingMode["dropDownDiscard"] = 1] = "dropDownDiscard";
        smartOfferingMode[smartOfferingMode["dropDownKeep"] = 2] = "dropDownKeep";
        smartOfferingMode[smartOfferingMode["gapFillPassive"] = 3] = "gapFillPassive";
    })(CourseModel.smartOfferingMode || (CourseModel.smartOfferingMode = {}));
    var smartOfferingMode = CourseModel.smartOfferingMode;
    (function (inlineElementTypes) {
        inlineElementTypes[inlineElementTypes["no"] = 0] = "no";
        inlineElementTypes[inlineElementTypes["gapFill"] = 1] = "gapFill";
        inlineElementTypes[inlineElementTypes["gapFillCorrection"] = 2] = "gapFillCorrection";
        inlineElementTypes[inlineElementTypes["wordSelection"] = 3] = "wordSelection";
        inlineElementTypes[inlineElementTypes["dropDown"] = 4] = "dropDown";
        inlineElementTypes[inlineElementTypes["img"] = 5] = "img";
        inlineElementTypes[inlineElementTypes["ttsSound"] = 6] = "ttsSound";
    })(CourseModel.inlineElementTypes || (CourseModel.inlineElementTypes = {}));
    var inlineElementTypes = CourseModel.inlineElementTypes;
    (function (smartElementTypes) {
        smartElementTypes[smartElementTypes["no"] = 0] = "no";
        smartElementTypes[smartElementTypes["gapFill"] = 1] = "gapFill";
        smartElementTypes[smartElementTypes["dropDown"] = 2] = "dropDown";
        smartElementTypes[smartElementTypes["offering"] = 3] = "offering";
        smartElementTypes[smartElementTypes["img"] = 4] = "img";
        smartElementTypes[smartElementTypes["wordSelection"] = 5] = "wordSelection";
    })(CourseModel.smartElementTypes || (CourseModel.smartElementTypes = {}));
    var smartElementTypes = CourseModel.smartElementTypes;
    (function (colors) {
        colors[colors["black"] = 0] = "black";
        colors[colors["white"] = 1] = "white";
        colors[colors["primary"] = 2] = "primary";
        colors[colors["success"] = 3] = "success";
        colors[colors["info"] = 4] = "info";
        colors[colors["warning"] = 5] = "warning";
        colors[colors["danger"] = 6] = "danger";
    })(CourseModel.colors || (CourseModel.colors = {}));
    var colors = CourseModel.colors;
    (function (listIcon) {
        listIcon[listIcon["number"] = 0] = "number";
        listIcon[listIcon["letter"] = 1] = "letter";
        listIcon[listIcon["upperLetter"] = 2] = "upperLetter";
        listIcon[listIcon["angleDoubleRight"] = 3] = "angleDoubleRight";
        listIcon[listIcon["angleRight"] = 4] = "angleRight";
        listIcon[listIcon["arrowCircleORight"] = 5] = "arrowCircleORight";
        listIcon[listIcon["arrowCircleRight"] = 6] = "arrowCircleRight";
        listIcon[listIcon["arrowRight"] = 7] = "arrowRight";
        listIcon[listIcon["caretRight"] = 8] = "caretRight";
        listIcon[listIcon["caretSquareORight"] = 9] = "caretSquareORight";
        listIcon[listIcon["chevronCircleRight"] = 10] = "chevronCircleRight";
        listIcon[listIcon["chevronRight"] = 11] = "chevronRight";
        listIcon[listIcon["handORight"] = 12] = "handORight";
        listIcon[listIcon["longArrowRight"] = 13] = "longArrowRight";
        listIcon[listIcon["play"] = 14] = "play";
        listIcon[listIcon["playCircle"] = 15] = "playCircle";
        listIcon[listIcon["playCircleO"] = 16] = "playCircleO";
        listIcon[listIcon["circleONotch"] = 17] = "circleONotch";
        listIcon[listIcon["cog"] = 18] = "cog";
        listIcon[listIcon["refresh"] = 19] = "refresh";
        listIcon[listIcon["spinner"] = 20] = "spinner";
        listIcon[listIcon["squareO"] = 21] = "squareO";
        listIcon[listIcon["bullseye"] = 22] = "bullseye";
        listIcon[listIcon["asterisk"] = 23] = "asterisk";
        listIcon[listIcon["circle"] = 24] = "circle";
        listIcon[listIcon["circleO"] = 25] = "circleO";
        listIcon[listIcon["circleThin"] = 26] = "circleThin";
        listIcon[listIcon["dotCircleO"] = 27] = "dotCircleO";
    })(CourseModel.listIcon || (CourseModel.listIcon = {}));
    var listIcon = CourseModel.listIcon;
    (function (pairingLeftWidth) {
        pairingLeftWidth[pairingLeftWidth["normal"] = 0] = "normal";
        pairingLeftWidth[pairingLeftWidth["small"] = 1] = "small";
        pairingLeftWidth[pairingLeftWidth["xsmall"] = 2] = "xsmall";
        pairingLeftWidth[pairingLeftWidth["large"] = 3] = "large";
    })(CourseModel.pairingLeftWidth || (CourseModel.pairingLeftWidth = {}));
    var pairingLeftWidth = CourseModel.pairingLeftWidth;
    (function (threeStateBool) {
        threeStateBool[threeStateBool["no"] = 0] = "no";
        threeStateBool[threeStateBool["true"] = 1] = "true";
        threeStateBool[threeStateBool["false"] = 2] = "false";
    })(CourseModel.threeStateBool || (CourseModel.threeStateBool = {}));
    var threeStateBool = CourseModel.threeStateBool;
    CourseModel.meta = { "rootTagName": "tag", "types": { "smart-pairing": { "st": 6, "anc": "smart-element-low", "props": { "random": { "st": 64 }, "left-width": { "enumType": CourseModel.pairingLeftWidth } } }, "smart-offering": { "st": 6, "anc": "smart-element-low", "props": { "words": {}, "mode": { "enumType": CourseModel.smartOfferingMode } } }, "smart-element": { "st": 6, "anc": "smart-element-low", "props": { "inline-type": { "enumType": CourseModel.smartElementTypes } } }, "smart-element-low": { "anc": "macro-template", "props": {} }, "macro-article": { "st": 6, "anc": "macro-template", "props": {} }, "macro-vocabulary": { "st": 6, "anc": "macro-template", "props": {} }, "macro-video": { "st": 6, "anc": "macro-template", "props": { "cut-url": {}, "media-url": {}, "display-style": {} } }, "macro-true-false": { "st": 6, "anc": "macro-template", "props": { "text-id": { "enumType": CourseModel.CheckItemTexts } } }, "macro-single-choices": { "st": 6, "anc": "macro-template", "props": {} }, "macro-list-word-ordering": { "st": 6, "anc": "macro-template", "props": {} }, "macro-pairing": { "st": 6, "anc": "macro-template", "props": {} }, "macro-table": { "st": 6, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineControlTypes } } }, "macro-list": { "st": 6, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineControlTypes } } }, "macro-icon-list": { "st": 6, "anc": "macro-template", "props": { "delim": {}, "is-striped": { "st": 64 }, "icon": { "enumType": CourseModel.listIcon }, "color": { "enumType": CourseModel.colors } } }, "tag": { "st": 384, "props": { "id": { "st": 524288 }, "style-sheet": { "st": 1024 }, "srcpos": { "st": 384 }, "items": { "st": 640 }, "temporary-macro-item": { "st": 1600 }, "class": { "st": 160 }, "class-setter": { "st": 1664 } } }, "smart-tag": { "st": 2180, "anc": "tag", "props": { "correct": { "st": 64 }, "default-inline-type": { "st": 128, "enumType": CourseModel.inlineControlTypes }, "smart-text": { "st": 1536 } } }, "node": { "st": 4228, "anc": "tag", "props": {} }, "text": { "st": 384, "anc": "tag", "props": { "title": {} } }, "error": { "st": 16512, "anc": "tag", "props": { "msg": {} } }, "header-prop": { "st": 36992, "anc": "tag", "props": {} }, "eval-control": { "st": 392, "anc": "tag", "props": { "eval-group": { "st": 524288 }, "score-weight": { "st": 524352 }, "eval-button-id": { "st": 524288 } } }, "body": { "st": 131333, "anc": "tag", "props": { "snd-page": { "st": 640, "childPropTypes": "_snd-page" }, "eval-page": { "st": 640, "childPropTypes": "_eval-page" }, "url": { "st": 384 }, "order": { "st": 64 }, "instr-title": {}, "externals": { "st": 128 }, "see-also-links": {}, "old-ea-is-passive": { "st": 192 }, "is-old-ea": { "st": 192 }, "see-also": { "st": 1664 }, "title": { "st": 1536 }, "body-style": { "st": 1536 }, "instr-body": {}, "see-also-str": { "st": 128 }, "instrs": { "st": 1536 } } }, "eval-button": { "st": 13, "anc": "eval-control", "props": { "score-as-ratio": { "st": 64 } } }, "check-low": { "st": 8, "anc": "eval-control", "props": { "correct-value": { "st": 64 }, "text-type": { "enumType": CourseModel.CheckItemTexts }, "init-value": { "enumType": CourseModel.threeStateBool }, "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 } } }, "check-box": { "st": 13, "anc": "check-low", "props": {} }, "check-item": { "st": 4109, "anc": "check-low", "props": {} }, "offering": { "st": 5, "anc": "tag", "props": { "words": {}, "mode": { "st": 524288, "enumType": CourseModel.offeringDropDownMode }, "hidden": { "st": 524352 } } }, "radio-button": { "st": 4109, "anc": "eval-control", "props": { "correct-value": { "st": 64 }, "init-value": { "st": 64 }, "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 } } }, "single-choice": { "st": 4, "xsdChildElements": "c0_:['radio-button']", "anc": "tag", "props": { "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 }, "score-weight": { "st": 64 }, "eval-button-id": {} } }, "word-selection": { "st": 13, "anc": "eval-control", "props": { "words": {} } }, "word-multi-selection": { "st": 13, "anc": "eval-control", "props": { "words": {} } }, "word-ordering": { "st": 13, "anc": "eval-control", "props": { "correct-order": {} } }, "sentence-ordering": { "st": 13, "xsdChildElements": "c0_:['sentence-ordering-item']", "anc": "eval-control", "props": {} }, "sentence-ordering-item": { "st": 4101, "anc": "tag", "props": {} }, "edit": { "st": 392, "anc": "eval-control", "props": { "correct-value": {}, "width-group": { "st": 524288 }, "width": { "st": 524352 }, "offering-id": { "st": 524288 }, "case-sensitive": { "st": 524352 } } }, "gap-fill": { "st": 13, "anc": "edit", "props": { "hint": { "st": 524288 }, "init-value": {}, "read-only": { "st": 524352 }, "skip-evaluation": { "st": 524352 } } }, "drop-down": { "st": 13, "anc": "edit", "props": { "gap-fill-like": { "st": 524736 } } }, "pairing": { "st": 13, "xsdChildElements": "c0_:['pairing-item']", "anc": "eval-control", "props": { "left-random": { "st": 64 }, "left-width": { "enumType": CourseModel.pairingLeftWidth } } }, "pairing-item": { "st": 4101, "anc": "tag", "props": { "right": {} } }, "human-eval": { "st": 392, "anc": "eval-control", "props": {} }, "writing": { "st": 4109, "anc": "human-eval", "props": { "limit-recommend": { "st": 64 }, "limit-min": { "st": 64 }, "limit-max": { "st": 64 }, "number-of-rows": { "st": 64 } } }, "recording": { "st": 4109, "anc": "human-eval", "props": { "limit-recommend": { "st": 64 }, "limit-min": { "st": 64 }, "limit-max": { "st": 64 }, "record-in-dialog": { "st": 64 }, "dialog-header-id": {}, "dialog-size": { "enumType": CourseModel.modalSize }, "single-attempt": { "st": 64 } } }, "macro": { "st": 384, "anc": "tag", "props": {} }, "list": { "st": 4, "xsdChildElements": "c0_:['li']", "anc": "macro", "props": { "delim": {}, "is-striped": { "st": 64 }, "icon": { "enumType": CourseModel.listIcon }, "color": { "enumType": CourseModel.colors } } }, "list-group": { "st": 12293, "anc": "macro", "props": { "is-striped": { "st": 64 } } }, "two-column": { "st": 4101, "anc": "macro", "props": {} }, "panel": { "st": 131077, "xsdChildElements": "s:[{c01: ['header-prop']},{c0_: ['@flowContent']}]", "anc": "macro", "props": { "header": { "st": 640, "childPropTypes": "header-prop" } } }, "_eval-page": { "st": 384, "anc": "tag", "props": { "max-score": { "st": 64 }, "radio-groups-obj": { "st": 1536 }, "radio-groups": {} } }, "_eval-btn": { "st": 384, "anc": "tag", "props": { "btn-id": {} } }, "_eval-group": { "st": 384, "anc": "tag", "props": { "is-and": { "st": 64 }, "is-exchangeable": { "st": 64 }, "eval-control-ids": { "st": 32 }, "max-score": { "st": 1600 } } }, "_snd-page": { "st": 385, "anc": "tag", "props": {} }, "_snd-file-group": { "st": 385, "anc": "url-tag", "props": {} }, "_snd-group": { "st": 385, "anc": "tag", "props": { "intervals": { "st": 1536 }, "sf": { "st": 1536 }, "is-passive": { "st": 1600 } } }, "_snd-interval": { "st": 384, "anc": "tag", "props": {} }, "_snd-sent": { "st": 384, "anc": "tag", "props": { "idx": { "st": 64 }, "beg-pos": { "st": 64 }, "end-pos": { "st": 64 }, "text": {}, "actor": {} } }, "media-text": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": { "continue-media-id": { "st": 1024 }, "passive": { "st": 64 }, "is-old-to-new": { "st": 192 }, "hidden": { "st": 64 } } }, "_media-replica": { "st": 389, "anc": "tag", "props": { "icon-id": { "enumType": CourseModel.IconIds }, "dlg-left": { "st": 64 }, "actor": {} } }, "_media-sent": { "st": 131461, "anc": "tag", "props": { "idx": { "st": 64 } } }, "include": { "st": 384, "anc": "tag", "props": { "cut-url": { "st": 262144 } } }, "include-text": { "st": 98304, "xsdChildElements": "c0_:['phrase-replace']", "anc": "include", "props": {} }, "include-dialog": { "st": 98304, "xsdChildElements": "c0_:['phrase-replace']", "anc": "include", "props": {} }, "phrase-replace": { "st": 102400, "anc": "tag", "props": { "phrase-idx": { "st": 64 }, "replica-phrase-idx": {} } }, "_snd-file": { "st": 384, "anc": "url-tag", "props": { "file": { "st": 640, "childPropTypes": "include-text|include-dialog" }, "temp-replicas": { "st": 1536 } } }, "cut-dialog": { "st": 98308, "xsdChildElements": "s:[{c01:['include-text']},{c0_:['replica']}]", "anc": "_snd-file", "props": {} }, "cut-text": { "st": 98308, "xsdChildElements": "c01:[{c01:['include-dialog']},{c0_:['phrase']}]", "anc": "_snd-file", "props": {} }, "phrase": { "st": 102405, "anc": "tag", "props": { "beg-pos": { "st": 64 }, "end-pos": { "st": 64 }, "idx": { "st": 1600 }, "text": { "st": 1536 }, "actor": { "st": 1536 } } }, "replica": { "st": 98309, "xsdChildElements": "c0_:['phrase']", "anc": "tag", "props": { "actor-id": { "enumType": CourseModel.IconIds }, "actor-name": {}, "number-of-phrases": { "st": 64 } } }, "url-tag": { "anc": "tag", "props": { "media-url": { "st": 1024 }, "any-url": { "st": 1536 }, "is-video": { "st": 1600 } } }, "media-tag": { "st": 384, "anc": "url-tag", "props": { "cut-url": { "st": 1024 }, "subset": { "st": 1024 }, "share-media-id": { "st": 1024 }, "_sent-group-id": { "st": 384 }, "file": { "st": 1664, "childPropTypes": "cut-dialog|cut-text|include-text|include-dialog" } } }, "media-big-mark": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "media-player": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "media-video": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "tts-sound": { "st": 133, "anc": "media-tag", "props": { "text": {} } }, "macro-template": { "st": 384, "anc": "macro", "props": { "name": {}, "cdata": {} } }, "inline-tag": { "st": 16388, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineElementTypes } } }, "html-tag": { "st": 384, "anc": "tag", "props": { "tag-name": {}, "attrs": { "st": 384 } } }, "script": { "st": 386, "anc": "tag", "props": { "cdata": {} } }, "img": { "st": 384, "anc": "tag", "props": { "src": {} } }, "extension": { "st": 143, "anc": "eval-control", "props": { "data": {}, "cdata": {} } }, "doc-example": { "st": 133, "xsdChildElements": "s:[{c01: ['header-prop']},{c01: ['doc-descr']},{c0_: ['@flowContent']}]", "anc": "tag", "props": { "todo": { "st": 64 }, "code-listing": {}, "code-post-listing": {}, "header": { "st": 512, "childPropTypes": "header-prop" }, "descr": { "st": 512, "childPropTypes": "doc-descr" }, "eval-btn": { "st": 512, "childPropTypes": "eval-btn" } } }, "drag-target": { "st": 8, "anc": "edit", "props": {} }, "doc-named": { "st": 384, "anc": "tag", "props": { "name": {}, "summary": {}, "cdata": {} } }, "doc-type": { "st": 386, "anc": "doc-named", "props": { "is-html": { "st": 64 }, "is-ign": { "st": 64 }, "descendants-and-self": { "st": 32 }, "my-props": { "st": 32 }, "xref": {} } }, "doc-enum": { "st": 386, "anc": "doc-named", "props": { "xref": {}, "enums": { "st": 544, "childPropTypes": "doc-enum-item" } } }, "doc-enum-item": { "st": 386, "anc": "doc-named", "props": { "xref": {} } }, "doc-prop": { "st": 386, "anc": "doc-named", "props": { "owner-type": {}, "data-type": {}, "xref": {}, "is-html": { "st": 64 } } }, "doc-descr": { "st": 36992, "anc": "tag", "props": {} }, "doc-tags-meta": { "st": 384, "anc": "tag", "props": { "types": { "st": 544, "childPropTypes": "doc-type" }, "props": { "st": 544, "childPropTypes": "doc-prop" }, "enums": { "st": 544, "childPropTypes": "doc-enum" } } } } };
    CourseModel.tsmartPairing = 'smart-pairing';
    CourseModel.tsmartOffering = 'smart-offering';
    CourseModel.tsmartElement = 'smart-element';
    CourseModel.tsmartElementLow = 'smart-element-low';
    CourseModel.tmacroArticle = 'macro-article';
    CourseModel.tmacroVocabulary = 'macro-vocabulary';
    CourseModel.tmacroVideo = 'macro-video';
    CourseModel.tmacroTrueFalse = 'macro-true-false';
    CourseModel.tmacroSingleChoices = 'macro-single-choices';
    CourseModel.tmacroListWordOrdering = 'macro-list-word-ordering';
    CourseModel.tmacroPairing = 'macro-pairing';
    CourseModel.tmacroTable = 'macro-table';
    CourseModel.tmacroList = 'macro-list';
    CourseModel.tmacroIconList = 'macro-icon-list';
    CourseModel.ttag = 'tag';
    CourseModel.tsmartTag = 'smart-tag';
    CourseModel.tnode = 'node';
    CourseModel.ttext = 'text';
    CourseModel.terror = 'error';
    CourseModel.theaderProp = 'header-prop';
    CourseModel.tevalControl = 'eval-control';
    CourseModel.tbody = 'body';
    CourseModel.tevalButton = 'eval-button';
    CourseModel.tcheckLow = 'check-low';
    CourseModel.tcheckBox = 'check-box';
    CourseModel.tcheckItem = 'check-item';
    CourseModel.toffering = 'offering';
    CourseModel.tradioButton = 'radio-button';
    CourseModel.tsingleChoice = 'single-choice';
    CourseModel.twordSelection = 'word-selection';
    CourseModel.twordMultiSelection = 'word-multi-selection';
    CourseModel.twordOrdering = 'word-ordering';
    CourseModel.tsentenceOrdering = 'sentence-ordering';
    CourseModel.tsentenceOrderingItem = 'sentence-ordering-item';
    CourseModel.tedit = 'edit';
    CourseModel.tgapFill = 'gap-fill';
    CourseModel.tdropDown = 'drop-down';
    CourseModel.tpairing = 'pairing';
    CourseModel.tpairingItem = 'pairing-item';
    CourseModel.thumanEval = 'human-eval';
    CourseModel.twriting = 'writing';
    CourseModel.trecording = 'recording';
    CourseModel.tmacro = 'macro';
    CourseModel.tlist = 'list';
    CourseModel.tlistGroup = 'list-group';
    CourseModel.ttwoColumn = 'two-column';
    CourseModel.tpanel = 'panel';
    CourseModel.t_evalPage = '_eval-page';
    CourseModel.t_evalBtn = '_eval-btn';
    CourseModel.t_evalGroup = '_eval-group';
    CourseModel.t_sndPage = '_snd-page';
    CourseModel.t_sndFileGroup = '_snd-file-group';
    CourseModel.t_sndGroup = '_snd-group';
    CourseModel.t_sndInterval = '_snd-interval';
    CourseModel.t_sndSent = '_snd-sent';
    CourseModel.tmediaText = 'media-text';
    CourseModel.t_mediaReplica = '_media-replica';
    CourseModel.t_mediaSent = '_media-sent';
    CourseModel.tinclude = 'include';
    CourseModel.tincludeText = 'include-text';
    CourseModel.tincludeDialog = 'include-dialog';
    CourseModel.tphraseReplace = 'phrase-replace';
    CourseModel.t_sndFile = '_snd-file';
    CourseModel.tcutDialog = 'cut-dialog';
    CourseModel.tcutText = 'cut-text';
    CourseModel.tphrase = 'phrase';
    CourseModel.treplica = 'replica';
    CourseModel.turlTag = 'url-tag';
    CourseModel.tmediaTag = 'media-tag';
    CourseModel.tmediaBigMark = 'media-big-mark';
    CourseModel.tmediaPlayer = 'media-player';
    CourseModel.tmediaVideo = 'media-video';
    CourseModel.tttsSound = 'tts-sound';
    CourseModel.tmacroTemplate = 'macro-template';
    CourseModel.tinlineTag = 'inline-tag';
    CourseModel.thtmlTag = 'html-tag';
    CourseModel.tscript = 'script';
    CourseModel.timg = 'img';
    CourseModel.textension = 'extension';
    CourseModel.tdocExample = 'doc-example';
    CourseModel.tdragTarget = 'drag-target';
    CourseModel.tdocNamed = 'doc-named';
    CourseModel.tdocType = 'doc-type';
    CourseModel.tdocEnum = 'doc-enum';
    CourseModel.tdocEnumItem = 'doc-enum-item';
    CourseModel.tdocProp = 'doc-prop';
    CourseModel.tdocDescr = 'doc-descr';
    CourseModel.tdocTagsMeta = 'doc-tags-meta';
    CourseModel.gaffFill_normTable = {
        1040: 'A', 1072: 'a', 1042: 'B', 1074: 'b', 1045: 'E', 1077: 'e', 1050: 'K', 1082: 'k', 1052: 'M', 1084: 'm', 1053: 'H', 1085: 'h', 1054: 'O', 1086: 'o', 1056: 'P', 1088: 'p', 1057: 'C', 1089: 'c', 1058: 'T', 1090: 't', 1059: 'Y', 1091: 'y', 1061: 'X', 1093: 'x', 1105: '?', 161: '!', 160: ' ', 191: '?', 241: '?', 39: '?', 96: '?', 180: '?', 733: '"', 8216: '?', 8219: '?', 8220: '"', 8221: '"', 8222: '"', 8242: '?', 8243: '"'
    };
})(CourseModel || (CourseModel = {}));
