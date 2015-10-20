/// <reference path="../jslib/js/GenLMComLib.ts" />
/// <reference path="GenSchools.ts" />
/// <reference path="../courses/GenCourseModel.ts" />
module schools {
  //****************** user data 
  export interface IRpcRequest {
    name: string;
    pars: Object;
  }
  export interface IRpcPar {
    site: string;
    userId: number; //lmcomUserId, v Q:\LMCom\LMCom\Services\Rpc\ea\ScormServer.aspx se musi jmenovat userId
    companyId: number;
    courseId: number;
    spaceId: string;
    globalId: string;
    data: string;
  }
  export interface IRpcParEx extends IRpcPar {  
    dataShort: string;
  }

  export interface schools_info { //info v cookie pro kurz a test, spousteny z Schools. Musi byt stejny s q:\LMNet2\WebApps\EduAuthorNew\framework\controls\commonparts\Schools.ts
    retUrl: string;
    retTitle: string;
    isPretest: boolean;
  }

  //info z LMComData.CourseData.ShortData, odpovida S4N.ModuleData
  //export interface ModUser {
  //  //encoded: string;
  //  st: LMComLib.ExerciseStatus;
  //  ms: number;
  //  s: number;
  //  bt: number;
  //  et: number;
  //  t: number;
  //  ev: number; //NEW: evaluated procent
  //  pages: CourseModel.PageUser[];
  //  //scormData: Object; //Scorm konstanty, pouzivaji se pouze v opravdovem SCORM, v lm.com-EA a REW ne.
  //}
  
  //dato, odvozene z ModUser v Model.createMyModules
  export interface ModUserModel {
    status: LMComLib.ExerciseStatus;
    beg: number;
    end: number;
    elapsedSeconds: number;
    ev: number; //NEW: evaluated procent
    score: number; //-1 => modul ma sama nevyhodnotitelne cviceni
  }

  //****************** informace o kurzech a testech
  export enum PretestMode {
    first = 0, //startovaci stav
    testHome = 1, //test bezi, je na home
    testForm = 2, //test bezi, je na dotazniku
    testTest = 3, //test bezi, je v testu (ID testu je v testUrl)
    testTestFinished = 4, //test dobehl, nabidka nastavit zacatek kurzu
    tested = 5 //test dobehl, je nastaven zacatek kurzu
  };
  //globalni SCORM dato pro kurz, definovane v q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\Course.js
  export interface CourseInfo {
    testUrl: string; //pro this.testMode=testTest: identifikace rozpracovaneho vstupniho test
    testMode: PretestMode; //stav pretestu
    firstId: string; //JSON Id prvniho modulu kurzu (moduly pred nim jsou removed) - vysledek nastaveni zacatku kurzu.
    tempFirstIdTitle: string; //pro porvrzeni testovaci kapitoly: jeji titulek
    tempFirstId: string; //pro porvrzeni testovaci kapitoly: jeji JSON id
    testHistory: Object; //this.testHistory[<jsonId testu>] obsahuje procentuelni vyhodnoceni každého z testů
    licenceAgreeOK: boolean; //uzivatel vyjadril souhlas s licencni smlouvou
  };
  
  //souhrn vsech informaci
  //export interface initResult {
  //  companyId: number; //company, ktere plnim kury
  //  courseId: string; //ProductId, identifikace naladovaneho kurzu
  //  pretestCrsId: LMComLib.CourseIds; //identifikace pretestu
  //  metaCourse: metaCourse;  //info navic o metakurzy
  //  //crsStatic: root; //staticke info o kurzu (= struktura kurzu a lekci)
  //  crsStatic2: CourseMeta.productImpl;
  //  courseInfo: CourseInfo; //globalni SCORM dato pro kurz. getData na spaceId=null, globalID=courseinfo.json
  //  crsUser: ModUser[]; //zkracene user SCORM info o modulech
  //  //testResults: SchoolCmdTestInfoItem[]; //user info o testech
  //  //greenMod: mod; //modul na rade
  //  //vyuka: aktualni modul etc.
  //  previewMode: boolean; //vyuka bezi v preview modu
  //  dict: schools.Dict;
  //  modId: string; //identifikace naladovane kapitoly (pro modul a cviceni)
  //  //exStatic: exStatic[]; //staticka data cviceni, nactena z q:\LMCom\rew\Web4\Schools\EAData\
  //  modUser: ModUser; //plne scormInfo pro aktualni modul - s vysledky cviceni, JSON.parse(actModScorm.data)
  //  //grammLinear: grammarNode[]; //linearizovane koncove stranky gramatiky
  //}

  //export interface config {
  //  failLimit: number;
  //  canSkipCourse: boolean;
  //  canSkipTest: boolean;
  //  canResetCourse: boolean;
  //  canResetTest: boolean;
  //  EADataPath: string; //cesta k EA zvukum a obrazkum
  //  newEA: boolean; // jak se chape odkaz na kapitolu: false => odkay na EA, true => prime zobrazeni cviceni v nove technologii
  //  target: LMComLib.Targets; //cilova platforma
  //  rootCourse: number; //pro target!=web: spousteny kurz
  //  //offline: boolean; //offline provoz aplikace v App store apod.
  //}

  //****************** metakurz s testy, persistentni dato v SCORM databazi
  //export enum taskStatus {
  //  toRun, //budouci kurzy
  //  testFailed, //budouci test (jako toRun), predchozi test nebyl uspesny
  //  toStart, //vse je splneno pro start kurzu, jeste ale neni nastartovan. Temporery priznak, ktery vzdy pri nacteni metakurzu meni na toRun
  //  started, //kurz je nastartovan
  //  completed,
  //  skipped, //Preskoc
  //  canceled, //pro archiv testu: test se dostal do archivu operaci cancelTestSkip
  //}

  //export enum taskTypes {
  //  no,
  //  pretest,
  //  test,
  //  course,
  //}

  //export interface taskInfo {
  //  type: taskTypes;
  //  metaTask: metaTask;
  //  task: taskAttempt;
  //  course: courseAttempt;
  //  pretest: PretestMeta;
  //  test: testAttempt;
  //}

  //export interface PretestMeta extends taskAttempt { //metainformace o pretestu
  //  result: string; //identifikace kurzu, ktery je vysledkem pretestu. //Interface.ts, course.id
  //}

  //export interface metaCourse {
  //  startInfoShowed: boolean;
  //  pretest: PretestMeta; //metainformace o pretestu
  //  companyId: number; 
  //  courseId: number;  //productId, napr. 104
  //  tasks: metaTask[];
  //  elapsedSeconds: number;
  //  completed: boolean;
  //  score: number;
  //}

  //export interface metaTask {
  //  title: string;
  //  jsonId: string; //Interface.ts, course.jsonId
  //  testFileName: string; //eTestMe databaze, <Project FileName>/<Test.FileName> (identifikace testu z databaze)
  //  course: courseAttempt;
  //  test: testAttempt;
  //  removedModules: string[];
  //  resetedForTestFailes: boolean;
  //}

  //export interface taskAttempt {
  //  status: taskStatus;
  //  start: number; //msec: doplnen pri zmene stavu z toStart na started. Pro kurz a status=skipped: priznak, ze kurz byl pred skip ve stavu started.
  //  archive: taskAttempt[];
  //  //pro dokonceny pokus:
  //  end: number; //Doplnen z MyModule.End nebo testInfo.RepEnd pri zmene stavu z started do completed
  //  score: number;
  //}

  //export interface courseAttempt extends taskAttempt {
  //  elapsedSeconds: number;
  //  progress: number;
  //}

  //export interface testAttempt extends taskAttempt {
  //  userTestId: number; //Licence DB, UserTest.Id. <=0 => test nezalozen
  //  interruptions: number; //pocet preruseni testu
  //}

  // breadcrumb
  //export interface pathItem {
  //  jsonId: string;
  //  typeName: string;
  //  title: string;
  //  src: folder; //pro moduly, lekce, kurzy
  //  index: number; //pro cviceni
  //}

  //export interface mod extends folder {
  //  myModule: schools.ModUserModel;
  //}
}

