using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Infrastructure;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Migrations;
using NewData;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace DataLib2.Migrations
{
    [DbContext(typeof(NewLMComContext_SqlServer))]
    partial class lmcomserv001
    {
        public override string Id
        {
            get { return "20151015131947_lmcom-serv-001"; }
        }

        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .Annotation("ProductVersion", "7.0.0-beta7-15540")
                .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn);

            modelBuilder.Entity("NewData.Companies", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("Created");

                    b.Property<string>("HumanEvalPaymentConfig");

                    b.Property<string>("IntervalsConfig");

                    b.Property<string>("ScormHost")
                        .Annotation("MaxLength", 240);

                    b.Property<string>("Title")
                        .Required();

                    b.Key("Id");

                    b.Index("ScormHost");
                });

            modelBuilder.Entity("NewData.CompanyDepartments", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CompanyId");

                    b.Property<int?>("ParentId")
                        .Annotation("Relational:DefaultValue", "0")
                        .Annotation("Relational:DefaultValueType", "System.Int32");

                    b.Property<string>("Title")
                        .Required();

                    b.Key("Id");
                });

            modelBuilder.Entity("NewData.CompanyLicences", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CompanyId");

                    b.Property<DateTime>("Created");

                    b.Property<short>("Days");

                    b.Property<int>("LastCounter");

                    b.Property<string>("ProductId");

                    b.Key("Id");
                });

            modelBuilder.Entity("NewData.CompanyUsers", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CompanyId");

                    b.Property<DateTime>("Created");

                    b.Property<int?>("DepartmentId");

                    b.Property<string>("RolePar");

                    b.Property<long>("Roles");

                    b.Property<long>("UserId");

                    b.Key("Id");
                });

            modelBuilder.Entity("NewData.CourseDatas", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CourseUserId");

                    b.Property<string>("Data")
                        .Required();

                    b.Property<long>("Date");

                    b.Property<long>("Flags")
                        .Annotation("Relational:DefaultValue", "0")
                        .Annotation("Relational:DefaultValueType", "System.Int64");

                    b.Property<string>("Key")
                        .Required()
                        .Annotation("MaxLength", 120);

                    b.Property<string>("ShortData");

                    b.Key("Id");

                    b.Index("Flags");

                    b.Index("Key");
                });

            modelBuilder.Entity("NewData.CourseUsers", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("Created");

                    b.Property<DateTime>("HumanAssigned");

                    b.Property<int>("HumanCompanyUserId")
                        .Annotation("Relational:DefaultValue", "0")
                        .Annotation("Relational:DefaultValueType", "System.Int32");

                    b.Property<string>("ProductId")
                        .Annotation("MaxLength", 240);

                    b.Property<int>("UserId");

                    b.Key("Id");

                    b.Index("ProductId");
                });

            modelBuilder.Entity("NewData.LANGMasterScorms", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ApiUrlCrc")
                        .Annotation("Relational:DefaultValue", "0")
                        .Annotation("Relational:DefaultValueType", "System.Int32");

                    b.Property<long>("AttemptId");

                    b.Property<Guid?>("AttemptIdGuid");

                    b.Property<string>("AttemptIdStr");

                    b.Property<string>("Data1");

                    b.Property<string>("Data2");

                    b.Property<long>("Date");

                    b.Property<long>("Key1Int");

                    b.Property<string>("Key1Str");

                    b.Property<long>("Key2Int");

                    b.Property<string>("Key2Str");

                    b.Property<string>("UserId")
                        .Required();

                    b.Key("Id");
                });

            modelBuilder.Entity("NewData.UserLicences", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Counter");

                    b.Property<DateTime>("Created");

                    b.Property<int>("LicenceId");

                    b.Property<DateTime>("Started");

                    b.Property<int>("UserId");

                    b.Key("Id");

                    b.Index("LicenceId", "Counter")
                        .Unique();
                });

            modelBuilder.Entity("NewData.Users", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("Created");

                    b.Property<string>("EMail")
                        .Annotation("MaxLength", 120);

                    b.Property<string>("FirstName");

                    b.Property<string>("LastName");

                    b.Property<string>("Login");

                    b.Property<string>("LoginEMail");

                    b.Property<int?>("MyPublisherId");

                    b.Property<string>("OtherData");

                    b.Property<string>("OtherId")
                        .Annotation("MaxLength", 80);

                    b.Property<short>("OtherType");

                    b.Property<string>("Password");

                    b.Property<long>("Roles");

                    b.Property<short>("VerifyStatus");

                    b.Key("Id");

                    b.Index("EMail");

                    b.Index("OtherId");
                });

            modelBuilder.Entity("NewData.CompanyDepartments", b =>
                {
                    b.Reference("NewData.Companies")
                        .InverseCollection()
                        .ForeignKey("CompanyId");

                    b.Reference("NewData.CompanyDepartments")
                        .InverseCollection()
                        .ForeignKey("ParentId");
                });

            modelBuilder.Entity("NewData.CompanyLicences", b =>
                {
                    b.Reference("NewData.Companies")
                        .InverseCollection()
                        .ForeignKey("CompanyId");
                });

            modelBuilder.Entity("NewData.CompanyUsers", b =>
                {
                    b.Reference("NewData.Companies")
                        .InverseCollection()
                        .ForeignKey("CompanyId");

                    b.Reference("NewData.CompanyDepartments")
                        .InverseCollection()
                        .ForeignKey("DepartmentId");

                    b.Reference("NewData.Users")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            modelBuilder.Entity("NewData.CourseDatas", b =>
                {
                    b.Reference("NewData.CourseUsers")
                        .InverseCollection()
                        .ForeignKey("CourseUserId");
                });

            modelBuilder.Entity("NewData.CourseUsers", b =>
                {
                    b.Reference("NewData.CompanyUsers")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            modelBuilder.Entity("NewData.UserLicences", b =>
                {
                    b.Reference("NewData.CompanyLicences")
                        .InverseCollection()
                        .ForeignKey("LicenceId");

                    b.Reference("NewData.CourseUsers")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            modelBuilder.Entity("NewData.Users", b =>
                {
                    b.Reference("NewData.Companies")
                        .InverseCollection()
                        .ForeignKey("MyPublisherId");
                });
        }
    }
}
