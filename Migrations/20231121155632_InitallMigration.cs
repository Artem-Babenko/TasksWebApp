using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TasksWebApp.Migrations
{
    /// <inheritdoc />
    public partial class InitallMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Surname = table.Column<string>(type: "TEXT", nullable: false),
                    Login = table.Column<string>(type: "TEXT", nullable: false),
                    Password = table.Column<string>(type: "TEXT", nullable: false),
                    TodayBackground = table.Column<string>(type: "TEXT", nullable: false),
                    PlanedBackground = table.Column<string>(type: "TEXT", nullable: false),
                    ImportantBackground = table.Column<string>(type: "TEXT", nullable: false),
                    TasksBackground = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ListsOfTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Background = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListsOfTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListsOfTasks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Completed = table.Column<bool>(type: "INTEGER", nullable: false),
                    Important = table.Column<bool>(type: "INTEGER", nullable: false),
                    Today = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FinishDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    ListOfTasksId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_ListsOfTasks_ListOfTasksId",
                        column: x => x.ListOfTasksId,
                        principalTable: "ListsOfTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tasks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WastedTimes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreateDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Time = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    TaskId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WastedTimes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WastedTimes_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WeekDays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    TaskId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeekDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WeekDays_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "ImportantBackground", "Login", "Name", "Password", "PlanedBackground", "Surname", "TasksBackground", "TodayBackground" },
                values: new object[] { 1, "783283475.jpg", "artem123", "Артем", "12345678", "53454.jpg", "Бабенко", "5464774.jpg", "89495645.jpg" });

            migrationBuilder.InsertData(
                table: "ListsOfTasks",
                columns: new[] { "Id", "Background", "Name", "UserId" },
                values: new object[] { 2, "blue.jpg", "Університет", 1 });

            migrationBuilder.InsertData(
                table: "Tasks",
                columns: new[] { "Id", "Completed", "CreateDate", "Description", "FinishDate", "Important", "ListOfTasksId", "Name", "Today", "UserId" },
                values: new object[,]
                {
                    { 2, false, new DateTime(2023, 11, 21, 17, 56, 32, 862, DateTimeKind.Local).AddTicks(8400), null, null, false, null, "Намалювати картинку.", false, 1 },
                    { 3, false, new DateTime(2023, 11, 21, 17, 56, 32, 862, DateTimeKind.Local).AddTicks(8404), null, null, false, null, "Зробити програму для сайту.", false, 1 },
                    { 4, false, new DateTime(2023, 11, 21, 17, 56, 32, 862, DateTimeKind.Local).AddTicks(8406), null, null, false, 2, "Написати семінар.", false, 1 },
                    { 5, false, new DateTime(2023, 11, 21, 17, 56, 32, 862, DateTimeKind.Local).AddTicks(8410), null, null, false, 2, "Виконати контрольну.", false, 1 }
                });

            migrationBuilder.InsertData(
                table: "WastedTimes",
                columns: new[] { "Id", "CreateDate", "TaskId", "Time" },
                values: new object[,]
                {
                    { 1, new DateTime(2023, 11, 21, 17, 56, 32, 862, DateTimeKind.Local).AddTicks(8327), 3, new TimeSpan(0, 0, 19, 0, 0) },
                    { 2, new DateTime(2023, 11, 21, 17, 56, 32, 862, DateTimeKind.Local).AddTicks(8373), 3, new TimeSpan(0, 0, 53, 0, 0) }
                });

            migrationBuilder.InsertData(
                table: "WeekDays",
                columns: new[] { "Id", "Index", "Name", "TaskId" },
                values: new object[,]
                {
                    { 1, 1, "Monday", 3 },
                    { 2, 2, "Tuesday", 3 },
                    { 3, 3, "Wednesday", 3 },
                    { 4, 4, "Thursday", 3 },
                    { 5, 5, "Friday", 3 }
                });

            migrationBuilder.InsertData(
                table: "WastedTimes",
                columns: new[] { "Id", "CreateDate", "TaskId", "Time" },
                values: new object[] { 3, new DateTime(2023, 11, 21, 17, 56, 32, 862, DateTimeKind.Local).AddTicks(8376), 4, new TimeSpan(0, 0, 45, 0, 0) });

            migrationBuilder.InsertData(
                table: "WeekDays",
                columns: new[] { "Id", "Index", "Name", "TaskId" },
                values: new object[,]
                {
                    { 6, 6, "Saturday", 4 },
                    { 7, 7, "Sunday", 4 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListsOfTasks_UserId",
                table: "ListsOfTasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ListOfTasksId",
                table: "Tasks",
                column: "ListOfTasksId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId",
                table: "Tasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WastedTimes_TaskId",
                table: "WastedTimes",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WeekDays_TaskId",
                table: "WeekDays",
                column: "TaskId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WastedTimes");

            migrationBuilder.DropTable(
                name: "WeekDays");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "ListsOfTasks");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
