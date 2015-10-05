using Newtonsoft.Json;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Xml;
using System.Xml.Linq;
using LMComLib;
using System.Text;
using NewData;
using blended;
using LMNetLib;
using OfficeOpenXml;

namespace vyzva {
  public static class Lectors {
    public static byte[] exportInfoToXml() {
      var db = blendedData.Lib.CreateContext();
      var oldDb = NewData.Lib.CreateContext();
      //company title
      var companyTitle = NewData.Lib.CreateContext().Companies.Select(c => new { c.Id, c.Title }).ToDictionary(c => c.Id);

      var companies = db.Companies.ToArray().
        Select(dbData => new school { dbData = dbData, data = JsonConvert.DeserializeObject<ICompanyData>(dbData.LearningData) }).
        ToArray();

      //*********************** adjust <companyId>@lector-langmaster.cz users
      //ID companies, ktere maji sablonu 3
      var withLectorComps = companies.Where(c => c.data.studyGroups.Any(g => g.isPattern3)).ToArray();
      //lektori
      var lectors = oldDb.Users.Where(u => u.EMail.Contains("@lector-langmaster.cz")).
        Select(u => new { u.Id, u.FirstName, u.LastName, u.EMail }).ToArray().Select(u => new { u.Id, u.FirstName, u.LastName, u.EMail, companyId = int.Parse(u.EMail.Split('@')[0]) }).
        ToDictionary(c => c.Id, c => c);
      //zaloz missingLectors
      var missings = withLectorComps.Where(comp => !lectors.ContainsKey(comp.dbData.Id)).ToArray();
      if (missings.Any()) { //dopln lector users a priprav jim course-product´s Licencni klice (pro kazdou skolu a kazdy kurz jeden)
        foreach (var missing in missings) {
          var compId = missing.dbData.Id;
          var user = new User() { EMail = compId.ToString() + "@lector-langmaster.cz", Password = "lpsw", FirstName = "LANGMaster", LastName = "lector", Created = DateTime.UtcNow, OtherType = (short)OtherType.LANGMaster };
          oldDb.Users.Add(user);
          var compUser = new CompanyUser() { CompanyId = compId, User = user, Created = DateTime.UtcNow };
          oldDb.CompanyUsers.Add(compUser);
          foreach (var courseId in new string[] { "english", "german", "french" }) {
            var prodId = "/lm/prods_lm_blcourse_" + courseId + "/";
            var courseUser = new CourseUser() { CompanyUser = compUser, Created = DateTime.UtcNow, ProductId = prodId };
            var compLicence = new CompanyLicence() { CompanyId = compId, Days = 5000, ProductId = prodId, Created = DateTime.UtcNow, LastCounter = 2 };
            oldDb.CourseUsers.Add(courseUser);
            var userLicence = new UserLicence() { CompanyLicence = compLicence, CourseUser = courseUser, Started = DateTime.UtcNow, Created = DateTime.UtcNow, Counter = 1 };
            oldDb.UserLicences.Add(userLicence);
          }
        }
        oldDb.SaveChanges();
      }

      //*********************** pridej lektora do vsech "Sablona 3"-studijnich skupin
      var lectorUsers = oldDb.UserLicences.Where(l => l.CourseUser.CompanyUser.User.EMail.Contains("@lector-langmaster.cz")).
        Select(l => new {
          l.CourseUser.CompanyUser.User.Id,
          l.CourseUser.CompanyUser.User.FirstName,
          l.CourseUser.CompanyUser.User.LastName,
          l.CourseUser.CompanyUser.User.EMail,
          l.CourseUser.CompanyUser.CompanyId,
          l.CourseUser.ProductId,
          l.LicenceId,
          l.Counter
        }).ToLookup(c => c.CompanyId);
      foreach (var compGrp in withLectorComps.SelectMany(c => c.data.studyGroups.Where(g => g.isPattern3).Select(g => new { company = c, group = g }))) {
        var lector = lectorUsers[compGrp.company.dbData.Id];
        var productId = Vyzva57ServicesController.lineToProductId[compGrp.group.line];
        var prodLector = lector.First(l => l.ProductId == productId);
        if (!compGrp.group.lectorKeys.Any(k => k.lmcomId == prodLector.Id)) { //vlozeni lektora do company
          var freeKey = compGrp.group.lectorKeys.FirstOrDefault(k => k.lmcomId == 0);
          if (freeKey == null) freeKey = compGrp.group.lectorKeys.Last();
          freeKey.firstName = prodLector.FirstName;
          freeKey.lastName = prodLector.LastName;
          freeKey.lmcomId = prodLector.Id;
          freeKey.email = prodLector.EMail;
          freeKey.keyStr = licKeys.encode(prodLector.LicenceId, prodLector.Counter);
          compGrp.company.dbData.LearningData = JsonConvert.SerializeObject(compGrp.company.data);
        }
      }
      db.SaveChanges();

      //*********************** studyTeachers, vyzadujici vyhodnoceni
      //vsichni studujici ucitele
      var studyTeachersRaw = withLectorComps.SelectMany(c =>
        c.data.studyGroups.Where(g => g.isPattern3).SelectMany(g =>
          g.studentKeys.Where(s => s.lmcomId > 0).Select(s => new { comp = c, group = g, student = s, key = s.lmcomId.ToString() + "#" + Vyzva57ServicesController.lineToProductId[g.line] + "#" + c.dbData.Id.ToString() }))).ToArray();
      var studyTeachers = studyTeachersRaw.GroupBy(t => t.key).ToDictionary(g => g.Key, g => g.First());
      //
      db = blendedData.Lib.CreateContext(); var flag = (long)CourseModel.CourseDataFlag.needsEval;
      var waitForEvalRaw = db.CourseDatas.
        Where(cd => (cd.Flags & flag) != 0).
        Select(cu => new { cu.CourseUser.LMComId, cu.CourseUser.ProductUrl, cu.CourseUser.CompanyId, cu.Key }).
        ToArray();
      var waitForEvals = waitForEvalRaw.GroupBy(w => w.LMComId.ToString() + "#" + w.ProductUrl + "#" + w.CompanyId.ToString()).ToArray();
      var Vyhodnotit = waitForEvals.Where(waitForEval => studyTeachers.ContainsKey(waitForEval.Key)).Select(waitForEval => new {
        teacher = studyTeachers[waitForEval.Key],
        level = waitForEval.First().Key.Split('/')[4]
      }).Select(tl => new {
        company = companyTitle[tl.teacher.comp.dbData.Id].Title,
        course = tl.teacher.group.line.ToString(),
        level = tl.level,
        lectorKey = lectorUsers[tl.teacher.comp.dbData.Id].First(l => l.ProductId == Vyzva57ServicesController.lineToProductId[tl.teacher.group.line]),
        stEmail = tl.teacher.student.email
      });

      var Companies = companies.Select(c => new {
        skola = companyTitle[c.dbData.Id].Title,
        spravce = c.data.managerKeys.FirstOrDefault(m => m.lmcomId > 0),
      }).Where(c => c.spravce!=null && c.spravce.email!=null && !c.spravce.email.StartsWith("spravce@") && !c.spravce.email.StartsWith("spravce."));

      using (var pck = new ExcelPackage()) {
        ExcelWorksheet ws = pck.Workbook.Worksheets.Add("Vyhodnotit");
        var rows = excelReport.lib.emptyAndHeader(Vyhodnotit).Select(t => new object[] {
          t==null ? "company" : t.company,
          t==null ? "course" : t.course,
          t==null ? "level" : t.level,
          t==null ? "lectorKey" : "http://blended.langmaster.cz/schools/index_cs_cz.html#/vyzvademo?key=" + licKeys.encode(t.lectorKey.LicenceId,t.lectorKey.Counter),
          t==null ? "student" : t.stEmail
        });
        excelReport.lib.import(ws, rows, 0, 0);

        ws = pck.Workbook.Worksheets.Add("Školy");
        var rows2 = excelReport.lib.emptyAndHeader(Companies).Select(t => new object[] {
          t==null ? "skola" : t.skola,
          t==null ? "spravce-email" : t.spravce.email,
          t==null ? "spravce-firstName" : t.spravce.firstName,
          t==null ? "spravce-lastName" : t.spravce.lastName,
          t==null ? "spravce-keyStr" : t.spravce.keyStr,
        });
        var rng = excelReport.lib.import(ws, rows2, 0, 0);

        return pck.GetAsByteArray();
      }
    }

    public class school {
      public blended.ICompanyData data;
      public blendedData.Company dbData;
    }
  }
}
