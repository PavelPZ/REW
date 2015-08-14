var test;
(function (test) {
    var PageController = (function () {
        function PageController($scope, $state) {
            $scope.model = this;
            $scope.state = $state.current;
            $scope.params = $state.params;
            if (!test.root.$scope)
                return;
            var data = ($state.current.data);
            if (!data)
                return;
            if (!data.tabName)
                data.tabName = $state.current.name;
            if (data.title)
                test.root.$scope.pageTitle = data.title;
            test.root.$scope.tabName = data.tabName;
            test.root.$scope.modalExercise = false;
            test.root.$scope.backUrl = '#';
        }
        ;
        PageController.$inject = ['$scope', '$state'];
        return PageController;
    })();
    test.PageController = PageController;
})(test || (test = {}));
