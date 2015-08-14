var test;
(function (test) {
    var PageController = (function () {
        function PageController($scope, $state) {
            $scope.model = this;
            $scope.state = $state.current;
            $scope.params = $state.params;
            if (!test.root.$scope)
                return;
            test.root.$scope.topBarInclude = 'app/views/topbar.html';
            var data = ($state.current.data);
            if (!data)
                return;
            if (!data.tabName)
                data.tabName = $state.current.name;
            if (data.topBarInclude)
                test.root.$scope.topBarInclude = data.topBarInclude;
            if (data.title)
                test.root.$scope.pageTitle = data.title;
            //inicializace globalnich statovych hodnot
            test.root.$scope.tabName = data.tabName;
            $scope.$on('$locationChangeStart', function () { return test.root.$scope.backUrl = window.location.hash; });
        }
        ;
        PageController.$inject = ['$scope', '$state'];
        return PageController;
    })();
    test.PageController = PageController;
})(test || (test = {}));
