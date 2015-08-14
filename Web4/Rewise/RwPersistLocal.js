/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
/// <reference path="GenRew.ts" />
/// <reference path="../JsLib/js/external/ClosureLib.ts" />
/// <reference path="../JsLib/js/external/RJSON.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/js/utils.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="Model.ts" />
var RwPersistLocal;
(function (RwPersistLocal) {
    //****************** InitMyRewise - globalni info o uzivatelove rewise
    function InitMyRewise(newUserLoc, completed) {
    }
    RwPersistLocal.InitMyRewise = InitMyRewise;

    //****************** Read all lines
    function LocSrcCmd(loc, completed) {
    }
    RwPersistLocal.LocSrcCmd = LocSrcCmd;

    //****************** MyFacts
    function LoadMyFact(completed) {
    }
    RwPersistLocal.LoadMyFact = LoadMyFact;

    //****************** Add rewise
    function AddRewiseCmd(line, loc, completed) {
    }
    RwPersistLocal.AddRewiseCmd = AddRewiseCmd;

    //****************** Delete rewise
    function DelRewiseCmd(line, loc, completed) {
    }
    RwPersistLocal.DelRewiseCmd = DelRewiseCmd;

    //****************** Change Native Lang
    function SaveMyOptionsCmd(completed) {
    }
    RwPersistLocal.SaveMyOptionsCmd = SaveMyOptionsCmd;

    //****************** Add Lesson
    function AddLessonCmd(bookName, lessonId, completed) {
    }
    RwPersistLocal.AddLessonCmd = AddLessonCmd;

    //****************** Delete Lesson
    function DelLessonCmd(lessonId, completed) {
    }
    RwPersistLocal.DelLessonCmd = DelLessonCmd;

    //****************** Read Lesson
    function ReadLessonCmd(bookName, lessonId, completed) {
    }
    RwPersistLocal.ReadLessonCmd = ReadLessonCmd;

    //****************** SaveFactCmd
    function SaveFactCmd(fact, completed) {
    }
    RwPersistLocal.SaveFactCmd = SaveFactCmd;
})(RwPersistLocal || (RwPersistLocal = {}));
