module blended {

  export function showExerciseDirective(): ng.IDirective {
    return {
      link: (scope: IShowExerciseScope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        scope.$on('$destroy', () => {
          alert('destroy');
        });
        //setTimeout(() => el.html(attrs['exUrl']), 1);
        el.html(attrs['exUrl']);
      },
    }
  };
  interface IShowExerciseScope extends ng.IScope {
    exUrl: string;
  }

  //var frameId = 0; //citac frames kvuli events namespace

  //function onIFrameResize(frm: JQuery) { //zmena velikosti frame pri resize hlavniho okna
  //  frm.height($(window).height() - frm.offset().top - 10);
  //}

}

