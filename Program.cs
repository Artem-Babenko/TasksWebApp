
using Microsoft.AspNetCore.ResponseCompression;

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
                "text/css",
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
        app.TasksRequests();
        app.UserRequests();
        app.ListOfTasksRequests();

        app.Run();
    }
}

