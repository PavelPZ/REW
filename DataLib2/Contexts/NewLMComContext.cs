using Microsoft.Data.Entity;
using System.Configuration;
using System.Data.SqlClient;

namespace NewData {
  public class NewLMComContext_SqlServer : NewLMComContext {
    protected override void OnConfiguring(DbContextOptionsBuilder options) {
      var config = ConfigurationManager.ConnectionStrings["Container"];
      var conn = new SqlConnection(config.ConnectionString);
      options.UseSqlServer(conn);
    }
  }

  public class NewLMComContext : DbContext {

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
      modelBuilder.Entity<Companies>(entity => {
        entity.Index(c => c.ScormHost);
        entity.Property(e => e.Created).Required();
        entity.Property(e => e.Title).Required();
      });

      modelBuilder.Entity<CompanyDepartments>(entity => {
        entity.Property(e => e.CompanyId).Required();
        entity.Property(e => e.ParentId).HasDefaultValue(0);
        entity.Property(e => e.Title).Required();
        entity.Reference(d => d.Company).InverseCollection(p => p.CompanyDepartments).ForeignKey(d => d.CompanyId);
        entity.Reference(d => d.Parent).InverseCollection(p => p.Items).ForeignKey(d => d.ParentId);
      });

      modelBuilder.Entity<CompanyLicences>(entity => {
        entity.Property(e => e.CompanyId).Required();
        entity.Property(e => e.Created).Required();
        entity.Property(e => e.Days).Required();
        entity.Property(e => e.LastCounter).Required();
        entity.Reference(d => d.Company).InverseCollection(p => p.CompanyLicences).ForeignKey(d => d.CompanyId);
      });

      modelBuilder.Entity<CompanyUsers>(entity => {
        entity.Property(e => e.CompanyId).Required();
        entity.Property(e => e.Created).Required();
        entity.Property(e => e.Roles).Required();
        entity.Property(e => e.UserId).Required();
        entity.Reference(d => d.Company).InverseCollection(p => p.CompanyUsers).ForeignKey(d => d.CompanyId);
        entity.Reference(d => d.CompanyDepartment).InverseCollection(p => p.CompanyUsers).ForeignKey(d => d.DepartmentId);
        entity.Reference(d => d.User).InverseCollection(p => p.CompanyUsers).ForeignKey(d => d.UserId);
      });

      modelBuilder.Entity<CourseDatas>(entity => {
        entity.Index(c => c.Key);
        entity.Index(c => c.Flags);
        entity.Property(e => e.CourseUserId).Required();
        entity.Property(e => e.Data).Required();
        entity.Property(e => e.Date).Required();
        entity.Property(e => e.Flags)
            .Required()
            .HasDefaultValue(0L);
        entity.Property(e => e.Key).Required();
        entity.Property(e => e.RowVersion)
            .Required()
            .ValueGeneratedOnAddOrUpdate();
        entity.Reference(d => d.CourseUser).InverseCollection(p => p.CourseDatas).ForeignKey(d => d.CourseUserId);
      });

      modelBuilder.Entity<CourseUsers>(entity => {
        entity.Index(c => c.ProductId);
        entity.Property(e => e.Created).Required();
        entity.Property(e => e.HumanAssigned).Required();
        entity.Property(e => e.HumanCompanyUserId)
            .Required()
            .HasDefaultValue(0);
        entity.Property(e => e.UserId).Required();
        entity.Reference(d => d.CompanyUser).InverseCollection(p => p.CourseUsers).ForeignKey(d => d.UserId);
      });

      modelBuilder.Entity<LANGMasterScorms>(entity => {
        entity.Index(c => c.UserId);
        entity.Index(c => c.AttemptId);
        entity.Index(c => c.AttemptIdStr);
        entity.Index(c => c.AttemptIdGuid);
        entity.Index(c => c.Key1Str);
        entity.Index(c => c.Key2Str);
        entity.Index(c => c.Key1Int);
        entity.Index(c => c.Key2Int);
        entity.Property(e => e.ApiUrlCrc)
            .Required()
            .HasDefaultValue(0);
        entity.Property(e => e.AttemptId).Required();
        entity.Property(e => e.Date).Required();
        entity.Property(e => e.Key1Int).Required();
        entity.Property(e => e.Key2Int).Required();
        entity.Property(e => e.RowVersion)
            .Required()
            .ValueGeneratedOnAddOrUpdate();
        entity.Property(e => e.UserId).Required();
      });

      modelBuilder.Entity<UserLicences>(entity => {
        entity.Key(e => new { e.LicenceId, e.Counter });
        entity.Property(e => e.Created).Required();
        entity.Property(e => e.Started).Required();
        entity.Property(e => e.UserId).Required();
        entity.Reference(d => d.CompanyLicence).InverseCollection(p => p.UserLicences).ForeignKey(d => d.LicenceId);
        entity.Reference(d => d.CourseUser).InverseCollection(p => p.UserLicences).ForeignKey(d => d.UserId);
      });

      modelBuilder.Entity<Users>(entity => {
        entity.Index(c => c.EMail);
        entity.Index(c => c.OtherId);
        entity.Property(e => e.Created).Required();
        entity.Property(e => e.OtherType).Required();
        entity.Property(e => e.Roles).Required();
        entity.Property(e => e.VerifyStatus).Required();
        entity.Reference(d => d.MyPublisher).InverseCollection(p => p.PublisherOwners).ForeignKey(d => d.MyPublisherId);
      });
    }

    public virtual DbSet<Companies> Companies { get; set; }
    public virtual DbSet<CompanyDepartments> CompanyDepartments { get; set; }
    public virtual DbSet<CompanyLicences> CompanyLicences { get; set; }
    public virtual DbSet<CompanyUsers> CompanyUsers { get; set; }
    public virtual DbSet<CourseDatas> CourseDatas { get; set; }
    public virtual DbSet<CourseUsers> CourseUsers { get; set; }
    public virtual DbSet<LANGMasterScorms> LANGMasterScorms { get; set; }
    public virtual DbSet<UserLicences> UserLicences { get; set; }
    public virtual DbSet<Users> Users { get; set; }
  }
}