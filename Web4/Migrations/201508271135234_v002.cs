namespace blendedData
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v002 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Companies", "LearningData", c => c.String());
            AddColumn("dbo.Companies", "OrderData", c => c.String());
            DropColumn("dbo.Companies", "Data");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Companies", "Data", c => c.String());
            DropColumn("dbo.Companies", "OrderData");
            DropColumn("dbo.Companies", "LearningData");
        }
    }
}
