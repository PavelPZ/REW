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
            //this.oldController = <any>(st.controller); var self = this;
            //if (this.oldController) {
            //  var services: Array<any> = ['$scope', '$state' ];
            //  if (st.resolve) for (var p in st.resolve) services.push(p);
            //  services.push(($scope: IControllerScope, $state: angular.ui.IStateService, ...resolves: Array<Object>) => {
            //    var parent: taskController = (<any>($scope.$parent)).ts;
            //    //kontrola jestli nektery z parentu nenastavil isWrongUrl. Pokud ano, vrat fake controller
            //    if (parent && parent.isWrongUrl) {
            //      parent.isWrongUrl = false;
            //      $scope.ts = <any>{ isWrongUrl: true, parent: parent }; return;
            //    }
            //    //neni isWrongUrl, pokracuj
            //    var params = <learnContext><any>($state.params);
            //    finishContext(params);
            //    params.$state = $state;
            //    var ss: IStateService = { current: self, params: params, parent: parent, createMode: createControllerModes.navigate, $scope: $scope };
            //    var task = <controller>(new this.oldController(ss, resolves));
            //    $scope.ts = task;
            //    if (globalApi) {
            //      var api = new globalApi($scope, $state, params);
            //      $scope.api = () => api;
            //    }
            //  });
            //  st.controller = <any>services;
            //}
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
