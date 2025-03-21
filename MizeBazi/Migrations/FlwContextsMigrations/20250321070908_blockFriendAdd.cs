using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations.FlwContextsMigrations
{
    /// <inheritdoc />
    public partial class blockFriendAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Notifications",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 255, DateTimeKind.Local).AddTicks(2133),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 171, DateTimeKind.Local).AddTicks(4109));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Messages",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 248, DateTimeKind.Local).AddTicks(550),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 163, DateTimeKind.Local).AddTicks(2583));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Groups",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 250, DateTimeKind.Local).AddTicks(2372),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 165, DateTimeKind.Local).AddTicks(6866));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "GroupMessages",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 253, DateTimeKind.Local).AddTicks(768),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 169, DateTimeKind.Local).AddTicks(1178));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "GroupMembers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 251, DateTimeKind.Local).AddTicks(1508),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 166, DateTimeKind.Local).AddTicks(7536));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Friends",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 246, DateTimeKind.Local).AddTicks(2657),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 161, DateTimeKind.Local).AddTicks(2268));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "FriendRequests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 238, DateTimeKind.Local).AddTicks(2446),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 155, DateTimeKind.Local).AddTicks(6291));

            migrationBuilder.CreateTable(
                name: "BlockFriends",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    User1Id = table.Column<long>(type: "bigint", nullable: false),
                    User2Id = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 244, DateTimeKind.Local).AddTicks(620))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockFriends", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BlockFriends_User_User1Id",
                        column: x => x.User1Id,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BlockFriends_User_User2Id",
                        column: x => x.User2Id,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlockFriends_Id",
                schema: "flw",
                table: "BlockFriends",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_BlockFriends_User1Id",
                schema: "flw",
                table: "BlockFriends",
                column: "User1Id");

            migrationBuilder.CreateIndex(
                name: "IX_BlockFriends_User2Id",
                schema: "flw",
                table: "BlockFriends",
                column: "User2Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockFriends",
                schema: "flw");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Notifications",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 171, DateTimeKind.Local).AddTicks(4109),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 255, DateTimeKind.Local).AddTicks(2133));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Messages",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 163, DateTimeKind.Local).AddTicks(2583),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 248, DateTimeKind.Local).AddTicks(550));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Groups",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 165, DateTimeKind.Local).AddTicks(6866),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 250, DateTimeKind.Local).AddTicks(2372));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "GroupMessages",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 169, DateTimeKind.Local).AddTicks(1178),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 253, DateTimeKind.Local).AddTicks(768));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "GroupMembers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 166, DateTimeKind.Local).AddTicks(7536),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 251, DateTimeKind.Local).AddTicks(1508));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "Friends",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 161, DateTimeKind.Local).AddTicks(2268),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 246, DateTimeKind.Local).AddTicks(2657));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "flw",
                table: "FriendRequests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 3, 20, 17, 22, 22, 155, DateTimeKind.Local).AddTicks(6291),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 3, 21, 8, 9, 7, 238, DateTimeKind.Local).AddTicks(2446));
        }
    }
}
