//module extractWords {
//  function readFile(name: string, completed: (data: string) => void): void {
//    Pager.ajaxGet(
//      Pager.pathType.restServices,
//      Admin.CmdDsgnReadFile_Type,
//      Admin.CmdDsgnReadFile_Create(name),
//      completed)
//  }
//  function readFiles(names: Array<string>, completed: (datas: Admin.CmdDsgnResult) => void): void {
//    Pager.ajaxPost(
//      Pager.pathType.restServices,
//      Admin.CmdDsgnReadFiles_Type,
//      Admin.CmdDsgnReadFiles_Create(_.map(names, nm => basicPath + nm)),
//      completed)
//  }
//  function readFileLow(fileName: string, finish: (data: string) => void): JQueryPromise<void> {
//    var defered = $.Deferred(function () {
//      var self = this;
//      readFile(basicPath + fileName, (data: string) => { finish(data); self.resolve(); });
//    });
//    return defered.promise();
//  }
//  function writeDictWords(name: string, data: string, completed: () => void): void {
//    Pager.ajaxPost(
//      Pager.pathType.restServices,
//      Admin.CmdDsgnWriteDictWords_Type,
//      Admin.CmdDsgnWriteDictWords_Create(name, data),
//      completed)
//  }
//  var basicDir = "rew\\Web4\\";
//  var basicPath = basicDir + "Schools\\";
//  //Helper functions
//  function evalLoc(val: string): string { return "#B#E#G#" + val + "#E#N#D#"; }
//  function finishEvalLoc(val: string): string { return val.replace(/"#B#E#G#/g, "Trados.loc(\"").replace(/#E#N#D#"/g, "\")"); }
//  Logger.noLocalStorageLog = true;
//  //********************************** extractWords from courses
//  export function RunCourses(completed: () => void) {
//    Run(langCourses, completed);
//  }
//  export function RunGrafia(completed: () => void) {
//    Run(grafiaCourses, completed);
//  }
//  var delBlanksTrans = /([\n\r ]{1,}|{{.*?}})/g;
//  interface exWorking extends schools.exStatic {
//    //words: string[];
//    //blocks: string[];
//    normalized: string;
//    modId: string;
//  }
//  interface crsWorking extends schools.DictCrsWords {
//    root?: schools.root; //napr. obsah d:\LMCom\rew\Web4\Schools\EACourses\English_0_10.json
//    modIds?: string[]; //jsonId's vsech modulu z root, napr. english1_xl01_sa_shome_dhtm
//    exsWorking?: exWorking[];
//  }
//  interface extractWordsPar {
//    courses: crsWorking[];
//    resultName: string;
//  }
//  function ReadGrammarContent(par: extractWordsPar, completed: () => void) {
//  }
//  function ReadCourseContents(par: extractWordsPar, completed: () => void) {
//    var files = _.map(par.courses, crs => "eacourses\\" + crs.fileName + ".json");
//    readFiles(files, datas => {
//      for (var i = 0; i < par.courses.length; i++) par.courses[i].root = JSON.parse(datas.Data[i]);
//      completed();
//    });
//    //nacti vsechny obsahy kurzu
//    //var promises = _.compact(_.map(par.courses, crs => readFileLow("eacourses\\" + crs.fileName + ".json", data => crs.root = JSON.parse(data))));
//    //$.whenall(promises).done(completed);
//  }
//  interface modInfo { modId: string; idx1: number; fileName: string; data: string/*idx2: number;*/ }
//  var grammSpace = "grammar/";
//  function modFileName(mi: string, lang: LMComLib.Langs): string {
//    if (mi.indexOf(grammSpace) == 0) {
//      mi = mi.substr(grammSpace.length);
//      //return ["EAGrammar\\" + mi + ".json", "EAGrammar\\" + LMComLib.Langs[lang].replace("_", "-") + "\\" + mi + ".json"];
//      return "EAGrammar\\" + mi + ".json";
//    } else
//      //return ["eadata\\" + mi + ".json", "eadata\\" + LMComLib.Langs[lang].replace("_", "-") + "\\" + mi + ".json"];
//      return "eadata\\" + mi + ".json";
//  }
//  function ReadModules(courses: Array<crsWorking>, completed: () => void) {
//    var crsModIds: { crs: crsWorking; mods: modInfo[] }[] =
//      _.map(courses, crs => {
//        return { crs: crs, mods: _.map(crs.modIds, modId => { return { modId: modId, idx1: 0, data: null, fileName: modFileName(modId, crs.lang) }; }) }
//      });
//    var files = [];
//    _.each(crsModIds, cm => _.each(cm.mods, m => { files.push(m.fileName); m.idx1 = files.length - 1; }));
//    readFiles(files, datas => {
//      _.each(crsModIds, cm => {
//        cm.crs.exsWorking = []; cm.crs.exs = [];
//        _.each(cm.mods, m => {
//          var modData = datas.Data[m.idx1]; //var loc = datas.Data[m.idx2];
//          if (_.isEmpty(modData)) return;
//          var exs: exWorking[] = <any>(schools.parseAndLocalize(modData, null/*loc*/));
//          _.each(exs, e => e.modId = m.modId); //obohat cviceni o identifikaci modulu
//          cm.crs.exsWorking.pushArray(exs);
//        });
//      });
//      completed();
//    });
//  }
//  function processLang(crss: Array<crsWorking>, resultName: string, completed: () => void) {
//    ReadModules(crss, () => {
//      //obsah vsech cviceni do DIVu
//      _.each<crsWorking>(crss, crs => {
//        _.each<exWorking>(crs.exsWorking, ex => {
//          var html: string = null;
//          switch (ex.format) {
//            case schools.ExFormat.ea:
//              html = ex.html;
//              break;
//            case schools.ExFormat.rew:
//              var page: CourseModel.Page = JSON.parse(ex.html);
//              var pg = new Course.Page(page, <any>{ result: {} });
//              //exerciseInfo = page.info;
//              //exerciseInfo.url = ex.url;
//              try {
//                pg.finishLoading(() => {
//                  html = JsRenderTemplateEngine.render("c_gen", page);
//                });
//              } catch (e) {
//                html = '<h1>Error</h1>';
//              }
//              break;
//          }
//          html = '<h1>' + ex.title + '</h1>' + html;
//          html = html.replace(script, '');
//          $('#exercise').html(html);
//          ex.html = null;
//          //var crsWords: Array<string> = [];
//          ex.normalized = blocks(crs.lang, $('#exercise'));
//          //ex.blocks = _.map(blocks($('#exercise')), b => {
//          //  var ws = sentenceToWords(b, crs.lang);
//          //  crsWords.pushArray(ws);
//          //  return b + '#' + ws.join('*');
//          //});
//          //ex.words = _.uniq(crsWords);
//          crs.exs.push({ modId: ex.modId, exId: ex.url, words: null/*ex.words*/, normalized: ex.normalized });
//        });
//        delete crs.root; delete crs.modIds; delete crs.exsWorking;
//      });
//      var res: schools.DictWords = { courses: crss };
//      var data = JSON.stringify(res);
//      writeDictWords(resultName, data, completed);
//    });
//  }
//  var script = /<script(.|[\r\n])*?<\/script>/mg;
//  function Run(par: extractWordsPar, completed: () => void) {
//    ReadCourseContents(par, () => {
//      _.each<crsWorking>(par.courses, crs => crs.modIds =
//        _.flatten(_.map(crs.root.courses, (c: schools.course) => _.map(c.lessons, (l: schools.lesson) => _.map(l.modules, (m: schools.mod) => m.url))), false));
//      _.each<crsWorking>(par.courses, crs => {
//        if (!crs.root.grammar) return;
//        //pridej stranky s gramatikou, napr. <modId>grammar/english_0</modId>,<exId>english1/grammar/sec02/g04.htm</exId>
//        var gramm = _.uniq(_.map(crs.root.grammar.items, nd => grammSpace + nd.url));
//        crs.modIds.pushArray(gramm);
//      });
//      //Pro kazdy jazyk:
//      var langs = _.values(_.groupBy(par.courses, 'lang'));
//      var processSingle: () => void;
//      processSingle = () => {
//        if (langs.length == 0) completed();
//        processLang(langs.pop(), par.resultName, processSingle);
//      };
//      processSingle();
//    });
//  }
//  function blocks(crsLang: LMComLib.Langs, el: JQuery): string {
//    var res: string[] = [];
//    el.find('*:not("script")').contents().filter(function () {
//      return this.nodeType == 3;
//    }).each(function (i) {
//        var txt = $(this).text();
//        DictConnector.wordsForDesignTime(txt, crsLang, res);
//      });
//    return _.sortBy(_.uniq(res), w => w).join(' ');
//  }
//  //function sentenceToWords(sent: string, lng: LMComLib.Langs): string[] {
//  //  var words = DictConnector.sentenceToWords(sent);
//  //  words = _.map(words, word=> DictConnector.normalize(word, lng));
//  //  words = _.filter(words, s => !_.isEmpty(s));
//  //  return words;
//  //}
//  //function sentencesToWords(textNodesText: string[], lng: LMComLib.Langs): string[] {
//  //  return
//  //  _.filter( //filter: not empty words
//  //    _.flatten( //array of words
//  //      _.map(textNodesText, sent => //array of sentences
//  //        _.map(DictConnector.sentenceToWords(sent), word => //array of array of words
//  //          DictConnector.normalize(word, lng))), true), //nromalize (russian akcent), blanks etc., 
//  //    s => s != null && s != '');
//  //}
//  var langCourses: extractWordsPar = {
//    courses: [
//      //{ lang: LMComLib.Langs.en_gb, fileName: 'English_0_1', exs: [] }, 
//      { lang: LMComLib.Langs.en_gb, fileName: 'English_0_10', exs: [] },
//      { lang: LMComLib.Langs.en_gb, fileName: 'EnglishE_0_10', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'German_0_5', exs: [] },
//      { lang: LMComLib.Langs.sp_sp, fileName: 'Spanish_0_6', exs: [] },
//      { lang: LMComLib.Langs.fr_fr, fileName: 'French_0_6', exs: [] },
//      { lang: LMComLib.Langs.it_it, fileName: 'Italian_0_6', exs: [] },
//      { lang: LMComLib.Langs.ru_ru, fileName: 'Russian_0_4', exs: [] },
//    ], resultName: 'CourseWords'
//  };
//  var grafiaCourses: extractWordsPar = {
//    courses: [
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod1_administrativ', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod2_geschaftsverhandlungen', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod3_hotel', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod4_seniorenpflege', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod5_logistik', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod6_autoteile', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod7_elektrotechnik', exs: [] },
//      { lang: LMComLib.Langs.de_de, fileName: 'grafiadeod8_maschinenbau', exs: [] },
//    ], resultName: 'Grafia'
//  };
//}
