using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TasksWebApp.Models;

/// <summary>
/// Клас, що представляє день тижня.
/// </summary>
public class WeekDay
{
    /// <summary>
    /// Ідентифікатор дня тижня.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Індекс для тижня. Від 1 до 7.
    /// </summary>
    public int Index { get; set; }

    /// <summary>
    /// Назва дня тижня. Від Понеділка до Неділі.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Завдання, якому належиться цей день тижня.
    /// </summary>
    [JsonIgnore]
    public UserTask Task { get; set; } = null!;

    /// <summary>
    /// Ідентифікатор завдання, якому належить цей день тижня.
    /// </summary>
    [JsonIgnore]
    public int TaskId { get; set; }
}
