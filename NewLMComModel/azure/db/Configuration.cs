/*http://coding.abel.nu/2012/03/ef-migrations-command-reference/
 * 
 * 1. udelat zmeny v d:\LMCom\rew\NewLMComModel\Models\
 * 2. spustit Add-Migration -name v00?, zmeny se projevi v kodu
 * 3. spustit Update-Database nebo aplikaci, zmeny se projevi v DB
 * 
//Add-Migration -name azure001 -ConfigurationTypeName AzureData.MigrationConfiguration -ConnectionStringName AzureContainer -ProjectName NewLMComModel
//Update-Database -ConfigurationTypeName AzureData.MigrationConfiguration -ConnectionStringName AzureContainer -ProjectName NewLMComModel
*/
using System.Data.Entity;
namespace AzureData { 
  using LMComLib;
  using System;
  using System.Data.Entity;
  using System.Data.Entity.Infrastructure;
  using System.Data.Entity.Migrations;
  using System.Linq;

  public sealed class MigrationConfiguration : DbMigrationsConfiguration<Container> {
    public MigrationConfiguration() {
      AutomaticMigrationsEnabled = false;
      AutomaticMigrationDataLossAllowed = true;
    }

    protected override void Seed(Container context) {
      initDBData(context);
    }

    static void initDBData(Container context) {
      //pocatecni naplneni dat
    }
  }

  public class migrationInitializer : MigrateDatabaseToLatestVersion<Container, MigrationConfiguration> { }

  public static class Lib {
    public static Container CreateContext() {
      init();
      return new Container();
    }
    static void init() {
      if (initialized) return;
      initialized = true;
      Database.SetInitializer<Container>(new AzureData.migrationInitializer());
      using (var context = new Container()) context.Database.Initialize(false);
    } static bool initialized;
  }

  public partial class Container {
    public Container() : this(true) { }
    public Container(bool changeTracking = true) : base("AzureContainer") {
      if (!changeTracking) Configuration.AutoDetectChangesEnabled = false;
    }
  }

}