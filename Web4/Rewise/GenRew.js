/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
var Rew;
(function (Rew) {
    (function (FactStatus) {
        FactStatus[FactStatus["no"] = 0] = "no";
        FactStatus[FactStatus["toLearn"] = 1] = "toLearn";
        FactStatus[FactStatus["removed"] = 2] = "removed";
        FactStatus[FactStatus["deleted"] = 3] = "deleted";
    })(Rew.FactStatus || (Rew.FactStatus = {}));
    var FactStatus = Rew.FactStatus;

    Rew.AddLessonCmd_Type = 'Rew.AddLessonCmd';
    function AddLessonCmd_Create(UserId, DbId, BookName, Line, Loc) {
        return { UserId: UserId, DbId: DbId, BookName: BookName, Line: Line, Loc: Loc };
    }
    Rew.AddLessonCmd_Create = AddLessonCmd_Create;

    Rew.AddRewiseCmd_Type = 'Rew.AddRewiseCmd';
    function AddRewiseCmd_Create(UserId, Line, Loc) {
        return { UserId: UserId, Line: Line, Loc: Loc };
    }
    Rew.AddRewiseCmd_Create = AddRewiseCmd_Create;

    Rew.DelLessonCmd_Type = 'Rew.DelLessonCmd';
    function DelLessonCmd_Create(UserId, DbId, Line, Loc) {
        return { UserId: UserId, DbId: DbId, Line: Line, Loc: Loc };
    }
    Rew.DelLessonCmd_Create = DelLessonCmd_Create;

    Rew.DelRewiseCmd_Type = 'Rew.DelRewiseCmd';
    function DelRewiseCmd_Create(UserId, Line, Loc) {
        return { UserId: UserId, Line: Line, Loc: Loc };
    }
    Rew.DelRewiseCmd_Create = DelRewiseCmd_Create;

    Rew.LangToLearn_Type = 'Rew.LangToLearn';
    function LangToLearn_Create(VocabularyEmpty, Line, Loc) {
        return { VocabularyEmpty: VocabularyEmpty, Line: Line, Loc: Loc };
    }
    Rew.LangToLearn_Create = LangToLearn_Create;

    Rew.LocSrcCmd_Type = 'Rew.LocSrcCmd';
    function LocSrcCmd_Create(Loc, Crc) {
        return { Loc: Loc, Crc: Crc };
    }
    Rew.LocSrcCmd_Create = LocSrcCmd_Create;

    Rew.MyFactCmd_Type = 'Rew.MyFactCmd';
    function MyFactCmd_Create(UserId, Line, Loc) {
        return { UserId: UserId, Line: Line, Loc: Loc };
    }
    Rew.MyFactCmd_Create = MyFactCmd_Create;

    Rew.MyLineOption_Type = 'Rew.MyLineOption';
    function MyLineOption_Create(Line, Loc, BookIds) {
        return { Line: Line, Loc: Loc, BookIds: BookIds };
    }
    Rew.MyLineOption_Create = MyLineOption_Create;

    Rew.MyRewise_Type = 'Rew.MyRewise';
    function MyRewise_Create(LMComId, PCSignature, Options, UserId, ToLearns) {
        return { LMComId: LMComId, PCSignature: PCSignature, Options: Options, UserId: UserId, ToLearns: ToLearns };
    }
    Rew.MyRewise_Create = MyRewise_Create;

    Rew.MyRewiseCmd_Type = 'Rew.MyRewiseCmd';
    function MyRewiseCmd_Create(LMComId, PCSignature, DefaultOptionsJSON) {
        return { LMComId: LMComId, PCSignature: PCSignature, DefaultOptionsJSON: DefaultOptionsJSON };
    }
    Rew.MyRewiseCmd_Create = MyRewiseCmd_Create;

    Rew.MyRewiseOptions_Type = 'Rew.MyRewiseOptions';
    function MyRewiseOptions_Create(ActLoc, NativeLang, Lines) {
        return { ActLoc: ActLoc, NativeLang: NativeLang, Lines: Lines };
    }
    Rew.MyRewiseOptions_Create = MyRewiseOptions_Create;

    Rew.ReadLessonCmd_Type = 'Rew.ReadLessonCmd';
    function ReadLessonCmd_Create(DbId, BookName, Loc) {
        return { DbId: DbId, BookName: BookName, Loc: Loc };
    }
    Rew.ReadLessonCmd_Create = ReadLessonCmd_Create;

    Rew.SaveFactCmd_Type = 'Rew.SaveFactCmd';
    function SaveFactCmd_Create(FactId, FactJSON) {
        return { FactId: FactId, FactJSON: FactJSON };
    }
    Rew.SaveFactCmd_Create = SaveFactCmd_Create;

    Rew.SetMyOptionsCmd_Type = 'Rew.SetMyOptionsCmd';
    function SetMyOptionsCmd_Create(UserId, OptionsJSON) {
        return { UserId: UserId, OptionsJSON: OptionsJSON };
    }
    Rew.SetMyOptionsCmd_Create = SetMyOptionsCmd_Create;

    Rew.LangTitles = {
        '34': '\u010Cesky',
        '2': 'Deutsch',
        '1': 'English',
        '73': 'Slovensky',
        '3': '\u0415spa\u00F1ol',
        '7': '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
        '4': 'Italiano',
        '5': 'Fran\u00E7ais',
        '66': 'Polski',
        '44': 'Magyar',
        '41': '\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC',
        '74': 'Slovenski',
        '36': 'Nederlands',
        '80': 'T\u00FCrk\u00E7e',
        '67': 'Portugu\u00EAs',
        '84': 'Ti\u1EBFng Vi\u1EC7t',
        '81': '\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430',
        '70': 'Rom\u00E2n\u0103',
        '33': 'Hrvatski',
        '29': '\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438',
        '88': 'Bosenstina, common.cs',
        '31': 'Catal\u00E0',
        '35': 'Dansk',
        '38': 'Suomi',
        '62': 'Norsk (bokm\u00E5l)',
        '76': 'Svenska',
        '50': '\u65E5\u672C\u8A9E',
        '53': '\uD55C\uAD6D\uC5B4',
        '22': '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
        '43': '\u05E2\u05D1\u05E8\u05D9\u05EA\u200F',
        '77': '\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22',
        '54': 'Latvie\u0161u\u200F',
        '55': 'Lietuvi\u0173',
        '68': 'Portugu\u00EAs brasileiro',
        '30': '\u7CB5\u8A9E',
        '45': '\u6587\u8A00',
        '21': 'Shqip'
    };
})(Rew || (Rew = {}));
