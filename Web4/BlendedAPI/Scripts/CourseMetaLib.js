var blended;
(function (blended) {
    function enocdeUrl(url) {
        return url.replace(/\//g, '!');
    }
    blended.enocdeUrl = enocdeUrl;
    function decodeUrl(url) {
        return url.replace(/\!/g, '/');
    }
    blended.decodeUrl = decodeUrl;
    function newGuid() { return (new Date().getTime() + (startGui++)).toString(); }
    blended.newGuid = newGuid;
    var startGui = new Date().getTime();
    var controller = (function () {
        function controller($scope, $state) {
            $scope.state = $state.current;
            $scope.params = $state.params;
        }
        controller.$inject = ['$scope', '$state'];
        return controller;
    })();
    blended.controller = controller;
})(blended || (blended = {}));
