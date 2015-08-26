var blended;
(function (blended) {
    (function (levelIds) {
        levelIds[levelIds["A1"] = 0] = "A1";
        levelIds[levelIds["A2"] = 1] = "A2";
        levelIds[levelIds["B1"] = 2] = "B1";
        levelIds[levelIds["B2"] = 3] = "B2";
    })(blended.levelIds || (blended.levelIds = {}));
    var levelIds = blended.levelIds;
    function encodeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\//g, '!');
    }
    blended.encodeUrl = encodeUrl;
    function decodeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\!/g, '/');
    }
    blended.decodeUrl = decodeUrl;
    function newGuid() { return (new Date().getTime() + (startGui++)).toString(); }
    blended.newGuid = newGuid;
    var startGui = new Date().getTime();
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
    //export function getStateChain($state: angular.ui.IStateService): Array<angular.ui.IState> {
    //  var res = [];
    //  var stWrapper = <any>$state.$current;
    //  while (stWrapper) {
    //    res.push(stWrapper);
    //    stWrapper = stWrapper.parent;
    //  }
    //  return res;
    //}
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
