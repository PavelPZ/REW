//##GOTO
function gotoHref(event: Event, url: string) {
  if (_.isEmpty(url)) url = $(event.currentTarget).attr('href');
  url = Utils.combineUrl(CourseMeta.actNode.url, url);
  CourseMeta.gotoData(url);
  return false;
}

module CourseMeta {

  export var allProductList: Array<data>; //hlavicky (metadata) vsech produktu
  export var actProduct: productImpl; //aktualni produkt
  export var actProductPersistence: string; //persistence pro aktualni produkt VSNET
  export var actProductLmcomId: number; //uzivatel aktualniho produktu
  export var actNode: dataImpl; //aktualni node
  export var actCompanyId: number;
  export var actExPageControl: Course.Page; //aktualni model stranky se cvicenim
  export var actInstr: dataImpl; //aktualni instrukce

  //export var forceEval: boolean;
  //Kurz
  export var actModule: modImpl; //aktualni modul
  export var actCourseRoot: courseNode; //course nebo test
  export var actIsPublIndiv: boolean; //course nebo test bezi v 
  export var actEx: exImpl;
  export var actExModel: ModelEx;
  //gramatika
  export var actGrammar: grammarRoot;
  export var actGrammarEx: grammEx;
  export var actGrammarModule: modImpl;
  export var actGrammarExCount: number;

  //inline contrtols
  var oliReplace = 'olireplace';
  export function processInlineControls(scriptId: string, completed: () => void) {
    if (!scriptId) { _.each($(oliReplace), (el: HTMLElement) => $(el).remove()); completed(); return; }
    var txt = $('#' + scriptId).html();
    if (!txt) { debugger; throw scriptId; }
    //nacti page
    var root = JSON.parse(txt);
    var pg = CourseMeta.extractEx(root);
    var ex = new CourseMeta.exImpl();
    ex.onSetPage(pg, {});
    var pgCtrl = Course.finishCreatePage(ex);
    //replace <oli-replace> elements with controls 
    _.each($(oliReplace), (el: HTMLElement) => {
      var ctrl = pg.tags[el.id];
      if (!ctrl) { $(el).remove(); return; }
      var html = JsRenderTemplateEngine.render('c_gen', ctrl);
      var $html = $('<div>' + html + '</div>');
      $(el).replaceWith($html);
      ko.applyBindings(ctrl, $html[0]);
    });
    //init controls
    pg.callInitProcs(Course.initPhase.beforeRender, () => {
      pg.callInitProcs(Course.initPhase.afterRender, () => {
        pg.callInitProcs(Course.initPhase.afterRender2, () => {
          ex.evaluator = pg;
          ex.evaluator.acceptData(ex.done, ex.result);
          if (completed) completed();
        });
      });
    });
  }
  $(() => document.createElement(oliReplace));

  //jsonML decoding
  export function jsonML_to_Tag(jml: Array<any>, metaObj: CourseModel.jsonMLMeta, owner: Course.tagImpl = null, propertyTags: Array<Course.tagImpl> = null): any {
    _.isArray = val => { return val instanceof Array; };
    if (!_.isArray(jml) || jml.length < 1 || !_.isString(jml[0])) throw 'invalid JsonML';
    var tagName: string = jml[0];
    var classMeta = metaObj.types[tagName];

    if (jml.length == 1) return createClass(metaObj, tagName, <any>{ _tg: tagName, _owner: owner });
    var startIdx = 1; var elem: Course.tagImpl = null;
    if (jml.length > 1 && !_.isArray(jml[1]) && !_.isString(jml[1])) {
      startIdx = 2;
      elem = <any>{}; var jmlObj = jml[1];
      for (var p in jmlObj) { //adjust string array and enum
        if (p == 'cdata' && classMeta.st & CourseModel.tgSt.cdata) { elem.Items = [jmlObj[p]]; continue; } //cdata jako text
        var oldVal = jmlObj[p];
        var propStatus = CourseModel.getPropInfo(tagName, p, metaObj);
        var val;
        if (!propStatus) { val = p == 'class' ? oldVal.split(' ') : oldVal; } //obycejna property
        else if (propStatus.enumType) {
          if (_.isString(oldVal)) {
            var s = <string>oldVal; var parts = s.split(' '); val = 0;
            _.each(parts, p => {
              p = Utils.toCammelCase(p);
              return val |= propStatus.enumType[p];
            });
          } else
            val = oldVal;
        } else if (propStatus.st & CourseModel.tgSt.isArray) { //string array prop
          if (!_.isString(oldVal)) throw 'something wrong'; //continue;
          val = oldVal.split(' ');
        } else val = oldVal; //else
        var propName = p != 'data-bind' ? Utils.toCammelCase(p) : p;
        elem[propName] = val;
      }
      elem._tg = tagName;
    } else
      elem = <any>{ _tg: tagName };

    //class create
    elem._owner = owner;
    elem = createClass(metaObj, tagName, elem);

    var childTypeToProp: { [type: string]: { name: string; prop: CourseModel.jsPropMeta; } } = {};
    if (classMeta) for (var p in classMeta.props) {
      var pr = classMeta.props[p]; if (_.isEmpty(pr.childPropTypes)) continue;
      _.each(pr.childPropTypes.split('|'), tp => childTypeToProp[tp] = { name: p, prop: pr });
    }

    for (var i = startIdx; i < jml.length; i++) {
      if (!elem.Items) elem.Items = [];
      if (_.isString(jml[i])) { elem.Items.push(jml[i]); continue; } //string
      var childObj = <Course.tagImpl>(jsonML_to_Tag(jml[i], metaObj, elem, propertyTags)); //rekurze
      if (childObj.jsonMLParsed) childObj.jsonMLParsed();
      var childProp = childTypeToProp[childObj._tg];
      if (!childProp) { elem.Items.push(<any>childObj); continue; } //ne => sub-tag v items
      var childName = Utils.toCammelCase(childProp.name);
      if ((childProp.prop.st & CourseModel.tgSt.isArray) == 0) //neni array property => dosad hodnotu
        elem[childName] = childObj;
      else
        if (!elem[childName]) elem[childName] = [childObj]; else elem[childName].push(childObj); //array property => dosad nebo obohat array
      //evidence tagu v property
      if (propertyTags) propertyTags.push(childObj);
    }
    if (elem.Items && elem.Items.length == 0) delete elem.Items;
    return elem;
  };

  function createClass(meta: CourseModel.jsonMLMeta, tg: string, def: CourseModel.tag): Course.tagImpl {
    var cls = meta.classDir ? meta.classDir[tg] : null; if (!cls) return <Course.tagImpl>def;
    var res: Course.tagImpl = new cls(def);
    return res;
  }

  function xmlEscape(str: string, res: Array<string>) {
    for (var i = 0; i < str.length; ++i) {
      var c = str[i];
      var code = c.charCodeAt(0);
      var s = reventities[c];
      if (s) {
        res.push("&" + s + ";");
      } else if (/*code < 32 ||*/ code >= 128) {
        res.push("&#" + code + ";");
      } else {
        res.push(c);
      }
    }
  }

  var reventities = (function () {
    var result = {};
    for (var key in entities) if (entities.hasOwnProperty(key)) result[entities[key]] = key;
    return result;
  })();

  var entities = {
    "quot": '"',
    "amp": '&',
    "apos": "'",
    "lt": '<',
    "gt": '>'
  };

  function finishLoadedProduct(prod: productImpl): void {

    actProduct = prod;
    prod.allNodes = {};

    extend(prod, productImpl);
    actCourseRoot = <courseNode>(prod.Items[0]); //kurz nebo test
    actGrammar = prod.find<grammarRoot, dataImpl>(dt => isType(dt, runtimeType.grammarRoot)); //a jeho eventuelni gramatika

    //grammar
    if (actGrammar) {
      var lastNode: grammEx = null; actGrammarExCount = 0;
      scan(actGrammar, it => {
        extend(it, dataImpl, runtimeType.no);
        prod.allNodes[it.url] = it;
        it.type |= runtimeType.grammar;
        it.each(t => t.parent = it);
        if (isType(it, runtimeType.ex)) {
          extend(it, grammEx, runtimeType.ex);
          var ge = <grammEx>it; ge.idx = actGrammarExCount++;
          if (lastNode) { lastNode.next = ge; ge.prev = lastNode; }
          lastNode = ge;
        }
        if (isType(it, runtimeType.mod)) extend(it, modImpl, runtimeType.mod);
      });
      extend(actGrammar, grammarRoot, runtimeType.grammarRoot);
    }

    var uniqId = 0;
    //prvni pruchod
    scan(actCourseRoot, it=> {
      it.uniqId = uniqId++;
      prod.allNodes[it.url] = it;
      extend(it, courseNode, runtimeType.courseNode);
      it.each<dataImpl>(t => t.parent = it);
      if (isType(it, runtimeType.ex) && cfg.forceEval) (<exImpl>it).designForceEval = true; //pro design time - ukaz se vyhodnoceny na 100%
    });

    //druhy pruchod
    scan(actCourseRoot, it => {
      if (isType(it, runtimeType.ex)) extend(it, exImpl);
      else if (isType(it, runtimeType.multiTask)) extend(it, multiTaskImpl);
      else if (isType(it, runtimeType.product)) extend(it, productImpl);
      else if (isType(it, runtimeType.taskCourse)) extend(it, courseImpl);
      else if (isType(it, runtimeType.test)) extend(it, testMe.testImpl);
      else if (isType(it, runtimeType.multiTest)) extend(it, testMe.multiTestImpl);
      else if (isType(it, runtimeType.taskTestInCourse)) { it.type |= runtimeType.dynamicTestModule; extend(it, courseTestImpl, runtimeType.mod); }
      else if (isType(it, runtimeType.taskPretest)) extend(it, pretestImpl);
      else if (isType(it, runtimeType.taskTestSkill)) { it.type |= runtimeType.dynamicTestModule; extend(it, testMe.testSkillImpl, runtimeType.mod); }
      else if (isType(it, runtimeType.taskPretestTask)) { extend(it, pretestTaskImpl, runtimeType.mod); it.each<exImpl>(e => e.testMode = CSLocalize('3859695377c4444abce16f7af9f5d2ec', 'Pretest')); }
      else if (isType(it, runtimeType.mod)) extend(it, modImpl);
      //else if (isType(it, runtimeType.questionnaire)) extend(it, ex, runtimeType.ex);

    });

    //actCourseRoot: prepsani set x getUser
    if (!isType(actCourseRoot, runtimeType.test) && !isType(actCourseRoot, runtimeType.multiTest)) //root (mimo testu) je skipable. Root testu ma vlastni persistenci.
      extend(actCourseRoot, skipAbleRoot, runtimeType.skipAbleRoot);
  }

  export module lib {
    //reakce na zmenu URL. Nacte se modul, cviceni a user data ke cviceni
    export function onChangeUrl(prodUrl: string, persistence: string, nodeUrl: string, completed: (loadedEx: exImpl) => void) {
      foundGreenEx = null;
      if (_.isEmpty(prodUrl)) { completed(null); return; }
      prodUrl = decodeURIComponent(prodUrl);
      adjustProduct(prodUrl, persistence, () => {
        if (actNode && actNode.url == nodeUrl) { completed(isType(actNode, runtimeType.ex) ? <exImpl>actNode : null); return; } //zadna zmena aktualniho node
        var oldEx = actEx; var oldMod = actModule; var oldNode = actNode; var oldGrammarEx = actGrammarEx; var oldGrammarModule = actGrammarModule;
        var doCompleted = (loadedEx: exImpl) => {
          if (actEx && oldEx && actEx != oldEx) oldEx.onUnloadEx(); if (actModule && oldMod && actModule != oldMod) oldMod.onUnloadMod();
          if (actGrammarEx && oldGrammarEx && actGrammarEx != oldGrammarEx) oldGrammarEx.onUnloadEx(); if (actGrammarModule && oldGrammarModule && actGrammarModule != oldGrammarModule) oldGrammarModule.onUnloadMod();
          completed(loadedEx);
        };
        actNode = null;
        if (!_.isEmpty(nodeUrl)) actNode = actProduct.getNode<dataImpl>(nodeUrl);
        if (!actNode) actNode = actCourseRoot; //novy actNode
        if (!actNode) { doCompleted(null); return; } //zadny node

        if (isType(actNode, runtimeType.ex)) adjustEx(<exImpl>actNode, doCompleted);
        else if (isType(actNode, runtimeType.mod)) adjustMod(<modImpl>actNode, mod => doCompleted(null));
        else doCompleted(null);
      });
    }

    export function doRefresh(completed: () => void) {
      var compl = () => { if (completed) completed(); };

      if (isType(actNode, runtimeType.grammar)) { compl(); return; }

      greenArrowDict = {};

      //spocitej nodes udaje
      actCourseRoot.refreshNumbers();

      //hotovo
      if (actCourseRoot.done) {
        if (!treatBlueEx())
          fillArrowInfo(info_courseFinished());
        compl(); return;
      }
      if (actCourseRoot.isSkiped) {
        fillArrowInfo(info_courseFinished());
        compl(); return;
      }

      //najdi aktualni uzel
      findGreenExGlobal(actCourseRoot, findRes => {

        foundGreenEx = null;
        if (!findRes) { compl(); return; }

        foundGreenEx = findRes.grEx;

        //nezelene cviceni
        if (findRes.grEx != actNode && treatBlueEx()) { compl(); return; }

        //spocti green parent chain
        var nd: courseNode = findRes.grEx;
        while (true) { greenArrowDict[nd.url] = true; if (nd == actCourseRoot) break; nd = <courseNode>(nd.parent); } //parent chain zeleneho cviceni

        //actNode neni v green parent chain => modra sipka
        if (!greenArrowDict[actNode.url]) {
          fillArrowInfo(info_continue()); compl(); return;
        }

        //jiny task multitasku - prejdi pres home
        if (changeTaskInMultitask(actNode, findRes.grEx))
          findRes.info = new greenArrowInfo(CSLocalize('e64fb875261a4c5e849a9952ecc4ae63', 'Continue'), false, 'success', 'hand-o-right', () => gui.gotoData(null));

        //muze nastat?
        if (!findRes.info) return;

        fillArrowInfo(findRes.info);
        compl();
      });
    }

    //globalni funkce na nalezeni aktualniho (zeleneho) cviceni
    function findGreenExGlobal(nd: courseNode, completed: (findRes: findGreenExResult) => void): void {
      var findRes: findGreenExResult; var toExpand: modImpl;
      findDeepNotSkiped<courseNode, courseNode>(nd, n => {
        if (n.done || n.findParent<courseNode>((t: courseNode) => t.done) != null) return false; //hleda se pouze v nehotovych a non skiped uzlech
        var md: modImpl = <any>n;
        if (md.getDynamic && md.getDynamic()) { toExpand = <modImpl>n; return true; } //uzel je potrena nejdrive expandovat => konec find
        var an = <any>n;
        if (an.findGreenEx && !!(findRes = an.findGreenEx())) {
          return true; //uzel ma vlastni findGreenEx a ten vrati zelene cviceni
        }
        return false; //pokracuj dal
      });
      if (findRes) { completed(findRes); return; } //nalezeno cviceni
      if (toExpand) { toExpand.expandDynamic();/*kdy se pouziva???*/ lib.saveProduct(() => findGreenExGlobal(toExpand, completed)); return; } //nalezen uzel k expanzi => rekurze
      completed(null); //nenalezeno nic
    }

    export function findProduct(productId: string): CourseMeta.data {
      var res = _.find(CourseMeta.allProductList, prod => prod.url == productId);
      if (!res) {
        _.find(Login.myData.Companies, c => {
          res = _.find(c.companyProducts, p => p.url == productId); return !!res;
        });
      }
      return res;
    }

    export function isTest(prod: CourseMeta.data): boolean {
      return prod && CourseMeta.isType(prod, CourseMeta.runtimeType.test);
    }

    export function isVyzvaProduct(prod: CourseMeta.data): boolean {
      return prod && CourseMeta.isType(prod, CourseMeta.runtimeType.productNew);
    }

    export function keyTitle(prod: CourseMeta.data, Days: number): string {
      return prod.title + ' / ' + (CourseMeta.lib.isTest(prod) ? 'test' : 'days: ' + Days.toString());
    }

    export function productLineTxt(productId: string): string {
      return LowUtils.EnumToString(LMComLib.LineIds, findProduct(productId).line);
    }

    //zajisti existenci produktu
    export function adjustProduct(prodUrl: string, persistence: string, completed: (justLoaded: boolean) => void, lmcomUserId: number = 0) {
      if (!lmcomUserId) lmcomUserId = schools.LMComUserId();
      if (actProduct && actProduct.url == prodUrl && actProductLmcomId == lmcomUserId && actProductPersistence == persistence) { completed(false); return; }
      if (actProduct) actProduct.unloadActProduct();
      loadLocalizedProductAndInstrs(prodUrl, prod => { //aktualni produkt (kurz), nastavuje actProduct
        actProductPersistence = persistence;
        actPersistence().loadShortUserData(lmcomUserId, actCompanyId, prodUrl, data => { //short user data
          actProductLmcomId = lmcomUserId;
          if (data) for (var p in data) try { actProduct.getNode<courseNode>(p).setUserData(data[p]); } catch (msg) { } //dato nemusi existovat v pripade zmeny struktury kurzu
          completed(true);
        });
      });
    }

    //zajisti existenci modulu (= lokalizace a slovnik)
    export function adjustMod(nd: dataImpl, completed: (actm: modImpl) => void) {
      var actm = nd.findParent<modImpl>(n => isType(n, runtimeType.mod));
      if (actm == null) { completed(null); return; }
      var isGramm = isType(actm, runtimeType.grammar);
      if ((isGramm && actm == actGrammarModule) || (!isGramm && actm == actModule)) { completed(actm); return; } //zadna zmena modulu
      if (isGramm) actGrammarModule = actm; else actModule = actm;
      load(urlStripLast(actm.url) + '.' + Trados.actLangStr, (locDict: locDict) => {
        if (!locDict) locDict = { loc: {}, dict: null };
        actm.loc = locDict.loc; actm.dict = locDict.dict ? RJSON.unpack(locDict.dict) : null;
        actm.expandDynamic(); /*kdy se pouziva???*/ lib.saveProduct(() => completed(actm));
      });
    }

    //zajisti existenci cviceni (= modul)
    export function adjustEx(ex: exImpl, completed: (ex: exImpl) => void, lmcomUserId: number = 0) {
      adjustMod(ex, mod => {
        if (mod == null) throw 'Missing module for exercise';
        var isGramm = isType(ex, runtimeType.grammar);
        if (isGramm) actGrammarEx = <grammEx>ex; else actEx = ex;
        if (ex.page) { completed(ex); return; }
        load(ex.url, (pgJsonML: Array<any>) => {
          var pg = extractEx(pgJsonML);
          Course.localize(pg, s => localizeString(pg.url, s, (isGramm ? actGrammarModule : actModule).loc));
          if (isGramm) { ex.onSetPage(pg, null); completed(ex); }
          else actPersistence().loadUserData(lmcomUserId == 0 ? schools.LMComUserId() : lmcomUserId, actCompanyId, actProduct.url, ex.url, (exData: { [id: string]: CourseModel.Result; }) => {
            if (!exData) exData = {};
            ex.onSetPage(pg, exData); completed(ex);
          });
        });
      });
    }

    //zajisti existenci adresare vsech produktu
    export function adjustAllProductList(completed: () => void) {
      if (allProductList) { completed(); return; }
      load(urlStripLast(cfg.dataBatchUrl ? cfg.dataBatchUrl : '/siteroot/'), (obj: CourseMeta.data) => { allProductList = obj ? obj.Items : null; if (Login.finishMyData) Login.finishMyData(); completed(); });
    }

    //zajisteni existence instrukci
    //export function adjustInstr(completed: () => void) {
    //  completed(); return;
    //  //if (instructions /*&& rootGrammar != null*/) { completed(); return; }
    //  //var pgUrl = '../data/instr/std/ex.js'; var locUrl = '../data/instr/std.' + Trados.actLangStr + '.js';
    //  //loadFiles([pgUrl, locUrl], ress => {
    //  //  instructions = {};
    //  //  if (!ress[0]) { completed(); return; }
    //  //  var pg = extractEx(<Array<any>>(jsonParse(ress[0]))); if (pg == null) throw 'missing instr' + pgUrl;
    //  //  pg.Items = _.filter(pg.Items, it => !_.isString(it));
    //  //  var loc: locDict = <locDict>jsonParse(ress[1]);
    //  //  Course.localize(pg, s => localizeString(pg.url, s, loc ? loc.loc : null));
    //  //  _.each(pg.Items, it => instructions[it.id.toLowerCase()] = JsRenderTemplateEngine.render("c_gen", it));
    //  //  completed();
    //  //});
    //}

    export function finishHtmlDOM() {
      //Uprav content
      var cnt = $('.content-place');
      //anchory
      _.each(cnt.find("a"), (a: HTMLAnchorElement) => {
        var href = $(a).attr('href'); if (_.isEmpty(href)) return;
        if (/* /w/w/w... */href.match(/^(\/?\w)+$/)) { $(a).attr('href', '#'); a.onclick = ev => gotoHref(ev, href); }
      });
      //images
      //_.each(cnt.find("img"), (img: HTMLImageElement) => {
      //  var src = $(img).attr('src'); if (_.isEmpty(src)) return;
      //  src = Utils.fullUrl(src) ? src : Pager.basicDir + Utils.combineUrl(CourseMeta.actNode ? CourseMeta.actNode.url : null, src);
      //  $(img).attr('src', src);
      //});
      //help
      //doc.finishHtmlDOM();
    }

    export function info_continue(): greenArrowInfo { return new greenArrowInfo(CSLocalize('2882c6a2ef6343089ae90c898cac63f6', 'Continue'), false, "info", "reply", () => gui.gotoData(null)); }
    export function info_courseFinished(): greenArrowInfo { return new greenArrowInfo(CSLocalize('e06a4208d7c84c8ba97c1a700f00046c', 'Course completed!'), actNode == actCourseRoot, "info", "thumbs-up", actNode == actCourseRoot ? $.noop : () => gui.gotoData(null)); }

    //vykresleni naladovaneho cviceni
    export function displayEx(loadedEx: exImpl, beforeUpdate: (loadedEx: exImpl) => void, afterUpdate: (loadedEx: exImpl) => void) {
      //TODO EVAL
      var pgCtrl = actExPageControl = Course.finishCreatePage(loadedEx);
      gui.exerciseHtml = () => JsRenderTemplateEngine.render("c_gen", loadedEx.page);
      gui.exerciseCls = () => loadedEx.page.isOldEa ? "ea" : "new-ea";
      pgCtrl.callInitProcs(Course.initPhase.beforeRender, () => { //inicializace kontrolek, 1
        //if (!pgCtrl.isOldEa) pgCtrl.isPassive = _.all(pgCtrl.items, it => !it.isEval()); //pasivni cviceni ma vsechna isEval=false
        //pgCtrl.sound = new Course.pageSound(pgCtrl);
        if (beforeUpdate) beforeUpdate(loadedEx);
        oldEAInitialization = null;
        Pager.renderHtmlEx(true, loadedEx.page.bodyStyle); //HTML rendering (kod, provedeny normalne za onUpdate)
        pgCtrl.callInitProcs(Course.initPhase.afterRender, () => {//inicializace kontrolek, 2
          if (!oldEAInitialization) oldEAInitialization = completed => completed();
          oldEAInitialization(() => {
            pgCtrl.callInitProcs(Course.initPhase.afterRender2, () => {//inicializace kontrolek, 3

              loadedEx.evaluator = loadedEx.page.isOldEa ? new EA.oldToNewScoreProvider($evalRoot()) : pgCtrl;
              loadedEx.evaluator.acceptData(loadedEx.done, loadedEx.result);
              loadedEx.setStartTime();
              //*** design mode => dosad do cviceni spravne hodnoty a vyhodnot jej
              if (loadedEx.designForceEval) {
                loadedEx.evaluator.acceptData(true, loadedEx.result);
                if (loadedEx.evaluate()) {
                  lib.saveProduct(() => { //vyhodnot uzel bez doRefresh roundtrip
                    if (actCourseRoot) {//preview produktu x modulu
                      actCourseRoot.refreshNumbers(); var inf = loadedEx.findGreenEx().info; inf.css = greenCss(); lib.fillArrowInfo(inf); refreshExerciseBar(loadedEx);
                    }
                  });
                }
                loadedEx.designForceEval = false;
              }
              if (afterUpdate) afterUpdate(loadedEx);
              //vse OK => display content
              Pager.renderHtmlEx(false);
              Pager.callLoaded();
            });
          });
        });
      });
    }

    export function actPersistence(): IPersistence { return actProductPersistence == schools.memoryPersistId ? persistMemory.persistCourse : persist; }

    //save user dat
    export function saveProduct(completed: () => void, lmcomUserId: number = 0) {
      if (!actProduct) { completed(); return; }
      var res: Array<Array<string>> = [];
      //var persistObj = actCourseRoot.
      scan(actCourseRoot, (dt: courseNode) => { if (!dt.userPending) return; dt.getUserData((shrt, lng, flag, key) => res.push([key ? key : dt.url, shrt, lng, flag ? flag.toString() : '0'])); dt.userPending = false; });
      if (res.length > 0) { //neprazdny res => save. res ve tvaru [key, shortData, data, flags]
        Logger.trace_course('saveProduct lib, items=' + _.map(res, r => r[0]).join('; '));
        actPersistence().saveUserData(!lmcomUserId ? schools.LMComUserId() : lmcomUserId, actCompanyId, actProduct.url, res, () => {
          if (cfg.target == LMComLib.Targets.scorm) {
            actCourseRoot.refreshNumbers();
            scorm.reportProgress(actCourseRoot.elapsed, actCourseRoot.done ? (actCourseRoot.complNotPassiveCnt == 0 || actCourseRoot.ms == 0 ? 100 : Math.round(actCourseRoot.s / actCourseRoot.ms /*/ actCourseRoot.complNotPassiveCnt*/)) : null);
          }
          completed();
        });
      } else completed(); //prazdny res, NOOP
    }

    //osetreni nezeleneho cviceni
    function treatBlueEx(): boolean {
      if (!actNode || !isType(actNode, runtimeType.ex)) return false;
      var findRes = (<exImpl>actNode).findGreenEx();
      findRes.info.css = 'info';
      fillArrowInfo(findRes.info);
      return true;
    }

    //zmena tasku v multitasku (=> skok pres home)
    function changeTaskInMultitask(nd1: dataImpl, nd2: dataImpl): boolean {
      if (!isType(actCourseRoot, runtimeType.multiTask)) return false;
      var p1 = nd1.findParent<dataImpl>(nd => _.any(actCourseRoot.Items, it => it == nd));
      var p2 = nd2.findParent<dataImpl>(nd => _.any(actCourseRoot.Items, it => it == nd));
      return p1 && p2 && p1 != p2;
    }

    //nalezne prvni neprobrane cviceni
    export function findGreenExLow(nd: courseNode): exImpl { return findDeepNotSkiped<exImpl, courseNode>(nd, n => isType(n, runtimeType.ex) && !n.done); }

    //informace pro zelenou sipku
    export function fillInfo(title: string, disable: boolean, css: string, iconId: string, _greenClick: () => void) {
      greenTitle(title);
      greenIcon(Trados.isRtl && iconId == "hand-o-left" ? "hand-o-right" : iconId);
      greenCss(!actCourseRoot.done && keepGreen ? 'success' : css);
      greenDisabled(disable); greenClick = _greenClick;
      keepGreen = false;
    }

    export var keepGreen: boolean;

    export function fillArrowInfo(info: greenArrowInfo) { fillInfo(info.title, info.disable, info.css, info.iconId, info.greenClick); }
  }

  var jsExt = '.js';
  var testModuleExercises = '@test_module_exercises';

  function setDate(dt1: number, dt2: number, min: boolean): number {
    if (dt1 == 0) return dt2; if (dt2 == 0) return dt1;
    if (min) return dt2 > dt1 ? dt1 : dt2;
    else return dt2 < dt1 ? dt1 : dt2;
  }

  export function addUserData(key: string, shrt: string, lng: string, data: Array<Array<string>>): void { data.push([key, shrt, lng]); }

  export function isType(dt: data, tp: runtimeType): boolean { return (dt.type & tp) == tp; }

  export function scan(dt: dataImpl, action: (dt: dataImpl) => void, cond: (dt: dataImpl) => boolean = null): void {
    if (dt.Items) _.each(dt.Items, it => scan(it, action, cond));
    if (!cond || cond(dt)) action(dt);
  }
  export function scanParentFirst(dt: dataImpl, action: (dt: dataImpl) => void, cond: (dt: dataImpl) => boolean = null): void {
    if (!cond || cond(dt)) action(dt);
    if (dt.Items) _.each(dt.Items, it => scanParentFirst(it, action, cond));
  }
  export function scanOfType<T extends dataImpl>(dt: dataImpl, type: runtimeType, action: (dt: T) => void) {
    scan(dt, d => action(<T>d), d => d.type == type);
  }
  export function findDeep<TRes extends data, TCond extends data>(dt: data, cond: (dt: TCond) => boolean = null): TRes {
    if (cond(<TCond>dt)) return <TRes>dt; if (!dt.Items) return null;
    var res: TRes = null;
    return _.find(dt.Items, it => (res = findDeep<TRes, TCond>(it, cond)) != null) ? res : null;
  }

  export function findDeepNotSkiped<TRes extends data, TCond extends data>(dt: data, cond: (dt: TCond) => boolean = null): TRes {
    if ((<any>dt).isSkiped) return null;
    if (cond(<TCond>dt)) return <TRes>dt; if (!dt.Items) return null;
    var res: TRes = null;
    return _.find(dt.Items, it => (res = findDeepNotSkiped<TRes, TCond>(it, cond)) != null) ? res : null;
  }

  function extend(d: data, t: Object, tp: runtimeType = 0) { extendLow(d, t); d.type = d.type | tp; }
  export function extendLow(d: Object, t: Object) { t = (<any>t).prototype; for (var p in t) d[p] = t[p]; d.constructor(); }

  export function localizeString(keyPrefix: string, data: string, loc: { [id: string]: any; }): string { //nahradi {{xxx|value}} z JS objektu
    if (_.isEmpty(data) || data.indexOf('{{') < 0) return data;
    if (!loc) loc = {};
    return data.replace(locEx, (match, ...gm: string[]) => {
      var idVal = gm[0].split('|'); var val = idVal.length < 2 ? null : idVal[1];
      var parts = keyPrefix ? keyPrefix.split('/') : []; parts.push(idVal[0]);
      var idx = 0; var res: any = '';
      var l = loc;
      while (idx < parts.length) {
        l = l[parts[idx]];
        if (!l) { res = val; break; }
        if (idx == parts.length - 1) { res = l; break; }
        idx++;
      }
      return Trados.locNormalize(res);
    });
  }
  var locEx = /{{(.*?)}}/g;

  export function extractEx(pgJsonML: Array<any>): Course.Page {
    var tagsInProperties: Array<Course.tagImpl> = [];
    var html = jsonML_to_Tag(pgJsonML, CourseModel.meta, null, tagsInProperties);
    var pg: Course.Page = html.Items[1];
    var head = html.Items[0];
    var headItems = head && head.Items ? head.Items : null;
    var tit; var bodyStyle;
    if (headItems) {
      var tit = _.find(headItems, (it: any) => (<CourseModel.tag>it)._tg == 'title');
      var bodyStyle = _.find(headItems, (it: any) => (<CourseModel.tag>it)._tg == 'style');
    }
    pg.title = tit && tit.Items && _.isString(tit.Items[0]) ? tit.Items[0] : '';
    pg.bodyStyle = bodyStyle && bodyStyle.Items && _.isString(bodyStyle.Items[0]) ? bodyStyle.Items[0] : '';
    pg.bodyStyle = pg.bodyStyle.replace(/\/\*.*\*\//, '');

    pg._tg = CourseModel.tbody; //hack. body ma jinak Type=body 
    if (!_.isEmpty(pg.seeAlsoStr)) {
      pg.seeAlso = _.map(pg.seeAlsoStr.split('#'), sa => {
        var parts = sa.split('|');
        var res: schools.seeAlsoLink = { url: parts[0], title: parts[1], type: 0 };
        return res;
      });
    }
    if (!_.isEmpty(pg.instrBody)) pg.instrs = pg.instrBody.split('|');
    pg.propertyTags = tagsInProperties;
    return pg;
  }

  //persist.readFiles muze byt nahrazeno JS soubory, ulozenymi  primo v HTML strance v <script type="text/inpagefiles" data-id="url"> scriptu.
  //json soubory jsou ulozeny ve strance jako <script type="text/inpagefiles" data-id="url">. Pouziva se pro Author, v d:\LMCom\rew\NewLMComModel\Design\CourseMeta.cs, getServerScript 
  export function loadFiles(urls: string[], completed: (data: string[]) => void) {
    if (!inPageFiles) {
      inPageFiles = {};
      $('script[type="text/inpagefiles"]').each((idx, el) => {
        var sc = $(el);
        inPageFiles[sc.attr('data-id').toLowerCase()] = sc.html().replace(/^\s*/, '');
        //inPageAny = true; //existuje-li jediny type="text/inpagefiles", pak se vsechny JS berou z inPageFiles
      });
    }
    //priorita - nacti soubor z script[type="text/inpagefiles"]
    var values = _.map(urls, url => inPageFiles[url.substr(2).toLowerCase()]); //url zacina ../
    var fromScript = _.zip(urls, values);
    //nenactene ze scriptu => nacti z webu
    var webUrls = _.map(_.filter(fromScript, uv => !uv[1]), uv => uv[0]); //nenactene ze scriptu
    if (webUrls.length > 0) { //je potreba neco nacist z webu
      persist.readFiles(webUrls, webValues => { //nateni z webu
        //merge fromScript a fromWeb
        var fromWeb = _.zip(webUrls, webValues); var fromWebIdx = 0;
        _.each(fromScript, kv => {
          if (kv[1]) return;
          kv[1] = fromWeb[fromWebIdx][1]; fromWebIdx++;
        });
        //vrat values z merged
        completed(_.map(fromScript, kv => kv[1]));
      });
    } else
      completed(values); //vse nactene ze scriptu
  } var inPageFiles: { [urlExt: string]: string; }; //var inPageAny = false;

  export function loadResponseScript(serverAndUrl: string, completed: (loaded: boolean) => void) {
    $.ajax(serverAndUrl, {
      async: true,
      type: 'GET',
      dataType: 'text',
      contentType: "text/plain; charset=UTF-8"
    }).done((txt: string) => {
      var parts = txt.split('%#%#[[[]]]');
      for (var i = 0; i < parts.length; i += 2) inPageFiles[parts[i]] = parts[i + 1];
      completed(true);
    }).fail(() => {
      debugger;
      completed(false);
    });
  }

  export function load(href: string, completed: (dt: Object) => void) {
    loadFiles(['..' + href + jsExt], ress => completed(jsonParse(ress[0])));
  }

  function urlStripLast(url: string): string {
    url = url.split('|')[0]; //odstran z productUrl cast |<archiveId>
    return url.charAt(url.length - 1) == '/' ? url.substr(0, url.length - 1) : url;
  }


  export function loadLocalizedProductAndInstrs(url: string, completed: (prod: productImpl) => void) {
    url = decodeURIComponent(url);
    var href = urlStripLast(url);
    href = '..' + (href[0] == '/' ? '' : '/') + href;
    loadFiles([href + jsExt, href + '.' + Trados.actLangStr + jsExt, href + '_instrs.js'], ress => {
      //sitemap
      var prod: productImpl = <productImpl>(jsonParse(ress[0])); if (!prod) throw 'error loading ' + href;
      finishLoadedProduct(prod);
      prod.url = url;
      //a jeji lokalizace
      var loc: { [id: string]: any; } = jsonParse(ress[1]); if (!loc) loc = {};
      scan(prod, it => { if (it.localize) it.localize(s => localizeString(it.url, s, loc)); });
      //instrukce
      var instrs = jsonParse(ress[2]);
      instructions = {};
      if (instrs) for (var p in instrs) finishInstr(p, instrs[p], loc);
      completed(prod);
    });
  }

  export function finishInstr(url: string, jsonML: Object, loc: { [id: string]: any; }) {
    var pg = extractEx(<Array<any>>(jsonML)); if (pg == null) { debugger; throw 'missing instr'; }
    pg.Items = _.filter(pg.Items, it => !_.isString(it));
    Course.localize(pg, s => localizeString(pg.url, s, loc));
    Course.scanEx(pg, tg => { if (!_.isString(tg)) delete tg.id; }); //instrukce nemohou mit tag.id, protoze se ID tlucou s ID ze cviceni
    instructions[url] = JsRenderTemplateEngine.render("c_genitems", pg);
  }

  export function jsonParse(str: string): any {
    if (!str || str.length < 1) return null;
    var isRjson = str.substr(0, 1) == rjsonSign; if (isRjson) str = str.substr(1); var obj = JSON.parse(str); if (isRjson) obj = RJSON.unpack(obj);
    return obj;
  }

  //function loadDataAndLoc(href: string, completed: (mod, loc) => void) {
  //  href = '..' + (href[0] == '/' ? '' : '/') + href;
  //  loadFiles([href + jsExt, href + '.' + Trados.actLangStr + jsExt], ress => {
  //    var pages = jsonParse(ress[0]); if (!pages) throw 'error loading ' + href;
  //    var locDict = jsonParse(ress[1]);
  //    completed(pages, locDict);
  //  });
  //}
  var rjsonSign = "@";

  export interface locDict {
    loc: { [id: string]: any; };
    dict: Object;
  }

  //persistentni data cviceni
  export interface IExUser extends CourseModel.Score {
    done: boolean;
    //ms: number; s: number; //score. ms==0 => passive
    beg: number;
    end: number;
    elapsed: number;
    //testSkiped: boolean;
    result: { [ctrlId: string]: CourseModel.Result; };
    //pro design mode - zobraz cviceni vyhodnocene na 100%
    designForceEval: boolean;
  }

  export interface IScoreProvider {
    provideData(exData: { [ctrlId: string]: Object; }): void; //Prenos dat z cviceni
    acceptData(done: boolean, exData: { [ctrlId: string]: Object; }): void; //Prenos dat do cviceni
    resetData(exData: { [ctrlId: string]: Object; }): void; //Reset cviceni
    getScore(): CourseModel.Score; //spocti score celeho cviceni
  }

  //sluzby, ktere CourseMeta poskytuje persistent layer
  export interface IPersistence {
    loadShortUserData: (userId: number, companyId: number, prodUrl: string, completed: (data: { [url: string]: any; }) => void) => void;
    loadUserData: (userId: number, companyId: number, prodUrl: string, modUrl: string, completed: (data: Object) => void) => void;
    //data ve formatu [[key,short,long],...], long muze chybet
    saveUserData: (userId: number, companyId: number, prodUrl: string, data: Array<Array<string>>, completed: () => void) => void;
    readFiles: (urls: string[], completed: (data: string[]) => void) => void; //schools.libReadFiles(urls, completed);
    resetExs: (userId: number, companyId: number, prodUrl: string, urls: Array<string>, completed: () => void) => void;
    createArchive: (userId: number, companyId: number, productId: string, completed: (archiveId: number) => void) => void;
    testResults: (userId: number, companyId: number, productId: string, completed: (results: Array<testMe.result>) => void) => void;
  }

  $.views.helpers({
    productLineTxt: lib.productLineTxt,
    productLineTxtLower: (productId) => lib.productLineTxt(productId).toLowerCase(),
  });
}

//module help {
//  export function click() {
//    //return false;
//  }
//  export function finishHtmlDOM() {
//    //_.each($('.ctx-help'), el => {
//    //  var hlp = $('<div class="help-btn fa"></div>');
//    //  $(el).prepend(hlp[0]);
//    //  hlp.click(() => help.click());
//    //});
//  }
//}