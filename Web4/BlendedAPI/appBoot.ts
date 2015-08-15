module blended {

  export interface createStatePars {
    $stateProvider: angular.ui.IStateProvider;
    $urlRouterProvider: angular.route.IRouteProvider;
    $urlMatcherFactoryProvider: angular.ui.IUrlMatcherFactory;
    $location: ng.ILocationProvider;
  }


  export function registerOldLocator(params: createStatePars, name: string, appId: string, type: string, numOfPars: any, createModel: (urlParts: Array<string>) => Pager.Page, needsLogin = true) {
    if (_.isNumber(numOfPars)) numOfPars = [numOfPars]; //numOfPars je budto cislo nebo array cisel. Oznacuje mozne pocty parametru.
    for (var np = 0; np < numOfPars.length; np++) { //pro kazdy pocet parametru vytvor state
      var pars = '';
      for (var i = 0; i < numOfPars; i++) pars += '/:p' + i.toString();
      var url = '/' + appId + '/' + type + pars;
      debugAllRoutes.push(url); //evidence vsech validnich state urls
      params.$stateProvider.state({
        name: 'pg.old.' + name,
        url: url,
        template: "<!--old-->",
        controller: OldController,
        data: { createModel: createModel }, //
        resolve: !needsLogin ? null : {
          isLoggedIn: ['$state', ($state) => checkLoggedIn($state)] //cancel ladovani state pro stranky, pro ktere je potreba login
        }
      });
    }
  }
  export var oldLocators: Array<(params: createStatePars) => void> = []; //pro ladici ucely, validni URLS
  export var debugAllRoutes: Array<string> = [];

  function checkLoggedIn($state: angular.ui.IStateService) {
    return angular.injector(['ng']).invoke(['$q', ($q: ng.IQService) => {
      var deferred = $q.defer();
      if (!LMStatus.isLogged()) {
        deferred.reject();
        setTimeout(() => window.location.hash = Login.loginUrl(), 1);
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }]);
  }

}
