//error v react.d.ts - chybi value link pro input element
declare namespace __React {
  interface HTMLAttributes {
    valueLink?;
  }
}

namespace flux {
  export interface IAction {
    type: string;
    meta?: string;
  }
}

namespace config {

  export interface IData { }
  export interface IObj { data: IData }
  export var cfg: IObj = { data: <any>{} };
  export var ctxPropName = 'data';
}

//ECM6 x underscore: https://www.reindex.io/blog/you-might-not-need-underscore/
//https://babeljs.io/docs/learn-es2015/
namespace utils {

  export type TDirectory<T> = { [name: string]: T; };

  export function isString(obj): boolean { return typeof obj === 'string'; }
  export function isNumber(value) { return typeof value === 'number'; }
  export function isEmpty(obj): boolean {
    if (!obj) return true;
    if (isString(obj) && obj == '') return true;
    return false;
  }
  export function isNaN(obj): boolean { return isNumber(obj) && obj !== +obj; }
  export function toNumber(par: any, def: number = 0): number { var res = parseFloat(par); return isNaN(res) ? 0 : res; }
}
