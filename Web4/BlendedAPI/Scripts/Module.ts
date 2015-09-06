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

  export class moduleServiceLow {
    node: CourseMeta.data;
    user: IExShort;
    controller: controller;
    lessonType: moduleServiceType;
    exercises: Array<IExItemProxy>; //info o vsech cvicenich modulu
    onbehalfof: boolean;
    constructor(node: CourseMeta.data, type: moduleServiceType, controller: controller, forHome: boolean) {
      this.node = node; this.controller = controller; this.lessonType = type;
      this.onbehalfof = controller.ctx.onbehalfof > 0;
      if (forHome) this.refresh(0);
    }
    refresh(actExIdx: number) {
      this.exercises = _.map(_.filter(this.node.Items, it => isEx(it)), (node, idx) => {
        return {
          user: blended.getPersistData<IExShort>(node, this.controller.ctx.taskid),
          idx: idx,
          node: node,
          active: idx == actExIdx
        };
      });
      this.user = agregateShortFromNodes(this.node, this.controller.ctx.taskid);
    }
  }

  export class moduleService extends moduleServiceLow {

    exService: exerciseService;
    //stavy
    exShowPanel: boolean;
    exNoclickable: boolean;
    moduleDone: boolean;
    constructor(node: CourseMeta.data, exService: exerciseService, type: moduleServiceType, controller: exerciseTaskViewController) {
      super(node, type, controller, false);
      this.exService = exService;
      this.refresh(this.exService.modIdx);
      this.exShowPanel = this.user.done || this.lessonType != moduleServiceType.pretest;
    }

    showResult(): boolean {
      var res = this.exService.user && this.exService.user.short && this.exService.user.short.done &&
        (this.lessonType == blended.moduleServiceType.lesson || this.moduleDone);
      return res;
    }

    resetExercise() { alert('reset'); }
    refresh(actExIdx: number) {
      super.refresh(actExIdx);
      this.moduleDone = this.user && this.user.done;
      this.exNoclickable = this.lessonType == moduleServiceType.test && !this.moduleDone;
      _.each(this.exercises, ex => {
        //active item: stejny pro vsechny pripady
        if (ex.active) { ex.content = exItemContent.folderOpen; ex.background = exItemBackground.warning; return; }
        var exDone = ex.user && ex.user.done;
        //nehotovy test
        if (this.lessonType == moduleServiceType.test && !this.moduleDone) {
          ex.content = exDone ? exItemContent.check : exItemContent.folder;
          return;
        }
        //vse ostatni: nehotova lekce, hotovy test i pretest
        if (!exDone) //nehotove cviceni
          ex.content = exItemContent.folder;
        else if (ex.user.ms) { //vyhodnotitelne cviceni
          ex.content = exItemContent.progressBar;
          ex.percent = scorePercent(ex.user);
          ex.background = exItemBackground.success;
        } else { //nevyhodnotitelne cviceni
          ex.background = exItemBackground.success; ex.content = exItemContent.check;
        }
      });
    } 

    //skok na jine cviceni, napr. v module map panelu 
    navigateExercise(idx: number) {
      if (idx == this.exService.modIdx) return;
      var exNode = this.exercises[idx].node;
      var ctx = cloneAndModifyContext(this.controller.ctx, c => c.url = encodeUrl(exNode.url));
      this.controller.navigate({ stateName: this.controller.state.name, pars: ctx });
    }

  }

  export interface IModuleUser extends IPersistNodeUser { //course dato pro test
    actChildIdx: number;
    //na TRUE nastaveno pri nasilnem ukonceni testu tlacitkem FINISH test 
    //(protoze kdyz nejsou vyhodnocena vsechna cviceni, tak by se nepoznalo, zdali je modul ukoncen nebo ne)
    //neni jeste implementovano
    done: boolean;
  }

  export function moduleIsDone(nd: CourseMeta.data, taskId: string): boolean {
    return !_.find(nd.Items, it => { var itUd = blended.getPersistData<IExShort>(it, taskId); return (!itUd || !itUd.done); });
  }

  export function isEx(nd: CourseMeta.data) { return CourseMeta.isType(nd, CourseMeta.runtimeType.ex); }

  export class moduleTaskController extends taskController { //task pro pruchod lekcemi (repository je seznam cviceni)

    user: IPersistNodeItem<IModuleUser>;
    exercises: Array<CourseMeta.data>;
    congratulation: boolean; //priznak, ze modul byl prave preveden do stavu DONE a ukazuje se congratulation dialog

    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      //constructor(state: IStateService) {
      //  super(state);
      this.moduleParent = this;
      this.user = getPersistWrapper<IModuleUser>(this.dataNode, this.ctx.taskid, () => { return { done: false, actChildIdx: 0 }; });
      this.exercises = _.filter(this.dataNode.Items, it => isEx(it));
    }

    onExerciseLoaded(idx: number) {
      var ud = this.user.short;
      if (ud.done) { ud.actChildIdx = idx; this.user.modified = true; }
    }

    adjustChild(): taskController {
      var ud = this.user.short;
      var exNode = ud.done ? this.exercises[ud.actChildIdx] : _.find(this.exercises, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return (!itUd || !itUd.done); });
      if (!exNode) { debugger; ud.done = true; this.user.modified = true; }

      var moduleExerciseState = _.find(this.state.childs, ch => !ch.noModuleExercise);
      var state: IStateService = {
        params: cloneAndModifyContext(this.ctx, d => d.url = encodeUrl(exNode.url)),
        parent: this,
        current: moduleExerciseState,
        //createMode: createControllerModes.adjustChild
      };
      //return new moduleExerciseState.oldController(state, null);
      return new moduleExerciseState.controller(state, null);
    }

    moveForward(sender: exerciseTaskViewController): moveForwardResult {
      if (this.congratulation) { delete this.congratulation; return moveForwardResult.toParent; }
      var ud = this.user.short;
      if (ud.done) {
        ud.actChildIdx = ud.actChildIdx == this.exercises.length - 1 ? 0 : ud.actChildIdx + 1;
        this.user.modified = true;
        return moveForwardResult.selfAdjustChild;
      } else {
        var exNode = _.find(this.exercises, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return (!itUd || !itUd.done); });
        if (!ud.done && !exNode) { //cerstve hotovo
          ud.done = true; this.user.modified = true;
          return moveForwardResult.toParent;
          //this.congratulation = true; return moveForwardResult.selfInnner;
        }
        return moveForwardResult.selfAdjustChild;
      }
    }
  }

  blended.rootModule
    .filter('vyzva$exmodule$percentheight', () => (per: number, maxHeight: number) => { return { height: ((100 - per) * maxHeight / 100).toString() + 'px' }; })
    .filter('vyzva$exmodule$percentwidth', () => (per: number, maxWidth: number) => { return { width: ((100 - per) * maxWidth / 100).toString() + 'px' }; })
    .filter('vyzva$exmodule$sec', () => (sec: number) => { return sec ? Utils.formatDateTime(sec) : null; })
    .filter('vyzva$exmodule$time', () => (sec: number) => { return sec ? Utils.formatTimeSpan(sec) : null; })
    .filter('vyzva$exmodule$score', () => (short: IExShort) => scoreText(short))
    .directive('vyzva$exmodule$emptytest', () => {
      return {
        scope: { label: '@label', value: '@value', nobr: '@nobr' },
        template: '<span ng-if="value">{{label}}: <b>{{value}}</b></span><br ng-if="!nobr"/>'
      };
    })
    .directive('vyzva$exmodule$scoreprogress', () => { //vyzva$exmodule$percentwidth : 50 musi odpovidat .score-text {width: 50px;}
      return {
        scope: { value: '@value', colors: '@colors' },
        template: '<div ng-class="colors ? colors: \'score-bar\'"><div class="score-text">{{value}}%</div><div class="progress-red" ng-style="value | vyzva$exmodule$percentwidth : 50"></div></div>'
      };
    })
  ;
}