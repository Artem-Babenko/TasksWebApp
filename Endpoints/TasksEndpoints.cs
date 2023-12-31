﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using TasksWebApp.Models;

namespace TasksWebApp.Endpoints;

public static class TasksEndpoints
{
    /// <summary>
    /// Додає обробник запитів для роботи з завданнями.
    /// </summary>
    /// <param name="app"></param>
    public static void UseTasksEndpoints(this WebApplication app)
    {
        // Надсилання кількості не виконаних завдань.
        app.MapGet("/tasks/counts", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            int userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.WastedTimes)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.DaysToRepeat)
                .Include(u => u.ListsOfTasks!)
                .ThenInclude(l => l.Tasks)
                .FirstOrDefault(u => u.Id == userId);
            if (user is null || user.ListsOfTasks is null) return Results.NotFound();

            int today = user.Tasks!.Where(t => t.Today && !t.Completed).Count();
            int planed = user.Tasks!.Where(t => t.FinishDate != null && !t.Completed).Count();
            int important = user.Tasks!.Where(t => t.Important && !t.Completed).Count();
            int tasks = user.Tasks!.Where(t => !t.Completed && t.ListOfTasks is null).Count();

            List<CountTaskInList> countsList = new List<CountTaskInList>();
            foreach (var list in user.ListsOfTasks)
                countsList.Add(new CountTaskInList(list.Id, list.Tasks!.Where(t => !t.Completed).Count()));

            return Results.Json(new { today = today, planed = planed, important = important, tasks = tasks, countsList = countsList });
        });

        // Надсилання завдань на сторінку "Завдання".
        app.MapGet("/tasks", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            int userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.WastedTimes)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.DaysToRepeat)
                .Include(u => u.ListsOfTasks)
                .FirstOrDefault(u => u.Id == userId);

            var tasks = user?.Tasks?.Where(t => t.ListOfTasks is null).ToList();
            return Results.Json(tasks);
        });

        // Надсилання завдання, використовуючи отриманий ідентифікатор завдання.
        app.MapGet("/tasks/{id}", [Authorize] (int id, HttpContext context, ApplicationContext db) =>
        {
            int userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.WastedTimes)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.DaysToRepeat)
                .Include(u => u.ListsOfTasks)
                .FirstOrDefault(u => u.Id == userId);

            var task = user?.Tasks?.ToList().FirstOrDefault(task => task.Id == id);
            return Results.Json(task);
        });

        // Надсилання важливих завдань на сторінку важливе.
        app.MapGet("/tasks/important", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            int userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.WastedTimes)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.DaysToRepeat)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.ListOfTasks)
                .FirstOrDefault(u => u.Id == userId);

            var importantTasks = user?.Tasks?.ToList().Where(task => task.Important == true);

            return Results.Json(importantTasks);
        });

        // Надсилання важливих завдань на сторінку важливе.
        app.MapGet("/tasks/today", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            int userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.WastedTimes)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.DaysToRepeat)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.ListOfTasks)
                .FirstOrDefault(u => u.Id == userId);

            var importantTasks = user?.Tasks?.ToList().Where(task => task.Today == true);

            return Results.Json(importantTasks);
        });

        // Надсилає плановані завдання на сторінку "Заплановано".
        app.MapGet("/tasks/planed", [Authorize] (HttpContext context, ApplicationContext db) =>
        {
            int userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = db.Users
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.WastedTimes)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.DaysToRepeat)
                .Include(u => u.Tasks!)
                .ThenInclude(t => t.ListOfTasks)
                .FirstOrDefault(u => u.Id == userId);

            List<UserTask>? planedTasks = user?.Tasks?.Where(task => task.FinishDate != null).ToList();

            planedTasks = planedTasks?.OrderBy(task => task.FinishDate).ToList();

            return Results.Json(planedTasks);
        });

        // Отримує назву завдання, створює та надсилає нове завдання у список завдань.
        app.MapPost("/tasks", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users
                .Include(u => u.ListsOfTasks)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null) return Results.NotFound();

            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            var list = user.ListsOfTasks?.FirstOrDefault(l => l.Id == data.ListOfTasksId);

            var newTask = new UserTask(
                name: data.Name,
                complited: data.Completed,
                important: data.Important,
                createDate: DateTime.Now
            )
            {
                User = user,
                UserId = userId,
                Today = data.Today,
                ListOfTasks = list ?? null,
                ListOfTasksId = list?.Id ?? null
            };

            newTask = db.Tasks.Add(newTask).Entity;
            db.SaveChanges();

            return Results.Json(newTask);
        });

        // Отримує ідентифікатор завдання та видаляє його.
        app.MapDelete("/tasks/{id}", [Authorize] async (int id, HttpContext context, ApplicationContext db) =>
        {
            UserTask? task = await db.Tasks.FindAsync(id);
            if (task is null) return Results.BadRequest();

            db.Tasks.Remove(task);
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримує завдання та редагує його властивості вісносно отриманого об'єкту.
        app.MapPut("/tasks", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            UserTask? task = await db.Tasks.FindAsync(data.Id);
            if (task is null) return Results.NotFound();

            task.Name = data.Name ?? task.Name;
            task.Description = data.Description ?? task.Description;
            task.Completed = data.Completed;
            task.Important = data.Important;
            task.Today = data.Today;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримує інформацію про дату виконання завдання та встановлює її завданню.
        app.MapPut("/tasks/finish-date/{id}", [Authorize] async (int id, HttpContext context, ApplicationContext db) =>
        {
            string? dateString = await context.Request.ReadFromJsonAsync<string>();

            DateTime.TryParseExact(
                dateString,
                "d.M.yyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateTime resultDateTime
            );
            resultDateTime = resultDateTime.AddHours(23).AddMinutes(59);

            var task = await db.Tasks.FindAsync(id);
            if (task is null) return Results.NotFound();

            if (dateString == "null")
            {
                task.FinishDate = null;
            }
            else
            {
                task.FinishDate = resultDateTime;
            }

            db.SaveChanges();

            return Results.Ok();
        });
    }
}

record class CountTaskInList(int id, int count);