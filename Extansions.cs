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
    /// Запускає фоновий процес, який встановлюватиме кожен день кожному завданню чи воно відображатиметься на сторінці чи ні.
    /// </summary>
    /// <param name="provider"></param>
    static public void StartTaskTodayChecker(this IServiceProvider provider)
        => provider.GetService<TaskTodayCheckerService>()?.Start();
}

