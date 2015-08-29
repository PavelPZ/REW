var blended;
(function (blended) {
    blended.rootModule = angular.module('appRoot', ['ngLocale', 'ngResource', 'ui.router']);
    function registerOldLocator(params, name, appId, type, numOfPars, createModel, needsLogin) {
        if (needsLogin === void 0) { needsLogin = true; }
        if (_.isNumber(numOfPars))
            numOfPars = [numOfPars]; //numOfPars je budto cislo nebo array cisel. Oznacuje mozne pocty parametru.
        for (var np = 0; np < numOfPars.length; np++) {
            var pars = '';
            for (var i = 0; i < numOfPars; i++)
                pars += '/:p' + i.toString();
            var url = '/' + appId + '/' + type + pars;
            blended.debugAllRoutes.push(url); //evidence vsech validnich state urls
            params.$stateProvider.state({
                name: 'pg.old.' + name,
                url: url,
                template: "<!--old-->",
                controller: blended.OldController,
                data: { createModel: createModel },
                resolve: !needsLogin ? null : {
                    isLoggedIn: ['$state', function ($state) { return checkLoggedIn($state); }] //cancel ladovani state pro stranky, pro ktere je potreba login
                }
            });
        }
    }
    blended.registerOldLocator = registerOldLocator;
    blended.oldLocators = []; //pro ladici ucely, validni URLS
    blended.debugAllRoutes = [];
    function checkLoggedIn($state) {
        return angular.injector(['ng']).invoke(['$q', function ($q) {
                var deferred = $q.defer();
                if (!LMStatus.isLogged()) {
                    deferred.reject();
                    setTimeout(function () { return window.location.hash = Login.loginUrl(); }, 1);
                }
                else {
                    deferred.resolve();
                }
                return deferred.promise;
            }]);
    }
})(blended || (blended = {}));
