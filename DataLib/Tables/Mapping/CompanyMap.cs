using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping
{
    public class CompanyMap : EntityTypeConfiguration<Companies>
    {
        public CompanyMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Title)
                .IsRequired();

            this.Property(t => t.ScormHost)
                .HasMaxLength(64);

            // Table & Column Mappings
            this.ToTable("Companies");
            this.Property(t => t.Created).HasColumnName("Created");//
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Title).HasColumnName("Title");
            this.Property(t => t.ScormHost).HasColumnName("ScormHost");
            //this.Property(t => t.PublisherId).HasColumnName("PublisherId");


      }
    }
}
