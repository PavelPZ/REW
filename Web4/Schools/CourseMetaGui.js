var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseMeta;
(function (CourseMeta) {
    function navBar() { return cfg.themeDefauleNavbar ? 'default' : 'inverse'; }
    CourseMeta.navBar = navBar;
    //export var navBar = 'default';
    //Dynamicke properties stranky, menene i pri vyhodnoceni cviceni
    CourseMeta.greenTitle = ko.observable(); //titulek buttonu
    CourseMeta.greenIcon = ko.observable(); //ikona buttonu
    CourseMeta.greenCss = ko.observable(); //barva buttonu
    CourseMeta.greenDisabled = ko.observable(); //vse hotovo => disabled
    CourseMeta.greenClick;
    CourseMeta.greenArrowDict;
    CourseMeta.foundGreenEx; //aktualni zelene cviceni
    function doGreenClick() { CourseMeta.lib.keepGreen = CourseMeta.greenCss() == 'success'; CourseMeta.greenClick(); return false; }
    CourseMeta.doGreenClick = doGreenClick; //pres klik na sipku se drzi zelena barva sipky
    function btnClick(url) {
        var nd = _.isEmpty(url) ? CourseMeta.actCourseRoot : (CourseMeta.actProduct.getNode(url));
        if (nd.isSkiped)
            return;
        Pager.navigateToHash(nd.href());
    }
    CourseMeta.btnClick = btnClick;
    //##GOTO
    function gotoData(url) {
        if (_.isEmpty(url)) {
            Pager.gotoHomeUrl();
            return;
        }
        //skok na hash nebo sitemap url, kvuli breadcrumb v testMe result apod.
        Pager.navigateToHash(Utils.startsWith(url, '/old/') ? encodeUrlHash(url) : CourseMeta.actProduct.getNode(url).href());
        return false;
    }
    CourseMeta.gotoData = gotoData;
    var gui;
    (function (gui) {
        function alert(type, isConfirm) {
            if (isConfirm)
                return confirm(CSLocalize('d348b1d49cc9424a8c1c3a840ad9d4dd', 'Your answers are not all correct. Do you really want to evaluate the exercise?'));
            else
                window.alert('alert');
        }
        gui.alert = alert;
        //##GOTO
        function gotoData(node) {
            if (!node)
                Pager.gotoHomeUrl();
            Pager.navigateToHash(node.href());
        }
        gui.gotoData = gotoData;
        function onReload() {
            Pager.reloadPage();
        }
        gui.onReload = onReload;
        gui.exerciseHtml;
        gui.exerciseCls;
        function init() { gui.exerciseHtml = $.noop; gui.exerciseCls = $.noop; }
        gui.init = init;
    })(gui = CourseMeta.gui || (CourseMeta.gui = {}));
    gui.init();
    //sluzby, ktere CourseMeta poskytuje persistent layer
    CourseMeta.persist = null; //persistNewEA.persistCourse;
    var MetaModel = (function (_super) {
        __extends(MetaModel, _super);
        function MetaModel() {
            _super.apply(this, arguments);
        }
        MetaModel.prototype.title = function () { return CourseMeta.actNode.title; };
        MetaModel.prototype.iconId = function () { return CourseMeta.actNode.iconId(); };
        MetaModel.prototype.breadcrumbs = function () {
            if (this.br)
                return this.br;
            var res = [];
            var self = CourseMeta.actNode;
            while (true) {
                res.push(self);
                if (self == CourseMeta.actCourseRoot || self == CourseMeta.actGrammar)
                    break;
                self = self.parent;
            }
            if (!CourseMeta.isType(CourseMeta.actNode, CourseMeta.runtimeType.grammar) && cfg.target == LMComLib.Targets.web)
                res.push({ title: schools.homeTitle(), iconId: function () { return 'home'; }, url: '' });
            if (res.length == 1)
                return this.br = [];
            res.reverse();
            return this.br = res;
        };
        MetaModel.prototype.hasBreadcrumb = function () { return CourseMeta.actNode != CourseMeta.actGrammar && this.breadcrumbs().length > 1; };
        MetaModel.prototype.normalDisplay = function () { return cfg.displayMode == schools.displayModes.normal; };
        MetaModel.prototype.previewExDisplay = function () { return cfg.displayMode == schools.displayModes.previewEx; };
        MetaModel.prototype.doUpdate = function (completed) {
            CourseMeta.lib.onChangeUrl(this.productUrl, this.persistence, this.url, function (ex) {
                return CourseMeta.lib.doRefresh(completed);
            });
        };
        return MetaModel;
    })(schools.Model);
    CourseMeta.MetaModel = MetaModel;
    var ModelPretest = (function (_super) {
        __extends(ModelPretest, _super);
        function ModelPretest(urlParts) {
            _super.call(this, schools.tCoursePretest, urlParts);
            this.bodyTmpl = "TCoursePretestBody";
        }
        ModelPretest.prototype.title = function () { return 'Pretest'; };
        ModelPretest.prototype.iconId = function () { return 'puzzle-piece'; };
        ModelPretest.prototype.doUpdate = function (completed) {
            //var u: schools.Url = <any>this.url;
            CourseMeta.lib.onChangeUrl(this.productUrl, this.persistence, this.url, function (ex) {
                return CourseMeta.lib.doRefresh(function () {
                    if (!CourseMeta.isType(CourseMeta.actNode, CourseMeta.runtimeType.taskPretest))
                        throw '!isType(actNode, runtimeType.taskPretest)';
                    var pretest = CourseMeta.actNode;
                    var init = pretest.initModel();
                    CourseMeta.lib.fillArrowInfo(init.info);
                    CourseMeta.lib.adjustEx(init.grEx, function () {
                        return CourseMeta.lib.displayEx(init.grEx, null, null);
                    });
                });
            });
        };
        return ModelPretest;
    })(MetaModel);
    CourseMeta.ModelPretest = ModelPretest;
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(urlParts) {
            _super.call(this, schools.tCourseMeta, urlParts);
            this.bodyTmpl = "TCourseMeta_Folder";
        }
        return Model;
    })(MetaModel);
    CourseMeta.Model = Model;
    $.views.helpers({
        makeTuples: function (buttons) {
            var res = [];
            var isLeft = true;
            _.each(buttons, function (b) {
                if (isLeft)
                    res.push({ left: b, right: null });
                else {
                    var t = res[res.length - 1];
                    t.right = b;
                }
                isLeft = !isLeft;
            });
            return res;
        },
        CourseMeta: CourseMeta,
        Utils: Utils,
        cfg: cfg,
        SndLow: SndLow,
    });
    $(window).bind("resize", function () {
        $(".cbtn").each(function () {
            var btn = $(this);
            var url = btn.data("node-url");
            if (!url)
                return;
            var nd = (CourseMeta.actProduct.getNode(url));
            if (!nd)
                return;
            var w = btn.outerWidth(true);
            var sum = nd.exCount;
            var skiped = nd.isSkiped ? w : w * nd.skipedCount / sum;
            var completed = nd.isSkiped ? 0 : w * (nd.complNotPassiveCnt + nd.complPassiveCnt) / sum;
            btn.find('.c1').css('width', Math.round(skiped).toString() + 'px');
            btn.find('.c2').css('left', Math.round(skiped).toString() + 'px').css('width', Math.round(completed).toString() + 'px');
            btn.find('.c3').css('left', Math.round(skiped + completed).toString() + 'px');
        });
    });
    function saveAndReload() { CourseMeta.lib.saveProduct(function () { CourseMeta.actNode = null; Pager.reloadPage(CourseMeta.actExModel); }); }
    CourseMeta.saveAndReload = saveAndReload;
    //vypocet odvozenych udaju
    function refreshExerciseBar(dt) {
        CourseMeta.actExModel.tb.exercisePassive(CourseMeta.actEx.page.isPassivePage());
        if (dt.done) {
            CourseMeta.actExModel.tb.exerciseEvaluated(true);
            CourseMeta.actExModel.tb.score(CourseMeta.actEx.page.isPassivePage() ? null : Math.round(100 * dt.s / dt.ms).toString() + "%");
        }
        else
            CourseMeta.actExModel.tb.exerciseEvaluated(false);
    }
    CourseMeta.refreshExerciseBar = refreshExerciseBar;
    //stav zelene sipky
    var greenArrowInfo = (function () {
        function greenArrowInfo(title, disable, css, iconId, greenClick) {
            this.title = title;
            this.disable = disable;
            this.css = css;
            this.iconId = iconId;
            this.greenClick = greenClick;
        }
        return greenArrowInfo;
    })();
    CourseMeta.greenArrowInfo = greenArrowInfo;
    //vsechny mozne alerty
    (function (alerts) {
        alerts[alerts["exTooManyErrors"] = 0] = "exTooManyErrors";
    })(CourseMeta.alerts || (CourseMeta.alerts = {}));
    var alerts = CourseMeta.alerts;
    //seznam vsech dostupnych button akci 
    (function (nodeAction) {
        nodeAction[nodeAction["no"] = 0] = "no";
        nodeAction[nodeAction["browse"] = 1] = "browse";
        nodeAction[nodeAction["skip"] = 2] = "skip";
        nodeAction[nodeAction["run"] = 3] = "run";
        //archive = 3,
        nodeAction[nodeAction["unskip"] = 4] = "unskip";
        //nop = 5,
        //pro kurz
        nodeAction[nodeAction["reset"] = 5] = "reset";
        //pro test
        nodeAction[nodeAction["runTestAgain"] = 6] = "runTestAgain";
        nodeAction[nodeAction["cancelTestSkip"] = 7] = "cancelTestSkip";
    })(CourseMeta.nodeAction || (CourseMeta.nodeAction = {}));
    var nodeAction = CourseMeta.nodeAction;
    function onNodeAction(url, type) {
        var nd = CourseMeta.actProduct.getNode(url);
        nd.onAction(type);
    }
    CourseMeta.onNodeAction = onNodeAction;
    //popis akce nad buttonem
    var NodeAction = (function () {
        function NodeAction(type, node) {
            this.type = type;
            this.node = node;
        }
        NodeAction.prototype.info = function () { return CourseMeta.allActions[this.type]; };
        NodeAction.createActions = function (node) {
            var actions = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                actions[_i - 1] = arguments[_i];
            }
            return _.map(_.filter(actions, function (a) { return a != nodeAction.no; }), function (act) { return new NodeAction(act, node); });
        };
        return NodeAction;
    })();
    CourseMeta.NodeAction = NodeAction;
    CourseMeta.allActions = {};
    CourseMeta.allActions[nodeAction.browse] = { icon: 'folder-open', title: function () { return CSLocalize('af026337fdf44d3287ade389c8d925f9', 'Browse'); } };
    CourseMeta.allActions[nodeAction.skip] = { icon: 'times-circle', title: function () { return CSLocalize('2c9b18c8e2a8449b891a3639691e1999', 'Skip'); } };
    CourseMeta.allActions[nodeAction.run] = { icon: 'play', title: function () { return CSLocalize('ba8042332a3c4520bc758e9bc851ae2b', 'Run'); } };
    CourseMeta.allActions[nodeAction.unskip] = { icon: 'plus-circle', title: function () { return CSLocalize('7f9d15221d9f471f934a944b1a949dca', 'Undo Skip'); } };
    CourseMeta.allActions[nodeAction.reset] = { icon: 'refresh', title: function () { return CSLocalize('27f1cba5240643fc9d0993cb6b5931b7', 'Reset'); } };
    CourseMeta.allActions[nodeAction.runTestAgain] = { icon: 'refresh', title: function () { return CSLocalize('9f77df2b307e48ad91291b0907fcbf4a', 'Run a new test'); } };
    CourseMeta.allActions[nodeAction.cancelTestSkip] = { icon: 'plus-circle', title: function () { return CSLocalize('f48f9615e3374fd2b6e1c377d1b8b0d3', 'Cancel and skip the test'); } };
    //Pager.registerAppLocator(schools.appId, schools.tCourseMeta, (urlParts, completed) => { completed(new Model(urlParts)); });
    //Pager.registerAppLocator(schools.appId, schools.tCoursePretest, (urlParts, completed) => completed(new ModelPretest(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schools.tCourseMeta, schools.appId, schools.tCourseMeta, 4, function (urlParts) { return new Model(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schools.tCoursePretest, schools.appId, schools.tCoursePretest, 4, function (urlParts) { return new ModelPretest(urlParts); }); });
})(CourseMeta || (CourseMeta = {}));
