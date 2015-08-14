/// <reference path="../jslib/js/GenLMComLib.ts" />
var CourseModel;
(function (CourseModel) {
    (function (IconIds) {
        IconIds[IconIds["no"] = 0] = "no";
        IconIds[IconIds["a"] = 1] = "a";
        IconIds[IconIds["b"] = 2] = "b";
        IconIds[IconIds["c"] = 3] = "c";
        IconIds[IconIds["d"] = 4] = "d";
        IconIds[IconIds["e"] = 5] = "e";
        IconIds[IconIds["f"] = 6] = "f";
    })(CourseModel.IconIds || (CourseModel.IconIds = {}));
    var IconIds = CourseModel.IconIds;

    (function (ListTemplates) {
        ListTemplates[ListTemplates["no"] = 0] = "no";
        ListTemplates[ListTemplates["Paragraph"] = 1] = "Paragraph";
    })(CourseModel.ListTemplates || (CourseModel.ListTemplates = {}));
    var ListTemplates = CourseModel.ListTemplates;

    (function (CheckItemTemplates) {
        CheckItemTemplates[CheckItemTemplates["TrueFalse"] = 0] = "TrueFalse";
        CheckItemTemplates[CheckItemTemplates["YesNo"] = 1] = "YesNo";
    })(CourseModel.CheckItemTemplates || (CourseModel.CheckItemTemplates = {}));
    var CheckItemTemplates = CourseModel.CheckItemTemplates;

    (function (SingleChoiceTemplates) {
        SingleChoiceTemplates[SingleChoiceTemplates["WordSelection"] = 0] = "WordSelection";
    })(CourseModel.SingleChoiceTemplates || (CourseModel.SingleChoiceTemplates = {}));
    var SingleChoiceTemplates = CourseModel.SingleChoiceTemplates;

    (function (PlayType) {
        PlayType[PlayType["web"] = 0] = "web";
        PlayType[PlayType["isolatedStorage"] = 1] = "isolatedStorage";
    })(CourseModel.PlayType || (CourseModel.PlayType = {}));
    var PlayType = CourseModel.PlayType;

    CourseModel.Exercise_Type = 'CourseModel.Exercise';

    CourseModel.Text_Type = 'CourseModel.Text';

    CourseModel.CoursePage_Type = 'CourseModel.CoursePage';

    CourseModel.List_Type = 'CourseModel.List';

    CourseModel.Headered_Type = 'CourseModel.Headered';

    CourseModel.MultiExercise_Type = 'CourseModel.MultiExercise';

    CourseModel.EvalExercise_Type = 'CourseModel.EvalExercise';

    CourseModel.RoleId_Type = 'CourseModel.RoleId';

    CourseModel.PageResult_Type = 'CourseModel.PageResult';

    CourseModel.Result_Type = 'CourseModel.Result';

    CourseModel.NeedsEvalExercise_Type = 'CourseModel.NeedsEvalExercise';

    CourseModel.Score_Type = 'CourseModel.Score';

    CourseModel.Words_Type = 'CourseModel.Words';

    CourseModel.CheckItemResult_Type = 'CourseModel.CheckItemResult';

    CourseModel.GapFill_Type = 'CourseModel.GapFill';

    CourseModel.GapFillResult_Type = 'CourseModel.GapFillResult';

    CourseModel.PairingItem_Type = 'CourseModel.PairingItem';

    CourseModel.Pairing_Type = 'CourseModel.Pairing';

    CourseModel.PairingResult_Type = 'CourseModel.PairingResult';

    CourseModel.SingleChoice_Type = 'CourseModel.SingleChoice';

    CourseModel.SingleChoiceResult_Type = 'CourseModel.SingleChoiceResult';

    CourseModel.DummyResult_Type = 'CourseModel.DummyResult';

    CourseModel.Writing_Type = 'CourseModel.Writing';

    CourseModel.WritingResult_Type = 'CourseModel.WritingResult';

    CourseModel.Speaking_Type = 'CourseModel.Speaking';

    CourseModel.SpeakingResult_Type = 'CourseModel.SpeakingResult';

    CourseModel.ReplicaLike_Type = 'CourseModel.ReplicaLike';

    CourseModel.NeedsEvalResult_Type = 'CourseModel.NeedsEvalResult';
})(CourseModel || (CourseModel = {}));
