using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TasksWebApp.Models;

/// <summary>
/// Клас, який представляє витрачений час на виконання завдання.
/// </summary>
public class WastedTime
{
    /// <summary>
    /// Ідентифікатор завдання.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Дата створення витраченого часу на виконання завдання.
    /// </summary>
    public DateTime CreateDate { get; set; }

    /// <summary>
    /// Час витрачений на виконання завдання.
    /// </summary>
    public TimeSpan Time { get; set; }

    /// <summary>
    /// Завдання, якому додається цей час.
    /// </summary>
    [JsonIgnore]
    public UserTask Task { get; set; } = null!;

    /// <summary>
    /// Ідентифікатор завдання, якому додається цей час.
    /// </summary>
    [JsonIgnore]
    public int TaskId { get; set; }
}
