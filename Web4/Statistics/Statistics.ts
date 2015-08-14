module aspx {
  export function gotoReturnUrl(): void {
    var par = window.parent; if (!par) return;
    var url = LMStatus.getReturnUrl();
    par.location.hash = url;
  }
  export function gotoHome(): void {
    var par = window.parent; if (!par) return;
    par.location.hash = '';
  }
}

module stat {

  export function init() {
    ko.applyBindings(actSelectedModel = new selectStatModel(), $('#topbar')[0]);
  }

  /**************** radioButtonsModel **********************/
  export class radioButtonsModel {
    buttons: Array<radioButton>;
    selectedButton = ko.observable<radioButton>();

    safeSetSelected(btn: radioButton) {
      var oldBtn = this.selectedButton(); if (oldBtn == btn) return;
      if (oldBtn) oldBtn.isSelected(false);
      this.selectedButton(btn);
      if (btn) btn.isSelected(true);
    }
  }

  export class radioButton {
    constructor(public owner: radioButtonsModel) {
      var self = this;
      self.click = (sender: radioButton) => _.each(owner.buttons, btn => {
        if (btn === self) owner.safeSetSelected(self);
      });
    }
    isSelected = ko.observable(false);
    click;
  }

  /**************** btnData and view Pars**********************/
  export interface btnData {
    title: string;
    items: Array<viewData>;
  }

  export interface viewData {
    viewId: string;
    closeStack: string;
    owner: selectBtn;
    par: viewPar;
  }

  export interface viewPar {
    visible: boolean;
  }

  export interface outline_user_mainPar extends viewPar {
    productUrl: string;
    expandLevel: number;
  }

  export interface outline_user_detailPar extends viewPar {
    productUrl: string;
    tocId: string;
    detailType: string;
  }

  var outline_user_main: viewData, outline_user_detail: viewData,
    outline_user_main_par: outline_user_mainPar = <any>{ },
    outline_user_detail_par: outline_user_detailPar = <any>{};

  var config: Array<btnData> = [
    {
      title: 'Course<br />Content', items: [
        outline_user_main = { viewId: 'outline_user_main', closeStack: null, par: outline_user_main_par, owner: null },
        outline_user_detail = { viewId: 'outline_user_detail', closeStack: 'outline_user_main', par: outline_user_detail_par, owner: null, }
      ]
    },
    //{ title: 'Company<br />Department', items: null },
    //{ title: 'Study<br />Period', items: null }
  ];

  var views: { [viewId: string]: viewData; } = {};
  _.each(config, it => { if (it.items) _.each(it.items, itt => views[itt.viewId] = itt); });
  var viewPars: { [viewId: string]: viewPar; } = {};
  _.each(config, it => { if (it.items) _.each(it.items, itt => viewPars[itt.viewId] = itt.par); });

  /**************** selectStatModel **********************/
  export class selectStatModel extends radioButtonsModel {
    constructor() {
      super();
      this.buttons = _.map(config, d => new selectBtn(this, d));
      _.each(this.buttons, (b: selectBtn) => _.each(b.data.items, it => { it.owner = b; it.par.visible = false; }));

      this.selectedButton.subscribe((newVal: selectBtn) => {
        if (newVal && newVal.data.items) viewsManager.open(newVal.data.items[0].viewId); else this.title(null);
      });
    }
    title = ko.observable('');
    btnSelected: KnockoutComputed<boolean>;
  } var removeTags: RegExp = /<.*?>/;

  export class selectBtn extends radioButton {
    constructor(owner: selectStatModel, public data: btnData) {
      super(<any>owner);
      var self = this;
      this.isSelected.subscribe(newVal => { if (newVal) owner.title(self.data.title.replace(removeTags, ' ')); });
    }
  }
  var actSelectedModel: selectStatModel;

  /**************** viewsManager **********************/
  export class viewsManager {

    static open(viewId: string, fillPar: (par: viewPar) => void = null) {
      viewsManager.actViewId = viewId;
      for (var p in views) {
        $('#' + p + '_place').hide();
        views[p].par.visible = false;
      }
      actSelectedModel.safeSetSelected(viewId ? views[viewId].owner : null);
      if (!viewId) return;
      var par = views[viewId].par; par.visible = true;
      if (fillPar) fillPar(par);
      var callbackPanel = window[viewId];
      callbackPanel.PerformCallback(JSON.stringify(viewPars));
      $('#' + viewId + '_place').show();
    }

    static close() {
      if (!viewsManager.actViewId) return;
      viewsManager.open(views[viewsManager.actViewId].closeStack);
    }

    static actViewId: string;
  }

  /************** tocTreeList ************************/
  export class tocTreeListModel {
    title = ko.observable('Select course first:');
  }

  export class tocTreeList {
    static callDetailFromTree(s, e) {
      viewsManager.open(outline_user_detail.viewId, (par: outline_user_detailPar) => {
        par.productUrl = outline_user_main_par.productUrl;
        delete par.detailType;
        par.tocId = e.nodeKey;
      });
    }
    static selectedProductChanged(s, e) {
      viewsManager.open(outline_user_main.viewId, (p: outline_user_mainPar) => {
        var sel = s.GetSelectedItem(); p.productUrl = sel.value.toLowerCase(); tocTreeList.model.title('Course: <b>' + sel.text + '</b>');
      });
    }
    static expandLevelClick(lev: number) {
      outline_user_main_par.expandLevel = lev;
      viewsManager.open(outline_user_main.viewId);
      delete outline_user_main_par.expandLevel;
    }
    static endCallback() { ko.applyBindings(tocTreeList.model, $('#outline_user_main_panel')[0]); }
    static model = new tocTreeListModel();
  }

  /************** tocTreeListDetail  model************************/
  export class radioTreeDetailTypeModel extends radioButtonsModel {
    constructor() {
      super();
      this.buttons = [new radioTreeDetailBtn(this, 'by-users', 'By users'), new radioTreeDetailBtn(this, 'by-toc', 'By Course')];
      this.selectedButton.subscribe((newVal: radioTreeDetailBtn) =>
        viewsManager.open(outline_user_detail.viewId, (p: outline_user_detailPar) => p.detailType = newVal.detailType)
        );
    }
    title = ko.observable('Select view:');
  }
  export class radioTreeDetailBtn extends radioButton {
    constructor(owner: radioTreeDetailTypeModel, public detailType: string, public title: string) {
      super(owner);
      var self = this;
      this.isSelected.subscribe(newVal => { if (newVal) owner.title('Course: <b>' + tocTreeList.model.title() + '</b>, View: <b>' + title + '<b/>'); });
      this.isSelected(outline_user_detail_par.detailType == detailType);
    }
  }

  export class tocTreeListDetail {
    static endCallback() { ko.applyBindings(new radioTreeDetailTypeModel(), $('#outline_user_detail_panel')[0]); }
  }


}