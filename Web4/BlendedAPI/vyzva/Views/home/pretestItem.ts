//module vyzva {

//  blended.rootModule
//    .directive('vyzva$home$pretest', () => new homePretest())
//  ;

//  export class homePretest {
//    link = (scope, el: ng.IAugmentedJQuery) => {
//      //scope = { ts: '&ts' }; dole znamena, ze v parametr TS direktivy ae chape jako readonly odkaz na homeTaskController
//      var ts = <homeTaskController>(scope.ts());
//      var prUd = blended.getPersistData<blended.IPretestUser>(ts.dataNode.pretest, ts.ctx.taskid);
//      scope.run = () => {
//        ts.child = new blended.pretestTaskController({
//          params: blended.cloneAndModifyContext(ts.ctx, d => d.pretesturl = blended.encodeUrl(ts.dataNode.pretest.url)),
//          current: stateNames.pretestTask,
//          parent: ts,
//          createMode: blended.createControllerModes.adjustChild
//        });
//        var url = ts.child.goCurrent();
//        ts.navigate(url);
//      };
//      scope.canRun = !prUd || !prUd.done;
//      scope.btnTitle = !prUd ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test';
//      scope.targetLevel = prUd ? prUd.targetLevel : -1;
//      scope.previewUrl = stateNames.pretest.name;
//    }
//    //templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/pretestItem.html';
//    templateUrl = 'vyzva$home$pretest.html';
//    scope = { ts: '&ts', api:'&api'};
//  }

//}