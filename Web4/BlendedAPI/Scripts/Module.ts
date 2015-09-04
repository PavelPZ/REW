module blended {

  export enum exItemBackground { no, warning, success }
  export enum exItemContent { no, check, folderOpen, folder, progressBar }

  export interface IExItemProxy {
    node: CourseMeta.data;
    user: IExShort; //short data
    idx: number; //index v modulu
    active: boolean; //prave vybrane cviceni

    percent?: number; //pro status==doneActive: procento vyhodnoceni
    background?: exItemBackground;
    content?: exItemContent;
  }

  export class moduleService {

    user: IExShort;
    type: moduleServiceType;
    exercises: Array<IExItemProxy>; //info o vsech cvicenich modulu
    product: IProductEx;
    onbehalfof: boolean;
    actEx: exerciseService;
    node: CourseMeta.data;
    controller: controller;
    //stavy
    exShowPanel: boolean;
    exNoclickable: boolean;
    score: number;

    constructor(node: CourseMeta.data, actEx: exerciseService, type: moduleServiceType, controller: controller) {
      this.node = node; this.actEx = actEx; this.controller = controller; this.type = type;
      this.onbehalfof = controller.ctx.onbehalfof > 0;
      this.refresh();
      this.exShowPanel = this.user.done || this.type != moduleServiceType.pretest;
    }

    resetExercise() { alert('reset'); }
    refresh() {
      this.exercises = _.map(_.filter(this.node.Items, it => isEx(it)), (node, idx) => {
        return {
          user: blended.getPersistData<IExShort>(node, this.controller.ctx.taskid),
          idx: idx,
          node: node,
          active: idx == this.actEx.modIdx
        };
      });
      this.user = agregateShorts(_.map(this.exercises, e => e.user));
      var moduleDone = this.user && this.user.done;
      this.exNoclickable = this.type == moduleServiceType.test && !moduleDone;
      _.each(this.exercises, ex => {
        //active item: stejny pro vsechny pripady
        if (ex.active) { ex.content = exItemContent.folderOpen; ex.background = exItemBackground.warning; return; }
        //nehotovy test
        if (this.type == moduleServiceType.test && !moduleDone) {
          ex.content = ex.user ? exItemContent.check : exItemContent.folder;
          return;
        }
        //vse ostatni: nehotova lekce, hotovy test i pretest
        if (!ex.user || !ex.user.done) //nehotove cviceni
          ex.content = exItemContent.folder;
        else if (ex.user.ms) { //vyhodnotitelne cviceni
          ex.content = exItemContent.progressBar;
          ex.percent = scorePercent(ex.user);
          ex.background = exItemBackground.success;
        } else { //nevyhodnotitelne cviceni
          ex.background = exItemBackground.success; ex.content = exItemContent.check;
        }
      });
      this.score = scorePercent (this.user);
    } 

    //skok na jine cviceni, napr. v module map panelu 
    navigateExercise(idx: number) {
      if (idx == this.actEx.modIdx) return;
      var exNode = this.exercises[idx].node;
      var ctx = cloneAndModifyContext(this.controller.ctx, c => c.url = encodeUrl(exNode.url));
      this.controller.navigate({ stateName: this.controller.state.name, pars: ctx });
    }

  }

  blended.rootModule
    .filter('vyzva$exmodule$percentheight', () => (per: number, maxHeight: number) => { return { height: ((100 - per) * maxHeight / 100).toString() + 'px' }; })
    .filter('vyzva$exmodule$percentwidth', () => (per: number, maxWidth: number) => { return { width: ((100 - per) * maxWidth / 100).toString() + 'px' }; })
    .filter('vyzva$exmodule$sec', () => (sec: number) => { return sec ? Utils.formatDateTime(sec) : null; })
    .filter('vyzva$exmodule$time', () => (sec: number) => { return sec ? Utils.formatTimeSpan(sec) : null; })
    .filter('vyzva$exmodule$score', () => (short: IExShort) => scoreText(short) )
    .directive('vyzva$exmodule$emptytest', () => {
      return {
        scope: { label: '@label', value: '@value', nobr:'@nobr' },
        template: '<span ng-if="value">{{label}}: <b>{{value}}</b></span><br ng-if="!nobr"/>'
      };
    })
    .directive('vyzva$exmodule$scoreprogress', () => { //vyzva$exmodule$percentwidth : 50 musi odpovidat .score-text {width: 50px;}
      return {
        scope: { value: '@value' },
        template: '<div class="score-bar"><div class="score-text">{{value}}%</div><div class="progress-red" ng-style="value | vyzva$exmodule$percentwidth : 50"></div></div>'
      };
    })
  ;
}