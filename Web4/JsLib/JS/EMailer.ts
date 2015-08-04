module EMailer {

  export interface emailDesign {
    domain: string;
    from: string;
    wishSuccess(): string;
    LMTeam(): string;
    contact(): string;
    rights(): string;
  }
  export class defaultDesign implements emailDesign {
    domain = 'LANGMaster.com';
    from = "support@langmaster.com";
    wishSuccess(): string { return CSLocalize('06eb87db06e14cf2bad2607093c2bfe7', 'We wish you success with LANGMaster educational products.'); }
    LMTeam(): string { return CSLocalize('f217bebab2ad4bfaa456264c9d0ab51d', 'LANGMaster team'); }
    contact(): string { return 'LANGMaster, Branicka 107, 147 00 Praha 4, Czech Republic, <a href="mailto:info@langmaster.cz">info@langmaster.cz</a>, <a href="http://www.langmaster.com">www.langmaster.com</a>.'; }
    rights(): string { return '© 2011 LANGMaster.All rights reserved.'; }
  }

  export var actEmailDesign: emailDesign = new defaultDesign();

  export var from = "support@langmaster.com";

  export function sendEMail(cmd: LMComLib.CmdEMail, completed: () => void, error: (errId: number, errMsg: string) => void = null): void {
    try {
      if (!cmd.From) cmd.From = actEmailDesign.from;
      cmd['skin'] = actEmailDesign;
      //var cmd = LMComLib.CmdEMail_Create(Utils.Empty(em.from) ? from : em.from, em.to, em.cc, em.subject, tmpl.render(em), em.isForgotPassword);
      cmd.Html = JsRenderTemplateEngine.render("TEmail", cmd);
      if (cmd.Html.indexOf("Error") == 0) throw "Render error";
      Pager.doAjaxCmd(true, Pager.path(Pager.pathType.restServices), LMComLib.CmdEMail_Type, JSON.stringify(cmd), completed, error);
      //Pager.ajaxPost(Pager.pathType.restServices, LMComLib.CmdEMail_Type, cmd);
      //completed();
    } catch (err) {
      if (error != null) error(999, "Send email error: + err");
    }
  }
}

