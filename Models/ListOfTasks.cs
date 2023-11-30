using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TasksWebApp.Models;

/// <summary>
/// Клас, що представляє власний список завдань користувача.
/// </summary>
public class ListOfTasks
{
    /// <summary>
    /// Ідентифікатор списку завдань.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Назва списку завдань
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Витрачений час на виконання завдань.
    /// </summary>
    public TimeSpan SpendedTime = new TimeSpan();

    /// <summary>
    /// Назва картинки для фону списку.
    /// </summary>
    public string? Background { get; set; }

    /// <summary>
    /// Список завдань.
    /// </summary>
    [JsonIgnore]
    public List<UserTask>? Tasks { get; set; }

    /// <summary>
    /// Користувач який створив цей список.
    /// </summary>
    [JsonIgnore]
    public User User { get; set; } = null!;

    /// <summary>
    /// Ідентифікатор користувача, який створив список завдань.
    /// </summary>
    [JsonIgnore]
    public int UserId { get; set; }

    /// <summary>
    /// Конструктор за замовчуванням.
    /// </summary>
    public ListOfTasks() 
    {
        string[] backgrounds = { "red.jpg", "green.jpg", "blue.jpg", "purple.jpg", "orange.jpg" };
        Random random = new Random();
        string randomBackground = backgrounds[random.Next(backgrounds.Length)];
        Background = randomBackground;
    }
}
