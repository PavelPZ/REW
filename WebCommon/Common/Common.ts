﻿namespace common {

  export interface IDispatchAction {
    type: string;
    payload?: {};
    meta?: string;
    error?: string;
  }

  export var $flux$trigger: (action: common.IDispatchAction) => void;

}