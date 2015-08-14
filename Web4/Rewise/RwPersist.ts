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
module RwPersist {

  //****************** InitMyRewise - globalni info o uzivatelove rewise
  export function InitMyRewise(newUserLoc: LMComLib.LineIds, completed: (rd: Rew.MyRewise) => void ) {
    var oldMyRewise = ReadMyRewise(); //nacteni MyRewise
    var PCSign = oldMyRewise != null && oldMyRewise.LMComId == RwSt.LMComUserId ? oldMyRewise.PCSignature : new Date().getTime().toString();
    callServer(
      Rew.MyRewiseCmd_Type,
      Rew.MyRewiseCmd_Create(RwSt.LMComUserId, PCSign, JSON.stringify(Rew.MyRewiseOptions_Create(newUserLoc, newUserLoc, null))),
      res => { //kontrola signature, ev. zalozeni MyRewise
        var rd: Rew.MyRewiseResult = JSON.parse(res);
        if (rd.SignatureOK) completed(oldMyRewise); //signature odpovida
        else { //spatna signature, vytvor MyRewise ze server informaci
          var myRew = Rew.MyRewise_Create(RwSt.LMComUserId, PCSign, JSON.parse(rd.OptionsJSON), rd.UserId, rd.ToLearns);
          WriteMyRewise(myRew);
          DelAllMyFacts(); //vymaz vsechny MyFacts (pro vsechny Lines a Locs)
          completed(myRew);
        }
      });
  }

  //****************** Read all lines
  export function LocSrcCmd(loc: LMComLib.LineIds, completed: (res: Rew.LocSrc) => void ): void {
    var crc = GetLocSrc_Crc(loc);
    callServer(Rew.LocSrcCmd_Type, Rew.LocSrcCmd_Create(loc, crc), (res) => {
      if (res == null || res == '') res = GetLocSrc_Data(loc); //version OK, nacti z local storage
      //TODO else SetLocSrc(loc, res, parseInt(xhr.getResponseHeader("version")));
      completed(RJSON.unpack(JSON.parse(res)));
    });
  }

  //****************** MyFacts
  export function LoadMyFact(completed: () => void ): void {
    if (RwDb.InitStorage())
      completed();
    else
      callServer(Rew.MyFactCmd_Type, Rew.MyFactCmd_Create(RwSt.MyRewise.UserId, RwSt.ToLearn.Line, RwSt.ToLearn.Loc),
        (res: string) => {
          RwDb.InitServer(JSON.parse(res));
          completed();
        });
  }

  //****************** Add rewise
  export function AddRewiseCmd(line: LMComLib.LineIds, loc: LMComLib.LineIds, completed: () => void ): void {
    if (_.any(RwSt.MyRewise.ToLearns, (l: Rew.LangToLearn) => l.Line == line && l.Loc == loc)) { completed(); return; }
    callServer(Rew.AddRewiseCmd_Type, Rew.AddRewiseCmd_Create(RwSt.MyRewise.UserId, line, loc), res => {
      LocSrcCmd(loc, data => { //nacti staticka data pro zvolenou lokalizaci
        RwSt.Data = data;
        //pridej do ToLearns
        if (RwSt.MyRewise.ToLearns == null) RwSt.MyRewise.ToLearns = [];
        RwSt.MyRewise.ToLearns.push(Rew.LangToLearn_Create(true, line, loc));
        //difotni hodnota seznamu knih na Vocabulary home
        var lineSrc: Rew.LineSrc = _.find(data.Lines, (l: Rew.LineSrc) => l.Line == line); //line 
        var groupIds = _.map(_.filter(lineSrc.Groups, (g: Rew.BookGroupSrc) => g.IsDefault), (g: Rew.BookGroupSrc) => g.Id);
        //dej do line option:
        if (RwSt.MyRewise.Options.Lines == null) RwSt.MyRewise.Options.Lines = [];
        RwSt.MyRewise.Options.Lines.push(Rew.MyLineOption_Create(line, loc, groupIds));
        //save all
        SaveMyOptionsCmd(completed);
      });
    });
  }

  //****************** Delete rewise
  export function DelRewiseCmd(line: LMComLib.LineIds, loc: LMComLib.LineIds, completed: () => void ): void {
    if (!_.any(RwSt.MyRewise.ToLearns, (l: Rew.LangToLearn) => l.Line == line && l.Loc == loc)) { completed(); return; }
    callServer(Rew.DelRewiseCmd_Type, Rew.DelRewiseCmd_Create(RwSt.MyRewise.UserId, line, loc), res => {
      RwSt.MyRewise.ToLearns = _.reject(RwSt.MyRewise.ToLearns, (l: Rew.LangToLearn) => l.Line == line && l.Loc == loc);
      RwSt.MyRewise.Options.Lines = _.reject(RwSt.MyRewise.Options.Lines, (l: Rew.MyLineOption) => l.Line == line && l.Loc == loc);
      DelMyFacts(line, loc);
      SaveMyOptionsCmd(completed);
    });
  }

  //****************** Change Native Lang
  export function SaveMyOptionsCmd(completed: () => void ): void {
    callServer(Rew.SetMyOptionsCmd_Type, Rew.SetMyOptionsCmd_Create(RwSt.MyRewise.UserId, JSON.stringify(RwSt.MyRewise.Options)), res => {
      WriteMyRewise(RwSt.MyRewise);
      if (completed != null) completed();
    });
  }

  //****************** Add Lesson
  export function AddLessonCmd(bookName: string, lessonId: number, completed: () => void ): void {
    if (_.has(RwDb.MyLessons, lessonId.toString())) { completed(); return; }
    callServer(Rew.AddLessonCmd_Type, Rew.AddLessonCmd_Create(RwSt.MyRewise.UserId, lessonId, bookName, RwSt.ToLearn.Line, RwSt.ToLearn.Loc), res => {
      RwDb.AddLesson(lessonId, JSON.parse(res));
      completed();
    });
  }

  //****************** Delete Lesson
  export function DelLessonCmd(lessonId: number, completed: () => void ): void {
    if (!_.has(RwDb.MyLessons, lessonId.toString())) { completed(); return; }
    callServer(Rew.DelLessonCmd_Type, Rew.DelLessonCmd_Create(RwSt.MyRewise.UserId, lessonId, RwSt.ToLearn.Line, RwSt.ToLearn.Loc), res => {
      RwDb.DelLesson(lessonId);
      completed();
    });
  }

  //****************** Read Lesson
  export function ReadLessonCmd(bookName: string, lessonId: number, completed: (less: Rew.LessonDataSrc) => void ): void {
    callServer(Rew.ReadLessonCmd_Type, Rew.ReadLessonCmd_Create(lessonId, bookName, RwSt.ToLearn.Loc), res => completed(RJSON.unpack(JSON.parse(res))));
  }

  //****************** SaveFactCmd
  export function SaveFactCmd(fact: Rew.MyFact, completed: () => void ): void {
    callServer(Rew.SaveFactCmd_Type, Rew.SaveFactCmd_Create(fact.FactId, JSON.stringify(fact)), res => {
      RwDb.FactModified(fact);
      if (completed != null) completed();
    });
  }

  /************************* Srorage API ******************************/
  function ReadMyRewise(): Rew.MyRewise { var mr = localStorage.getItem("myRewise"); return mr == null ? null : JSON.parse(mr); }

  function WriteMyRewise(data: Rew.MyRewise): void { localStorage.setItem("myRewise", JSON.stringify(data)); }

  function DelAllMyFacts() {
    var toDel = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf("myFacts_") == 0 || key.indexOf("myFactsNew_") == 0) toDel.push(key);
    }
    _.each(toDel, key => localStorage.removeItem(key));
  }
  function DelMyFacts(line: LMComLib.LineIds, loc: LMComLib.LineIds) {
    localStorage.removeItem("myFacts_" + line.toString() + "_" + loc.toString());
    localStorage.removeItem("myFactsNew_" + line.toString() + "_" + loc.toString());
  }
  function GetLocSrc_Crc(loc: LMComLib.LineIds): number {
    var s = localStorage.getItem(LocSrcCrcFn(loc));
    return s == null ? 0 : parseInt(s);
  }
  function GetLocSrc_Data(loc: LMComLib.LineIds): string {
    return localStorage.getItem(LocSrcDataFn(loc));
  }
  function SetLocSrc(loc: LMComLib.LineIds, data: string, crc: number): void {
    localStorage.setItem(LocSrcDataFn(loc), data);
    localStorage.setItem(LocSrcCrcFn(loc), crc.toString());
  }
  function LocSrcDataFn(loc: LMComLib.LineIds): string { return "locSrcData_" + loc.toString(); }
  function LocSrcCrcFn(loc: LMComLib.LineIds): string { return "locSrCrc_" + loc.toString(); }

  var basicUrl = location.protocol + '//' + location.host + '/';

  function callServer(type: string, par: Object, completed: (res: any) => void, callLoading: boolean = true) {
    //if (callLoading) setTimeout(() => Pager.viewServices.loading(true), 1);
    $.ajax(basicUrl + "lmcom/rew/rewise/service.ashx", {
      async: true,
      type: 'POST',
      dataType: 'text',
      data: { type: type, par: JSON.stringify(par) },
      headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion },
      success: (data, textStatus, jqXHR) => {
        //if (callLoading) Pager.viewServices.loading(false);
        completed(data);
      },
      error: (jqXHR, textStatus, errorThrow) => {
        //if (callLoading) Pager.viewServices.loading(false);
        alert(textStatus);
      },
    });
  }

  //Lokalni sprava MyRewise faktu
  module RwDb {
    //Pokus o nacteni MyFacts z Storage
    export function InitStorage(): boolean {
      var fs = localStorage.getItem(factsFn());
      var fsNew = localStorage.getItem(factsNewFn());
      if (fs == null || fsNew == null) return false;
      var f = RJSON.unpack(JSON.parse(fs));
      facts = [];
      _.each(f, (f: Rew.MyFact) => facts[f.DbId.toString()] = f);
      var fn = RJSON.unpack(JSON.parse(fsNew));
      factsNew = [];
      _.each(fn, (f: Rew.MyFact) => factsNew[f.DbId.toString()] = f);
      MyLessons = []; Each(f => MyLessons[f.LessDbId.toString()] = true);
      return true;
    }
    //V Storage fakta nejsou => nacti z serveru
    export function InitServer(fs: Rew.MyFact[]): void {
      facts = [];
      _.each(fs, (f: Rew.MyFact) => facts[f.DbId.toString()] = f);
      factsNew = [];
      localStorage.setItem(factsFn(), JSON.stringify(RJSON.pack(fs)));
      localStorage.setItem(factsNewFn(), JSON.stringify([]));
      MyLessons = []; Each(f => MyLessons[f.LessDbId.toString()] = true);
    }
    export function Each(fnc: (f: Rew.MyFact) => void ): void {
      _.each(facts, (f: Rew.MyFact) => {
        if (!_.has(factsNew, f.DbId.toString())) fnc(f);
      });
      _.each(factsNew, (f: Rew.MyFact) => {
        if (f.Status != Rew.FactStatus.deleted) fnc(f);
      });
    }
    export function AddLesson(lessonId: number, facts: Rew.MyFact[]): void {
      _.each(facts, (f: Rew.MyFact) => factsNew[f.DbId.toString()] = f);
      saveFacts();
      MyLessons[lessonId.toString()] = true;
    }
    export function DelLesson(lessonId: number): void {
      _.each(FindLesson(lessonId), (f: Rew.MyFact) => {
        f.Status = Rew.FactStatus.deleted;
        factsNew[f.DbId.toString()] = f;
      });
      MyLessons[lessonId.toString()] = false;
      saveFacts();
    }
    export function FindFact(dbId: number): Rew.MyFact {
      return null;
    }
    export function FindLesson(lessonDbId: number): Rew.MyFact[] {
      var res: Rew.MyFact[] = [];
      Each(f => { if (lessonDbId == f.LessDbId) res.push(f); });
      return res;
    }
    //notifikace o modifikaci faktu. Ulozi se do factsNew a factsNew se aktualizuje do Storage. Kdyz factsNew obsahuje mnoho prvku,
    //provede se merge s "facts" a vse se ulozi do Storage
    export function FactModified(f: Rew.MyFact): void {
      factsNew[f.DbId.toString()] = f;
      saveFacts();
    }
    export var MyLessons: boolean[] = []; ////hash lesson.DbId=>true

    /******************** Private *******************************/
    var facts: Rew.MyFact[] = []; //hash Rew.MyFact.DbId.toString=>Rew.MyFact
    var factsNew: Rew.MyFact[] = []; //hash Rew.MyFact.DbId.toString=>Rew.MyFact pro naposledy modifikovane fakty
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
    function factsFn(): string {
      return "myFacts_" + RwSt.ToLearn.Line.toString() + "_" + RwSt.ToLearn.Loc.toString();
    }
    function factsNewFn(): string {
      return "myFactsNew_" + RwSt.ToLearn.Line.toString() + "_" + RwSt.ToLearn.Loc.toString();
    }
  }

  export function Test(): void {
    RwPersist.AddRewiseCmd(LMComLib.LineIds.English, LMComLib.LineIds.Czech, () => {
      RwSt.setToLearn(LMComLib.LineIds.English, LMComLib.LineIds.Czech, () => {
        var groups = RwSt.MyBookGroups(LMComLib.LineIds.English, LMComLib.LineIds.Czech);
        RwPersist.AddLessonCmd("RewiseLANGMaster/cambridge1", 1, () => {
          RwPersist.AddLessonCmd("RewiseLANGMaster/cambridge1", 2, () => {
            RwPersist.DelLessonCmd(1, () => {
              RwPersist.AddRewiseCmd(LMComLib.LineIds.English, LMComLib.LineIds.German, () => {
                RwSt.setToLearn(LMComLib.LineIds.English, LMComLib.LineIds.German, () => {
                  var groups = RwSt.MyBookGroups(LMComLib.LineIds.English, LMComLib.LineIds.Czech);
                  RwPersist.AddLessonCmd("RewiseLANGMaster/cambridge1", 2, () => {
                    RwPersist.DelRewiseCmd(LMComLib.LineIds.English, LMComLib.LineIds.German, () => {
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

}


