var skrivanek;
(function (skrivanek) {
    var defaultDesign = (function () {
        function defaultDesign() {
            this.domain = 'onlinetesty.skrivanek.cz';
            this.from = "onlinetesty@skrivanek.cz";
        }
        defaultDesign.prototype.wishSuccess = function () { return 'Přejeme vám hodně úspěchů se vzdělávacími produkty Skřivánek'; };
        defaultDesign.prototype.LMTeam = function () { return 'Skřivánek team'; };
        defaultDesign.prototype.contact = function () { return 'Skřivánek s.r.o., Na dolinách 153/22, 147 00 Praha 4 - Podolí, Česká republika, <a href="mailto:onlinetesty@skrivanek.cz">onlinetesty@skrivanek.cz</a>, <a href="http://onlinetesty.skrivanek.cz">onlinetesty.skrivanek.cz</a>.'; };
        defaultDesign.prototype.rights = function () { return ''; };
        return defaultDesign;
    })();
    skrivanek.defaultDesign = defaultDesign;
    EMailer.actEmailDesign = new defaultDesign();
})(skrivanek || (skrivanek = {}));
