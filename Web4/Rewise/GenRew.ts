/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
module Rew {
export enum FactStatus {
  no = 0,
  toLearn = 1,
  removed = 2,
  deleted = 3,
}

export interface AddLessonCmd {
  UserId: number;
  DbId: number;
  BookName: string;
  Line: LMComLib.LineIds;
  Loc: LMComLib.LineIds;
}
export var AddLessonCmd_Type = 'Rew.AddLessonCmd';
export function AddLessonCmd_Create (UserId: number, DbId: number, BookName: string, Line: LMComLib.LineIds, Loc: LMComLib.LineIds): AddLessonCmd{
  return {UserId: UserId, DbId: DbId, BookName: BookName, Line: Line, Loc: Loc};
}
export interface AddRewiseCmd {
  UserId: number;
  Line: LMComLib.LineIds;
  Loc: LMComLib.LineIds;
}
export var AddRewiseCmd_Type = 'Rew.AddRewiseCmd';
export function AddRewiseCmd_Create (UserId: number, Line: LMComLib.LineIds, Loc: LMComLib.LineIds): AddRewiseCmd{
  return {UserId: UserId, Line: Line, Loc: Loc};
}
export interface BookGroupSrc {
  Id: number;
  IsDefault: boolean;
  Title: string;
  Licence: Rw.CreativeCommonLic;
  AdminEMail: string;
  Company: string;
  Words: number;
  Phrases: number;
  LocCount: number;
  Books: Array<BookSrc>;
}
export interface BookSrc {
  DbId: number;
  Perex: string;
  Title: string;
  ImageUrl: string;
  Words: number;
  Phrases: number;
  LocCount: number;
  Lessons: Array<LessonSrc>;
  LocAdminEMail: string;
}
export interface DelLessonCmd {
  UserId: number;
  DbId: number;
  Line: LMComLib.LineIds;
  Loc: LMComLib.LineIds;
}
export var DelLessonCmd_Type = 'Rew.DelLessonCmd';
export function DelLessonCmd_Create (UserId: number, DbId: number, Line: LMComLib.LineIds, Loc: LMComLib.LineIds): DelLessonCmd{
  return {UserId: UserId, DbId: DbId, Line: Line, Loc: Loc};
}
export interface DelRewiseCmd {
  UserId: number;
  Line: LMComLib.LineIds;
  Loc: LMComLib.LineIds;
}
export var DelRewiseCmd_Type = 'Rew.DelRewiseCmd';
export function DelRewiseCmd_Create (UserId: number, Line: LMComLib.LineIds, Loc: LMComLib.LineIds): DelRewiseCmd{
  return {UserId: UserId, Line: Line, Loc: Loc};
}
export interface FactSrc {
  DbId: number;
  Question: Array<FactSound>;
  Answer: Array<FactSound>;
  Type: LMComLib.FactTypes;
}
export interface FactSound {
  Text: string;
  SndKey: string;
  SndSrcs: Array<LMComLib.SoundSrcId>;
}
export interface History {
  Id: number;
}
export interface LangToLearn {
  VocabularyEmpty: boolean;
  Line: LMComLib.LineIds;
  Loc: LMComLib.LineIds;
}
export var LangToLearn_Type = 'Rew.LangToLearn';
export function LangToLearn_Create (VocabularyEmpty: boolean, Line: LMComLib.LineIds, Loc: LMComLib.LineIds): LangToLearn{
  return {VocabularyEmpty: VocabularyEmpty, Line: Line, Loc: Loc};
}
export interface LessonDataSrc {
  DbId: number;
  Facts: Array<FactSrc>;
}
export interface LessonSrc {
  Title: string;
  DbId: number;
  Words: number;
  Phrases: number;
  LocCount: number;
  RewiseSrcFacts: any;
}
export interface LineSrc {
  Line: LMComLib.LineIds;
  Words: number;
  Phrases: number;
  LocCount: number;
  Groups: Array<BookGroupSrc>;
}
export interface LocSrc {
  Loc: LMComLib.Langs;
  Lines: Array<LineSrc>;
}
export interface LocSrcCmd {
  Loc: LMComLib.LineIds;
  Crc: number;
}
export var LocSrcCmd_Type = 'Rew.LocSrcCmd';
export function LocSrcCmd_Create (Loc: LMComLib.LineIds, Crc: number): LocSrcCmd{
  return {Loc: Loc, Crc: Crc};
}
export interface LocSrcResult {
  LocSrc: LocSrc;
  Crc: number;
}
export interface MyFact extends FactSrc {
  FactId: number;
  LessDbId: number;
  Order: number;
  NextRep: number;
  Status: FactStatus;
  Histories: Array<History>;
}
export interface MyFactCmd {
  UserId: number;
  Line: LMComLib.LineIds;
  Loc: LMComLib.LineIds;
}
export var MyFactCmd_Type = 'Rew.MyFactCmd';
export function MyFactCmd_Create (UserId: number, Line: LMComLib.LineIds, Loc: LMComLib.LineIds): MyFactCmd{
  return {UserId: UserId, Line: Line, Loc: Loc};
}
export interface MyLineOption {
  Line: LMComLib.LineIds;
  Loc: LMComLib.LineIds;
  BookIds: Array<number>;
}
export var MyLineOption_Type = 'Rew.MyLineOption';
export function MyLineOption_Create (Line: LMComLib.LineIds, Loc: LMComLib.LineIds, BookIds: Array<number>): MyLineOption{
  return {Line: Line, Loc: Loc, BookIds: BookIds};
}
export interface MyRewise {
  LMComId: number;
  PCSignature: string;
  Options: MyRewiseOptions;
  UserId: number;
  ToLearns: Array<LangToLearn>;
}
export var MyRewise_Type = 'Rew.MyRewise';
export function MyRewise_Create (LMComId: number, PCSignature: string, Options: MyRewiseOptions, UserId: number, ToLearns: Array<LangToLearn>): MyRewise{
  return {LMComId: LMComId, PCSignature: PCSignature, Options: Options, UserId: UserId, ToLearns: ToLearns};
}
export interface MyRewiseCmd {
  LMComId: number;
  PCSignature: string;
  DefaultOptionsJSON: string;
}
export var MyRewiseCmd_Type = 'Rew.MyRewiseCmd';
export function MyRewiseCmd_Create (LMComId: number, PCSignature: string, DefaultOptionsJSON: string): MyRewiseCmd{
  return {LMComId: LMComId, PCSignature: PCSignature, DefaultOptionsJSON: DefaultOptionsJSON};
}
export interface MyRewiseOptions {
  ActLoc: LMComLib.LineIds;
  NativeLang: LMComLib.LineIds;
  Lines: Array<MyLineOption>;
}
export var MyRewiseOptions_Type = 'Rew.MyRewiseOptions';
export function MyRewiseOptions_Create (ActLoc: LMComLib.LineIds, NativeLang: LMComLib.LineIds, Lines: Array<MyLineOption>): MyRewiseOptions{
  return {ActLoc: ActLoc, NativeLang: NativeLang, Lines: Lines};
}
export interface MyRewiseResult {
  OptionsJSON: string;
  SignatureOK: boolean;
  UserId: number;
  ToLearns: Array<LangToLearn>;
}
export interface ReadLessonCmd {
  DbId: number;
  BookName: string;
  Loc: LMComLib.LineIds;
}
export var ReadLessonCmd_Type = 'Rew.ReadLessonCmd';
export function ReadLessonCmd_Create (DbId: number, BookName: string, Loc: LMComLib.LineIds): ReadLessonCmd{
  return {DbId: DbId, BookName: BookName, Loc: Loc};
}
export interface SaveFactCmd {
  FactId: number;
  FactJSON: string;
}
export var SaveFactCmd_Type = 'Rew.SaveFactCmd';
export function SaveFactCmd_Create (FactId: number, FactJSON: string): SaveFactCmd{
  return {FactId: FactId, FactJSON: FactJSON};
}
export interface SetMyOptionsCmd {
  UserId: number;
  OptionsJSON: string;
}
export var SetMyOptionsCmd_Type = 'Rew.SetMyOptionsCmd';
export function SetMyOptionsCmd_Create (UserId: number, OptionsJSON: string): SetMyOptionsCmd{
  return {UserId: UserId, OptionsJSON: OptionsJSON};
}
export interface Crs2RwMapItem {
  rwId: number;
  locRatioPromile: number;
}
export var LangTitles: Object = {
  '34':'\u010Cesky',
  '2':'Deutsch',
  '1':'English',
  '73':'Slovensky',
  '3':'\u0415spa\u00F1ol',
  '7':'\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
  '4':'Italiano',
  '5':'Fran\u00E7ais',
  '66':'Polski',
  '44':'Magyar',
  '41':'\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC',
  '74':'Slovenski',
  '36':'Nederlands',
  '80':'T\u00FCrk\u00E7e',
  '67':'Portugu\u00EAs',
  '84':'Ti\u1EBFng Vi\u1EC7t',
  '81':'\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430',
  '70':'Rom\u00E2n\u0103',
  '33':'Hrvatski',
  '29':'\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438',
  '88':'Bosenstina, common.cs',
  '31':'Catal\u00E0',
  '35':'Dansk',
  '38':'Suomi',
  '62':'Norsk (bokm\u00E5l)',
  '76':'Svenska',
  '50':'\u65E5\u672C\u8A9E',
  '53':'\uD55C\uAD6D\uC5B4',
  '22':'\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
  '43':'\u05E2\u05D1\u05E8\u05D9\u05EA\u200F',
  '77':'\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22',
  '54':'Latvie\u0161u\u200F',
  '55':'Lietuvi\u0173',
  '68':'Portugu\u00EAs brasileiro',
  '30':'\u7CB5\u8A9E',
  '45':'\u6587\u8A00',
  '21':'Shqip',
};
}
