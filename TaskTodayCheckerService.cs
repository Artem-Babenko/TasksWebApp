using TasksWebApp.Models;

namespace TasksWebApp;

public class TaskTodayCheckerService
{
    private Timer? timer;

    public TaskTodayCheckerService() { }

    public void Start()
    {
        /*// Calculate time until the first run (immediate) and set the period to 10 seconds
        TimeSpan timeUntilFirstRun = TimeSpan.Zero;
        TimeSpan period = TimeSpan.FromSeconds(10);

        // Set up the timer to run the method every 10 seconds
        timer = new Timer(new TimerCallback(state => DoDailyTask(state!)), null, timeUntilFirstRun, period);*/

        // Calculate the time until the next midnight
        DateTime now = DateTime.Now;
        DateTime nextMidnight = now.Date.AddDays(1); // Next day at 00:00:00
        TimeSpan timeUntilMidnight = nextMidnight - now;

        // Set up the timer to run the method every day at midnight
        timer = new Timer(new TimerCallback(state => DoDailyTask(state!)), null, timeUntilMidnight, TimeSpan.FromDays(1));
    }

    private void DoDailyTask(object state)
    {
        try
        {
            // Ваш код, який виконується о 00:00:00, розмістіть тут
            ApplicationContext db = new ApplicationContext();
            // Виконайте ваші дії...
            List<UserTask> tasks = db.Tasks.ToList();

            int countTaskToday = 0;
            foreach(var task in tasks)
            {
                if (task.FinishDate?.Date == DateTime.Now.Date)
                {
                    task.Today = true;
                    countTaskToday++;
                }
                else
                {
                    task.Today = false;
                }
            }

            db.SaveChanges();
            Console.WriteLine($"Сьогодні буде відображено {countTaskToday} з {tasks.Count}");
        }
        catch (Exception ex)
        {
            // Обробляти винятки
            Console.WriteLine($"Виникла помилка: {ex.Message}");
        }
    }
}