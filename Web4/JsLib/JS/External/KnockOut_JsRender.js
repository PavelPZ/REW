/// <reference path="../../jsd/jquery.d.ts" />
/// <reference path="../../jsd/knockout.d.ts" />
/// <reference path="../../jsd/jsrender.d.ts" />
/// <reference path="../utils.ts" />
//https://github.com/WTK/ko.mustache.js/blob/master/ko.mustache.js
//http://www.knockmeout.net/2011/03/quick-tip-dynamically-changing.html
var JsRenderTemplateEngine;
(function (JsRenderTemplateEngine) {
    function makeTemplateSource(templateName, templateDocument) {
        return templateName;
    }
    JsRenderTemplateEngine.makeTemplateSource = makeTemplateSource;
    function renderTemplateSource(templateText, bindingContext, options) {
        var data = bindingContext.$data;
        return renderAndParse(templateText, data);
    }
    JsRenderTemplateEngine.renderTemplateSource = renderTemplateSource;
    function render(templateId, data) {
        var res = tmpl(templateId).render(data);
        Logger.trace_jsrender(res);
        return res;
    }
    JsRenderTemplateEngine.render = render;
    function renderAndParse(templateId, data) {
        return anyKo.utils.parseHtmlFragment(render(templateId, data));
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
            if (!txt)
                alert("cannot read template " + id);
            t.remove();
            try  {
                tmpl = $.templates(txt);
            } catch (msg) {
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
        var res = $(_.find(els, function (n) {
            return n.nodeType == 1;
        } /*Node.ELEMENT_NODE*/ ));
        var res = templateToJQuery(templateId, model);
        res.insertBefore($('#root'));
        return res;
    }
    JsRenderTemplateEngine.createGlobalTemplate = createGlobalTemplate;

    function templateToJQuery(templateId, model) {
        var els = JsRenderTemplateEngine.renderAndParse(templateId, model);
        return $(_.find(els, function (n) {
            return n.nodeType == 1;
        } /*Node.ELEMENT_NODE*/ ));
    }
    JsRenderTemplateEngine.templateToJQuery = templateToJQuery;

    var anyKo = ko;
    anyKo.setTemplateEngine(ko.utils.extend(new anyKo.templateEngine(), JsRenderTemplateEngine));

    $.views.helpers({
        tmpl: JsRenderTemplateEngine.tmpl,
        T: JsRenderTemplateEngine.tmpl
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
