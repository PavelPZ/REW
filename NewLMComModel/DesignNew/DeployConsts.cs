using Packager;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignNew {
  public static partial class Deploy {

    static IEnumerable<string> jquery(bool isMin) { yield return isMin ? "jslib/scripts/jquery.min.js" : "jslib/scripts/jquery.js"; }

    static string[] jsMins = new string[] {
      "deploy/externals.min.js",
      "deploy/web.min.js",
      "deploy/{0}.min.js"
    };

    static string[] jsExternal = new string[] {
      "jslib/scripts/underscore.js",
      "jslib/scripts/angular.js",
      "jslib/scripts/angular-route.js",
      "jslib/scripts/angular-animate.js",
      "jslib/scripts/angular-cookies.js",
      "jslib/scripts/angular-ui-router.js",
      "jslib/scripts/ui-bootstrap-tpls.js",

      "jslib/scripts/jquery-migrate.js",
      "JsLib/Scripts/jqvalidator/core.js",
      "JsLib/Scripts/jqvalidator/delegate.js",
      "JsLib/Scripts/jqvalidator/lm_remote.js",
      "bs3/js/modal.js",
      "bs3/js/tooltip.js",
      "JsLib/JS/External/jqvalidator.js",
      "JsLib/Scripts/ui/jquery-ui.js",
      "JsLib/Scripts/query.autosize.js",
      "jslib/scripts/globalize.js",
      "jslib/scripts/jquery.ba-hashchange.js",
      "jslib/scripts/json2.js",
      "jslib/scripts/jsRender.js",
      "jslib/scripts/knockout.js",
      "jslib/scripts/knockout.validation.js",
      "jslib/scripts/knockout-delegatedEvents.js",
      "jslib/js/external/KnockoutPlugins.js",
      "jslib/js/external/ClosureLib.js",
      "jslib/js/external/ClosureLibLow.js",
    };

    static string[] jsGround = new string[] {
      "jslib/js/GenLMComLib.js",
      "jslib/js/bowser.js",
      "jslib/js/boot.js",

      "jslib/js/unicode.js",
      "jslib/js/base32.js",
      "jslib/js/external/rjson.js",
      "jslib/js/Utils.js",
      "jslib/js/Ajax.js",

      "jslib/ea/earepl.js",
    };

    static string[] jsModel = new string[] {
      "jslib/js/gui.js",
      "jslib/js/ModelBase.js",
      "jslib/js/Utils.js",
      "jslib/js/ViewBase.js",
      "jslib/js/Ajax.js",
      "jslib/js/Validate.js",
      "JsLib/Controls/TreeView/TreeView.js",
      "blendedapi/oldBoot.js"
    };

    static string[] jsScorm = new string[] {
      "login/GenLogin.js",
      "jslib/js/scorm.js",
    };

    static string[] jsLogin = new string[] {
      "jslib/js/OAuth.js",
      "jslib/js/EMailer.js",
      "login/GenLogin.js",
      "login/Model.js",
      "login/Login.js",
      "login/LMLogin.js",
      "login/Register.js",
      "login/ChangePassword.js",
      "login/ForgotPassword.js",
      "login/Profile.js",
      "login/ConfirmRegistration.js"
    };

    static string[] jsAdmin = new string[] {
      "admin/GenAdmin.js",
      "admin/admin.js",
      "admin/KeyGen.js",
      "admin/Products.js",
      "admin/HumanEval.js",
      "admin/HumanEvalManager.js",
      "admin/CompAdmins.js",
      "Admin/UserResults.js",
      "Admin/Departments.js",
    };

    static string[] jsSchoolStart = new string[] {
      "jslib/js/lmconsole.js",
      "jslib/scripts/waitforimages.js",
      //"schools/gencourse.js", prazdny
      "schools/genschools.js",
      "schools/genproxy.js",
      //"schools/genazure.js", prazdny
      "schools/interfaces.js",
      "jslib/js/sound/mp3WorkerLib.js",
      "jslib/js/sound/soundNew.js",
      "jslib/js/sound/Html5Recorder.js",
      "jslib/js/sound/wavePcm.js",
      "jslib/js/unicode.js",
      "jslib/js/base32.js",
      "jslib/js/keys.js",
      "jslib/ea/eaextension.js",
      "jslib/controls/dict/dict.js",
      "jslib/js/external/rjson.js",
      //"schools/lib.js",
      "schools/products.js",
      "schools/topBar.js",
      "schools/model.js",
      "schools/persist.js",
      "schools/persistlocal.js",
      "schools/persistnewea.js",
      "schools/persistdownload.js",
      //"schools/persistphonegap.js",
      "schools/persistscormex.js",
      "schools/persistmemory.js",
      "schools/splash.js",
      "schools/CourseMetaGui.js",
    };

    static string[] jsSchoolEnd = new string[] {
      "schools/my.js",
      "schools/exercise.js",
      "schools/genscorm.js",
      "schools/cpv.js",
      "schools/gramm.js",
    };

    static string[] jsCourse = new string[] {
      "courses/GenCourseModel.js",
      "testme/GenTestModel.js",
      "courses/GenCourseMeta.js",
      "courses/CourseModel.js",
      "courses/Course.js",
      "courses/CourseLib.js",
      "courses/CourseMeta.js",
      //"courses/CourseStatus.js",
      "courses/GapFill.js",
      "courses/Pairing.js",
      "courses/ordering.js",
      "courses/SingleChoice.js",
      "courses/Media.js",
      "courses/eval.js",
      "courses/CheckItem.js",
      "courses/codes/chinhSpeaking.js",
      "courses/codes/docReference.js",
      "testme/testexercise.js",
      "testme/testresult.js",
      "Author/vsNet.js",
      "Author/doc.js",
      "Author/xref.js",
      "jslib/scripts/prettify.js",
    };

    static string[] jsBlended = new string[] {
      "blendedapi/scripts/lib.js",
      "blendedapi/scripts/loader.js",
      "blendedapi/scripts/directives.js",
      "blendedapi/scripts/tasks.js",
      "blendedapi/scripts/exercise.js",
      "blendedapi/scripts/exercisesimple.js",
      "blendedapi/scripts/module.js",
      "blendedapi/scripts/stateman.js",

      "blendedapi/vyzva/scripts/lib.js",
      "blendedapi/vyzva/scripts/intranet.js",
      //"blendedapi/vyzva/scripts/directives.js",

      "blendedapi/vyzva/views/managerlangmaster.js",
      "blendedapi/vyzva/views/managerschool.js",
      "blendedapi/vyzva/views/exercise.js",
      "blendedapi/vyzva/views/module.js",
      "blendedapi/vyzva/views/pretest.js",
      "blendedapi/vyzva/views/lector.js",
      "blendedapi/vyzva/views/home.js",
      "blendedapi/vyzva/views/faq.js",
      "blendedapi/vyzva/views/testhw.js",
      "blendedapi/vyzva/views/vyzvademo.js",
      "blendedapi/vyzva/views/vyzvaprovoz.js",

      "blendedapi/vyzva/views/lector/_tabs.js",

      "blendedapi/vyzva/app.js",
      "blendedapi/app.js",
    };

    static string[] jsLoc = new string[] {
      "schools/loc/tradosdata.{0}.js",
      "jslib/scripts/cultures/globalize.culture.{0}.js"
    };

    static string[][] externals = new string[][] { jsExternal };
    static string[][] web = new string[][] { jsGround, jsModel, jsLogin, jsAdmin, jsSchoolStart, jsSchoolEnd, jsCourse, jsBlended };
    static string[][] loc = new string[][] { jsLoc };

  }

}
