var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//POUZIVA se pro zobrazeni chyby v JSCrambler ochrane, viz boot.ts,  export function Error(): void { Pager.loadPage(new splash.licenceError());  }
var splash;
(function (splash) {
    var Page = (function (_super) {
        __extends(Page, _super);
        function Page() {
            _super.call(this, null, null, null);
            this.bodyTmpl = 'Dummy';
        }
        Page.prototype.template = function () { return 'splashRoot'; };
        return Page;
    })(Pager.Page);
    splash.Page = Page;
    splash.error;
    var licenceError = (function (_super) {
        __extends(licenceError, _super);
        function licenceError() {
            _super.call(this);
            this.bodyTmpl = 'licenceError';
            this.data = splash.error;
            this.isUserMonthExpired = splash.error.result == schools.licenceResult.userMonthExpired;
            switch (splash.error.result) {
                case schools.licenceResult.demoExpired:
                    this.text = "Trial period expired at " + Utils.intToDateStr(splash.error.DemoExpired);
                    break;
                case schools.licenceResult.userMonthExpired:
                    this.text = "Number of licences exceeded";
                    break;
                default:
                    this.text = "other";
                    break;
            }
        }
        return licenceError;
    })(Page);
    splash.licenceError = licenceError;
    $.views.helpers({
        licenceRespUser: function (usr) {
            return usr.Id.split('-')[1] + ' ' + usr.Name + ' ' + (_.isEmpty(usr.rootCourse) ? '' : CourseMeta.lib.findProduct(usr.rootCourse).title);
        },
        licenceRespBuy: function (buy) {
            return Utils.intToDateStr(buy.Created) + ": " + buy.UserMonths + " licences";
        },
    });
})(splash || (splash = {}));
