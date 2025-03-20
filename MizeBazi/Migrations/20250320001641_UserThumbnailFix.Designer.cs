﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MizeBazi.DataSource;

#nullable disable

namespace MizeBazi.Migrations
{
    [DbContext(typeof(OrgContexts))]
    [Migration("20250320001641_UserThumbnailFix")]
    partial class UserThumbnailFix
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema("org")
                .HasAnnotation("ProductVersion", "8.0.13")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("MizeBazi.Models.Device", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("Date")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime2")
                        .HasDefaultValue(new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(9624));

                    b.Property<string>("DeviceId")
                        .IsRequired()
                        .HasColumnType("varchar(32)");

                    b.Property<string>("Phone")
                        .IsRequired()
                        .HasColumnType("varchar(11)");

                    b.HasKey("Id");

                    b.HasIndex("Id");

                    b.ToTable("Devices", "org");
                });

            modelBuilder.Entity("MizeBazi.Models.SecurityStamp", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<byte>("Count")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint")
                        .HasDefaultValue((byte)0);

                    b.Property<DateTime>("Date")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime2")
                        .HasDefaultValue(new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(7895));

                    b.Property<string>("Phone")
                        .IsRequired()
                        .HasColumnType("varchar(11)");

                    b.Property<string>("Stamp")
                        .IsRequired()
                        .HasColumnType("varchar(5)");

                    b.HasKey("Id");

                    b.HasIndex("Id");

                    b.ToTable("SecurityStamps", "org");
                });

            modelBuilder.Entity("MizeBazi.Models.Token", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Hash")
                        .IsRequired()
                        .HasColumnType("varchar(32)");

                    b.Property<bool>("IsValid")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bit")
                        .HasDefaultValue(true);

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("Id");

                    b.ToTable("Tokens", "org");
                });

            modelBuilder.Entity("MizeBazi.Models.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("BirthDate")
                        .HasColumnType("Date");

                    b.Property<DateTime>("Date")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime2")
                        .HasDefaultValue(new DateTime(2025, 3, 20, 1, 16, 40, 346, DateTimeKind.Local).AddTicks(2361));

                    b.Property<string>("FirstName")
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.Property<string>("LastName")
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.Property<string>("Phone")
                        .HasColumnType("varchar(11)");

                    b.Property<byte>("Type")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint")
                        .HasDefaultValue((byte)1);

                    b.Property<Guid>("UnicId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("UserName")
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.HasKey("Id");

                    b.HasIndex("UnicId");

                    b.ToTable("Users", "org");
                });

            modelBuilder.Entity("MizeBazi.Models.UserThumbnail", b =>
                {
                    b.Property<long>("Id")
                        .HasColumnType("bigint");

                    b.Property<string>("Bio")
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<byte[]>("img")
                        .HasColumnType("varbinary(max)");

                    b.HasKey("Id");

                    b.ToTable("UsersThumbnail", "org");
                });

            modelBuilder.Entity("MizeBazi.Models.UserView", b =>
                {
                    b.Property<DateTime>("BirthDate")
                        .HasColumnType("Date");

                    b.Property<DateTime>("Date")
                        .HasColumnType("datetime2");

                    b.Property<string>("FirstName")
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.Property<long>("Id")
                        .HasColumnType("bigint");

                    b.Property<byte[]>("Img")
                        .HasColumnType("varbinary(max)");

                    b.Property<string>("LastName")
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.Property<string>("Phone")
                        .HasColumnType("varchar(11)");

                    b.Property<byte>("Type")
                        .HasColumnType("tinyint");

                    b.Property<Guid>("UnicId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("UserName")
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.ToTable((string)null);

                    b.ToView("UserView", "org");
                });
#pragma warning restore 612, 618
        }
    }
}
