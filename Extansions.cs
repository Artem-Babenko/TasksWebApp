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
    /// Додає обробник запитів для надсилання головної сторінки та надсилання назв фото для її фону.
    /// </summary>
    public static void UseStaticResourceEndpoints(this WebApplication app)
    {
        app.MapGet("/", async (HttpContext context, ApplicationContext db) =>
        {
            context.Response.ContentType = "text/html; charset=utf-8";
            await context.Response.SendFileAsync("wwwroot/html/index.html");
        });

        // Надсилає шляхи фотографій для заднього фону.
        app.MapGet("/api/backgrounds", (HttpContext context, ApplicationContext db) =>
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
    }

    /// <summary>
    /// Запускає фоновий процес, який встановлюватиме кожен день кожному завданню чи воно відображатиметься на сторінці чи ні.
    /// </summary>
    /// <param name="provider"></param>
    static public void StartTaskTodayChecker(this IServiceProvider provider)
        => provider.GetService<TaskTodayCheckerService>()?.Start();
}

