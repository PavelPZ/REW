var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var angular$course;
(function (angular$course) {
    ko.bindingHandlers['angularjs'] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var directiveName = valueAccessor();
            var el = angular.element('<' + directiveName + '/>');
            $(element).append(el);
            var compiled = blended.compile(el);
            var ctrl = bindingContext.$data;
            var exService = (ctrl._myPage.blendedExtension);
            var scope = blended.rootScope.$new(); //true, rootScope);
            scope.ctrl = ctrl;
            scope.exService = exService;
            compiled(scope);
            //scope.$apply();
        },
    };
    var controller = (function () {
        function controller($scope) {
            $scope.ts = this;
            this.ctrl = $scope.ctrl;
            this.exService = $scope.exService;
        }
        return controller;
    })();
    //********************** audiocapture$humaneval
    var audiocapture$humaneval = (function (_super) {
        __extends(audiocapture$humaneval, _super);
        function audiocapture$humaneval($scope) {
            _super.call(this, $scope);
        }
        audiocapture$humaneval.prototype.visible = function () { return this.exService.isLector && this.exService.isTest; };
        return audiocapture$humaneval;
    })(controller);
    //Direktiva vznika v:
    //- kodu D:\LMCom\REW\Web4\BlendedAPI\app.ts, ko.bindingHandlers['angularjs']
    //- datech napr. D:\LMCom\REW\Web4\Courses\Media.html
    blended.rootModule.directive('course$audiocapture$humaneval', function () {
        return {
            restrict: 'E',
            controller: audiocapture$humaneval,
            templateUrl: 'course$audiocapture$humaneval.html'
        };
    });
})(angular$course || (angular$course = {}));
