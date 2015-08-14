module skrivanek {

  export class defaultDesign implements EMailer.emailDesign {
    domain = 'onlinetesty.skrivanek.cz';
    from = "onlinetesty@skrivanek.cz";
    wishSuccess(): string { return 'Přejeme vám hodně úspěchů se vzdělávacími produkty Skřivánek'; }
    LMTeam(): string { return 'Skřivánek team'; }
    contact(): string { return 'Skřivánek s.r.o., Na dolinách 153/22, 147 00 Praha 4 - Podolí, Česká republika, <a href="mailto:onlinetesty@skrivanek.cz">onlinetesty@skrivanek.cz</a>, <a href="http://onlinetesty.skrivanek.cz">onlinetesty.skrivanek.cz</a>.'; }
    rights(): string { return ''; }
  }

  EMailer.actEmailDesign = new defaultDesign();

  //export var home = "skrivanek_homeModel".toLowerCase();
  //export class skin extends Gui2.skin {
  //  bodyClass(): string { return $(document).width() <= 960 ? 'screen-width-small' : ''; }
  //  getHome(): string { return [appId, home].join('@'); }
  //}

  //export class homeModel extends Pager.Page {
  //  constructor() {
  //    super(appId, home, null);
  //    this.tb = new schools.TopBarModel(this);
  //  }
  //  //http://thrilleratplay.github.io/jquery-validation-bootstrap-tooltip/
  //  loaded(): void {
  //    this.form = $('#lm-form');
  //    this.form.validate({ // initialize plugin
  //      onsubmit: false,
  //      rules: {
  //        loginInput: {
  //          required: true,
  //          minlength: 3,
  //        },
  //        passwordInput: { required: true, minlength: 3 },
  //        confirmPasswordInput: { required: true, minlength: 3, equalTo: "#passwordInput" },
  //        firstName: { required: true, minlength: 2 },
  //        lastName: { required: true, minlength: 2 },
  //        email: { email: true, required: true },
  //        address: { required: true, minlength: 10 },
  //      }
  //    });
  //  }
  //  runTest(productUrl: string) {
  //    if (!this.form.valid()) return;

  //    Pager.blockGui(true);
  //    productUrl = productUrl.toLowerCase();
  //    var otherData: Login.otherData = { birthday: $('#birthday').val(), fullAddress: $('#address').val(), phone: $('#phone').val() };
  //    var cook = <LMStatus.LMCookie>LMComLib.LMCookieJS_Create(0,
  //      null,
  //      $('#loginInput').val(),
  //      $('#email').val(),
  //      LMComLib.OtherType.LANGMasterNoEMail,
  //      null,
  //      $('#firstName').val(),
  //      $('#lastName').val(),
  //      JSON.stringify(otherData),
  //      null);
  //    Pager.ajaxGet(
  //      Pager.pathType.restServices,
  //      testMe.CmdSkrivanek_Type,
  //      LMStatus.createCmd<testMe.CmdSkrivanek>(r => { r.productUrl = productUrl; r.password = Utils.encryptStr($('#passwordInput').val()); r.subSite = LMComLib.SubDomains.com; r.Cookie = cook; }),
  //      //testMe.CmdSkrivanek_Create(productUrl, Utils.encryptStr($('#passwordInput').val()), LMComLib.SubDomains.com, cook, 0),
  //      (res: testMe.CmdSkrivanekResult) => {
  //        cook.id = res.lmcomId;
  //        LMStatus.setReturnUrl(testMe.createUrlPersist(testMe.tEx, res.companyId, productUrl, null));
  //        testMe.alowTestCreate_Url = productUrl;
  //        LMStatus.logged(cook, false);
  //      },
  //      (errId: testMe.CmdSkrivanekErrors, errMsg: string) => {
  //        Pager.blockGui(false);
  //        switch (errId) {
  //          case testMe.CmdSkrivanekErrors.userExist:
  //            this.form.validate().showErrors({"loginInput": CSLocalize('69de79ea3b61498fb5464ad45fddd5d7', 'User name already exists')});
  //            break;
  //          default: debugger; 
  //        }
  //      });
  //  }
  //  tb;
  //  form: JQuery;
  //  tests = [
  //    { title: 'Test angličtiny', line: 'english', levels: levels },
  //    { title: 'Test němčiny', line: 'german', levels: levels },
  //    { title: 'Test španělštiny', line: 'spanish', levels: levels },
  //    { title: 'Test francouzštiny', line: 'french', levels: levels },
  //    { title: 'Test italštiny', line: 'italian', levels: levels },
  //    { title: 'Test ruštiny', line: 'russian', levels: levels },
  //  ];
  //}
  //var levels = [{ title: 'A1' }, { title: 'A2' }, { title: 'B1' }, { title: 'B2' }, { title: 'C1' }, { title: 'C2' }];
  //Gui2.skin.instance = new skin();
  //Pager.registerAppLocator(appId, home, (urlParts, completed) => completed(new homeModel()));
}