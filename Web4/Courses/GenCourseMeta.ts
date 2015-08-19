module CourseMeta {
export enum runtimeType {
  no = 0,
  courseNode = 1,
  multiTask = 2,
  product = 4,
  test = 8,
  grammarRoot = 16,
  taskCourse = 32,
  taskPretest = 64,
  taskPretestTask = 128,
  taskTestInCourse = 256,
  taskTestSkill = 512,
  ex = 1024,
  dynamicModuleData = 2048,
  project = 4096,
  mod = 8192,
  dynamicTestModule = 16384,
  skipAbleRoot = 32768,
  grammar = 65536,
  instrs = 131072,
  noDict = 262144,
  publisher = 524288,
  sitemap = 1048576,
  products = 2097152,
  mediaCutFile = 4194304,
  mediaDir = 8388608,
  error = 16777216,
  testTaskGroup = 33554432,
  multiTest = 67108864,
  multiQuestionnaire = 134217728,
  testDemo = 268435456,
  productNew = 536870912,
}

export enum childMode {
  child = 0,
  self = 1,
  selfChild = 2,
  childsWithParent = 3,
  childsWithParentIfMulti = 4,
  skrivanek_multiTest_std = 5,
  skrivanek_multiTest_compl = 6,
}

export enum dictTypes {
  unknown = 0,
  no = 1,
  L = 2,
}

export enum testNeeds {
  no = 0,
  playing = 1,
  recording = 2,
}

export interface data {
  title: string;
  url: string;
  line: LMComLib.LineIds;
  type: runtimeType;
  name: string;
  other: string;
  ms: number;
  parent: data;
  uniqId: number;
  Items: Array<data>;
}
export interface products extends data {
}
export interface product extends data {
  defaultDictType: dictTypes;
  defaultLocs: Array<LMComLib.Langs>;
}
export interface sitemap extends data {
}
export interface project extends data {
  ftpPassword: string;
  FtpUser: string;
  FtpPassword: string;
}
export interface publisher extends data {
}
export interface ex extends data {
}
export interface ptr extends data {
  takeChilds: childMode;
  skip: number;
  take: number;
  urls: Array<string>;
  isGramm: boolean;
  modify: string;
}
export interface dynamicModuleData extends data {
  groups: Array<testTaskGroup>;
}
export interface testTaskGroup extends data {
  urls: Array<string>;
  take: number;
  designTitle: string;
}
export interface taskTestSkill extends data {
  skill: string;
  minutes: number;
  scoreWeight: number;
}
export interface multiTask extends data {
}
export interface taskCourse extends data {
}
export interface mod extends data {
}
export interface test extends data {
  demoTestUrl: string;
  level: string;
  needs: testNeeds;
  isDemoTest: boolean;
}
export interface taskTestInCourse extends data {
}
export var meta: CourseModel.jsonMLMeta = <any>{"rootTagName":"data","types":{"data":{"props":{"title":{},"order":{"st":1088},"url":{},"line":{"enumType":LMComLib.LineIds},"type":{"enumType":CourseMeta.runtimeType},"name":{},"other":{},"ms":{"st":64},"allLocs":{"st":1024},"styleSheet":{"st":1024},"parent":{"st":512},"uniqId":{"st":64},"Items":{},"dataItems":{"st":1536},"spaceId":{"st":1536},"globalId":{"st":1536},"style":{"st":1536},"pathParts":{"st":1024}}},"sitemap":{"anc":"data","props":{}},"publisher":{"anc":"data","props":{"vsNetData":{"st":1024},"publisherRoot":{"st":1024}}},"project":{"anc":"data","props":{"ftpPassword":{},"FtpUser":{},"FtpPassword":{"st":512}}},"ptr":{"anc":"data","props":{"takeChilds":{"enumType":CourseMeta.childMode},"skip":{"st":64},"take":{"st":64},"urls":{},"isGramm":{"st":64},"modify":{}}},"products":{"anc":"data","props":{}},"product":{"anc":"data","props":{"defaultDictType":{"enumType":CourseMeta.dictTypes},"defaultLocs":{}}},"taskTestInCourse":{"anc":"data","props":{}},"test":{"anc":"data","props":{"demoTestUrl":{},"level":{},"needs":{"enumType":CourseMeta.testNeeds},"isDemoTest":{"st":64}}},"mod":{"anc":"data","props":{}},"taskCourse":{"anc":"data","props":{}},"multiTask":{"anc":"data","props":{}},"taskTestSkill":{"anc":"data","props":{"skill":{},"minutes":{"st":64},"scoreWeight":{"st":64}}},"dynamicModuleData":{"anc":"data","props":{"groups":{}}},"testTaskGroup":{"anc":"data","props":{"urls":{},"take":{"st":64},"designTitle":{}}},"ex":{"anc":"data","props":{"isOldEa":{"st":1088},"isOldEaPassive":{"st":1088},"instrs":{"st":1024}}}}};
export var tdata = 'data'; export var tsitemap = 'sitemap'; export var tpublisher = 'publisher'; export var tproject = 'project'; export var tptr = 'ptr'; export var tproducts = 'products'; export var tproduct = 'product'; export var ttaskTestInCourse = 'taskTestInCourse'; export var ttest = 'test'; export var tmod = 'mod'; export var ttaskCourse = 'taskCourse'; export var tmultiTask = 'multiTask'; export var ttaskTestSkill = 'taskTestSkill'; export var tdynamicModuleData = 'dynamicModuleData'; export var ttestTaskGroup = 'testTaskGroup'; export var tex = 'ex'; }
