namespace common {

  export interface IDispatchAction {
    type: string;
    payload?: {};
    meta?: string;
    error?: string;
  }

  export interface IConfig {
  }

}