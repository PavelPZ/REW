module vyzva {
  export class faqController extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService) {
      super($scope, $state);
    }
  }

  blended.rootModule
    .directive('vyzva$faq$item', () => new vyzva$faq$item())
    .directive('vyzva$faq$toc', () => new vyzva$faq$toc())
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
    };
    static count = 0;
  }

  export class vyzva$faq$toc implements ng.IDirective {
    link = (scope, el) => {
      setTimeout(() => {
        var items: Array<ITocItem> = [];
        $('[data-toc]').each((idx, el) => items.push($(el).data('toc')));
        scope.groups = _.groupBy(items, it => it.type);
        scope.$apply();
      });
    };
    restrict = 'EA';
    templateUrl = 'vyzva$faq$toc.html';
  }
  interface ITocScope extends ng.IScope, ITocItem { type: string; title: string; datatoc: ITocItem; }
  interface ITocItem { type: string; title: string; id: string; }

}