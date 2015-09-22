var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    vyzva.vyzvaProvoz = ['$stateParams', '$q', function (params, def) {
            var deferred = def.defer();
            try {
                var companytitle = params['companytitle'];
                proxies.vyzva57services.createEmptyCompany(companytitle, function (res) {
                    deferred.resolve({ licId: res.licId, licCounter: res.licCounter, companyTitle: companytitle });
                });
            }
            finally {
                return deferred.promise;
            }
        }];
    var vyzvaProvozController = (function (_super) {
        __extends(vyzvaProvozController, _super);
        function vyzvaProvozController($scope, $state, companyInfo) {
            _super.call(this, $scope, $state);
            this.companyInfo = companyInfo;
            this.masterKey = keys.toString({ licId: companyInfo.licId, counter: companyInfo.licCounter });
            $('#splash').hide();
        }
        vyzvaProvozController.$inject = ['$scope', '$state', '$vyzvaProvoz'];
        return vyzvaProvozController;
    })(blended.controller);
    vyzva.vyzvaProvozController = vyzvaProvozController;
})(vyzva || (vyzva = {}));
