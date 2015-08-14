module test {

  export function iframeDirective(): ng.IDirective {
    return {
      restrict: 'A',
      link: (scope: IFrameScope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        scope.id = 'id-' + (frameId++).toString();
        el.attr('src', attrs['iframedirective']);
        el.css('width', '100%');
        el.attr('width', '100%');
        el.attr('frameBorder', '0');
        el.css('height', '2000px');
        el.attr('height', '2000px');
        el.on('load', () => onIFrameResize(el));
        $(window).on('resize.' + scope.id, () => onIFrameResize(el));
        scope.$on(scope.id + '.$destroy', () => {
          el.off('load');
          $(window).off('resize.' + scope.id);
        });
      },
    }
  };
  interface IFrameScope extends ng.IScope {
    id: string;
  }

  var frameId = 0; //citac frames kvuli events namespace

  function onIFrameResize(frm: JQuery) { //zmena velikosti frame pri resize hlavniho okna
    frm.height($(window).height() - frm.offset().top - 10);
  }

}

