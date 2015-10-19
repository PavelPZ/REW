declare var $deployConfig: jsDeploy.IConfig;

namespace jsDeploy {
  export interface IConfig {
    lang: Langs;
    oldIE: boolean;
    oldEA: boolean;
    target: LMComLib.Targets;
    version: schools.versions;
  }
  interface IData {
    jsIE8: Array<string>;
    jsOtherBrowsers: Array<string>;
    jsBasic: Array<string>;
    jsExternal: Array<string>;
    jsGround: Array<string>;
    jsEA: Array<string>;
    jsEARepl: Array<string>;
    jsModel: Array<string>;
    jsScorm: Array<string>;
    jsLogin: Array<string>;
    jsAdmin: Array<string>;
    jsSchoolStart: Array<string>;
    jsSchoolEnd: Array<string>;
    jsCourse: Array<string>;
    jsBlended: Array<string>;
    jsLoc: Array<string>;
  }

  interface IUrlScript {
    url: string;
    script: string;
  }

  function concats(jss: Array<Array<string>>): Array<string> {
    var res = [];
    jss.forEach(js => { if (js) js.forEach(j => res.push('../' + j)); });
    return res;
  }
  function replaceLang(js: string, lang: Langs): string {
    var english: string = '.' + Langs[Langs.en_gb].replace('_', '-') + '.';
    var act: string = '.' + Langs[lang].replace('_', '-') + '.';
    return js.replace(english, act);
  }

  export function load(appJs: Array<string>) {
    var jss = concats([
      $deployConfig.oldIE ? $deployData.jsIE8 : $deployData.jsOtherBrowsers,
      $deployData.jsBasic,
      $deployData.jsExternal,
      $deployData.jsGround,
      $deployConfig.oldEA ? $deployData.jsEA : $deployData.jsEARepl,
      $deployData.jsModel,
      $deployConfig.target == LMComLib.Targets.scorm ? $deployData.jsScorm : null,
      $deployConfig.target == LMComLib.Targets.web ? $deployData.jsLogin : null,
      $deployConfig.target == LMComLib.Targets.web ? $deployData.jsAdmin : null,
      $deployData.jsSchoolStart,
      $deployData.jsSchoolEnd,
      $deployData.jsCourse,
      $deployData.jsBlended,
      $deployData.jsLoc.map(js => replaceLang(js, $deployConfig.lang)),
      appJs
    ]);
    var head = document.getElementsByTagName("head")[0];
    jss.forEach(js => {
      var fileref = document.createElement('script');
      fileref.setAttribute("type", "text/javascript");
      fileref.setAttribute("src", js);
      head.appendChild(fileref)
    });
    //var scripts = jss.map(js => '<scri' + 'pt src="' + js + '" type="text/javascript"></scri' + 'pt>').join('\r\n');
    //return scripts;
  }

  var $deployData: IData = {
    "jsIE8": ["jslib/scripts/jquery.js", "jslib/scripts/es5-shim.js", "jslib/scripts/angular-ie8.js"],
    "jsOtherBrowsers": ["jslib/scripts/jquery2.js", "jslib/scripts/angular.js"],
    "jsBasic": ["jslib/scripts/underscore.js", "jslib/js/lmconsoleinit.js", "jslib/scripts/angular-route.js", "jslib/scripts/angular-animate.js", "jslib/scripts/angular-cookies.js", "jslib/scripts/angular-ui-router.js", "jslib/scripts/ui-bootstrap-tpls.js"],
    "jsExternal": ["jslib/scripts/jquery-migrate.js", "JsLib/Scripts/jqvalidator/core.js", "JsLib/Scripts/jqvalidator/delegate.js", "JsLib/Scripts/jqvalidator/lm_remote.js", "bs3/js/modal.js", "bs3/js/tooltip.js", "JsLib/JS/External/jqvalidator.js", "JsLib/Scripts/ui/jquery-ui.js", "JsLib/Scripts/query.autosize.js", "jslib/scripts/globalize.js", "jslib/scripts/jquery.ba-hashchange.js", "jslib/scripts/json2.js", "jslib/scripts/jsRender.js", "jslib/scripts/knockout.js", "jslib/scripts/knockout.validation.js", "jslib/scripts/knockout-delegatedEvents.js", "jslib/js/external/KnockoutPlugins.js", "jslib/js/external/ClosureLib.js", "jslib/js/external/ClosureLibLow.js", "jslib/js/GenLMComLib.js", "jslib/js/bowser.js", "jslib/js/boot.js"],
    "jsGround": ["jslib/js/unicode.js", "jslib/js/base32.js", "jslib/js/external/rjson.js", "jslib/js/Utils.js", "jslib/js/Ajax.js"],
    "jsEA": ["jslib/ea/ea.js"],
    "jsEARepl": ["jslib/ea/earepl.js"],
    "jsModel": ["jslib/js/gui.js", "jslib/js/ModelBase.js", "jslib/js/Utils.js", "jslib/js/ViewBase.js", "jslib/js/Ajax.js", "jslib/js/Validate.js", "JsLib/Controls/TreeView/TreeView.js", "blendedapi/oldBoot.js"],
    "jsScorm": ["login/GenLogin.js", "jslib/js/scorm.js"],
    "jsLogin": ["jslib/js/OAuth.js", "jslib/js/EMailer.js", "login/GenLogin.js", "login/Model.js", "login/Login.js", "login/LMLogin.js", "login/Register.js", "login/ChangePassword.js", "login/ForgotPassword.js", "login/Profile.js", "login/ConfirmRegistration.js"],
    "jsAdmin": ["admin/GenAdmin.js", "admin/admin.js", "admin/KeyGen.js", "admin/Products.js", "admin/HumanEval.js", "admin/HumanEvalManager.js", "admin/CompAdmins.js", "Admin/UserResults.js", "Admin/Departments.js"],
    "jsSchoolStart": ["jslib/js/lmconsole.js", "jslib/scripts/waitforimages.js", "schools/gencourse.js", "schools/genschools.js", "schools/genproxy.js", "schools/genazure.js", "schools/interfaces.js", "jslib/js/sound/mp3WorkerLib.js", "jslib/js/sound/soundNew.js", "jslib/js/sound/Html5Recorder.js", "jslib/js/sound/wavePcm.js", "jslib/js/unicode.js", "jslib/js/base32.js", "jslib/js/keys.js", "jslib/ea/eaextension.js", "jslib/controls/dict/dict.js", "jslib/js/external/rjson.js", "schools/lib.js", "schools/products.js", "schools/topBar.js", "schools/model.js", "schools/persist.js", "schools/persistlocal.js", "schools/persistnewea.js", "schools/persistdownload.js", "schools/persistphonegap.js", "schools/persistscormex.js", "schools/persistmemory.js", "schools/splash.js", "schools/CourseMetaGui.js"],
    "jsSchoolEnd": ["schools/my.js", "schools/exercise.js", "schools/genscorm.js", "schools/cpv.js", "schools/gramm.js"],
    "jsCourse": ["courses/GenCourseModel.js", "testme/GenTestModel.js", "courses/GenCourseMeta.js", "courses/CourseModel.js", "courses/Course.js", "courses/CourseLib.js", "courses/CourseMeta.js", "courses/CourseStatus.js", "courses/GapFill.js", "courses/Pairing.js", "courses/ordering.js", "courses/SingleChoice.js", "courses/Media.js", "courses/eval.js", "courses/CheckItem.js", "courses/codes/chinhSpeaking.js", "courses/codes/docReference.js", "testme/testexercise.js", "testme/testresult.js", "Author/vsNet.js", "Author/doc.js", "Author/xref.js", "jslib/scripts/prettify.js"],
    "jsBlended": ["blendedapi/scripts/lib.js", "blendedapi/scripts/loader.js", "blendedapi/scripts/directives.js", "blendedapi/scripts/tasks.js", "blendedapi/scripts/exercise.js", "blendedapi/scripts/exercisesimple.js", "blendedapi/scripts/module.js", "blendedapi/scripts/stateman.js", "blendedapi/vyzva/scripts/lib.js", "blendedapi/vyzva/scripts/intranet.js", "blendedapi/vyzva/scripts/directives.js", "blendedapi/vyzva/views/managerlangmaster.js", "blendedapi/vyzva/views/managerschool.js", "blendedapi/vyzva/views/exercise.js", "blendedapi/vyzva/views/module.js", "blendedapi/vyzva/views/pretest.js", "blendedapi/vyzva/views/lector.js", "blendedapi/vyzva/views/home.js", "blendedapi/vyzva/views/faq.js", "blendedapi/vyzva/views/testhw.js", "blendedapi/vyzva/views/vyzvademo.js", "blendedapi/vyzva/views/vyzvaprovoz.js", "blendedapi/vyzva/views/lector/_tabs.js", "blendedapi/vyzva/app.js", "blendedapi/app.js"],
    "jsLoc": ["schools/loc/tradosdata.en-gb.js", "jslib/scripts/cultures/globalize.culture.en-gb.js"]
  };

  export enum Langs {
    no = 0,
    lang = 1,
    cs_cz = 2,
    en_gb = 3,
    de_de = 4,
    sk_sk = 5,
    fr_fr = 6,
    it_it = 7,
    sp_sp = 8,
    ru_ru = 9,
    vi_vn = 10,
    es_es = 11,
    fi_fi = 12,
    sv_se = 13,
    da_dk = 14,
    nb_no = 15,
    af_za = 16,
    sq_al = 17,
    ar_sa = 18,
    hy_am = 19,
    as_in = 20,
    az_latn_az = 21,
    eu_es = 22,
    bn_in = 23,
    be_by = 24,
    pt_br = 25,
    br_fr = 26,
    bg_bg = 27,
    fr_ca = 28,
    zh_hk = 29,
    ca_es = 30,
    co_fr = 31,
    hr_hr = 32,
    nl_nl = 34,
    en_us = 35,
    et_ee = 36,
    gl_es = 37,
    ka_ge = 38,
    el_gr = 39,
    gu_in = 40,
    ha_latn_ng = 41,
    he_il = 42,
    hi_in = 43,
    hu_hu = 44,
    zh_cn = 45,
    is_is = 46,
    ig_ng = 47,
    id_id = 48,
    ga_ie = 49,
    ja_jp = 50,
    kn_in = 51,
    km_kh = 52,
    ky_kg = 53,
    ko_kr = 54,
    lo_la = 55,
    es_mx = 56,
    lv_lv = 57,
    lt_lt = 58,
    mk_mk = 59,
    ms_my = 60,
    ml_in = 61,
    mt_mt = 62,
    mi_nz = 63,
    mr_in = 64,
    mn_mn = 65,
    ne_np = 66,
    oc_fr = 67,
    ps_af = 68,
    fa_ir = 69,
    pl_pl = 70,
    pt_pt = 71,
    pa_in = 72,
    quz_pe = 73,
    ro_ro = 74,
    sr_latn_cs = 75,
    nso_za = 76,
    si_lk = 77,
    sl_si = 78,
    sw_ke = 79,
    ta_in = 80,
    te_in = 81,
    th_th = 82,
    bo_cn = 83,
    tn_za = 84,
    tr_tr = 85,
    uk_ua = 86,
    ur_pk = 87,
    uz_latn_uz = 88,
    cy_gb = 89,
    xh_za = 90,
    yo_ng = 91,
    zu_za = 92,
    bs = 93,
    en_nz = 94,
    ku_arab = 95,
    LMPage_GetLang = 999,
  }

}

//declare var $LAB: jsDeploy.ILab;
  //export interface ILab {
  //  script(js: Array<string>): ILab;
  //  setOptions(option: {}): ILab;
  //  wait(completed?: () => void): ILab;
  //}
  //function loadXMLDoc(url: string): Promise<IUrlScript> {
  //  return new Promise<IUrlScript>((success, fail) => {
  //    var xmlhttp: XMLHttpRequest;
  //    try { xmlhttp = new XMLHttpRequest(); } catch (msg) { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }

  //    xmlhttp.onreadystatechange = () => {
  //      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
  //        if (xmlhttp.status == 200) success({ url: url.toLowerCase(), script: xmlhttp.responseText });
  //        else if (xmlhttp.status == 400) fail('There was an error 400')
  //        else fail('something else other than 200 was returned')
  //      }
  //    }
  //    xmlhttp.open("GET", 'http://localhost/Web4/author/' + url, true);
  //    xmlhttp.send();
  //  });
  //}
  //funkce eval v global scope
  //var globalEval = (function () {
  //  var isIndirectEvalGlobal = (function (original, Object) {
  //    try {
  //      // Does `Object` resolve to a local variable, or to a global, built-in `Object`,
  //      // reference to which we passed as a first argument?
  //      return (1, eval)('Object') === original;
  //    }
  //    catch (err) {
  //      // if indirect eval errors out (as allowed per ES3), then just bail out with `false`
  //      return false;
  //    }
  //  })(Object, 123);

  //  if (isIndirectEvalGlobal) {
  //    // if indirect eval executes code globally, use it
  //    return function (expression) {
  //      return (1, eval)(expression);
  //    };
  //  }
  //  else if (typeof window.execScript !== 'undefined') {
  //    // if `window.execScript exists`, use it
  //    return function (expression) {
  //      return window.execScript(expression);
  //    };
  //  }
  //  // otherwise, globalEval is `undefined` since nothing is returned
  //})();  //export function load2(appJs: Array<string>, completed: () => void) {
  //  var jss = concats([
  //    $deployConfig.oldIE ? $deployData.jsIE8 : $deployData.jsOtherBrowsers,
  //    $deployData.jsBasic,
  //    $deployData.jsExternal,
  //    $deployData.jsGround,
  //    $deployConfig.oldEA ? $deployData.jsEA : $deployData.jsEARepl,
  //    $deployData.jsModel,
  //    $deployData.jsLogin,
  //    $deployData.jsAdmin,
  //    $deployData.jsSchoolStart,
  //    $deployData.jsSchoolEnd,
  //    $deployData.jsCourse,
  //    $deployData.jsBlended,
  //    $deployData.jsLoc.map(js => replaceLang(js)),
  //    appJs
  //  ]);
  //  var scripts = jss.map(js => '<scri' + 'pt src="' + js + '" type="text/javascript"></scri' + 'pt>').join('\r\n');
  //  Promise.all(jss.map(js => loadXMLDoc(js))).then(
  //    res => {
  //      //var allScript = res.map(js => js.script).join('\r\n');
  //      //try {
  //      //  var len = allScript.length;
  //      //  eval(allScript);
  //      //  debugger
  //      //} catch (msg) {
  //      //  debugger
  //      //}
  //      var wrongEvals: Array<IUrlScript> = [];
  //      res.forEach((js, idx) => {
  //        try {
  //          globalEval(js.script);
  //        } catch (msg) {
  //          wrongEvals.push(js);
  //        }
  //      });
  //      if (wrongEvals.length > 0) debugger;
  //      else completed();
  //    },
  //    error => {
  //      debugger;
  //    });
  //}
