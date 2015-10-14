using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping {
  public class UserLicenceMap : EntityTypeConfiguration<UserLicences> {
    public UserLicenceMap() {
      // Primary Key
      this.HasKey(t => new { t.LicenceId, t.Counter });

      // Properties
      this.Property(t => t.LicenceId)
          .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

      this.Property(t => t.Counter)
          .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

      // Table & Column Mappings
      this.ToTable("UserLicences");
      this.Property(t => t.LicenceId).HasColumnName("LicenceId");
      this.Property(t => t.Counter).HasColumnName("Counter");
      this.Property(t => t.UserId).HasColumnName("UserId");
      this.Property(t => t.Started).HasColumnName("Started");//
      this.Property(t => t.Created).HasColumnName("Created");//

      // Relationships
      this.HasRequired(t => t.CompanyLicence)
          .WithMany(t => t.UserLicences)
          .HasForeignKey(d => d.LicenceId);
      this.HasRequired(t => t.CourseUser)
          .WithMany(t => t.UserLicences)
          .HasForeignKey(d => d.UserId)
          .WillCascadeOnDelete(false);
    }
  }
}
