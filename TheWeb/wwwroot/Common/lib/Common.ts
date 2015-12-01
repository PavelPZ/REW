namespace flux {
  export interface IAction {
    moduleId: string;
    actionId: string;
    meta?: string;
  }
}

namespace config {

  export interface IData { }
  export interface IObj { data: IData }
  export var cfg: IObj = { data: <any>{} };
  export interface IInitProcConfig {
    initAppState?: utils.TAsync; //inicializace bez ohledu na aktualni ROUTE. Volana na zacatku "flux.initApplication", napr. sance inicializovat svoji cast STATE
    //init_authKnown?: utils.TAsync; //inicializace modulu v okamziku po prihlaseni. POZOR: po LM prihlaseni se musi volat refresh stranky (preruseni SPA aplikace)
    //init_domTreeReady?: utils.TAsync<void>; //inicializace modulu v okamziku po vykresleni DOM.
  }
  export var ctxPropName = 'data';
  export var webConfig: IData;

  //asynchronni init: zacatek "flux.initApplication", napr. sance inicializovat svoji cast STATE
  export function onInitAppState(compl: utils.TCallback) {
    var creates: Array<utils.TAsync> = [];
    for (var p in cfg.data) { var ic: IInitProcConfig = cfg.data[p]; if (ic.initAppState) creates.push(ic.initAppState); }
    utils.callAsyncs(creates, compl);
  }

  //asynchronni init: volana po prihlaseni
  //export function onInit_authKnown(compl: utils.TCallback) {
  //  var creates: Array<utils.TAsync> = [];
  //  for (var p in cfg.data) { var ic: IInitProcConfig = cfg.data[p]; if (ic.init_authKnown) creates.push(ic.init_authKnown); }
  //  utils.callAsyncs(creates, compl);
  //}

}

namespace loger {
  var indent = '';
  export function log(msg: string, ind: number = 0) {
    if (ind < 0 && indent.length >= 2) indent = indent.substr(2);
    console.log(indent + msg);
    if (ind > 0) indent += '  ';
  }
  export function doThrow(msg: string):any {
    debugger;
    throw msg;
  }
}

//ECM6 x underscore: https://www.reindex.io/blog/you-might-not-need-underscore/
//https://babeljs.io/docs/learn-es2015/
namespace utils {

  export type TCallback = () => void;
  export type bytes = Array<number>;
  export type byte = number;
  export type char = string;
  export type base64 = string;
  export var Noop: TCallback = () => { };

  export type TDirectory<T> = { [name: string]: T; };

  export function isNumber(value) { return typeof value === 'number'; }
  export var isArray = Array.isArray;
  export function isObject(value) { return value !== null && typeof value === 'object'; }
  export function isFunction(value) { return typeof value === 'function'; }

  export function isNaN(obj): boolean { return isNumber(obj) && obj !== +obj; }
  export function toNumber(par: any, def: number = 0): number { var res = parseFloat(par); return isNaN(res) ? 0 : res; }
  export function toBoolean(par: any, def: boolean = false): boolean { return par === 'true'; }

  //export function guid(): string {
  //  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
  //    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
  //    return v.toString(16);
  //  });
  //}

  export function assignDeep(src: Object, dest: Object) {
    if (!src || !dest) return;
    for (var p in src) {
      var sr = src[p]; var ds = dest[p];
      if (isObject(sr)) assignDeep(sr, ds);
      else dest[p] = sr;
    }
  }

  export function callAsyncs(creates: Array<TAsync>, compl: utils.TCallback) {
    var promises = creates.map(create => new Promise((resolve, reject) => create(() => resolve())));
    Promise.all(promises).then(() => compl());
  }
  export type TAsync = (compl: utils.TCallback) => void;

  export function guid(): string {
    return sessionStart.toString() + '-' + (guidCount++).toString();
  }

  var sessionStart = new Date().getTime();
  var guidCount = Math.random();
}

namespace base64 {
  //http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  //jak dostat byte number z bytes[i]:  byte = bytes.charCodeAt(i) nebo var byteArray = new Uint8Array(byteNumbers);
  export function encode(bytes: utils.bytes): string {
    if (!bytes) return null;
    let src = crypt.byteArrayToString(bytes as Array<number>);
    return window.btoa(src);
  }
  export function decode(base: utils.base64): utils.bytes {
    var bytes = window.atob(base);
    return crypt.stringToByteArray(bytes);
  }

}

