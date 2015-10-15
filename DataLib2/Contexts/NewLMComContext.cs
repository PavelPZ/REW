using Microsoft.Data.Entity;
using System.Configuration;
using System.Data.SqlClient;
using Microsoft.Data.Sqlite;

namespace NewData {

  public class NewLMComContext_Sqlite : Container {

    //Add-Migration lmcom-sqlite-001 -c NewData.NewLMComContext_Sqlite
    //Update-Database lmcom-sqlite-001 -c NewData.NewLMComContext_Sqlite
    protected override void OnConfiguring(DbContextOptionsBuilder options) {
      base.OnConfiguring(options);
      var connectionStringBuilder = new SqliteConnectionStringBuilder { DataSource = @"d:\LMCom\rew\Web4\App_Data\NewLMCom_sqlite.s3db" };
      var connectionString = connectionStringBuilder.ToString();
      var connection = new SqliteConnection(connectionString);
      options.UseSqlite(connection);
    }
  }

  public class NewLMComContext_SqlServer : Container {

    //Add-Migration lmcom-serv-001 -c NewData.NewLMComContext_SqlServer
    //Update-Database lmcom-serv-002 -c NewData.NewLMComContext_SqlServer
    protected override void OnConfiguring(DbContextOptionsBuilder options) {
      base.OnConfiguring(options);
      var config = ConfigurationManager.ConnectionStrings["Container"];
      var conn = new SqlConnection(config.ConnectionString);
      options.UseSqlServer(conn);
    }
  }

  public class Container : DbContext {

    public Container() {
      Database.EnsureCreated();
    }

    public static Container CreateContext() {
      //return new NewLMComContext_SqlServer();
      return new NewLMComContext_Sqlite();
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder) {
      modelBuilder.Entity<Companies>(entity => {
        entity.Index(c => c.ScormHost);
        entity.Property(e => e.ScormHost).HasMaxLength(240);
        entity.Property(e => e.Created).IsRequired();
        entity.Property(e => e.Title).IsRequired();
      });

      modelBuilder.Entity<CompanyDepartments>(entity => {
        entity.Property(e => e.CompanyId).IsRequired();
        entity.Property(e => e.ParentId).HasDefaultValue(0);
        entity.Property(e => e.Title).IsRequired();
        entity.HasOne(d => d.Company).WithMany(p => p.CompanyDepartments).ForeignKey(d => d.CompanyId);
        entity.HasOne(d => d.Parent).WithMany(p => p.Items).ForeignKey(d => d.ParentId);
      });

      modelBuilder.Entity<CompanyLicences>(entity => {
        entity.Property(e => e.CompanyId).IsRequired();
        entity.Property(e => e.Created).IsRequired();
        entity.Property(e => e.Days).IsRequired();
        entity.Property(e => e.LastCounter).IsRequired();
        entity.HasOne(d => d.Company).WithMany(p => p.CompanyLicences).ForeignKey(d => d.CompanyId);
      });

      modelBuilder.Entity<CompanyUsers>(entity => {
        entity.Property(e => e.CompanyId).IsRequired();
        entity.Property(e => e.Created).IsRequired();
        entity.Property(e => e.Roles).IsRequired();
        entity.Property(e => e.UserId).IsRequired();
        entity.HasOne(d => d.Company).WithMany(p => p.CompanyUsers).ForeignKey(d => d.CompanyId);
        entity.HasOne(d => d.CompanyDepartment).WithMany(p => p.CompanyUsers).ForeignKey(d => d.DepartmentId);
        entity.HasOne(d => d.User).WithMany(p => p.CompanyUsers).ForeignKey(d => d.UserId);
      });

      modelBuilder.Entity<CourseDatas>(entity => {
        entity.Index(c => c.Key);
        entity.Index(c => c.Flags);
        entity.Property(e => e.CourseUserId).IsRequired();
        entity.Property(e => e.Data).IsRequired();
        entity.Property(e => e.Date).IsRequired();
        entity.Property(e => e.Flags)
            .IsRequired()
            .HasDefaultValue(0L);
        entity.Property(e => e.Key).IsRequired().HasMaxLength(120);
        //entity.Property(e => e.RowVersion)
        //    .IsRequired()
        //    .ValueGeneratedOnAddOrUpdate();
        entity.HasOne(d => d.CourseUser).WithMany(p => p.CourseDatas).ForeignKey(d => d.CourseUserId);
      });

      modelBuilder.Entity<CourseUsers>(entity => {
        entity.Index(c => c.ProductId);
        entity.Property(e => e.Created).IsRequired();
        entity.Property(e => e.HumanAssigned).IsRequired();
        entity.Property(e => e.HumanCompanyUserId)
            .IsRequired()
            .HasDefaultValue(0);
        entity.Property(e => e.UserId).IsRequired();
        entity.Property(e => e.ProductId).HasMaxLength(240);
        entity.HasOne(d => d.CompanyUser).WithMany(p => p.CourseUsers).ForeignKey(d => d.UserId);
      });

      modelBuilder.Entity<LANGMasterScorms>(entity => {
        //entity.Index(c => c.UserId);
        //entity.Index(c => c.AttemptId);
        //entity.Index(c => c.AttemptIdStr);
        //entity.Index(c => c.AttemptIdGuid);
        //entity.Index(c => c.Key1Str);
        //entity.Index(c => c.Key2Str);
        //entity.Index(c => c.Key1Int);
        //entity.Index(c => c.Key2Int);
        entity.Property(e => e.ApiUrlCrc)
            .IsRequired()
            .HasDefaultValue(0);
        entity.Property(e => e.AttemptId).IsRequired();
        entity.Property(e => e.Date).IsRequired();
        entity.Property(e => e.Key1Int).IsRequired();
        entity.Property(e => e.Key2Int).IsRequired();
        //entity.Property(e => e.RowVersion)
        //    .IsRequired()
        //    .ValueGeneratedOnAddOrUpdate();
        entity.Property(e => e.UserId).IsRequired();
      });

      modelBuilder.Entity<UserLicences>(entity => {
        entity.Index(e => new { e.LicenceId, e.Counter }).Unique();
        entity.Property(e => e.Created).IsRequired();
        entity.Property(e => e.Started).IsRequired();
        entity.Property(e => e.UserId).IsRequired();
        entity.HasOne(d => d.CompanyLicence).WithMany(p => p.UserLicences).ForeignKey(d => d.LicenceId);
        entity.HasOne(d => d.CourseUser).WithMany(p => p.UserLicences).ForeignKey(d => d.UserId);
      });

      modelBuilder.Entity<Users>(entity => {
        entity.Index(c => c.EMail);
        entity.Index(c => c.OtherId);
        entity.Property(e => e.OtherId).HasMaxLength(80);
        entity.Property(e => e.EMail).HasMaxLength(120);
        entity.Property(e => e.Created).IsRequired();
        entity.Property(e => e.OtherType).IsRequired();
        entity.Property(e => e.Roles).IsRequired();
        entity.Property(e => e.VerifyStatus).IsRequired();
        entity.HasOne(d => d.MyPublisher).WithMany(p => p.PublisherOwners).ForeignKey(d => d.MyPublisherId);
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