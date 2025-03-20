using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations
{
    /// <inheritdoc />
    public partial class UserThumbnailFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                schema: "org",
                table: "UsersThumbnail",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 346, DateTimeKind.Local).AddTicks(2361),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 5, 8, 42, 49, 746, DateTimeKind.Local).AddTicks(6420));

            migrationBuilder.AddColumn<DateTime>(
                name: "BirthDate",
                schema: "org",
                table: "Users",
                type: "Date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(7895),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 5, 8, 42, 49, 746, DateTimeKind.Local).AddTicks(2365));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Devices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(9624),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 5, 8, 42, 49, 746, DateTimeKind.Local).AddTicks(3902));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                schema: "org",
                table: "UsersThumbnail");

            migrationBuilder.DropColumn(
                name: "BirthDate",
                schema: "org",
                table: "Users");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 5, 8, 42, 49, 746, DateTimeKind.Local).AddTicks(6420),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 346, DateTimeKind.Local).AddTicks(2361));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 5, 8, 42, 49, 746, DateTimeKind.Local).AddTicks(2365),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(7895));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Devices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 5, 8, 42, 49, 746, DateTimeKind.Local).AddTicks(3902),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(9624));
        }
    }
}
