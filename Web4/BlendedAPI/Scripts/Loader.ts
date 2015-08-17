namespace CourseMeta {
  export interface product {
    instructions: { [id: string]: string; };
    nodeDir: { [id: string]: data; };
    nodeList: Array<data>;
  }
  export interface data {
    userData: Object;
    userDataChanged: boolean;
  }
}
module blended {

  export var baseUrlRelToRoot = '..';
  export interface learnContext {
    userid: number; adminid: number; companyid: number; loc: LMComLib.Langs; persistence: CourseMeta.IPersistence; producturl: string; url: string;//URL parametry
  }
  export module loader {

    //help
    var _adjustProduct = CourseMeta.lib.adjustProduct;
    var _loadLocalizedProductAndInstrs = CourseMeta.loadLocalizedProductAndInstrs;
    var _finishInstr = CourseMeta.finishInstr;
    //slovnik pro modul
    var _dict: schools.Dict;
    var _dictItem: schools.DictItem;
    var _dictItemRoot: schools.DictItemRoot;

    //baseUrlRelToRoot: relativni adresa rootu Web4 aplikace vyhledem k aktualni HTML strance
    export function adjustProduct(ctx: learnContext): ng.IPromise<CourseMeta.product> {
      return angular.injector(['ng']).invoke(['$http', '$q', ($http: ng.IHttpService, $q: ng.IQService) => {
        var deferred = $q.defer();
        var prod: CourseMeta.product = <CourseMeta.product>(fromCache(prods, ctx));
        if (prod) { deferred.resolve(prod); return; }
        var href = ctx.producturl.substr(0, ctx.producturl.length - 1);
        var promises = _.map([href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'], url => $http.get(baseUrlRelToRoot + url, { transformResponse: s => CourseMeta.jsonParse(s)}));
        $q.all(promises).then(
          (files: Array<ng.IHttpPromiseCallbackArg<any>>) => {
            prod = files[0].data; prod.url = ctx.producturl; prod.instructions = {}; prod.nodeDir = {}; prod.nodeList = [];
            var loc: { [id: string]: any; } = files[1].data; if (!loc) loc = {};
            var instrs: Array<any> = files[2].data;
            //vypln seznamy a adresar nodes
            var scan: (dt: CourseMeta.data) => void;
            scan = dt => { if (dt.Items) _.each(dt.Items, it => { it.parent = dt; scan(it); prod.nodeDir[dt.url] = dt; prod.nodeList.push(dt); }); };
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
            //merge s user data
            if (!!ctx.persistence) ctx.persistence.loadShortUserData(ctx.userid, ctx.companyid, ctx.producturl, data => {
              if (data) for (var p in data) { var dt = prod.nodeDir[p]; dt.userData = data[p]; }
              toCache(prods, ctx, prod);
              deferred.resolve(prod);
            }); else
              deferred.resolve(prod);
          },
          errors => { deferred.reject(); });
        return deferred.promise;
      }]);
    }
    export function adjustEx(ctx: learnContext, prodUrl: string, exUrl: string): ng.IPromise<CourseMeta.ex> {
      return null;
    }

    //*************** CACHE
    interface cacheItem extends learnContext { //prvek cache
      data: Object;
      insertOrder: number;
    }
    interface cache {
      items: Array<cacheItem>;
      maxLength: number;
      maxInsertOrder: number;
      testUrl: boolean;
    }

    var prods: cache = { items: [], maxLength: 3, maxInsertOrder: 0, testUrl:false };
    var mods: cache = { items: [], maxLength: 10, maxInsertOrder: 0, testUrl: true };
    var exs: cache = { items: [], maxLength: 50, maxInsertOrder: 0, testUrl: true };

    function fromCache(cache: cache, ctx: learnContext): CourseMeta.data {
      var resIt = _.find(cache.items, it => it.companyid == ctx.companyid && it.userid == ctx.userid && it.adminid == ctx.adminid &&
        it.persistence == ctx.persistence && it.loc == ctx.loc && it.producturl == ctx.producturl && (!cache.testUrl || it.url == ctx.url));
      if (resIt) resIt.insertOrder = cache.maxInsertOrder++;
      return resIt ? <CourseMeta.data>resIt.data : null;
    }
    function toCache(cache: cache, ctx: learnContext, data: CourseMeta.data) {
      if (cache.items.length >= cache.maxLength) { //vyrad prvni pridany
        var minIdx = 99999;
        for (var i = 0; i < cache.items.length; i++) minIdx = Math.min(cache.items[i].insertOrder, minIdx);
        cache.items.splice(minIdx, 1);
      }
      cache.items.push({ companyid: ctx.companyid, userid: ctx.userid, data: data, loc: ctx.loc, producturl: ctx.producturl, url: cache.testUrl ? ctx.url : null, persistence: ctx.persistence, insertOrder: cache.maxInsertOrder++, adminid: ctx.adminid });
    }
  }
}

