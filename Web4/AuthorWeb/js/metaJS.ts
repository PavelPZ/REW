module metaJS {

  export interface xsdType {
    descendants?: Array<typeImpl>;
    propDir?: { [propId: string]: propImpl };
    props?: Array<propImpl>;
    ownProps?: Array<propImpl>;
  }

  export class implLow implements xsdLow {

    constructor(json: xsdLow) {
      if (json) for (var p in json) this[p] = json[p];
    }

    name: string;
    summary: string;
    descr: string;
    flag: CourseModel.tgSt;
    _newName: string;

    hasFlag(fl: any): boolean {
      var val: any = _.isString(fl) ? CourseModel.tgSt[fl] : <number>fl;
      return (this.flag & val) != 0;
    }

    rnName(): string {
      if (_.isEmpty(this._newName)) return this.name;
      return this.name + ' => <span class="label label-default">' + this._newName + '</span>';
    }

    rnNameNew(): string { return this._newName || this.name; }


  }

  export class enumImpl extends implLow implements xsdEnum {
    enumData: Array<enumItemImpl>;

    constructor(json: xsdEnum) {
      super(json);
      for (var i = 0; i < this.enumData.length; i++) this.enumData[i] = new enumItemImpl(this.enumData[i]);
    }

  }

  export class enumItemImpl extends implLow implements xsdEnumItem {
    value: number;
  }

  export class typeImpl extends implLow implements xsdType {
    ancestor: string;
    inheritsFrom: xsdInheritsFrom;
    required: boolean;
    descendants: Array<typeImpl>;
    propDir: { [propId: string]: propImpl };
    props: Array<propImpl>;
    ownProps: Array<propImpl>;

    isTrashMode: boolean;

    rnDescendants(): Array<typeImpl> {
      if (this.name == 'macro') return null;
      var cond = (d: typeImpl) => { d.isTrashMode = this.isTrashMode; var ok = !!d.rnDescendants() || !d.hasFlag(CourseModel.tgSt.docIgnore); return this.isTrashMode ? !ok || !!d.rnProps() : ok; };
      var res = _.filter(this.descendants, d => cond(d));
      return res.length == 0 ? null : res;
    }

    rnProps(): Array<propImpl> {
      var cond = (p: propImpl) => { var ok = !p.hasFlag(CourseModel.tgSt.docIgnore); return this.isTrashMode ? !ok : ok; };
      var res = _.filter(this.ownProps, p => cond(p));
      return res.length == 0 ? null : res;
    }

    rnPropsNew(): Array<propImpl> {
      var res = _.filter(this.props, p => !p.hasFlag(CourseModel.tgSt.docIgnore));
      return _.sortBy(res, p => p.name);//p._newName || p.name);
    }

  }

  //**************** objekt pro data, exportovana z CSharp
  export class xsdObj implements xsd {

    //interface
    types: { [id: string]: typeImpl };
    properties: Array<xsdProp>; //prop interfaces
    props: Array<propImpl> = []; //prop impl
    enums: { [id: string]: enumImpl };

    allEnums: Array<enumImpl> = [];
    allTypes: Array<typeImpl> = [];

    constructor(json?: xsd) {
      //properties from JSON
      if (json) for (var p in json) this[p] = json[p];

      //interface => impl
      for (var p in this.types) this.allTypes.push(this.types[p] = new typeImpl(this.types[p]));
      for (var p in this.enums) this.allEnums.push(this.enums[p] = new enumImpl(this.enums[p]));

      //spocti typeProps
      var ownPropDirs: { [typeId: string]: Array<xsdProp> } = {};
      _.map(this.properties, p => {
        var props = ownPropDirs[p.propOf];
        if (!props) ownPropDirs[p.propOf] = props = [];
        props.push(p);
      });
      _.each(this.types, tp => {
        tp.propDir = {}; tp.props = []; tp.ownProps = [];
        var t = tp;
        do {
          _.each(ownPropDirs[t.name], p => {
            var impl = new propImpl(p); tp.propDir[p.name] = impl; tp.props.push(impl);
            if (t == tp) {
              tp.ownProps.push(impl); this.props.push(impl);
            }
          });
          t = t.ancestor ? this.types[t.ancestor] : null;
        } while (t);
        tp.props = _.sortBy(tp.props, p => p.name);
        tp.ownProps = _.sortBy(tp.ownProps, p => p.name);
        //descendants
        if (tp.ancestor) {
          var anc = this.types[tp.ancestor];
          if (!anc.descendants) anc.descendants = [];
          anc.descendants.push(tp);
        }
      });

      this.props = _.sortBy(this.props, p => p.name);
      //sorting descendants
      for (var p in this.types) {
        var t = this.types[p]; if (t.descendants) t.descendants = _.sortBy(t.descendants, t => t.name);
      }
    }

    rnRoot(isTrash: boolean): typeImpl {
      var res = this.types['tag']; res.isTrashMode = isTrash;
      return res;
    }

    rnElements(): Array<typeImpl> {
      return _.sortBy(
        this.allTypes.filter(t => t.descendants == null && !t.hasFlag(CourseModel.tgSt.docIgnore) && !this.inheritsFrom(t.name, 'macro')), t => t.name); //t => t._newName || t.name);
    }

    rnEnums(): Array<enumImpl> {
      return _.filter(this.allEnums, e => !e.hasFlag(CourseModel.tgSt.docIgnore));
    }

    rnRenameJson(): string {
      var res = _.map(this.rnElements(), e => {
        return {
          old: e.name,
          'new': e._newName || undefined,
          props: _.map(e.rnPropsNew(), p => { return { old: p.name, 'new' : p._newName || undefined }; })
        };
      });
      return JSON.stringify(res).replace(/"/g,'\\"');
    }

    dcElements(isCut:boolean): Array<typeImpl> {
      return _.filter(this.rnElements(), el => isCut==!!xsdObj.cutEls[el.name]);
    }
    static cutEls = { 'cut-dialog': true, 'cut-text': true, 'include-dialog': true, 'include-text': true, 'phrase': true, 'phrase-replace': true, 'replica': true };


    inheritsFrom(self: string, ancestor: string): boolean { while (self) { if (self == ancestor) return true; var self = this.types[self].ancestor; } return false; }

    tooglePanel(model: Object, ev: JQueryEventObject) {
      var $a = $(ev.currentTarget);
      var $body = $a.parents('.panel').find('.panel-body');
      $body.toggle();
      var isVisible = $body.is(":visible");
      $a.toggleClass('fa-minus', isVisible);
      $a.toggleClass('fa-plus', !isVisible);
    }

    showProp(ev:JQueryEventObject, propOf:string, prop: string) {
      alert(propOf + '.' + prop);
    }

  }

  export class propImpl extends implLow implements xsdProp {

    camelName: string;

    propOf: string;
    type: xsdPropType;
    modifier: xsdPropModifier;
    clsEnumName: string;
    constrains: xsdPropConstrains;
    regexConstrains: string;

    constructor(json: xsdProp) {
      super(json);
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

  export var metaObj: xsdObj = new xsdObj(metaData);

} 