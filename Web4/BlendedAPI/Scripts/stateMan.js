var blended;
(function (blended) {
    //zaregistrovany stav (v app.ts)
    var state = (function () {
        function state(st) {
            var _this = this;
            this.oldController = (st.controller);
            var self = this;
            if (this.oldController) {
                st.controller = ['$scope', '$state', function ($scope, $state) {
                        var ss = { current: self, params: ($state.params), parent: ($scope.$parent).ts, canModifyUserData: true };
                        var task = new _this.oldController(ss);
                        $scope.ts = task;
                    }];
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
        //sance osetrit nekonsistentni URL (kterou by se prislo do nekonsistentniho stavu)
        state.onRouteChangeStart = function (e, toState, toParams, $location, $state) {
            //v parents neni prodStates.homeTask (jedna se o stav mimo spravu managera, napr. na home webu)
            var st = toState;
            while (st && st != blended.prodStates.homeTask)
                st = st.parent;
            if (!st)
                return;
            //neni produkt - laduje se na home:
            var prod = blended.loader.productCache.fromCache(toParams);
            //var stateMan = new stateManager(toState, toParams);
            if (!prod) {
                if (toState == blended.prodStates.home)
                    return; //jsem na home => return (home se musi naladovat vzdy, neni z ni redirekc)
                //neni naladovan produkt a neni home page => goto home page
                e.preventDefault();
                var hash = $state.href(blended.prodStates.home.name, toParams);
                setTimeout(function () { return window.location.hash = hash; }, 1);
                return;
            }
            //vse je OK, zjisti konsistenci stavu
            var st = toState;
            while (st) {
                if (st.dataNodeUrlParName) {
                    var ss = { current: st, params: toParams, parent: null, canModifyUserData: false };
                    var task = new st.oldController(ss);
                    var url = task.modifyTargetState();
                    if (url) {
                        e.preventDefault();
                        var hash = $state.href(url.stateName, url.pars);
                        setTimeout(function () { return window.location.hash = hash; }, 1);
                        return;
                    }
                }
                st = st.parent;
            }
        };
        return state;
    })();
    blended.state = state;
})(blended || (blended = {}));
