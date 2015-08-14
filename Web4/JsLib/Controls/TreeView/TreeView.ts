module TreeView {

  export interface IData {
    isNew: boolean; //po editaci: nova polozka
    Title: string;
    Items: Array<IData>;
  }

  //odvozeny interface napr. Department v Admin\GenAdmin.ts:
  //export interface Department {
  //  Id: number;
  //  Title: string;
  //  Items: Array<Department>;
  //  isNew: boolean;
  //}

  export interface IOptions {
    withCheckbox: boolean;
    editable: boolean;
    onLinkClick: (it: Node) => void;
  }

  function nodeToData(nd: Node): IData {
    var res: IData = <any>{};
    for (var n in nd.data) res[n] = nd.data[n];
    res.Title = nd.title(); res.isNew = nd.isNew;
    res.Items = _.map(nd.items(), it => nodeToData(it));
    return res;
  }

  export function path(self: IData): string {
    if (!self) return '... missing ...';
    var res = self.Title;
    while ((<any>self).parent != null) {
      self = (<any>self).parent;
      res = self.Title + ' / ' + res;
    }
    return res;
  }

  export function root(self: IData): IData {
    while ((<any>self).parent) self = (<any>self).parent;
    return self;
  }

  export function adjustParents(self: IData, parent?: IData): void {
    if (!self) return;
    (<any>self).parent = parent;
    if (self.Items) _.each(self.Items, it => adjustParents(it, self));
  }

  export function findNode(root: IData, cond: (root: IData) => boolean): IData {
    if (!root) return null;
    if (cond(root)) return root;
    if (!root.Items) return null;
    for (var i = 0; i < root.Items.length; i++) { var res = findNode(root.Items[i], cond); if (res != null) return res; }
  }



  export class Model {
    constructor(data: IData, isNew: boolean, isLocked: (d: IData) => boolean, public options: IOptions) {
      this.root = new Node(data, null, this, isNew, isLocked);
    }
    root: Node;

    getResult(): IData {
      return nodeToData(this.root);
    }
    getJSON(): string {
      return JSON.stringify(this.getResult());
    }

    //************** COPY PASTE
    cutCopied: Node;
    isCut: boolean;
    refreshCutPaste = ko.observable<number>(0); //fake observable pro vynuceni aktualizace nekterych computed observables
    cutCopy(nd: Node, isCut: boolean) {
      try {
        if (this.cutCopied == nd && this.isCut == isCut) { this.cutCopied = null; nd.cutCopyFlag(''); return; }
        if (this.cutCopied != null) this.cutCopied.cutCopyFlag('');
        if (nd) nd.cutCopyFlag(isCut ? 'cut' : 'copy');
        this.cutCopied = nd; this.isCut = isCut;
      } finally {
        this.refreshCutPaste(this.refreshCutPaste() + 1); //zmena fake property -> prepocet CutPaste ikonek
      }
    }
    paste(nd: Node, isFirst: boolean) {
      var cutCopied = this.cutCopied; var isCut = this.isCut;
      cutCopied.cutCopyFlag('');
      if (isCut) {
        cutCopied.parent.items.remove(cutCopied);
        cutCopied.parent.adjustIcon();
      } else {
        var dt = nodeToData(cutCopied);
        cutCopied = new Node(dt, null, this, true, null);
      }
      if (isFirst) {
        nd.items.splice(0, 0, cutCopied);
        nd.adjustIcon();
        cutCopied.parent = nd;
      } else {
        nd.parent.items.splice(nd.parent.items.indexOf(nd) + 1, 0, cutCopied);
        nd.parent.adjustIcon();
        cutCopied.parent = nd.parent;
      }
      this.cutCopied = null;
      this.refreshCutPaste(this.refreshCutPaste() + 1); //zmena fake property -> prepocet CutPaste ikonek
    }

    //************** HOVER
    hovered: Node;
    hover(nd: Node, ishover: boolean) {
      if (ishover) {
        if (this.hovered == nd) return;
        if (this.hovered) this.hovered.hovered(false);
        this.hovered = nd; nd.hovered(true);
      } else {
        if (this.hovered == nd) { this.hovered = null; nd.hovered(false); }
      }
    }

    //************** EDIT
    edited: Node;
    edit(nd: Node) {
      var self = this;
      if (this.edited == nd) return;
      if (this.edited) {
        var el = this.edited.editElement;
        el.text(this.edited.title());
      }
      if (nd) {
        var el = nd.editElement;
        var inputbox = "<input type='text' class='inputbox' value=\"" + nd.title() + "\">"; //Insert the HTML into the div 
        el.html(inputbox);
        var input = el.find("input.inputbox");
        input.click(() => false); //spolkni click
        input.focus(); //Immediately give the input box focus
        input.keydown(ev => {
          if (ev.keyCode == 13) { var value = input.val(); nd.title(value); nd.title.valueHasMutated(); self.edited = null; }
          else if (ev.keyCode == 27) { el.html(nd.title()); self.edited = null; }
        });
      }
      this.edited = nd;
    }
  }

  function hasIsLocked(nd: Node): boolean {
    return _.any(nd.items(), it => it.isLocked || hasIsLocked(it));
  }

  export class Node {

    constructor(public data: IData, public parent: Node, public model: Model, public isNew: boolean, isLocked: (d: IData) => boolean) {
      //naplneni dat
      var self = this;
      this.isLocked = (isLocked ? isLocked(data) : false);
      self.title = ko.observable(data.Title);
      self.items = data.Items ? ko.observableArray(_.map(data.Items, it => new Node(it, self, model, isNew, isLocked))) : ko.observableArray<Node>();
      //inicializace fieldu
      self.adjustIcon();
      //Checked
      self.checked.subscribe(self.onChecked, self);
      //Expand
      self.expanded.subscribe(isExp => { self.adjustIcon(); });
      //Display Tools
      self.displayDelete = this.testDisplay(() => !self.isLocked && !!self.parent && !hasIsLocked(self));
      self.displayEdit = ko.computed(() => { return true; });
      self.displayAddNext = this.testDisplay(() => !!self.parent);
      self.displayAddFirst = ko.computed(() => { return true; });
      self.displayCut = this.testDisplay(() => !!self.parent);
      self.displayCopy = ko.computed(() => { return true; });
      self.displayPasteFirst = this.testDisplay(() => {
        var cutCopied = self.model.cutCopied; var isCut = self.model.isCut;
        if (cutCopied == null) return false;
        if (!isCut) return true;
        var ptr = self;
        while (ptr != null) {
          if (ptr == cutCopied) return false;
          ptr = ptr.parent;
        }
        return true;
      });
      self.displayPasteNext = this.testDisplay(() => !!self.parent && self.displayPasteFirst());

      //prida metody jmene itsMeHover a itsMeEdit k modelu. Ty pak zajisti volani registerElement('Hover', el), coz je sance zaregistrovat nebo pouzit element.
      ko_bindingHandlers_itsMe_register(self, ['Hover', 'Edit']);
    }

    isLocked: boolean;
    title: KnockoutObservable<string>;
    items: KnockoutObservableArray<Node>;
    checked = ko.observable(false);
    hovered = ko.observable(false);
    expanded = ko.observable(true);
    editElement: JQuery;
    selected = ko.observable(false);
    icon = ko.observable('');

    //*********** basic opers
    hover(ishover: boolean): void { this.model.hover(this, ishover); }
    expandCollapse(): void { this.expanded(!this.expanded()); }
    testDisplay(cond: () => boolean): KnockoutComputed<boolean> {
      return ko.computed(() => {
        if (!this.model.options.editable) return false; //netestuje se pro not editable mode
        if (this.model.refreshCutPaste() < 0) return false; //sideefekt / prepocitani computed observable
        return cond();
      });
    }

    //inicializace dulezituch HTML tagu
    registerElement(itsMeName: string, el: HTMLElement): void {
      switch (itsMeName) {
        case "Hover": $(el).hover(() => this.hover(true), () => this.hover(false)); break;
        case "Edit": this.editElement = $(el); break;
      }
    }

    //*********** Helper
    hasChild(): boolean { return this.items().length > 0; }
    adjustIcon(): void { this.icon(this.hasChild() ? (this.expanded() ? 'folder-open' : 'folder') : 'book'); }
    displayTools(): boolean { return this.model.options.editable && this.hovered() && this.model.edited != this; }

    //*********** Edit, Delete, Add
    displayEdit: KnockoutComputed<boolean>;
    doEdit(): void { this.model.edit(this); }
    displayDelete: KnockoutComputed<boolean>;
    doDelete(): void { this.parent.items.remove(this); this.parent.adjustIcon(); }
    displayAddNext: KnockoutComputed<boolean>;
    doAddNext(): void {
      var nd = new Node({ Items: null, Title: 'New Item', isNew: undefined }, this.parent, this.model, true, null);
      this.parent.items.splice(this.parent.items.indexOf(this) + 1, 0, nd);
      this.parent.adjustIcon();
      nd.doEdit();
    }
    displayAddFirst: KnockoutComputed<boolean>;
    doAddFirst(): void {
      var nd = new Node({ Items: null, Title: 'New Item', isNew: undefined }, this, this.model, true, null);
      this.items.splice(0, 0, nd);
      this.adjustIcon();
      nd.doEdit();
    }

    //*********** Checbox management
    explicitOnChecked = false;
    onChecked(checked: boolean): void {
      if (this.explicitOnChecked) return;
      //if (!!this.items) _.forEach(this.itemsLow(), i => i.checked(checked));
      //if (!!this.items) _.forEach(this.items(), i => i.checked(checked));
      _.forEach(this.items(), i => i.checked(checked));
      if (this.parent) this.parent.onChildChecked();
    }
    onChildChecked(): void {
      this.explicitOnChecked = true;
      this.checked(this.allChildrenChecked());
      this.explicitOnChecked = false;
      if (this.parent) this.parent.onChildChecked();
    }
    //allChildrenChecked(): boolean { return _.all(this.itemsLow(), i => i.checked()); }
    allChildrenChecked(): boolean { return _.all(this.items(), i => i.checked()); }

    //*********** CopyPaste
    cutCopyFlag = ko.observable<string>(null);
    displayCut: KnockoutComputed<boolean>;
    doCut() { this.model.cutCopy(this, true); }
    displayCopy: KnockoutComputed<boolean>;
    doCopy() { this.model.cutCopy(this, false); }
    displayPasteFirst: KnockoutComputed<boolean>;
    doPasteFirst() { this.model.paste(this, true); }
    displayPasteNext: KnockoutComputed<boolean>;
    doPasteNext() { this.model.paste(this, false); }
  }
}
