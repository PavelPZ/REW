namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v016 : DbMigration
    {
        public override void Up()
        {
            CreateIndex("dbo.Companies", "ScormHost");
        }
        
        public override void Down()
        {
            DropIndex("dbo.Companies", new[] { "ScormHost" });
        }
    }
}
