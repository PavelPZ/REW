module xref {

  export var valToIdx: { [val: string]: number };
  export var idxToVal: Array<string>;
  export var root: model;

  export function pathToClip(url: string) { Utils.toClipboard((cfg.basicPath == 'q:\\rew\\alpha\\' ? 'p:\\' : cfg.basicPath) + 'rew\\web4' + url.replace(/\//g, '\\') + '.xml'); return false; }

  var sitemap: CourseMeta.data;
  var sitemapDir: { [id: number]: CourseMeta.data; } = {};
  function init(completed: () => void) {
    if (sitemap) completed();
    else CourseMeta.load('/author/xrefSitemap', (jml: Array<any>) => {
      var finishSitemap = (nd: CourseMeta.data) => { sitemapDir[nd.uniqId] = nd; _.each(nd.Items, n => { n.parent = nd; finishSitemap(n); }); };
      sitemap = CourseMeta.jsonML_to_Tag(jml, CourseMeta.meta); finishSitemap(sitemap);
      completed();
    });
  }

  export enum mainTabItem {
    info,
    types,
    props,
  }

  export class model extends Pager.Page {
    constructor(modelType: string, urlParts: string[]) {
      super(appId, modelType, urlParts);
      root = this;
      if (!urlParts) urlParts = [];
      this.nodeId = urlParts[0] ? parseInt(urlParts[0]) : -1;
      this.mainTab = urlParts[1] ? parseInt(urlParts[1]) : mainTabItem.info;
      this.actType = urlParts[2];
      this.actProp = urlParts[3];
      this.propValueIdx = parseInt(urlParts[4]);
    }
    nodeId: number; //-1 => all
    mainTab: mainTabItem;
    actType: string;
    actProp: string;
    propValueIdx: number;
    sitemap: sitemapModel;
    typeMap: typeMapModel;
    links: linksModel;
    propMap: propMapModel;
    propValues: propValuesModel;
    urlContext() { return LowUtils.getQueryParams('url'); }
    refreshError = ko.observable<string>();
    update(completed: () => void): void {
      doc.init(() => init(() => {
        this.sitemap = new sitemapModel(this); //existuje vzdy
        switch (this.mainTab) {
          case mainTabItem.info: completed(); return;
          case mainTabItem.types:
            this.typeMap = new typeMapModel(this); //dostupne types a (je-li zadan typ) jeho dostupne properties
            this.typeMap.update(() => {
              if (this.type == links) {
                this.links = new linksModel(this); //show links pro typ, prop, propValue
                this.links.update(completed);
              } else if (this.type == browsePropValues) {
                this.propValues = new propValuesModel(this);
                this.propValues.update(completed);
              } else
                completed();
            });
            return;
          case mainTabItem.props:
            this.propMap = new propMapModel(this);
            this.propMap.update(() => {
              if (this.type == links) {
                this.links = new linksModel(this); //show links pro typ, prop, propValue
                this.links.update(completed);
              } else if (this.type == browsePropValues) {
                this.propValues = new propValuesModel(this);
                this.propValues.update(completed);
              } else
                completed();
            });
            return;
        }
      }));
    }
    nodeHash(nodeId: number): string { return getHash(browse, nodeId, mainTabItem.info); }

    typeHash(type: string): string { return getHash(links, this.nodeId, this.mainTab, type); }
    typePropHash(prop: string): string { return getHash(links, this.nodeId, this.mainTab, this.actType, prop); }
    typePropValuesHash(): string { return getHash(browsePropValues, this.nodeId, this.mainTab, this.actType, this.actProp); }
    typePropValueHash(value: string): string { return getHash(links, this.nodeId, this.mainTab, this.actType, this.actProp, parseInt(value)); }

    propHash(prop: string): string { return getHash(links, this.nodeId, this.mainTab, null, prop); }
    propValuesHash(): string { return getHash(browsePropValues, this.nodeId, this.mainTab, null, this.actProp); }
    propValueHash(value: string): string { return getHash(links, this.nodeId, this.mainTab, null, this.actProp, parseInt(value)); }

    mainTabHash(tab: mainTabItem): string { return getHash(browse, this.nodeId, tab); }
    //typeLinkHash(): string { return getHash(links, this.nodeId, this.showTypes, this.actType); }
    //propLinkHash(): string { return getHash(links, this.nodeId, this.showTypes, this.actType, this.actProp); }
    //propValueHash(): string { return getHash(browsePropValues, this.nodeId, this.showTypes, this.actType, this.actProp); }
    db_SitemapTabActive(tab: mainTabItem): string { return tab == this.mainTab ? "active" : ""; }
    db_PropTabActive(idx: number): string {
      switch (idx) {
        case 0: return this.type == links ? 'active' : '';
        case 1: return (this.type == browse ? 'active' : '') + ' ' + (!_.isEmpty(this.actProp) && (!this.propValueIdx || this.propValueIdx == 0) ? 'show' : 'hide');
      }
    }
    refreshText = ko.observable('Refresh');
    refresh() {
      this.refreshText('Refreshing...');
      getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.refreshXref, null, null, null, 0, 0, LowUtils.getQueryParams('url')), res => {
        this.refreshText('Refresh');
        this.refreshError(res.error);
      });
    }
  }

  export class sitemapModel {
    constructor(public owner: model) {
      this.actNd = !owner.nodeId || owner.nodeId < 0 ? sitemap : sitemapDir[owner.nodeId];
      if (this.actNd == sitemap) this.parents = null; else { var n = this.actNd.parent; this.parents = []; while (n) { this.parents.push(n); n = n.parent; } this.parents = this.parents.reverse(); }
    }
    actNd: CourseMeta.data;
    parents: Array<CourseMeta.data>;
    nodeXrefUrl(): string {
      return 'author.aspx?mode=xref&url=' + this.actNd.url;
    }
    isProject() { return (this.actNd.type & CourseMeta.runtimeType.project) != 0 || _.any(this.parents, p => (p.type & CourseMeta.runtimeType.project) != 0); }
  }

  export interface typeInfo {
    tag: string;
    lmtag: boolean;
  }

  export class typeMapModel {
    constructor(public owner: model) { }
    update(completed: () => void): void {
      nodeTypes(this.owner.nodeId, types => {
        this.types = _.map(_.sortBy(types), t => { var meta = CourseModel.meta.types[Utils.fromCammelCase(t)]; return { tag: t, lmtag: !meta || meta.anc != "tag-html" }; });
        if (this.owner.actType) {
          typeProps(this.owner.actType, this.owner.nodeId, props => {
            this.props = _.sortBy(props);
            completed();
          });
        } else
          completed();
      });
      //completed();
    }
    types: Array<typeInfo>;
    props: Array<string>;
  }

  export class propMapModel {
    constructor(public owner: model) { }
    update(completed: () => void): void {
      nodeProps(this.owner.nodeId, props => {
        this.props = _.sortBy(props);
        completed();
      });
    }
    props: Array<string>;
  }

  export class linksModel {
    constructor(public owner: model) { }
    update(completed: () => void): void {
      if (this.owner.actType) {
        if (this.owner.propValueIdx) {
          typePropValueLinks(this.owner.actType, this.owner.actProp, this.owner.propValueIdx, this.owner.nodeId, links => { this.links = _.sortBy(links, 'url'); completed(); });
        } else if (this.owner.actProp) {
          typePropLinks(this.owner.actType, this.owner.actProp, this.owner.nodeId, links => { this.links = _.sortBy(links, 'url'); completed(); });
        } else {
          typeLinks(this.owner.actType, this.owner.nodeId, links => { this.links = _.sortBy(links, 'url'); completed(); });
        }
      } else {
        if (this.owner.propValueIdx) {
          propValueLinks(this.owner.actProp, this.owner.propValueIdx, this.owner.nodeId, links => { this.links = _.sortBy(links, 'url'); completed(); });
        } else {
          propLinks(this.owner.actProp, this.owner.nodeId, links => { this.links = _.sortBy(links, 'url'); completed(); });
        }
      }
    }
    links: Array<Admin.xrefLink>;
  }

  export class propValuesModel {
    constructor(public owner: model) { }
    update(completed: () => void): void {
      if (this.owner.actType) {
        typePropValues(this.owner.actType, this.owner.actProp, this.owner.nodeId, values => {
          var vals = _.sortBy(values);
          valToIdx = { dummyValue: 0 }; idxToVal = [dummyValue]; this.values = [];
          _.each(vals, v => { valToIdx[v] = idxToVal.length; this.values.push(idxToVal.length); idxToVal.push(v); });
          completed();
        });
      } else {
        propValues(this.owner.actProp, this.owner.nodeId, values => {
          var vals = _.sortBy(values);
          valToIdx = { dummyValue: 0 }; idxToVal = [dummyValue]; this.values = [];
          _.each(vals, v => { valToIdx[v] = idxToVal.length; this.values.push(idxToVal.length); idxToVal.push(v); });
          completed();
        });
      }
    }
    values: Array<number>;
  }

  //***** server services
  function nodeTypes(nodeId: number, completed: (res: string[]) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.nodeTypes, null, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.names));
  }
  function nodeProps(nodeId: number, completed: (res: string[]) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.nodeProps, null, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.names));
  }
  function typeProps(type: string, nodeId: number, completed: (res: string[]) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typeProps, type, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.names));
  }
  function typePropValues(type: string, prop: string, nodeId: number, completed: (res: string[]) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropValues, type, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.names));
  }
  function typeLinks(type: string, nodeId: number, completed: (res: Array<Admin.xrefLink>) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typeLinks, type, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.links));
  }
  function typePropLinks(type: string, prop: string, nodeId: number, completed: (res: Array<Admin.xrefLink>) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropLinks, type, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.links));
  }
  function typePropValueLinks(type: string, prop: string, valIdx: number, nodeId: number, completed: (res: Array<Admin.xrefLink>) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropValueLinks, type, prop, idxToVal[valIdx], nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.links));
  }
  function propValues(prop: string, nodeId: number, completed: (res: string[]) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propValues, null, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.names));
  }
  function propLinks(prop: string, nodeId: number, completed: (res: Array<Admin.xrefLink>) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propLinks, null, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.links));
  }
  function propValueLinks(prop: string, valIdx: number, nodeId: number, completed: (res: Array<Admin.xrefLink>) => void) {
    getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propValueLinks, null, prop, idxToVal[valIdx], nodeId, maxLinks, LowUtils.getQueryParams('url')), res => completed(res.links));
  }
  var maxLinks = 500; var dummyValue = '&&[[]]';

  function getData(par: Admin.CmdXrefData, completed: (data: Admin.CmdXrefDataResult) => void) {
    Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdXrefData_Type, par, completed);
  }


  //***** navigace
  function getHash(modelType: string, nodeId: number = -1, mainTab: mainTabItem = 0, type: string = null, prop: string = null, valueIdx: number = 0): string {
    return oldPrefix + [appId, modelType, nodeId.toString(), mainTab.toString(), type, prop, valueIdx ? valueIdx.toString() : '0', LowUtils.getQueryParams('url')].join(hashDelim);
  }

  export function Start() {
    CourseMeta.persist = persistMemory.persistCourse;
    Pager.initHash = () => cfg.hash ? cfg.hash : getHash(browse);
    boot.minInit();
    ViewBase.init(); $('#splash').hide();
  }

  var browse = "xrefbrowseModel".toLowerCase();
  var browsePropValues = "xrefbrowsePropValuesModel".toLowerCase();
  var links = "xreflinksModel".toLowerCase();

  Pager.registerAppLocator(appId, browse, (urlParts, completed) => completed(new model(browse, urlParts)));
  Pager.registerAppLocator(appId, links, (urlParts, completed) => completed(new model(links, urlParts)));
  Pager.registerAppLocator(appId, browsePropValues, (urlParts, completed) => completed(new model(browsePropValues, urlParts)));

  $.views.helpers({ xref: xref });

}


