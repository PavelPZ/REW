/// <reference path="../jslib/js/GenLMComLib.ts" />
/// <reference path="GenCourse.ts" />
/// <reference path="GenSchools.ts" />
/// <reference path="../courses/GenCourseModel.ts" />
var schools;
(function (schools) {
    //****************** informace o kurzech a testech
    (function (PretestMode) {
        PretestMode[PretestMode["first"] = 0] = "first";
        PretestMode[PretestMode["testHome"] = 1] = "testHome";
        PretestMode[PretestMode["testForm"] = 2] = "testForm";
        PretestMode[PretestMode["testTest"] = 3] = "testTest";
        PretestMode[PretestMode["testTestFinished"] = 4] = "testTestFinished";
        PretestMode[PretestMode["tested"] = 5] = "tested"; //test dobehl, je nastaven zacatek kurzu
    })(schools.PretestMode || (schools.PretestMode = {}));
    var PretestMode = schools.PretestMode;
    ;
    ;
})(schools || (schools = {}));
