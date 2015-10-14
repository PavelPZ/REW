using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping {
  public class CourseUserMap : EntityTypeConfiguration<CourseUsers> {
    public CourseUserMap() {
      // Primary Key
      this.HasKey(t => t.Id);

      // Properties

      this.Property(t => t.ProductId)
            .HasMaxLength(120);
      // Table & Column Mappings
      this.ToTable("CourseUsers");
      this.Property(t => t.Id).HasColumnName("Id");
      this.Property(t => t.UserId).HasColumnName("UserId");
      //this.Property(t => t.Created).HasColumnName("Created");
      this.Property(t => t.Created).HasColumnName("Created");//
      this.Property(t => t.HumanAssigned).HasColumnName("HumanAssigned");//
      this.Property(t => t.ProductId).HasColumnName("ProductId");

      // Relationships
      this.HasRequired(t => t.CompanyUser)
          .WithMany(t => t.CourseUsers)
          .HasForeignKey(d => d.UserId);

    }
  }
}
