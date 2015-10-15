using LMComLib;
using LMNetLib;
using Login;
using NewData;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using System.Xml.Serialization;

namespace testMe {

  public class CmdSkrivanek : Login.CmdRegister {
    public string productUrl;
  }
  public class CmdSkrivanekResult {
    public Int64 lmcomId;
    public int companyId;
  }

  public enum CmdSkrivanekErrors {
    no,
    userExist,
  }

  public class CmdSkrivanekSuggests {
    public int testId;
    public string message;
  }

  public class CmdSkrivanekDump {
  }

  public static class Skrivanek {
    static Skrivanek() {
      /* CmdSkrivanek */
      Handlers.CmdService.registerCommand<CmdSkrivanek, CmdSkrivanekResult>(par => {
        return skrivanekResult(par);
      });

      /* CmdSkrivanekSuggests */
      Handlers.CmdService.registerCommand<CmdSkrivanekSuggests, bool>(par => {
        skrivanekSuggests(par);
        return new RpcResponse(true);
      });

      /* CmdSkrivanekDump */
      Handlers.CmdService.registerCommand<CmdSkrivanekDump, bool>(par => {
        skrivanekConsole();
        return new RpcResponse(true);
      });

      LowUtils.AdjustFileDir(logFn);
    }

    static string logFn = Machines.rootPath + @"App_Data\skrivanek\suggestions.xml";
    static string dumpFn = Machines.rootPath + @"App_Data\skrivanek\dump.xml";

    public class dumpTest {
      [XmlAttribute]
      public int testId;
      public string message;
      public NameValueString[] result;
      public string address;
      public string birthday;
      public string phone;
      public string pdfUrl;
    }

    public static void skrivanekConsole() {
      XElement root;
      lock (typeof(Skrivanek)) root = File.Exists(logFn) ? XElement.Load(logFn) : new XElement("root");
      var db = Lib.CreateContext();
      int compId = db.Companies.Where(c => c.Title == skTitle).Select(c => c.Id).FirstOrDefault(); if (compId == 0) return;

      List<dumpTest> res = new List<dumpTest>();
      DateTime maxDate = new DateTime(2015, 1, 1); int secsInDay = 24 * 60 * 60;
      foreach (var tst in db.CourseDatas.Where(d => d.CourseUser.CompanyUser.CompanyId == compId && d.Key == "result").ToArray()) {
        var data = tst.Data;
        JObject obj = JObject.Parse(data);
        if (obj["score"].ToObject<object>() == null) obj["score"] = 0;
        foreach (var sk in (JArray)obj["skills"]) {
          if (sk["score"].ToObject<object>() == null) sk["score"] = 0;
          JToken tk = sk["skill"] as JToken;
          if (tk.Type==JTokenType.Integer)
            switch (sk["skill"].Value<int>()) {
              case 1: sk["skill"] = testMe.Skills.UseLanguage; break;
              case 2: sk["skill"] = testMe.Skills.Reading; break;
              case 3: sk["skill"] = testMe.Skills.Listening; break;
              case 4: sk["skill"] = testMe.Skills.Speaking; break;
              case 5: sk["skill"] = testMe.Skills.Writing; break;
            }
        }
        data = obj.ToString();
        var testResult = Newtonsoft.Json.JsonConvert.DeserializeObject<NewData.Scorm.testResultHelper>(data);

        //hack datumu
        var oldStart = LowUtils.numToDate(testResult.skills.Min(s => s.started));
        if (oldStart > maxDate) {
          var shiftSecs = Convert.ToInt32((oldStart - maxDate).TotalSeconds); //propName kolik je prekroceno maximalni datum
          var newDate = maxDate.AddSeconds(-shiftSecs); //prekroceni odecti od maximalniho data
          shiftSecs = Convert.ToInt32((oldStart - newDate).TotalSeconds); //propName kolik vterin zmensit vsechny datumy
          shiftSecs = shiftSecs - (shiftSecs % secsInDay); //zaokrouhli na dny
          foreach (var sk in testResult.skills) { sk.started -= shiftSecs; sk.finished -= shiftSecs; }
          if (testResult.interrupts != null) foreach (var sk in testResult.interrupts) { sk.beg -= shiftSecs; sk.end -= shiftSecs; }
          tst.Data = Newtonsoft.Json.JsonConvert.SerializeObject(testResult);
        }

        //dump
        var dumpTst = new dumpTest {
          testId = tst.CourseUserId,
          message = root.Elements().Where(e => e.AttributeValue("testId") == tst.CourseUserId.ToString()).Select(el => el.Value).FirstOrDefault()
        };
        try {
          var jsonData = db.CourseUsers.Where(cu => cu.Id == tst.CourseUserId).Select(cu => cu.CompanyUser.User.OtherData).FirstOrDefault();
          if (!string.IsNullOrEmpty(jsonData)) {
            dynamic ud = JObject.Parse(jsonData);
            dumpTst.birthday = ud.birthday.ToString();
            dumpTst.address = ud.fullAddress.ToString();
            dumpTst.phone = ud.phone.ToString();
          }
        } catch { }

        res.Add(dumpTst);

        //var testResult = Newtonsoft.Json.JsonConvert.DeserializeObject<NewData.Scorm.testResultHelper>(tst.RowType);
        //testResult.skrivanekHack();
        var pdfFields = NewData.Scorm.CreateCert(testResult, Langs.en_gb);
        dumpTst.result = pdfFields.Select(f => new NameValueString(f.Name, f.Value)).ToArray();
        var par = new scorm.Cmd_testCert { companyId = testResult.companyId, lmcomId = testResult.lmcomId, productId = testResult.productUrl };
        dumpTst.pdfUrl = string.Format("service.ashx?type={0}&par={1}", HttpUtility.UrlEncode(par.GetType().FullName), Newtonsoft.Json.JsonConvert.SerializeObject(par));
      }
      XmlUtils.ObjectToFile(dumpFn, res);
      Lib.SaveChanges(db);
      return;

      //var tests = db.CourseDatas.Where(d => d.CourseUser.CompanyUser.CompanyId == compId && d.Key == "result").Select(d => new { d.CourseUserId, d.RowType }).ToArray();
      //foreach (var tst in tests) {
      //  var dumpTst = new dumpTest {
      //    testId = tst.CourseUserId,
      //    message = root.Elements().Where(e => e.AttributeValue("testId") == tst.CourseUserId.ToString()).Select(el => el.Value).FirstOrDefault()
      //  };
      //  res2.Add(dumpTst);
      //  var testResult = Newtonsoft.Json.JsonConvert.DeserializeObject<NewData.Scorm.testResultHelper>(tst.RowType);
      //  //testResult.skrivanekHack();
      //  var pdfFields = NewData.Scorm.CreateCert(testResult, Langs.en_gb);
      //  dumpTst.result = pdfFields.Select(f => new NameValueString(f.Name, f.Value)).ToArray();
      //  var par = new scorm.Cmd_testCert { companyId = testResult.companyId, companyUserId = testResult.companyUserId, productId = testResult.productUrl };
      //  dumpTst.pdfUrl = string.Format("service.ashx?type={0}&par={1}", HttpUtility.UrlEncode(par.GetType().FullName), Newtonsoft.Json.JsonConvert.SerializeObject(par));
      //}
      //XmlUtils.ObjectToFile(dumpFn, res2);
    }

    static void skrivanekSuggests(CmdSkrivanekSuggests par) {
      lock (typeof(Skrivanek)) {
        XElement root = File.Exists(logFn) ? XElement.Load(logFn) : new XElement("root");
        var item = root.Elements().FirstOrDefault(e => int.Parse(e.AttributeValue("testId", "0")) == par.testId);
        if (item != null) item.Remove();
        root.Add(new XElement("item",
          new XAttribute("testId", par.testId.ToString()),
          new XCData(par.message)));
        root.Save(logFn);
      }
    }

    //pilotni provoz pro Skrivanka
    static RpcResponse skrivanekResult(CmdSkrivanek par) {
      var lmcomId = NewData.Login.CreateLmUserStart(par.Cookie, par.password);
      if (lmcomId < 0) return new RpcResponse((int)CmdSkrivanekErrors.userExist, null);
      //adjust Skrivanek company
      var db = Lib.CreateContext();
      var skCompany = db.Companies.FirstOrDefault(c => c.Title == skTitle);
      if (skCompany == null) {
        skCompany = new Companies { Title = skTitle, Created = DateTime.UtcNow };
        var usr = db.Users.First(u => u.EMail == "zzikova@langmaster.cz");
        var dep = new CompanyDepartments() { Title = skCompany.Title, Company = skCompany };
        db.CompanyDepartments.Add(dep);
        var compUser = new CompanyUsers() { Company = skCompany, User = usr, Created = DateTime.UtcNow/*, RolesEx = (long)CompRole.All*/, CompanyDepartment = dep };
        Lib.setRolesEx(compUser, (long)CompRole.All);
        Lib.SaveChanges(db);
      }
      //adjust Licence
      var prodLicence = AdminServ.adjustAddHocLicence(skCompany.Id, lmcomId, 0, par.productUrl);
      //use licence
      var res = NewData.My.AddLicence(prodLicence.Id, lmcomId, prodLicence.LastCounter);
      if (res.res != EnterLicenceResult.ok) throw new Exception();
      return new RpcResponse(new CmdSkrivanekResult { lmcomId = lmcomId, companyId = skCompany.Id });
    } const string skTitle = "Skřivánek - pilotní provoz";

  }
}