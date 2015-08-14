declare var TypeScript: any;
module author {
  export function reflectionFromCode(tsCode: string): Object {
    var tree = TypeScript.Parser.parse('dummy.ts',
      TypeScript.SimpleText.fromString(tsCode),
      false /* is .d.ts? */,
      new TypeScript.ParseOptions(TypeScript.LanguageVersion.EcmaScript5, true /* allow ASI? */));
    return tree.sourceUnit().childAt(0);
  }
  export function reflectionFromUrlToClipboard(relUrl: string) {
    $.ajax(relUrl /*napr. '../Courses/GenCourseModel.ts'*/, {
      type: 'GET',
      dataType: 'text',
      contentType: "text/plain; charset=UTF-8"
    }).done(programText => clipboardData.setData("Text", parseReflection(programText))).fail(() => { return; });
  }
  export function parseReflection(tsCode: string, isDebug:boolean = true): string {
    var res = { enums: [], types: [] };
    var typescriptParsed: any = JSON.parse(JSON.stringify(reflectionFromCode(tsCode)));
    _.each(typescriptParsed[0].moduleElements, (el: any) => {
      var obj: any;
      switch (el.kind) {
        case 'EnumDeclaration':
          var name = el.identifier.value;
          var comm = extractComment(el);
          var enums = _.map(_.filter(el.enumElements, (p: any) => p.kind == 'EnumElement'), (p: any) => enumElement(p));
          res.enums.push(obj = { nm: name, enums: enums });
          if (comm) obj.comment = comm;
          break;
        case 'InterfaceDeclaration':
          var name = el.identifier.value;
          var comm = extractComment(el);
          var ancestor = el.heritageClauses.length == 1 && el.heritageClauses[0].extendsOrImplementsKeyword.value == 'extends' ? el.heritageClauses[0].typeNames[0].value : null;
          var props = _.map(_.filter(el.body.typeMembers, (p: any) => p.kind == 'PropertySignature'), (p: any) => prop(p));
          res.types.push(obj = { nm: name });
          if (comm) obj.comment = comm; if (ancestor) obj.ancestor = ancestor; if (props.length > 0) obj.props = props;
          break;
      }
    });
    return isDebug ? JSON.stringify(res, null, 2) : JSON.stringify(res);
  }

  function extractComment(el: any): Object {
    var modifier = _.find(el.modifiers, (m: any) => m.hasLeadingComment);
    if (!modifier) return null;
    return extractCommentLow(modifier.leadingTrivia);
  }
  function extractCommentLow(leadingTrivia: any): Object {
    var leading = _.find(leadingTrivia, (m: any) => m.kind == 'MultiLineCommentTrivia');
    if (!leading) return null;
    return leading.text;
  }
  function extractAncestor(el: any): string {
    return el.heritageClauses.length == 1 && el.heritageClauses[0].extendsOrImplementsKeyword.value == 'extends' ? el.heritageClauses[0].typeNames[0].value : null;
  }
  function prop(el: any): Object {
    var isArray = el.typeAnnotation.type.kind == 'GenericType';
    var comm = el.propertyName.hasLeadingComment ? extractCommentLow(el.propertyName.leadingTrivia) : null;
    var obj: any = isArray
      ? { nm: el.propertyName.value, isArray: true, tp: el.typeAnnotation.type.typeArgumentList.typeArguments[0].value }
      : { nm: el.propertyName.value, tp: el.typeAnnotation.type.value };
    if (comm) obj.comment = comm;
    return obj;
  }

  function enumElement(el: any): Object {
    var comm = el.propertyName.hasLeadingComment ? extractCommentLow(el.propertyName.leadingTrivia) : null;
    var obj: any = { nm: el.propertyName.value };
    if (comm) obj.comment = comm;
    return obj;
  }
}