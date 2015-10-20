using LMComLib;
using Packager;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Linq;

namespace DesignNew {
  public static partial class Deploy {

    public static IEnumerable<string> allJS(string lang) {
      return externals.SelectMany(s => s).Concat(web.SelectMany(s => s)).Concat(loc.SelectMany(s => s).Select(s => string.Format(s, lang)));
    }

    //******************* generace D:\LMCom\rew\Web4\Deploy\Minify.xml
    public static void generateMSBuildMinify() {
      XElement template = XElement.Load(@"D:\LMCom\rew\Web4\Deploy\MinifyTemplate.xml");
      var Target = template.Descendants(schema + "Target").First();
      var ItemGroup = Target.Element(schema + "ItemGroup");
      int cnt = 0;
      generatePart2(Target, ItemGroup, ref cnt, externals, "externals");
      generatePart2(Target, ItemGroup, ref cnt, web, "web");
      foreach (var lang in new string[] { "cs-cz", "en-gb" }) generatePart2(Target, ItemGroup, ref cnt, loc, lang);
      template.Save(@"D:\LMCom\rew\Web4\Deploy\Minify.xml");
    }

    static void generatePart2(XElement target, XElement itemGroup, ref int cnt, string[][] externals, string name) {
      cnt++;
      var tagName = "JavaScriptFiles" + cnt.ToString();

      var Include = externals.SelectMany(e => e).Select(s => "../" + string.Format(s, name)).Aggregate((r, i) => r + "; " + i);
      itemGroup.Add(new XElement(schema + tagName, new XAttribute("Include", Include)));

      target.Add(new XElement(schema + "JavaScriptCompressorTask",
        new XAttribute("DeleteSourceFiles", "false"),
        new XAttribute("SourceFiles", string.Format("@({0})", tagName)),
        new XAttribute("OutputFile", string.Format("{0}.min.js", name))
      ));
    }

    static XNamespace schema = "http://schemas.microsoft.com/developer/MsBuild/2003";

    //public static string jsDeployData() {
    //  Dictionary<string, string[]> json = new Dictionary<string, string[]>();
    //  json["jsOtherBrowsers"] = new string[] { "jslib/scripts/jquery.js" };

    //  json["jsBasic"] = new string[] { "jslib/scripts/underscore.js", "jslib/scripts/angular.js", "jslib/scripts/angular-route.js", "jslib/scripts/angular-animate.js", "jslib/scripts/angular-cookies.js", "jslib/scripts/angular-ui-router.js", "jslib/scripts/ui-bootstrap-tpls.js" };
    //  json["jsExternal"] = jsExternal;
    //  json["jsGround"] = jsGround;

    //  json["jsModel"] = jsModel;

    //  json["jsScorm"] = jsScorm;
    //  json["jsLogin"] = jsLogin;
    //  json["jsAdmin"] = jsAdmin;

    //  json["jsSchoolStart"] = jsSchoolStart;
    //  json["jsSchoolEnd"] = jsSchoolEnd;

    //  json["jsCourse"] = jsCourse;
    //  json["jsBlended"] = jsBlended;

    //  json["jsLoc"] = new string[] { "schools/loc/tradosdata.en-gb.js", "jslib/scripts/cultures/globalize.culture.en-gb.js" };

    //  return Newtonsoft.Json.JsonConvert.SerializeObject(json);
    //}


  }

}
