using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Infrastructure;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Migrations;
using NewData;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace DataLib2.Migrations
{
    [DbContext(typeof(Vyzva57Context_SqlServer))]
    partial class Vyzva57Context_SqlServerModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .Annotation("ProductVersion", "7.0.0-beta7-15540")
                .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn);

            modelBuilder.Entity("NewData.BlendedCompany", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("LearningData");

                    b.Key("Id");
                });

            modelBuilder.Entity("NewData.BlendedCourseData", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CourseUserId");

                    b.Property<string>("Data");

                    b.Property<long>("Flags");

                    b.Property<string>("Key")
                        .Required()
                        .Annotation("MaxLength", 240);

                    b.Property<string>("ShortData");

                    b.Property<string>("TaskId")
                        .Annotation("MaxLength", 32);

                    b.Key("Id");

                    b.Index("Key");

                    b.Index("TaskId");
                });

            modelBuilder.Entity("NewData.BlendedCourseUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CompanyId");

                    b.Property<long>("LMComId");

                    b.Property<string>("ProductUrl")
                        .Required()
                        .Annotation("MaxLength", 120);

                    b.Key("Id");

                    b.Index("LMComId");

                    b.Index("ProductUrl");
                });

            modelBuilder.Entity("NewData.BlendedCourseData", b =>
                {
                    b.Reference("NewData.BlendedCourseUser")
                        .InverseCollection()
                        .ForeignKey("CourseUserId");
                });

            modelBuilder.Entity("NewData.BlendedCourseUser", b =>
                {
                    b.Reference("NewData.BlendedCompany")
                        .InverseCollection()
                        .ForeignKey("CompanyId");
                });
        }
    }
}
