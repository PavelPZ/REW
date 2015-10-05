var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vyzva;
(function (vyzva) {
    var managerLangmaster = (function (_super) {
        __extends(managerLangmaster, _super);
        function managerLangmaster($scope, $state, intranetInfo) {
            _super.call(this, $scope, $state);
            this.intranetInfo = intranetInfo;
            this.sablona4 = 1;
            this.sablona3 = 0;
            this.allUsers = []; //vystupni dato 2: seznam demouctu 
        }
        managerLangmaster.prototype.sum4 = function () { return this.priceToString(this.sablona4 * 18490); };
        managerLangmaster.prototype.sum3 = function () { return this.priceToString(this.sablona3 * 3499); };
        managerLangmaster.prototype.sum = function () { return this.priceToString(this.sablona4 * 18490 + this.sablona3 * 3499); };
        managerLangmaster.prototype.sum4NoDPH = function () { return this.priceToString(this.sablona4 * 15281); };
        managerLangmaster.prototype.sum3NoDPH = function () { return this.priceToString(this.sablona3 * 2892); };
        managerLangmaster.prototype.sumNoDPH = function () { return this.priceToString(this.sablona4 * 15281 + this.sablona3 * 2892); };
        managerLangmaster.prototype.priceToString = function (price) {
            var s = price.toString();
            return s.substr(0, s.length - 3) + ' ' + s.substr(s.length - 3);
        };
        managerLangmaster.prototype.url = function () {
            var host = location.href.split('/')[2];
            return 'http://' + host + (host == 'localhost' ? '/Web4/Schools/NewEA.aspx?lang=cs-cz' : '/schools/index_cs_cz.html');
        };
        managerLangmaster.prototype.encodetitle = function () { return this.url() + '#/vyzvademo?companytitle=' + encodeURIComponent(this.schoolTitle); };
        managerLangmaster.prototype.vyzvaProvoz = function () { return this.url() + '#/vyzvaprovoz?companytitle=' + encodeURIComponent('"' + this.schoolTitle + '"'); };
        managerLangmaster.prototype.exportLectorInfoToXml = function () {
            blended.downloadExcelFile(Pager.basicUrl + 'vyzva57services/lmlectorexportinfotoxml');
            //downloadExcelReport({ type: reportType.managerStudy, companyId: this.ctx.companyid });
            // invoke('vyzva57services/lmlectorexportinfotoxml', 'get', null, null, completed);
            //proxies.vyzva57services.lmLectorExportInfoToXml($.noop);
        };
        //encodetitle(): string { return 'http://' + location.href.split('/')[2] + '/schools/index_cs_cz.html#/vyzvademo?companytitle=' + encodeURIComponent(this.schoolTitle); }
        //encodetitle(): string { return 'http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz#/vyzvademo?companytitle=' + encodeURIComponent(this.schoolTitle); }
        //vyzvaProvoz(): string { return 'http://' + location.href.split('/')[2] + '/schools/index_cs_cz.html#/vyzvaprovoz?companytitle=' + encodeURIComponent('"' + this.schoolTitle + '"'); }
        //vyzvaProvoz(): string { return 'http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz#/vyzvaprovoz?companytitle=' + encodeURIComponent('"' + this.schoolTitle + '"'); }
        managerLangmaster.prototype.gotoLicKey = function () {
            this.navigate({ stateName: 'vyzvademo', pars: { key: this.licKeyForGoto } });
        };
        //ostry klic pro spravce skoly
        managerLangmaster.prototype.createEmptySchool = function () {
            var _this = this;
            proxies.vyzva57services.createEmptyCompany(this.schoolTitle, function (emptyResult) {
                _this.key = keys.toString({ licId: emptyResult.licId, counter: emptyResult.licCounter });
                _this.$scope.$apply();
            });
        };
        //seznam demouctu 
        managerLangmaster.prototype.createSchool = function () {
            var _this = this;
            proxies.vyzva57services.createDemoCompanyStart(this.schoolTitle, this.uniqueId, function (newDataResult) {
                vyzva.managerSchool.createCompany(newDataResult.companyId, managerLangmaster.groups, null, function (newComp) {
                    proxies.vyzva57services.loadCompanyData(newDataResult.fromCompanyId, function (str) {
                        //funkce na doplneni klicu vytvorenych na serveru (createDemoCompanyStart) do nove company
                        var fillCompUserData = function (id, role, key) {
                            var userData = _.find(newDataResult.users, function (u) { return Utils.startsWith(u.email, id + '.'); });
                            if (!userData)
                                return;
                            key.keyStr = keys.toString({ licId: userData.licId, counter: userData.licCounter });
                            key.firstName = userData.firstName;
                            key.lastName = userData.lastName;
                            key.email = userData.email;
                            key.lmcomId = userData.lmcomId;
                            key.role = role;
                            return key;
                        };
                        //4 pouziti studenti v new Company
                        var newUsers = [null, null, null, null];
                        var allUsers = [];
                        //dopln klice a osobnich udaju do new company
                        _this.allUsers.push(fillCompUserData('spravce', 'Správce', newComp.managerKeys[0]));
                        _this.allUsers.push(fillCompUserData('ucitel1', 'Učitele, možnost 1', newComp.studyGroups[0].lectorKeys[0]));
                        _this.allUsers.push(fillCompUserData('ucitel2', 'Učitele, možnost 2', newComp.studyGroups[1].lectorKeys[0]));
                        _this.allUsers.push(fillCompUserData('student1', 'Studenta, možnost 1', newUsers[0] = newComp.studyGroups[0].studentKeys[0]));
                        _this.allUsers.push(fillCompUserData('student2', 'Studenta, možnost 2', newUsers[1] = newComp.studyGroups[0].studentKeys[1]));
                        _this.allUsers.push(fillCompUserData('student3', 'Studenta, možnost 3', newUsers[2] = newComp.studyGroups[1].studentKeys[0]));
                        _this.allUsers.push(fillCompUserData('student4', 'Studenta, možnost 4', newUsers[3] = newComp.studyGroups[1].studentKeys[1]));
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
