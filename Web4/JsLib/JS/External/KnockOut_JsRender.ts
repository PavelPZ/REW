/// <reference path="../../jsd/jquery.d.ts" />
/// <reference path="../../jsd/knockout.d.ts" />
/// <reference path="../../jsd/jsrender.d.ts" />
/// <reference path="../utils.ts" />
//https://github.com/WTK/ko.mustache.js/blob/master/ko.mustache.js
//http://www.knockmeout.net/2011/03/quick-tip-dynamically-changing.html
module JsRenderTemplateEngine {
  export function makeTemplateSource(templateName: string, templateDocument: any): string {
    return templateName;
  }
  export function renderTemplateSource(templateText: string, bindingContext: KnockoutBindingContext, options) {
    var data = bindingContext.$data;
    return renderAndParse(templateText, data);
  }
  export function render(templateId: string, data: Object): string {
    var res = tmpl(templateId).render(data);
    Logger.trace_jsrender(res);
    return res;
  }
  export function renderAndParse(templateId: string, data: Object): Node[] {
    return anyKo.utils.parseHtmlFragment(render(templateId, data));
  }
  export var allowTemplateRewriting: boolean = false;
  export var version: string = '0.9.0';
  var templCache: JsTemplate[] = [];
  export function tmpl(id: string): any {
    id = id.toLowerCase();
    var tmpl = templCache[id];
    if (tmpl == null) {
      var t = $('#' + id);
      var txt = t.html();
      if (!txt) alert("cannot read template " + id);
      t.remove();
      try {
        tmpl = $.templates(txt);
      } catch (msg) {
        alert("cannot compile template " + id);
        throw msg;
      }
      templCache[id] = tmpl;
    }
    return tmpl;
  }

  export function createGlobalTemplate(templateId: string, model: Object):JQuery  {
    var els: Node[] = JsRenderTemplateEngine.renderAndParse(templateId, model);
    var res = $(_.find(els, (n: Node) => n.nodeType == 1 /*Node.ELEMENT_NODE*/));
    var res = templateToJQuery(templateId, model);
    res.insertBefore($('#root'));
    return res;
  }

  export function templateToJQuery(templateId: string, model: Object): JQuery {
    var els: Node[] = JsRenderTemplateEngine.renderAndParse(templateId, model);
    return $(_.find(els, (n: Node) => n.nodeType == 1 /*Node.ELEMENT_NODE*/));
  }


  var anyKo: any = ko;
  anyKo.setTemplateEngine(ko.utils.extend(new anyKo.templateEngine(), JsRenderTemplateEngine));

  $.views.helpers({
    tmpl: JsRenderTemplateEngine.tmpl,
    T: JsRenderTemplateEngine.tmpl,
  });
  $.views._err = (e) => {
    debugger;
    return e.message + e.stack;
  }

}

//xx/#DEBUG
module Logger {
  export function trace_jsrender(msg: string): void {
    Logger.trace("jsrender", msg);
  }
}
//xx/#ENDDEBUG
//var jsrender_noop = null;
