import { taskContainer } from "./tasksPage.js";
import { decRequests, incRequests } from "./index.js"

const main = document.querySelector("main");

/**
 * Метод, який створює та повертає два елементи: голова списку завдань та клавіша властивостей додана до голови.
 * @param {string} pageName
 * @param {boolean} showNowDate
 * @returns Елемент Header та елемент кнопка властивостей сторінки.
 */
export function pageHeader(pageName, showNowDate = false, isList = false) {
    const header = document.createElement("h2");

    const nameSpan = document.createElement('span');
    nameSpan.append(pageName);
    header.append(nameSpan);

    if (showNowDate) {
        const date = document.createElement('div');
        date.classList.add('now-date');
        date.append(formatedNowDate());
        header.append(date);
    }
    else if (isList) {
        nameSpan.contentEditable = true;
        nameSpan.addEventListener('input', () => {
            const text = nameSpan.innerText;
            if (text.length > 20) {
                // Обрізати текст, якщо введено більше символів
                nameSpan.innerText = text.substring(0, 20);
                // Отримуємо об'єкт Selection
                var selection = window.getSelection();

                // Створюємо діапазон та встановлюємо його на кінець тексту
                var range = document.createRange();
                range.selectNodeContents(nameSpan);
                range.collapse(false); // true для встановлення на початок, false для встановлення на кінець
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    }
    
    const propertiesButton = document.createElement('i');
    propertiesButton.classList.add("fa-solid", "fa-ellipsis");
    header.append(propertiesButton);

    if (isList) {
        return { header, propertiesButton, nameSpan };
    } else {
        return { header, propertiesButton };
    }
}


/** Метод, який повертає Вікно властивостей.*/
export function headerProperties(pathCookieName, pageName, propertiesButton) {
    const properties = document.createElement("div");
    properties.classList.add('properties');

    // Клавіша замінити фон.
    const editBackButtun = document.createElement('p');
    editBackButtun.innerHTML = "<i class='fa-regular fa-image'></i>Замінити фон";

    // Панель вибору фону.
    const backgroundPanel = document.createElement('div');
    backgroundPanel.classList.add('background-panel');
    const chooseText = document.createElement('h3');
    chooseText.append("Фон для списку завдань");
    backgroundPanel.append(chooseText);

    setTimeout(async () => {
        // Шляхи до зображень.
        let paths = getPathFromLocalStorage();

        if (paths.length === 0) {
            incRequests();
            const response = await fetch('/api/backgrounds', {
                method: "GET",
                headers: { "Accept": "application/json" }
            });

            if (response.ok) {
                paths = await response.json();
                savePathToLocalStorage(paths);
                decRequests();
            }
        }

        // Для кожного шляху створюєм фото. 
        paths.forEach(path => {
            const image = document.createElement('img');
            image.src = `/compresedPhotos/${path}`;
            if (path === Cookies.get(pathCookieName)) {
                image.classList.add('active');
            }
            // Якщо написнути на фото та заміниться фон.
            image.addEventListener('click', async () => {
                document.querySelector('.background-panel img.active')
                    .classList
                    .remove('active');
                image.classList.add('active');
                // Встановлюєм новий фон.
                main.style.backgroundImage = `url('/photos/${path}')`;
                // Встановлюєм шлях до фото користувачу на сервері.
                incRequests();

                let jsonObj;
                if (pageName == "today") {
                    jsonObj = JSON.stringify({ today: path })
                }
                else if (pageName == "planed") {
                    jsonObj = JSON.stringify({ planed: path })
                }
                else if (pageName == "important") {
                    jsonObj = JSON.stringify({ important: path })
                }
                else if (pageName == "tasks") {
                    jsonObj = JSON.stringify({ tasks: path })
                }

                const response = await fetch('/user/backgrounds', {
                    method: "PUT",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: jsonObj
                });
                if (response.ok) {
                    Cookies.set(pathCookieName, path);
                    decRequests();
                }
            });
            backgroundPanel.append(image);
        });
    }, 100);
    main.append(backgroundPanel);

    // Натиснувши на редагування фону, відкиється панель з виборором фану.
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
    });
    properties.append(editBackButtun);

    // Відкриття та закриття вікна властивостей списка завдань.
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

    return properties;
}


/** Повертає пложину для відображення завдань і т.д.*/
export function pageScrollSpace() {
    const scrollSpace = document.createElement("div");
    scrollSpace.classList.add('scroll-space');

    // Площина для додавання не виконаних завданнь.
    const uncompleted = document.createElement('div');
    uncompleted.classList.add("uncompleted");
    scrollSpace.append(uncompleted);

    // Клавіша для відкривання та закривання пложини виконаних завдань.
    const completedButton = document.createElement("div");
    completedButton.classList.add("completed-button");
    const p = document.createElement("p");
    const completedAngleIcon = document.createElement("i");
    completedAngleIcon.classList.add("fa-solid", "fa-chevron-right");
    p.append(completedAngleIcon);
    p.append("Завершені");
    // Кількість виконаних завдань у списку.
    const completedSpan = document.createElement("span");
    p.append(completedSpan);
    completedButton.append(p);
    completedButton.style.display = "none";
    // При натисненні відкриває та закриває площину виконаних завдань.
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
    scrollSpace.append(completedButton);

    // Площина для додавання виконаних завданнь.
    const completed = document.createElement('div');
    completed.classList.add("completed");
    scrollSpace.append(completed);

    return {
        uncompleted,
        completedButton,
        completedSpan,
        completed,
        scrollSpace
    };
}


/** Повертає панель для додання завдань. */
export function taskAddPanel(placeholder, pageName, listId = null) {
    const addNewTaskPanel = document.createElement('div');
    addNewTaskPanel.classList.add('add-new-task-panel');

    // "Плюсик"
    const addButton = document.createElement('i');
    addButton.classList.add('fa-solid', 'fa-plus');
    addNewTaskPanel.append(addButton);

    const addInput = document.createElement('input');
    addInput.setAttribute('placeholder', placeholder);
    addInput.setAttribute('name', 'add-new-task');
    addInput.autocomplete = "off";

    // Натиснувши Enter завдання буде додане.
    addInput.addEventListener('keydown', function (event) {
        // Перевірка, чи натиснута клавіша Enter
        if (event.key === "Enter") {
            const taskText = addInput.value.trim();
            // Перевірка, чи введено не пустий текст
            if (taskText !== '') {

                if (pageName === "today") {
                    createTask(taskText, true);
                }
                else if (pageName === "planed") {
                    console.log('add planed task don\'t work :(');
                }
                else if (pageName === "important") {
                    createTask(taskText, false, true);
                }
                else if (pageName === "tasks") {
                    createTask(taskText);
                }
                else if (listId) {
                    createTask(taskText, false, false, listId);
                }
                    
                addInput.value = '';
            }
        }
    });

    // Натиснувши "Плюсик" завдання буде додане.
    addButton.addEventListener('click', function () {
        const taskText = addInput.value.trim();
        // Перевірка, чи введено не пустий текст.
        if (taskText !== '') {
            createTodayTask(taskText);
            addInput.value = '';
        }
    });
    addNewTaskPanel.append(addInput);

    return addNewTaskPanel;
}


/** Зберігає у шляхи фото у локальне сховище браузера. */
function savePathToLocalStorage(paths) {
    localStorage.setItem('photoPaths', JSON.stringify(paths));
}

/** Повертає шляхи фото з локального сховища браузера. */
function getPathFromLocalStorage() {
    const path = localStorage.getItem('photoPaths');
    return path ? JSON.parse(path) : [];
}

/** Записати завдання в localStorage */
export function saveTasksToLocalStorage(tasks, storageItemName) {
    localStorage.setItem(storageItemName, JSON.stringify(tasks));
}

/** Зчитати завдання з localStorage*/
export function getTasksFromLocalStorage(storageItemName) {
    const storedTasks = localStorage.getItem(storageItemName);
    return storedTasks ? JSON.parse(storedTasks) : [];
}


/**
 * Метод, який повертає сьогоднішню дату у форматі "Понеділок, 1 січня".
 * @returns
 */
function formatedNowDate() {
    const daysOfWeek = [
        'Неділя',
        'Понеділок',
        'Вівторок',
        'Середа',
        'Четвер',
        'П\'ятниця',
        'Субота'
    ];

    const months = [
        'Січня',
        'Лютого',
        'Березня',
        'Квітня',
        'Травня',
        'Червня',
        'Липня',
        'Серпня',
        'Вересня',
        'Жовтня',
        'Листопада',
        'Грудня'
    ];

    const currentDate = new Date();
    const dayOfWeekIndex = currentDate.getDay();
    const dayOfWeek = daysOfWeek[dayOfWeekIndex];
    const day = currentDate.getDate();
    const monthIndex = currentDate.getMonth();
    const month = months[monthIndex];

    const formattedDate = `${dayOfWeek}, ${day} ${month}`;

    return formattedDate;
}

 
/** Повертає клавішу відкриття та закриття навігації. */
export function navOpenButton() {
    const button = document.createElement('i');
    button.classList.add("fa-solid", "fa-bars", "open-button");

    button.addEventListener("click", () => {
        const navPanel = document.querySelector('nav');
        if (navPanel.classList.contains('open')) {
            navPanel.classList.remove('open');
        }
        else {
            navPanel.classList.add('open');
        }
    });
    return button;
}


/**
 * Створює завдання.
 * @param {string} text Назва завдання.
 * @param {boolean} isToday Чи завдання виконуватиметься сьогодні.
 * @param {boolean} isImportant Чи завдання важливе.
 */
async function createTask(text, isToday = false, isImportant = false, listId = null) {
    incRequests();

    // Cпочатку створюється об'єкт завдання.
    const taskObject = {
        id: null,
        name: text,
        description: null,
        completed: false,
        important: isImportant,
        today: isToday,
        createDate: null,
        finishDate: null,
        daysToRepeat: null,
        wastedTimes: null,
        listOfTasks: null,
        listOfTasksId: null
    };

    const uncompleted = document.querySelector('main .scroll-space .uncompleted');
    const activeNavButtonSpan = document.querySelector("nav ul li.active span");
    activeNavButtonSpan.innerText = ++activeNavButtonSpan.innerText;

    // Цей об'єкт додається на сторінку.
    const newTask = taskContainer(taskObject);
    uncompleted.append(newTask);

    const response = await fetch('/tasks', {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            name: text,
            today: isToday,
            important: isImportant,
            listOfTasksId: listId
        })
    });

    if (response.ok) {
        decRequests();
        const task = await response.json();
        // Завдання на сторінці перезаписується.
        newTask.remove();
        uncompleted.append(taskContainer(task));
    }
}