<%@ WebHandler Language="C#" Class="Service" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Xml.Linq;
using LMComLib;
using LMNetLib;
using System.Web.Script.Serialization;

public class Service : IHttpHandler {

  public void ProcessRequest(HttpContext context) {
    if (context.Request["type"] == "dict-for-old-lmcom") {
      var resp = NewData.DictForOldLMCom.getDict(context.Request["word"], context.Request["crsId"], context.Request["natLang"], context.Request["callback"]);
      context.Response.Write(resp);
      context.Response.Flush();
      return;
    }
    Handlers.Request.Process(context, LMComLib.Logger.Error);
  }

  public bool IsReusable { get { return true; } }

}

namespace NewData {
  public static class DictForOldLMCom {

    static DictForCourse.dictOptions options = new DictForCourse.dictOptions() { forAllCourses = false, lingeaOnly = false, dictTypes = new schools.DictEntryType[] { schools.DictEntryType.lingeaOld } };

    public static string getDict(string word, string crsIdStr, string natLangStr, string callback) {
      CourseIds crsId = (CourseIds)int.Parse(crsIdStr);
      Langs crsLang = CommonLib.CourseIdToLang(crsId);
      natLangStr = natLangStr.ToLower().Replace('-','_');
      Langs natLang = LowUtils.EnumParse<Langs>(natLangStr);

      //trim
      int beg = 0; int end = word.Length - 1;
      for (int i = 0; i < word.Length; i++) if (char.IsLetter(word[i])) { beg = i; break; }
      for (int i = word.Length - 1; i >= 0; i--) if (char.IsLetter(word[i])) { end = i; break; }
      word = word.Substring(beg, end - beg + 1);

      var json = new json() { word = word, html = getWord(word, crsLang, natLang) };
      JavaScriptSerializer jsSer = new JavaScriptSerializer();
      return string.Format("{0} ( {1} )", callback, jsSer.Serialize(json));
    }

    // napr. /comen/german1/les1/chapa/t1a_kb_l1_a2.htm
    static Langs langFromUrl(string url) {
      foreach (var part in url.ToLower().Split('/'))
        switch (part) {
          case "comcz": return Langs.cs_cz;
          case "comsk": return Langs.sk_sk;
          case "comen": return Langs.en_gb;
          case "comvi": return Langs.vi_vn;
          case "comes": return Langs.sp_sp;
          case "comde": return Langs.de_de;
          case "comru": return Langs.ru_ru;
          case "comfr": return Langs.fr_fr;
          case "comit": return Langs.it_it;
          case "comlt": return Langs.lt_lt;
          case "comtr": return Langs.tr_tr;
          case "comkr": return Langs.ko_kr;
          case "comcn": return Langs.zh_cn;
          case "comth": return Langs.th_th;
          case "comhk": return Langs.zh_hk;
          case "compl": return Langs.pl_pl;
          case "combg": return Langs.bg_bg;
          case "combs": return Langs.bs;
          case "eduauthornew": return Langs.en_gb;
          default: continue;
        }
      throw new NotImplementedException();
    }

    static string getWord(string word, Langs crsLang, Langs natLang) {
      try {
        var crsData = options.getCrsData(crsLang);
        var natData = crsData.getNatData(natLang);
        var en = natData.findEntry(word, snd => {
          if (snd.Value.StartsWith("@")) { snd.Remove(); return; }
          snd.Name = "span";
          snd.Add(new XAttribute("class", "sound"), new XAttribute("url", "http://test.langmaster.com/alpha/" + snd.Value));
          //snd.Add(new XAttribute("class", "sound"), new XAttribute("url", "http://localhost/rew/" + snd.Value));
          //snd.Add(new XAttribute("class", "sound"), new XAttribute("url", "http://www.langmaster.com/new/" + snd.Value));
          snd.RemoveNodes();
        });
        return en == null ? "" : en.ToString();
      } catch {
        return "";
      }
    }

  }
  public class json {
    public string word;
    public string html;
  }


}
