var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseMeta;
(function (CourseMeta) {
    var DictInfoModel = (function (_super) {
        __extends(DictInfoModel, _super);
        function DictInfoModel(urlParts) {
            _super.call(this, schools.tDictInfo, urlParts);
            this.bodyTmpl = "TSchoolDictInfoBody";
        }
        DictInfoModel.prototype.doUpdate = function (completed) { completed(); };
        DictInfoModel.prototype.title = function () { return CSLocalize('0f6df5cdf72342198616971c1c7c8419', 'Bilingual Dictionary'); };
        return DictInfoModel;
    })(schools.Model);
    CourseMeta.DictInfoModel = DictInfoModel;
    var GrModel = (function (_super) {
        __extends(GrModel, _super);
        function GrModel() {
            _super.apply(this, arguments);
            this.prevNextVisible = true;
        }
        GrModel.prototype.grammContentClick = function () { Pager.navigateToHash(schools.createGrammUrl(schools.tGrammContent, "")); };
        return GrModel;
    })(CourseMeta.MetaModel);
    CourseMeta.GrModel = GrModel;
    var GrFolder = (function (_super) {
        __extends(GrFolder, _super);
        function GrFolder(urlParts) {
            _super.call(this, schools.tGrammFolder, urlParts);
            this.ignorePrevNext = true;
            this.bodyTmpl = "TGramm_Folder";
        }
        GrFolder.prototype.idxFrom = function () { return CSLocalize('fe6997da0e5e407288cda87e156820a0', 'Content'); };
        return GrFolder;
    })(GrModel);
    CourseMeta.GrFolder = GrFolder;
    var GrContent = (function (_super) {
        __extends(GrContent, _super);
        function GrContent(urlParts) {
            _super.call(this, schools.tGrammContent, urlParts);
            this.prevNextVisible = false;
            this.bodyTmpl = "TSchoolGrammContentBody";
        }
        GrContent.prototype.breadcrumbs = function () { return []; };
        GrContent.prototype.title = function () { return CourseMeta.actGrammar.title + ", " + CSLocalize('49dd8f327c6f484aaff1c9412690b970', 'content'); };
        return GrContent;
    })(GrModel);
    CourseMeta.GrContent = GrContent;
    var GrPage = (function (_super) {
        __extends(GrPage, _super);
        function GrPage(urlParts) {
            _super.call(this, schools.tGrammPage, urlParts);
            this.bodyTmpl = "TSchoolGrammBody";
        }
        GrPage.prototype.doUpdate = function (completed) {
            CourseMeta.lib.onChangeUrl(this.productUrl, this.persistence, this.url, function (loadedEx) {
                return CourseMeta.lib.doRefresh(function () {
                    return CourseMeta.lib.displayEx(loadedEx, null, function (loadedEx) { return DictConnector.initDict(CourseMeta.actGrammarModule.dict); });
                });
            });
        };
        //Prev x Next pro gramatiku
        GrPage.prototype.hasPrev = function () { return !!CourseMeta.actGrammarEx.prev; };
        GrPage.prototype.hasNext = function () { return !!CourseMeta.actGrammarEx.next; };
        GrPage.prototype.prevClick = function () { CourseMeta.gui.gotoData(CourseMeta.actGrammarEx.prev); };
        GrPage.prototype.nextClick = function () { CourseMeta.gui.gotoData(CourseMeta.actGrammarEx.next); };
        GrPage.prototype.idxFrom = function () { return (CourseMeta.actGrammarEx.idx + 1).toString() + "/" + CourseMeta.actGrammarExCount.toString() + ": " + CSLocalize('5592859748ca440d97b0e2bcdd1ff22b', 'content'); };
        GrPage.prototype.exerciseHtml = function () { return JsRenderTemplateEngine.render("c_gen", CourseMeta.actGrammarEx.page); };
        return GrPage;
    })(GrModel);
    CourseMeta.GrPage = GrPage;
    Pager.registerAppLocator(schools.appId, schools.tDictInfo, function (urlParts, completed) { return completed(new DictInfoModel(urlParts)); });
    Pager.registerAppLocator(schools.appId, schools.tGrammFolder, function (urlParts, completed) { return completed(new GrFolder(urlParts)); });
    Pager.registerAppLocator(schools.appId, schools.tGrammPage, function (urlParts, completed) { return completed(new GrPage(urlParts)); });
    Pager.registerAppLocator(schools.appId, schools.tGrammContent, function (urlParts, completed) { return completed(new GrContent(urlParts)); });
})(CourseMeta || (CourseMeta = {}));
