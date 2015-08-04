module metaJS {
  export class propImpl implements xsdProp {

    name: string;
    camelName: string;
    summary: string;
    descr: string;

    propOf: string;
    flag: CourseModel.tgSt;
    type: xsdPropType;
    modifier: xsdPropModifier;
    clsEnumName: string;
    constrains: xsdPropConstrains;
    regexConstrains: string;

    constructor(json: xsdProp) {
      if (json) for (var p in json) this[p] = json[p];
      this.camelName = Utils.toCammelCase(this.name);
    }

    validateAndAssign(value: string, tag: CourseModel.tag): string { //vrati ev. text chyby
      var trimVal = value.trim(); delete tag[this.camelName];
      switch (this.type) {
        case xsdPropType.Enum:
          if (this.modifier != xsdPropModifier.no) throw 'System error: boolean and modifier';
          trimVal = trimVal.toLowerCase();
          var en = this.myEnum(); var it = _.find(en.enumData, v => v.name == trimVal);
          if (it) { tag[this.camelName] = it.value; return null; }
          return 'One from enum value expected';
        case xsdPropType.Bool:
          if (this.modifier != xsdPropModifier.no) throw 'System error: boolean and modifier';
          var isOK = boolVal.test(trimVal = trimVal.toLowerCase());
          if (isOK) { tag[this.camelName] = trimVal == 'true'; return null; }
          return '[true] or [false] expected';
        case xsdPropType.Number:
          if (this.modifier != xsdPropModifier.no) throw 'System error: number and modifier';
          var isOK = numVal.test(trimVal);
          if (isOK) { tag[this.camelName] = parseInt(trimVal); return null; }
          return 'Number expected';
        case xsdPropType.String:
          if (this.modifier == xsdPropModifier.no) {
            switch (this.constrains) {
              case xsdPropConstrains.no: tag[this.camelName] = waEncode.unEscape(value); return null;
              case xsdPropConstrains.idref:
              case xsdPropConstrains.ncname:
              case xsdPropConstrains.id:
                var isOK = idVal.test(trimVal);
                if (isOK) { tag[this.camelName] = trimVal; return null; }
                return 'Identifier expected';
              default: throw 'System error: xsdPropType.String with unknown constrains';
            }
          }
      }
      return null;
    }

    myEnum(): xsdEnum {
      if (this.type != xsdPropType.Enum) throw 'metaJS.propImpl.Enum: this.type != xsdPropType.Enum';
      return metaObj.enums[this.clsEnumName];
    }

  }
  var boolVal = /^(true)|(false)$/i;
  var numVal = /^\d+$/;
  var idVal = /^\s*[a-z][\w-]*\s*$/i;

} 