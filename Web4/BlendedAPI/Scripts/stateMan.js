var blended;
(function (blended) {
    (function (moduleServiceType) {
        moduleServiceType[moduleServiceType["lesson"] = 0] = "lesson";
        moduleServiceType[moduleServiceType["test"] = 1] = "test";
        moduleServiceType[moduleServiceType["pretest"] = 2] = "pretest";
    })(blended.moduleServiceType || (blended.moduleServiceType = {}));
    var moduleServiceType = blended.moduleServiceType;
    function createStateData(data) { return data; }
    blended.createStateData = createStateData;
    (function (createControllerModes) {
        createControllerModes[createControllerModes["adjustChild"] = 0] = "adjustChild";
        createControllerModes[createControllerModes["navigate"] = 1] = "navigate"; //controller, vytvoreny by ui-route
    })(blended.createControllerModes || (blended.createControllerModes = {}));
    var createControllerModes = blended.createControllerModes;
    blended.globalApi;
    //export var globalApi: Function;
    //zaregistrovany stav (v app.ts)
    var state = (function () {
        function state(st) {
            var _this = this;
            this.oldController = (st.controller);
            var self = this;
            if (this.oldController) {
                var services = ['$scope', '$state'];
                if (st.resolve)
                    for (var p in st.resolve)
                        services.push(p);
                services.push(function ($scope, $state) {
                    var resolves = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        resolves[_i - 2] = arguments[_i];
                    }
                    var parent = ($scope.$parent).ts;
                    //kontrola jestli nektery z parentu nenastavil isWrongUrl. Pokud ano, vrat fake controller
                    if (parent && parent.isWrongUrl) {
                        parent.isWrongUrl = false;
                        $scope.ts = { isWrongUrl: true, parent: parent };
                        return;
                    }
                    //neni isWrongUrl, pokracuj
                    var params = ($state.params);
                    blended.finishContext(params);
                    params.$state = $state;
                    var ss = { current: self, params: params, parent: parent, createMode: createControllerModes.navigate, $scope: $scope };
                    var task = (new _this.oldController(ss, resolves));
                    $scope.ts = task;
                    if (blended.globalApi) {
                        var api = new blended.globalApi($scope, $state, params);
                        $scope.api = function () { return api; };
                    }
                });
                st.controller = services;
            }
            $.extend(this, st);
        }
        //******* Inicializace: linearizace state tree na definict states
        state.prototype.initFromStateTree = function (provider, root) {
            var _this = this;
            provider.state(this);
            _.each(this.childs, function (ch) {
                ch.parent = _this;
                ch.name = _this.name + '.' + ch.name;
                ch.initFromStateTree(provider, root);
            });
        };
        return state;
    })();
    blended.state = state;
})(blended || (blended = {}));
