using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations
{
    /// <inheritdoc />
    public partial class UserThumbnailFix1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                schema: "org",
                table: "UsersThumbnail",
                type: "nvarchar(140)",
                maxLength: 140,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 24, 41, 698, DateTimeKind.Local).AddTicks(6192),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 346, DateTimeKind.Local).AddTicks(2361));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 24, 41, 698, DateTimeKind.Local).AddTicks(458),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(7895));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Devices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 24, 41, 698, DateTimeKind.Local).AddTicks(2647),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(9624));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                schema: "org",
                table: "UsersThumbnail",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(140)",
                oldMaxLength: 140,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 346, DateTimeKind.Local).AddTicks(2361),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 24, 41, 698, DateTimeKind.Local).AddTicks(6192));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(7895),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 24, 41, 698, DateTimeKind.Local).AddTicks(458));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Devices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 1, 16, 40, 345, DateTimeKind.Local).AddTicks(9624),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 1, 24, 41, 698, DateTimeKind.Local).AddTicks(2647));
        }
    }
}
