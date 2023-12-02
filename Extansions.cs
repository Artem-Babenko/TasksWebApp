using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using TasksWebApp.Models;

namespace TasksWebApp;

public static class Extansions
{
    /// <summary>
    /// Додає обробник запиту для надіслання головної сторінки.
    /// </summary>
    /// <param name="app">Екземпляр додатку.</param>
    public static void SendIndexPage(this WebApplication app)
    {
        app.MapGet("/", async (HttpContext context, ApplicationContext db) =>
        {
            context.Response.ContentType = "text/html; charset=utf-8";
            await context.Response.SendFileAsync("wwwroot/html/index.html");
        });
    }

    /// <summary>
    /// Додає обробник запитів для роботи з завданнями.
    /// </summary>
    /// <param name="app">Екземпляр додатку.</param>
    public static void TasksRequests(this WebApplication app)
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

        // Отримання та встановлення важливості завданнь.
        app.MapPut("/tasks/set-important", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            UserTask? data = await context.Request.ReadFromJsonAsync<UserTask>();

            if (data is null) return Results.BadRequest();

            UserTask? task = await db.Tasks.FindAsync(data.Id);
            if (task is null) return Results.NotFound();

            task.Important = data.Important;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримання та встановлення властивості завдання виконати сьогодні.
        app.MapPut("/tasks/set-today", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            UserTask? data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            UserTask? task = await db.Tasks.FindAsync(data.Id);
            if (task is null) return Results.NotFound();

            task.Today = data.Today;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримання та встановлення властовості "Виконано" у завдання.
        app.MapPut("/tasks/set-completed", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            var task = db.Tasks.FirstOrDefault(t => t.Id == data.Id);
            if (task is null) return Results.NotFound();

            task.Completed = data.Completed;
            db.SaveChanges();

            return Results.Ok();
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
        app.MapPost("/tasks/new", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();

            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            var newTask = new UserTask(
                name: data.Name,
                complited: false,
                important: data.Important,
                createDate: DateTime.Now
            )
            {
                User = user,
                UserId = userId,
            };
            newTask = db.Tasks.Add(newTask).Entity;
            db.SaveChanges();

            return Results.Json(newTask);
        });

        // Отримує назву завдання, створює та надсилає нове Важливе завдання у список завдань.
        app.MapPost("/tasks/new-important", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();

            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            var newTask = new UserTask(
                name: data.Name,
                complited: false,
                important: data.Important,
                createDate: DateTime.Now
            )
            {
                User = user,
                UserId = userId,
            };
            newTask = db.Tasks.Add(newTask).Entity;
            db.SaveChanges();

            return Results.Json(newTask);
        });

        // Отримує назву завдання, створює та надсилає нове Важливе завдання у список завдань.
        app.MapPost("/tasks/new-today", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();

            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            var newTask = new UserTask(
                name: data.Name,
                complited: false,
                important: false,
                createDate: DateTime.Now
            )
            {
                User = user,
                UserId = userId,
                Today = data.Today
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

        // Отримує завдання та редагує його зміст.
        app.MapPut("/tasks/set-description/", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            UserTask? task = await db.Tasks.FindAsync(data.Id);
            if (task is null) return Results.NotFound();

            task.Description = data.Description;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримує завдання та редагує його назву.
        app.MapPut("/tasks/set-name/", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var data = await context.Request.ReadFromJsonAsync<UserTask>();
            if (data is null) return Results.BadRequest();

            UserTask? task = await db.Tasks.FindAsync(data.Id);
            if (task is null) return Results.NotFound();

            task.Name = data.Name;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримує інформацію про дату виконання завдання.
        app.MapPut("/tasks/set-finish-date/{id}", [Authorize] async (int id, HttpContext context, ApplicationContext db) =>
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

    /// <summary>
    /// Додає обробник запитів для роботи з списками завдань.
    /// </summary>
    /// <param name="app">Екземпляд додатку.</param>
    public static void ListOfTasksRequests(this WebApplication app)
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

            var newList = new ListOfTasks ()
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

    /// <summary>
    /// Додає обробник запитів для роботи з користувачем, включаючи обробку його даних.
    /// </summary>
    /// <param name="app">Екземпляр додатку.</param>
    public static void UserRequests(this WebApplication app)
    {
        // Надсилає зареєстрованого користувача.
        app.MapGet("/user", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            return Results.Json(user);
        });

        // Отримує дані користувача та авторизує його.
        app.MapPost("/login", async (HttpContext context, ApplicationContext db) =>
        {
            var data = await context.Request.ReadFromJsonAsync<User>();
            if (data is null) return Results.BadRequest();

            string login = data.Login;
            string password = data.Password;

            var user = db.Users
                .ToList()
                .FirstOrDefault(u => u.Login == login && u.Password == password);

            if (user is null) return Results.NotFound();

            var claims = new List<Claim>()
            {
                new Claim("Id", user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Surname, user.Surname),
                new Claim("login", user.Login)
            };
            var identity = new ClaimsIdentity(claims, "Cookies");
            var principal = new ClaimsPrincipal(identity);

            // Виконуємо процедуру аутентифікації користувача.
            await context.SignInAsync(principal);
            return Results.Ok();
        });

        // Отримує дані реєстрації, створює нового користувача та авторизує його.
        app.MapPost("/registration", async (HttpContext context, ApplicationContext db) =>
        {
            var data = await context.Request.ReadFromJsonAsync<User>();
            if (data is null) return Results.BadRequest();

            var newUser = new User
            {
                Name = data.Name,
                Surname = data.Surname,
                Login = data.Login,
                Password = data.Password,
            };

            User user = db.Users.Add(newUser).Entity;
            if (user is null) return Results.StatusCode(505);

            db.SaveChanges();
            var claims = new List<Claim>()
            {
                new Claim("Id", user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Surname, user.Surname),
                new Claim("login", user.Login)
            };
            var identity = new ClaimsIdentity(claims, "Cookies");
            var principal = new ClaimsPrincipal(identity);

            // Виконуємо процедуру аутентифікації користувача.
            await context.SignInAsync(principal);
            return Results.Ok();
        });

        // Отримує запит на виралення авторизації.
        app.MapGet("/logout", async (HttpContext context) =>
        {
            await context.SignOutAsync("Cookies");
        });

        // Отримує назву нового фото для фону у списку "Завдання".
        app.MapPut("/user/set-tasks-background", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();

            string? photoName = await context.Request.ReadFromJsonAsync<string>();
            if (photoName is null) return Results.BadRequest();

            user.TasksBackground = photoName;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримує назву нового фото для фону у списку "Важливо".
        app.MapPut("/user/set-important-background", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();

            string? photoName = await context.Request.ReadFromJsonAsync<string>();
            if (photoName is null) return Results.BadRequest();

            user.ImportantBackground = photoName;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримує назву нового фото для фону у списку "Сьогодні".
        app.MapPut("/user/set-today-background", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();

            string? photoName = await context.Request.ReadFromJsonAsync<string>();
            if (photoName is null) return Results.BadRequest();

            user.TodayBackground = photoName;
            db.SaveChanges();

            return Results.Ok();
        });

        // Отримує назву нового фото для фону у списку "Заплановано".
        app.MapPut("/user/set-planed-background", [Authorize] async (HttpContext context, ApplicationContext db) =>
        {
            var userId = int.Parse(context.User.FindFirst("Id")?.Value!);
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();

            string? photoName = await context.Request.ReadFromJsonAsync<string>();
            if (photoName is null) return Results.BadRequest();

            user.PlanedBackground = photoName;
            db.SaveChanges();

            return Results.Ok();
        });
    }
    /// <summary>
    /// Запускає фотовий процес, який встановлюватиме кожен день кожному завданню чи воно відображатиметься на сторінці чи ні.
    /// </summary>
    /// <param name="provider"></param>
    static public void StartTaskTodayChecker(this IServiceProvider provider)
        => provider.GetService<TaskTodayCheckerService>()?.Start();
}

record class CountTaskInList(int id, int count);