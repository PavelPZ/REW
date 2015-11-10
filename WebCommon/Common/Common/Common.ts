//error v react.d.ts - chybi value link pro input element
declare namespace __React {
  interface HTMLAttributes {
    valueLink?;
  }
  interface FormEvent {
    target: HTMLInputElement;
  }
}

namespace common {

  export interface IDispatchAction {
    type: string;
    payload?: {};
    meta?: string;
    //error?: string;
  }

  export interface IRouterAction extends common.IDispatchAction {
    isRouteAction: boolean;
  }

  export interface IGlobalCtx { }
  export interface IGlobalContext { ctx: IGlobalCtx }
  export var globalContext: IGlobalContext = { ctx: <any>{} };

}
