module vyzva {
  export class faqController extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService) {
      super($scope, $state);
      $('#splash').hide();
    }
  }

  blended.rootModule
    .directive('vyzva$faq$item', () => new vyzva$faq$item())
    .directive('vyzva$faq$toc', ['$anchorScroll', ($anchorScroll) => new vyzva$faq$toc($anchorScroll)])
  ;

  export class vyzva$faq$item implements ng.IDirective {
    scope = { title: '@title', type: '@type'};
    restrict = 'EA';
    transclude = true;
    templateUrl = 'vyzva$faq$item.html';
    link = (scope: ITocScope) => {
      var id = 'tocitem-' + (vyzva$faq$item.count++).toString();
      scope.datatoc = { id: id, title: scope.title, type: scope.type };
      scope.id = id;
      scope.gotoTop = () => {
        $('html, body').animate({
          scrollTop: $(document.body).offset().top
        }, 500);
      };
    };
    static count = 0;
  }

  export class vyzva$faq$toc implements ng.IDirective {
    constructor(public $anchorScroll: ng.IAnchorScrollService) { }
    link = (scope, el) => {
      setTimeout(() => {
        var items: Array<ITocItem> = [];
        $('[data-toc]').each((idx, el) => items.push($(el).data('toc')));
        scope.groups = _.groupBy(items, it => it.type);
        scope.$apply();
        scope.click = (it: ITocItem) => {

          $('html, body').animate({
            scrollTop: $('#' + it.id).offset().top
          }, 500);
          //this.$anchorScroll.yOffset = $('#' + it.id); this.$anchorScroll();
        };
      });
    };
    restrict = 'EA';
    templateUrl = 'vyzva$faq$toc.html';
  }
  interface ITocScope extends ng.IScope, ITocItem { type: string; title: string; datatoc: ITocItem; gotoTop? }
  interface ITocItem { type: string; title: string; id: string; }

}