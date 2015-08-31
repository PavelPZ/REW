var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var managerSchool = (function (_super) {
        __extends(managerSchool, _super);
        function managerSchool(state, resolves) {
            _super.call(this, state);
            this.groupNameCounter = 0;
            this.groups = [];
            //this.taskRoot<homeTaskController>().companyData;
            var intranetInfo = resolves[0];
            this.company = intranetInfo ? intranetInfo.companyData : null;
            this.breadcrumb = vyzva.breadcrumbBase(this, true);
            this.breadcrumb.push({ title: this.title = 'Studijní skupiny a licenční klíče', active: true });
            if (this.company) {
                this.wizzardStep = 2;
                return;
            }
            this.wizzardStep = 0;
            this.adjustWizzardButtons();
        }
        managerSchool.prototype.addItem = function (line, isPattern3) {
            this.groups.push({ groupId: managerSchool.groupIdCounter++, title: 'Skupina ' + (this.groupNameCounter++).toString(), line: line, num: isPattern3 ? 1 : 20, isPattern3: isPattern3 });
        };
        managerSchool.prototype.removeItem = function (idx) {
            this.groups.splice(idx, 1);
        };
        managerSchool.prototype.wizzardClick = function (isBack) {
            var _this = this;
            if (!isBack)
                switch (this.wizzardStep) {
                    case 0:
                        this.wizzardStep = 1;
                        break;
                    case 1:
                        var req = vyzva.intranet.lmAdminCreateLicenceKeys_request(this.groups);
                        proxies.vyzva57services.lmAdminCreateLicenceKeys(this.ctx.companyid, req, function (resp) {
                            _this.company = vyzva.intranet.lmAdminCreateLicenceKeys_reponse(_this.groups, resp);
                            /*pred zalozenim company nema sanci mit manager vice klicu. Ten jeden pridej mezi klice spravce*/
                            var actualManagerKey = _this.ctx.lickeys.split('#')[0];
                            var cook = LMStatus.Cookie;
                            _this.company.managerKeys.push({ keyStr: actualManagerKey, email: cook.EMail, firstName: cook.FirstName, lastName: cook.LastName, lmcomId: cook.id });
                            proxies.vyzva57services.lmAdminCreateCompany(_this.ctx.companyid, JSON.stringify(_this.company), function () {
                                _this.wizzardStep = 2;
                                _this.$scope.$apply();
                            });
                        });
                        break;
                }
            else
                switch (this.wizzardStep) {
                    case 1:
                        this.wizzardStep = 0;
                        break;
                }
            this.adjustWizzardButtons();
        };
        managerSchool.prototype.adjustWizzardButtons = function () {
            switch (this.wizzardStep) {
                case 0:
                    this.nextTitle = 'Další';
                    break;
                case 1:
                    this.nextTitle = 'Založ školu';
                    break;
            }
        };
        managerSchool.prototype.lineToFlagClass = function (id) {
            switch (id) {
                case LMComLib.LineIds.English: return "flag-small-english";
                case LMComLib.LineIds.German: return "flag-small-german";
                case LMComLib.LineIds.French: return "flag-small-french";
                default: return "???";
            }
        };
        managerSchool.prototype.disabled = function (line) { return _.any(this.groups, function (g) { return g.line == line && g.isPattern3; }); };
        managerSchool.prototype.debugDeletCompany = function () {
            proxies.vyzva57services.writeCompanyData(this.ctx.companyid, null, $.noop);
        };
        managerSchool.groupIdCounter = 1;
        return managerSchool;
    })(blended.controller);
    vyzva.managerSchool = managerSchool;
    blended.rootModule
        .filter('vyzva$managerschool$sablonaid', function () {
        return function (id) { return id ? "Šablona č.3" : "Šablona č.4"; };
    })
        .directive('vyzva$managerschool$usekey', function () {
        return {
            scope: { item: '&item', },
            templateUrl: 'vyzva$managerschool$usekey.html'
        };
    })
        .directive('vyzva$managerchool$usekeys', function () {
        return {
            scope: { items: '&items', },
            templateUrl: 'vyzva$managerchool$usekeys.html'
        };
    });
})(vyzva || (vyzva = {}));
//class managerSchool_usedKey {
//  constructor($scope) {
//    debugger;
//  }
//}