import { taskContainer } from "./tasksPage.js";
import { decRequests, incRequests } from "./index.js"
import { pageHeader, headerProperties, pageScrollSpace, taskAddPanel, navOpenButton, saveTasksToLocalStorage, getTasksFromLocalStorage } from "./funcForPages.js"


/** Метод для відображення сторінки важливих завдань. */
export async function importantPage() {
    const main = document.querySelector("main");
    // Встановлення фону.
    main.style.backgroundImage = `url("/photos/${Cookies.get('importantPhotoPath')}"` ?? "url('/photos/red.jpg')";

    main.textContent = "";

    // Заголовок.
    const { header, propertiesButton } = pageHeader("Важливо");
    main.append(header);

    // Вікно властивостей.
    const properties = headerProperties('importantPhotoPath', 'important', propertiesButton);
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
    const addNewTaskPanel = taskAddPanel("Додати нове важливе завдання", "important");
    main.append(addNewTaskPanel);

    // Клавіша для вікриття бокової панелі.
    main.append(navOpenButton());

    // Завантаження завдань з локольного сховища браузера.
    const tasks = getTasksFromLocalStorage('tasksImportant');
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
    const response = await fetch("/tasks/important", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const tasks = await response.json();
        // Перезапис завдань та сторінці та збережених у локальному сховищі.
        saveTasksToLocalStorage(tasks, 'tasksImportant');
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
