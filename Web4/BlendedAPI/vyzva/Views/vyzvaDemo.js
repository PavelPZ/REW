var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    //********** RUN DEMO controller
    vyzva.keysFromCompanyTitle = ['$stateParams', '$q', function (params, def) {
            var deferred = def.defer();
            try {
                var key = params['key'];
                if (key) {
                    deferred.resolve(null);
                    return;
                }
                var companytitle = params['companytitle'];
                proxies.vyzva57services.keysFromCompanyTitle(companytitle, function (companyInfo) {
                    if (companyInfo.newCompanyId > 0) {
                        var groups = companyInfo.teacherDe ? groupsBoth : groupsEn;
                        vyzva.managerSchool.createCompany(companyInfo.newCompanyId, groups, null, function (newComp) {
                            proxies.vyzva57services.loadCompanyData(companyInfo.newCompanyId, function (str) {
                                //nahrazeni puvodnich klicu nove vygenerovanymi
                                var fillCompUserData = function (key, userData) {
                                    key.keyStr = keys.toString({ licId: userData.licId, counter: userData.licCounter });
                                    key.firstName = userData.firstName;
                                    key.lastName = userData.lastName;
                                    key.email = userData.email;
                                    key.lmcomId = userData.lmcomId;
                                    return key;
                                };
                                fillCompUserData(newComp.managerKeys[0], companyInfo.admin);
                                fillCompUserData(newComp.studyGroups[0].lectorKeys[0], companyInfo.teacher);
                                fillCompUserData(newComp.studyGroups[0].studentKeys[0], companyInfo.student);
                                if (companyInfo.teacherDe)
                                    fillCompUserData(newComp.studyGroups[1].lectorKeys[0], companyInfo.teacherDe);
                                if (companyInfo.studentDe)
                                    fillCompUserData(newComp.studyGroups[1].studentKeys[0], companyInfo.studentDe);
                                //ulozeni company
                                proxies.vyzva57services.writeCompanyData(companyInfo.newCompanyId, JSON.stringify(newComp), function () { return deferred.resolve(companyInfo); });
                            });
                        });
                    }
                    else {
                        deferred.resolve(companyInfo);
                    }
                });
            }
            finally {
                return deferred.promise;
            }
        }];
    var groupsEn = [
        {
            "groupId": 1,
            "title": "Třída 2.B, Angličtina",
            "line": LMComLib.LineIds.English,
            "num": "20",
            "isPattern3": false
        },
    ];
    var groupsBoth = [
        {
            "groupId": 1,
            "title": "Třída 2.B, Angličtina",
            "line": LMComLib.LineIds.English,
            "num": "20",
            "isPattern3": false
        },
        {
            "groupId": 2,
            "title": "Třída 3.A, Němčina",
            "line": LMComLib.LineIds.German,
            "num": "20",
            "isPattern3": false
        }
    ];
    var runController = (function (_super) {
        __extends(runController, _super);
        function runController($scope, $state, companyInfo) {
            _super.call(this, $scope, $state);
            this.companyInfo = companyInfo;
            if (!companyInfo) {
                var keyStr = $state.params['key'];
                var key = keys.fromString(keyStr);
                this.navigateLow(key);
                throw 'vyzvademo.ts, runController ABORT';
            }
            this.masterKey = keys.toString({ licId: companyInfo.masterLicId, counter: companyInfo.masterLLicCounter });
            if (Utils.endWith(companyInfo.companyTitle, ' *'))
                companyInfo.companyTitle = companyInfo.companyTitle.substr(0, companyInfo.companyTitle.length - 2);
            this.hashGerman = !!companyInfo.studentDe;
            $('#splash').hide();
        }
        runController.prototype.navigateLow = function (key) {
            var _this = this;
            proxies.vyzva57services.runDemoInformation(key.licId, key.counter, function (res) {
                var ctx = {
                    companyid: res.companyId,
                    producturl: blended.encodeUrl(res.productUrl),
                    loginid: res.lmcomId,
                    companyId: res.companyId,
                    lickeys: _.map(res.licKeys, function (key) {
                        var parts = key.split('|');
                        return keys.toString({ licId: parseInt(parts[0]), counter: parseInt(parts[1]) });
                    }).join('#'),
                    loc: Trados.actLang,
                    persistence: null,
                    taskid: '',
                    homelinktype: _this.companyInfo ? 'vyzvademo' : '',
                    vyzvademocompanytitle: _this.companyInfo ? _this.companyInfo.companyTitle : '',
                };
                blended.finishContext(ctx);
                //login
                var cookie = { id: res.lmcomId, EMail: res.email, FirstName: res.firstName, LastName: res.lastName, Type: res.otherType, Roles: 0 };
                LMStatus.setCookie(cookie, false);
                LMStatus.Cookie = cookie;
                LMStatus.onLogged(function () {
                    //after login
                    var statName;
                    switch (ctx.productUrl) {
                        case '/lm/blcourse/langmastermanager.product/':
                            statName = vyzva.stateNames.langmasterManager.name;
                            break;
                        case '/lm/blcourse/schoolmanager.product/':
                            statName = vyzva.stateNames.shoolManager.name;
                            break;
                        default:
                            statName = blended.prodStates.home.name;
                            break;
                    }
                    _this.navigate({ stateName: statName, pars: ctx });
                });
            });
        };
        runController.prototype.navigateKey = function (keyCode) {
            var user = this.companyInfo[keyCode];
            //var key: keys.Key = keys.fromString(this.ctx[keyName].trim());
            var key = { licId: user.licId, counter: user.licCounter };
            this.navigateLow(key);
            //proxies.vyzva57services.runDemoInformation(key.licId, key.counter, res => {
            //  var ctx: blended.learnContext = {
            //    companyid: res.companyId,
            //    producturl: blended.encodeUrl(res.productUrl),
            //    loginid: res.lmcomId,
            //    companyId: res.companyId,
            //    lickeys: _.map(res.licKeys, key => {
            //      var parts = key.split('|');
            //      return keys.toString({ licId: parseInt(parts[0]), counter: parseInt(parts[1]) });
            //    }).join('#'),
            //    loc: Trados.actLang,
            //    persistence: null,
            //    taskid: '',
            //    homelinktype: 'vyzvademo',
            //    vyzvademocompanytitle: this.companyInfo.companyTitle,
            //  };
            //  blended.finishContext(ctx);
            //  //login
            //  var cookie = <any>{ id: res.lmcomId, EMail: res.email, FirstName: res.firstName, LastName: res.lastName, Type: res.otherType, Roles: 0 };
            //  LMStatus.setCookie(cookie, false);
            //  LMStatus.Cookie = cookie;
            //  LMStatus.onLogged(() => {
            //    //after login
            //    var statName: string;
            //    switch (ctx.productUrl) {
            //      case '/lm/blcourse/langmastermanager.product/': statName = vyzva.stateNames.langmasterManager.name; break;
            //      case '/lm/blcourse/schoolmanager.product/': statName = vyzva.stateNames.shoolManager.name; break;
            //      default: statName = blended.prodStates.home.name; break;
            //    }
            //    this.navigate({ stateName: statName, pars: ctx });
            //  });
            //});
        };
        runController.$inject = ['$scope', '$state', '$keysFromCompanyTitle'];
        return runController;
    })(blended.controller);
    vyzva.runController = runController;
})(vyzva || (vyzva = {}));
//http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz&#/vyzvademo?teacher=9Q1ZNF4V&admin=92XR5UQH&student=9659NYB3&studentempty=9659NYB3
//http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz&#/vyzvademo?teacher=99CE7PA1&admin=9659NKW6&student=9KUV3Z4B&studentempty=9U912GV1
//http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz#/vyzvademo?companytitle=asdsadfasdfsadf
//http://blendedtest.langmaster.cz/schools/index_cs_cz.html#/vyzvademo?companytitle=asdsadfasdfsadf
//http://blended.langmaster.cz/schools/index_cs_cz.html#/vyzvademo?companytitle=asdsadfasdfsadf 
