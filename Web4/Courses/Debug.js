/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/utils.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="GenCourseModel.ts" />
/// <reference path="../JsLib/JS/External/KnockOut_JsRender.ts" />
var courseDebug;
(function (courseDebug) {
    function run() {
        $.getJSON('page.json', function (data) {
            return $("#result").html($("#c_gen").render(data));
        });
    }
    courseDebug.run = run;
})(courseDebug || (courseDebug = {}));
