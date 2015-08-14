var JsRenderTemplateEngine;
(function (JsRenderTemplateEngine) {
    JsRenderTemplateEngine.tmpl = function (id) { return $.views.templates[id]; };
})(JsRenderTemplateEngine || (JsRenderTemplateEngine = {}));
var ko = { observable: function () { return { subscribe: function () { } }; } };
var Utils;
(function (Utils) {
    Utils.randomizeArray = function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = i;
            while (j == i)
                j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };
})(Utils || (Utils = {}));
$.views.helpers({
    tmpl: JsRenderTemplateEngine.tmpl,
    T: JsRenderTemplateEngine.tmpl,
});
var DesignDictSource;
(function (DesignDictSource) {
    function compileNewExerciseLow(data) {
        for (var id in data.templates)
            $.views.templates(id, data.templates[id]);
        //var pg = new Course.Page(data.page, { i: 1, s: { s: 0, ms: 0, needsHumanEval: false }, st: LMComLib.ExerciseStatus.Normal, bt: 0, et: 0, t: 0, Results: null });
        //var pg = new Course.Page(data.page, { done: false, beg: 0, end: 0, elapsed: 0, score: 0, result: null, designForceEval: false, testSkiped:false });
        var html;
        //pg.onBeforeRender(() => {
        //  html = $.views.templates["c_gen"].render(data.page);
        //});
        return html;
    }
    DesignDictSource.compileNewExerciseLow = compileNewExerciseLow;
    function compileNewExercise(data) {
        return compileNewExerciseLow(JSON.parse(data));
    }
    DesignDictSource.compileNewExercise = compileNewExercise;
})(DesignDictSource || (DesignDictSource = {}));
