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
var RwPersist;
(function (RwPersist) {
    //****************** InitMyRewise - globalni info o uzivatelove rewise
    function InitMyRewise(newUserLoc, completed) {
        var oldMyRewise = ReadMyRewise();
        var PCSign = oldMyRewise != null && oldMyRewise.LMComId == RwSt.LMComUserId ? oldMyRewise.PCSignature : new Date().getTime().toString();
        callServer(Rew.MyRewiseCmd_Type, Rew.MyRewiseCmd_Create(RwSt.LMComUserId, PCSign, JSON.stringify(Rew.MyRewiseOptions_Create(newUserLoc, newUserLoc, null))), function (res) {
            var rd = JSON.parse(res);
            if (rd.SignatureOK)
                completed(oldMyRewise); //signature odpovida
            else {
                var myRew = Rew.MyRewise_Create(RwSt.LMComUserId, PCSign, JSON.parse(rd.OptionsJSON), rd.UserId, rd.ToLearns);
                WriteMyRewise(myRew);
                DelAllMyFacts(); //vymaz vsechny MyFacts (pro vsechny Lines a Locs)
                completed(myRew);
            }
        });
    }
    RwPersist.InitMyRewise = InitMyRewise;

    //****************** Read all lines
    function LocSrcCmd(loc, completed) {
        var crc = GetLocSrc_Crc(loc);
        callServer(Rew.LocSrcCmd_Type, Rew.LocSrcCmd_Create(loc, crc), function (res) {
            if (res == null || res == '')
                res = GetLocSrc_Data(loc); //version OK, nacti z local storage

            //TODO else SetLocSrc(loc, res, parseInt(xhr.getResponseHeader("version")));
            completed(RJSON.unpack(JSON.parse(res)));
        });
    }
    RwPersist.LocSrcCmd = LocSrcCmd;

    //****************** MyFacts
    function LoadMyFact(completed) {
        if (RwDb.InitStorage())
            completed();
        else
            callServer(Rew.MyFactCmd_Type, Rew.MyFactCmd_Create(RwSt.MyRewise.UserId, RwSt.ToLearn.Line, RwSt.ToLearn.Loc), function (res) {
                RwDb.InitServer(JSON.parse(res));
                completed();
            });
    }
    RwPersist.LoadMyFact = LoadMyFact;

    //****************** Add rewise
    function AddRewiseCmd(line, loc, completed) {
        if (_.any(RwSt.MyRewise.ToLearns, function (l) {
            return l.Line == line && l.Loc == loc;
        })) {
            completed();
            return;
        }
        callServer(Rew.AddRewiseCmd_Type, Rew.AddRewiseCmd_Create(RwSt.MyRewise.UserId, line, loc), function (res) {
            LocSrcCmd(loc, function (data) {
                RwSt.Data = data;

                //pridej do ToLearns
                if (RwSt.MyRewise.ToLearns == null)
                    RwSt.MyRewise.ToLearns = [];
                RwSt.MyRewise.ToLearns.push(Rew.LangToLearn_Create(true, line, loc));

                //difotni hodnota seznamu knih na Vocabulary home
                var lineSrc = _.find(data.Lines, function (l) {
                    return l.Line == line;
                });
                var groupIds = _.map(_.filter(lineSrc.Groups, function (g) {
                    return g.IsDefault;
                }), function (g) {
                    return g.Id;
                });

                //dej do line option:
                if (RwSt.MyRewise.Options.Lines == null)
                    RwSt.MyRewise.Options.Lines = [];
                RwSt.MyRewise.Options.Lines.push(Rew.MyLineOption_Create(line, loc, groupIds));

                //save all
                SaveMyOptionsCmd(completed);
            });
        });
    }
    RwPersist.AddRewiseCmd = AddRewiseCmd;

    //****************** Delete rewise
    function DelRewiseCmd(line, loc, completed) {
        if (!_.any(RwSt.MyRewise.ToLearns, function (l) {
            return l.Line == line && l.Loc == loc;
        })) {
            completed();
            return;
        }
        callServer(Rew.DelRewiseCmd_Type, Rew.DelRewiseCmd_Create(RwSt.MyRewise.UserId, line, loc), function (res) {
            RwSt.MyRewise.ToLearns = _.reject(RwSt.MyRewise.ToLearns, function (l) {
                return l.Line == line && l.Loc == loc;
            });
            RwSt.MyRewise.Options.Lines = _.reject(RwSt.MyRewise.Options.Lines, function (l) {
                return l.Line == line && l.Loc == loc;
            });
            DelMyFacts(line, loc);
            SaveMyOptionsCmd(completed);
        });
    }
    RwPersist.DelRewiseCmd = DelRewiseCmd;

    //****************** Change Native Lang
    function SaveMyOptionsCmd(completed) {
        callServer(Rew.SetMyOptionsCmd_Type, Rew.SetMyOptionsCmd_Create(RwSt.MyRewise.UserId, JSON.stringify(RwSt.MyRewise.Options)), function (res) {
            WriteMyRewise(RwSt.MyRewise);
            if (completed != null)
                completed();
        });
    }
    RwPersist.SaveMyOptionsCmd = SaveMyOptionsCmd;

    //****************** Add Lesson
    function AddLessonCmd(bookName, lessonId, completed) {
        if (_.has(RwDb.MyLessons, lessonId.toString())) {
            completed();
            return;
        }
        callServer(Rew.AddLessonCmd_Type, Rew.AddLessonCmd_Create(RwSt.MyRewise.UserId, lessonId, bookName, RwSt.ToLearn.Line, RwSt.ToLearn.Loc), function (res) {
            RwDb.AddLesson(lessonId, JSON.parse(res));
            completed();
        });
    }
    RwPersist.AddLessonCmd = AddLessonCmd;

    //****************** Delete Lesson
    function DelLessonCmd(lessonId, completed) {
        if (!_.has(RwDb.MyLessons, lessonId.toString())) {
            completed();
            return;
        }
        callServer(Rew.DelLessonCmd_Type, Rew.DelLessonCmd_Create(RwSt.MyRewise.UserId, lessonId, RwSt.ToLearn.Line, RwSt.ToLearn.Loc), function (res) {
            RwDb.DelLesson(lessonId);
            completed();
        });
    }
    RwPersist.DelLessonCmd = DelLessonCmd;

    //****************** Read Lesson
    function ReadLessonCmd(bookName, lessonId, completed) {
        callServer(Rew.ReadLessonCmd_Type, Rew.ReadLessonCmd_Create(lessonId, bookName, RwSt.ToLearn.Loc), function (res) {
            return completed(RJSON.unpack(JSON.parse(res)));
        });
    }
    RwPersist.ReadLessonCmd = ReadLessonCmd;

    //****************** SaveFactCmd
    function SaveFactCmd(fact, completed) {
        callServer(Rew.SaveFactCmd_Type, Rew.SaveFactCmd_Create(fact.FactId, JSON.stringify(fact)), function (res) {
            RwDb.FactModified(fact);
            if (completed != null)
                completed();
        });
    }
    RwPersist.SaveFactCmd = SaveFactCmd;

    /************************* Srorage API ******************************/
    function ReadMyRewise() {
        var mr = localStorage.getItem("myRewise");
        return mr == null ? null : JSON.parse(mr);
    }

    function WriteMyRewise(data) {
        localStorage.setItem("myRewise", JSON.stringify(data));
    }

    function DelAllMyFacts() {
        var toDel = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf("myFacts_") == 0 || key.indexOf("myFactsNew_") == 0)
                toDel.push(key);
        }
        _.each(toDel, function (key) {
            return localStorage.removeItem(key);
        });
    }
    function DelMyFacts(line, loc) {
        localStorage.removeItem("myFacts_" + line.toString() + "_" + loc.toString());
        localStorage.removeItem("myFactsNew_" + line.toString() + "_" + loc.toString());
    }
    function GetLocSrc_Crc(loc) {
        var s = localStorage.getItem(LocSrcCrcFn(loc));
        return s == null ? 0 : parseInt(s);
    }
    function GetLocSrc_Data(loc) {
        return localStorage.getItem(LocSrcDataFn(loc));
    }
    function SetLocSrc(loc, data, crc) {
        localStorage.setItem(LocSrcDataFn(loc), data);
        localStorage.setItem(LocSrcCrcFn(loc), crc.toString());
    }
    function LocSrcDataFn(loc) {
        return "locSrcData_" + loc.toString();
    }
    function LocSrcCrcFn(loc) {
        return "locSrCrc_" + loc.toString();
    }

    var basicUrl = location.protocol + '//' + location.host + '/';

    function callServer(type, par, completed, callLoading) {
        if (typeof callLoading === "undefined") { callLoading = true; }
        //if (callLoading) setTimeout(() => Pager.viewServices.loading(true), 1);
        $.ajax(basicUrl + "lmcom/rew/rewise/service.ashx", {
            async: true,
            type: 'POST',
            dataType: 'text',
            data: { type: type, par: JSON.stringify(par) },
            headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion },
            success: function (data, textStatus, jqXHR) {
                //if (callLoading) Pager.viewServices.loading(false);
                completed(data);
            },
            error: function (jqXHR, textStatus, errorThrow) {
                //if (callLoading) Pager.viewServices.loading(false);
                alert(textStatus);
            }
        });
    }

    //Lokalni sprava MyRewise faktu
    var RwDb;
    (function (RwDb) {
        //Pokus o nacteni MyFacts z Storage
        function InitStorage() {
            var fs = localStorage.getItem(factsFn());
            var fsNew = localStorage.getItem(factsNewFn());
            if (fs == null || fsNew == null)
                return false;
            var f = RJSON.unpack(JSON.parse(fs));
            facts = [];
            _.each(f, function (f) {
                return facts[f.DbId.toString()] = f;
            });
            var fn = RJSON.unpack(JSON.parse(fsNew));
            factsNew = [];
            _.each(fn, function (f) {
                return factsNew[f.DbId.toString()] = f;
            });
            RwDb.MyLessons = [];
            Each(function (f) {
                return RwDb.MyLessons[f.LessDbId.toString()] = true;
            });
            return true;
        }
        RwDb.InitStorage = InitStorage;

        //V Storage fakta nejsou => nacti z serveru
        function InitServer(fs) {
            facts = [];
            _.each(fs, function (f) {
                return facts[f.DbId.toString()] = f;
            });
            factsNew = [];
            localStorage.setItem(factsFn(), JSON.stringify(RJSON.pack(fs)));
            localStorage.setItem(factsNewFn(), JSON.stringify([]));
            RwDb.MyLessons = [];
            Each(function (f) {
                return RwDb.MyLessons[f.LessDbId.toString()] = true;
            });
        }
        RwDb.InitServer = InitServer;
        function Each(fnc) {
            _.each(facts, function (f) {
                if (!_.has(factsNew, f.DbId.toString()))
                    fnc(f);
            });
            _.each(factsNew, function (f) {
                if (f.Status != 3 /* deleted */)
                    fnc(f);
            });
        }
        RwDb.Each = Each;
        function AddLesson(lessonId, facts) {
            _.each(facts, function (f) {
                return factsNew[f.DbId.toString()] = f;
            });
            saveFacts();
            RwDb.MyLessons[lessonId.toString()] = true;
        }
        RwDb.AddLesson = AddLesson;
        function DelLesson(lessonId) {
            _.each(FindLesson(lessonId), function (f) {
                f.Status = 3 /* deleted */;
                factsNew[f.DbId.toString()] = f;
            });
            RwDb.MyLessons[lessonId.toString()] = false;
            saveFacts();
        }
        RwDb.DelLesson = DelLesson;
        function FindFact(dbId) {
            return null;
        }
        RwDb.FindFact = FindFact;
        function FindLesson(lessonDbId) {
            var res = [];
            Each(function (f) {
                if (lessonDbId == f.LessDbId)
                    res.push(f);
            });
            return res;
        }
        RwDb.FindLesson = FindLesson;

        //notifikace o modifikaci faktu. Ulozi se do factsNew a factsNew se aktualizuje do Storage. Kdyz factsNew obsahuje mnoho prvku,
        //provede se merge s "facts" a vse se ulozi do Storage
        function FactModified(f) {
            factsNew[f.DbId.toString()] = f;
            saveFacts();
        }
        RwDb.FactModified = FactModified;
        RwDb.MyLessons = [];

        /******************** Private *******************************/
        var facts = [];
        var factsNew = [];
        var maxFactNewLength = 100;

        //var maxFactNewLength = 30;
        function saveFacts() {
            //var fn = _.values(factsNew);
            //if (fn.length > maxFactNewLength) {
            //  _.each(fn, (f: Rew.MyFact) => {
            //    if (f.Status == Rew.FactStatus.deleted) delete facts[f.DbId.toString()];
            //    else facts[f.DbId.toString()] = f;
            //  });
            //  factsNew = fn = [];
            //  localStorage.setItem(factsNewFn(), JSON.stringify(fn));
            //  localStorage.setItem(factsFn(), JSON.stringify(RJSON.pack(_.values(facts))));
            //} else
            //  localStorage.setItem(factsNewFn(), JSON.stringify(RJSON.pack(fn)));
        }
        function factsFn() {
            return "myFacts_" + RwSt.ToLearn.Line.toString() + "_" + RwSt.ToLearn.Loc.toString();
        }
        function factsNewFn() {
            return "myFactsNew_" + RwSt.ToLearn.Line.toString() + "_" + RwSt.ToLearn.Loc.toString();
        }
    })(RwDb || (RwDb = {}));

    function Test() {
        RwPersist.AddRewiseCmd(1 /* English */, 34 /* Czech */, function () {
            RwSt.setToLearn(1 /* English */, 34 /* Czech */, function () {
                var groups = RwSt.MyBookGroups(1 /* English */, 34 /* Czech */);
                RwPersist.AddLessonCmd("RewiseLANGMaster/cambridge1", 1, function () {
                    RwPersist.AddLessonCmd("RewiseLANGMaster/cambridge1", 2, function () {
                        RwPersist.DelLessonCmd(1, function () {
                            RwPersist.AddRewiseCmd(1 /* English */, 2 /* German */, function () {
                                RwSt.setToLearn(1 /* English */, 2 /* German */, function () {
                                    var groups = RwSt.MyBookGroups(1 /* English */, 34 /* Czech */);
                                    RwPersist.AddLessonCmd("RewiseLANGMaster/cambridge1", 2, function () {
                                        RwPersist.DelRewiseCmd(1 /* English */, 2 /* German */, function () {
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    RwPersist.Test = Test;
})(RwPersist || (RwPersist = {}));
