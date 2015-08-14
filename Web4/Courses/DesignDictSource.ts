module JsRenderTemplateEngine { JsRenderTemplateEngine.tmpl = id => $.views.templates[id]; }

var ko = <KnockoutStatic><any>{ observable: function () { return { subscribe: () => { } } } };

module Utils {
  Utils.randomizeArray = (array: Array<any>): Array<any> => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = i;
      while (j == i) j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
}

$.views.helpers({
  tmpl: JsRenderTemplateEngine.tmpl,
  T: JsRenderTemplateEngine.tmpl,
});

module DesignDictSource {

  export interface compileData {
    page: CourseModel.body;
    templates: { [id: string]: string; };
  }

  export function compileNewExerciseLow(data: compileData): string {
    for (var id in data.templates) $.views.templates(id, data.templates[id]);
    //var pg = new Course.Page(data.page, { i: 1, s: { s: 0, ms: 0, needsHumanEval: false }, st: LMComLib.ExerciseStatus.Normal, bt: 0, et: 0, t: 0, Results: null });
    //var pg = new Course.Page(data.page, { done: false, beg: 0, end: 0, elapsed: 0, score: 0, result: null, designForceEval: false, testSkiped:false });
    var html: string;
    //pg.onBeforeRender(() => {
    //  html = $.views.templates["c_gen"].render(data.page);
    //});
    return html;
  }
  export function compileNewExercise(data: string): string {
    return compileNewExerciseLow(JSON.parse(data));
  }
}