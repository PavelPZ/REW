module grafia {
  export var home = "grafia_homeModel".toLowerCase();
  export class skin extends Gui2.skin {
    bodyClass(): string { return $(document).width() <= 960 ? 'screen-width-small' : ''; }
    getHome(): string { return oldPrefix + [appId, home].join(hashDelim); }
  }

  export class homeModel extends Pager.Page {
    constructor() {
      super(appId, home, null);
      this.tb = new schools.TopBarModel(this);
    }
    tb;
  }
  Gui2.skin.instance = new skin();
  Pager.registerAppLocator(appId, home, (urlParts, completed) => completed(new homeModel()));
}