module CourseModel {
  export interface docTagsMeta {
    typeDir: { [name: string]: doc.typeImpl; };
    propDir: { [name: string]: doc.propImpl; };
  }
  export interface docType {
    props: Array<docProp>;
  }
  export interface docProp {
    types: Array<docType>;
  }
}

declare var prettyPrint;module doc {

  export var actMeta: CourseModel.docTagsMeta;
  //var actMetaUrl: string;

  export function init(completed: () => void) {
    if (actMeta) completed();
    else CourseMeta.load('/author/doc', (jml: Array<any>) => {
      actMeta = CourseMeta.jsonML_to_Tag(jml, CourseModel.meta);
      actMeta.typeDir = {}; _.each(actMeta.types, t => actMeta.typeDir[t.name.toLowerCase()] = <typeImpl>t);
      actMeta.propDir = <any>{}; _.each(actMeta.props, p => actMeta.propDir[(p.ownerType + '.' + p.name).toLowerCase()] = <propImpl>p);
      _.each(actMeta.props, p => { Utils.extendObject(p, [docNamedImpl, propImpl]); p.types = []; }); //init props
      _.each(actMeta.types, t => { Utils.extendObject(t, [docNamedImpl, typeImpl]); t.props = _.sortBy(_.map(t.myProps, p => { var prop = actMeta.propDir[p.toLowerCase()]; prop.types.push(t); return prop; }), 'name'); });
      _.each(actMeta.props, p => p.types = _.sortBy(p.types, 'name'));
      completed();
    });
  }

  //export function finishHtmlDOM() { if (needPrettyPrint) prettyPrint(); } var needPrettyPrint = false;

  export class model extends Pager.Page {
    constructor(public isHtml: boolean, type: string, urlParts: string[]) {
      super(appId, type, urlParts);
      //this.metaUrl = '/author/doc'; //urlParts ? urlParts[0] : null;
      //if (_.isEmpty(this.metaUrl)) this.metaUrl = '/lm/examples/xref';
    }
    update(completed: () => void): void {
      init(() => {
        this.meta = actMeta;
        this.createModel(completed);
      });
      //if (actMetaUrl == this.metaUrl) { this.meta = actMeta; this.createModel(completed); setTimeout(() => prettyPrint(), 1); return; }
      //CourseMeta.load(this.metaUrl, (jml: Array<any>) => {
      //  if (_.isEmpty(jml)) { debugger; throw 'missing xref jml on ' + this.metaUrl; }
      //  this.meta = actMeta = CourseMeta.jsonML_to_Tag(jml, CourseModel.meta); actMetaUrl = this.metaUrl;
      //  //finish actMeta
      //  actMeta.typeDir = {}; _.each(actMeta.type_s, t => actMeta.typeDir[t.name.toLowerCase()] = <typeImpl>t);
      //  actMeta.propDir = <any>{}; _.each(actMeta.prop_s, p => actMeta.propDir[(p.ownerType + '.' + p.name).toLowerCase()] = <propImpl>p);
      //  _.each(actMeta.prop_s, p => { Utils.extendObject(p, [docNamedImpl, propImpl]); p.types = []; }); //init props
      //  _.each(actMeta.type_s, t => { Utils.extendObject(t, [docNamedImpl, typeImpl]); t.props = _.sortBy(_.map(t.myProps, p => { var prop = actMeta.propDir[p.toLowerCase()]; prop.types.push(t); return prop; }), 'name'); });
      //  _.each(actMeta.prop_s, p => p.types = _.sortBy(p.types, 'name'));
      //  //examples impl
      //  //_.each([actMeta.prop_s, actMeta.type_s, actMeta.enum_s], arr => _.each(arr, (impl: docNamedImpl) => {
      //  //  if (impl.example_s) _.each(impl.example_s, ex => Utils.extendObject(ex, [docNamedImpl, exampleImpl]));
      //  //}));
      //  //setTimeout(() => prettyPrint(), 1);
      //  this.createModel(completed);
      //});
    }
    createModel(completed: () => void) { completed(); }
    //metaUrl: string;
    meta: CourseModel.docTagsMeta;
    tags(): Array<CourseModel.docType> {
      return _.filter(this.meta.types, t => (this.isHtml ? t.isHtml : !t.isHtml) && !t.isIgn);
    }
    props(): Array<CourseModel.docProp> {
      return _.sortBy(_.uniq(_.flatten(_.map(this.tags(), t => t.props), true)), 'name');
    }
    isPropsPage(): boolean { return this.type == propsType; }
    isTypesPage(): boolean { return this.type == typesType; }
    ishPropsPage(): boolean { return this.type == hpropsType; }
    ishTypesPage(): boolean { return this.type == htypesType; }
    isPropPage(): boolean { return this.type == propType; }
    isTypePage(): boolean { return this.type == typeType; }
    typesLink(): string { return getHash(typesType); }
    propsLink(): string { return getHash(propsType); }
    htypesLink(): string { return getHash(htypesType); }
    hpropsLink(): string { return getHash(hpropsType); }
    //typesLink(): string { return getHash(typesType, actMetaUrl); }
    //propsLink(): string { return getHash(propsType, actMetaUrl); }
    //htypesLink(): string { return getHash(htypesType, actMetaUrl); }
    //hpropsLink(): string { return getHash(hpropsType, actMetaUrl); }
    //isPropPage(): boolean { return this.type == propType; }
    //isTypePage(): boolean { return this.type == typeType; }
  }

  //********** rejstriky
  export class propsModel extends model {
    constructor(urlParts: string[]) {
      super(false, propsType, urlParts);
    }
    childs() { return this.props(); }
  }
  export class typesModel extends model {
    constructor(urlParts: string[]) {
      super(false, typesType, urlParts);
    }
    childs() { return this.tags(); }
  }
  export class hpropsModel extends model {
    constructor(urlParts: string[]) {
      super(true, hpropsType, urlParts);
    }
    childs() { return this.props(); }
  }
  export class htypesModel extends model {
    constructor(urlParts: string[]) {
      super(true, htypesType, urlParts);
    }
    childs() { return this.tags(); }
  }

  //********** detaily
  export class memberModel extends model {
    constructor(public isProp: boolean, type: string, urlParts: string[]) {
      super(undefined, type, urlParts);
      this.memberId = urlParts[0].toLowerCase();
      this.unCammelMemberId = Utils.fromCammelCase(urlParts[0]);
    }
    memberId: string;
    unCammelMemberId: string;
    actDocNamedImpl: docNamedImpl;
    ex: CourseMeta.exImpl;
    createModel(completed: () => void) {
      if (this.actDocNamedImpl.xref) { completed(); return; } //xref
      //doc
      CourseMeta.gui.init();
      var url = ('/lm/docExamples/' + this.unCammelMemberId).toLowerCase();
      CourseMeta.loadResponseScript('author.aspx?mode=compileEx&url=' + url, loaded => {
        if (!loaded) { completed(); return; } //priklad nenalezen
        CourseMeta.load(url, (pgJsonML: Array<any>) => { //priklad nalezen
          var pg = CourseMeta.extractEx(pgJsonML);
          if (!ex) {
            ex = new CourseMeta.exImpl();
            ex.type = CourseMeta.runtimeType.ex;
            ex.url = url;
            CourseMeta.actNode = ex;
            if (cfg.forceEval) { ex.designForceEval = true; ex.done = true; }
          }
          this.ex = ex;
          ex.title = pg.title; ex.url = pg.url;
          ex.onSetPage(pg, null);
          CourseMeta.lib.displayEx(ex, null, null);
        });
      });

      completed();
    }
  }
  export class propModel extends memberModel {
    constructor(urlParts: string[]) {
      super(true, propType, urlParts);
      this.backUrl = appId + '@' + urlParts[1].replace(/~/g, '@');
    }
    createModel(completed: () => void) {
      this.actDocNamedImpl = this.actImpl = actMeta.propDir[this.memberId];
      super.createModel(completed);
    }
    actImpl: propImpl;
    backUrl: string;
  }
  export class typeModel extends memberModel {
    constructor(urlParts: string[]) { super(false, typeType, urlParts); }
    createModel(completed: () => void) {
      this.actDocNamedImpl = this.actImpl = actMeta.typeDir[this.memberId];
      super.createModel(completed);
    }
    actImpl: typeImpl;
  }

  //********** rozsireni type a prop interfaces
  //CourseModel.docNamed
  export class docNamedImpl extends Course.tagImpl implements CourseModel.docNamed {
    name: string;
    isHtml: boolean;
    xref: string;
    dataRole: string;
    class: string[];
    //styleSheet: string;
    xrefs(): Array<string> {
      if (!this._xrefs) this._xrefs = this.xref.split('|');
      return this._xrefs;
    } _xrefs: Array<string>;
    summary: string;
    cdata: string;
    //example_s: Array<exampleImpl>;
    //class: string;
    //width: string;
    //style: string;
    actPage(): model { return <model>(Pager.ActPage); }
    title(): string { return Utils.fromCammelCase(this.name); }
    //doCopy(data: typeModel, exPtr: string) {
    //  var ex = _.find(data.actImpl.example_s, e => e.ptr == exPtr);
    //  Utils.toClipboard(ex.getCode());
    //}
  }
  var ex: CourseMeta.exImpl = null;

  export class typeImpl extends docNamedImpl implements CourseModel.docType {
    href(): string { return getHash(typeType, this.name); }
    codeTitle(): string { return '<' + Utils.fromCammelCase(this.name) + '>'; }
    childs(): Array<CourseModel.docProp> { return this.props; }

    //CourseModel.docType interface
    isIgn: boolean;
    descendantsAndSelf: Array<string>;
    myProps: Array<string>;
    props: Array<CourseModel.docProp>;
  }

  export class propImpl extends docNamedImpl implements CourseModel.docProp {
    href(): string { return getHash(propType, this.ownerType + '.' + this.name, this.actPage().type + (this.actPage().urlParts ? '~' + this.actPage().urlParts.join('~') : '')); }
    codeTitle(): string { return Utils.fromCammelCase(this.name) + '=""'; }
    childs(): Array<CourseModel.docType> { return _.filter(this.types, t => (this.actPage().isHtml ? t.isHtml : !t.isHtml) && !t.isIgn); }

    //CourseModel.docProp interface
    ownerType: string;
    dataType: string;
    //xrefValued: boolean;
    //xrefIgnore: boolean;
    types: Array<CourseModel.docType>;
  }

  //export class exampleImpl extends docNamedImpl implements CourseModel.docExample {
  //  codeListing: string;
  //  header: CourseModel.tag;
  //  descr: CourseModel.tag;
  //  getCode(): string {
  //    //var c = this.code;
  //    //if (!c || !c.Items || c.Items.length != 1 || !_.isString(c.Items[0])) return '';
  //    //var res: string = <any>(c.Items[0]); res = res.replace(/\n/g, '#@!');
  //    //var div = $("<div>"); div.html(res); res = div.text(); res = res.replace(/#@\!/g, '\r\n');
  //    return this.codeListing;
  //  }
  //}

  export class docExample extends Course.tagImpl implements CourseModel.docExample {
    constructor(staticData: CourseModel.docExample) {
      super(staticData);
    }

    todo: boolean;
    codeListing: string;
    codePostListing: string;
    header: CourseModel.headerProp;
    descr: CourseModel.docDescr;
    evalBtn: CourseModel.evalButton;

    initProc(phase: Course.initPhase, getTypeOnly: boolean, completed: () => void): Course.initPhaseType {
      switch (phase) {
        case Course.initPhase.beforeRender:
          if (!getTypeOnly) {
            needPrettyPrint = true;
          }
          return Course.initPhaseType.sync;
        case Course.initPhase.afterRender2:
          if (!getTypeOnly) {
            if (needPrettyPrint) {
              //naformatovani XML
              _.each($('.prettyprint'), el => { var $el = $(el); $el.text(beautify($el.text())); });
              //obarveni XML
              setTimeout(() => prettyPrint(), 1);
            } else needPrettyPrint = false;
          }
          return Course.initPhaseType.sync;
      }
      return super.initProc(phase, getTypeOnly, completed);
    }
    doCopy(self: docExample, mode: number) {
      var dt = <CourseModel.docExample>(self);
      var xml = mode == 2 ? dt.codePostListing : dt.codeListing;
      var mts = xml.split(extractCode);
      var mt = _.find(mts, m => m.length > 1 && m.charAt(0) == '&');
      xml = $('<div/>').html(mt).text();
      
      if (mode == 0) {
        var title: any = dt.header.Items[0].Items[0];
        xml = '<html xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.langmaster.com/new/author/coursemodelschema.xsd">\n<head>\n<title>' + title + '\n</title>\n</head>\n<body>' + xml + '</body>\n</html>';
      }
      xml = beautify(xml);
      anim.alert().lmcdocDlgShow(xml);
      //Utils.toClipboard(xml);
    }
    copyPage(self: docExample) { this.doCopy(self, 0); }
    copyFragment(self: docExample) { this.doCopy(self, 1); }
    copyExpanded(self: docExample) { this.doCopy(self, 2); }
  }
  var extractCode = /[<>]/;
  var needPrettyPrint = false;

  function beautify(xml: string) {
    var reg = /(>)(<)(\/*)/g;
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
    var formatted:Array<string> = [];
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
    var transitions = {
      'single->single': 0,
      'single->closing': -1,
      'single->opening': 0,
      'single->other': 0,
      'closing->single': 0,
      'closing->closing': -1,
      'closing->opening': 0,
      'closing->other': 0,
      'opening->single': 1,
      'opening->closing': 0,
      'opening->opening': 1,
      'opening->other': 1,
      'other->single': 0,
      'other->closing': -1,
      'other->opening': 0,
      'other->other': 0
    };

    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i].trim();
      var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
      var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
      var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
      var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
      var fromTo = lastType + '->' + type;
      lastType = type;

      indent += transitions[fromTo];

      for (var j = 0; j < indent; j++) formatted.push('  ');
      formatted.push(ln); formatted.push('\r\n');
    }

    return formatted.join('').trim();
  };

  //**************
  function getHash(type: string, url1: string = null, url2: string = null):string { //, url2: string = null, url3: string = null): string {
    return [appId, type, url1, url2].join('@');
  }

  export function Start() {
    CourseMeta.persist = persistMemory.persistCourse;
    Pager.initHash = () => cfg.hash ? cfg.hash : getHash(typesType);
    boot.minInit();
    ViewBase.init(); $('#splash').hide();
  }

  var typesType = "doctypesModel".toLowerCase();
  var propsType = "docpropsModel".toLowerCase();
  var typeType = "doctypeModel".toLowerCase();
  var propType = "docpropModel".toLowerCase();
  var htypesType = "dochtypesModel".toLowerCase();
  var hpropsType = "dochpropsModel".toLowerCase();

  Pager.registerAppLocator(appId, propsType, (urlParts, completed) => completed(new propsModel(urlParts)));
  Pager.registerAppLocator(appId, typesType, (urlParts, completed) => completed(new typesModel(urlParts)));
  Pager.registerAppLocator(appId, propType, (urlParts, completed) => completed(new propModel(urlParts)));
  Pager.registerAppLocator(appId, typeType, (urlParts, completed) => completed(new typeModel(urlParts)));
  Pager.registerAppLocator(appId, hpropsType, (urlParts, completed) => completed(new hpropsModel(urlParts)));
  Pager.registerAppLocator(appId, htypesType, (urlParts, completed) => completed(new htypesModel(urlParts)));

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tdocExample, docExample);

}
//prettyPrint()

