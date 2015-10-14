using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace NewData.Mapping {
  public class UserMap : EntityTypeConfiguration<Users> {
    public UserMap() {
      // Primary Key
      this.HasKey(t => t.Id);

      // Properties
      this.Property(t => t.EMail)
          .HasMaxLength(256);

      this.Property(t => t.Password)
          .HasMaxLength(32);

      this.Property(t => t.OtherId)
          .HasMaxLength(120);

      this.Property(t => t.FirstName)
          .HasMaxLength(100);

      this.Property(t => t.LastName)
          .HasMaxLength(100);

      this.Property(t => t.Login)
          .HasMaxLength(64);

      this.Property(t => t.LoginEMail)
          .HasMaxLength(256);

      // Table & Column Mappings
      this.ToTable("Users");
      this.Property(t => t.Id).HasColumnName("Id");
      this.Property(t => t.EMail).HasColumnName("EMail");
      this.Property(t => t.Password).HasColumnName("Password");
      //this.Property(t => t.Created).HasColumnName("Created");
      this.Property(t => t.Created).HasColumnName("Created");//
      this.Property(t => t.VerifyStatus).HasColumnName("VerifyStatus");
      this.Property(t => t.OtherType).HasColumnName("OtherType");
      this.Property(t => t.OtherId).HasColumnName("OtherId");
      this.Property(t => t.FirstName).HasColumnName("FirstName");
      this.Property(t => t.LastName).HasColumnName("LastName");
      this.Property(t => t.Login).HasColumnName("Login");
      this.Property(t => t.LoginEMail).HasColumnName("LoginEMail");
      this.Property(t => t.Roles).HasColumnName("Roles");

      //Publisher
      this.HasOptional(t => t.MyPublisher)
          .WithMany(t => t.PublisherOwners)
          .HasForeignKey(d => d.MyPublisherId)
          .WillCascadeOnDelete(false);
    }
  }
}
