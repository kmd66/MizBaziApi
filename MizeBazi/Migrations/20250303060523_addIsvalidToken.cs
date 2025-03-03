using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations
{
    /// <inheritdoc />
    public partial class addIsvalidToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "img",
                schema: "org",
                table: "UsersThumbnail",
                type: "varbinary(max)",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                schema: "org",
                table: "Users",
                type: "varchar(11)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(11)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 3, 7, 5, 20, 538, DateTimeKind.Local).AddTicks(590),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 1, 9, 12, 3, 92, DateTimeKind.Local).AddTicks(2997));

            migrationBuilder.AddColumn<bool>(
                name: "IsValid",
                schema: "org",
                table: "Tokens",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 3, 7, 5, 20, 537, DateTimeKind.Local).AddTicks(6168),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 1, 9, 12, 3, 91, DateTimeKind.Local).AddTicks(9540));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Devices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 3, 7, 5, 20, 537, DateTimeKind.Local).AddTicks(8077),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 1, 9, 12, 3, 92, DateTimeKind.Local).AddTicks(1207));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsValid",
                schema: "org",
                table: "Tokens");

            migrationBuilder.AlterColumn<byte[]>(
                name: "img",
                schema: "org",
                table: "UsersThumbnail",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                schema: "org",
                table: "Users",
                type: "varchar(11)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 1, 9, 12, 3, 92, DateTimeKind.Local).AddTicks(2997),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 3, 7, 5, 20, 538, DateTimeKind.Local).AddTicks(590));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 1, 9, 12, 3, 91, DateTimeKind.Local).AddTicks(9540),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 3, 7, 5, 20, 537, DateTimeKind.Local).AddTicks(6168));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "Devices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 1, 9, 12, 3, 92, DateTimeKind.Local).AddTicks(1207),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 3, 7, 5, 20, 537, DateTimeKind.Local).AddTicks(8077));
        }
    }
}
