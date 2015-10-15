//https://github.com/aspnet/EntityFramework/wiki/Design-Meeting-Notes---July-23,-2015
using Microsoft.Data.Entity;
using System.Configuration;
using System.Data.SqlClient;

namespace NewData {

  //Add-Migration vyzva-serv-001 -c NewData.Vyzva57Context_SqlServer
  //Update-Database vyzva-serv-001 -c NewData.Vyzva57Context_SqlServer
  public class Vyzva57Context_SqlServer : Vyzva57Context {
    protected override void OnConfiguring(DbContextOptionsBuilder options) {
      var config = ConfigurationManager.ConnectionStrings["Vyzva57"];
      var conn = new SqlConnection(config.ConnectionString);
      options.UseSqlServer(conn);
    }
  }

  public class Vyzva57Context : DbContext {

    public Vyzva57Context() {
      Database.EnsureCreated();
    }

    public static Vyzva57Context CreateContext() {
      return new Vyzva57Context_SqlServer();
    }
    public static void SaveChanges(Vyzva57Context db) {
      db.SaveChanges();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
      modelBuilder.Entity<BlendedCompany>(entity => {
        entity.Property(e => e.Id).ValueGeneratedNever();
      });

      modelBuilder.Entity<BlendedCourseData>(entity => {
        entity.Index(c => c.Key);
        entity.Index(c => c.TaskId);
        entity.Property(e => e.CourseUserId).Required();
        entity.Property(e => e.Flags).Required();
        entity.Property(e => e.Key).Required().MaxLength(240);
        entity.Property(e => e.TaskId).MaxLength(32);
        entity.Reference(d => d.CourseUser).InverseCollection(p => p.CourseDatas).ForeignKey(d => d.CourseUserId);
      });

      modelBuilder.Entity<BlendedCourseUser>(entity => {
        entity.Index(c => c.ProductUrl);
        entity.Index(c => c.LMComId);
        entity.Property(e => e.CompanyId).Required();
        entity.Property(e => e.LMComId).Required();
        entity.Property(e => e.ProductUrl).Required().MaxLength(120);
        entity.Reference(d => d.Company).InverseCollection(p => p.CourseUsers).ForeignKey(d => d.CompanyId);
      });

    }

    public virtual DbSet<BlendedCompany> BlendedCompanies { get; set; }
    public virtual DbSet<BlendedCourseData> BlendedCourseDatas { get; set; }
    public virtual DbSet<BlendedCourseUser> BlendedCourseUsers { get; set; }
  }
}