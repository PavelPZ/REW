namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v007 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Companies", "PublisherId", c => c.String(maxLength: 24));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Companies", "PublisherId");
        }
    }
}
