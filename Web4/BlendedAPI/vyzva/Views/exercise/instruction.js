var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$exercise$instruction', function () { return new exerciseInstruction(); });
    var exerciseInstruction = (function () {
        function exerciseInstruction() {
            this.link = function (scope, el) {
            };
            this.templateUrl = vyzva.vyzvaRoot + 'views/exercise/instruction.html';
            this.scope = { user: '&user', doReset: '&doReset', data: '&instructionData', state: '&state' };
        }
        return exerciseInstruction;
    })();
    vyzva.exerciseInstruction = exerciseInstruction;
})(vyzva || (vyzva = {}));
