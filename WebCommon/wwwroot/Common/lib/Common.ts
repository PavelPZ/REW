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
    stateCreated?: utils.TAsync<void>;
    authKnown?: utils.TAsync<oauth.IAuthCookie>;
  }
  export var ctxPropName = 'data';
  export var webConfig: IData;

  export function callStateCreated(compl: utils.TCallback) {
    var creates: Array<utils.TAsync<void>> = [];
    for (var p in cfg.data) { var ic: IInitProcConfig = cfg.data[p]; if (ic.stateCreated) creates.push(ic.stateCreated); }
    utils.callAsyncs<void>(creates, compl);
  }

  export function callAuthKnown(auth: oauth.IAuthCookie, compl: utils.TCallback) {
    var creates: Array<utils.TAsync<oauth.IAuthCookie>> = [];
    for (var p in cfg.data) { var ic: IInitProcConfig = cfg.data[p]; if (ic.authKnown) creates.push(ic.authKnown); }
    utils.callAsyncs<oauth.IAuthCookie>(creates, compl);
  }

}

namespace loger {
  var indent = '';
  export function log(msg: string, ind: number = 0) {
    if (ind < 0 && indent.length >= 2) indent = indent.substr(2);
    console.log(indent + msg);
    if (ind > 0) indent += '  ';
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

  export type TDirectory<T> = { [name: string]: T; };

  export function isString(obj): boolean { return typeof obj === 'string'; }
  export function isNumber(value) { return typeof value === 'number'; }
  export var isArray = Array.isArray;
  export function isEmpty(obj): boolean {
    if (!obj) return true;
    if (isString(obj) && obj == '') return true;
    return false;
  }
  export function isObject(value) { return value !== null && typeof value === 'object'; }
  export function isFunction(value) { return typeof value === 'function'; }

  export function isNaN(obj): boolean { return isNumber(obj) && obj !== +obj; }
  export function toNumber(par: any, def: number = 0): number { var res = parseFloat(par); return isNaN(res) ? 0 : res; }
  export function toBoolean(par: any, def: boolean = false): boolean { return par === 'true'; }

  export function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  export function assignDeep(src: Object, dest: Object) {
    if (!src || !dest) return;
    for (var p in src) {
      var sr = src[p]; var ds = dest[p];
      if (isObject(sr)) assignDeep(sr, ds);
      else dest[p] = sr;
    }
  }

  export function callAsyncs<T>(creates: Array<TAsync<T>>, compl: utils.TCallback, par?: T) {
    var promises = creates.map(create => new Promise((resolve, reject) => create(() => resolve(), par)));
    Promise.all(promises).then(() => compl());
  }
  export type TAsync<T> = (compl: utils.TCallback, par?: T) => void;

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

