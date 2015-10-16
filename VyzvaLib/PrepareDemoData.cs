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

namespace vyzva {

  //***********************  generace demouctu z titulku skoly
  public static class PrepareDemoDataNew {
    public class keysFromCompanyTitleResult {
      public userItem student; //code..licId|counter
      public userItem teacher;
      public userItem studentDe;
      public userItem teacherDe;
      public userItem admin;
      public string companyTitle;
      public int newCompanyId; //zalozena nova company => na klientovi je potreba vytvorit skupinu studentu a priradit klice
      public int masterLicId; //hlavni klic pro spravce prazdne skoly
      public int masterLLicCounter;
    }
    public class userItem {
      public int licId;
      public int licCounter;
      public Int64 lmcomId;
      public string email;
      public string firstName;
      public string lastName;
    }

    public static keysFromCompanyTitleResult keysFromCompanyTitle(string companyTitle) {
      var db = NewData.Lib.CreateContext();
      if (companyTitle.EndsWith(" *")) companyTitle = companyTitle.Substring(0, companyTitle.Length - 2);
      var demoCompanyTitle = companyTitle + " *";
      long hash = demoCompanyTitle.GetHashCode(); var host = "blend." + hash;
      var company = db.Companies.FirstOrDefault(c => c.ScormHost == host);
      UserLicences lSpravce = null; UserLicences lStudent = null; UserLicences lUcitel = null; UserLicences lStudentDe = null; UserLicences lUcitelDe = null;
      Users uSpravce = null; Users uStudent = null; Users uUcitel = null; Users uStudentDe = null; Users uUcitelDe = null;
      var result = new keysFromCompanyTitleResult() { companyTitle = demoCompanyTitle };
      if (company == null) {
        db.Companies.Add(company = new Companies() { Title = demoCompanyTitle, Created = DateTime.UtcNow, ScormHost = host });
        var dep = new CompanyDepartments() { Title = company.Title, Company = company };
        db.CompanyDepartments.Add(dep);

        CompanyLicences schoolManLic = null; CompanyLicences englishLic = null;
        foreach (var prodId in new string[] { "/lm/blcourse/schoolmanager.product/", "/lm/prods_lm_blcourse_english/", "/lm/prods_lm_blcourse_french/", "/lm/prods_lm_blcourse_german/" }) {
          var compLicence = new CompanyLicences() { Company = company, Days = 100, ProductId = prodId, Created = DateTime.UtcNow, LastCounter = 10 };
          if (schoolManLic == null) schoolManLic = compLicence; else if (englishLic == null) englishLic = compLicence;
          db.CompanyLicences.Add(compLicence);
        }

        //users
        int lastCounter = 1;
        foreach (var userId in new string[] { "spravce", "ucitel", "student", "ucitelde", "studentde" }) {
          var user = new Users() { EMail = userId + "@" + hash + ".cz", Password = "heslo", FirstName = userId, LastName = "", Created = DateTime.UtcNow, OtherType = (short)OtherType.LANGMaster };
          db.Users.Add(user);
          var compUser = new CompanyUsers() { Company = company, User = user, Created = DateTime.UtcNow, CompanyDepartment = dep };
          db.CompanyUsers.Add(compUser);
          if (userId == "spravce") {
            uSpravce = user;
            var courseUser = new CourseUsers() { CompanyUser = compUser, Created = DateTime.UtcNow, ProductId = "/lm/blcourse/schoolmanager.product/" };
            db.CourseUsers.Add(courseUser);
            var userLicence = lSpravce = new UserLicences() { CompanyLicence = schoolManLic, CourseUser = courseUser, Started = DateTime.UtcNow, Created = DateTime.UtcNow, Counter = lastCounter++ };
            db.UserLicences.Add(userLicence);
          } else {
            var courseId = userId == "ucitel" || userId == "student" ? "english" : "german";
            var courseUser = new CourseUsers() { CompanyUser = compUser, Created = DateTime.UtcNow, ProductId = "/lm/prods_lm_blcourse_" + courseId + "/" };
            db.CourseUsers.Add(courseUser);
            var userLicence = new UserLicences() { CompanyLicence = englishLic, CourseUser = courseUser, Started = DateTime.UtcNow, Created = DateTime.UtcNow, Counter = lastCounter++ };
            db.UserLicences.Add(userLicence);
            switch (userId) {
              case "ucitel": lUcitel = userLicence; uUcitel = user; break;
              case "student": lStudent = userLicence; ; uStudent = user; break;
              case "ucitelde": lUcitelDe = userLicence; uUcitelDe = user; break;
              case "studentde": lStudentDe = userLicence; ; uStudentDe = user; break;
            }
          }
        }

        db.SaveChanges();
        result.newCompanyId = company.Id;

      } else {
        lSpravce = db.UserLicences.Where(l => l.CourseUser.CompanyUser.Company.ScormHost == host && l.CourseUser.CompanyUser.User.EMail == "spravce@" + hash + ".cz" && l.CourseUser.ProductId == "/lm/blcourse/schoolmanager.product/").First();
        lUcitel = db.UserLicences.Where(l => l.CourseUser.CompanyUser.Company.ScormHost == host && l.CourseUser.CompanyUser.User.EMail == "ucitel@" + hash + ".cz" && l.CourseUser.ProductId == "/lm/prods_lm_blcourse_english/").First();
        lStudent = db.UserLicences.Where(l => l.CourseUser.CompanyUser.Company.ScormHost == host && l.CourseUser.CompanyUser.User.EMail == "student@" + hash + ".cz" && l.CourseUser.ProductId == "/lm/prods_lm_blcourse_english/").First();
        lUcitelDe = db.UserLicences.Where(l => l.CourseUser.CompanyUser.Company.ScormHost == host && l.CourseUser.CompanyUser.User.EMail == "ucitelde@" + hash + ".cz" && l.CourseUser.ProductId == "/lm/prods_lm_blcourse_german/").FirstOrDefault();
        lStudentDe = db.UserLicences.Where(l => l.CourseUser.CompanyUser.Company.ScormHost == host && l.CourseUser.CompanyUser.User.EMail == "studentde@" + hash + ".cz" && l.CourseUser.ProductId == "/lm/prods_lm_blcourse_german/").FirstOrDefault();
      }
      Func<UserLicences, Users, userItem> createUserItem = (lic, user) => {
        if (lic == null) return null;
        userItem res = new userItem() { licId = lic.LicenceId, licCounter = lic.Counter };
        if (user != null) { res.email = user.EMail; res.firstName = user.FirstName; res.lastName = user.LastName; res.lmcomId = user.Id; }
        return res;
      };
      var master = PrepareDemoData.createEmptyCompany(companyTitle);
      result.admin = createUserItem(lSpravce, uSpravce);
      result.teacher = createUserItem(lUcitel, uUcitel);
      result.student = createUserItem(lStudent, uStudent);
      result.teacherDe = createUserItem(lUcitelDe, uUcitelDe);
      result.studentDe = createUserItem(lStudentDe, uStudentDe);
      result.masterLicId = master.licId;
      result.masterLLicCounter = master.licCounter;
      return result;
    }
  }


  public static class PrepareDemoData {

    //*********************** vytvori skolu a licencni klic k school manager produktu (= ostry klic pro spravce skoly)
    public static ICreateEmptySchoolResult createEmptyCompany(string companyTitle) {
      var db = NewData.Lib.CreateContext();
      long hash = companyTitle.GetHashCode(); var host = "blend." + hash;
      var company = db.Companies.FirstOrDefault(c => c.ScormHost == host);
      CompanyLicences schoolManLic = null;
      if (company == null) {
        //company
        company = new Companies() { Title = companyTitle, Created = DateTime.UtcNow, ScormHost = host };
        db.Companies.Add(company);
        var dep = new CompanyDepartments() { Title = company.Title, Company = company };
        db.CompanyDepartments.Add(dep);

        //products
        foreach (var prodId in new string[] { "/lm/blcourse/schoolmanager.product/", "/lm/prods_lm_blcourse_english/", "/lm/prods_lm_blcourse_french/", "/lm/prods_lm_blcourse_german/" }) {
          var compLicence = new CompanyLicences() { Company = company, Days = 1000, ProductId = prodId, Created = DateTime.UtcNow, LastCounter = 2 };
          if (schoolManLic == null) schoolManLic = compLicence;
          db.CompanyLicences.Add(compLicence);
        }
        db.SaveChanges();
      } else {
        schoolManLic = db.CompanyLicences.Where(cl => cl.CompanyId==company.Id && cl.ProductId== "/lm/blcourse/schoolmanager.product/").First();
      }
      return new ICreateEmptySchoolResult() { licId = schoolManLic.Id, licCounter = 1 };
    }
    public class ICreateEmptySchoolResult {
      public int licId;
      public int licCounter;
    }

    //***********************  generace demouctu a naplneni vyukovych dat studentu
    //public static IPrepareNewDataResult prepareNewData(string companyTitle, string id) {

    //  var db = NewData.Lib.CreateContext();

    //  if (fromCompanyId == 0) fromCompanyId = db.Companies.First(c => c.Title == "Company template").Id;

    //  //company
    //  var company = new Company() { Title = companyTitle, Created = DateTime.UtcNow };
    //  db.Companies.Add(company);
    //  var dep = new CompanyDepartment() { Title = company.Title, Company = company };
    //  db.CompanyDepartments.Add(dep);

    //  //products
    //  CompanyLicence schoolManLic = null; CompanyLicence englishLic = null;
    //  foreach (var prodId in new string[] { "/lm/blcourse/schoolmanager.product/", "/lm/prods_lm_blcourse_english/", "/lm/prods_lm_blcourse_french/", "/lm/prods_lm_blcourse_german/" }) {
    //    var compLicence = new CompanyLicence() { Company = company, Days = 100, ProductId = prodId, Created = DateTime.UtcNow, LastCounter = 10 };
    //    if (schoolManLic == null) schoolManLic = compLicence; else if (englishLic == null) englishLic = compLicence;
    //    db.CompanyLicences.Add(compLicence);
    //  }

    //  //users
    //  List<prepareNewDataTemp> newUsers = new List<prepareNewDataTemp>(); int lastCounter = 1;
    //  foreach (var userId in new string[] { "spravce", "ucitel1", "ucitel2", "student1", "student2", "student3", "student4" }) {
    //    var user = new User() { EMail = userId + "." + id + "@e.cz", Password = "heslo", FirstName = userId, LastName = "", Created = DateTime.UtcNow, OtherType = (short)OtherType.LANGMaster };
    //    db.Users.Add(user);
    //    var compUser = new CompanyUser() { Company = company, User = user, Created = DateTime.UtcNow, CompanyDepartment = dep };
    //    db.CompanyUsers.Add(compUser);
    //    if (userId == "spravce") {
    //      var courseUser = new CourseUser() { CompanyUser = compUser, Created = DateTime.UtcNow, ProductId = "/lm/blcourse/schoolmanager.product/" };
    //      db.CourseUsers.Add(courseUser);
    //      var userLicence = new UserLicence() { CompanyLicence = schoolManLic, CourseUser = courseUser, Started = DateTime.UtcNow, Created = DateTime.UtcNow, Counter = lastCounter++ };
    //      db.UserLicences.Add(userLicence);
    //      newUsers.Add(new prepareNewDataTemp() { User = user, CompanyLicence = schoolManLic, UserLicence = userLicence });
    //    } else {
    //      var courseUser = new CourseUser() { CompanyUser = compUser, Created = DateTime.UtcNow, ProductId = "/lm/prods_lm_blcourse_english/" };
    //      db.CourseUsers.Add(courseUser);
    //      var userLicence = new UserLicence() { CompanyLicence = englishLic, CourseUser = courseUser, Started = DateTime.UtcNow, Created = DateTime.UtcNow, Counter = lastCounter++ };
    //      db.UserLicences.Add(userLicence);
    //      newUsers.Add(new prepareNewDataTemp() { User = user, CompanyLicence = englishLic, UserLicence = userLicence });
    //    }
    //  }

    //  db.SaveChanges();

    //  return new IPrepareNewDataResult() {
    //    fromCompanyId = fromCompanyId,
    //    companyId = company.Id,
    //    users = newUsers.
    //    Select(u => new IPrepareNewDataResultItem() {
    //      lmcomId = u.User.Id,
    //      email = u.User.EMail,
    //      firstName = u.User.FirstName,
    //      lastName = u.User.LastName,
    //      licId = u.CompanyLicence.Id,
    //      licCounter = u.UserLicence.Counter,
    //    })
    //    .ToArray()
    //  };

    //}
    //static int fromCompanyId;
    //public class prepareNewDataTemp {
    //  public CompanyLicence CompanyLicence;
    //  public UserLicence UserLicence;
    //  public User User;
    //}
    //public class IPrepareNewDataResult {
    //  public int fromCompanyId;
    //  public int companyId;
    //  public IPrepareNewDataResultItem[] users;
    //}
    //public class IPrepareNewDataResultItem {
    //  public int licId;
    //  public int licCounter;
    //  public Int64 lmcomId;
    //  public string email;
    //  public string firstName;
    //  public string lastName;
    //}

    //public static void copyCourseData(ICopyCourseData data) {
    //  var db = blendedData.Lib.CreateContext();
    //  foreach (var user in data.users) {
    //    var srcUser = db.CourseUsers.First(cu => cu.LMComId == user.fromLmcomId);
    //    blendedData.CourseUser destUser;
    //    db.CourseUsers.Add(destUser = new blendedData.CourseUser() { CompanyId = data.toCompanyId, LMComId = user.toLmLmcomId, ProductUrl = srcUser.ProductUrl });
    //    foreach (var srcData in db.CourseDatas.Where(cd => cd.CourseUserId == srcUser.Id)) {
    //      db.CourseDatas.Add(new blendedData.CourseData() {
    //        CourseUser = destUser,
    //        Data = srcData.Data,
    //        Flags = srcData.Flags,
    //        Key = srcData.Key,
    //        ShortData = srcData.ShortData,
    //        TaskId = srcData.TaskId,
    //      });
    //    }
    //  }
    //  db.SaveChanges();
    //}
    //public class ICopyCourseData {
    //  public int fromCompanyId;
    //  public int toCompanyId;
    //  public ICopyCourseDataItem[] users;
    //}
    //public class ICopyCourseDataItem {
    //  public long fromLmcomId;
    //  public long toLmLmcomId;
    //}

  }
}
