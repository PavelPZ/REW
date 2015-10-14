using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping
{
    public class CompanyDepartmentMap : EntityTypeConfiguration<CompanyDepartment>
    {
        public CompanyDepartmentMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Title)
                .IsRequired();

            // Table & Column Mappings
            this.ToTable("CompanyDepartments");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Title).HasColumnName("Title");
            this.Property(t => t.CompanyId).HasColumnName("CompanyId");

            // Relationships
            this.HasRequired(t => t.Company)
                .WithMany(t => t.CompanyDepartments)
                .HasForeignKey(d => d.CompanyId);

            // Relationships
            this.HasOptional(t => t.Parent)
                .WithMany(t => t.Items)
                .HasForeignKey(d => d.ParentId);
      }
    }
}
