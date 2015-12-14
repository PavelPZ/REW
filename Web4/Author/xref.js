var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xref;
(function (xref) {
    function pathToClip(url) { Utils.toClipboard((cfg.basicPath == 'q:\\rew\\alpha\\' ? 'p:\\' : cfg.basicPath) + 'rew\\web4' + url.replace(/\//g, '\\') + '.xml'); return false; }
    xref.pathToClip = pathToClip;
    var sitemap;
    var sitemapDir = {};
    function init(completed) {
        if (sitemap)
            completed();
        else
            CourseMeta.load('/author/xrefSitemap', function (jml) {
                var finishSitemap = function (nd) { sitemapDir[nd.uniqId] = nd; _.each(nd.Items, function (n) { n.parent = nd; finishSitemap(n); }); };
                sitemap = CourseMeta.jsonML_to_Tag(jml, CourseMeta.meta);
                finishSitemap(sitemap);
                completed();
            });
    }
    (function (mainTabItem) {
        mainTabItem[mainTabItem["info"] = 0] = "info";
        mainTabItem[mainTabItem["types"] = 1] = "types";
        mainTabItem[mainTabItem["props"] = 2] = "props";
    })(xref.mainTabItem || (xref.mainTabItem = {}));
    var mainTabItem = xref.mainTabItem;
    var model = (function (_super) {
        __extends(model, _super);
        function model(modelType, urlParts) {
            _super.call(this, xref.appId, modelType, urlParts);
            this.refreshError = ko.observable();
            this.refreshText = ko.observable('Refresh');
            xref.root = this;
            if (!urlParts)
                urlParts = [];
            this.nodeId = urlParts[0] ? parseInt(urlParts[0]) : -1;
            this.mainTab = urlParts[1] ? parseInt(urlParts[1]) : mainTabItem.info;
            this.actType = urlParts[2];
            this.actProp = urlParts[3];
            this.propValueIdx = parseInt(urlParts[4]);
        }
        model.prototype.urlContext = function () { return LowUtils.getQueryParams('url'); };
        model.prototype.update = function (completed) {
            var _this = this;
            doc.init(function () { return init(function () {
                _this.sitemap = new sitemapModel(_this); //existuje vzdy
                switch (_this.mainTab) {
                    case mainTabItem.info:
                        completed();
                        return;
                    case mainTabItem.types:
                        _this.typeMap = new typeMapModel(_this); //dostupne types a (je-li zadan typ) jeho dostupne properties
                        _this.typeMap.update(function () {
                            if (_this.type == links) {
                                _this.links = new linksModel(_this); //show links pro typ, prop, propValue
                                _this.links.update(completed);
                            }
                            else if (_this.type == browsePropValues) {
                                _this.propValues = new propValuesModel(_this);
                                _this.propValues.update(completed);
                            }
                            else
                                completed();
                        });
                        return;
                    case mainTabItem.props:
                        _this.propMap = new propMapModel(_this);
                        _this.propMap.update(function () {
                            if (_this.type == links) {
                                _this.links = new linksModel(_this); //show links pro typ, prop, propValue
                                _this.links.update(completed);
                            }
                            else if (_this.type == browsePropValues) {
                                _this.propValues = new propValuesModel(_this);
                                _this.propValues.update(completed);
                            }
                            else
                                completed();
                        });
                        return;
                }
            }); });
        };
        model.prototype.nodeHash = function (nodeId) { return getHash(browse, nodeId, mainTabItem.info); };
        model.prototype.typeHash = function (type) { return getHash(links, this.nodeId, this.mainTab, type); };
        model.prototype.typePropHash = function (prop) { return getHash(links, this.nodeId, this.mainTab, this.actType, prop); };
        model.prototype.typePropValuesHash = function () { return getHash(browsePropValues, this.nodeId, this.mainTab, this.actType, this.actProp); };
        model.prototype.typePropValueHash = function (value) { return getHash(links, this.nodeId, this.mainTab, this.actType, this.actProp, parseInt(value)); };
        model.prototype.propHash = function (prop) { return getHash(links, this.nodeId, this.mainTab, null, prop); };
        model.prototype.propValuesHash = function () { return getHash(browsePropValues, this.nodeId, this.mainTab, null, this.actProp); };
        model.prototype.propValueHash = function (value) { return getHash(links, this.nodeId, this.mainTab, null, this.actProp, parseInt(value)); };
        model.prototype.mainTabHash = function (tab) { return getHash(browse, this.nodeId, tab); };
        //typeLinkHash(): string { return getHash(links, this.nodeId, this.showTypes, this.actType); }
        //propLinkHash(): string { return getHash(links, this.nodeId, this.showTypes, this.actType, this.actProp); }
        //propValueHash(): string { return getHash(browsePropValues, this.nodeId, this.showTypes, this.actType, this.actProp); }
        model.prototype.db_SitemapTabActive = function (tab) { return tab == this.mainTab ? "active" : ""; };
        model.prototype.db_PropTabActive = function (idx) {
            switch (idx) {
                case 0: return this.type == links ? 'active' : '';
                case 1: return (this.type == browse ? 'active' : '') + ' ' + (!_.isEmpty(this.actProp) && (!this.propValueIdx || this.propValueIdx == 0) ? 'show' : 'hide');
            }
        };
        model.prototype.refresh = function () {
            var _this = this;
            this.refreshText('Refreshing...');
            getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.refreshXref, null, null, null, 0, 0, LowUtils.getQueryParams('url')), function (res) {
                _this.refreshText('Refresh');
                _this.refreshError(res.error);
            });
        };
        return model;
    })(Pager.Page);
    xref.model = model;
    var sitemapModel = (function () {
        function sitemapModel(owner) {
            this.owner = owner;
            this.actNd = !owner.nodeId || owner.nodeId < 0 ? sitemap : sitemapDir[owner.nodeId];
            if (this.actNd == sitemap)
                this.parents = null;
            else {
                var n = this.actNd.parent;
                this.parents = [];
                while (n) {
                    this.parents.push(n);
                    n = n.parent;
                }
                this.parents = this.parents.reverse();
            }
        }
        sitemapModel.prototype.nodeXrefUrl = function () {
            return 'author.aspx?mode=xref&url=' + this.actNd.url;
        };
        sitemapModel.prototype.isProject = function () { return (this.actNd.type & CourseMeta.runtimeType.project) != 0 || _.any(this.parents, function (p) { return (p.type & CourseMeta.runtimeType.project) != 0; }); };
        return sitemapModel;
    })();
    xref.sitemapModel = sitemapModel;
    var typeMapModel = (function () {
        function typeMapModel(owner) {
            this.owner = owner;
        }
        typeMapModel.prototype.update = function (completed) {
            var _this = this;
            nodeTypes(this.owner.nodeId, function (types) {
                _this.types = _.map(_.sortBy(types), function (t) { var meta = CourseModel.meta.types[Utils.fromCammelCase(t)]; return { tag: t, lmtag: !meta || meta.anc != "tag-html" }; });
                if (_this.owner.actType) {
                    typeProps(_this.owner.actType, _this.owner.nodeId, function (props) {
                        _this.props = _.sortBy(props);
                        completed();
                    });
                }
                else
                    completed();
            });
            //completed();
        };
        return typeMapModel;
    })();
    xref.typeMapModel = typeMapModel;
    var propMapModel = (function () {
        function propMapModel(owner) {
            this.owner = owner;
        }
        propMapModel.prototype.update = function (completed) {
            var _this = this;
            nodeProps(this.owner.nodeId, function (props) {
                _this.props = _.sortBy(props);
                completed();
            });
        };
        return propMapModel;
    })();
    xref.propMapModel = propMapModel;
    var linksModel = (function () {
        function linksModel(owner) {
            this.owner = owner;
        }
        linksModel.prototype.update = function (completed) {
            var _this = this;
            if (this.owner.actType) {
                if (this.owner.propValueIdx) {
                    typePropValueLinks(this.owner.actType, this.owner.actProp, this.owner.propValueIdx, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
                else if (this.owner.actProp) {
                    typePropLinks(this.owner.actType, this.owner.actProp, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
                else {
                    typeLinks(this.owner.actType, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
            }
            else {
                if (this.owner.propValueIdx) {
                    propValueLinks(this.owner.actProp, this.owner.propValueIdx, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
                else {
                    propLinks(this.owner.actProp, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
            }
        };
        return linksModel;
    })();
    xref.linksModel = linksModel;
    var propValuesModel = (function () {
        function propValuesModel(owner) {
            this.owner = owner;
        }
        propValuesModel.prototype.update = function (completed) {
            var _this = this;
            if (this.owner.actType) {
                typePropValues(this.owner.actType, this.owner.actProp, this.owner.nodeId, function (values) {
                    var vals = _.sortBy(values);
                    xref.valToIdx = { dummyValue: 0 };
                    xref.idxToVal = [dummyValue];
                    _this.values = [];
                    _.each(vals, function (v) { xref.valToIdx[v] = xref.idxToVal.length; _this.values.push(xref.idxToVal.length); xref.idxToVal.push(v); });
                    completed();
                });
            }
            else {
                propValues(this.owner.actProp, this.owner.nodeId, function (values) {
                    var vals = _.sortBy(values);
                    xref.valToIdx = { dummyValue: 0 };
                    xref.idxToVal = [dummyValue];
                    _this.values = [];
                    _.each(vals, function (v) { xref.valToIdx[v] = xref.idxToVal.length; _this.values.push(xref.idxToVal.length); xref.idxToVal.push(v); });
                    completed();
                });
            }
        };
        return propValuesModel;
    })();
    xref.propValuesModel = propValuesModel;
    //***** server services
    function nodeTypes(nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.nodeTypes, null, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function nodeProps(nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.nodeProps, null, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function typeProps(type, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typeProps, type, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function typePropValues(type, prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropValues, type, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function typeLinks(type, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typeLinks, type, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function typePropLinks(type, prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropLinks, type, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function typePropValueLinks(type, prop, valIdx, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropValueLinks, type, prop, xref.idxToVal[valIdx], nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function propValues(prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propValues, null, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function propLinks(prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propLinks, null, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function propValueLinks(prop, valIdx, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propValueLinks, null, prop, xref.idxToVal[valIdx], nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    var maxLinks = 500;
    var dummyValue = '&&[[]]';
    function getData(par, completed) {
        Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdXrefData_Type, par, completed);
    }
    //***** navigace
    function getHash(modelType, nodeId, mainTab, type, prop, valueIdx) {
        if (nodeId === void 0) { nodeId = -1; }
        if (mainTab === void 0) { mainTab = 0; }
        if (type === void 0) { type = null; }
        if (prop === void 0) { prop = null; }
        if (valueIdx === void 0) { valueIdx = 0; }
        return [xref.appId, modelType, nodeId.toString(), mainTab.toString(), type, prop, valueIdx ? valueIdx.toString() : '0', LowUtils.getQueryParams('url')].join('@');
    }
    function Start() {
        CourseMeta.persist = persistMemory.persistCourse;
        Pager.initHash = function () { return cfg.hash ? cfg.hash : getHash(browse); };
        boot.minInit();
        ViewBase.init();
        $('#splash').hide();
    }
    xref.Start = Start;
    var browse = "xrefbrowseModel".toLowerCase();
    var browsePropValues = "xrefbrowsePropValuesModel".toLowerCase();
    var links = "xreflinksModel".toLowerCase();
    Pager.registerAppLocator(xref.appId, browse, function (urlParts, completed) { return completed(new model(browse, urlParts)); });
    Pager.registerAppLocator(xref.appId, links, function (urlParts, completed) { return completed(new model(links, urlParts)); });
    Pager.registerAppLocator(xref.appId, browsePropValues, function (urlParts, completed) { return completed(new model(browsePropValues, urlParts)); });
    $.views.helpers({ xref: xref });
})(xref || (xref = {}));
