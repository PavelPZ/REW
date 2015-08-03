namespace AzureData
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class azure001 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Company_Departments",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        departments = c.String(),
                        compId = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.Company_DepartmentUsage",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        departmentUsage = c.Binary(),
                        compId = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.Company_Licences",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        licence = c.Binary(),
                        compId = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.Company_Metas",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        meta = c.String(),
                        compId = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.Company_Users",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        users = c.String(),
                        compId = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.CourseLongs",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        longData = c.String(),
                        shortData = c.String(),
                        flag = c.Int(nullable: false),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.HumanEvals",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        data = c.String(),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.Sys_Admins",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        strData = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.Sys_CompShortIds",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        strData = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.User_Companies",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        companies = c.String(),
                        email = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
            CreateTable(
                "dbo.User_Datas",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        password = c.String(),
                        data = c.String(),
                        email = c.String(),
                        PartitionKey = c.String(maxLength: 128),
                        RowKey = c.String(maxLength: 128),
                        DbTimestamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.PartitionKey)
                .Index(t => t.RowKey);
            
        }
        
        public override void Down()
        {
            DropIndex("dbo.User_Datas", new[] { "RowKey" });
            DropIndex("dbo.User_Datas", new[] { "PartitionKey" });
            DropIndex("dbo.User_Companies", new[] { "RowKey" });
            DropIndex("dbo.User_Companies", new[] { "PartitionKey" });
            DropIndex("dbo.Sys_CompShortIds", new[] { "RowKey" });
            DropIndex("dbo.Sys_CompShortIds", new[] { "PartitionKey" });
            DropIndex("dbo.Sys_Admins", new[] { "RowKey" });
            DropIndex("dbo.Sys_Admins", new[] { "PartitionKey" });
            DropIndex("dbo.HumanEvals", new[] { "RowKey" });
            DropIndex("dbo.HumanEvals", new[] { "PartitionKey" });
            DropIndex("dbo.CourseLongs", new[] { "RowKey" });
            DropIndex("dbo.CourseLongs", new[] { "PartitionKey" });
            DropIndex("dbo.Company_Users", new[] { "RowKey" });
            DropIndex("dbo.Company_Users", new[] { "PartitionKey" });
            DropIndex("dbo.Company_Metas", new[] { "RowKey" });
            DropIndex("dbo.Company_Metas", new[] { "PartitionKey" });
            DropIndex("dbo.Company_Licences", new[] { "RowKey" });
            DropIndex("dbo.Company_Licences", new[] { "PartitionKey" });
            DropIndex("dbo.Company_DepartmentUsage", new[] { "RowKey" });
            DropIndex("dbo.Company_DepartmentUsage", new[] { "PartitionKey" });
            DropIndex("dbo.Company_Departments", new[] { "RowKey" });
            DropIndex("dbo.Company_Departments", new[] { "PartitionKey" });
            DropTable("dbo.User_Datas");
            DropTable("dbo.User_Companies");
            DropTable("dbo.Sys_CompShortIds");
            DropTable("dbo.Sys_Admins");
            DropTable("dbo.HumanEvals");
            DropTable("dbo.CourseLongs");
            DropTable("dbo.Company_Users");
            DropTable("dbo.Company_Metas");
            DropTable("dbo.Company_Licences");
            DropTable("dbo.Company_DepartmentUsage");
            DropTable("dbo.Company_Departments");
        }
    }
}
