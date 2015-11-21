/// <reference path="../jslib/js/GenLMComLib.ts" />
module Login {
export enum CmdLmLoginError {
  no = 0,
  userExist = 1,
  cannotFindUser = 2,
  passwordNotExists = 3,
}

export enum Role {
  Admin = 1,
  Comps = 2,
  All = 255,
}

export enum EnterLicenceResult {
  ok = 0,
  added = 1,
  used = 2,
  wrongId = 3,
  wrongCounter = 4,
}

export enum CmdReportType {
  evaluators = 0,
  test = 1,
}

export interface CmdAdjustUser {
  provider: LMComLib.OtherType;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
}
export var CmdAdjustUser_Type = 'Login.CmdAdjustUser';
export function CmdAdjustUser_Create (provider: LMComLib.OtherType, providerId: string, email: string, firstName: string, lastName: string): CmdAdjustUser{
  return {provider: provider, providerId: providerId, email: email, firstName: firstName, lastName: lastName};
}
export interface CmdAdjustScormUser {
  companyHost: string;
  login: string;
  firstName: string;
  lastName: string;
  isNotAttempted: boolean;
  productId: string;
}
export var CmdAdjustScormUser_Type = 'Login.CmdAdjustScormUser';
export function CmdAdjustScormUser_Create (companyHost: string, login: string, firstName: string, lastName: string, isNotAttempted: boolean, productId: string): CmdAdjustScormUser{
  return {companyHost: companyHost, login: login, firstName: firstName, lastName: lastName, isNotAttempted: isNotAttempted, productId: productId};
}
export interface CmdAdjustScormUserResult {
  Cookie: LMComLib.LMCookieJS;
  companyId: number;
}
export interface CmdConfirmRegistration extends LMComLib.Cmd {
}
export var CmdConfirmRegistration_Type = 'Login.CmdConfirmRegistration';
export function CmdConfirmRegistration_Create (lmcomId: number, sessionId: number): CmdConfirmRegistration{
  return {lmcomId: lmcomId, sessionId: sessionId};
}
export interface CmdChangePassword extends LMComLib.Cmd {
  oldPassword: string;
  newPassword: string;
}
export var CmdChangePassword_Type = 'Login.CmdChangePassword';
export function CmdChangePassword_Create (oldPassword: string, newPassword: string, lmcomId: number, sessionId: number): CmdChangePassword{
  return {oldPassword: oldPassword, newPassword: newPassword, lmcomId: lmcomId, sessionId: sessionId};
}
export interface CmdLmLogin {
  login: string;
  email: string;
  password: string;
  otherData: string;
  ticket: string;
}
export var CmdLmLogin_Type = 'Login.CmdLmLogin';
export function CmdLmLogin_Create (login: string, email: string, password: string, otherData: string, ticket: string): CmdLmLogin{
  return {login: login, email: email, password: password, otherData: otherData, ticket: ticket};
}
export interface CmdMyInit extends LMComLib.Cmd {
}
export var CmdMyInit_Type = 'Login.CmdMyInit';
export function CmdMyInit_Create (lmcomId: number, sessionId: number): CmdMyInit{
  return {lmcomId: lmcomId, sessionId: sessionId};
}
export interface CmdSaveDepartment {
  userId: number;
  companyId: number;
  departmentId?: number;
}
export var CmdSaveDepartment_Type = 'Login.CmdSaveDepartment';
export function CmdSaveDepartment_Create (userId: number, companyId: number, departmentId: number): CmdSaveDepartment{
  return {userId: userId, companyId: companyId, departmentId: departmentId};
}
export interface CmdProfile extends LMComLib.Cmd {
  Cookie: LMComLib.LMCookieJS;
}
export var CmdProfile_Type = 'Login.CmdProfile';
export function CmdProfile_Create (Cookie: LMComLib.LMCookieJS, lmcomId: number, sessionId: number): CmdProfile{
  return {Cookie: Cookie, lmcomId: lmcomId, sessionId: sessionId};
}
export interface CmdRegister extends CmdProfile {
  password: string;
  subSite: LMComLib.SubDomains;
}
export var CmdRegister_Type = 'Login.CmdRegister';
export function CmdRegister_Create (password: string, subSite: LMComLib.SubDomains, Cookie: LMComLib.LMCookieJS, lmcomId: number, sessionId: number): CmdRegister{
  return {password: password, subSite: subSite, Cookie: Cookie, lmcomId: lmcomId, sessionId: sessionId};
}
export interface MyCompany {
  Title: string;
  Id: number;
  RoleEx: LMComLib.CompUserRole;
  Courses: Array<LMComLib.MyCourse>;
  DepTree: Admin.CmdGetDepartmentResult;
  DepSelected?: number;
  companyProducts: Array<CourseMeta.product>;
  PublisherOwnerUserId: number;
}
export interface MyData {
  UserId: number;
  IP: string;
  Companies: Array<MyCompany>;
  Roles: LMComLib.Role;
}
export interface CmdEnterLicKey extends LMComLib.Cmd {
  CompLicId: number;
  Counter: number;
}
export var CmdEnterLicKey_Type = 'Login.CmdEnterLicKey';
export function CmdEnterLicKey_Create (CompLicId: number, Counter: number, lmcomId: number, sessionId: number): CmdEnterLicKey{
  return {CompLicId: CompLicId, Counter: Counter, lmcomId: lmcomId, sessionId: sessionId};
}
export interface CmdEnterLicKeyResult {
  res: EnterLicenceResult;
  CompanyId: number;
  ProductId: string;
  Expired: number;
}
export interface CmdHumanEvalManagerLangs {
  lmcomId: number;
  companyId: number;
}
export var CmdHumanEvalManagerLangs_Type = 'Login.CmdHumanEvalManagerLangs';
export function CmdHumanEvalManagerLangs_Create (lmcomId: number, companyId: number): CmdHumanEvalManagerLangs{
  return {lmcomId: lmcomId, companyId: companyId};
}
export interface CmdHumanEvalManagerLangsResult {
  lines: Array<HumanEvalManagerLangItem>;
}
export interface HumanEvalManagerLangItem {
  line: LMComLib.LineIds;
  count: number;
}
export interface CmdHumanEvalManagerEvsGet {
  lmcomId: number;
  companyId: number;
}
export var CmdHumanEvalManagerEvsGet_Type = 'Login.CmdHumanEvalManagerEvsGet';
export function CmdHumanEvalManagerEvsGet_Create (lmcomId: number, companyId: number): CmdHumanEvalManagerEvsGet{
  return {lmcomId: lmcomId, companyId: companyId};
}
export interface CmdHumanEvalManagerEvsItem {
  companyUserId: number;
  email: string;
  name: string;
  evalInfos: Array<LMComLib.HumanEvalInfo>;
}
export interface CmdHumanEvalManagerEvsSave {
  companyUserId: number;
  companyId: number;
  email: string;
  evalInfos: Array<LMComLib.HumanEvalInfo>;
}
export var CmdHumanEvalManagerEvsSave_Type = 'Login.CmdHumanEvalManagerEvsSave';
export function CmdHumanEvalManagerEvsSave_Create (companyUserId: number, companyId: number, email: string, evalInfos: Array<LMComLib.HumanEvalInfo>): CmdHumanEvalManagerEvsSave{
  return {companyUserId: companyUserId, companyId: companyId, email: email, evalInfos: evalInfos};
}
export interface CmdHumanEvalManagerGet {
  lmcomId: number;
  courseLang: LMComLib.LineIds;
  companyId: number;
}
export var CmdHumanEvalManagerGet_Type = 'Login.CmdHumanEvalManagerGet';
export function CmdHumanEvalManagerGet_Create (lmcomId: number, courseLang: LMComLib.LineIds, companyId: number): CmdHumanEvalManagerGet{
  return {lmcomId: lmcomId, courseLang: courseLang, companyId: companyId};
}
export interface CmdHumanEvalManagerGetResult {
  evaluators: Array<CmdHumanEvaluatorGet>;
  toEvaluate: Array<CmdHumanStudent>;
}
export interface CmdHumanEvaluatorGet {
  companyUserId: number;
  email: string;
  name: string;
  toDo: Array<CmdHumanStudent>;
}
export interface CmdHumanStudent {
  courseUserId: number;
  productId: string;
  assigned: number;
}
export interface CmdHumanEvalManagerSet {
  evaluators: Array<CmdHumanEvaluatorSet>;
}
export var CmdHumanEvalManagerSet_Type = 'Login.CmdHumanEvalManagerSet';
export function CmdHumanEvalManagerSet_Create (evaluators: Array<CmdHumanEvaluatorSet>): CmdHumanEvalManagerSet{
  return {evaluators: evaluators};
}
export interface CmdHumanEvaluatorSet {
  companyUserId: number;
  courseUserIds: Array<number>;
}
export interface CmdHumanEvalGet {
  lmcomId: number;
  companyId: number;
}
export var CmdHumanEvalGet_Type = 'Login.CmdHumanEvalGet';
export function CmdHumanEvalGet_Create (lmcomId: number, companyId: number): CmdHumanEvalGet{
  return {lmcomId: lmcomId, companyId: companyId};
}
export interface CmdHumanEvalGetResult {
  companyUserId: number;
  todo: Array<HumanEvalGetResultItem>;
}
export interface HumanEvalGetResultItem {
  courseUserId: number;
  companyUserId: number;
  productId: string;
  assigned: number;
}
export interface CmdHumanEvalTest {
  companyUserId: number;
  courseUserId: number;
}
export var CmdHumanEvalTest_Type = 'Login.CmdHumanEvalTest';
export function CmdHumanEvalTest_Create (companyUserId: number, courseUserId: number): CmdHumanEvalTest{
  return {companyUserId: companyUserId, courseUserId: courseUserId};
}
export interface CmdHumanEvalTestResult {
  testUser_lmcomId: number;
  urls: Array<string>;
}
export interface CmdReport {
  self: number;
  companyId: number;
  type: CmdReportType;
}
export var CmdReport_Type = 'Login.CmdReport';
export function CmdReport_Create (self: number, companyId: number, type: CmdReportType): CmdReport{
  return {self: self, companyId: companyId, type: type};
}
export interface CmdPaymentReport extends CmdReport {
  cfg: HumanPayment;
}
export var CmdPaymentReport_Type = 'Login.CmdPaymentReport';
export function CmdPaymentReport_Create (cfg: HumanPayment, self: number, companyId: number, type: CmdReportType): CmdPaymentReport{
  return {cfg: cfg, self: self, companyId: companyId, type: type};
}
export interface HumanPaymentsCfg {
  payments: Array<HumanPayment>;
}
export interface HumanPayment {
  created: number;
  lastRowVersion: number;
  prices: { [id:string]: number};
}
}

