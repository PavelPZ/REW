/// <reference path="../jsd/jquery.d.ts" />
//http://www.jsviews.com/#jsrender
//http://spape.github.com/jsrender/
//http://msdn.microsoft.com/en-us/magazine/hh882454.aspx
//http://msdn.microsoft.com/en-us/magazine/hh975379.aspx
//http://borismoore.github.com/jsrender/demos/
interface JQuery {
  render(mix: Object): string;
}
interface JQueryStatic {
  templates(name: string, tmpl: string): JsTemplate;
  templates(name: string): JsTemplate;
  render: JsTemplate[];
  views: JsView;
}
declare var jsviews: JsView;
interface JsTemplate {
  render(mix: Object): string;
  render(mix: Object[]): string;
}
interface JsView {
  helpers(mix: Object): void;
  tags(mix: Object): void;
  _err: (e) => string;
  templates(name: string, tmpl: string): JsTemplate;
  templates(name: string): JsTemplate;
  settings;
}
