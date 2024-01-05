using TasksWebApp;
using Microsoft.AspNetCore.ResponseCompression;
using TasksWebApp.Endpoints;


var builder = WebApplication.CreateBuilder();
// Сервіс для взаємнодії з базою даних.
builder.Services.AddEntityFrameworkSqlite().AddDbContext<ApplicationContext>();
// Сервіс для стиснення відповіді.
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
// Сервіс для перевірки чи відображати завдання сьогодні сьогодні.
builder.Services.AddSingleton<TaskTodayCheckerService>();
// Ауторизація та аутентифікація.
builder.Services.AddAuthorization();
builder.Services.AddAuthentication("Cookies").AddCookie(options =>
{
    options.Cookie.HttpOnly = false;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.Name = "AuthenticationCookie";
});
// Swagger services.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Cors service for testing api in Swager Editor.
builder.Services.AddCors();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseCors(builder =>
    {
        builder.WithOrigins("https://editor.swagger.io")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
    });
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Використати сервіс для стиснення відповіді.
app.UseResponseCompression();
// Запуск щодобової перевірки завдань.
app.Services.StartTaskTodayChecker();

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

// Застосування кінцевих точок.
app.UseStaticResourceEndpoints();
app.UseTasksEndpoints();
app.UseUserEndpoints();
app.UseListOfTasksEndpoints();

app.Run();
