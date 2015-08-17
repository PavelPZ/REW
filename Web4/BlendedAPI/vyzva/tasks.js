var vyzva;
(function (vyzva) {
    //***************** metadata, popisujici metakurz
    (function (level) {
        level[level["A1"] = 0] = "A1";
        level[level["A2"] = 1] = "A2";
        level[level["B1"] = 2] = "B1";
        level[level["B2"] = 3] = "B2";
    })(vyzva.level || (vyzva.level = {}));
    var level = vyzva.level;
    //*********** user data
    (function (taskStatus) {
        taskStatus[taskStatus["notAttempt"] = 0] = "notAttempt";
        taskStatus[taskStatus["running"] = 1] = "running";
        taskStatus[taskStatus["finished"] = 2] = "finished";
    })(vyzva.taskStatus || (vyzva.taskStatus = {}));
    var taskStatus = vyzva.taskStatus;
    var rootTask = (function () {
        function rootTask() {
        }
        return rootTask;
    })();
    vyzva.rootTask = rootTask;
    var IRootTaskUser = (function () {
        function IRootTaskUser() {
        }
        return IRootTaskUser;
    })();
    vyzva.IRootTaskUser = IRootTaskUser;
})(vyzva || (vyzva = {}));
