namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v015 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Companies", "HumanEvalPaymentConfig", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Companies", "HumanEvalPaymentConfig");
        }
    }
}
