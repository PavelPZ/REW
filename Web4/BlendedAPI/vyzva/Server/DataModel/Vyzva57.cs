namespace blendedData {
  using System;
  using System.Data.Entity;
  using System.ComponentModel.DataAnnotations.Schema;
  using System.Linq;

  public partial class Vyzva57 : DbContext {
    public Vyzva57()
        : base("name=Vyzva57") {
    }

    public virtual DbSet<Company> Companies { get; set; }
    public virtual DbSet<CourseData> CourseDatas { get; set; }
    public virtual DbSet<CourseUser> CourseUsers { get; set; }

    protected override void OnModelCreating(DbModelBuilder modelBuilder) {
      modelBuilder.Entity<CourseUser>()
          .HasMany(e => e.CourseDatas)
          .WithRequired(e => e.CourseUser)
          .HasForeignKey(e => e.CourseUserId);
      modelBuilder.Entity<Company>()
          .HasMany(e => e.CourseUsers)
          .WithRequired(e => e.Company)
          .HasForeignKey(e => e.CompanyId);
    }
  }
}
