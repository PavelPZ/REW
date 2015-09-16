
module angular$course {

  interface IAngularCourseScope extends ng.IScope {
    ctrl?: Course.tagImpl,
    exService?: blended.exerciseService,
    ts?: controller,
  }

  ko.bindingHandlers['angularjs'] = {
    init: function (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) {

      var directiveName = valueAccessor();
      var el = angular.element('<' + directiveName + '/>');
      $(element).append(el);
      var compiled = blended.compile(el);

      var ctrl: Course.tagImpl = bindingContext.$data;
      var exService = <blended.exerciseService>(ctrl._myPage.blendedExtension);

      var scope: IAngularCourseScope = blended.rootScope.$new(); //true, rootScope);
      scope.ctrl = ctrl;
      scope.exService = exService;
      compiled(scope);
      //scope.$apply();
    },
  };

  class controller {
    constructor($scope: IAngularCourseScope) {
      $scope.ts = this; this.ctrl = $scope.ctrl; this.exService = $scope.exService;
    }
    ctrl: Course.tagImpl;
    exService: blended.exerciseService
  }

  //********************** audiocapture$humaneval
  class audiocapture$humaneval extends controller {
    constructor($scope: IAngularCourseScope) {
      super($scope);
    }
    visible() { return this.exService.lectorMode && this.exService.isTest; }
    ctrl: Course.audioCaptureImpl;
  }

  //Direktiva vznika v:
  //- kodu D:\LMCom\REW\Web4\BlendedAPI\app.ts, ko.bindingHandlers['angularjs']
  //- datech napr. D:\LMCom\REW\Web4\Courses\Media.html
  blended.rootModule.directive('course$audiocapture$humaneval', () => {
    return {
      restrict : 'E',
      controller: audiocapture$humaneval,
      templateUrl: 'course$audiocapture$humaneval.html'
    };
  });
}