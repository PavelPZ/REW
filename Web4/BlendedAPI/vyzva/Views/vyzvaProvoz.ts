module vyzva {
  export var vyzvaProvoz = ['$stateParams', '$q', (params: {}, def: ng.IQService) => {
    var deferred = def.defer<IVyzvaProvozResult>();
    try {
      var companytitle = params['companytitle'];
      proxies.vyzva57services.createEmptyCompany(companytitle, res => {
        deferred.resolve({ licId: res.licId, licCounter: res.licCounter, companyTitle: companytitle });
      });
    } finally { return deferred.promise }
  }];

  export interface ICreateEmptySchoolResult {
    licId: number;
    licCounter: number;
  }

  export interface IVyzvaProvozResult extends ICreateEmptySchoolResult {
    companyTitle: string;
  }

  export class vyzvaProvozController extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, public companyInfo: IVyzvaProvozResult) {
      super($scope, $state);
      this.masterKey = keys.toString({ licId: companyInfo.licId, counter: companyInfo.licCounter });
      $('#splash').hide();
    }
    masterKey: string;
    static $inject = ['$scope', '$state', '$vyzvaProvoz'];
  }
}