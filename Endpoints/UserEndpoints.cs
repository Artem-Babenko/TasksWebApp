using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TasksWebApp.Models;

namespace TasksWebApp.Endpoints;

public static class UserEndpoints
{
    /// <summary>
    /// Додає обробник запитів для роботи з користувачем, включаючи обробку його даних.
    /// </summary>
    public static void UseUserEndpoints(this WebApplication app)
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
}
