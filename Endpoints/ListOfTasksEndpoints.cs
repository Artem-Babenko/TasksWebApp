using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TasksWebApp.Models;

namespace TasksWebApp.Endpoints;

public static class ListOfTasksEndpoints
{
    /// <summary>
    /// Додає обробник запитів для роботи з списками завдань.
    /// </summary>
    public static void UseListOfTasksEndpoints(this WebApplication app)
    {
        // Надсилання списків завдань користувача.
        app.MapGet("/lists-of-tasks", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.ListsOfTasks!)
                .FirstOrDefault(u => u.Id == userId);

            var lists = user?.ListsOfTasks?.ToList();
            return Results.Json(lists);
        });

        // Надсилання списку за отриманим ідентифікатором.
        app.MapGet("/lists-of-tasks/{id}", [Authorize] (int id, HttpContext context, ApplicationContext db) =>
        {
            var list = db.ListsOfTasks
                .Include(l => l.Tasks)
                .FirstOrDefault(l => l.Id == id);

            var tasks = list?.Tasks;
            if (tasks is null) return Results.NoContent();

            return Results.Json(tasks);
        });

        // Видалення списку за отриманим ідентифікатором.
        app.MapDelete("/lists-of-tasks/{id}", [Authorize] (int id, HttpContext context, ApplicationContext db) =>
        {
            var list = db.ListsOfTasks?
                .Include(l => l.Tasks!)
                .ThenInclude(t => t.WastedTimes)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.DaysToRepeat)
                .Include(u => u.Tasks!)
                .FirstOrDefault(l => l.Id == id);

            if (list is null) return Results.NotFound();

            db.ListsOfTasks?.Remove(list);
            db.SaveChanges();

            return Results.Json(list.Tasks?.ToList());
        });

        // Отримує та встановлює нові дані для списку завдань.
        app.MapPut("/lists-of-tasks", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            ListOfTasks? data = await context.Request.ReadFromJsonAsync<ListOfTasks>();
            if (data?.Id is null || data.Name is null) return Results.BadRequest();

            var list = await db.ListsOfTasks.FindAsync(data.Id);
            if (list is null) return Results.NotFound();

            list.Name = data.Name;
            db.SaveChanges();

            return Results.Ok();
        });

        // Створює та надсилає новий список.
        app.MapPost("/lists-of-tasks", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users.FirstOrDefault(u => u.Id == userId);
            if (user is null) return Results.NotFound();

            var newList = new ListOfTasks()
            {
                Name = "Новий список",
                UserId = userId,
                User = user,
            };

            newList = db.ListsOfTasks.Add(newList).Entity;
            user.ListsOfTasks?.Add(newList);
            db.SaveChanges();

            return Results.Json(newList);
        });

        // Отримує назву нового фону для списку завдань за ідентифіктором.
        app.MapPut("/lists-of-tasks/background/{id}", [Authorize] async (int id, HttpContext context, ApplicationContext db) =>
        {
            var list = db.ListsOfTasks?
                .Include(l => l.Tasks)
                .FirstOrDefault(l => l.Id == id);
            if (list is null) return Results.NotFound();

            string? photoName = await context.Request.ReadFromJsonAsync<string>();
            if (photoName is null) return Results.BadRequest();

            list.Background = photoName;
            db.SaveChanges();

            return Results.Ok();
        });
    }
}
