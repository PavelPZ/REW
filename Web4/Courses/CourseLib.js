function gotoHref(event, url) {
    if (_.isEmpty(url))
        url = $(event.currentTarget).attr('href');
    url = Utils.combineUrl(CourseMeta.actNode.url, url);
    CourseMeta.gotoData(url);
    return false;
}
var CourseMeta;
(function (CourseMeta) {
    CourseMeta.allProductList; //hlavicky (metadata) vsech produktu
    CourseMeta.actProduct; //aktualni produkt
    CourseMeta.actProductPersistence; //persistence pro aktualni produkt VSNET
    CourseMeta.actProductLmcomId; //uzivatel aktualniho produktu
    CourseMeta.actNode; //aktualni node
    CourseMeta.actCompanyId;
    CourseMeta.actExPageControl; //aktualni model stranky se cvicenim
    CourseMeta.actInstr; //aktualni instrukce
    //export var forceEval: boolean;
    //Kurz
    CourseMeta.actModule; //aktualni modul
    CourseMeta.actCourseRoot; //course nebo test
    CourseMeta.actIsPublIndiv; //course nebo test bezi v 
    CourseMeta.actEx;
    CourseMeta.actExModel;
    //gramatika
    CourseMeta.actGrammar;
    CourseMeta.actGrammarEx;
    CourseMeta.actGrammarModule;
    CourseMeta.actGrammarExCount;
    //inline contrtols
    var oliReplace = 'olireplace';
    function processInlineControls(scriptId, completed) {
        if (!scriptId) {
            _.each($(oliReplace), function (el) { return $(el).remove(); });
            completed();
            return;
        }
        var txt = $('#' + scriptId).html();
        if (!txt) {
            debugger;
            throw scriptId;
        }
        //nacti page
        var root = JSON.parse(txt);
        var pg = CourseMeta.extractEx(root);
        var ex = new CourseMeta.exImpl();
        ex.onSetPage(pg, {});
        var pgCtrl = Course.finishCreatePage(ex);
        //replace <oli-replace> elements with controls 
        _.each($(oliReplace), function (el) {
            var ctrl = pg.tags[el.id];
            if (!ctrl) {
                $(el).remove();
                return;
            }
            var html = JsRenderTemplateEngine.render('c_gen', ctrl);
            var $html = $('<div>' + html + '</div>');
            $(el).replaceWith($html);
            ko.applyBindings(ctrl, $html[0]);
        });
        //init controls
        pg.callInitProcs(Course.initPhase.beforeRender, function () {
            pg.callInitProcs(Course.initPhase.afterRender, function () {
                pg.callInitProcs(Course.initPhase.afterRender2, function () {
                    ex.evaluator = pg;
                    ex.evaluator.acceptData(ex.done, ex.result);
                    if (completed)
                        completed();
                });
            });
        });
    }
    CourseMeta.processInlineControls = processInlineControls;
    $(function () { return document.createElement(oliReplace); });
    //jsonML decoding
    function jsonML_to_Tag(jml, metaObj, owner, propertyTags) {
        if (owner === void 0) { owner = null; }
        if (propertyTags === void 0) { propertyTags = null; }
        _.isArray = function (val) { return val instanceof Array; };
        if (!_.isArray(jml) || jml.length < 1 || !_.isString(jml[0]))
            throw 'invalid JsonML';
        var tagName = jml[0];
        var classMeta = metaObj.types[tagName];
        if (jml.length == 1)
            return createClass(metaObj, tagName, { _tg: tagName, _owner: owner });
        var startIdx = 1;
        var elem = null;
        if (jml.length > 1 && !_.isArray(jml[1]) && !_.isString(jml[1])) {
            startIdx = 2;
            elem = {};
            var jmlObj = jml[1];
            for (var p in jmlObj) {
                if (p == 'cdata' && classMeta.st & CourseModel.tgSt.cdata) {
                    elem.Items = [jmlObj[p]];
                    continue;
                } //cdata jako text
                var oldVal = jmlObj[p];
                var propStatus = CourseModel.getPropInfo(tagName, p, metaObj);
                var val;
                if (!propStatus) {
                    val = p == 'class' ? oldVal.split(' ') : oldVal;
                } //obycejna property
                else if (propStatus.enumType) {
                    if (_.isString(oldVal)) {
                        var s = oldVal;
                        var parts = s.split(' ');
                        val = 0;
                        _.each(parts, function (p) {
                            p = Utils.toCammelCase(p);
                            return val |= propStatus.enumType[p];
                        });
                    }
                    else
                        val = oldVal;
                }
                else if (propStatus.st & CourseModel.tgSt.isArray) {
                    if (!_.isString(oldVal))
                        throw 'something wrong'; //continue;
                    val = oldVal.split(' ');
                }
                else
                    val = oldVal; //else
                var propName = p != 'data-bind' ? Utils.toCammelCase(p) : p;
                elem[propName] = val;
            }
            elem._tg = tagName;
        }
        else
            elem = { _tg: tagName };
        //class create
        elem._owner = owner;
        elem = createClass(metaObj, tagName, elem);
        var childTypeToProp = {};
        if (classMeta)
            for (var p in classMeta.props) {
                var pr = classMeta.props[p];
                if (_.isEmpty(pr.childPropTypes))
                    continue;
                _.each(pr.childPropTypes.split('|'), function (tp) { return childTypeToProp[tp] = { name: p, prop: pr }; });
            }
        for (var i = startIdx; i < jml.length; i++) {
            if (!elem.Items)
                elem.Items = [];
            if (_.isString(jml[i])) {
                elem.Items.push(jml[i]);
                continue;
            } //string
            var childObj = (jsonML_to_Tag(jml[i], metaObj, elem, propertyTags)); //rekurze
            if (childObj.jsonMLParsed)
                childObj.jsonMLParsed();
            var childProp = childTypeToProp[childObj._tg];
            if (!childProp) {
                elem.Items.push(childObj);
                continue;
            } //ne => sub-tag v items
            var childName = Utils.toCammelCase(childProp.name);
            if ((childProp.prop.st & CourseModel.tgSt.isArray) == 0)
                elem[childName] = childObj;
            else if (!elem[childName])
                elem[childName] = [childObj];
            else
                elem[childName].push(childObj); //array property => dosad nebo obohat array
            //evidence tagu v property
            if (propertyTags)
                propertyTags.push(childObj);
        }
        if (elem.Items && elem.Items.length == 0)
            delete elem.Items;
        return elem;
    }
    CourseMeta.jsonML_to_Tag = jsonML_to_Tag;
    ;
    function createClass(meta, tg, def) {
        var cls = meta.classDir ? meta.classDir[tg] : null;
        if (!cls)
            return def;
        var res = new cls(def);
        return res;
    }
    function xmlEscape(str, res) {
        for (var i = 0; i < str.length; ++i) {
            var c = str[i];
            var code = c.charCodeAt(0);
            var s = reventities[c];
            if (s) {
                res.push("&" + s + ";");
            }
            else if (code >= 128) {
                res.push("&#" + code + ";");
            }
            else {
                res.push(c);
            }
        }
    }
    var reventities = (function () {
        var result = {};
        for (var key in entities)
            if (entities.hasOwnProperty(key))
                result[entities[key]] = key;
        return result;
    })();
    var entities = {
        "quot": '"',
        "amp": '&',
        "apos": "'",
        "lt": '<',
        "gt": '>'
    };
    function finishLoadedProduct(prod) {
        CourseMeta.actProduct = prod;
        prod.allNodes = {};
        extend(prod, CourseMeta.productImpl);
        CourseMeta.actCourseRoot = (prod.Items[0]); //kurz nebo test
        CourseMeta.actGrammar = prod.find(function (dt) { return isType(dt, CourseMeta.runtimeType.grammarRoot); }); //a jeho eventuelni gramatika
        //grammar
        if (CourseMeta.actGrammar) {
            var lastNode = null;
            CourseMeta.actGrammarExCount = 0;
            scan(CourseMeta.actGrammar, function (it) {
                extend(it, CourseMeta.dataImpl, CourseMeta.runtimeType.no);
                prod.allNodes[it.url] = it;
                it.type |= CourseMeta.runtimeType.grammar;
                it.each(function (t) { return t.parent = it; });
                if (isType(it, CourseMeta.runtimeType.ex)) {
                    extend(it, CourseMeta.grammEx, CourseMeta.runtimeType.ex);
                    var ge = it;
                    ge.idx = CourseMeta.actGrammarExCount++;
                    if (lastNode) {
                        lastNode.next = ge;
                        ge.prev = lastNode;
                    }
                    lastNode = ge;
                }
                if (isType(it, CourseMeta.runtimeType.mod))
                    extend(it, CourseMeta.modImpl, CourseMeta.runtimeType.mod);
            });
            extend(CourseMeta.actGrammar, CourseMeta.grammarRoot, CourseMeta.runtimeType.grammarRoot);
        }
        var uniqId = 0;
        //prvni pruchod
        scan(CourseMeta.actCourseRoot, function (it) {
            it.uniqId = uniqId++;
            prod.allNodes[it.url] = it;
            extend(it, CourseMeta.courseNode, CourseMeta.runtimeType.courseNode);
            it.each(function (t) { return t.parent = it; });
            if (isType(it, CourseMeta.runtimeType.ex) && cfg.forceEval)
                it.designForceEval = true; //pro design time - ukaz se vyhodnoceny na 100%
        });
        //druhy pruchod
        scan(CourseMeta.actCourseRoot, function (it) {
            if (isType(it, CourseMeta.runtimeType.ex))
                extend(it, CourseMeta.exImpl);
            else if (isType(it, CourseMeta.runtimeType.multiTask))
                extend(it, CourseMeta.multiTaskImpl);
            else if (isType(it, CourseMeta.runtimeType.product))
                extend(it, CourseMeta.productImpl);
            else if (isType(it, CourseMeta.runtimeType.taskCourse))
                extend(it, CourseMeta.courseImpl);
            else if (isType(it, CourseMeta.runtimeType.test))
                extend(it, testMe.testImpl);
            else if (isType(it, CourseMeta.runtimeType.multiTest))
                extend(it, testMe.multiTestImpl);
            else if (isType(it, CourseMeta.runtimeType.taskTestInCourse)) {
                it.type |= CourseMeta.runtimeType.dynamicTestModule;
                extend(it, CourseMeta.courseTestImpl, CourseMeta.runtimeType.mod);
            }
            else if (isType(it, CourseMeta.runtimeType.taskPretest))
                extend(it, CourseMeta.pretestImpl);
            else if (isType(it, CourseMeta.runtimeType.taskTestSkill)) {
                it.type |= CourseMeta.runtimeType.dynamicTestModule;
                extend(it, testMe.testSkillImpl, CourseMeta.runtimeType.mod);
            }
            else if (isType(it, CourseMeta.runtimeType.taskPretestTask)) {
                extend(it, CourseMeta.pretestTaskImpl, CourseMeta.runtimeType.mod);
                it.each(function (e) { return e.testMode = CSLocalize('3859695377c4444abce16f7af9f5d2ec', 'Pretest'); });
            }
            else if (isType(it, CourseMeta.runtimeType.mod))
                extend(it, CourseMeta.modImpl);
            //else if (isType(it, runtimeType.questionnaire)) extend(it, ex, runtimeType.ex);
        });
        //actCourseRoot: prepsani set x getUser
        if (!isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.test) && !isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.multiTest))
            extend(CourseMeta.actCourseRoot, CourseMeta.skipAbleRoot, CourseMeta.runtimeType.skipAbleRoot);
    }
    var lib;
    (function (lib) {
        //reakce na zmenu URL. Nacte se modul, cviceni a user data ke cviceni
        function onChangeUrl(prodUrl, persistence, nodeUrl, completed) {
            CourseMeta.foundGreenEx = null;
            if (_.isEmpty(prodUrl)) {
                completed(null);
                return;
            }
            adjustProduct(prodUrl, persistence, function () {
                if (CourseMeta.actNode && CourseMeta.actNode.url == nodeUrl) {
                    completed(isType(CourseMeta.actNode, CourseMeta.runtimeType.ex) ? CourseMeta.actNode : null);
                    return;
                } //zadna zmena aktualniho node
                var oldEx = CourseMeta.actEx;
                var oldMod = CourseMeta.actModule;
                var oldNode = CourseMeta.actNode;
                var oldGrammarEx = CourseMeta.actGrammarEx;
                var oldGrammarModule = CourseMeta.actGrammarModule;
                var doCompleted = function (loadedEx) {
                    if (CourseMeta.actEx && oldEx && CourseMeta.actEx != oldEx)
                        oldEx.onUnloadEx();
                    if (CourseMeta.actModule && oldMod && CourseMeta.actModule != oldMod)
                        oldMod.onUnloadMod();
                    if (CourseMeta.actGrammarEx && oldGrammarEx && CourseMeta.actGrammarEx != oldGrammarEx)
                        oldGrammarEx.onUnloadEx();
                    if (CourseMeta.actGrammarModule && oldGrammarModule && CourseMeta.actGrammarModule != oldGrammarModule)
                        oldGrammarModule.onUnloadMod();
                    completed(loadedEx);
                };
                CourseMeta.actNode = null;
                if (!_.isEmpty(nodeUrl))
                    CourseMeta.actNode = CourseMeta.actProduct.getNode(nodeUrl);
                if (!CourseMeta.actNode)
                    CourseMeta.actNode = CourseMeta.actCourseRoot; //novy actNode
                if (!CourseMeta.actNode) {
                    doCompleted(null);
                    return;
                } //zadny node
                if (isType(CourseMeta.actNode, CourseMeta.runtimeType.ex))
                    adjustEx(CourseMeta.actNode, doCompleted);
                else if (isType(CourseMeta.actNode, CourseMeta.runtimeType.mod))
                    adjustMod(CourseMeta.actNode, function (mod) { return doCompleted(null); });
                else
                    doCompleted(null);
            });
        }
        lib.onChangeUrl = onChangeUrl;
        function doRefresh(completed) {
            var compl = function () { if (completed)
                completed(); };
            if (isType(CourseMeta.actNode, CourseMeta.runtimeType.grammar)) {
                compl();
                return;
            }
            CourseMeta.greenArrowDict = {};
            //spocitej nodes udaje
            CourseMeta.actCourseRoot.refreshNumbers();
            //hotovo
            if (CourseMeta.actCourseRoot.done) {
                if (!treatBlueEx())
                    fillArrowInfo(info_courseFinished());
                compl();
                return;
            }
            if (CourseMeta.actCourseRoot.isSkiped) {
                fillArrowInfo(info_courseFinished());
                compl();
                return;
            }
            //najdi aktualni uzel
            findGreenExGlobal(CourseMeta.actCourseRoot, function (findRes) {
                CourseMeta.foundGreenEx = null;
                if (!findRes) {
                    compl();
                    return;
                }
                CourseMeta.foundGreenEx = findRes.grEx;
                //nezelene cviceni
                if (findRes.grEx != CourseMeta.actNode && treatBlueEx()) {
                    compl();
                    return;
                }
                //spocti green parent chain
                var nd = findRes.grEx;
                while (true) {
                    CourseMeta.greenArrowDict[nd.url] = true;
                    if (nd == CourseMeta.actCourseRoot)
                        break;
                    nd = (nd.parent);
                } //parent chain zeleneho cviceni
                //actNode neni v green parent chain => modra sipka
                if (!CourseMeta.greenArrowDict[CourseMeta.actNode.url]) {
                    fillArrowInfo(info_continue());
                    compl();
                    return;
                }
                //jiny task multitasku - prejdi pres home
                if (changeTaskInMultitask(CourseMeta.actNode, findRes.grEx))
                    findRes.info = new CourseMeta.greenArrowInfo(CSLocalize('e64fb875261a4c5e849a9952ecc4ae63', 'Continue'), false, 'success', 'hand-o-right', function () { return CourseMeta.gui.gotoData(null); });
                //muze nastat?
                if (!findRes.info)
                    return;
                fillArrowInfo(findRes.info);
                compl();
            });
        }
        lib.doRefresh = doRefresh;
        //globalni funkce na nalezeni aktualniho (zeleneho) cviceni
        function findGreenExGlobal(nd, completed) {
            var findRes;
            var toExpand;
            findDeepNotSkiped(nd, function (n) {
                if (n.done || n.findParent(function (t) { return t.done; }) != null)
                    return false; //hleda se pouze v nehotovych a non skiped uzlech
                var md = n;
                if (md.getDynamic && md.getDynamic()) {
                    toExpand = n;
                    return true;
                } //uzel je potrena nejdrive expandovat => konec find
                var an = n;
                if (an.findGreenEx && !!(findRes = an.findGreenEx())) {
                    return true; //uzel ma vlastni findGreenEx a ten vrati zelene cviceni
                }
                return false; //pokracuj dal
            });
            if (findRes) {
                completed(findRes);
                return;
            } //nalezeno cviceni
            if (toExpand) {
                toExpand.expandDynamic(); /*kdy se pouziva???*/
                lib.saveProduct(function () { return findGreenExGlobal(toExpand, completed); });
                return;
            } //nalezen uzel k expanzi => rekurze
            completed(null); //nenalezeno nic
        }
        function findProduct(productId) {
            var res = _.find(CourseMeta.allProductList, function (prod) { return prod.url == productId; });
            if (!res) {
                _.find(Login.myData.Companies, function (c) {
                    res = _.find(c.companyProducts, function (p) { return p.url == productId; });
                    return !!res;
                });
            }
            return res;
        }
        lib.findProduct = findProduct;
        function isTest(prod) {
            return prod && CourseMeta.isType(prod, CourseMeta.runtimeType.test);
        }
        lib.isTest = isTest;
        function isAngularJS(prod) {
            return prod && CourseMeta.isType(prod, CourseMeta.runtimeType.productNew);
        }
        lib.isAngularJS = isAngularJS;
        function keyTitle(prod, Days) {
            return prod.title + ' / ' + (CourseMeta.lib.isTest(prod) ? 'test' : 'days: ' + Days.toString());
        }
        lib.keyTitle = keyTitle;
        function productLineTxt(productId) {
            return LowUtils.EnumToString(LMComLib.LineIds, findProduct(productId).line);
        }
        lib.productLineTxt = productLineTxt;
        //zajisti existenci produktu
        function adjustProduct(prodUrl, persistence, completed, lmcomUserId) {
            if (lmcomUserId === void 0) { lmcomUserId = 0; }
            if (!lmcomUserId)
                lmcomUserId = schools.LMComUserId();
            if (CourseMeta.actProduct && CourseMeta.actProduct.url == prodUrl && CourseMeta.actProductLmcomId == lmcomUserId && CourseMeta.actProductPersistence == persistence) {
                completed(false);
                return;
            }
            if (CourseMeta.actProduct)
                CourseMeta.actProduct.unloadActProduct();
            loadLocalizedProductAndInstrs(prodUrl, function (prod) {
                CourseMeta.actProductPersistence = persistence;
                actPersistence().loadShortUserData(lmcomUserId, CourseMeta.actCompanyId, prodUrl, function (data) {
                    CourseMeta.actProductLmcomId = lmcomUserId;
                    if (data)
                        for (var p in data)
                            try {
                                CourseMeta.actProduct.getNode(p).setUserData(data[p]);
                            }
                            catch (msg) { } //dato nemusi existovat v pripade zmeny struktury kurzu
                    completed(true);
                });
            });
        }
        lib.adjustProduct = adjustProduct;
        //zajisti existenci modulu (= lokalizace a slovnik)
        function adjustMod(nd, completed) {
            var actm = nd.findParent(function (n) { return isType(n, CourseMeta.runtimeType.mod); });
            if (actm == null) {
                completed(null);
                return;
            }
            var isGramm = isType(actm, CourseMeta.runtimeType.grammar);
            if ((isGramm && actm == CourseMeta.actGrammarModule) || (!isGramm && actm == CourseMeta.actModule)) {
                completed(actm);
                return;
            } //zadna zmena modulu
            if (isGramm)
                CourseMeta.actGrammarModule = actm;
            else
                CourseMeta.actModule = actm;
            load(urlStripLast(actm.url) + '.' + Trados.actLangStr, function (locDict) {
                if (!locDict)
                    locDict = { loc: {}, dict: null };
                actm.loc = locDict.loc;
                actm.dict = locDict.dict ? RJSON.unpack(locDict.dict) : null;
                actm.expandDynamic(); /*kdy se pouziva???*/
                lib.saveProduct(function () { return completed(actm); });
            });
        }
        lib.adjustMod = adjustMod;
        //zajisti existenci cviceni (= modul)
        function adjustEx(ex, completed, lmcomUserId) {
            if (lmcomUserId === void 0) { lmcomUserId = 0; }
            adjustMod(ex, function (mod) {
                if (mod == null)
                    throw 'Missing module for exercise';
                var isGramm = isType(ex, CourseMeta.runtimeType.grammar);
                if (isGramm)
                    CourseMeta.actGrammarEx = ex;
                else
                    CourseMeta.actEx = ex;
                if (ex.page) {
                    completed(ex);
                    return;
                }
                load(ex.url, function (pgJsonML) {
                    var pg = extractEx(pgJsonML);
                    Course.localize(pg, function (s) { return localizeString(pg.url, s, (isGramm ? CourseMeta.actGrammarModule : CourseMeta.actModule).loc); });
                    if (isGramm) {
                        ex.onSetPage(pg, null);
                        completed(ex);
                    }
                    else
                        actPersistence().loadUserData(lmcomUserId == 0 ? schools.LMComUserId() : lmcomUserId, CourseMeta.actCompanyId, CourseMeta.actProduct.url, ex.url, function (exData) {
                            if (!exData)
                                exData = {};
                            ex.onSetPage(pg, exData);
                            completed(ex);
                        });
                });
            });
        }
        lib.adjustEx = adjustEx;
        //zajisti existenci adresare vsech produktu
        function adjustAllProductList(completed) {
            if (CourseMeta.allProductList) {
                completed();
                return;
            }
            load(urlStripLast(cfg.dataBatchUrl ? cfg.dataBatchUrl : '/siteroot/'), function (obj) { CourseMeta.allProductList = obj.Items; if (Login.finishMyData)
                Login.finishMyData(); completed(); });
        }
        lib.adjustAllProductList = adjustAllProductList;
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
        function finishHtmlDOM() {
            //Uprav content
            var cnt = $('.content-place');
            //anchory
            _.each(cnt.find("a"), function (a) {
                var href = $(a).attr('href');
                if (_.isEmpty(href))
                    return;
                if (href.match(/^(\/?\w)+$/)) {
                    $(a).attr('href', '#');
                    a.onclick = function (ev) { return gotoHref(ev, href); };
                }
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
        lib.finishHtmlDOM = finishHtmlDOM;
        function info_continue() { return new CourseMeta.greenArrowInfo(CSLocalize('2882c6a2ef6343089ae90c898cac63f6', 'Continue'), false, "info", "reply", function () { return CourseMeta.gui.gotoData(null); }); }
        lib.info_continue = info_continue;
        function info_courseFinished() { return new CourseMeta.greenArrowInfo(CSLocalize('e06a4208d7c84c8ba97c1a700f00046c', 'Course completed!'), CourseMeta.actNode == CourseMeta.actCourseRoot, "info", "thumbs-up", CourseMeta.actNode == CourseMeta.actCourseRoot ? $.noop : function () { return CourseMeta.gui.gotoData(null); }); }
        lib.info_courseFinished = info_courseFinished;
        //vykresleni naladovaneho cviceni
        function displayEx(loadedEx, beforeUpdate, afterUpdate) {
            //TODO EVAL
            var pgCtrl = CourseMeta.actExPageControl = Course.finishCreatePage(loadedEx);
            CourseMeta.gui.exerciseHtml = function () { return JsRenderTemplateEngine.render("c_gen", loadedEx.page); };
            CourseMeta.gui.exerciseCls = function () { return loadedEx.page.isOldEa ? "ea" : "new-ea"; };
            pgCtrl.callInitProcs(Course.initPhase.beforeRender, function () {
                //if (!pgCtrl.isOldEa) pgCtrl.isPassive = _.all(pgCtrl.items, it => !it.isEval()); //pasivni cviceni ma vsechna isEval=false
                //pgCtrl.sound = new Course.pageSound(pgCtrl);
                if (beforeUpdate)
                    beforeUpdate(loadedEx);
                oldEAInitialization = null;
                Pager.renderHtmlEx(true, loadedEx.page.bodyStyle); //HTML rendering (kod, provedeny normalne za onUpdate)
                pgCtrl.callInitProcs(Course.initPhase.afterRender, function () {
                    if (!oldEAInitialization)
                        oldEAInitialization = function (completed) { return completed(); };
                    oldEAInitialization(function () {
                        pgCtrl.callInitProcs(Course.initPhase.afterRender2, function () {
                            loadedEx.evaluator = loadedEx.page.isOldEa ? new EA.oldToNewScoreProvider($evalRoot()) : pgCtrl;
                            loadedEx.evaluator.acceptData(loadedEx.done, loadedEx.result);
                            loadedEx.setStartTime();
                            //*** design mode => dosad do cviceni spravne hodnoty a vyhodnot jej
                            if (loadedEx.designForceEval) {
                                loadedEx.evaluator.acceptData(true, loadedEx.result);
                                if (loadedEx.evaluate()) {
                                    lib.saveProduct(function () {
                                        if (CourseMeta.actCourseRoot) {
                                            CourseMeta.actCourseRoot.refreshNumbers();
                                            var inf = loadedEx.findGreenEx().info;
                                            inf.css = CourseMeta.greenCss();
                                            lib.fillArrowInfo(inf);
                                            CourseMeta.refreshExerciseBar(loadedEx);
                                        }
                                    });
                                }
                                loadedEx.designForceEval = false;
                            }
                            if (afterUpdate)
                                afterUpdate(loadedEx);
                            //vse OK => display content
                            Pager.renderHtmlEx(false);
                            Pager.callLoaded();
                        });
                    });
                });
            });
        }
        lib.displayEx = displayEx;
        function actPersistence() { return CourseMeta.actProductPersistence == schools.memoryPersistId ? persistMemory.persistCourse : CourseMeta.persist; }
        lib.actPersistence = actPersistence;
        //save user dat
        function saveProduct(completed, lmcomUserId) {
            if (lmcomUserId === void 0) { lmcomUserId = 0; }
            if (!CourseMeta.actProduct) {
                completed();
                return;
            }
            var res = [];
            //var persistObj = actCourseRoot.
            scan(CourseMeta.actCourseRoot, function (dt) { if (!dt.userPending)
                return; dt.getUserData(function (shrt, lng, flag, key) { return res.push([key ? key : dt.url, shrt, lng, flag ? flag.toString() : '0']); }); dt.userPending = false; });
            if (res.length > 0) {
                Logger.trace_course('saveProduct lib, items=' + _.map(res, function (r) { return r[0]; }).join('; '));
                actPersistence().saveUserData(!lmcomUserId ? schools.LMComUserId() : lmcomUserId, CourseMeta.actCompanyId, CourseMeta.actProduct.url, res, function () {
                    if (cfg.target == LMComLib.Targets.scorm) {
                        CourseMeta.actCourseRoot.refreshNumbers();
                        scorm.reportProgress(CourseMeta.actCourseRoot.elapsed, CourseMeta.actCourseRoot.done ? (CourseMeta.actCourseRoot.complNotPassiveCnt == 0 || CourseMeta.actCourseRoot.ms == 0 ? 100 : Math.round(CourseMeta.actCourseRoot.s / CourseMeta.actCourseRoot.ms /*/ actCourseRoot.complNotPassiveCnt*/)) : null);
                    }
                    completed();
                });
            }
            else
                completed(); //prazdny res, NOOP
        }
        lib.saveProduct = saveProduct;
        //osetreni nezeleneho cviceni
        function treatBlueEx() {
            if (!CourseMeta.actNode || !isType(CourseMeta.actNode, CourseMeta.runtimeType.ex))
                return false;
            var findRes = CourseMeta.actNode.findGreenEx();
            findRes.info.css = 'info';
            fillArrowInfo(findRes.info);
            return true;
        }
        //zmena tasku v multitasku (=> skok pres home)
        function changeTaskInMultitask(nd1, nd2) {
            if (!isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.multiTask))
                return false;
            var p1 = nd1.findParent(function (nd) { return _.any(CourseMeta.actCourseRoot.Items, function (it) { return it == nd; }); });
            var p2 = nd2.findParent(function (nd) { return _.any(CourseMeta.actCourseRoot.Items, function (it) { return it == nd; }); });
            return p1 && p2 && p1 != p2;
        }
        //nalezne prvni neprobrane cviceni
        function findGreenExLow(nd) { return findDeepNotSkiped(nd, function (n) { return isType(n, CourseMeta.runtimeType.ex) && !n.done; }); }
        lib.findGreenExLow = findGreenExLow;
        //informace pro zelenou sipku
        function fillInfo(title, disable, css, iconId, _greenClick) {
            CourseMeta.greenTitle(title);
            CourseMeta.greenIcon(Trados.isRtl && iconId == "hand-o-left" ? "hand-o-right" : iconId);
            CourseMeta.greenCss(!CourseMeta.actCourseRoot.done && lib.keepGreen ? 'success' : css);
            CourseMeta.greenDisabled(disable);
            CourseMeta.greenClick = _greenClick;
            lib.keepGreen = false;
        }
        lib.fillInfo = fillInfo;
        lib.keepGreen;
        function fillArrowInfo(info) { fillInfo(info.title, info.disable, info.css, info.iconId, info.greenClick); }
        lib.fillArrowInfo = fillArrowInfo;
    })(lib = CourseMeta.lib || (CourseMeta.lib = {}));
    var jsExt = '.js';
    var testModuleExercises = '@test_module_exercises';
    function setDate(dt1, dt2, min) {
        if (dt1 == 0)
            return dt2;
        if (dt2 == 0)
            return dt1;
        if (min)
            return dt2 > dt1 ? dt1 : dt2;
        else
            return dt2 < dt1 ? dt1 : dt2;
    }
    function addUserData(key, shrt, lng, data) { data.push([key, shrt, lng]); }
    CourseMeta.addUserData = addUserData;
    function isType(dt, tp) { return (dt.type & tp) == tp; }
    CourseMeta.isType = isType;
    function scan(dt, action, cond) {
        if (cond === void 0) { cond = null; }
        if (dt.Items)
            _.each(dt.Items, function (it) { return scan(it, action, cond); });
        if (!cond || cond(dt))
            action(dt);
    }
    CourseMeta.scan = scan;
    function scanParentFirst(dt, action, cond) {
        if (cond === void 0) { cond = null; }
        if (!cond || cond(dt))
            action(dt);
        if (dt.Items)
            _.each(dt.Items, function (it) { return scanParentFirst(it, action, cond); });
    }
    CourseMeta.scanParentFirst = scanParentFirst;
    function scanOfType(dt, type, action) {
        scan(dt, function (d) { return action(d); }, function (d) { return d.type == type; });
    }
    CourseMeta.scanOfType = scanOfType;
    function findDeep(dt, cond) {
        if (cond === void 0) { cond = null; }
        if (cond(dt))
            return dt;
        if (!dt.Items)
            return null;
        var res = null;
        return _.find(dt.Items, function (it) { return (res = findDeep(it, cond)) != null; }) ? res : null;
    }
    CourseMeta.findDeep = findDeep;
    function findDeepNotSkiped(dt, cond) {
        if (cond === void 0) { cond = null; }
        if (dt.isSkiped)
            return null;
        if (cond(dt))
            return dt;
        if (!dt.Items)
            return null;
        var res = null;
        return _.find(dt.Items, function (it) { return (res = findDeepNotSkiped(it, cond)) != null; }) ? res : null;
    }
    CourseMeta.findDeepNotSkiped = findDeepNotSkiped;
    function extend(d, t, tp) {
        if (tp === void 0) { tp = 0; }
        extendLow(d, t);
        d.type = d.type | tp;
    }
    function extendLow(d, t) { t = t.prototype; for (var p in t)
        d[p] = t[p]; d.constructor(); }
    CourseMeta.extendLow = extendLow;
    function localizeString(keyPrefix, data, loc) {
        if (_.isEmpty(data) || data.indexOf('{{') < 0)
            return data;
        if (!loc)
            loc = {};
        return data.replace(locEx, function (match) {
            var gm = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                gm[_i - 1] = arguments[_i];
            }
            var idVal = gm[0].split('|');
            var val = idVal.length < 2 ? null : idVal[1];
            var parts = keyPrefix ? keyPrefix.split('/') : [];
            parts.push(idVal[0]);
            var idx = 0;
            var res = '';
            var l = loc;
            while (idx < parts.length) {
                l = l[parts[idx]];
                if (!l) {
                    res = val;
                    break;
                }
                if (idx == parts.length - 1) {
                    res = l;
                    break;
                }
                idx++;
            }
            return Trados.locNormalize(res);
        });
    }
    CourseMeta.localizeString = localizeString;
    var locEx = /{{(.*?)}}/g;
    function extractEx(pgJsonML) {
        var tagsInProperties = [];
        var html = jsonML_to_Tag(pgJsonML, CourseModel.meta, null, tagsInProperties);
        var pg = html.Items[1];
        var head = html.Items[0];
        var headItems = head && head.Items ? head.Items : null;
        var tit;
        var bodyStyle;
        if (headItems) {
            var tit = _.find(headItems, function (it) { return it._tg == 'title'; });
            var bodyStyle = _.find(headItems, function (it) { return it._tg == 'style'; });
        }
        pg.title = tit && tit.Items && _.isString(tit.Items[0]) ? tit.Items[0] : '';
        pg.bodyStyle = bodyStyle && bodyStyle.Items && _.isString(bodyStyle.Items[0]) ? bodyStyle.Items[0] : '';
        pg.bodyStyle = pg.bodyStyle.replace(/\/\*.*\*\//, '');
        pg._tg = CourseModel.tbody; //hack. body ma jinak Type=body 
        if (!_.isEmpty(pg.seeAlsoStr)) {
            pg.seeAlso = _.map(pg.seeAlsoStr.split('#'), function (sa) {
                var parts = sa.split('|');
                var res = { url: parts[0], title: parts[1], type: 0 };
                return res;
            });
        }
        if (!_.isEmpty(pg.instrBody))
            pg.instrs = pg.instrBody.split('|');
        pg.propertyTags = tagsInProperties;
        return pg;
    }
    CourseMeta.extractEx = extractEx;
    //persist.readFiles muze byt nahrazeno JS soubory, ulozenymi  primo v HTML strance v <script type="text/inpagefiles" data-id="url"> scriptu.
    //json soubory jsou ulozeny ve strance jako <script type="text/inpagefiles" data-id="url">. Pouziva se pro Author, v d:\LMCom\rew\NewLMComModel\Design\CourseMeta.cs, getServerScript 
    function loadFiles(urls, completed) {
        if (!inPageFiles) {
            inPageFiles = {};
            $('script[type="text/inpagefiles"]').each(function (idx, el) {
                var sc = $(el);
                inPageFiles[sc.attr('data-id').toLowerCase()] = sc.html().replace(/^\s*/, '');
                //inPageAny = true; //existuje-li jediny type="text/inpagefiles", pak se vsechny JS berou z inPageFiles
            });
        }
        //priorita - nacti soubor z script[type="text/inpagefiles"]
        var values = _.map(urls, function (url) { return inPageFiles[url.substr(2).toLowerCase()]; }); //url zacina ../
        var fromScript = _.zip(urls, values);
        //nenactene ze scriptu => nacti z webu
        var webUrls = _.map(_.filter(fromScript, function (uv) { return !uv[1]; }), function (uv) { return uv[0]; }); //nenactene ze scriptu
        if (webUrls.length > 0) {
            CourseMeta.persist.readFiles(webUrls, function (webValues) {
                //merge fromScript a fromWeb
                var fromWeb = _.zip(webUrls, webValues);
                var fromWebIdx = 0;
                _.each(fromScript, function (kv) {
                    if (kv[1])
                        return;
                    kv[1] = fromWeb[fromWebIdx][1];
                    fromWebIdx++;
                });
                //vrat values z merged
                completed(_.map(fromScript, function (kv) { return kv[1]; }));
            });
        }
        else
            completed(values); //vse nactene ze scriptu
    }
    CourseMeta.loadFiles = loadFiles;
    var inPageFiles; //var inPageAny = false;
    function loadResponseScript(serverAndUrl, completed) {
        $.ajax(serverAndUrl, {
            async: true,
            type: 'GET',
            dataType: 'text',
            contentType: "text/plain; charset=UTF-8"
        }).done(function (txt) {
            var parts = txt.split('%#%#[[[]]]');
            for (var i = 0; i < parts.length; i += 2)
                inPageFiles[parts[i]] = parts[i + 1];
            completed(true);
        }).fail(function () {
            debugger;
            completed(false);
        });
    }
    CourseMeta.loadResponseScript = loadResponseScript;
    function load(href, completed) {
        loadFiles(['..' + href + jsExt], function (ress) { return completed(jsonParse(ress[0])); });
    }
    CourseMeta.load = load;
    function urlStripLast(url) {
        url = url.split('|')[0]; //odstran z productUrl cast |<archiveId>
        return url.charAt(url.length - 1) == '/' ? url.substr(0, url.length - 1) : url;
    }
    function loadLocalizedProductAndInstrs(url, completed) {
        var href = urlStripLast(url);
        href = '..' + (href[0] == '/' ? '' : '/') + href;
        loadFiles([href + jsExt, href + '.' + Trados.actLangStr + jsExt, href + '_instrs.js'], function (ress) {
            //sitemap
            var prod = (jsonParse(ress[0]));
            if (!prod)
                throw 'error loading ' + href;
            finishLoadedProduct(prod);
            prod.url = url;
            //a jeji lokalizace
            var loc = jsonParse(ress[1]);
            if (!loc)
                loc = {};
            scan(prod, function (it) { if (it.localize)
                it.localize(function (s) { return localizeString(it.url, s, loc); }); });
            //instrukce
            var instrs = jsonParse(ress[2]);
            CourseMeta.instructions = {};
            if (instrs)
                for (var p in instrs)
                    finishInstr(p, instrs[p], loc);
            completed(prod);
        });
    }
    function finishInstr(url, jsonML, loc) {
        var pg = extractEx((jsonML));
        if (pg == null) {
            debugger;
            throw 'missing instr';
        }
        pg.Items = _.filter(pg.Items, function (it) { return !_.isString(it); });
        Course.localize(pg, function (s) { return localizeString(pg.url, s, loc); });
        Course.scanEx(pg, function (tg) { if (!_.isString(tg))
            delete tg.id; }); //instrukce nemohou mit tag.id, protoze se ID tlucou s ID ze cviceni
        CourseMeta.instructions[url] = JsRenderTemplateEngine.render("c_genitems", pg);
    }
    CourseMeta.finishInstr = finishInstr;
    function jsonParse(str) {
        if (!str || str.length < 1)
            return null;
        var isRjson = str.substr(0, 1) == rjsonSign;
        if (isRjson)
            str = str.substr(1);
        var obj = JSON.parse(str);
        if (isRjson)
            obj = RJSON.unpack(obj);
        return obj;
    }
    CourseMeta.jsonParse = jsonParse;
    //function loadDataAndLoc(href: string, completed: (mod, loc) => void) {
    //  href = '..' + (href[0] == '/' ? '' : '/') + href;
    //  loadFiles([href + jsExt, href + '.' + Trados.actLangStr + jsExt], ress => {
    //    var pages = jsonParse(ress[0]); if (!pages) throw 'error loading ' + href;
    //    var locDict = jsonParse(ress[1]);
    //    completed(pages, locDict);
    //  });
    //}
    var rjsonSign = "@";
    $.views.helpers({
        productLineTxt: lib.productLineTxt,
        productLineTxtLower: function (productId) { return lib.productLineTxt(productId).toLowerCase(); },
    });
})(CourseMeta || (CourseMeta = {}));
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
