var testMe;
(function (testMe) {
    (function (Status) {
        Status[Status["no"] = 0] = "no";
        Status[Status["Started"] = 1] = "Started";
        Status[Status["Interrupted"] = 2] = "Interrupted";
        Status[Status["SendedToEvaluation"] = 3] = "SendedToEvaluation";
        Status[Status["EvalAssigned"] = 4] = "EvalAssigned";
        Status[Status["Evaluated"] = 5] = "Evaluated";
    })(testMe.Status || (testMe.Status = {}));
    var Status = testMe.Status;
})(testMe || (testMe = {}));
