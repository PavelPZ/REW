module ViewBase {

  export function viewLocator(modelName: string): string {
    modelIdToScriptIdInit();
    var res = modelIdToScriptId[modelName];
    if (!res) throw "ViewBase.ts ModelBase.viewLocator: Missing view " + modelName + " in Rewise\DefaultMobile.aspx.cs";
    return res;
  }

  function modelIdToScriptIdInit(): void {
    if (modelIdToScriptId != null) return;
    modelIdToScriptId = [];
    $('script[data-for]').each((idx, el) => {
      var th = $(el);
      var fors = th.attr('data-for').toLowerCase().split(",");
      _.each(fors, (f: string) => modelIdToScriptId[f + "Model".toLowerCase()] = th.attr('id'))
    });
  } var modelIdToScriptId: string[];

  
  export var init = function () {
    Logger.traceMsg('ViewBase.initBootStrapApp');
    if (!location.hash || location.hash.length < 3) location.hash = '/old/school/schoolmymodel/-1///';
    //$(window).hashchange(() => Pager.loadPageHash(location.hash));
      //Pager.locatePageFromHash(location.hash, (page: Pager.Page) => {
      //  if (page == null || page == Pager.ignorePage) return;
      //  Pager.loadPage(page);
      //});
    //});
    //$(window).hashchange();
  }

}

