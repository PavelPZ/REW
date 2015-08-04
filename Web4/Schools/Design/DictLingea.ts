//module dictLingea {

//  var tLNG = LMComLib.Langs;
// // var tRS = Admin.OKCrsReason;
//  var crsLangs: Array<LMComLib.Langs> = [tLNG.en_gb, tLNG.de_de, tLNG.fr_fr, tLNG.it_it, tLNG.sp_sp, tLNG.ru_ru];

//  export class model {
//    constructor() {
//      root = this;
//      //var rss: Array<Admin.OKCrsReason> = [tRS.no, tRS.wordsGoogle, tRS.google, tRS.wordsOK, tRS.charsOK];
//      //_.each(rss, r => this.allReasons.push({ okCrsReason: r, title: tRS[r] }))
//      dicts(entries => {
//        this.allDicts = _.map(entries, en => { return { crsLang: en.crsLang, natLang: en.natLang, title: tLNG[en.crsLang].substr(0, 2) + '-' + tLNG[en.natLang].substr(0, 2) } });
//        ko.applyBindings(this, $('body')[0]);
//      });
//    }
//    allDicts: Array<{ crsLang: LMComLib.Langs; natLang: LMComLib.Langs; title: string; }> = [];
//    //allReasons: Array<{ okCrsReason: Admin.OKCrsReason; title: string; }> = [];
//    selectedDict = ko.observable<{ crsLang: LMComLib.Langs; natLang: LMComLib.Langs; }>();
//    //selectedReason = ko.observable<{ okCrsReason: Admin.OKCrsReason }>();
//    entries = ko.observableArray<DictEntry>();
//    loadDict() {
//      if (!this.selectedDict()) { alert('Choose dict!'); return; }
//      this.entries(null);
//      Pager.ajaxGet(Pager.pathType.restServices, Admin.DictEntryCmd_Type,
//        { type: Admin.DictEntryCmdType.loadDict, crsLang: this.selectedDict().crsLang, natLang: this.selectedDict().natLang },
//        (dt: DictEntries) => {
//          _.each(dt.entries, de => {
//            de.handOkCrs = ko.observable(de.okCrs);
//            de.hands = [new handModel(de, true), new handModel(de, false)];
//            de.play = () => LMSnd.Player.playFile(Pager.basicUrl + 'RwDicts/LingeaSound/' + de.soundMaster + '.mp3', 0);
//          })
//          this.entries(dt.entries);
//        });
//    }
//    statistics() {
//      dicts(entries => {
//        this.dicts(_.map(entries, de => {
//          if (de.todoCount < 0) de.todoCount = 0;
//            return {
//            dict: '<b>' + tLNG[de.crsLang].substr(0, 2) + '-' + tLNG[de.natLang].substr(0, 2) + '</b>',
//            title: (de.allCount - de.todoCount).toString() + ' / ' + de.todoCount.toString() + ' / ' + de.allCount.toString(),
//            css: de.todoCount == 0 ? 'label-success' : (de.todoCount < de.allCount ? 'label-warning' : 'label-danger')
//          }
//          }));
//        var all = 0, todo = 0;
//        _.each(entries, de => { all += de.allCount; todo += de.todoCount; });
//        this.all(all); this.todo(todo); this.ok(all - todo);
//      });
//    }
//    dicts = ko.observableArray();
//    all = ko.observable(0);
//    ok = ko.observable(0);
//    todo = ko.observable(0);
//  }

//  function dicts(completed: (res: Array<DictEntry>) => void): void {
//    Pager.ajaxGet(Pager.pathType.restServices, Admin.DictEntryCmd_Type,
//      { type: Admin.DictEntryCmdType.statistics },
//      (dt: DictEntries) => completed(dt.entries));
//  }

//  var root: model;

//  export interface DictEntries extends Admin.DictEntryRes {
//    entries: Array<DictEntry>;
//  }
//  export interface DictEntry extends Admin.DictEntryCmd {
//    handOkCrs: KnockoutObservable<LMComLib.Langs>;
//    hands: Array<handModel>;
//    play: () => void;
//  }


//  export class handModel {

//    constructor(public de: DictEntry, public isCrs: boolean) { }

//    myLang = () => this.isCrs ? root.selectedDict().crsLang : root.selectedDict().natLang;
//    title = () => tLNG[this.myLang()].substr(0, 2).toUpperCase();
//    css = ko.computed(() => {
//      if (this.de.handOkCrs() == tLNG.no) return "btn-danger";
//      return this.de.handOkCrs() == this.myLang() ? "btn-success" : "btn-default";
//    });
//    click: (model: handModel) => void = model => {
//      Pager.ajaxGet(Pager.pathType.restServices, Admin.DictEntryCmd_Type,
//        { type: Admin.DictEntryCmdType.saveEntry, crsLang: root.selectedDict().crsLang, natLang: root.selectedDict().natLang, okCrs: this.myLang(), entryId: this.de.entryId },
//        () => this.de.handOkCrs(this.myLang()));
//    };
//    //icon = ko.computed(() => {
//    //  if (this.de.okCrsMaybe == tLNG.no || this.de.handOkCrs() != tLNG.no || this.de.okCrsMaybe != this.myLang()) return '';
//    //  return 'fa fa-check';
//    //});
//  }

//  export function init() {
//    LMSnd.Player.init($.noop);
//    new model();
//  }
//} 