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

        // Отримує та встановлює назву списку завдань.
        app.MapPut("/lists-of-tasks/set-name/", [Authorize] async (HttpContext context, ApplicationContext db) =>
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
        app.MapGet("/lists-of-tasks/new", [Authorize] (HttpContext context, ApplicationContext db) =>
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

        // Створює та надсилає нове завдання у списку.
        app.MapPost("/lists-of-tasks/new-task", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.ListsOfTasks)
                .FirstOrDefault(u => u.Id == userId);
            if (user is null) return Results.NotFound();

            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            var list = user.ListsOfTasks?.FirstOrDefault(l => l.Id == data.ListOfTasksId);
            if (list is null) return Results.BadRequest();

            var newTask = new UserTask(
                name: data.Name,
                complited: false,
                important: data.Important,
                createDate: DateTime.Now
            )
            {
                User = user,
                UserId = userId,
                ListOfTasks = list,
                ListOfTasksId = list.Id
            };

            newTask = db.Tasks.Add(newTask).Entity;
            db.SaveChanges();

            return Results.Json(newTask);
        });

        // Надсилає шляхи фотографій для заднього фону.
        app.MapGet("/backgrounds", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            var photoFolderPath = "wwwroot/photos/"; // або використовуйте абсолютний шлях

            // Отримати список файлів у папці фотографій
            var photoFiles = Directory
                .GetFiles(photoFolderPath, "*.jpg")
                .Select(Path.GetFileName)
                .ToList();

            // Повернути список шляхів у форматі JSON
            return Results.Json(photoFiles);
        });

        // Отримує назву нового фону для списку завдань за ідентифіктором.
        app.MapPut("/lists-of-tasks/set-background/{id}", [Authorize] async (int id, HttpContext context, ApplicationContext db) =>
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
