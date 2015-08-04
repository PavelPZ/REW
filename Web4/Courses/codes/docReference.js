var docreference;
(function (docreference) {
    var ext = (function () {
        function ext(control) {
            this.control = control;
            this.data = metaJS.metaObj;
            this.pars = control.cdata ? JSON.parse(control.cdata) : {};
        }
        ext.prototype.getTemplateId = function () { return 'docxsd'; };
        return ext;
    })();
    docreference.ext = ext;
})(docreference || (docreference = {}));
