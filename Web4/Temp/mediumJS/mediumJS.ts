//http://rangy.googlecode.com/svn/trunk/demos/
//https://github.com/timdown/rangy/wiki/Rangy-Selection
//https://github.com/timdown/rangy/wiki/Rangy-Range
//https://github.com/timdown/rangy/wiki/Rangy-Object

//declare var Medium: any; 
declare var rangy;
declare var bililiteRange: any;
module mediumJS {
  var actDiv: HTMLElement = null;
  export function start(editorId: string) {
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
  export class editable {
    constructor(public el: JQuery) {
      el.on("focus blur keydown keyup paste click mousedown", ev => {
        //***** ochrana .read-only elementu
        var blocks = $(ev.target).closest(".read-only");
        if (blocks.length == 0 && ev.type == "keydown") {
          var forw = false;
          if ((forw = forwardArrowCodes[ev.which]) || backwardArrowCodes[ev.which]) { //pro key events je ev.target vzdy contenteditable nadrazeny div => zkus proto najit inner element pomoci rangy
            setTimeout(() => { //pockej az se event dokonci, aby se zjistila aktualni range
              var range = rangy.getSelection().getRangeAt(0); //aktualni selection range
              var start: Node = range.startContainer; //vlastnik selekce
              if (start.nodeType == Node.TEXT_NODE) start = start.parentNode; //text => dej parenta
              blocks = $(start).closest(".read-only");
              if (blocks.length == 0) return;
              if (forw) range.collapseAfter(blocks[0]); else range.collapseBefore(blocks[0]); range.select(); //selection (karet) je v inner elementu - pak neni sance jej z nej dostat, zmen jej
            }, 1);
            return;
          } else if (ev.which == key.backspace || ev.which == key.k_delete) {
            //var ROs = _.map(el.find('.read-only'), jq => bililiteRange(jq));
            var isDel = ev.which == key.k_delete;
            //http://www.w3.org/TR/DOM-Level-3-Events-key/
            //http://bililite.com/blog/2015/01/14/bililiterange-sendkeys/
            //http://bililite.com/blog/2011/01/17/cross-browser-text-ranges-and-selections/
            var rng = bililiteRange(el[0]).bounds('selection');
            //if (rng._bounds[0] != rng._bounds[1]) return true;
            //var oldPos = rng._bounds[0];
            if (rng._bounds[0] == 0 && rng._bounds[1] == 0) return false;
            else if (isDel && rng._bounds[0] == 0 && rng._bounds[1] == 1) return false;
            console.log(rng._bounds[0].toString() + '-' + rng._bounds[1].toString());
            rng.sendkeys(isDel ? '{ArrowRight}' : '{ArrowLeft}').select(); 
            var isRO = false;
            try {
              var range = rangy.getSelection().getRangeAt(0);
              var start: Node = range.endContainer;
              if (start.nodeType == Node.TEXT_NODE) start = start.parentNode; //text => dej parenta
              if ($(start).closest(".read-only").length > 0) isRO = true;
            } finally {
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
            var start: Node = range.startContainer;
            if ($(start.parentNode).closest(".read-only").length > 0) return false;
            //if (start.nodeType == Node.TEXT_NODE) start = start.parentNode; //text => dej parenta
            //if (start && $(start).closest(".read-only").length > 0) return false;
          } else if (ev.which == key.k_delete || ev.which == key.backspace) {
            var isDel = ev.which == key.k_delete;
            var range = rangy.getSelection().getRangeAt(0);
            var ros = el.find('.read-only');
            var start: Node = range.endContainer;
            var retCode = true;
            if (start.nodeType == Node.TEXT_NODE) {
              if ($(start.parentNode).closest(".read-only").length > 0) return false;
              var text = <CharacterData>start;
              if (isDel && text.length != range.endOffset) return true; else if (!isDel && range.endOffset>0) return true;
              _.each(ros, ro => {
                if (!retCode) return;
                var rng = rangy.createRange();
                rng.selectNode(ro);
                if (isDel) {
                  var res = range.compareBoundaryPoints(rangy.END_TO_START, rng);
                  retCode = res > 0;
                } else {
                  var res = range.compareBoundaryPoints(rangy.START_TO_END, rng);
                  retCode = res < 0;
                }
              });
            } else {
              _.each(ros, ro => {
                if (!retCode) return;
                var rng = rangy.createRange();
                rng.selectNode(ro);
                if (isDel) {
                  var res = range.compareBoundaryPoints(rangy.END_TO_START, rng);
                  retCode = res > 0;
                } else {
                  var res = range.compareBoundaryPoints(rangy.START_TO_END, rng);
                  retCode = res < 0;
                }
              });
            }
            return retCode;
            var range = rangy.getSelection().getRangeAt(0);
            var start: Node = range.endContainer;
            if ($(start.parentNode).closest(".read-only").length > 0) return false;
            if (start.nodeType == Node.TEXT_NODE) {
              var text = <CharacterData>start;
              if (ev.which == key.k_delete) {
                if ($(start.nextSibling).closest(".read-only").length > 0) return false;
              } else {
                if (range.endOffset!=0) return true;
                if ($(start.previousSibling).closest(".read-only").length > 0) return false;
              }
            }
          } 
          return true;
        }
        var block = blocks.length > 0 ? blocks[0] : null;
        if (block) return false;
        //***** zpracovani eventu
        return true;
      });
      el.attr("contenteditable", "true")
    }
  }
  export function range(editorId: string) {
    $(() => {
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

  export enum key {
    backspace = 8,
    tab = 9,
    enter = 13,
    shift = 16,
    ctrl = 17,
    alt = 18,
    pause = 19,
    capsLock = 20,
    escape = 27,
    pageUp = 33,
    pageDown = 34,
    end = 35,
    home = 36,
    leftArrow = 37,
    upArrow = 38,
    rightArrow = 39,
    downArrow = 40,
    insert = 45,
    k_delete = 46,
    k_0 = 48,
    k_1 = 49,
    k_2 = 50,
    k_3 = 51,
    k_4 = 52,
    k_5 = 53,
    k_6 = 54,
    k_7 = 55,
    k_8 = 56,
    k_9 = 57,
    a = 65,
    b = 66,
    c = 67,
    d = 68,
    e = 69,
    f = 70,
    g = 71,
    h = 72,
    i = 73,
    j = 74,
    k = 75,
    l = 76,
    m = 77,
    n = 78,
    o = 79,
    p = 80,
    q = 81,
    r = 82,
    s = 83,
    t = 84,
    u = 85,
    v = 86,
    w = 87,
    x = 88,
    y = 89,
    z = 90,
    leftWindow = 91,
    rightWindowKey = 92,
    select = 93,
    numpad0 = 96,
    numpad1 = 97,
    numpad2 = 98,
    numpad3 = 99,
    numpad4 = 100,
    numpad5 = 101,
    numpad6 = 102,
    numpad7 = 103,
    numpad8 = 104,
    numpad9 = 105,
    multiply = 106,
    add = 107,
    subtract = 109,
    decimalPoint = 110,
    divide = 111,
    f1 = 112,
    f2 = 113,
    f3 = 114,
    f4 = 115,
    f5 = 116,
    f6 = 117,
    f7 = 118,
    f8 = 119,
    f9 = 120,
    f10 = 121,
    f11 = 122,
    f12 = 123,
    numLock = 144,
    scrollLock = 145,
    semiColon = 186,
    equalSign = 187,
    comma = 188,
    dash = 189,
    period = 190,
    forwardSlash = 191,
    graveAccent = 192,
    openBracket = 219,
    backSlash = 220,
    closeBracket = 221,
    singleQuote = 222
  };
  var forwardArrowCodes: { [code: number]: boolean; } = {}; forwardArrowCodes[key.rightArrow] = true; forwardArrowCodes[key.downArrow] = true; forwardArrowCodes[key.pageDown] = true; forwardArrowCodes[key.end] = true; 
  var backwardArrowCodes: { [code: number]: boolean; } = {}; backwardArrowCodes[key.leftArrow] = true; backwardArrowCodes[key.upArrow] = true; backwardArrowCodes[key.pageUp] = true; backwardArrowCodes[key.home] = true; 

} 

