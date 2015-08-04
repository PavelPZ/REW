var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var doc;
(function (doc) {
    doc.actMeta;
    //var actMetaUrl: string;
    function init(completed) {
        if (doc.actMeta)
            completed();
        else
            CourseMeta.load('/author/doc', function (jml) {
                doc.actMeta = CourseMeta.jsonML_to_Tag(jml, CourseModel.meta);
                doc.actMeta.typeDir = {};
                _.each(doc.actMeta.types, function (t) { return doc.actMeta.typeDir[t.name.toLowerCase()] = t; });
                doc.actMeta.propDir = {};
                _.each(doc.actMeta.props, function (p) { return doc.actMeta.propDir[(p.ownerType + '.' + p.name).toLowerCase()] = p; });
                _.each(doc.actMeta.props, function (p) { Utils.extendObject(p, [docNamedImpl, propImpl]); p.types = []; }); //init props
                _.each(doc.actMeta.types, function (t) { Utils.extendObject(t, [docNamedImpl, typeImpl]); t.props = _.sortBy(_.map(t.myProps, function (p) { var prop = doc.actMeta.propDir[p.toLowerCase()]; prop.types.push(t); return prop; }), 'name'); });
                _.each(doc.actMeta.props, function (p) { return p.types = _.sortBy(p.types, 'name'); });
                completed();
            });
    }
    doc.init = init;
    //export function finishHtmlDOM() { if (needPrettyPrint) prettyPrint(); } var needPrettyPrint = false;
    var model = (function (_super) {
        __extends(model, _super);
        function model(isHtml, type, urlParts) {
            _super.call(this, doc.appId, type, urlParts);
            this.isHtml = isHtml;
            //this.metaUrl = '/author/doc'; //urlParts ? urlParts[0] : null;
            //if (_.isEmpty(this.metaUrl)) this.metaUrl = '/lm/examples/xref';
        }
        model.prototype.update = function (completed) {
            var _this = this;
            init(function () {
                _this.meta = doc.actMeta;
                _this.createModel(completed);
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
        };
        model.prototype.createModel = function (completed) { completed(); };
        model.prototype.tags = function () {
            var _this = this;
            return _.filter(this.meta.types, function (t) { return (_this.isHtml ? t.isHtml : !t.isHtml) && !t.isIgn; });
        };
        model.prototype.props = function () {
            return _.sortBy(_.uniq(_.flatten(_.map(this.tags(), function (t) { return t.props; }), true)), 'name');
        };
        model.prototype.isPropsPage = function () { return this.type == propsType; };
        model.prototype.isTypesPage = function () { return this.type == typesType; };
        model.prototype.ishPropsPage = function () { return this.type == hpropsType; };
        model.prototype.ishTypesPage = function () { return this.type == htypesType; };
        model.prototype.isPropPage = function () { return this.type == propType; };
        model.prototype.isTypePage = function () { return this.type == typeType; };
        model.prototype.typesLink = function () { return getHash(typesType); };
        model.prototype.propsLink = function () { return getHash(propsType); };
        model.prototype.htypesLink = function () { return getHash(htypesType); };
        model.prototype.hpropsLink = function () { return getHash(hpropsType); };
        return model;
    })(Pager.Page);
    doc.model = model;
    //********** rejstriky
    var propsModel = (function (_super) {
        __extends(propsModel, _super);
        function propsModel(urlParts) {
            _super.call(this, false, propsType, urlParts);
        }
        propsModel.prototype.childs = function () { return this.props(); };
        return propsModel;
    })(model);
    doc.propsModel = propsModel;
    var typesModel = (function (_super) {
        __extends(typesModel, _super);
        function typesModel(urlParts) {
            _super.call(this, false, typesType, urlParts);
        }
        typesModel.prototype.childs = function () { return this.tags(); };
        return typesModel;
    })(model);
    doc.typesModel = typesModel;
    var hpropsModel = (function (_super) {
        __extends(hpropsModel, _super);
        function hpropsModel(urlParts) {
            _super.call(this, true, hpropsType, urlParts);
        }
        hpropsModel.prototype.childs = function () { return this.props(); };
        return hpropsModel;
    })(model);
    doc.hpropsModel = hpropsModel;
    var htypesModel = (function (_super) {
        __extends(htypesModel, _super);
        function htypesModel(urlParts) {
            _super.call(this, true, htypesType, urlParts);
        }
        htypesModel.prototype.childs = function () { return this.tags(); };
        return htypesModel;
    })(model);
    doc.htypesModel = htypesModel;
    //********** detaily
    var memberModel = (function (_super) {
        __extends(memberModel, _super);
        function memberModel(isProp, type, urlParts) {
            _super.call(this, undefined, type, urlParts);
            this.isProp = isProp;
            this.memberId = urlParts[0].toLowerCase();
            this.unCammelMemberId = Utils.fromCammelCase(urlParts[0]);
        }
        memberModel.prototype.createModel = function (completed) {
            var _this = this;
            if (this.actDocNamedImpl.xref) {
                completed();
                return;
            } //xref
            //doc
            CourseMeta.gui.init();
            var url = ('/lm/docExamples/' + this.unCammelMemberId).toLowerCase();
            CourseMeta.loadResponseScript('author.aspx?mode=compileEx&url=' + url, function (loaded) {
                if (!loaded) {
                    completed();
                    return;
                } //priklad nenalezen
                CourseMeta.load(url, function (pgJsonML) {
                    var pg = CourseMeta.extractEx(pgJsonML);
                    if (!ex) {
                        ex = new CourseMeta.exImpl();
                        ex.type = CourseMeta.runtimeType.ex;
                        ex.url = url;
                        CourseMeta.actNode = ex;
                        if (cfg.forceEval) {
                            ex.designForceEval = true;
                            ex.done = true;
                        }
                    }
                    _this.ex = ex;
                    ex.title = pg.title;
                    ex.url = pg.url;
                    ex.onSetPage(pg, null);
                    CourseMeta.lib.displayEx(ex, null, null);
                });
            });
            completed();
        };
        return memberModel;
    })(model);
    doc.memberModel = memberModel;
    var propModel = (function (_super) {
        __extends(propModel, _super);
        function propModel(urlParts) {
            _super.call(this, true, propType, urlParts);
            this.backUrl = doc.appId + '@' + urlParts[1].replace(/~/g, '@');
        }
        propModel.prototype.createModel = function (completed) {
            this.actDocNamedImpl = this.actImpl = doc.actMeta.propDir[this.memberId];
            _super.prototype.createModel.call(this, completed);
        };
        return propModel;
    })(memberModel);
    doc.propModel = propModel;
    var typeModel = (function (_super) {
        __extends(typeModel, _super);
        function typeModel(urlParts) {
            _super.call(this, false, typeType, urlParts);
        }
        typeModel.prototype.createModel = function (completed) {
            this.actDocNamedImpl = this.actImpl = doc.actMeta.typeDir[this.memberId];
            _super.prototype.createModel.call(this, completed);
        };
        return typeModel;
    })(memberModel);
    doc.typeModel = typeModel;
    //********** rozsireni type a prop interfaces
    //CourseModel.docNamed
    var docNamedImpl = (function (_super) {
        __extends(docNamedImpl, _super);
        function docNamedImpl() {
            _super.apply(this, arguments);
        }
        //styleSheet: string;
        docNamedImpl.prototype.xrefs = function () {
            if (!this._xrefs)
                this._xrefs = this.xref.split('|');
            return this._xrefs;
        };
        //example_s: Array<exampleImpl>;
        //class: string;
        //width: string;
        //style: string;
        docNamedImpl.prototype.actPage = function () { return (Pager.ActPage); };
        docNamedImpl.prototype.title = function () { return Utils.fromCammelCase(this.name); };
        return docNamedImpl;
    })(Course.tagImpl);
    doc.docNamedImpl = docNamedImpl;
    var ex = null;
    var typeImpl = (function (_super) {
        __extends(typeImpl, _super);
        function typeImpl() {
            _super.apply(this, arguments);
        }
        typeImpl.prototype.href = function () { return getHash(typeType, this.name); };
        typeImpl.prototype.codeTitle = function () { return '<' + Utils.fromCammelCase(this.name) + '>'; };
        typeImpl.prototype.childs = function () { return this.props; };
        return typeImpl;
    })(docNamedImpl);
    doc.typeImpl = typeImpl;
    var propImpl = (function (_super) {
        __extends(propImpl, _super);
        function propImpl() {
            _super.apply(this, arguments);
        }
        propImpl.prototype.href = function () { return getHash(propType, this.ownerType + '.' + this.name, this.actPage().type + (this.actPage().urlParts ? '~' + this.actPage().urlParts.join('~') : '')); };
        propImpl.prototype.codeTitle = function () { return Utils.fromCammelCase(this.name) + '=""'; };
        propImpl.prototype.childs = function () {
            var _this = this;
            return _.filter(this.types, function (t) { return (_this.actPage().isHtml ? t.isHtml : !t.isHtml) && !t.isIgn; });
        };
        return propImpl;
    })(docNamedImpl);
    doc.propImpl = propImpl;
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
    var docExample = (function (_super) {
        __extends(docExample, _super);
        function docExample(staticData) {
            _super.call(this, staticData);
        }
        docExample.prototype.initProc = function (phase, getTypeOnly, completed) {
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
                            _.each($('.prettyprint'), function (el) { var $el = $(el); $el.text(beautify($el.text())); });
                            //obarveni XML
                            setTimeout(function () { return prettyPrint(); }, 1);
                        }
                        else
                            needPrettyPrint = false;
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        docExample.prototype.doCopy = function (self, mode) {
            var dt = (self);
            var xml = mode == 2 ? dt.codePostListing : dt.codeListing;
            var mts = xml.split(extractCode);
            var mt = _.find(mts, function (m) { return m.length > 1 && m.charAt(0) == '&'; });
            xml = $('<div/>').html(mt).text();
            if (mode == 0) {
                var title = dt.header.Items[0].Items[0];
                xml = '<html xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.langmaster.com/new/author/coursemodelschema.xsd">\n<head>\n<title>' + title + '\n</title>\n</head>\n<body>' + xml + '</body>\n</html>';
            }
            xml = beautify(xml);
            anim.alert().lmcdocDlgShow(xml);
            //Utils.toClipboard(xml);
        };
        docExample.prototype.copyPage = function (self) { this.doCopy(self, 0); };
        docExample.prototype.copyFragment = function (self) { this.doCopy(self, 1); };
        docExample.prototype.copyExpanded = function (self) { this.doCopy(self, 2); };
        return docExample;
    })(Course.tagImpl);
    doc.docExample = docExample;
    var extractCode = /[<>]/;
    var needPrettyPrint = false;
    function beautify(xml) {
        var reg = /(>)(<)(\/*)/g;
        var wsexp = / *(.*) +\n/g;
        var contexp = /(<.+>)(.+\n)/g;
        xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
        var formatted = [];
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
            for (var j = 0; j < indent; j++)
                formatted.push('  ');
            formatted.push(ln);
            formatted.push('\r\n');
        }
        return formatted.join('').trim();
    }
    ;
    //**************
    function getHash(type, url1, url2) {
        if (url1 === void 0) { url1 = null; }
        if (url2 === void 0) { url2 = null; }
        return [doc.appId, type, url1, url2].join('@');
    }
    function Start() {
        CourseMeta.persist = persistMemory.persistCourse;
        Pager.initHash = function () { return cfg.hash ? cfg.hash : getHash(typesType); };
        boot.minInit();
        ViewBase.init();
        $('#splash').hide();
    }
    doc.Start = Start;
    var typesType = "doctypesModel".toLowerCase();
    var propsType = "docpropsModel".toLowerCase();
    var typeType = "doctypeModel".toLowerCase();
    var propType = "docpropModel".toLowerCase();
    var htypesType = "dochtypesModel".toLowerCase();
    var hpropsType = "dochpropsModel".toLowerCase();
    Pager.registerAppLocator(doc.appId, propsType, function (urlParts, completed) { return completed(new propsModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, typesType, function (urlParts, completed) { return completed(new typesModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, propType, function (urlParts, completed) { return completed(new propModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, typeType, function (urlParts, completed) { return completed(new typeModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, hpropsType, function (urlParts, completed) { return completed(new hpropsModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, htypesType, function (urlParts, completed) { return completed(new htypesModel(urlParts)); });
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tdocExample, docExample);
})(doc || (doc = {}));
//prettyPrint()
