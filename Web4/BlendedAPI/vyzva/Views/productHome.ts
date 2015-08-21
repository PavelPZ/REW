﻿namespace vyzva {

  //******* Home produktu
  export class productHomeController extends controller implements IToolbar, IToolbarEmpty {
    constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
      super($scope, $state, $rootTask);
      this.title = $rootTask.dataNode.title;
      this.breadcrumb[1].active = true;

      this.prt = $rootTask.getPretestItemModel();
    }
    //************ IHomePretest
    prt: IHomePretest;
  }


  //****************** COURSE
  export interface IBlendedCourseRepository extends blended.IProductEx {
    pretest: blended.IPretestRepository; //pretest
    entryTests: Array<CourseMeta.data>; //vstupni check-testy (entryTests[0]..A1, ..)
    lessons: Array<CourseMeta.data>; //jednotlive tydenni tasky. Jeden tydenni task je seznam z kurziku nebo testu
  }

  export interface IPretestProxyUser extends blended.IPersistNodeUser {
    targetLevel?: blended.levelIds;
  }
  export interface IBlendedCourseUser extends blended.IPersistNodeUser { //user dato pro ICourseRepository
    startDate: number; //datum zacatku prvni etapy
    //child task infos
    pretest: IPretestProxyUser;
    entryTest: blended.IPersistNodeUser;
    lessons: blended.IPersistNodeUser;
  }

  export function finishProdukt(prod: IBlendedCourseRepository) {
    if (prod.pretest) return;
    var clonedLessons = _.map(_.range(0, 4), idx => <any>(_.clone(prod.Items[idx].Items))); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
    var firstPretests = _.map(clonedLessons, l => l.splice(0, 1)[0]); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
    prod.pretest = <any>(prod.find('/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/pretests/'));
    prod.entryTests = firstPretests;
    prod.lessons = clonedLessons;
    //_.each(<any>(prod.pretest.Items), (it: CourseMeta.data) => {
    //  if (it.other) $.extend(it, JSON.parse(it.other));
    //});
  }

  export function breadcrumbBase(task: blended.taskController): Array<breadcrumbItem> {
    return [
      { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() },
      { title: task.product.title, url: task.href(stateNames.productHome), active: false }
    ];
  }

  export class homeViewController extends blended.taskViewController {
    constructor($scope: blended.ITaskControllerScope, $state: angular.ui.IStateService) {
      super($scope, $state);
      this.breadcrumb = breadcrumbBase(this.myControler); this.breadcrumb[1].active = true;
    }
  }

  export class homeTaskController extends blended.taskController {
    constructor($scope: blended.ITaskControllerScope, $state: angular.ui.IStateService, $loadedProduct: blended.IProductEx) {
      super($scope, $state, 'productUrl', $loadedProduct);
      //this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      this.prt = this.getPretestItemModel();
    }
    static $inject = ['$scope', '$state', '$loadedProduct'];

    //************* TASK
    getPersistData: () => IBlendedCourseUser;
    setPersistData: (modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;
    dataNode: IBlendedCourseRepository;

    initPersistData(ud: IBlendedCourseUser) {
      super.initPersistData(ud);
      ud.startDate = Utils.nowToNum();
      ud.pretest = { url: this.dataNode.pretest.url }
    }

    moveForward(ud: IBlendedCourseUser): string {
      var childUd = this.child.getPersistData();
      if (childUd.url == ud.pretest.url) {
        var pretUser = <blended.IPretestUser>childUd; if (!pretUser.done) return 'tasks.course.doGoAhead: !pretUser.done';
        this.setPersistData(dt => { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { url: this.dataNode.entryTests[dt.pretest.targetLevel].url } });
      } else if (childUd.url == ud.entryTest.url) {
        var entryTestUser = <blended.IModuleUser>childUd; if (!entryTestUser.done) return 'tasks.course.doGoAhead: !entryTestUser.done';
        this.setPersistData(dt => { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { url: this.dataNode.lessons[dt.pretest.targetLevel].url } });
      } else if (childUd.url == ud.lessons.url) {
        var lessonsUser = childUd; if (!lessonsUser.done) return 'tasks.course.doGoAhead: !lessonsUser.done';
        this.setPersistData(dt => { dt.done = dt.lessons.done = true; }) //lesson i self je hotovo;
      } else
        return 'tasks.course.doGoAhead: unknown child url - ' + childUd.url;
      return null;
    }

    getName(): string { return stateNames.taskRoot; }

    //********** PRETEST item
    getPretestItemModel(): IHomePretest {
      var ud = this.getPersistData();
      return {
        run: () => {
          debugger;
          if (!this.child || this.child.dataNode != this.dataNode.pretest) throw '!this.child || this.child.dataNode.url != ud.pretest.url';
        },
        canRun: !ud.pretest || !ud.pretest.done,
        btnTitle: !ud.pretest ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
        resultLevel: ud.pretest.done ? blended.levelIds[ud.pretest.targetLevel] : '',
        previewUrl: stateNames.pretestHome,
      };
    }


    //************ IHomePretest
    prt: IHomePretest;
  }

}