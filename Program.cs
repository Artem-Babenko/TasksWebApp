
using Microsoft.AspNetCore.ResponseCompression;
using TasksWebApp.Endpoints;

namespace TasksWebApp;
class Program
{
    static void Main()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddEntityFrameworkSqlite().AddDbContext<ApplicationContext>();
        builder.Services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<GzipCompressionProvider>();
            options.Providers.Add<BrotliCompressionProvider>();
            options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
            {
                "text/html",
                "application/json"
            });
        });
        builder.Services.AddSingleton<TaskTodayCheckerService>();
        builder.Services.AddAuthorization();
        builder.Services.AddAuthentication("Cookies").AddCookie(options =>
        {
            options.Cookie.HttpOnly = false;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.Name = "AuthenticationCookie";
        });
        var app = builder.Build();

        app.UseResponseCompression();
        app.Services.StartTaskTodayChecker();

        app.UseStaticFiles();
        app.UseAuthentication();
        app.UseAuthorization();

        app.SendIndexPage();
        app.UseTasksEndpoints();
        app.UseUserEndpoints();
        app.UseListOfTasksEndpoints();

        app.Run();
    }
}

