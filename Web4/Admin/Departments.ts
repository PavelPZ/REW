module schoolAdmin {

  export class Departments extends CompModel {
    constructor(urlParts: string[]) {
      super(editDepartmentTypeName, urlParts);
      var self = this;
    }

    treeModel: TreeView.Model;
    th = ko.observable('Dummy');
    listModels: listModelMeta[] = [
      { model: null, template: ko.observable('Dummy'), id:'study_periods', title: CSLocalize('5c160f5326584d0e9edcf9e293e76f32', 'Study Periods') },
      { model: null, template: ko.observable('Dummy'), id: 'time intervals', title: CSLocalize('84566284da7f4cdab2d27e86bc5e58a8', 'Time Intervals') },
      { model: null, template: ko.observable('Dummy'), id: 'score_ntervals', title: CSLocalize('4166679903f548f88f67ef4f7fa4eb0c', 'Score Intervals') }
    ];
                                                                    
    update(completed: () => void): void {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Admin.CmdGetDepartment_Type,
        Admin.CmdGetDepartment_Create(this.CompanyId),
        (res: Admin.CmdGetDepartmentResult) => {
          var isNew = res.Departments == null;
          this.treeModel = new TreeView.Model(
            isNew ? { Id: 0, Title: this.title(), Items: null, isNew: true } : <any>res.Departments,
            isNew,
            (nd: Admin.Department) => _.any(res.UsedIds, id => id == nd.Id),
            { withCheckbox: false, editable: true, onLinkClick: null }
            );
          if (res.IntervalsConfig == null) res.IntervalsConfig = { Periods: { Items: null }, Secs: { Items: null }, Scores: { Items: null } };
          this.th('depTreeTemplate');

          new listModel(res.IntervalsConfig.Periods.Items, this.listModels[0], new periodDr());
          new listModel(res.IntervalsConfig.Secs.Items, this.listModels[1], new secDr());
          new listModel(res.IntervalsConfig.Scores.Items, this.listModels[2], new scoreDr());
          _.each(this.listModels, m => m.template('depListTemplate'));
          completed();
        });
    }

    ok() {
      var tree: Admin.Department = <any>this.treeModel.getResult();
      var intervals: Admin.IntervalsConfig = { Periods: this.listModels[0].model.dataFromModel(), Secs: this.listModels[1].model.dataFromModel(), Scores: this.listModels[2].model.dataFromModel() };
      Pager.ajaxPost(
        Pager.pathType.restServices,
        Admin.CmdSetDepartment_Type,
        Admin.CmdSetDepartment_Create(this.CompanyId, tree, intervals)
        );
      LMStatus.gotoReturnUrl();
    }
    cancel() { LMStatus.gotoReturnUrl(); }
  }

  export interface listModelMeta {
    model: listModel;
    template: KnockoutObservable<string>;
    title: string;
    id: string;
  }

  export class listModel {
    constructor(data: Admin.Interval[], public meta: listModelMeta, public driver: listDriver) {
      var cnt = 0;
      this.items = ko.observableArray<listItem>(_.map(data, d => new listItem(this, d, this, cnt++)));
      meta.model = this;
    }
    dataFromModel(): Admin.Intervals { var cnt = 0; return { Items: _.map(this.items(), li => { return { IntervalId: cnt++, From: li.value.valueNum(), Title: li.title.title() }; }) }; }
    items: KnockoutObservableArray<listItem>;
    newItem = ko.observable<string>();
    valueIsOK(s: string, actItem: listItem): { isOK: boolean; val: number; } {
      var res = { isOK: false, val: this.driver.toNumber(s) };
      res.isOK = res.val != cError; if (!res.isOK) return res;
      res.isOK = !_.find(this.items(), it => it != actItem && (<listCellValue>(it.value)).valueNum() == res.val);
      return res;
    }
    sort() {
      if (this.driver.isDesc()) this.items.sort((a: listItem, b: listItem) => b.value.valueNum() - a.value.valueNum()); else this.items.sort((a: listItem, b: listItem) => a.value.valueNum() - b.value.valueNum()); //reorder
    }
    onEnterEscClick(data: listModelMeta, par) {
      var self = data.model;
      try {
        if (par.keyCode !== 27) {
          var res = self.valueIsOK(self.newItem(), null);
          if (!res.isOK) return;
          self.items.push(new listItem(self, { From: res.val, Title: null }, self, self.items.length));
          self.sort();
        }
      } finally { self.newItem(''); self.newItem.valueHasMutated(); }
    }
  }
  export class listItem {
    constructor(public owner: listModel, public data: Admin.Interval, public listModel: listModel, public id: number) {
      var self = this;
      this.value = new listCellValue(this, true, this.data.From);
      this.title = new listCellTitle(this, false, this.data.Title);
      this.descr = ko.computed({
        read: () => {
          var items = self.owner.items(); var idx = items.indexOf(self);
          return self.owner.driver.customDescr(items, idx);
        },
        deferEvaluation: true,
      });
    }
    value: listCellValue;
    descr: KnockoutComputed<string>;
    title: listCellTitle;
    doDelete(): void {
      if (this.owner.items().length <= 1) return;
      this.descr.dispose();
      this.owner.items.remove(this);
    }
  }
  export class listCell {
    constructor(public listItem: listItem, public isValue: boolean) {
      this.id = listItem.listModel.meta.id + '_' + (isValue ? 'val' : 'title') + '_' + listItem.id;
    }
    id: string;
    editing = ko.observable(false);
    doEdit(): void { this.editing(true); }
    onEnterEscape(data: listCellValue, ev: KeyboardEvent): void {
      if (ev.keyCode === 27) $(ev.target).val(data.title()); /*undo*/
      data.editing(false);
    }
  }

  //http://www.jefclaes.be/2013/05/validating-composite-models-with.html 
  //https://github.com/Knockout-Contrib/Knockout-Validation/wiki
  export class listCellValue extends listCell {
    constructor(list: listItem, isLeft: boolean, valueNum: number) {
      super(list, isLeft);
      var self = this;
      self.valueNum(valueNum); var model = self.listItem.owner;
      this.title = ko.computed({
        read: () => model.driver.toString(self.valueNum()),
        write: (s: string) => {
          var res = model.valueIsOK(s, self.listItem);
          if (!res.isOK)
            self.title.notifySubscribers(model.driver.toString(self.valueNum())); //error => undo
          else {
            self.valueNum(res.val);
            model.sort();
          }
        },
      });
    }
    title: KnockoutComputed<string>;
    valueNum = ko.observable<number>();
  }
  export class listCellTitle extends listCell {
    constructor(list: listItem, isLeft: boolean, value: string) {
      super(list, isLeft);
      this.title(value ? value : '');
    }
    title = ko.observable('');
  }
  var cError = -1000;
  export interface listDriver {
    toNumber(s: string): number;
    toString(s: number): string;
    isDesc(): boolean;
    customDescr(items: listItem[], idx: number): string;
  }
  export class periodDr implements listDriver {
    toNumber(s: string): number {
      try {
        var ny = s.split('-'); if (ny.length != 2) throw 'e';
        return checkInterval(ny[0], 1, 12) + (checkInterval(ny[1], 2013, 2050) - 2000) * 100;
      } catch (e) { return cError; }
    }
    toString(s: number): string {
      var m = Utils.modulo(s, 100);
      return m.z.toString() + '-' + (m.m + 2000).toString();
    }
    isDesc(): boolean { return false; }
    customDescr(items: listItem[], idx: number): string {
      var dr = this;
      var act = Utils.modulo(items[idx].value.valueNum(), 100);
      var actStr = Globalize.format(new Date(act.m + 2000, act.z - 1, 1), 'Y', Trados.actLangNetCode);
      if (idx == items.length - 1) return actStr + ' -';
      var next = Utils.modulo(items[idx + 1].value.valueNum(), 100);
      next.z -= 1;
      if (next.z == 0) { next.m -= 1; next.z = 12; }
      if (act.z == next.z && act.m == next.m) return actStr;
      var nextStr = Globalize.format(new Date(next.m + 2000, next.z - 1, 1), 'Y', Trados.actLangNetCode);
      if (next.m == act.m && next.z == 12 && act.z == 1) return (next.m + 2000).toString();
      if (next.m == act.m) return Globalize.culture(Trados.actLangNetCode).calendars.standard.months.names[act.z - 1] + ' - ' + nextStr;
      return actStr + ' - ' + nextStr;
    }
  }
  function checkInterval(val: string, min: number, max: number): number {
    var v = parseInt(val.trim()); if (isNaN(v) || v > max || v < min) throw 'err';
    return v;
  }
  export class secDr implements listDriver {
    toNumber(s: string): number {
      try {
        var parts = s.split(/[\.\:]/);
        var res = 0; var len = parts.length;
        if (len > 4 || len < 3) throw 'e';
        if (len == 4) res += checkInterval(parts[len - 4], 0, 100) * 86400;
        res += checkInterval(parts[len - 3], 0, 23) * 3600;
        res += checkInterval(parts[len - 2], 0, 59) * 60;
        res += checkInterval(parts[len - 1], 0, 59);
        return res;
      } catch (e) { return cError; }
    }
    toString(s: number): string {
      var res = "";
      var m = Utils.modulo(s, 86400); s = m.z;
      if (m.m > 0) res += m.m.toString() + ".";
      m = Utils.modulo(s, 3600); s = m.z;
      res += (m.m > 9 ? m.m.toString() : '0' + m.m.toString()) + ':';
      m = Utils.modulo(s, 60); s = m.z;
      res += (m.m > 9 ? m.m.toString() : '0' + m.m.toString()) + ':';
      res += s > 9 ? s.toString() : '0' + s.toString();
      return res;
    }
    isDesc(): boolean { return true; }
    customDescr(items: listItem[], idx: number): string {
      var dr = this;
      if (idx == 0) return dr.toString(items[idx].value.valueNum()) + ' -';
      return dr.toString(items[idx].value.valueNum()) + ' - ' + dr.toString(items[idx - 1].value.valueNum());
    }
  }
  export class scoreDr implements listDriver {
    toNumber(s: string): number {
      try {
        return checkInterval(s, 0, 100) - 1;
      } catch (e) { return cError; }
    }
    toString(s: number): string { return (s + 1).toString(); }
    isDesc(): boolean { return true; }
    customDescr(items: listItem[], idx: number): string {
      var dr = this;
      var max = idx == 0 ? 100 : items[idx - 1].value.valueNum();
      var min = items[idx].value.valueNum() + 1;
      if (max == min) return min.toString() + '%';
      return min.toString() + ' - ' + max.toString() + '%';
    }
  }
  //Pager.registerAppLocator(appId, editDepartmentTypeName, (urlParts, completed) => completed(new Departments(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, editDepartmentTypeName, appId, editDepartmentTypeName, 1, urlParts => new Departments(urlParts)));

}

