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
            this.$scope = $scope;
            $scope.params = ($state.params);
            //$scope.state =
            $scope.params.$state = $state;
            finishContext($scope.params);
            $scope.events = this;
        }
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
        if (!ctx.$http) {
            var inj = angular.injector(['ng']);
            ctx.$http = (inj.get('$http'));
            ctx.$q = (inj.get('$q'));
        }
        return ctx;
    }
    blended.finishContext = finishContext;
})(blended || (blended = {}));
