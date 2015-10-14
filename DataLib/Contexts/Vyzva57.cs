namespace NewData {
  using System;
  using System.Data.Entity;
  using System.ComponentModel.DataAnnotations.Schema;
  using System.Linq;

  public partial class Vyzva57 : DbContext {
    public Vyzva57()
        : base("name=Vyzva57") {
    }

    public virtual DbSet<BlendedCompany> Companies { get; set; }
    public virtual DbSet<BlendedCourseData> CourseDatas { get; set; }
    public virtual DbSet<BlendedCourseUser> CourseUsers { get; set; }

    protected override void OnModelCreating(DbModelBuilder modelBuilder) {
      modelBuilder.Entity<BlendedCourseUser>()
          .HasMany(e => e.CourseDatas)
          .WithRequired(e => e.CourseUser)
          .HasForeignKey(e => e.CourseUserId);
      modelBuilder.Entity<BlendedCompany>()
          .HasMany(e => e.CourseUsers)
          .WithRequired(e => e.Company)
          .HasForeignKey(e => e.CompanyId);
    }
  }
}
