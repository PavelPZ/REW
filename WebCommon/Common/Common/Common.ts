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

namespace common {

  export type TDirectory<T> = { [name: string]: T; };

  export interface IGlobalCtx { }
  export interface IGlobalContext { ctx: IGlobalCtx }
  export var globalContext: IGlobalContext = { ctx: <any>{} };

}

namespace _ {
  export function isString(obj): boolean { return typeof obj === 'string'; }
  export function isNumber(value) { return typeof value === 'number'; }
  export function isEmpty(obj): boolean {
    if (!obj) return true;
    if (_.isString(obj) && obj == '') return true;
    return false;
  }
  export function isNaN(obj): boolean { return _.isNumber(obj) && obj !== +obj; }
  export function toNumber(par: any, def: number = 0): number { var res = parseFloat(par); return _.isNaN(res) ? 0 : res; }
}
