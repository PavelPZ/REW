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

module schoolInit {
  export function init_school_master(cfg: schools.config) {
    if (cfg.target != LMComLib.Targets.web)
      schools.InitModel(cfg, ViewBase.initBootStrapApp);
    else {
      Login.InitModel(
        { logins: [LMComLib.OtherType.LANGMaster, LMComLib.OtherType.Facebook, LMComLib.OtherType.Google, LMComLib.OtherType.Microsoft, LMComLib.OtherType.LANGMasterNoEMail] },
        () => schools.InitModel(cfg, ViewBase.initBootStrapApp)
      );
    }
  }
}

