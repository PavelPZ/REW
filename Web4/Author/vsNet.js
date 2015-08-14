var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vsNet;
(function (vsNet) {
    var exModelTypeName = "vsNetExModel".toLowerCase();
    var modModelTypeName = "vsNetModModel".toLowerCase();
    var ModModel = (function (_super) {
        __extends(ModModel, _super);
        function ModModel(urlParts) {
            _super.call(this, vsNet.appId, exModelTypeName, urlParts);
            this.url = urlParts[0];
        }
        return ModModel;
    })(Pager.Page);
    vsNet.ModModel = ModModel;
    var ExModel = (function (_super) {
        __extends(ExModel, _super);
        function ExModel(urlParts) {
            _super.call(this, vsNet.appId, exModelTypeName, urlParts);
            this.seeAlsoTemplateSmall = ko.observable("Dummy");
            this.seeAlsoTemplate = ko.observable("Dummy");
            this.exerciseEvaluated = ko.observable(false); //cviceni je vyhodnocenu
            this.score = ko.observable(null);
            this.instrBody = ko.observable(null);
            this.url = urlParts[0];
            ex = null;
            persistMemory.reset();
        }
        ExModel.prototype.update = function (completed) {
            var _this = this;
            var th = this;
            //CourseMeta.lib.adjustInstr(() => { //nacteni a lokalizace Schools\EAData\instructions.json
            CourseMeta.load(th.url, function (pgJsonML) {
                var pg = CourseMeta.extractEx(pgJsonML);
                Course.localize(pg, function (s) { return CourseMeta.localizeString('', s, null); });
                //pg.instrTitle = CourseMeta.localizeString('', pg.instrTitle,null);
                if (!ex) {
                    ex = new CourseMeta.exImpl();
                    ex.type = CourseMeta.runtimeType.ex;
                    ex.url = th.url;
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
                CourseMeta.lib.displayEx(ex, function (loadedEx) {
                    _this.cpv = new schoolCpv.model(schools.tExCpv, null);
                }, function (loadedEx) {
                    boot.minInit();
                    //napln instrukce
                    CourseMeta.instructions = {};
                    CourseMeta.loadFiles(_.map(th.ex.page.instrs, function (s) { return '..' + s + '.js'; }), function (instrs) {
                        for (var i = 0; i < instrs.length; i++)
                            CourseMeta.finishInstr(th.ex.page.instrs[i], JSON.parse(instrs[i]), {});
                    });
                    //pouzij instrukce
                    th.instrBody(_.map(th.ex.page.instrs, function (s) { var res = CourseMeta.instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
                    th.refreshExerciseBar();
                });
                //completed();
            });
            //});
        };
        ExModel.prototype.htmlClearing = function () {
            if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sndPage)
                CourseMeta.actExPageControl.sndPage.htmlClearing();
        };
        ExModel.prototype.title = function () { return this.ex.title; };
        ExModel.prototype.iconId = function () { return 'edit'; };
        ExModel.prototype.resetClick = function () { this.ex.reset(); this.refreshExerciseBar(); };
        ExModel.prototype.evaluateClick = function () { this.ex.evaluate(); this.refreshExerciseBar(); };
        ExModel.prototype.refreshExerciseBar = function () {
            var th = this;
            if (th.ex.done) {
                th.exerciseEvaluated(true);
                th.score(th.ex.page.isPassivePage() /*|| !th.ex.ms*/ ? null : (th.ex.s ? th.ex.s.toString() : '0') + '/' + th.ex.ms.toString());
            }
            else {
                th.exerciseEvaluated(false);
            }
        };
        return ExModel;
    })(Pager.Page);
    vsNet.ExModel = ExModel;
    var ex = null;
    Pager.registerAppLocator(vsNet.appId, exModelTypeName, function (urlParts, completed) { return completed(new ExModel(urlParts)); });
    Pager.registerAppLocator(vsNet.appId, modModelTypeName, function (urlParts, completed) { return completed(new ModModel(urlParts)); });
})(vsNet || (vsNet = {}));
