/// <reference path="../../jsd/jquery.d.ts" />
/// <reference path="../../jsd/knockout.d.ts" />
/// <reference path="../../jsd/jsrender.d.ts" />
/// <reference path="../utils.ts" />
//https://github.com/WTK/ko.mustache.js/blob/master/ko.mustache.js
//http://www.knockmeout.net/2011/03/quick-tip-dynamically-changing.html
//interface KnockoutStatic {
//  mapping: KnockoutMapping;
//}
ko.bindingHandlers.enterEscape = {
    init: function (element, valueAccessor, allBindingsAccessor, data) {
        var _this = this;
        $(element).keydown(function (ev) {
            var c = ev.keyCode;
            if (c != 13 && c != 27)
                return true;
            if (c == 13)
                $(ev.target).trigger('change');
            valueAccessor().call(_this, data, ev);
            return false;
        });
    }
};
ko.observableArray.fn.swap = function (index1, index2) {
    this.valueWillMutate();
    var temp = this()[index1];
    this()[index1] = this()[index2];
    this()[index2] = temp;
    this.valueHasMutated();
};
ko.observableArray.fn.move = function (fromIdx, toIdx) {
    this.valueWillMutate();
    this.valueHasMutated();
};
ko.bindingHandlers['css2'] = ko.bindingHandlers.css;
//sance zaregistrovat HTML element k modelu
ko.bindingHandlers.itsMe = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
        var value = valueAccessor(); //metoda, pridana v ko_bindingHandlers_itsMe_register
        viewModel.registerElement(value(), element); //registrace elementu daneho jmena
    }
};
function ko_bindingHandlers_itsMe_register(obj, names) {
    _.each(names, function (nm) {
        obj['itsMe' + nm] = function () { return nm; };
    }); //prida metodu jmene itsMe<name> modelu
}
//display block x none
ko.bindingHandlers.display = {
    update: function (element, valueAccessor, allBindings) {
        var val = ko.unwrap(valueAccessor());
        $(element).css('display', val ? "" : "none");
    }
};
//odvazani elementu z DOM
ko.bindingHandlers.destroyed = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
        $(element).bind('destroyed', valueAccessor());
    }
};
$.event.special.destroyed = {
    remove: function (o) {
        if (o.handler)
            o.handler();
    }
};
var JsRenderTemplateEngine;
(function (JsRenderTemplateEngine) {
    var anyKo = ko;
    //umozni vyuzit nativni template engine, napr. pro phoneJS
    var nativeTemplate = ko.nativeTemplateEngine.instance; //new (<any>ko).nativeTemplateEngine(); 
    var old_makeTemplateSource = nativeTemplate['makeTemplateSource'];
    var old_renderTemplateSource = nativeTemplate['renderTemplateSource'];
    function makeTemplateSource(template, templateDocument) {
        if (typeof template != "string")
            return old_makeTemplateSource(template, templateDocument);
        return template;
    }
    JsRenderTemplateEngine.makeTemplateSource = makeTemplateSource;
    function renderTemplateSource(template, bindingContext, options) {
        if (typeof template != "string")
            return old_renderTemplateSource(template, bindingContext, options);
        var data = bindingContext.$data;
        return renderAndParse(template, data);
    }
    JsRenderTemplateEngine.renderTemplateSource = renderTemplateSource;
    function render(templateId, data) {
        var res = tmpl(templateId).render(data);
        Logger.trace_jsrender(res);
        return res;
    }
    JsRenderTemplateEngine.render = render;
    function renderAndParse(templateId, data) {
        return $.parseHTML(render(templateId, data), null, true);
    }
    JsRenderTemplateEngine.renderAndParse = renderAndParse;
    JsRenderTemplateEngine.allowTemplateRewriting = false;
    JsRenderTemplateEngine.version = '0.9.0';
    var templCache = [];
    function tmpl(id) {
        id = id.toLowerCase();
        var tmpl = templCache[id];
        if (tmpl == null) {
            var t = $('#' + id);
            var txt = t.html();
            if (!txt) {
                debugger;
                throw 'cannot read template ' + id;
            }
            t.remove();
            try {
                tmpl = $.templates(txt);
            }
            catch (msg) {
                alert("cannot compile template " + id);
                throw msg;
            }
            templCache[id] = tmpl;
        }
        return tmpl;
    }
    JsRenderTemplateEngine.tmpl = tmpl;
    function createGlobalTemplate(templateId, model) {
        var els = JsRenderTemplateEngine.renderAndParse(templateId, model);
        var res = $(_.find(els, function (n) { return n.nodeType == 1; } /*Node.ELEMENT_NODE*/));
        var res = templateToJQuery(templateId, model);
        res.insertBefore($('#root'));
        return res;
    }
    JsRenderTemplateEngine.createGlobalTemplate = createGlobalTemplate;
    function templateToJQuery(templateId, model) {
        var els = JsRenderTemplateEngine.renderAndParse(templateId, model);
        return $(_.find(els, function (n) { return n.nodeType == 1; } /*Node.ELEMENT_NODE*/));
    }
    JsRenderTemplateEngine.templateToJQuery = templateToJQuery;
    anyKo.setTemplateEngine(ko.utils.extend(new anyKo.templateEngine(), JsRenderTemplateEngine));
    $.views.helpers({
        tmpl: JsRenderTemplateEngine.tmpl,
        T: JsRenderTemplateEngine.tmpl,
    });
    $.views._err = function (e) {
        debugger;
        return e.message + e.stack;
    };
})(JsRenderTemplateEngine || (JsRenderTemplateEngine = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_jsrender(msg) {
        Logger.trace("jsrender", msg);
    }
    Logger.trace_jsrender = trace_jsrender;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var jsrender_noop = null;
