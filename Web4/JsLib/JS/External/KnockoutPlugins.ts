/// <reference path="../../jsd/jquery.d.ts" />
/// <reference path="../../jsd/knockout.d.ts" />
/// <reference path="../../jsd/jsrender.d.ts" />
/// <reference path="../utils.ts" />
//https://github.com/WTK/ko.mustache.js/blob/master/ko.mustache.js
//http://www.knockmeout.net/2011/03/quick-tip-dynamically-changing.html
//interface KnockoutStatic {
//  mapping: KnockoutMapping;
//}

//interface KnockoutMapping {
//  fromJS(data, mapping, caller);
//}

interface KnockoutObservableArrayFunctions<T> {
  swap: (idx1: number, idx2: number) => void;
  move: (idx1: number, idx2: number) => void;
}

interface KnockoutBindingHandlers {
  itsMe: Object;
  enterEscape: Object;
  display: Object;
  destroyed: Object;
}
interface JQueryStatic {
  event: any;
}

ko.bindingHandlers.enterEscape = {
  init: function (element, valueAccessor, allBindingsAccessor: () => any, data: any) {
    $(element).keydown((ev: KeyboardEvent) => {
      var c = ev.keyCode;
      if (c != 13 && c != 27) return true;
      if (c == 13) $(ev.target).trigger('change');
      valueAccessor().call(this, data, ev);
      return false;
    });
  }
};

ko.observableArray.fn.swap = function (index1: number, index2: number) {
  this.valueWillMutate();
  var temp = this()[index1];
  this()[index1] = this()[index2];
  this()[index2] = temp;
  this.valueHasMutated();
}

ko.observableArray.fn.move = function (fromIdx:number, toIdx:number) {
  this.valueWillMutate();

  this.valueHasMutated();
}

ko.bindingHandlers['css2'] = ko.bindingHandlers.css;

//sance zaregistrovat HTML element k modelu
ko.bindingHandlers.itsMe = {
  init: function (element: HTMLElement, valueAccessor, allBindingsAccessor, viewModel, context) {
    var value: () => string = valueAccessor(); //metoda, pridana v ko_bindingHandlers_itsMe_register
    viewModel.registerElement(value(), element); //registrace elementu daneho jmena
  }
};
function ko_bindingHandlers_itsMe_register(obj: Object, names: Array<string>) {
  _.each(names, nm => { obj['itsMe' + nm] = () => nm; }); //prida metodu jmene itsMe<name> modelu
}

//display block x none
ko.bindingHandlers.display = {
  update: function (element, valueAccessor, allBindings) {
    var val: boolean = ko.unwrap(valueAccessor());
    $(element).css('display', val ? "" : "none");
  }
};

//odvazani elementu z DOM
ko.bindingHandlers.destroyed = {
  init: function (element: HTMLElement, valueAccessor, allBindingsAccessor, viewModel, context) {
    $(element).bind('destroyed', valueAccessor());
  }
};
$.event.special.destroyed = {
  remove: function (o) {
    if (o.handler) o.handler()
  }
}


module JsRenderTemplateEngine {
  var anyKo: any = ko;
  //umozni vyuzit nativni template engine, napr. pro phoneJS
  var nativeTemplate = ko.nativeTemplateEngine.instance; //new (<any>ko).nativeTemplateEngine(); 
  var old_makeTemplateSource: any = nativeTemplate['makeTemplateSource'];
  var old_renderTemplateSource: any = nativeTemplate['renderTemplateSource'];


  export function makeTemplateSource(template: string, templateDocument: any): string {
    if (typeof template != "string") return old_makeTemplateSource(template, templateDocument);
    return template;
  }
  export function renderTemplateSource(template: string, bindingContext: KnockoutBindingContext, options): Node[] {
    if (typeof template != "string") return old_renderTemplateSource(template, bindingContext, options);
    var data = bindingContext.$data;
    return renderAndParse(template, data);
  }
  export function render(templateId: string, data: Object): string {
    var res: string = tmpl(templateId).render(data);
    Logger.trace_jsrender(res);
    return res;
  }
  export function renderAndParse(templateId: string, data: Object): Node[] {
    return $.parseHTML(render(templateId, data), null, true); 
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
      if (!txt) { debugger; throw 'cannot read template ' + id; }
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

  export function createGlobalTemplate(templateId: string, model: Object): JQuery {
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
