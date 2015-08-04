var EMailer;
(function (EMailer) {
    var defaultDesign = (function () {
        function defaultDesign() {
            this.domain = 'LANGMaster.com';
            this.from = "support@langmaster.com";
        }
        defaultDesign.prototype.wishSuccess = function () { return CSLocalize('06eb87db06e14cf2bad2607093c2bfe7', 'We wish you success with LANGMaster educational products.'); };
        defaultDesign.prototype.LMTeam = function () { return CSLocalize('f217bebab2ad4bfaa456264c9d0ab51d', 'LANGMaster team'); };
        defaultDesign.prototype.contact = function () { return 'LANGMaster, Branicka 107, 147 00 Praha 4, Czech Republic, <a href="mailto:info@langmaster.cz">info@langmaster.cz</a>, <a href="http://www.langmaster.com">www.langmaster.com</a>.'; };
        defaultDesign.prototype.rights = function () { return '© 2011 LANGMaster.All rights reserved.'; };
        return defaultDesign;
    })();
    EMailer.defaultDesign = defaultDesign;
    EMailer.actEmailDesign = new defaultDesign();
    EMailer.from = "support@langmaster.com";
    function sendEMail(cmd, completed, error) {
        if (error === void 0) { error = null; }
        try {
            if (!cmd.From)
                cmd.From = EMailer.actEmailDesign.from;
            cmd['skin'] = EMailer.actEmailDesign;
            //var cmd = LMComLib.CmdEMail_Create(Utils.Empty(em.from) ? from : em.from, em.to, em.cc, em.subject, tmpl.render(em), em.isForgotPassword);
            cmd.Html = JsRenderTemplateEngine.render("TEmail", cmd);
            if (cmd.Html.indexOf("Error") == 0)
                throw "Render error";
            Pager.doAjaxCmd(true, Pager.path(Pager.pathType.restServices), LMComLib.CmdEMail_Type, JSON.stringify(cmd), completed, error);
        }
        catch (err) {
            if (error != null)
                error(999, "Send email error: + err");
        }
    }
    EMailer.sendEMail = sendEMail;
})(EMailer || (EMailer = {}));
