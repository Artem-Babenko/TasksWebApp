import { decRequests, incRequests } from "./index.js";
import { taskContainer } from "./tasksPage.js";
import { todayPage } from "./todayPage.js";
import { pageHeader, pageScrollSpace, taskAddPanel, navOpenButton, saveTasksToLocalStorage, getTasksFromLocalStorage } from "./funcForPages.js"

const importantSpan = document.querySelector('nav ul .important span');

/**
 * Асинхронний метод, який показує завдання які належаться списку завдань користувача.
 * @param {any} list Список завдань користувача.
 */
export async function userListOfTasks(list) {
    const main = document.querySelector("main");
    // Встановлення фону.
    main.style.backgroundImage = `url("/photos/${Cookies.get('list-' + list.id + 'PhotoPath')}"`;

    main.textContent = "";

    // Заголовок
    const listButton = document.getElementById('list-' + list.id);
    const { header,
        propertiesButton,
        nameSpan
    } = pageHeader(listButton.querySelector('p').innerText, false, true);
    main.append(header);

    // Вікно властивостей
    const properties = document.createElement("div");
    properties.classList.add('properties');

    const renameButton = document.createElement('p');
    renameButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>Перейменувати';
    renameButton.addEventListener("click", () => {
        nameSpan.focus();
        // Отримуємо об'єкт Selection
        var selection = window.getSelection();

        // Створюємо діапазон та встановлюємо його на кінець тексту
        var range = document.createRange();
        range.selectNodeContents(nameSpan);
        range.collapse(false); // true для встановлення на початок, false для встановлення на кінець
        selection.removeAllRanges();
        selection.addRange(range);

        properties.classList.remove('active');
        properties.style.maxHeight = "0px";
    });

    let shouldTriggerBlur = true;

    nameSpan.addEventListener("keydown", async (event) => {
        // Перевірка, чи клавіша Enter натискана
        if (event.key === "Enter") {
            event.preventDefault();
            nameSpan.blur();
            // Надсилаєм нову назву.
            incRequests();
            const response = await fetch("/lists-of-tasks/set-name/", {
                method: "PUT",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: list.id,
                    name: nameSpan.innerText.trim()
                })
            });

            if (response.ok) {
                const listButton = document.getElementById('list-' + list.id);
                listButton.querySelector('p').innerText = nameSpan.innerText.trim();
                decRequests();
            }
            // Зняття фокусу після натискання Enter
            shouldTriggerBlur = false;
            
        }
    });

    // Якщо назва втратила фокус
    nameSpan.addEventListener("blur", async () => {
        if (!shouldTriggerBlur) return;
        // Надсилаєм нову назву. 
        incRequests();
        const response = await fetch("/lists-of-tasks/set-name/", {
            method: "PUT",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                id: list.id,
                name: nameSpan.innerText.trim()
            })
        });

        if (response.ok) {
            const listButton = document.getElementById('list-' + list.id);
            listButton.querySelector('p').innerText = nameSpan.innerText.trim();
            decRequests();
        }
    });
    nameSpan.addEventListener('focus', () => {
        shouldTriggerBlur = true; // Повертаємо змінну в початковий стан при фокусуванні
    });
    properties.append(renameButton);

    const editBackButtun = document.createElement('p');
    editBackButtun.innerHTML = "<i class='fa-regular fa-image'></i>Замінити фон";
    const backgroundPanel = document.createElement('div');
    backgroundPanel.classList.add('background-panel');
    const chooseText = document.createElement('h3');
    chooseText.append("Фон для списку завдань");
    backgroundPanel.append(chooseText);
    setTimeout(async () => {

        const paths = getPathFromLocalStorage();

        paths.forEach(path => {
            const image = document.createElement('img');
            image.src = `/compresedPhotos/${path}`;
            if (path === Cookies.get('list-' + list.id + 'PhotoPath')) {
                image.classList.add('active');
            }
            image.addEventListener('click', async () => {
                document.querySelector('.background-panel img.active')
                    .classList
                    .remove('active');
                image.classList.add('active');
                main.style.backgroundImage = `url('/photos/${path}')`;
                incRequests();
                const response = await fetch(`/lists-of-tasks/set-background/${list.id}`, {
                    method: "PUT",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify(path.toString())
                });
                if (response.ok) {
                    Cookies.set('list-' + list.id + 'PhotoPath', path);
                    decRequests();
                }
            });
            backgroundPanel.append(image);
        });
    }, 100);
    main.append(backgroundPanel);
    editBackButtun.addEventListener('click', () => {
        if (editBackButtun.classList.contains('active')) {
            editBackButtun.classList.remove('active');
            backgroundPanel.style.maxHeight = "0";
            backgroundPanel.style.opacity = "0";
            setTimeout(() => {
                backgroundPanel.style.top = -100 + "px";
                backgroundPanel.style.left = -100 + "px";
            }, 500);
        }
        else {
            const buttonRect = properties.getBoundingClientRect();
            editBackButtun.classList.add('active');
            backgroundPanel.style.maxHeight = backgroundPanel.scrollHeight + "px";
            backgroundPanel.style.opacity = "1";
            backgroundPanel.style.top = buttonRect.bottom + 5 + "px";
            backgroundPanel.style.left = buttonRect.left - 167 + "px";
        }
    })
    properties.append(editBackButtun);

    const deleteButton = document.createElement('p');
    const trashCanIcon = document.createElement('i');
    trashCanIcon.classList.add("fa-regular", "fa-trash-can");
    deleteButton.append(trashCanIcon);
    deleteButton.append("Видалити список");
    properties.append(deleteButton);

    const deleteMessage = document.createElement('p');
    deleteMessage.classList.add('delete-message');
    deleteMessage.append("Впевнені?");
    const buttonYes = document.createElement('button');
    buttonYes.append("Так");
    deleteButton.addEventListener('click', () => {
        if (!deleteMessage.classList.contains('active')) {
            deleteMessage.classList.add('active');
            trashCanIcon.style.color = "red";
            properties.style.maxHeight = properties.scrollHeight + 38 + "px";
            setTimeout(() => {
                trashCanIcon.style.color = "var(--container-text)";
                deleteMessage.classList.remove('active');
                properties.style.maxHeight = properties.scrollHeight + "px";
            }, 5000);
        }
    });
    buttonYes.addEventListener('click', async () => {
        document.getElementById('list-' + list.id).remove();
        todayPage();
        incRequests();
        const response = await fetch(`/lists-of-tasks/${list.id}`, {
            method: "DELETE",
            headers: { "Accept": "application/json"}
        });
        if (response.ok) {
            const tasks = await response.json();
            tasks.forEach(task => {
                if (task.important && !task.completed) {
                    importantSpan.innerText = (importantSpan.innerText <= 1) ? "" : --importantSpan.innerText;
                }
            });
            decRequests();
            Cookies.remove('list-' + list.id + 'PhotoPath');
        }
    });
    deleteMessage.append(buttonYes);
    properties.append(deleteMessage);

    propertiesButton.addEventListener('click', () => {
        if (properties.classList.contains('active')) {
            properties.classList.remove('active');
            properties.style.maxHeight = "0px";
            editBackButtun.classList.remove('active');
            backgroundPanel.style.maxHeight = "0";
            backgroundPanel.style.opacity = "0";
            setTimeout(() => {
                backgroundPanel.style.top = -100 + "px";
                backgroundPanel.style.left = -100 + "px";
            }, 500);
        } else {
            properties.classList.add('active');
            properties.style.maxHeight = properties.scrollHeight + "px";
        }
    });
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
    const addNewTaskPanel = taskAddPanel("Додати нове завдання у список", null, list.id);
    main.append(addNewTaskPanel);

    // Клавіша для вікриття бокової панелі.
    main.append(navOpenButton());

    // Завантаження завдань з локольного сховища браузера.
    const tasks = getTasksFromLocalStorage(list.id);
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
    const response = await fetch(`/lists-of-tasks/${list.id}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const tasks = await response.json();
        // Перезапис завдань та сторінці та збережених у локальному сховищі.
        saveTasksToLocalStorage(tasks, list.id);
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

function getPathFromLocalStorage() {
    const path = localStorage.getItem('photoPaths');
    return path ? JSON.parse(path) : [];
}
