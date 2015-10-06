/*http://coding.abel.nu/2012/03/ef-migrations-command-reference/
 * 
 * 1. udelat zmeny v d:\LMCom\rew\NewLMComModel\Models\
 * 2. spustit Add-Migration -name v00?, zmeny se projevi v kodu
 * 3. spustit Update-Database nebo aplikaci, zmeny se projevi v DB
 * 
 * Enable-Migrations -ContextTypeName NewData.Container
//Add-Migration -name v015 -ConfigurationTypeName NewData.Migrations.LMConfiguration -ConnectionStringName Container -ProjectName NewLMComModel
//Update-Database -ConfigurationTypeName NewData.Migrations.LMConfiguration -ConnectionStringName Container -ProjectName NewLMComModel
//Update-Database -TargetMigration 201402071100047_v002 -ConfigurationTypeName NewData.Migrations.LMConfiguration -ConnectionStringName Container -ProjectName NewLMComModel
//Update-Database -ConfigurationTypeName NewData.Migrations.LMConfiguration -ConnectionStringName Container -ProjectName NewLMComModel -Script
//Get-Migrations -ConfigurationTypeName NewData.Migrations.LMConfiguration -ConnectionStringName Container -ProjectName NewLMComModel
*/
using LoginNs = Login;
namespace NewData.Migrations {
  using LMComLib;
  using System;
  using System.Data.Entity;
  using System.Data.Entity.Infrastructure;
  using System.Data.Entity.Migrations;
  using System.Linq;

  public sealed class LMConfiguration : DbMigrationsConfiguration<Container> {
    public LMConfiguration() {
      AutomaticMigrationsEnabled = false;
      AutomaticMigrationDataLossAllowed = true;
    }

    protected override void Seed(Container context) {
      initDBData(context);
    }

    static void initDBData(Container context) {
      Logger.Log(@"LMConfiguration.cs.LMConfiguration.initDBData: Start", true);
      if (context.Users.Any()) return;
      //try { index(context, "LANGMasterScorms", "attemptid"); } catch { return; }
      //index(context, "LANGMasterScorms", "attemptidstr");
      //index(context, "LANGMasterScorms", "attemptidguid");
      //index(context, "LANGMasterScorms", "key1str");
      //index(context, "LANGMasterScorms", "key2str");
      //index(context, "LANGMasterScorms", "key1int");
      //index(context, "LANGMasterScorms", "key2int");
      //index(context, "LANGMasterScorms", "userid");
      //index(context, "LANGMasterScorms", "date");
      //index(context, "CourseDatas", "key");
      //index(context, "CourseDatas", "date");
      //index(context, "Users", "compId");
      //index(context, "Users", "otherid");

      //inicializace databaze
      addAdmin(context, "pzika@langmaster.cz", "p", "Pavel", "Zika");
      addAdmin(context, "pjanecek@langmaster.cz", "pj", "Petr", "Janeček");
      addAdmin(context, "zzikova@langmaster.cz", "zz", "Zdenka", "Ziková");
      addAdmin(context, "rjeliga@langmaster.cz", "rj", "Radek", "Jeliga");
      addAdmin(context, "zikovakaca@seznam.cz", "kz", "Káča", "ZikováK");
      addAdmin(context, "template@langmaster.cz", "tt", "template", "template");

      Lib.SaveChanges(context);
      Logger.Log(@"LMConfiguration.cs.LMConfiguration.initDBData: End", true);
    }
    static void index(Container context, string tableName, string fieldId, bool unique = false) {
      context.Database.ExecuteSqlCommand(string.Format("CREATE {2} INDEX IX_{0} ON {1} ([{0}])", fieldId, tableName, unique ? "UNIQUE" : null));
    }
    static void addAdmin(Container db, string email, string password, string firstName, string lastName) {
      var user = new User() { EMail = email, Password = password, Created = DateTime.UtcNow, OtherType = 10, FirstName = firstName, LastName = lastName, Roles = (int)Role.All, };
      db.Users.Add(user);
      var company = new Company() { Title = "Company " + lastName, Created = DateTime.UtcNow };
      db.Companies.Add(company);
      var dep = new CompanyDepartment() { Title = company.Title, Company = company };
      db.CompanyDepartments.Add(dep);
      var compUser = new CompanyUser() { Company = company, User = user, Created = DateTime.UtcNow, RolesEx = (long)CompRole.All, CompanyDepartment = dep };
      db.CompanyUsers.Add(compUser);
      //@PRODID
      string[] ignoreUserLic = new string[] { "/lm/prods_lm_blcourse_english/", "/lm/prods_lm_blcourse_french/", "/lm/prods_lm_blcourse_german/" };
      foreach (var prodId in new string[] { 
        //"/data/xmlsource/simpleenglish/", "/data/xmlsource/simplespanish/", 
        //"/data/xmlsource/docexamples/", "/data/xmlsource/TestProduct/",
        //"/lm/EnglishE_0_10/", "/lm/English_0_10/", "/lm/German_0_5/", "/lm/Spanish_0_6/", "/lm/French_0_6/", "/lm/Italian_0_6/", "/lm/Russian_0_3/",
        //"/lm/EnglishE_0_1/", "/lm/Spanish_0_1/", 
        //"/grafia/od1_8/", "/grafia/od1_administrativ/",
        //"/skrivanek/prods/etestme-std/english/a1/", "/skrivanek/prods/etestme-comp/english/a1/", "/skrivanek/prods/etestme-comp/english/all/", 
        //"/skrivanek/prods/etestme-comp/french/all/",
        //"/skrivanek/prods/etestme-comp/german/all/","/skrivanek/prods/etestme-comp/russian/all/",
        //"/skrivanek/prods/etestme-comp/italian/all/","/skrivanek/prods/etestme-comp/spanish/all/",
        //"/lm/prods/etestme/english/a1/", //"/lm/prods/etestme/english/a1_c2/"
        //Blended
        "/lm/blcourse/schoolmanager.product/",
        "/lm/blcourse/langmastermanager.product/",
        }.Concat(ignoreUserLic).Select(p => p.ToLower())) {
        var compLicence = new CompanyLicence() { Company = company, Days = 100, ProductId = prodId, Created = DateTime.UtcNow };
        db.CompanyLicences.Add(compLicence);
        var courseUser = new CourseUser() { CompanyUser = compUser, Created = DateTime.UtcNow, ProductId = prodId };
        db.CourseUsers.Add(courseUser);
        if (!ignoreUserLic.Contains(prodId)) {
          var userLicence = new UserLicence() { CompanyLicence = compLicence, CourseUser = courseUser, Started = DateTime.UtcNow, Created = DateTime.UtcNow };
          db.UserLicences.Add(userLicence);
        }
      }
    }
  }

  public class initializer : MigrateDatabaseToLatestVersion<Container, LMConfiguration> { }
}
