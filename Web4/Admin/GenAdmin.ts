/// <reference path="../login/GenLogin.ts" />
module Admin {
export enum DictEntryCmdType {
  loadDict = 0,
  saveEntry = 1,
  statistics = 2,
}

export enum CmdXrefDataOpers {
  nodeTypes = 0,
  typeProps = 1,
  typePropValues = 2,
  typeLinks = 3,
  typePropLinks = 4,
  typePropValueLinks = 5,
  nodeProps = 6,
  propValues = 7,
  propLinks = 8,
  propValueLinks = 9,
  refreshXref = 10,
  checkAll = 11,
}

export interface CmdAlocKeys {
  LicenceId: number;
  Num: number;
}
export var CmdAlocKeys_Type = 'Admin.CmdAlocKeys';
export function CmdAlocKeys_Create (LicenceId: number, Num: number): CmdAlocKeys{
  return {LicenceId: LicenceId, Num: Num};
}
export interface CmdGetProducts {
  CompanyId: number;
  incUsedKeys: boolean;
}
export var CmdGetProducts_Type = 'Admin.CmdGetProducts';
export function CmdGetProducts_Create (CompanyId: number, incUsedKeys: boolean): CmdGetProducts{
  return {CompanyId: CompanyId, incUsedKeys: incUsedKeys};
}
export interface CmdGetDepartment {
  CompanyId: number;
}
export var CmdGetDepartment_Type = 'Admin.CmdGetDepartment';
export function CmdGetDepartment_Create (CompanyId: number): CmdGetDepartment{
  return {CompanyId: CompanyId};
}
export interface CmdSetDepartment {
  CompanyId: number;
  Departments: Department;
  IntervalsConfig: IntervalsConfig;
}
export var CmdSetDepartment_Type = 'Admin.CmdSetDepartment';
export function CmdSetDepartment_Create (CompanyId: number, Departments: Department, IntervalsConfig: IntervalsConfig): CmdSetDepartment{
  return {CompanyId: CompanyId, Departments: Departments, IntervalsConfig: IntervalsConfig};
}
export interface CmdGetDepartmentResult {
  Departments: Department;
  UsedIds: Array<number>;
  IntervalsConfig: IntervalsConfig;
}
export interface Department {
  Id: number;
  Title: string;
  Items: Array<Department>;
  isNew: boolean;
}
export interface IntervalsConfig {
  Secs: Intervals;
  Scores: Intervals;
  Periods: Intervals;
}
export interface Intervals {
  Items: Array<Interval>;
}
export interface Interval {
  From: number;
  Title: string;
}
export interface CmdGetUsers {
  IncUsers: boolean;
  IncComps: boolean;
  CompIds: Array<number>;
}
export var CmdGetUsers_Type = 'Admin.CmdGetUsers';
export function CmdGetUsers_Create (IncUsers: boolean, IncComps: boolean, CompIds: Array<number>): CmdGetUsers{
  return {IncUsers: IncUsers, IncComps: IncComps, CompIds: CompIds};
}
export interface CmdGetUsersResult {
  Users: Array<UserItem>;
  Comps: Array<Comp>;
  CompUsers: Array<CompUserItem>;
}
export var CmdGetUsersResult_Type = 'Admin.CmdGetUsersResult';
export function CmdGetUsersResult_Create (Users: Array<UserItem>, Comps: Array<Comp>, CompUsers: Array<CompUserItem>): CmdGetUsersResult{
  return {Users: Users, Comps: Comps, CompUsers: CompUsers};
}
export interface CmdSetProducts {
  CompanyId: number;
  Products: Array<Product>;
}
export var CmdSetProducts_Type = 'Admin.CmdSetProducts';
export function CmdSetProducts_Create (CompanyId: number, Products: Array<Product>): CmdSetProducts{
  return {CompanyId: CompanyId, Products: Products};
}
export interface CmdSetUsers {
  Users: Array<UserItem>;
  OldComps: Array<Comp>;
  Comps: Array<Comp>;
  CompUsers: Array<CompUserItem>;
}
export var CmdSetUsers_Type = 'Admin.CmdSetUsers';
export function CmdSetUsers_Create (Users: Array<UserItem>, OldComps: Array<Comp>, Comps: Array<Comp>, CompUsers: Array<CompUserItem>): CmdSetUsers{
  return {Users: Users, OldComps: OldComps, Comps: Comps, CompUsers: CompUsers};
}
export interface Comp {
  Id: number;
  Deleted: boolean;
  Title: string;
  UserId: number;
  EMail: string;
}
export interface CompUserItem {
  UserId: number;
  Deleted: boolean;
  EMail: string;
  CompanyId: number;
  Role: LMComLib.CompUserRole;
}
export interface Product {
  Id: number;
  LastCounter: number;
  Days: number;
  ProductId: string;
  Deleted: boolean;
  UsedKeys: number;
}
export interface UserItem {
  LMComId: number;
  Deleted: boolean;
  EMail: string;
}
export interface CmdDsgnReadFile {
  FileName: string;
}
export var CmdDsgnReadFile_Type = 'Admin.CmdDsgnReadFile';
export function CmdDsgnReadFile_Create (FileName: string): CmdDsgnReadFile{
  return {FileName: FileName};
}
export interface CmdDsgnReadFiles {
  FileNames: Array<string>;
}
export var CmdDsgnReadFiles_Type = 'Admin.CmdDsgnReadFiles';
export function CmdDsgnReadFiles_Create (FileNames: Array<string>): CmdDsgnReadFiles{
  return {FileNames: FileNames};
}
export interface CmdDsgnWriteDictWords {
  FileName: string;
  Data: string;
}
export var CmdDsgnWriteDictWords_Type = 'Admin.CmdDsgnWriteDictWords';
export function CmdDsgnWriteDictWords_Create (FileName: string, Data: string): CmdDsgnWriteDictWords{
  return {FileName: FileName, Data: Data};
}
export interface CmdDsgnResult {
  Data: Array<string>;
}
export interface CmdGetPublProjects {
  PublisherId: string;
}
export var CmdGetPublProjects_Type = 'Admin.CmdGetPublProjects';
export function CmdGetPublProjects_Create (PublisherId: string): CmdGetPublProjects{
  return {PublisherId: PublisherId};
}
export interface CmdGetPublProjectsResultItem {
  Line: LMComLib.LineIds;
  ProjectId: string;
  User: string;
  Password: string;
  Title: string;
}
export interface CmdGetPublProjectsResult {
  projects: Array<CmdGetPublProjectsResultItem>;
}
export interface CmdCreatePublProjectItem {
  skill: string;
  skillTitle: string;
  template: string;
  instr: string;
  pages: number;
}
export interface CmdCreatePublProject {
  Line: LMComLib.LineIds;
  PublisherId: string;
  ProjectId: string;
  User: string;
  Password: string;
  Title: string;
  TestItems: Array<CmdCreatePublProjectItem>;
}
export var CmdCreatePublProject_Type = 'Admin.CmdCreatePublProject';
export function CmdCreatePublProject_Create (Line: LMComLib.LineIds, PublisherId: string, ProjectId: string, User: string, Password: string, Title: string, TestItems: Array<CmdCreatePublProjectItem>): CmdCreatePublProject{
  return {Line: Line, PublisherId: PublisherId, ProjectId: ProjectId, User: User, Password: Password, Title: Title, TestItems: TestItems};
}
export interface CmdPublChangePassword {
  PublisherId: string;
  ProjectId: string;
  User: string;
  Title: string;
  Password: string;
}
export var CmdPublChangePassword_Type = 'Admin.CmdPublChangePassword';
export function CmdPublChangePassword_Create (PublisherId: string, ProjectId: string, User: string, Title: string, Password: string): CmdPublChangePassword{
  return {PublisherId: PublisherId, ProjectId: ProjectId, User: User, Title: Title, Password: Password};
}
export interface CmdPublBuild {
  PublisherId: string;
  ProjectId: string;
}
export var CmdPublBuild_Type = 'Admin.CmdPublBuild';
export function CmdPublBuild_Create (PublisherId: string, ProjectId: string): CmdPublBuild{
  return {PublisherId: PublisherId, ProjectId: ProjectId};
}
export interface DictEntryCmd {
  type: DictEntryCmdType;
  crsLang: LMComLib.Langs;
  natLang: LMComLib.Langs;
  entryId: string;
  soundMaster: string;
  html: string;
  okCrs: LMComLib.Langs;
  okCrsMaybe: LMComLib.Langs;
  todoCount: number;
  allCount: number;
}
export var DictEntryCmd_Type = 'Admin.DictEntryCmd';
export function DictEntryCmd_Create (type: DictEntryCmdType, crsLang: LMComLib.Langs, natLang: LMComLib.Langs, entryId: string, soundMaster: string, html: string, okCrs: LMComLib.Langs, okCrsMaybe: LMComLib.Langs, todoCount: number, allCount: number): DictEntryCmd{
  return {type: type, crsLang: crsLang, natLang: natLang, entryId: entryId, soundMaster: soundMaster, html: html, okCrs: okCrs, okCrsMaybe: okCrsMaybe, todoCount: todoCount, allCount: allCount};
}
export interface DictEntryRes {
  entries: Array<DictEntryCmd>;
}
export interface CmdXrefData {
  oper: CmdXrefDataOpers;
  type: string;
  prop: string;
  value: string;
  nodeId: number;
  maxLinks: number;
  urlContext: string;
}
export var CmdXrefData_Type = 'Admin.CmdXrefData';
export function CmdXrefData_Create (oper: CmdXrefDataOpers, type: string, prop: string, value: string, nodeId: number, maxLinks: number, urlContext: string): CmdXrefData{
  return {oper: oper, type: type, prop: prop, value: value, nodeId: nodeId, maxLinks: maxLinks, urlContext: urlContext};
}
export interface CmdXrefDataResult {
  names: Array<string>;
  links: Array<xrefLink>;
  error: string;
}
export interface xrefLink {
  title: string;
  url: string;
}
export interface CompanyUsers {
  Users: Array<CompanyUser>;
}
export interface CompanyUser {
  EMail: string;
  Roles: LMComLib.CompUserRole;
}
export interface UserCompanies {
  Companies: Array<UserCompany>;
}
export interface UserCompany {
  compId: string;
  DepartmentId: number;
  Roles: LMComLib.CompUserRole;
  Products: Array<UserProduct>;
}
export interface UserProduct {
  ProductId: string;
  LicKeyId: number;
  Created: number;
  CourseDays: number;
}
}

