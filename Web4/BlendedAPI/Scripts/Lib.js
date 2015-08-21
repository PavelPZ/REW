var blended;
(function (blended) {
    function enocdeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\//g, '!');
    }
    blended.enocdeUrl = enocdeUrl;
    function decodeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\!/g, '/');
    }
    blended.decodeUrl = decodeUrl;
    function newGuid() { return (new Date().getTime() + (startGui++)).toString(); }
    blended.newGuid = newGuid;
    var startGui = new Date().getTime();
    var controller = (function () {
        function controller($scope, $state) {
            this.$state = $state;
            var params = ($state.params);
            finishContext(params);
            $.extend(this, $scope, $state.current.data);
            $scope.ts = this;
            this.urlParams = params;
        }
        controller.prototype.href = function (state, params) {
            return this.$state.href(state, params);
        };
        controller.$inject = ['$scope', '$state'];
        return controller;
    })();
    blended.controller = controller;
    blended.baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu
    function cloneAndModifyContext(ctx, modify) {
        if (modify === void 0) { modify = null; }
        var res = {};
        $.extend(res, ctx);
        if (modify) {
            modify(res);
            finishContext(res);
        }
        return res;
    }
    blended.cloneAndModifyContext = cloneAndModifyContext;
    function finishContext(ctx) {
        ctx.productUrl = decodeUrl(ctx.producturl);
        ctx.Url = decodeUrl(ctx.url);
        ctx.pretestUrl = decodeUrl(ctx.pretesturl);
        ctx.moduleUrl = decodeUrl(ctx.moduleurl);
        if (!ctx.$http) {
            var inj = angular.injector(['ng']);
            ctx.$http = (inj.get('$http'));
            ctx.$q = (inj.get('$q'));
        }
        return ctx;
    }
    blended.finishContext = finishContext;
    //************ LOGGING functions
    function traceRoute() {
        // Credits: Adam's answer in http://stackoverflow.com/a/20786262/69362
        var $rootScope = angular.element(document.querySelectorAll("[ui-view]")[0]).injector().get('$rootScope');
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
        });
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
            console.log('$stateChangeError - fired when an error occurs during transition.');
            console.log(arguments);
        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
        });
        $rootScope.$on('$viewContentLoaded', function (event) {
            console.log('$viewContentLoaded - fired after dom rendered', event);
        });
        $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
            console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
            console.log(unfoundState, fromState, fromParams);
        });
    }
    blended.traceRoute = traceRoute;
    https: function routerLogging($provide) {
        $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
                wrapMethod($delegate, '$broadcast', function (method, args) {
                    if (isNonSystemEvent(args[0]))
                        logCall('$broadcast', args);
                    return method.apply(this, args);
                });
                wrapMethod($delegate, '$emit', function (method, args) {
                    if (isNonSystemEvent(args[0]))
                        logCall('$emit', args);
                    return method.apply(this, args);
                });
                return $delegate;
                function isNonSystemEvent(eventName) {
                    return eventName && eventName[0] && eventName[0] !== '$';
                }
            }]);
        $provide.decorator('$state', ['$delegate', function ($delegate) {
                wrapMethod($delegate, 'go', function (method, args) {
                    logCall('$state.go', args);
                    return method.apply(this, args);
                });
                return $delegate;
            }]);
        function wrapMethod(obj, methodName, wrapper) {
            var original = obj[methodName];
            obj[methodName] = function () {
                var args = Array.prototype.slice.call(arguments, 0);
                return wrapper.call(this, original, args);
            };
        }
        function logCall(funcName, args) {
            var prettyArgs = args.map(function (a) { return repr(a); })
                .join(', ');
            console.log(funcName + '(' + prettyArgs + ')');
        }
        function repr(obj) {
            return JSON.stringify(obj, function (k, v) {
                if (k !== '' && v instanceof Object)
                    return '[Obj]';
                else
                    return v;
            });
        }
    }
    blended.routerLogging = routerLogging;
    ;
})(blended || (blended = {}));
