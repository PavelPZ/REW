var author;
(function (author) {
    function reflectionFromCode(tsCode) {
        var tree = TypeScript.Parser.parse('dummy.ts', TypeScript.SimpleText.fromString(tsCode), false /* is .d.ts? */, new TypeScript.ParseOptions(TypeScript.LanguageVersion.EcmaScript5, true /* allow ASI? */));
        return tree.sourceUnit().childAt(0);
    }
    author.reflectionFromCode = reflectionFromCode;
    function reflectionFromUrlToClipboard(relUrl) {
        $.ajax(relUrl /*napr. '../Courses/GenCourseModel.ts'*/, {
            type: 'GET',
            dataType: 'text',
            contentType: "text/plain; charset=UTF-8"
        }).done(function (programText) { return clipboardData.setData("Text", parseReflection(programText)); }).fail(function () { return; });
    }
    author.reflectionFromUrlToClipboard = reflectionFromUrlToClipboard;
    function parseReflection(tsCode, isDebug) {
        if (isDebug === void 0) { isDebug = true; }
        var res = { enums: [], types: [] };
        var typescriptParsed = JSON.parse(JSON.stringify(reflectionFromCode(tsCode)));
        _.each(typescriptParsed[0].moduleElements, function (el) {
            var obj;
            switch (el.kind) {
                case 'EnumDeclaration':
                    var name = el.identifier.value;
                    var comm = extractComment(el);
                    var enums = _.map(_.filter(el.enumElements, function (p) { return p.kind == 'EnumElement'; }), function (p) { return enumElement(p); });
                    res.enums.push(obj = { nm: name, enums: enums });
                    if (comm)
                        obj.comment = comm;
                    break;
                case 'InterfaceDeclaration':
                    var name = el.identifier.value;
                    var comm = extractComment(el);
                    var ancestor = el.heritageClauses.length == 1 && el.heritageClauses[0].extendsOrImplementsKeyword.value == 'extends' ? el.heritageClauses[0].typeNames[0].value : null;
                    var props = _.map(_.filter(el.body.typeMembers, function (p) { return p.kind == 'PropertySignature'; }), function (p) { return prop(p); });
                    res.types.push(obj = { nm: name });
                    if (comm)
                        obj.comment = comm;
                    if (ancestor)
                        obj.ancestor = ancestor;
                    if (props.length > 0)
                        obj.props = props;
                    break;
            }
        });
        return isDebug ? JSON.stringify(res, null, 2) : JSON.stringify(res);
    }
    author.parseReflection = parseReflection;
    function extractComment(el) {
        var modifier = _.find(el.modifiers, function (m) { return m.hasLeadingComment; });
        if (!modifier)
            return null;
        return extractCommentLow(modifier.leadingTrivia);
    }
    function extractCommentLow(leadingTrivia) {
        var leading = _.find(leadingTrivia, function (m) { return m.kind == 'MultiLineCommentTrivia'; });
        if (!leading)
            return null;
        return leading.text;
    }
    function extractAncestor(el) {
        return el.heritageClauses.length == 1 && el.heritageClauses[0].extendsOrImplementsKeyword.value == 'extends' ? el.heritageClauses[0].typeNames[0].value : null;
    }
    function prop(el) {
        var isArray = el.typeAnnotation.type.kind == 'GenericType';
        var comm = el.propertyName.hasLeadingComment ? extractCommentLow(el.propertyName.leadingTrivia) : null;
        var obj = isArray
            ? { nm: el.propertyName.value, isArray: true, tp: el.typeAnnotation.type.typeArgumentList.typeArguments[0].value }
            : { nm: el.propertyName.value, tp: el.typeAnnotation.type.value };
        if (comm)
            obj.comment = comm;
        return obj;
    }
    function enumElement(el) {
        var comm = el.propertyName.hasLeadingComment ? extractCommentLow(el.propertyName.leadingTrivia) : null;
        var obj = { nm: el.propertyName.value };
        if (comm)
            obj.comment = comm;
        return obj;
    }
})(author || (author = {}));
