import { taskContainer} from "./tasksPage.js";
import { decRequests, incRequests } from "./index.js"
import { pageHeader, headerProperties, pageScrollSpace, taskAddPanel, navOpenButton, saveTasksToLocalStorage, getTasksFromLocalStorage } from "./funcForPages.js"

export async function planedPage() {
    const main = document.querySelector("main");
    // Встановлення фону.
    main.style.backgroundImage = `url("/photos/${Cookies.get('planedPhotoPath')}"` ?? "url('/photos/blue.jpg')";
    main.textContent = "";

    // Заголовок
    const { header, propertiesButton } = pageHeader("Заплановано");
    main.append(header);

    // Вікно властивостей
    const properties = headerProperties('planedPhotoPath', '/user/set-planed-background', propertiesButton);
    main.append(properties);

    // Площинна для відображення  завдань.
    const { uncompleted, // Не виконані завдання.
        completedButton, // Клавіша відкриття списку виконаних.
        completedSpan,   // Число виконаних завдань.
        completed,       // Виконані завдання.
        scrollSpace      // Площинна для відображення  завдань.
    } = pageScrollSpace();
    main.append(scrollSpace);

    // Поле для додавання завдань.
    const addNewTaskPanel = taskAddPanel("Додати нове плановане завдання", "planed");
    main.append(addNewTaskPanel);

    // Клавіша для вікриття бокової панелі.
    main.append(navOpenButton());

     // Завантаження завдань з локольного сховища браузера.
    const tasks = getTasksFromLocalStorage('tasksPlaned');
    const uncompletedTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    uncompletedTasks.forEach(task => uncompleted.append(taskContainer(task)));
    if (completedTasks.length >= 1) {
        completedButton.style.display = "flex";
        completedSpan.append(completedTasks.length);
        completedTasks.forEach(task => completed.append(taskContainer(task)));
    }

    // Завантаження завдань з сервера.
    incRequests();
    const response = await fetch("/tasks/planed", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const tasks = await response.json();
        // Перезапис завдань та сторінці та збережених у локальному сховищі.
        saveTasksToLocalStorage(tasks, 'tasksPlaned');
        uncompleted.textContent = "";
        completedButton.style.display = "none";
        completed.textContent = "";
        completedSpan.textContent = "";
        const uncompletedTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);
        uncompletedTasks.forEach(task => uncompleted.append(taskContainer(task)));
        if (completedTasks.length >= 1) {
            completedButton.style.display = "flex";
            completedSpan.append(completedTasks.length);
            completedTasks.forEach(task => completed.append(taskContainer(task)));
        }
        decRequests();
    }
}
