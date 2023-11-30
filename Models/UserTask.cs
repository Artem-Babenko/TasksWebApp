using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TasksWebApp.Models;

/// <summary>
/// Класс, що преставляє завдання.
/// </summary>
public class UserTask
{
    /// <summary>
    /// Ідентифікатор завдання.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Назва завдання. Ціль. Мета.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Короткий опис завдання.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Якщо True, то завдання виконане.
    /// </summary>
    public bool Completed { get; set; }

    /// <summary>
    /// Якщо True, то завдання важливе.
    /// </summary>
    public bool Important { get; set; }

    /// <summary>
    /// Якщо True, то завдання має бути виконане сьогодні.
    /// </summary>
    public bool Today { get; set; } = false;

    /// <summary>
    /// Дата створення завдання.
    /// </summary>
    public DateTime CreateDate { get; set; }

    /// <summary>
    /// Термін виконання завдання. Кінцева дата.
    /// </summary>
    public DateTime? FinishDate { get; set; }

    /// <summary>
    /// Список днів тижня у які це завдання повторюватиметься.
    /// </summary>
    public List<WeekDay>? DaysToRepeat { get; set; }

    /// <summary>
    /// Список витраченого часу на виконання завдання.
    /// </summary>
    public List<WastedTime>? WastedTimes { get; set; }

    /// <summary>
    /// Ідентифікотор користувача, якому належиться це завдання.
    /// </summary>
    [JsonIgnore]
    public int UserId { get; set; }

    /// <summary>
    /// Користувач, якому належиться це завдання.
    /// </summary>
    [JsonIgnore]
    public User User { get; set; } = null!;

    /// <summary>
    /// Список завдань якому належить завдання.
    /// </summary>
    public ListOfTasks? ListOfTasks { get; set; }

    /// <summary>
    /// Ідентифікатор списка завдань.
    /// </summary>
    //[JsonIgnore]
    public int? ListOfTasksId { get; set; }

    public UserTask() { }

    public UserTask(string name, DateTime createDate, bool complited = false, bool important = false)
    {
        Name = name;
        Completed = complited;
        Important = important;
        CreateDate = createDate;
    }
}