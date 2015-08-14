/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="../JsLib/ea/EAExtension.ts" />
/// <reference path="GenCourse.ts" />
/// <reference path="GenSchools.ts" />
/// <reference path="Model.ts" />
/// <reference path="../login/Model.ts" />
/// <reference path="Home.ts" />
/// <reference path="Interfaces.ts" />
var schoolInit;
(function (schoolInit) {
    function init_school_master(cfg) {
        if (cfg.target != 0 /* web */)
            schools.InitModel(cfg, ViewBase.initBootStrapApp);
        else {
            Login.InitModel({ logins: [10 /* LANGMaster */, 2 /* Facebook */, 3 /* Google */, 8 /* Microsoft */, 11 /* LANGMasterNoEMail */] }, function () {
                return schools.InitModel(cfg, ViewBase.initBootStrapApp);
            });
        }
    }
    schoolInit.init_school_master = init_school_master;
})(schoolInit || (schoolInit = {}));
