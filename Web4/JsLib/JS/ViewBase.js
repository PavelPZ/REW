var ViewBase;
(function (ViewBase) {
    function viewLocator(modelName) {
        modelIdToScriptIdInit();
        var res = modelIdToScriptId[modelName];
        if (!res)
            throw "ViewBase.ts ModelBase.viewLocator: Missing view " + modelName + " in Rewise\DefaultMobile.aspx.cs";
        return res;
    }
    ViewBase.viewLocator = viewLocator;
    function modelIdToScriptIdInit() {
        if (modelIdToScriptId != null)
            return;
        modelIdToScriptId = [];
        $('script[data-for]').each(function (idx, el) {
            var th = $(el);
            var fors = th.attr('data-for').toLowerCase().split(",");
            _.each(fors, function (f) { return modelIdToScriptId[f + "Model".toLowerCase()] = th.attr('id'); });
        });
    }
    var modelIdToScriptId;
    ViewBase.init = function () {
        Logger.traceMsg('ViewBase.initBootStrapApp');
        //if (!location.hash || location.hash.length < 3) location.hash = '/old/school/schoolmymodel/-1///';
        //$(window).hashchange(() => Pager.loadPageHash(location.hash));
        //Pager.locatePageFromHash(location.hash, (page: Pager.Page) => {
        //  if (page == null || page == Pager.ignorePage) return;
        //  Pager.loadPage(page);
        //});
        //});
        //$(window).hashchange();
    };
})(ViewBase || (ViewBase = {}));
