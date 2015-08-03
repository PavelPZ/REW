using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping
{
    public class CompanyUserMap : EntityTypeConfiguration<CompanyUser>
    {
        public CompanyUserMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("CompanyUsers");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Created).HasColumnName("Created");//
            //this.Property(t => t.Created).HasColumnName("Created");
            this.Property(t => t.CompanyId).HasColumnName("CompanyId");
            this.Property(t => t.UserId).HasColumnName("UserId");
            this.Property(t => t.DepartmentId).HasColumnName("DepartmentId"); 
            this.Property(t => t.Roles).HasColumnName("Roles");

            // Relationships
            this.HasRequired(t => t.Company)
                .WithMany(t => t.CompanyUsers)
                .HasForeignKey(d => d.CompanyId);
            this.HasOptional(t => t.CompanyDepartment)
                .WithMany(t => t.CompanyUsers)
                .HasForeignKey(d => d.DepartmentId)
                .WillCascadeOnDelete(false);
            this.HasRequired(t => t.User)
                .WithMany(t => t.CompanyUsers)
                .HasForeignKey(d => d.UserId)
                .WillCascadeOnDelete(false);

        }
    }
}
