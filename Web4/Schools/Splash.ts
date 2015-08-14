//POUZIVA se pro zobrazeni chyby v JSCrambler ochrane, viz boot.ts,  export function Error(): void { Pager.loadPage(new splash.licenceError());  }
module splash {

  export class Page extends Pager.Page {
    constructor() {
      super(null, null, null);
    }
    bodyTmpl = 'Dummy';
    template(): string { return 'splashRoot'; }
  }

  export var error: schools.licenceResponse;
  export class licenceError extends Page {
    constructor() {
      super();
      this.data = error;
      this.isUserMonthExpired = error.result == schools.licenceResult.userMonthExpired;
      switch (error.result) {
        case schools.licenceResult.demoExpired: this.text = "Trial period expired at " + Utils.intToDateStr(error.DemoExpired); break;
        case schools.licenceResult.userMonthExpired: this.text = "Number of licences exceeded"; break;
        default: this.text = "other"; break;
      }
    }
    data: schools.licenceResponse;
    bodyTmpl = 'licenceError';
    text: string;
    isUserMonthExpired: boolean;
  }

  $.views.helpers({
    licenceRespUser: (usr: schools.licenceRespUser) => {
      return usr.Id.split('-')[1] + ' ' + usr.Name + ' ' + (_.isEmpty(usr.rootCourse) ? '' : CourseMeta.lib.findProduct(usr.rootCourse).title);
    },
    licenceRespBuy: (buy: schools.licenceRespBuy) => {
      return Utils.intToDateStr(buy.Created) + ": " + buy.UserMonths + " licences";
    },
  });

}