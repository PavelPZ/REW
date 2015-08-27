module vyzva {
  export class managerSchool extends blended.controller {
    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state);
      var res = <intranet.ILoadIntranetInfoResult>(resolves[0]);
      this.enteredProduct = res.learningData;
      this.order = res.orderData; if (!this.order) this.order = <any>{ groups: [] };
    }

    enteredProduct: intranet.IEnteredProductInfoResult;
    order: intranet.ISchoolOrder;
    msgRequired = 'Povinný údaj!'
    showErrors: boolean;

    //************** ORDER
    addItem(line: LMComLib.LineIds, isPattern3: boolean) {
      this.order.groups.push({ title: '', line: line, num: isPattern3 ? 1 : 20, isPattern3: isPattern3 });
    }
    removeItem(idx: number) {
      this.order.groups.splice(idx, 1);
    }
    orderOK($invalid:boolean) {
      this.showErrors = $invalid;
      //this.
      //this.order.closed = true;
    }

    disabled(line: LMComLib.LineIds) { return _.any(this.order.groups, g => g.line == line && g.isPattern3);}


  }

}