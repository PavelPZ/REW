namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v013 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CompanyUsers", "RolePar", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.CompanyUsers", "RolePar");
        }
    }
}
