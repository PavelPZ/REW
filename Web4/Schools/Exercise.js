/// <reference path="../courses/Course.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseMeta;
(function (CourseMeta) {
    CourseMeta.instructions = null;
    //export function hasCtxGramm(): bool { return actEx.page.seeAlso && actEx.page.seeAlso.length > 0; }
    var ModelEx = (function (_super) {
        __extends(ModelEx, _super);
        function ModelEx(urlParts) {
            _super.call(this, schools.tEx, urlParts);
            this.instrTitle = ko.observable("");
            this.instrBody = ko.observable("");
            this.seeAlsoTemplateSmall = ko.observable("Dummy");
            this.seeAlsoTemplate = ko.observable("Dummy");
            CourseMeta.actExModel = this;
        }
        //seeAlsoClick(idx: number) { gui.gotoData(this.seeAlso[idx]); }
        ModelEx.prototype.leave = function () {
            if (CourseMeta.actEx && CourseMeta.actEx.page && CourseMeta.actEx.page.sndPage)
                CourseMeta.actEx.page.sndPage.leave();
        };
        ModelEx.prototype.doUpdate = function (completed) {
            var _this = this;
            var th = this; //var u: schools.Url = <any>this.url;
            //lib.adjustInstr(() => //nacteni a lokalizace Schools\EAData\instructions.json
            CourseMeta.lib.onChangeUrl(th.productUrl, this.persistence, th.url, function (ex) {
                return CourseMeta.lib.doRefresh(function () {
                    return CourseMeta.lib.displayEx(ex, function (loadedEx) {
                        _this.cpv = new schoolCpv.model(schools.tExCpv, null);
                        DictConnector.initDict(CourseMeta.actModule.dict);
                    }, function (loadedEx) {
                        th.instrTitle(CourseMeta.actEx.page.instrTitle);
                        th.instrBody(_.map(CourseMeta.actEx.page.instrs, function (s) { var res = CourseMeta.instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
                        if (CourseMeta.actEx.page.seeAlso)
                            th.seeAlso = _.filter(_.map(CourseMeta.actEx.page.seeAlso, function (lnk) { return CourseMeta.actProduct.getNode(lnk.url); }), function (n) { return !!n; });
                        if (th.seeAlso && th.seeAlso.length == 0)
                            th.seeAlso = null;
                        if (th.seeAlso) {
                            th.seeAlsoTemplateSmall("TSeeAlsoTemplateSmall");
                            th.seeAlsoTemplate("TSeeAlsoTemplate");
                        }
                        th.tb.suplCtxtGrammar(th.seeAlso != null);
                        th.tb.suplGrammarIcon(th.seeAlso == null);
                        CourseMeta.refreshExerciseBar(loadedEx);
                    });
                });
            });
        };
        ModelEx.prototype.htmlClearing = function () {
            if (this.cpv)
                this.cpv.htmlClearing();
            if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sndPage)
                CourseMeta.actExPageControl.sndPage.htmlClearing();
        };
        return ModelEx;
    })(CourseMeta.MetaModel);
    CourseMeta.ModelEx = ModelEx;
    Pager.registerAppLocator(schools.appId, schools.tEx, function (urlParts, completed) { return completed(new ModelEx(urlParts)); });
})(CourseMeta || (CourseMeta = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_exrc(msg) {
        Logger.trace("Exercise", msg);
    }
    Logger.trace_exrc = trace_exrc;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var exrc_dict = null;
