using Microsoft.EntityFrameworkCore;
using TasksWebApp.Models;

namespace TasksWebApp;

/// <summary>
/// Клас, що представляє базу даних.
/// </summary>
public class ApplicationContext : DbContext
{
    /// <summary>
    /// Список користувачів у базі даних.
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;

    /// <summary>
    /// Список завдань у базі даних.
    /// </summary>
    public DbSet<UserTask> Tasks { get; set; } = null!;

    /// <summary>
    /// Cписок списків завдань користувачів у базі даних.
    /// </summary>
    public DbSet<ListOfTasks> ListsOfTasks { get; set; } = null!;

    /// <summary>
    /// Список використаного часу у базі даних, який надається завданням.
    /// </summary>
    public DbSet<WastedTime> WastedTimes { get; set; } = null!;

    /// <summary>
    /// Cписок днів дижня у базі даних, які надаються завданням.
    /// </summary>
    public DbSet<WeekDay> WeekDays { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder options)
     => options.UseSqlite("Data Source=taskapp.db"); //.LogTo(Console.WriteLine, LogLevel.Information)

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        /// Встановлення зв'язку між Завданням та Користувачем.
        modelBuilder.Entity<UserTask>()
            .HasOne(ut => ut.User)  // Один UserTask має одного користувача
            .WithMany(u => u.Tasks)  // Один користувач має багато UserTask
            .HasForeignKey(ut => ut.UserId)  // Вказуємо зовнішній ключ
            .OnDelete(DeleteBehavior.Cascade);  // Опціонально: якщо користувач видаляється, видаляються і його завдання

        /// Встановлення зв'язку між Списком завдань та Користувачем
        modelBuilder.Entity<ListOfTasks>() 
            .HasOne(listOfTasks => listOfTasks.User) // Один список має одного користувача
            .WithMany(user => user.ListsOfTasks) // Один користувач має багато списків завдань
            .HasForeignKey(listOfTasks => listOfTasks.UserId) // Зовнішній ключ
            .OnDelete(DeleteBehavior.Cascade); // Якщо видаляється користувач, видаляються списки завдань.

        /// Встановлення зв'язку між Списком завдань та Завданнями
        modelBuilder.Entity<UserTask>()
            .HasOne(task => task.ListOfTasks) // Одне завдання має один список завдань.
            .WithMany(listOfTasks => listOfTasks.Tasks) // Один список завдань має багато завдань
            .HasForeignKey(task => task.ListOfTasksId) // Зовнішній ключ
            .OnDelete(DeleteBehavior.Cascade); // Якщо видаляється список завдань, видаляються завдання.

        /// Встановлення зв'язку між Витрачетим Часом та Завданням.
        modelBuilder.Entity<WastedTime>()
            .HasOne(usedTime => usedTime.Task) // Один Використаний Час має одне завдання
            .WithMany(task => task.WastedTimes) // Одне завданя має декілька використаних часів
            .HasForeignKey(usedTime => usedTime.TaskId) // Зовнішній ключ
            .OnDelete(DeleteBehavior.Cascade); // Якщо видаляється завдання то вигаляються його використані часи

        /// Встановлення зв'язку між Днем Тижня(для повторення) та Завданням.
        modelBuilder.Entity<WeekDay>() 
            .HasOne(day => day.Task) // Один день тижння має одне завдання
            .WithMany(task => task.DaysToRepeat) // Одине завдання має багато днів тижня
            .HasForeignKey(day => day.TaskId) // Зовнішній ключ
            .OnDelete(DeleteBehavior.Cascade); // Якщо видаляється завадння - видаляються дні.

        List<User> users = new List<User>()
        {
            new User { Id = 1,
                Name = "Артем",
                Surname = "Бабенко",
                Login = "artem123",
                Password = "12345678",
                TodayBackground = "89495645.jpg",
                PlanedBackground = "53454.jpg",
                ImportantBackground = "783283475.jpg",
                TasksBackground = "5464774.jpg"
            }
        };

        List<WastedTime> usedTimes = new List<WastedTime>()
        {
            new WastedTime{ Id = 1, CreateDate = DateTime.Now, Time = TimeSpan.FromMinutes(19), TaskId = 3},
            new WastedTime{ Id = 2, CreateDate = DateTime.Now, Time = TimeSpan.FromMinutes(53), TaskId = 3},
            new WastedTime{ Id = 3, CreateDate = DateTime.Now, Time = TimeSpan.FromMinutes(45), TaskId = 4}
        };

        List<ListOfTasks> listsOfTasks = new List<ListOfTasks>()
        {
            new ListOfTasks{Id = 2, Name = "Університет", UserId = 1}
        };

        List<WeekDay> days = new List<WeekDay>
        {
            new WeekDay { Id = 1, Index = 1, Name = "Monday", TaskId = 3 },
            new WeekDay { Id = 2, Index = 2, Name = "Tuesday", TaskId = 3 },
            new WeekDay { Id = 3, Index = 3, Name = "Wednesday", TaskId = 3 },
            new WeekDay { Id = 4, Index = 4, Name = "Thursday", TaskId = 3 },
            new WeekDay { Id = 5, Index = 5, Name = "Friday", TaskId = 3 },
            new WeekDay { Id = 6, Index = 6, Name = "Saturday", TaskId = 4 },
            new WeekDay { Id = 7, Index = 7, Name = "Sunday", TaskId = 4 }
        };

        List<UserTask> tasks = new List<UserTask>()
        {
            new UserTask { Id = 2, Name = "Намалювати картинку.", CreateDate = DateTime.Now, UserId = 1 },
            new UserTask { Id = 3, Name = "Зробити програму для сайту.", CreateDate = DateTime.Now, UserId = 1 },

            new UserTask { Id = 4, Name = "Написати семінар.", CreateDate = DateTime.Now, UserId = 1, ListOfTasksId = 2},
            new UserTask { Id = 5, Name = "Виконати контрольну.", CreateDate = DateTime.Now, UserId = 1, ListOfTasksId = 2}
        };

        modelBuilder.Entity<User>().HasData(users);
        modelBuilder.Entity<WastedTime>().HasData(usedTimes);
        modelBuilder.Entity<ListOfTasks>().HasData(listsOfTasks);
        modelBuilder.Entity<UserTask>().HasData(tasks);
        modelBuilder.Entity<WeekDay>().HasData(days);
    }
    // add-migration IntialMigration
    // update-database
}
