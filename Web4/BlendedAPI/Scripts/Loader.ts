namespace CourseMeta {

  //export interface data extends blended.IPersistNodeImpl { //rozsireni CourseMeta.data o novou persistenci
  //}

  export interface IProductEx extends product, IProductAddIn { //rozsireni CourseMeta.product o novou persistenci
    instructions: { [id: string]: string; };
    nodeDir: { [id: string]: data; };
    nodeList: Array<data>;
    moduleCache: blended.loader.cacheOf<blended.module>;
    persistData: { [url: string]: any; }; //user short data pro cely produkt
  }

  //Misto externi knihovny ma metody pristupu k nodes primo produkt
  export interface IProductAddIn {
    findParent<TRes extends data>(self: data, cond: (it: data) => boolean): TRes;
    find<TRes extends data>(url: string): TRes;
  }

  //rozsireni interface o metody
  export function extendProduct(prod: IProductEx) {
    $.extend(prod, productEx);
    prod.moduleCache = new blended.loader.cacheOf<blended.module>(3);
  }

  export var productEx: IProductAddIn = {
    findParent<TRes extends data>(self: data, cond: (it: data) => boolean): TRes {
      var c = self;
      while (c != null) { if (cond(c)) return <TRes>c; c = c.parent; }
      return null;
    },
    find<TRes extends data>(url: string): TRes {
      var pe = <IProductEx>this;
      return <TRes>(pe.nodeDir[url]);
    }
  }
}

module blended {

  export interface module { //module z cache
    loc: { [id: string]: any; };
    dict: schools.DictItemRoot;
    cacheOfPages: loader.cacheOf<Course.Page>;
  }

  export module loader {

    //help
    var _adjustProduct = CourseMeta.lib.adjustProduct;
    var _adjustMod = CourseMeta.lib.adjustMod;
    var _loadLocalizedProductAndInstrs = CourseMeta.loadLocalizedProductAndInstrs;
    var _finishInstr = CourseMeta.finishInstr;
    //slovnik pro modul
    var _dict: schools.Dict;
    var _dictItem: schools.DictItem;
    var _dictItemRoot: schools.DictItemRoot;

    //baseUrlRelToRoot: relativni adresa rootu Web4 aplikace vyhledem k aktualni HTML strance
    export function adjustProduct(ctx: learnContext): ng.IPromise<CourseMeta.IProductEx> {
      ctx = finishContext(ctx);
      var deferred = ctx.$q.defer();
      var prod = productCache.fromCache(ctx);
      if (prod) { deferred.resolve(prod); return; }
      var href = ctx.producturl.substr(0, ctx.producturl.length - 1);
      var promises = _.map(
        [href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'],
        url => ctx.$http.get(baseUrlRelToRoot + url, { transformResponse: s => CourseMeta.jsonParse(s) }));
      ctx.$q.all(promises).then(
        (files: Array<ng.IHttpPromiseCallbackArg<any>>) => {
          prod = files[0].data; prod.url = ctx.producturl; prod.instructions = {}; prod.nodeDir = {}; prod.nodeList = [];
          CourseMeta.extendProduct(prod);
          var loc: { [id: string]: any; } = files[1].data; if (!loc) loc = {};
          var instrs: Array<any> = files[2].data;
          //vypln seznamy a adresar nodes
          var scan: (dt: CourseMeta.data) => void;
          scan = dt => {
            prod.nodeDir[dt.url] = dt; prod.nodeList.push(dt); //if (dt.other) dt.other = $.extend(dt, JSON.parse(dt.other));
            _.each(dt.Items, it => { it.parent = dt; scan(it); });
          };
          scan(prod);
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
          productCache.toCache(ctx, prod);
          //user data
          if (!!ctx.persistence) ctx.persistence.loadShortUserData(ctx.userid, ctx.companyid, ctx.producturl, data => {
            prod.persistData = data;
            //if (data) for (var p in data) { var dt = prod.nodeDir[p]; if (dt) dt.userData = data[p]; /*nektera data mohou patrit taskum*/ }
            deferred.resolve(prod);
          }); else
            deferred.resolve(prod);
        },
        errors => {
          deferred.reject();
        });
      return deferred.promise;
    }
    function adjustModule(ctx: learnContext, prod: CourseMeta.IProductEx): ng.IPromise<module> {
      ctx = finishContext(ctx);
      var deferred = ctx.$q.defer();
      var mod = prod.moduleCache.fromCache(ctx.url);
      if (mod) { deferred.resolve(mod); return; }
      var href = baseUrlRelToRoot + ctx.url.substr(0, ctx.url.length - 1) + '.' + LMComLib.Langs[ctx.loc] + '.js';
      ctx.$http.get(href).then(
        (file: ng.IHttpPromiseCallbackArg<any>) => {
          mod = file.data; if (!mod.loc) mod.loc = {}; if (mod.dict) mod.dict = RJSON.unpack(mod.dict);
          mod.cacheOfPages = new loader.cacheOf<Course.Page>(30);
          prod.moduleCache.toCache(ctx.url, mod);
          deferred.resolve(mod);
        },
        errors => {
          deferred.reject();
        });
      return deferred.promise;
    }
    export function adjustEx(ctx: learnContext): ng.IPromise<CourseMeta.ex> {
      ctx = finishContext(ctx);
      var deferred = ctx.$q.defer();
      adjustProduct(ctx).then(prod => {
        var exNode = prod.find(ctx.url);
        var mod = prod.findParent(exNode, n => CourseMeta.isType(n, CourseMeta.runtimeType.mod));
        if (mod == null) throw 'Exercise ' + ctx.url + ' does not have module';
        var modCtx = cloneContext(ctx); modCtx.url = mod.url;
        adjustModule(modCtx, prod).then(mod => {
          var pg = mod.cacheOfPages.fromCache(ctx.url);
          if (pg) { deferred.resolve(pg); return; }
          var href = baseUrlRelToRoot + ctx.url + '.js';
          ctx.$http.get(href, { transformResponse: s => CourseMeta.jsonParse(s) }).then(
            (file: ng.IHttpPromiseCallbackArg<Array<any>>) => {
              var pg = CourseMeta.extractEx(file.data);
              Course.localize(pg, s => CourseMeta.localizeString(pg.url, s, mod.loc));
              var isGramm = CourseMeta.isType(exNode, CourseMeta.runtimeType.grammar);
              mod.cacheOfPages.toCache(ctx.url, pg);
              if (isGramm)
                deferred.resolve(exNode);
              else {
                if (!!ctx.persistence) ctx.persistence.loadUserData(ctx.userid, ctx.companyid, ctx.producturl, ctx.url, exData => {
                  if (pg.evalPage && !pg.isOldEa) exNode.ms = pg.evalPage.maxScore;
                  //provazani produktu, stranky, modulu:
                  if (!exData) exData = {}; pg.userData = exData;
                  pg.myNode = exNode;
                  deferred.resolve(exNode);
                }); else
                  deferred.resolve(exNode);
              }
            },
            errors => {
              deferred.reject();
            });
        });
      });
      return deferred.promise;
    }

    //*************** globalni CACHE produktu
    export interface productCacheItem extends learnContext { //prvek cache
      data: CourseMeta.IProductEx;
      insertOrder: number;
    }
    export class cacheOfProducts {
      products: Array<productCacheItem> = [];
      maxInsertOrder = 0;
      fromCache(ctx: learnContext): CourseMeta.IProductEx {
        var resIt = _.find(this.products, it => it.companyid == ctx.companyid && it.userid == ctx.userid && it.adminid == ctx.adminid &&
          it.persistence == ctx.persistence && it.loc == ctx.loc && it.producturl == ctx.producturl);
        if (resIt) resIt.insertOrder = this.maxInsertOrder++;
        return resIt ? resIt.data : null;
      }
      toCache(ctx: learnContext, prod: CourseMeta.IProductEx): void {
        if (this.products.length >= 3) { //vyrad prvni pridany
          var minIdx = 99999;
          for (var i = 0; i < this.products.length; i++) minIdx = Math.min(this.products[i].insertOrder, minIdx);
          this.products.splice(minIdx, 1);
        }
        this.products.push({ companyid: ctx.companyid, userid: ctx.userid, data: prod, loc: ctx.loc, producturl: ctx.producturl, url: null, persistence: ctx.persistence, insertOrder: this.maxInsertOrder++, adminid: ctx.adminid, taskid: ctx.taskid });
      }
    }

    export var productCache = new cacheOfProducts();

    //*************** CACHE modulu (v produkut), cache cviceni (v modulu)
    export class cacheOf<T> { //cache modulu v produktu
      constructor(public maxLength: number) { }
      modules: { [url: string]: cacheItem<T>; } = {};
      maxInsertOrder = 0;
      fromCache(url: string): T {
        var cch = this.modules[url];
        return cch ? cch.data : null;
      }
      toCache(url: string, mod: T): void {
        var cnt = 0; var minIdx = 99999; var propName: string;
        for (var p in this.modules) {
          cnt++;
          var m = this.modules[p];
          if (m.insertOrder >= minIdx) return;
          minIdx = m.insertOrder; propName = p;
        }
        if (cnt > 5) delete this.modules[propName];
        this.modules[url] = { data: mod, insertOrder: this.maxInsertOrder++ };
      }
    }
    export interface cacheItem<T> { //prvek cache
      data: T;
      insertOrder: number;
    }

  }
}

