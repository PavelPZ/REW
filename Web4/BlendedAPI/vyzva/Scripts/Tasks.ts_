module vyzva {

  
  export class blendedCourseTask extends blended.task {

    getPersistData: () => IBlendedCourseUser;
    setPersistData: (modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;
    dataNode: IBlendedCourseRepository;

    initPersistData(ud: IBlendedCourseUser) {
      super.initPersistData(ud);
      ud.startDate = Utils.nowToNum();
      ud.pretest = { url: this.dataNode.pretest.url }
    }

    createChild(ud: IBlendedCourseUser, completed: () => void) {
      if (!ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
        this.child = new pretestTask(this.dataNode.pretest, this.ctx, this, completed);
      } else if (!ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
        this.child = new blended.moduleTask(this.dataNode.entryTests[ud.pretest.targetLevel], this.ctx, this, completed);
      } else if (!ud.lessons.done) { //level task neexistuje nebo neni dokoncen
        this.child = new blended.listTask(this.dataNode.lessons[ud.pretest.targetLevel], this.ctx, this, completed);
      } else {
        ud.done = true; this.child = null;
        completed();
      }
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
        this.setPersistData(dt => { dt.done = true; dt.lessons.done = true; });
      } else
        return 'tasks.course.doGoAhead: unknown child url - ' + childUd.url;
      return null;
    }

    getName(): string { return vyzva.stateNames.taskRoot; }

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

    //greenBtnHash(): string {
    //  var ud = this.getPersistData();
    //  if (!ud || !ud.pretest || !ud.pretest.done) return this.ctx.$state.href(vyzva.stateNames.pretestHome);
    //  if (!ud.entryTest || !ud.entryTest.done) return this.ctx.$state.href(vyzva.stateNames.taskCheckTest, { url: this.dataNode.entryTests[ud.pretest.targetLevel].url });
    //  var actLessons = this.dataNode.lessons[ud.pretest.targetLevel].Items;
    //  var less: CourseMeta.data = _.find(actLessons, l => {
    //    var lud = blended.getPersistData(less, this.ctx.taskid);
    //    return !lud || !lud.done;
    //  });
    //  if (!less) return this.ctx.$state.href(vyzva.stateNames.pretestHome);
    //  var statusId = less.url.indexOf('/lesson') < 0 ? vyzva.stateNames.taskCheckTest : vyzva.stateNames.taskLesson;
    //  return this.ctx.$state.href(statusId, { url: less.url });
    //}

  }

  export class pretestTask extends blended.pretestTask {
    runHash(): string {
      var ud = this.getPersistData();

      return null;
    }
  }
}