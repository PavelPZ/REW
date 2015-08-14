//http://alistapart.com/article/expanding-text-areas-made-elegant
//http://jsfiddle.net/QrZHM/1/
//http://jsfiddle.net/bgrins/UA7ty/
//http://bgrins.github.io/ExpandingTextareas/

//interface JQuery {
//  waBlock(init?: waGui.fragment): waGui.fragment;
//}

//$.fn.waBlock = function (init?: waGui.fragment): waGui.fragment {
//  if (init) {
//    return null;
//  } else {
//    return new waGui.fragment();
//  }
//};

module waGui {

  
  var cloneCSSProperties = [
    'lineHeight', 'textDecoration', 'letterSpacing',
    'fontSize', 'fontFamily', 'fontStyle', 'fontVariant',
    'fontWeight', 'textTransform', 'textAlign',
    'direction', 'wordSpacing', 'fontSizeAdjust',
    'whiteSpace', 'wordWrap', 'wordBreak'
  ];

  function resize(textarea: JQuery) {
    textarea.parent().find("span").text(textarea.val());
  }

  export function init(txt: JQuery) {
    var textarea = $(txt);

    textarea.wrap("<div class='smartText'></div>");
    textarea.before("<pre class='passive'><span></span><br /></pre>");

    var container = textarea.parent();
    var pre = container.find("pre");

    _.each(cloneCSSProperties, p => pre.css(p, textarea.css(p)));

    textarea.on('input onpropertychange', function () {
      resize($(this));
    });

    resize(textarea);
  }

  $(() => _.each($('textarea.smart'), init));

}

