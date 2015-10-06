//Add-Migration -name v002 -ConfigurationTypeName blendedData.Configuration -ConnectionStringName Vyzva57 -ProjectName web4
//Update-Database -ConfigurationTypeName blendedData.Configuration -ConnectionStringName Vyzva57 -ProjectName web4
//Get-Migrations -ConfigurationTypeName blendedData.Configuration -ConnectionStringName Vyzva57 -ProjectName web4

namespace blendedData {
  using LMComLib;
  using System;
  using System.Data.Entity;
  using System.Data.Entity.Migrations;
  using System.Data.Entity.Validation;
  using System.Linq;
  using System.Text;

  internal sealed class Configuration : DbMigrationsConfiguration<blendedData.Vyzva57> {
    public Configuration() {
      AutomaticMigrationsEnabled = false;
      AutomaticMigrationDataLossAllowed = true;
    }

    protected override void Seed(Vyzva57 context) {
      //  This method will be called after migrating to the latest version.

      //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
      //  to avoid creating duplicate seed data. E.g.
      //
      //    context.People.AddOrUpdate(
      //      p => p.FullName,
      //      new Person { FullName = "Andrew Peters" },
      //      new Person { FullName = "Brice Lambson" },
      //      new Person { FullName = "Rowan Miller" }
      //    );
      //
    }
  }

  internal class initializer : MigrateDatabaseToLatestVersion<Vyzva57, Configuration> { }

  public static class Lib {
    public static void SaveChanges(Vyzva57 db) {
      try {
        db.SaveChanges();
      }
      catch (DbEntityValidationException dbEx) {
        StringBuilder sb = new StringBuilder();
        foreach (var validationErrors in dbEx.EntityValidationErrors) {
          foreach (var validationError in validationErrors.ValidationErrors) {
            sb.AppendFormat("Property: {0} Error: {1}", validationError.PropertyName, validationError.ErrorMessage);
            sb.AppendLine();
          }
        }
        throw new Exception(sb.ToString(), dbEx);
      }
    }
    public static Vyzva57 CreateContext() {
      init();
      return new Vyzva57();
    }

    static void init() {
      if (initialized) return;
      initialized = true;
      //Logger.Log(@"Lib.NewData.Container init: Start");
      //Database.SetInitializer<Vyzva57>(new initializer());
      //using (var context = new Vyzva57()) context.Database.Initialize(false);
      //Logger.Log(@"Lib.NewData.Container init: End");
    }
    static bool initialized;


  }
}
