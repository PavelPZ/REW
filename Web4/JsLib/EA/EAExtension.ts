declare var Sys; //, serviceRoot, listenTalkBase;

module EA {

  //export function DataPath(): string {
  //  debugger;
  //  return cfg.EADataPath;
  //}

  export function startAjax() {
    Sys.Application.dispose();
    Sys.Application.beginCreateComponents();
  }
  export function endAjax(completed: () => void) {
    setTimeout(() => {
      Sys.Application.endCreateComponents();
      Sys.Application._doInitialize();
      //finishImgSrc();
      if (completed) completed();
    }, 1);
  }

  export class oldToNewScoreProvider implements CourseMeta.IScoreProvider {
    constructor(public old: Course.IScoreProvider) { }
    provideData(exData: { [ctrlId: string]: Object; }): void {
      this.old.provideData(exData);
    }
    acceptData(done:boolean, exData: { [ctrlId: string]: Object; }): void {
      this.old.acceptData(done ? LMComLib.ExerciseStatus.Evaluated : LMComLib.ExerciseStatus.Normal, exData);
    }
    resetData(exData: { [ctrlId: string]: Object; }): void {
      //var pg: CourseModel.PageUser = <any>{ Results: exData };
      this.old.resetData(exData);
    }
    getScore(): CourseModel.Score {
      var nums = this.old.get_score(); return nums == null || nums.length != 2 ? null : { s: nums[0], ms: nums[1], flag:0 };
      //var nums = this.old.get_score(); return nums == null || nums.length != 2 ? null : { s: nums[0] == nums[1] ? 1 : 0, ms: 1, flag: 0 };
    }
  }

  //export var exerciseIndex: number;
  //function userData(): CourseModel.PageUser { return schools.data.modUser.pages[exerciseIndex]; }

  ////v obrazcich nahrad cestu k datum (easrc plnen v q:\LMNet2\WebApps\EduAuthorNew\app_code\Localize.cs)
  //export function finishImgSrc() {
  //  $("[easrc]").each((idx: number, el: Element) => {
  //    var e = $(el);
  //    e.attr("src", cfg.EADataPath + e.attr("easrc"));
  //    e.attr("easrc", null);
  //  });
  //}

  //export function forceSoundDrive():string {
  //  switch (cfg.ForceSoundPlayer) {
  //    case LMComLib.SoundPlayerType.Flash: return "Flash";
  //    case LMComLib.SoundPlayerType.HTML5: return "HTML5";
  //    case LMComLib.SoundPlayerType.Silverlight: return "SL";
  //    default: return null;
  //  }
  //}
}

//var xapPath = 'eaimgmp3/'; //cesta k XAP a SWF souborum, relativne k schools adresari.
//var xapPath = ''; //cesta k XAP a SWF souborum, relativne k schools adresari.
//var actLms = 3; //LMSType.LMCom

//function DictConnector_listenTalk(url, word) {
//  return serviceRoot(actLms.toString(), true) + '/site/' + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(url) + '&FactTitle=' + encodeURIComponent(word);
//};
//function DictConnector_listenTalkSentence(pars) {
//  return serviceRoot(actLms.toString(), true) + '/site/' + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(listenTalkBase(actLms.toString()) + '/' + pars.url) + '&sentBeg=' + pars.beg + '&sentEnd=' + pars.end + '&FactTitle=' + encodeURIComponent(pars.title);
//};

