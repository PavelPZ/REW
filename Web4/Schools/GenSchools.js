var schools;
(function (schools) {
    (function (persistTypes) {
        persistTypes[persistTypes["no"] = 0] = "no";
        persistTypes[persistTypes["persistNewEA"] = 1] = "persistNewEA";
        persistTypes[persistTypes["persistScormEx"] = 2] = "persistScormEx";
        persistTypes[persistTypes["persistScormLocal"] = 3] = "persistScormLocal";
        persistTypes[persistTypes["persistMemory"] = 4] = "persistMemory";
    })(schools.persistTypes || (schools.persistTypes = {}));
    var persistTypes = schools.persistTypes;
    (function (ExFormat) {
        ExFormat[ExFormat["ea"] = 0] = "ea";
        ExFormat[ExFormat["rew"] = 1] = "rew";
    })(schools.ExFormat || (schools.ExFormat = {}));
    var ExFormat = schools.ExFormat;
    (function (seeAlsoType) {
        seeAlsoType[seeAlsoType["grammar"] = 0] = "grammar";
        seeAlsoType[seeAlsoType["ex"] = 1] = "ex";
    })(schools.seeAlsoType || (schools.seeAlsoType = {}));
    var seeAlsoType = schools.seeAlsoType;
    (function (licenceResult) {
        licenceResult[licenceResult["ok"] = 0] = "ok";
        licenceResult[licenceResult["wrongDomain"] = 1] = "wrongDomain";
        licenceResult[licenceResult["demoExpired"] = 2] = "demoExpired";
        licenceResult[licenceResult["userMonthExpired"] = 3] = "userMonthExpired";
        licenceResult[licenceResult["JSCramblerError"] = 4] = "JSCramblerError";
    })(schools.licenceResult || (schools.licenceResult = {}));
    var licenceResult = schools.licenceResult;
    (function (versions) {
        versions[versions["no"] = 0] = "no";
        versions[versions["debug"] = 1] = "debug";
        versions[versions["not_minified"] = 2] = "not_minified";
        versions[versions["minified"] = 3] = "minified";
    })(schools.versions || (schools.versions = {}));
    var versions = schools.versions;
    (function (DictEntryType) {
        DictEntryType[DictEntryType["lingeaOld"] = 0] = "lingeaOld";
        DictEntryType[DictEntryType["rj"] = 1] = "rj";
        DictEntryType[DictEntryType["Wiktionary"] = 2] = "Wiktionary";
    })(schools.DictEntryType || (schools.DictEntryType = {}));
    var DictEntryType = schools.DictEntryType;
    (function (scormDriver) {
        scormDriver[scormDriver["no"] = 0] = "no";
        scormDriver[scormDriver["moodle"] = 1] = "moodle";
        scormDriver[scormDriver["edoceo"] = 2] = "edoceo";
    })(schools.scormDriver || (schools.scormDriver = {}));
    var scormDriver = schools.scormDriver;
    (function (displayModes) {
        displayModes[displayModes["normal"] = 0] = "normal";
        displayModes[displayModes["previewEx"] = 1] = "previewEx";
    })(schools.displayModes || (schools.displayModes = {}));
    var displayModes = schools.displayModes;
})(schools || (schools = {}));
