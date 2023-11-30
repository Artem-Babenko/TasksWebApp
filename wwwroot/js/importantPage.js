import { taskContainer, navOpenButton } from "./tasksPage.js";
import { decRequests, incRequests } from "./index.js"

const main = document.querySelector("main");

/** Метод для відображення сторінки важливих завдань. */
export async function importantPage() {
    main.style.backgroundImage = `url("/photos/${Cookies.get('importantPhotoPath')}"` ?? "url('/photos/red.jpg')";

    main.textContent = "";

    // Заголовок
    const header = document.createElement("h2");
    const nameSpan = document.createElement('span');
    nameSpan.append("Важливо");
    header.append(nameSpan);
    const propertiesButton = document.createElement('i');
    propertiesButton.classList.add("fa-solid", "fa-ellipsis");
    header.append(propertiesButton);
    main.append(header);

    // Вікно властивостей
    const properties = document.createElement("div");
    properties.classList.add('properties');

    const editBackButtun = document.createElement('p');
    editBackButtun.innerHTML = "<i class='fa-regular fa-image'></i>Замінити фон";
    const backgroundPanel = document.createElement('div');
    backgroundPanel.classList.add('background-panel');
    const chooseText = document.createElement('h3');
    chooseText.append("Фон для списку завдань");
    backgroundPanel.append(chooseText);
    setTimeout(async () => {

        let paths = getPathFromLocalStorage();

        paths.forEach(path => {
            const image = document.createElement('img');
            image.src = `/compresedPhotos/${path}`;
            if (path === Cookies.get('importantPhotoPath')) {
                image.classList.add('active');
            }
            image.addEventListener('click', async () => {
                document.querySelector('.background-panel img.active')
                    .classList
                    .remove('active');
                image.classList.add('active');
                main.style.backgroundImage = `url('/photos/${path}')`;
                incRequests();
                const response = await fetch('/user/set-important-background', {
                    method: "PUT",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify(path.toString())
                });
                if (response.ok) {
                    Cookies.set('importantPhotoPath', path);
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
            backgroundPanel.style.left = buttonRect.left - 190 + "px";
        }
    })
    properties.append(editBackButtun);

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

    // Площинна для відображення  завдань
    const scrollSpace = document.createElement("div");
    scrollSpace.classList.add('scroll-space');
    const uncompleted = document.createElement('div');
    uncompleted.classList.add("uncompleted");
    scrollSpace.append(uncompleted);

    const completedButton = document.createElement("div");
    completedButton.classList.add("completed-button");
    const p = document.createElement("p");
    const completedAngleIcon = document.createElement("i");
    completedAngleIcon.classList.add("fa-solid", "fa-chevron-right");
    p.append(completedAngleIcon);
    p.append("Завершені");
    const completedSpan = document.createElement("span");
    p.append(completedSpan);
    completedButton.append(p);
    completedButton.style.display = "none";
    scrollSpace.append(completedButton);

    const completed = document.createElement('div');
    completed.classList.add("completed");
    scrollSpace.append(completed);
    main.append(scrollSpace);

    // Поле для додавання завдань.
    const addNewTaskPanel = document.createElement('div');
    addNewTaskPanel.classList.add('add-new-task-panel');
    const addButton = document.createElement('i');
    addButton.classList.add('fa-solid', 'fa-plus');

    addNewTaskPanel.append(addButton);
    const addInput = document.createElement('input');
    addInput.setAttribute('placeholder', 'Додати нове важливе завдання');
    addInput.setAttribute('name', 'add-input');
    addInput.addEventListener('keydown', function (event) {
        // Перевірка, чи натиснута клавіша Enter
        if (event.key === "Enter") {
            const taskText = addInput.value.trim();
            // Перевірка, чи введено не пустий текст
            if (taskText !== '') {
                createImportantTask(taskText);
                // Очищення input після додавання завдання
                addInput.value = '';
            }
        }
    });
    addButton.addEventListener('click', function () {
        const taskText = addInput.value.trim();
        // Перевірка, чи введено не пустий текст
        if (taskText !== '') {
            createImportantTask(taskText);
            // Очищення input після додавання завдання
            addInput.value = '';
        }
    });
    addNewTaskPanel.append(addInput);
    main.append(addNewTaskPanel);

    main.append(navOpenButton());

    completedButton.addEventListener('click', () => {
        if (completedButton.classList.contains('active')) {
            completedButton.classList.remove('active');
            completedAngleIcon.style.transform = "rotate(0deg)";
            completed.style.maxHeight = "0px";
        } else {
            completedButton.classList.add('active');
            completedAngleIcon.style.transform = "rotate(90deg)";
            completed.style.maxHeight = completed.scrollHeight + "px";
        }
    });

    const tasks = getTasksFromLocalStorage();
    const uncompletedTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    uncompletedTasks.forEach(task => uncompleted.append(taskContainer(task)));
    if (completedTasks.length >= 1) {
        completedButton.style.display = "flex";
        completedSpan.append(completedTasks.length);
        completedTasks.forEach(task => completed.append(taskContainer(task)));
    }

    incRequests();
    const response = await fetch("/tasks/important", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const tasks = await response.json();
        saveTasksToLocalStorage(tasks);
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

// Записати завдання в localStorage
function saveTasksToLocalStorage(tasks) {
    localStorage.setItem('tasksImportant', JSON.stringify(tasks));
}

// Зчитати завдання з localStorage
function getTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasksImportant');
    return storedTasks ? JSON.parse(storedTasks) : [];
}

async function createImportantTask(text) {
    incRequests();

    const taskObject = {
        id: null,
        name: text,
        description: null,
        completed: false,
        important: true,
        today: false,
        createDate: null,
        finishDate: null,
        daysToRepeat: null,
        wastedTimes: null,
        listOfTasks: null,
        listOfTasksId: null
    };

    const uncompleted = document.querySelector('main .scroll-space .uncompleted');
    const activeNavButtonSpan = document.querySelector("nav ul li.active span");
    const tasksNavButtonSpan = document.querySelector('nav ul .tasks span');
    tasksNavButtonSpan.innerText = ++tasksNavButtonSpan.innerText;
    activeNavButtonSpan.innerText = ++activeNavButtonSpan.innerText;

    const newTask = taskContainer(taskObject);
    uncompleted.append(newTask);

    try {
        const response = await fetch('/tasks/new-important', {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                name: text,
                important: true
            })
        });

        if (response.ok) {
            decRequests();
            const task = await response.json();
            newTask.remove();
            uncompleted.append(taskContainer(task));
        }
    }
    catch (error) {
        console.error('Error:', error);
        newTask.remove();
    }
}

function getPathFromLocalStorage() {
    const path = localStorage.getItem('photoPaths');
    return path ? JSON.parse(path) : [];
}
