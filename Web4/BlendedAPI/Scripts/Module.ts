﻿module blended {

  export enum exItemBackground { no, warning, success, danger }
  export enum exItemContent { no, check, folderOpen, folder, progressBar, waitForEvaluation }

  export interface IExItemProxy {
    node: CourseMeta.data;
    user: IExShort; //short data
    idx: number; //index v modulu
    active: boolean; //prave vybrane cviceni

    percent?: number; //pro status==doneActive: procento vyhodnoceni
    background?: exItemBackground;
    content?: exItemContent;
    waitForEvaluation?: boolean;
  }

  export class moduleServiceLow {
    node: CourseMeta.data;
    agregUser: IExShortAgreg;
    controller: controller;
    lessonType: moduleServiceType;
    exercises: Array<IExItemProxy>; //info o vsech cvicenich modulu
    onbehalfof: boolean;
    constructor(node: CourseMeta.data, type: moduleServiceType, controller: controller, forHome: boolean /*konstruktor pro pouziti service na HOME, jinak ve cviceni*/) {
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
      this.agregUser = agregateShortFromNodes(this.node, this.controller.ctx.taskid);
    }
  }

  export class moduleService extends moduleServiceLow {

    exService: exerciseService; //napojeny exercise Service
    //stavy
    exShowPanel: boolean; //packy se cvicenimi, nejsou videt pro nedodelany pretest
    exNoclickable: boolean; //packy nejsou clickable, pro nehotovy test, co neni v LECTOR modu
    moduleDone: boolean; //modul je hotov

    constructor(node: CourseMeta.data, exService: exerciseService, type: moduleServiceType, controller: exerciseTaskViewController) {
      super(node, type, controller, false);
      this.exService = exService;
      var user = getPersistData(node, controller.ctx.taskid);
      this.moduleDone = persistUserIsDone(user);
      this.refresh(this.exService.modIdx);
      this.agregUser = $.extend(this.agregUser, user);
      this.exShowPanel = this.moduleDone || this.lessonType != moduleServiceType.pretest;
    }

    refresh(actExIdx: number) {
      super.refresh(actExIdx);
      this.exNoclickable = this.lessonType == moduleServiceType.test && !this.moduleDone && !this.controller.ctx.onbehalfof;
      _.each(this.exercises, ex => {
        //active item: stejny pro vsechny pripady
        if (ex.active) { ex.content = exItemContent.folderOpen; ex.background = exItemBackground.warning; return; }
        var exDone = persistUserIsDone(ex.user);
        //nehotovy test
        if (this.lessonType == moduleServiceType.test && !this.moduleDone && !this.controller.ctx.onbehalfof) {
          ex.content = exDone ? exItemContent.check : exItemContent.folder;
          return;
        }
        //vse ostatni: nehotova lekce, hotovy test i pretest
        if (!exDone) //nehotove cviceni
          ex.content = exItemContent.folder;
        else if (ex.user.ms) { //vyhodnotitelne cviceni
          var waitForEval = waitForEvaluation(ex.user);
          ex.content = waitForEval ? exItemContent.waitForEvaluation : exItemContent.progressBar;
          ex.percent = scorePercent(ex.user);
          ex.background = waitForEval && this.controller.ctx.onbehalfof ? exItemBackground.danger : exItemBackground.success;
        } else { //nevyhodnotitelne cviceni
          ex.background = exItemBackground.success; ex.content = exItemContent.check;
        }
      });
    } 

    showResult(): boolean {
      var res = this.exService.user && this.exService.user.short && persistUserIsDone(this.exService.user.short) &&
        (this.lessonType == blended.moduleServiceType.lesson || this.moduleDone);
      return res;
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
    lectorControlTestOK?: boolean; //lektor oznacil Kontrolni test jako provedeny
  }
  export function moduleIsDone(nd: CourseMeta.data, taskId: string): boolean {
    return !_.find(nd.Items, it => { var itUd = blended.getPersistData<IExShort>(it, taskId); return !persistUserIsDone(itUd); });
  }

  export function isEx(nd: CourseMeta.data) { return CourseMeta.isType(nd, CourseMeta.runtimeType.ex); }

  export class moduleTaskController extends taskController { //task pro pruchod lekcemi (repository je seznam cviceni)

    user: IPersistNodeItem<IModuleUser>;
    exercises: Array<CourseMeta.data>;
    inCongratulation: boolean; //priznak, ze modul byl prave preveden do stavu DONE a ukazuje se congratulation dialog

    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      this.moduleParent = this;
      this.user = getPersistWrapper<IModuleUser>(this.dataNode, this.ctx.taskid, () => { return { actChildIdx: 0, flag: serviceTypeToPersistFlag(this.moduleParent.state.moduleType) }; });
      this.exercises = _.filter(this.dataNode.Items, it => isEx(it));
    }

    onExerciseLoaded(idx: number) {
      var ud = this.user.short;
      if (persistUserIsDone(ud)) { ud.actChildIdx = idx; this.user.modified = true; }
    }

    adjustChild(): taskController {
      var ud = this.user.short;
      var exNode = persistUserIsDone(ud) ? this.exercises[ud.actChildIdx] : _.find(this.exercises, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return !persistUserIsDone(itUd); });
      if (!exNode) { debugger; persistUserIsDone(ud,true); this.user.modified = true; }

      var moduleExerciseState = _.find(this.state.childs, ch => !ch.noModuleExercise);
      var state: IStateService = {
        params: cloneAndModifyContext(this.ctx, d => d.url = encodeUrl(exNode.url)),
        parent: this,
        current: moduleExerciseState,
      };
      return new moduleExerciseState.controller(state, null);
    }

    moveForward(sender: exerciseTaskViewController): moveForwardResult {
      if (this.inCongratulation) { delete this.inCongratulation; return moveForwardResult.toParent; }
      var ud = this.user.short;
      if (persistUserIsDone(ud)) {
        ud.actChildIdx = ud.actChildIdx == this.exercises.length - 1 ? 0 : ud.actChildIdx + 1;
        this.user.modified = true;
        return moveForwardResult.selfAdjustChild;
      } else {
        var exNode = _.find(this.exercises, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return !persistUserIsDone(itUd); });
        if (!exNode) { //cerstve ukonceny modul, mozno zobrazit dialog s gratulaci
          persistUserIsDone(ud,true); this.user.modified = true;
          if (this.pretestParent) return moveForwardResult.toParent;
          sender.congratulationDialog().then(
            () => sender.greenClick(),
            () => sender.greenClick()
            );
          this.inCongratulation = true;
          return moveForwardResult.selfInnner;
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