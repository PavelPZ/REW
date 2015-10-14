using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping {
  public class LANGMasterScormMap : EntityTypeConfiguration<LANGMasterScorm> {
    public LANGMasterScormMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.UserId)
                .IsRequired()
                .HasMaxLength(150);

            this.Property(t => t.Key1Str)
                .HasMaxLength(120);

            this.Property(t => t.Key2Str)
                .HasMaxLength(120);

            this.Property(t => t.AttemptIdStr)
              .HasMaxLength(120);

            // Table & Column Mappings
            this.ToTable("LANGMasterScorms");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.UserId).HasColumnName("UserId");
            this.Property(t => t.ApiUrlCrc).HasColumnName("ApiUrlCrc");
            this.Property(t => t.AttemptId).HasColumnName("AttemptId");
            this.Property(t => t.AttemptIdGuid).HasColumnName("AttemptIdGuid");
            this.Property(t => t.AttemptIdStr).HasColumnName("AttemptIdStr");
            this.Property(t => t.Key1Str).HasColumnName("Key1Str");
            this.Property(t => t.Key2Str).HasColumnName("Key2Str");
            this.Property(t => t.Key1Int).HasColumnName("Key1Int");
            this.Property(t => t.Key2Int).HasColumnName("Key2Int");
            this.Property(t => t.Data1).HasColumnName("Data1");
            this.Property(t => t.Data2).HasColumnName("Data2");
            this.Property(t => t.RowVersion).HasColumnName("RowVersion").IsRowVersion();
    }
  }
}
