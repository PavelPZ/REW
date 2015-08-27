module vyzva {
  export class managerLANGMaster extends blended.controller {
    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state);
      this.enteredProduct = resolves[0];
    }

    enteredProduct: intranet.IEnteredProductInfoResult;

  }
}