using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Infrastructure;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Migrations;
using NewData;

namespace DataLib2.Migrations
{
    [DbContext(typeof(Vyzva57Context_Sqlite))]
    partial class Vyzva57Context_SqliteModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .Annotation("ProductVersion", "7.0.0-beta8-15964");

            modelBuilder.Entity("NewData.BlendedCompany", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("LearningData");

                    b.HasKey("Id");
                });

            modelBuilder.Entity("NewData.BlendedCourseData", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CourseUserId");

                    b.Property<string>("Data");

                    b.Property<long>("Flags");

                    b.Property<string>("Key")
                        .IsRequired()
                        .Annotation("MaxLength", 240);

                    b.Property<string>("ShortData");

                    b.Property<string>("TaskId")
                        .Annotation("MaxLength", 32);

                    b.HasKey("Id");

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
                        .IsRequired()
                        .Annotation("MaxLength", 120);

                    b.HasKey("Id");

                    b.Index("LMComId");

                    b.Index("ProductUrl");
                });

            modelBuilder.Entity("NewData.BlendedCourseData", b =>
                {
                    b.HasOne("NewData.BlendedCourseUser")
                        .WithMany()
                        .ForeignKey("CourseUserId");
                });

            modelBuilder.Entity("NewData.BlendedCourseUser", b =>
                {
                    b.HasOne("NewData.BlendedCompany")
                        .WithMany()
                        .ForeignKey("CompanyId");
                });
        }
    }
}
