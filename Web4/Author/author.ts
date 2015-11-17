namespace blended {

  //*************** RESOLVER
  //http://bt.langmaster.cz/com/edit_bug.aspx?id=2196
  //adjust exercise data
  export var $getExJsonML = ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    var def = ctx.$q.defer<IGetExJsonML>();
    try {
      throw 'D:\LMCom\rew\VyzvaLib\Vyzva57Services.cs: see exception "Cannot compile blended.Vyzva57ServicesController.authorGetExJsonML to ASP.NET 5 application"';
      proxies.vyzva57services.authorGetExJsonML(ctx.Url, res => {
        var urlObj: IGetExJsonML = { exJsonML: null, other: {} };
        _.map(res.split('###'), keyVal => {
          var idx = keyVal.indexOf('|');
          if (idx < 0) return;
          var key = keyVal.substr(0, idx); var val = CourseMeta.jsonParse(keyVal.substr(idx + 1));
          if (ctx.Url == key) urlObj.exJsonML = val; else urlObj.other[key] = CourseMeta.jsonParse(keyVal.substr(idx + 1));
        });
        def.resolve(urlObj);
      });
    } finally { return def.promise; }
  }];

  export class authorExController extends controller {
    constructor($scope: ng.IScope | IStateService, $state: angular.ui.IStateService, $getExJsonML: IGetExJsonML) {
      super($scope, $state);
      this.exService = new blended.exerciseServiceSimple($getExJsonML.exJsonML, null, null);
    }
    static $inject = ['$scope', '$state', '$getExJsonML'];
    exService: blended.exerciseServiceSimple;
  }
  interface IGetExJsonML {
    exJsonML: any[];
    other: { [url: string]: Object; };
  };
}