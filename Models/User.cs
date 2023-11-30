using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TasksWebApp.Models;

/// <summary>
/// Клас, що представляє користувача.
/// </summary>
public class User
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Ім'я користувача.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Прізвиже користувача.
    /// </summary>
    public string Surname { get; set; } = null!;

    /// <summary>
    /// Логін користувача.
    /// </summary>
    public string Login { get; set; } = null!;

    /// <summary>
    /// Пароль користувача.
    /// </summary>
    public string Password { get; set; } = null!;

    /// <summary>
    /// Назва фото для фону. Pозділу "Пароль".
    /// </summary>
    public string TodayBackground { get; set; } = null!;

    /// <summary>
    /// Назва фото для фону. Pозділу "Заплановано".
    /// </summary>
    public string PlanedBackground { get; set; } = null!;

    /// <summary>
    /// Назва фото для фону. Pозділу "Важливо".
    /// </summary>
    public string ImportantBackground { get; set; } = null!;

    /// <summary>
    /// Назва фото для фону. Pозділу "Завдання".
    /// </summary>
    public string TasksBackground { get; set; } = null!;

    /// <summary>
    /// Список завдань, які створив користувач.
    /// </summary>
    public List<UserTask>? Tasks { get; set; }

    /// <summary>
    /// Cписок списків завдань користувача.
    /// </summary>
    public List<ListOfTasks>? ListsOfTasks { get; set; }

    public User() 
    {
        TodayBackground = SetRandomBackgrounds();
        PlanedBackground = SetRandomBackgrounds();
        ImportantBackground = SetRandomBackgrounds();
        TasksBackground = SetRandomBackgrounds();
    }

    public User(string name, string surname, string login, string password)
    {
        Name = name;
        Surname = surname;
        Login = login;
        Password = password;
        TodayBackground = SetRandomBackgrounds();
        PlanedBackground = SetRandomBackgrounds();
        ImportantBackground = SetRandomBackgrounds();
        TasksBackground = SetRandomBackgrounds();
    }

    string SetRandomBackgrounds()
    {
        string[] backgrounds = { "red.jpg", "green.jpg", "blue.jpg", "purple.jpg", "orange.jpg" };
        Random random = new Random();
        string randomBackground = backgrounds[random.Next(backgrounds.Length)];
        return randomBackground;
    }
}
