module vyzva {

  blended.rootModule
    .directive('vyzva$home$item', () => new homeLesson())
  ;

  export class homeLesson { //implements ILearnPlanLesson{
    link = (scope, el: ng.IAugmentedJQuery) => {
      var ts = <ILearnPlanLesson>(scope.ts());
      $.extend(scope, ts);
    }
    templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/lesson.html';
    scope = { ts: '&ts' };
  }

}