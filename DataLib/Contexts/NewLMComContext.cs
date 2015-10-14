using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using NewData.Mapping;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Data.Common;

//http://msdn.microsoft.com/en-us/data/ee712907#codefirst
//http://weblogs.asp.net/manavi/entity-association-mapping-with-code-first-one-to-one-shared-primary-key-associations
namespace NewData {
  public partial class Container : DbContext {

    public Container() : base() { }
    public Container(DbConnection conn) : base(conn, true) { }
    public Container(string conn) : base(conn) { }

    public DbSet<Companies> Companies { get; set; }
    public DbSet<CompanyDepartments> CompanyDepartments { get; set; }
    public DbSet<CompanyLicences> CompanyLicences { get; set; }
    public DbSet<CompanyUsers> CompanyUsers { get; set; }
    public DbSet<CourseDatas> CourseDatas { get; set; }
    public DbSet<CourseUsers> CourseUsers { get; set; }
    public DbSet<LANGMasterScorms> LANGMasterScorms { get; set; }
    public DbSet<UserLicences> UserLicences { get; set; }
    public DbSet<Users> Users { get; set; }

    protected override void OnModelCreating(DbModelBuilder modelBuilder) {
      //modelBuilder.Conventions.Remove<IncludeMetadataConvention>();
      modelBuilder.Configurations.Add(new CompanyMap());
      modelBuilder.Configurations.Add(new CompanyDepartmentMap());
      modelBuilder.Configurations.Add(new CompanyLicenceMap());
      modelBuilder.Configurations.Add(new CompanyUserMap());
      modelBuilder.Configurations.Add(new CourseDataMap());
      modelBuilder.Configurations.Add(new CourseUserMap());
      modelBuilder.Configurations.Add(new LANGMasterScormMap());
      modelBuilder.Configurations.Add(new UserLicenceMap());
      modelBuilder.Configurations.Add(new UserMap());
    }
  }
}
