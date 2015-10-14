using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping
{
    public class CompanyLicenceMap : EntityTypeConfiguration<CompanyLicences>
    {
        public CompanyLicenceMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.ProductId)
                  .HasMaxLength(120);

            // Table & Column Mappings
            this.ToTable("CompanyLicences");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.LastCounter).HasColumnName("LastCounter");
            this.Property(t => t.Days).HasColumnName("Days");
            this.Property(t => t.CompanyId).HasColumnName("CompanyId");
            this.Property(t => t.ProductId).HasColumnName("ProductId");
            this.Property(t => t.Created).HasColumnName("Created");//

            // Relationships
            this.HasRequired(t => t.Company)
                .WithMany(t => t.CompanyLicences)
                .HasForeignKey(d => d.CompanyId);

        }
    }
}
