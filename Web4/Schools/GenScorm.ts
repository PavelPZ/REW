module scorm {
export interface ScormCmd extends LMComLib.Cmd {
  companyId: number;
  productId: string;
  scormId: string;
  date: number;
}
export interface Cmd_Logger extends ScormCmd {
  id: string;
  data: string;
}
export var Cmd_Logger_Type = 'scorm.Cmd_Logger';
export function Cmd_Logger_Create (id: string, data: string, companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_Logger{
  return {id: id, data: data, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
export interface Cmd_resetModules extends ScormCmd {
  modIds: Array<string>;
}
export var Cmd_resetModules_Type = 'scorm.Cmd_resetModules';
export function Cmd_resetModules_Create (modIds: Array<string>, companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_resetModules{
  return {modIds: modIds, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
export interface Cmd_readCrsResults extends ScormCmd {
}
export var Cmd_readCrsResults_Type = 'scorm.Cmd_readCrsResults';
export function Cmd_readCrsResults_Create (companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_readCrsResults{
  return {companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
export interface Cmd_readModuleResults extends ScormCmd {
  key: string;
}
export var Cmd_readModuleResults_Type = 'scorm.Cmd_readModuleResults';
export function Cmd_readModuleResults_Create (key: string, companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_readModuleResults{
  return {key: key, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
export interface Cmd_saveUserData extends ScormCmd {
  data: Array<Array<string>>;
}
export var Cmd_saveUserData_Type = 'scorm.Cmd_saveUserData';
export function Cmd_saveUserData_Create (data: Array<Array<string>>, companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_saveUserData{
  return {data: data, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
export interface Cmd_createArchive extends ScormCmd {
}
export var Cmd_createArchive_Type = 'scorm.Cmd_createArchive';
export function Cmd_createArchive_Create (companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_createArchive{
  return {companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
export interface Cmd_testResults extends ScormCmd {
}
export var Cmd_testResults_Type = 'scorm.Cmd_testResults';
export function Cmd_testResults_Create (companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_testResults{
  return {companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
export interface Cmd_testCert extends ScormCmd {
  loc: LMComLib.Langs;
}
export var Cmd_testCert_Type = 'scorm.Cmd_testCert';
export function Cmd_testCert_Create (loc: LMComLib.Langs, companyId: number, productId: string, scormId: string, lmcomId: number, sessionId: number): Cmd_testCert{
  return {loc: loc, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId};
}
}
