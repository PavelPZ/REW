var waCompile;
(function (waCompile) {
    function compileRenderTag(parsedBlocks, ctx) {
        var stack = [];
        var addToItems = function (it) { if (!it)
            return; var tg = stack[stack.length - 1]; if (!tg.Items)
            tg.Items = []; tg.Items.push(it); };
        var addTag = function (name, attrs, selfclosing) {
            var tg = { _tg: name };
            if (attrs && attrs.length > 0) {
                var i = 0;
                var attrib;
                while ((attrib = attrs[i]) !== undefined) {
                    tg[attrib[0]] = attrib[1];
                    i++;
                }
            }
            addToItems(tg);
            if (!selfclosing)
                stack.push(tg);
        };
        var addContext = { addToItems: addToItems, addTag: function (tg) { addToItems(tg); stack.push(tg); }, stack: stack };
        stack.push({ _tg: 'root' });
        var attrs;
        var info_words;
        var tagname;
        var walker = parsedBlocks.walker();
        var event, node;
        var entering;
        //var buffer = "";
        var lastOut = "\n";
        //var disableTags = 0;
        var grandparent;
        //var out = function (s) {
        //  if (disableTags > 0) {
        //    buffer += s.replace(reHtmlTag, '');
        //  } else {
        //    buffer += s;
        //  }
        //  lastOut = s;
        //};
        var options = { sourcepos: true };
        //if (options.time) { console.time("rendering"); }
        //var newOpeningTag: CourseModel.tag;
        while ((event = walker.next())) {
            entering = event.entering;
            node = event.node;
            attrs = [];
            if (options.sourcepos) {
                var pos = node.sourcepos;
                if (pos) {
                    attrs.push(['srcpos', String(pos[0][0]) + ':' +
                            String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                            String(pos[1][1])]);
                }
            }
            switch (node.type) {
                case 'Text':
                    ctx.decodeMarksToTag(node.literal, addContext);
                    //addToItems(node.literal);
                    break;
                case 'Softbreak':
                    addToItems('\n');
                    break;
                case 'Hardbreak':
                    addTag('br', null, true);
                    break;
                case 'Emph':
                    if (entering)
                        addTag('em');
                    else
                        stack.pop();
                    break;
                case 'Strong':
                    if (entering)
                        addTag('strong');
                    else
                        stack.pop();
                    break;
                case 'Html':
                    addTag(node.literal.substring(1, node.literal.length - 2), null, true);
                    break;
                case 'Link':
                    if (entering) {
                        attrs.push(['href', node.destination]);
                        if (node.title) {
                            attrs.push(['title', node.title]);
                        }
                        addTag('a', attrs);
                    }
                    else {
                        stack.pop();
                    }
                    break;
                case 'Image':
                    throw 'Html';
                    break;
                case 'Code':
                    addTag('code');
                    addToItems(node.literal);
                    stack.pop();
                    break;
                case 'Document':
                    break;
                case 'Paragraph':
                    grandparent = node.parent.parent;
                    if (grandparent !== null &&
                        grandparent.type === 'List') {
                        if (grandparent.listTight) {
                            break;
                        }
                    }
                    if (entering)
                        addTag('p', attrs);
                    else
                        stack.pop();
                    break;
                case 'BlockQuote':
                    if (entering)
                        addTag('blockquote', attrs);
                    else
                        stack.pop();
                    break;
                case 'Item':
                    if (entering)
                        addTag('li', attrs);
                    else
                        stack.pop();
                    break;
                case 'List':
                    tagname = node.listType === 'Bullet' ? 'ul' : 'ol';
                    if (entering) {
                        var start = node.listStart;
                        if (start !== null && start !== 1) {
                            attrs.push(['start', start.toString()]);
                        }
                        addTag(tagname, attrs);
                    }
                    else {
                        stack.pop();
                    }
                    break;
                case 'Header':
                    tagname = 'h' + node.level;
                    if (entering)
                        addTag(tagname, attrs);
                    else
                        stack.pop();
                    break;
                case 'CodeBlock':
                    info_words = node.info ? node.info.split(/ +/) : [];
                    if (info_words.length > 0 && info_words[0].length > 0) {
                        attrs.push(['class', 'language-' + info_words[0]]);
                    }
                    addTag('pre');
                    addTag('code', attrs);
                    addToItems(node.literal);
                    stack.pop();
                    stack.pop();
                    break;
                case 'HtmlBlock':
                    throw 'HtmlBlock';
                    break;
                case 'HorizontalRule':
                    addTag('hr', null, true);
                    break;
                default:
                    throw "Unknown node type " + node.type;
            }
        }
        return stack[0].Items;
    }
    waCompile.compileRenderTag = compileRenderTag;
})(waCompile || (waCompile = {}));
