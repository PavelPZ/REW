module vyzva {

  blended.rootModule
    .directive('vyzva$home$item', () => new homeLesson())
  ;

  export class homeLesson { //implements ILearnPlanLesson{
    templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/lesson.html';
    scope = { ts: '&ts', api: "&api" };
  }

}