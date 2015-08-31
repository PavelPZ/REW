namespace CourseMeta {
  export interface data extends blended.IPersistNodeImpl { }//rozsireni CourseMeta.data o novou persistenci
}

module blended {

  export interface IPersistNodeItem<T> { //persistentni udaj pro jednu variantu (jeden taskId). Kazde cviceni apod. se muze spustit vicekrat, aniz by se prepisovaly jeho user data.
    short: T;
    long: IExLong;
    modified: boolean;
  }

  export interface IPersistNodeUser { //user dato pro task obecne
  }

  export interface IPersistNodeImpl {
    userData: { [taskId: string]: IPersistNodeItem<any>; } //dato pro jednotlive variatny
  }

  export function getPersistWrapper<T>(dataNode: CourseMeta.data, taskid: string, createProc?: () => T): IPersistNodeItem<T> {
    if (createProc) {
      if (!dataNode.userData) dataNode.userData = {};
      var res = dataNode.userData[taskid]; if (res) return res;
      res = { long: null, short: createProc(), modified: true };
      dataNode.userData[taskid] = res;
      return res;
    } else {
      if (!dataNode.userData) return null;
      return dataNode.userData[taskid];
    }
  }
  export function getPersistData<T>(dataNode: CourseMeta.data, taskid: string): T {
    var res = getPersistWrapper<T>(dataNode, taskid);
    return res ? res.short : null;
  }

  export function setPersistData<T>(dataNode: CourseMeta.data, taskid: string, modify: (data: T) => void): T {
    var it = dataNode.userData ? dataNode.userData[taskid] : null;
    if (!it) {
      it = { short: <T>{}, modified: true, long:null };
      if (!dataNode.userData) dataNode.userData = {};
      dataNode.userData[taskid] = it;
    } else
      it.modified = true;
    modify(<T>(it.short));
    return <T>(it.short);
  }


  export interface IProductEx extends CourseMeta.product, IProductAddIn { //rozsireni CourseMeta.product o novou persistenci
    instructions: { [id: string]: string; }; //pool s instrukcemi
    persistData: { [url: string]: any; }; //short user data pro cely produkt
    nodeDir: { [id: string]: CourseMeta.data; }; //adresar nodes
    nodeList: Array<CourseMeta.data>; //seznam nodes
    moduleCache: loader.cacheOf<cachedModule>; //cache modulu (kapitol) s lokalizacemi cviceni a slovniky
    //loader: string; //specialni produkty na managovani
  }

  //Misto externi knihovny ma metody pristupu k nodes primo produkt
  export interface IProductAddIn {
    findParent<TRes extends CourseMeta.data>(self: CourseMeta.data, cond: (it: CourseMeta.data) => boolean): TRes;
    find<TRes extends CourseMeta.data>(url: string): TRes;
    addExternalTaskNode(repo: CourseMeta.data);
    saveProduct(ctx: learnContext, completed: () => void);
  }

  //rozsireni interface o metody
  export function finishProduktStart(prod: IProductEx) {
    $.extend(prod, productEx);
    prod.moduleCache = new blended.loader.cacheOf<cachedModule>(3);
  }

  export var productEx: IProductAddIn = {
    findParent<TRes extends CourseMeta.data>(self: CourseMeta.data, cond: (it: CourseMeta.data) => boolean): TRes {
      var c = self;
      while (c != null) { if (cond(c)) return <TRes>c; c = c.parent; }
      return null;
    },
    find<TRes extends CourseMeta.data>(url: string): TRes {
      var pe = <IProductEx>this;
      return <TRes>(pe.nodeDir[url]);
    },
    addExternalTaskNode(repo: CourseMeta.data) {
      var pe = <IProductEx>this;
      if (pe.nodeDir[repo.url]) return;
      pe.nodeDir[repo.url] = repo;
      pe.nodeList.push(repo);
    },
    saveProduct(ctx: learnContext, completed: () => void) {
      var pe = <IProductEx>this;
      var toSave: Array<ISaveData> = [];
      _.each(pe.nodeList, nd => {
        if (!nd.userData) return;
        for (var p in nd.userData) {
          var d = nd.userData[p]; if (!d.modified) return;
          d.modified = false;
          toSave.push({ url: nd.url, taskId: p, shortData: JSON.stringify(d.short), longData: d.long ? JSON.stringify(d.long) : null });
        }
      });
      if (toSave.length == 0) { completed(); return; }
      proxies.vyzva57services.saveUserData(ctx.companyid, ctx.userdataid, ctx.productUrl, toSave, completed);
    }
  }
  interface ISaveData {
    url: string;
    taskId: string;
    shortData: string;
    longData: string;
  }

  export class cachedModule { //module z cache
    constructor(data: any, public dataNode: CourseMeta.data) {
      $.extend(this, data);
      if (!this.loc) this.loc = {};
      if (this.dict) this.dict = RJSON.unpack(this.dict);
    }
    loc: { [id: string]: any; };
    dict: schools.DictItemRoot;
    cacheOfPages = new loader.cacheOf<cacheExercise>(30);
  }

  export class cacheExercise {
    constructor(public mod: cachedModule, public dataNode: CourseMeta.data, public pageJsonML: any[]) { }
  }

  export module loader {

    //help
    //var _adjustProduct = CourseMeta.lib.adjustProduct;
    //var _adjustMod = CourseMeta.lib.adjustMod;
    //var _loadLocalizedProductAndInstrs = CourseMeta.loadLocalizedProductAndInstrs;
    //var _finishInstr = CourseMeta.finishInstr;
    ////slovnik pro modul
    //var _dict: schools.Dict;
    //var _dictItem: schools.DictItem;
    //var _dictItemRoot: schools.DictItemRoot;

    //baseUrlRelToRoot: relativni adresa rootu Web4 aplikace vyhledem k aktualni HTML strance
    export function adjustProduct(ctx: learnContext): ng.IPromise<IProductEx> {
      try {
        var deferred = ctx.$q.defer();
        var prod = productCache.fromCache(ctx);
        if (prod) { deferred.resolve(prod); return; }
        var href = ctx.productUrl.substr(0, ctx.productUrl.length - 1);
        var promises = _.map(
          [href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'],
          url => ctx.$http.get(baseUrlRelToRoot + url, { transformResponse: s => CourseMeta.jsonParse(s) }));
        ctx.$q.all(promises).then(
          (files: Array<ng.IHttpPromiseCallbackArg<any>>) => {
            prod = files[0].data; prod.url = ctx.productUrl; prod.instructions = {}; prod.nodeDir = {}; prod.nodeList = [];
            finishProduktStart(prod);
            var loc: { [id: string]: any; } = files[1].data; if (!loc) loc = {};
            var instrs: Array<any> = files[2].data;
            //vypln seznamy a adresar nodes
            var scan: (dt: CourseMeta.data) => void;
            scan = dt => {
              prod.nodeDir[dt.url] = dt; prod.nodeList.push(dt);
              if (dt.other) dt = $.extend(dt, JSON.parse(dt.other.replace(/'/g,'"')));
              _.each(dt.Items, it => { it.parent = dt; scan(it); });
            };
            scan(prod);
            //if (prod.loader) { deferred.resolve(prod); return; } //specialni MANAGER produkty
            //lokalizace produktu
            _.each(prod.nodeList, dt => dt.title = CourseMeta.localizeString(dt.url, dt.title, loc));
            //finish instrukce
            if (instrs) for (var p in instrs) {
              var pg = CourseMeta.extractEx(instrs[p]); if (pg == null) { debugger; throw 'missing instr'; }
              pg.Items = _.filter(pg.Items, it => !_.isString(it));
              Course.localize(pg, s => CourseMeta.localizeString(pg.url, s, loc));
              Course.scanEx(pg, tg => { if (!_.isString(tg)) delete tg.id; }); //instrukce nemohou mit tag.id, protoze se ID tlucou s ID ze cviceni
              prod.instructions[p] = JsRenderTemplateEngine.render("c_genitems", pg);
            }
            //cache
            if (ctx.finishProduct) ctx.finishProduct(prod);
            productCache.toCache(ctx, prod);
            //user data
            if (!!ctx.persistence) ctx.persistence.loadShortUserData(ctx.loginid, ctx.companyid, ctx.productUrl, data => {
              prod.persistData = data;
              //if (data) for (var p in data) { var dt = prod.nodeDir[p]; if (dt) dt.userData = data[p]; /*nektera data mohou patrit taskum*/ }
              deferred.resolve(prod);
            }); else {
              deferred.resolve(prod);
            }
          },
          errors => {
            deferred.reject();
          });
      } finally { return deferred.promise; }
    }
    function adjustModule(ctx: learnContext, modData: CourseMeta.data, prod: IProductEx): ng.IPromise<cachedModule> {
      ctx = finishContext(ctx);
      var deferred = ctx.$q.defer();
      try {
        var mod = prod.moduleCache.fromCache(ctx.moduleUrl, null);
        if (mod) { deferred.resolve(mod); return; }
        var href = baseUrlRelToRoot + ctx.moduleUrl.substr(0, ctx.moduleUrl.length - 1) + '.' + LMComLib.Langs[ctx.loc] + '.js';
        ctx.$http.get(href).then(
          (file: ng.IHttpPromiseCallbackArg<any>) => {
            mod = new cachedModule(file.data, modData);
            prod.moduleCache.toCache(ctx.moduleUrl, null, mod);
            deferred.resolve(mod);
          },
          errors => {
            deferred.reject();
          });
      } finally { return deferred.promise; }
    }
    export function adjustEx(ctx: learnContext): ng.IPromise<cacheExercise> {
      ctx = finishContext(ctx);
      var deferred = ctx.$q.defer<cacheExercise>();
      try {
        adjustProduct(ctx).then(prod => {
          var exNode = prod.find<CourseMeta.data>(ctx.Url);
          var modData = prod.findParent<CourseMeta.data>(exNode, (n: CourseMeta.data) => CourseMeta.isType(n, CourseMeta.runtimeType.mod));
          if (modData == null) throw 'Exercise ' + ctx.Url + ' does not have module';
          var modCtx = cloneAndModifyContext(ctx, m => m.moduleurl = encodeUrl(modData.url));
          adjustModule(modCtx, modData, prod).then(mod => {
            var exServ = mod.cacheOfPages.fromCache(ctx.Url, ctx.taskid);
            if (exServ) { deferred.resolve(exServ); return; }
            var href = baseUrlRelToRoot + ctx.Url + '.js';
            ctx.$http.get(href, { transformResponse: s => CourseMeta.jsonParse(s) }).then(
              (file: ng.IHttpPromiseCallbackArg<Array<any>>) => {
                var exServ = new cacheExercise(mod, exNode, file.data);
                mod.cacheOfPages.toCache(ctx.Url, ctx.taskid, exServ);
                deferred.resolve(exServ);

                //var pg = CourseMeta.extractEx(file.data);
                //Course.localize(pg, s => CourseMeta.localizeString(pg.url, s, mod.loc));
                //var isGramm = CourseMeta.isType(exNode, CourseMeta.runtimeType.grammar);
                //var callResolve = () => {
                //  var exServ = new exerciseService(ctx, mod, exNode, pg);
                //  mod.cacheOfPages.toCache(ctx.Url, ctx.taskid, exServ);
                //  deferred.resolve(exServ);
                //}
                //if (isGramm)
                //  callResolve();
                //else {
                //  if (pg.evalPage) exNode.ms = pg.evalPage.maxScore;
                //  pg.myNode = exNode;
                //  callResolve();
                //}
              },
              errors => {
                deferred.reject();
              });
          });
        });
      } finally { return deferred.promise; }
    }

    export function blendedDisplayEx(pg: Course.Page, insertToHTMLPage: (html: string) => void) {

    }



    //*************** globalni CACHE produktu
    export interface productCacheItem extends learnContext { //prvek cache
      data: IProductEx;
      insertOrder: number;
    }
    export class cacheOfProducts {
      products: Array<productCacheItem> = [];
      maxInsertOrder = 0;
      fromCache(ctx: learnContext): IProductEx {
        var resIt = _.find(this.products, it => it.companyid == ctx.companyid && it.userdataid == ctx.userdataid &&
          it.persistence == ctx.persistence && it.loc == ctx.loc && it.producturl == ctx.producturl); // && it.loginid == ctx.loginid && it.taskid == ctx.taskid);
        if (resIt) resIt.insertOrder = this.maxInsertOrder++;
        return resIt ? resIt.data : null;
      }
      toCache(ctx: learnContext, prod: IProductEx): void {
        if (this.products.length >= 3) { //vyrad prvni pridany
          var minIdx = 99999;
          for (var i = 0; i < this.products.length; i++) minIdx = Math.min(this.products[i].insertOrder, minIdx);
          this.products.splice(minIdx, 1);
        }
        this.products.push({
          companyid: ctx.companyid, loc: ctx.loc, producturl: ctx.producturl, persistence: ctx.persistence, userdataid: ctx.userdataid,
          data: prod, insertOrder: this.maxInsertOrder++, taskid: null, loginid: -1, lickeys:null,
        });
      }
    }

    export var productCache = new cacheOfProducts();

    //*************** CACHE modulu (v produktu), cache cviceni (v modulu)
    export class cacheOf<T> { //cache modulu v produktu
      constructor(public maxLength: number) { }
      modules: { [urlTaskId: string]: cacheItem<T>; } = {};
      maxInsertOrder = 0;
      fromCache(url: string, taskId: string): T {
        var urlTaskId = url + (taskId ? '|' + taskId : '');
        var cch = this.modules[urlTaskId];
        return cch ? cch.data : null;
      }
      toCache(url: string, taskId: string, mod: T): void {
        var urlTaskId = url + (taskId ? '|' + taskId : '');
        var cnt = 0; var minIdx = 99999; var propName: string;
        for (var p in this.modules) {
          cnt++;
          var m = this.modules[p];
          if (m.insertOrder >= minIdx) return;
          minIdx = m.insertOrder; propName = p;
        }
        if (cnt > 5) delete this.modules[propName];
        this.modules[urlTaskId] = { data: mod, insertOrder: this.maxInsertOrder++ };
      }
    }
    export interface cacheItem<T> { //prvek cache
      data: T;
      insertOrder: number;
    }

  }
}

