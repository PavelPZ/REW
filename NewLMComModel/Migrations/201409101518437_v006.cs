namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v006 : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.CourseUsers", "ProductId", c => c.String(maxLength: 120));
            AlterColumn("dbo.CompanyLicences", "ProductId", c => c.String(maxLength: 120));
            CreateIndex("dbo.CourseUsers", "ProductId");
        }
        
        public override void Down()
        {
            DropIndex("dbo.CourseUsers", new[] { "ProductId" });
            AlterColumn("dbo.CompanyLicences", "ProductId", c => c.String());
            AlterColumn("dbo.CourseUsers", "ProductId", c => c.String());
        }
    }
}
