module schools {
export enum persistTypes {
  no = 0,
  persistNewEA = 1,
  persistScormEx = 2,
  persistScormLocal = 3,
  persistMemory = 4,
}

export enum ExFormat {
  ea = 0,
  rew = 1,
}

export enum seeAlsoType {
  grammar = 0,
  ex = 1,
}

export enum licenceResult {
  ok = 0,
  wrongDomain = 1,
  demoExpired = 2,
  userMonthExpired = 3,
  JSCramblerError = 4,
}

export enum versions {
  no = 0,
  debug = 1,
  not_minified = 2,
  minified = 3,
}

export enum DictEntryType {
  lingeaOld = 0,
  rj = 1,
  Wiktionary = 2,
}

export enum scormDriver {
  no = 0,
  moodle = 1,
  edoceo = 2,
}

export enum displayModes {
  normal = 0,
  previewEx = 1,
}

export interface seeAlsoLink {
  url: string;
  title: string;
  type: seeAlsoType;
}
export interface config {
  dataBatchUrl: string;
  failLimit: number;
  canSkipCourse: boolean;
  canSkipTest: boolean;
  canResetCourse: boolean;
  canResetTest: boolean;
  EADataPath: string;
  noCpv: boolean;
  target: LMComLib.Targets;
  version: versions;
  noOldEA: boolean;
  persistType: persistTypes;
  rootProductId: string;
  forceServiceUrl: string;
  forceLoggerUrl: string;
  dictOfflineId: string;
  dictNoSound: boolean;
  scorm_driver: scormDriver;
  debug_AddTimespanToJsonUrl: boolean;
  designId: string;
  replaceJSON: boolean;
  debugTypes: string;
  noDebugTypes: string;
  logins: Array<LMComLib.OtherType>;
  startProcName: string;
  lang?: LMComLib.Langs;
  UseParentCfg: boolean;
  themeId: string;
  hash: string;
  forceEval: boolean;
  themeDefauleNavbar: boolean;
  testGroup_debug: boolean;
  humanEvalMode: boolean;
  basicPath: string;
  baseTagUrl: string;
  forceDriver: LMComLib.SoundPlayerType;
  displayMode: displayModes;
  alowedParentDomain: string;
  licenceConfig: licenceConfig;
  vocabulary: boolean;
  noAngularjsApp: boolean;
}
export interface licenceConfig {
  isDynamic: boolean;
  domain: string;
  intExpiration: number;
  serviceUrl: string;
  appUrl: string;
  rewVersion: number;
  courseVersion: number;
  extVersion: number;
  groundVersion: number;
}
export interface licenceResponse {
  Id: string;
  result: licenceResult;
  DemoExpired: number;
  Months: Array<licenceRespMonth>;
  Buys: Array<licenceRespBuy>;
}
export interface licenceRespMonth {
  Date: number;
  Users: Array<licenceRespUser>;
}
export interface licenceRespBuy {
  Created: number;
  UserMonths: number;
}
export interface licenceRespUser {
  Created: number;
  Id: string;
  Name: string;
  rootCourse: string;
}
export interface licenceRequest {
  Target: LMComLib.Targets;
  rootCourse: string;
  Type: LMComLib.OtherType;
  TypeId: string;
  FirstName: string;
  LastName: string;
  EMail: string;
  Login: string;
  appUrl: string;
  courseVersion: number;
}
export interface Dict {
  crsLang: LMComLib.Langs;
  natLang: LMComLib.Langs;
  Tags: { [id:string]: string};
  Keys: { [id:string]: number};
  Entries: { [id:string]: DictItemRoot};
}
export interface DictItem {
  tag: number;
  urls: string;
  items: Array<DictItem>;
  text: string;
}
export interface DictItemRoot extends DictItem {
  type: DictEntryType;
  soundFiles: Array<string>;
}
export interface DictExWords {
  modId: string;
  exId: string;
  normalized: string;
}
export interface DictCrsWords {
  lang: LMComLib.Langs;
  fileName: string;
  exs: Array<DictExWords>;
}
export interface DictWords {
  courses: Array<DictCrsWords>;
}
export interface ModUser {
  st: LMComLib.ExerciseStatus;
  ms: number;
  s: number;
  bt: number;
  et: number;
  t: number;
  ev: number;
  pages: Array<CourseModel.PageUser>;
}
}
