//model pro obsah statistics iframe
module statistics {

  export class model {
    constructor() {
      instance = this;
      var statName = LowUtils.getQueryParams("view");
      this.actStat = _.find(_.flatten(_.map(this.groups, g => g.infos)), inf => inf.name == statName);
      this.actGroup = _.find(this.groups, g => _.any(g.infos, inf => inf.name == statName));
      this.emptyStat(this.actStat==null);
      setTimeout(() => this.emptyStat.valueHasMutated(), 1);
    }
    clickBtn(btnId: string) { $('#' + btnId)[0].click(); } //click na pring button

    backToCourseClick() { var url = LMStatus.getReturnUrl(); if (_.isEmpty(url)) return; window.parent.window.location.hash = url; }

    actStat: statInfo;
    actGroup: statInfoGroup;
    emptyStat = ko.observable<boolean>();

    groups: statInfoGroup[] = [
      {
        title: CSLocalize('39e15614bf92467a80574e3d3ce15879', 'Summary reports'), color: 'warning', infos: [
          { title: CSLocalize('46c1e338e2c04b9991d55739c8609f53', 'Grouped by content of the course'), name: 'NewLMComCube.Toc', hasCol: false },
          { title: CSLocalize('b235a3d7f85e4fe58c646b4ec652344e', 'Grouped by departments'), name: 'NewLMComCube.UserDepartment', hasCol: false },
          { title: CSLocalize('f6627ef3ea18406d89bc0040a6c6bc8a', 'Grouped by study periods'), name: 'NewLMComCube.YearMonth', hasCol: false }
        ]
      },
      {
        title: CSLocalize('b05b18ca78d04a2e8970420d7e16d39e', 'Monthly reports'), color: 'success', infos: [
          { title: CSLocalize('204247a660434f818291e7c86c41b432', 'Grouped by score'), name: 'MonthInfoCube.MScore.Department', hasCol: true },
          { title: CSLocalize('c2f91e353d95495c9bcac84afd679e1b', 'Grouped by spent time'), name: 'MonthInfoCube.MSec.Department', hasCol: true }
        ]
      },
      {
        title: CSLocalize('b417735ce40c4c8ea4d54c7f6e92660c', 'Reports for periods'), color: 'info', infos: [
          { title: CSLocalize('c198c1a6e8b449f2930e742180be8874', 'Grouped by score'), name: 'YearInfoCube.YScore.Department', hasCol: true },
          { title: CSLocalize('80c3d98bf14a42ac835c3686c45703e9', 'Grouped by spent time'), name: 'YearInfoCube.YSec.Department', hasCol: true }
        ]
      }
    ];

    exports: exportInfo[] = [
      { name: 'Pdf', title: 'PDF' },
      { name: 'Excel', title: 'MS Excel' },
      { name: 'Rtf', title: 'MS Word - RTF' },
      { name: 'Png', title: 'PNG' },
      { name: 'Mht', title: 'HTML - MHT' }
    ];
  }

  export function init() {
    if (!cfg) return;
    if (!LMStatus.isReturnUrl()) return;
    Trados.adjustLoc(() => {
      instance = new model();
      ko.applyBindings(instance, $('body')[0]);
    });
  }
  export var instance: model;

  export interface statInfo {
    title: string;
    name: string;
    hasCol: boolean;
  }
  export interface statInfoGroup {
    title: string;
    color: string;
    infos: statInfo[];
  }

  export interface exportInfo {
    name: string;
    title: string;
  }

}