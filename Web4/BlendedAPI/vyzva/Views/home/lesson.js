//module vyzva {
//  blended.rootModule
//    .directive('vyzva$home$lesson', () => new homeLesson())
//    .directive('vyzva$home$test', () => new homeLesson())
//  ;
//  export class homeLesson { //implements ILearnPlanLesson{
//    link = (scope: IHomeLessonScope, el: ng.IAugmentedJQuery) => {
//      var ts = scope.ts();
//      var lesson = scope.lesson();
//      var service: blended.IStateService = {
//        params: blended.cloneAndModifyContext(ts.ctx, d => d.moduleurl = blended.encodeUrl(lesson.node.url)),
//        current: lesson.isTest ? stateNames.moduleTestTask : stateNames.moduleLessonTask,
//        parent: ts,
//        createMode: blended.createControllerModes.adjustChild
//      };
//      scope.run = () => {
//        ts.child = new moduleTaskController(service);
//        var url = ts.child.goCurrent();
//        ts.navigate(url);
//      };
//    }
//    templateUrl = 'vyzva$home$lesson.html';
//    scope = { lesson: '&lesson', api: "&api", ts:'&ts' };
//  }
//  export interface IHomeLessonScope extends ng.IScope {
//    lesson(): ILearnPlanLesson;
//    api(): globalApi;
//    run: () => void;
//    ts: () => homeTaskController;
//  }
//} 
