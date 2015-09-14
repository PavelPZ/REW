var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var managerLangmaster = (function (_super) {
        __extends(managerLangmaster, _super);
        function managerLangmaster($scope, $state, intranetInfo) {
            _super.call(this, $scope, $state);
            this.intranetInfo = intranetInfo;
            this.allUsers = [];
        }
        managerLangmaster.prototype.createSchool = function () {
            var _this = this;
            proxies.vyzva57services.createDemoCompanyStart(this.schoolTitle, this.uniqueId, function (newDataResult) {
                vyzva.managerSchool.createCompany(newDataResult.companyId, managerLangmaster.groups, null, function (newComp) {
                    proxies.vyzva57services.loadCompanyData(newDataResult.fromCompanyId, function (str) {
                        //funkce na doplneni klicu vytvorenych na serveru (createDemoCompanyStart) do nove company
                        var fillCompUserData = function (id, key) {
                            var userData = _.find(newDataResult.users, function (u) { return Utils.startsWith(u.email, id + '.'); });
                            if (!userData)
                                return;
                            key.keyStr = keys.toString({ licId: userData.licId, counter: userData.licCounter });
                            key.firstName = userData.firstName;
                            key.lastName = userData.lastName;
                            key.email = userData.email;
                            key.lmcomId = userData.lmcomId;
                            return key;
                        };
                        //4 pouziti studenti v new Company
                        var newUsers = [null, null, null, null];
                        var allUsers = [];
                        //dopln klice a osobnich udaju do new company
                        _this.allUsers.push(fillCompUserData('spravce', newComp.managerKeys[0]));
                        _this.allUsers.push(fillCompUserData('ucitel1', newComp.studyGroups[0].lectorKeys[0]));
                        _this.allUsers.push(fillCompUserData('ucitel2', newComp.studyGroups[1].lectorKeys[0]));
                        _this.allUsers.push(fillCompUserData('student1', newUsers[0] = newComp.studyGroups[0].studentKeys[0]));
                        _this.allUsers.push(fillCompUserData('student2', newUsers[1] = newComp.studyGroups[0].studentKeys[1]));
                        _this.allUsers.push(fillCompUserData('student3', newUsers[2] = newComp.studyGroups[1].studentKeys[0]));
                        _this.allUsers.push(fillCompUserData('student4', newUsers[3] = newComp.studyGroups[1].studentKeys[1]));
                        _this.$scope.$apply();
                        //najdi 4 pouzite studenty v zdrojove company
                        var srcComp = (JSON.parse(str));
                        var srcUsers = _.filter(srcComp.studyGroups[0].studentKeys.slice(0).pushArray(srcComp.studyGroups[1].studentKeys.slice(0)), function (k) { return k.lmcomId > 0; });
                        //sparovani zdrojovych a novych lmcomid kvuli kopii CourseData
                        var srcToNewLMComIds = _.map(_.zip(srcUsers, newUsers), function (arr) {
                            var srcKey = arr[0];
                            if (!srcKey)
                                return null;
                            var newKey = arr[1];
                            return { fromLmcomId: srcKey.lmcomId, toLmLmcomId: newKey.lmcomId };
                        });
                        srcToNewLMComIds = _.filter(srcToNewLMComIds, function (ids) { return !!ids; });
                        //save nove company
                        proxies.vyzva57services.writeCompanyData(newDataResult.companyId, JSON.stringify(newComp), function () {
                            proxies.vyzva57services.createDemoCompanyEnd({
                                fromCompanyId: newDataResult.fromCompanyId,
                                toCompanyId: newDataResult.companyId,
                                users: srcToNewLMComIds,
                            }, function () {
                            });
                        });
                    });
                });
            });
        };
        //static ids = [ "spravce", "ucitel1", "ucitel2", "student1", "student2", "student3", "student4" ];
        //static srcCompanyId = 1;
        managerLangmaster.groups = [
            {
                "groupId": 2,
                "title": "Třída 3.A",
                "line": LMComLib.LineIds.English,
                "num": "20",
                "isPattern3": false
            },
            {
                "groupId": 1,
                "title": "Třída 2.B",
                "line": LMComLib.LineIds.English,
                "num": "20",
                "isPattern3": false
            }
        ];
        return managerLangmaster;
    })(blended.controller);
    vyzva.managerLangmaster = managerLangmaster;
})(vyzva || (vyzva = {}));
