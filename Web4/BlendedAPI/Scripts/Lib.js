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
            $scope.state = $state.current;
            $scope.params = ($state.params);
            finishContext($scope.params);
            $scope.events = this;
        }
        controller.$inject = ['$scope', '$state'];
        return controller;
    })();
    blended.controller = controller;
    blended.baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu
    function cloneContext(ctx) { var res = {}; $.extend(res, ctx); return res; }
    blended.cloneContext = cloneContext;
    function finishContext(ctx) {
        if (ctx.$http && ctx.$q)
            return ctx;
        ctx.producturl = decodeUrl(ctx.producturl);
        ctx.url = decodeUrl(ctx.url);
        var inj = angular.injector(['ng']);
        ctx.$http = (inj.get('$http'));
        ctx.$q = (inj.get('$q'));
        return ctx;
    }
    blended.finishContext = finishContext;
})(blended || (blended = {}));
