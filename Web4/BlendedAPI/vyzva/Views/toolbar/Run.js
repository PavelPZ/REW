var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$toolbar$greenbuttons', function () { return new toolbarGreenButtons(); });
    var toolbarGreenButtons = (function () {
        function toolbarGreenButtons() {
            this.link = function (scope, el) {
            };
            this.templateUrl = vyzva.vyzvaRoot + 'views/toolbar/run.html';
        }
        return toolbarGreenButtons;
    })();
    vyzva.toolbarGreenButtons = toolbarGreenButtons;
})(vyzva || (vyzva = {}));
