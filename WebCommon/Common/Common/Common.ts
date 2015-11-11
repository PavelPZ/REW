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

//underscore like isXXX functions
declare namespace _ {
  function isArguments(obj): boolean;
  function isFunction(obj): boolean;
  function isString(obj): boolean;
  function isNumber(obj): boolean;
  function isDate(obj): boolean;
  function isRegExp(obj): boolean;
  function isArray(obj): boolean;
}
['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', "Array"].forEach(name => {
  _['is' + name] = obj => {
    return toString.call(obj) === '[object ' + name + ']';
  };
});

namespace _ {
  export function isEmpty(obj): boolean {
    if (!obj) return true;
    if (_.isString(obj) && obj == '') return true;
    return false;
  }
  export function isNaN(obj): boolean { return _.isNumber(obj) && obj !== +obj; }
  export function toNumber(par: any, def: number = 0): number { var res = parseFloat(par); return _.isNaN(res) ? 0 : res; }
}
