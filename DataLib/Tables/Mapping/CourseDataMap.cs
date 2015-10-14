using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping {
  public class CourseDataMap : EntityTypeConfiguration<CourseDatas> {
    public CourseDataMap() {
      // Primary Key
      this.HasKey(t => t.Id);

      // Properties
      this.Property(t => t.Key)
          .IsRequired()
          .HasMaxLength(240);

      this.Property(t => t.Data)
          .IsRequired();

      // Table & Column Mappings
      this.ToTable("CourseDatas");
      this.Property(t => t.Id).HasColumnName("Id");
      this.Property(t => t.Key).HasColumnName("Key");
      this.Property(t => t.Data).HasColumnName("Data");
      this.Property(t => t.RowVersion).HasColumnName("RowVersion").IsRowVersion();
      this.Property(t => t.ShortData).HasColumnName("ShortData");
      this.Property(t => t.CourseUserId).HasColumnName("CourseUserId");

      // Relationships
      this.HasRequired(t => t.CourseUser)
          .WithMany(t => t.CourseDatas)
          .HasForeignKey(d => d.CourseUserId);

    }
  }
}
