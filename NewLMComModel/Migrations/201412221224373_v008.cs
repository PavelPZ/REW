namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v008 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Users", "OtherData", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Users", "OtherData");
        }
    }
}
