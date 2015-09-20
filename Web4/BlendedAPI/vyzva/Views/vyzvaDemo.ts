module vyzva {

  //********** RUN DEMO controller
  export var keysFromCompanyTitle = ['$stateParams', '$q', (params: {}, def: ng.IQService) => {
    var d = def.defer<keysFromCompanyTitleResult>();
    try {
      var companytitle = params['companytitle'];;
      proxies.vyzva57services.keysFromCompanyTitle(companytitle, companyInfo => {
        if (companyInfo.newCompanyId > 0) { //vytvoreni nove company
          managerSchool.createCompany(companyInfo.newCompanyId, managerLangmaster.groups, null, newComp => { //zalozeni nove company se studijni grupou
            proxies.vyzva57services.loadCompanyData(companyInfo.newCompanyId, str => { //nacteni nove zalozene company
              //nahrazeni puvodnich klicu nove vygenerovanymi
              var fillCompUserData = (key: intranet.IAlocatedKey, userData: userItem) => {
                key.keyStr = keys.toString({ licId: userData.licId, counter: userData.licCounter });
                key.firstName = userData.firstName; key.lastName = userData.lastName; key.email = userData.email; key.lmcomId = userData.lmcomId;
                return key;
              };
              fillCompUserData(newComp.managerKeys[0], companyInfo.admin);
              fillCompUserData(newComp.studyGroups[0].lectorKeys[0], companyInfo.teacher);
              fillCompUserData(newComp.studyGroups[0].studentKeys[0], companyInfo.student);
              //ulozeni company
              proxies.vyzva57services.writeCompanyData(companyInfo.newCompanyId, JSON.stringify(newComp), () => d.resolve(companyInfo));
            })
          });
        } else {
          d.resolve(companyInfo);
        }
      });
    } finally { return d.promise }
  }];
  export interface keysFromCompanyTitleResult {
    student: userItem; //code..licId|counter
    teacher: userItem;
    admin: userItem;
    newCompanyId: number;
    companyTitle: string;
    masterLicId: number; //hlavni klic pro spravce prazdne skoly
    masterLLicCounter: number;
  }
  export interface userItem {
    licId: number;
    licCounter: number;
    lmcomId: number;
    email: string;
    firstName: string;
    lastName: string;
  }
  var groups: Array<intranet.IStudyGroup> = [
    {
      "groupId": 1,
      "title": "Třída 2.B",
      "line": LMComLib.LineIds.English,
      "num": "20",
      "isPattern3": false
    }
  ];



  export class runController extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, public companyInfo: keysFromCompanyTitleResult) {
      super($scope, $state);
      this.masterKey = keys.toString({ licId: companyInfo.masterLicId, counter: companyInfo.masterLLicCounter });
      $('#splash').hide();
    }
    masterKey: string;
    static $inject = ['$scope', '$state', '$keysFromCompanyTitle'];

    navigateKey(keyCode: string) {
      var user: userItem = this.companyInfo[keyCode];
      //var key: keys.Key = keys.fromString(this.ctx[keyName].trim());
      var key: keys.Key = { licId: user.licId, counter: user.licCounter };
      proxies.vyzva57services.runDemoInformation(key.licId, key.counter, res => {
        var ctx: blended.learnContext = {
          companyid: res.companyId,
          producturl: blended.encodeUrl(res.productUrl),
          loginid: res.lmcomId,
          companyId: res.companyId,
          lickeys: _.map(res.licKeys, key => {
            var parts = key.split('|');
            return keys.toString({ licId: parseInt(parts[0]), counter: parseInt(parts[1]) });
          }).join('#'),
          loc: Trados.actLang,
          persistence: null,
          taskid: '',
          homelinktype: 'vyzvademo',
          vyzvademocompanytitle: this.companyInfo.companyTitle,
        };
        blended.finishContext(ctx);
        //login
        var cookie = <any>{ id: res.lmcomId, EMail: res.email, FirstName: res.firstName, LastName: res.lastName, Type: res.otherType, Roles: 0 };
        LMStatus.setCookie(cookie, false);
        LMStatus.Cookie = cookie;
        LMStatus.onLogged(() => {
          //after login
          var statName: string;
          switch (ctx.productUrl) {
            case '/lm/blcourse/langmastermanager.product/': statName = vyzva.stateNames.langmasterManager.name; break;
            case '/lm/blcourse/schoolmanager.product/': statName = vyzva.stateNames.shoolManager.name; break;
            default: statName = blended.prodStates.home.name; break;
          }
          this.navigate({ stateName: statName, pars: ctx });
        });
      });
    }
  }
}
//http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz&#/vyzvademo?teacher=9Q1ZNF4V&admin=92XR5UQH&student=9659NYB3&studentempty=9659NYB3

//http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz&#/vyzvademo?teacher=99CE7PA1&admin=9659NKW6&student=9KUV3Z4B&studentempty=9U912GV1

//http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz#/vyzvademo?companytitle=asdsadfasdfsadf
//http://blendedtest.langmaster.cz/schools/index_cs_cz.html#/vyzvademo?companytitle=asdsadfasdfsadf
//http://blended.langmaster.cz/schools/index_cs_cz.html#/vyzvademo?companytitle=asdsadfasdfsadf