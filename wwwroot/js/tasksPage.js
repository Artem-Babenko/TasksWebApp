import { decRequests, incRequests } from "./index.js"
import { pageHeader, headerProperties, pageScrollSpace, taskAddPanel, navOpenButton, saveTasksToLocalStorage, getTasksFromLocalStorage } from "./funcForPages.js"

const main = document.querySelector("main");
const importantButton = document.querySelector('nav ul .important');

/** Метод відображення сторінки завдань. */
export async function tasksPage() {
    // Встановлення фону.
    main.style.backgroundImage = `url("/photos/${Cookies.get('tasksPhotoPath')}"` ?? "url('/photos/green.jpg')";

    main.textContent = "";

    // Заголовок
    const { header, propertiesButton } = pageHeader("Завдання");
    main.append(header); 

    // Вікно властивостей
    const properties = headerProperties('tasksPhotoPath', '/user/set-tasks-background', propertiesButton);
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
    const addNewTaskPanel = taskAddPanel("Додати нове завдання", "tasks");
    main.append(addNewTaskPanel);

    // Клавіша для вікриття бокової панелі.
    main.append(navOpenButton());

    // Завантаження завдань з локольного сховища браузера.
    const tasks = getTasksFromLocalStorage('tasks');
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
    const response = await fetch("/tasks", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const tasks = await response.json();
        // Перезапис завдань та сторінці та збережених у локальному сховищі.
        saveTasksToLocalStorage(tasks, 'tasks');
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

/**
 * Метод створення елементу, який представляє завдання та інформацію про нього. Використовується для відображення на сторінці "Завдання" та сторінці "Важливо".
 * @param {any} task
 * @returns Елемент HTML, який представляє завдання.
 */
export function taskContainer(task) {
    const container = document.createElement('div');
    container.classList.add("container");
    container.setAttribute('task-id', task.id);

    // Short Panel
    const shortPanel = document.createElement('div');
    shortPanel.classList.add("short-panel");

    const checkmark = document.createElement('i');
    checkmark.classList.add("fa-regular", "fa-square");
    checkmark.setAttribute("id", "checkmark");
    if (task.completed) {
        checkmark.classList.remove('fa-regular', 'fa-square');
        checkmark.classList.add('fa-regular', 'fa-square-check');
        checkmark.classList.add('active');
    }
    checkmark.addEventListener('mouseenter', () => {
        if (!checkmark.classList.contains("active")) {
            checkmark.classList.remove('fa-regular', 'fa-square');
            checkmark.classList.add('fa-regular', 'fa-square-check');
        }
    });
    checkmark.addEventListener('mouseleave', () => {
        if (!checkmark.classList.contains("active")) {
            checkmark.classList.remove('fa-regular', 'fa-square-check');
            checkmark.classList.add('fa-regular', 'fa-square');
        }
    });
    const importantSpan = importantButton.querySelector("span");
    const completedSpace = document.querySelector('main .scroll-space .completed');
    const uncompletedSpace = document.querySelector('main .scroll-space .uncompleted');
    const completedButton = document.querySelector('main .scroll-space .completed-button');
    const completedSpan = completedButton.querySelector("span");
    const activeNavButtonSpan = document.querySelector("nav ul li.active span");
    const tasksSpan = document.querySelector("nav ul li.tasks span");
    const todaySpan = document.querySelector('nav ul .today span');
    const planedSpan = document.querySelector('nav ul .planed span');

    checkmark.addEventListener("click", () => {
        if (checkmark.classList.contains('active')) {
            checkmark.classList.remove('active');
            checkmark.classList.remove('fa-regular', 'fa-square-check');
            checkmark.classList.add('fa-regular', 'fa-square');
            setTaskCompleted(task.id, false);
            task.completed = false;

            uncompletedSpace.append(taskContainer(task));
            container.remove();

            if (!completedSpace.hasChildNodes()) 
                completedButton.style.display = "none";

            completedSpan.innerText = (completedSpan.innerText <= 1) ? "" : --completedSpan.innerText;

            if (task.important && !activeNavButtonSpan.parentElement.classList.contains("important")) {
                importantSpan.innerText = ++importantSpan.innerText;
            }

            if (task.today && !activeNavButtonSpan.parentElement.classList.contains("today")) {
                todaySpan.innerText = ++todaySpan.innerText;
            }

            if (task.finishDate && !activeNavButtonSpan.parentElement.classList.contains("planed")) {
                planedSpan.innerText = ++planedSpan.innerText;
            }

            if (task.listOfTasks && task.listOfTasks.id && (activeNavButtonSpan.parentElement.classList.contains("important") || activeNavButtonSpan.parentElement.classList.contains("today") || activeNavButtonSpan.parentElement.classList.contains("planed"))) {
                const listButton = document.getElementById('list-' + task.listOfTasks.id);
                const listButtonSpan = listButton.querySelector('span');
                listButtonSpan.innerText = ++listButtonSpan.innerText;
            } else if (activeNavButtonSpan.parentElement.classList.contains("important") || activeNavButtonSpan.parentElement.classList.contains("today") || activeNavButtonSpan.parentElement.classList.contains("planed")) {
                tasksSpan.innerText = ++tasksSpan.innerText;
            } 

            activeNavButtonSpan.innerText = ++activeNavButtonSpan.innerText;

        } else {
            checkmark.classList.add('active');
            setTaskCompleted(task.id, true);
            task.completed = true;
            checkmark.classList.remove('fa-regular', 'fa-square');
            checkmark.classList.add('fa-regular', 'fa-square-check');

            completedButton.style.display = "flex";
            completedSpace.append(taskContainer(task));

            container.remove();

            completedSpan.innerText = ++completedSpan.innerText;
            if (task.important && !activeNavButtonSpan.parentElement.classList.contains("important")) {
                importantSpan.innerText = (importantSpan.innerText <= 1) ? "" : --importantSpan.innerText;
            }

            if (task.today && !activeNavButtonSpan.parentElement.classList.contains("today")) {
                todaySpan.innerText = (todaySpan.innerText <= 1) ? "" : --todaySpan.innerText;
            }

            if (task.finishDate && !activeNavButtonSpan.parentElement.classList.contains("planed")) {
                planedSpan.innerText = (planedSpan.innerText <= 1) ? "" : --planedSpan.innerText;
            }

            activeNavButtonSpan.innerText = (activeNavButtonSpan.innerText <= 1) ? "" : --activeNavButtonSpan.innerText;

            if (task.listOfTasks && task.listOfTasks.id && (activeNavButtonSpan.parentElement.classList.contains("important") || activeNavButtonSpan.parentElement.classList.contains("today") || activeNavButtonSpan.parentElement.classList.contains("planed"))) {
                const listButton = document.getElementById('list-' + task.listOfTasks.id);
                const listButtonSpan = listButton.querySelector('span');
                listButtonSpan.innerText = (listButtonSpan.innerText <= 1) ? "" : --listButtonSpan.innerText;
            } else if (activeNavButtonSpan.parentElement.classList.contains("important") || activeNavButtonSpan.parentElement.classList.contains("today") || activeNavButtonSpan.parentElement.classList.contains("planed")) {
                tasksSpan.innerText = (tasksSpan.innerText <= 1) ? "" : --tasksSpan.innerText;
            }

            if (completedButton.classList.contains("active"))
                completedSpace.style.maxHeight = completedSpace.scrollHeight + "px";
        }
    });
    shortPanel.append(checkmark);

    const taskName = document.createElement('p');
    taskName.append(task.name);
    if (task.completed) {
        taskName.style.textDecoration = 'line-through';
    }
    taskName.contentEditable = true;
    let shouldTriggerBlur1 = true;
    taskName.addEventListener('blur', () => {
        if (!shouldTriggerBlur1) return;
        const textWithoutChildren = Array.from(taskName.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent)
            .join('');
        setTaskName(task.id, textWithoutChildren);
        //setTaskName(task.id, taskName.textContent);
    });

    taskName.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            const textWithoutChildren = Array.from(taskName.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join('');
            setTaskName(task.id, textWithoutChildren);
            //setTaskName(task.id, taskName.textContent);
            shouldTriggerBlur1 = false;
            taskName.blur();
        }
    });

    taskName.addEventListener('focus', () => {
        shouldTriggerBlur1 = true;
    });

    shortPanel.append(taskName);

    const taskAnnotation = document.createElement('div');
    taskAnnotation.classList.add('annotation');
    taskAnnotation.contentEditable = false;
    if (task.finishDate) {
        /*const taskAnnotationCalendarIcon = document.createElement('i');
        taskAnnotationCalendarIcon.classList.add("fa-regular", "fa-calendar");
        taskAnnotation.append(taskAnnotationCalendarIcon);*/
        taskAnnotation.append(formatDate(new Date(task.finishDate)));
        taskName.style.padding = "5px 0 0 0";
    }
    taskName.append(taskAnnotation);

    const star = document.createElement('i');
    if (task.important === true) {
        star.classList.add("fa-solid", "fa-star");
        star.classList.add('active');
    }
    else {
        star.classList.add("fa-regular", "fa-star");
        star.classList.remove('active');
    }
    star.classList.add("fa-regular", "fa-star");
    star.setAttribute("id", "star");
    star.addEventListener('mouseenter', () => {
        if (!star.classList.contains("active") && window.innerWidth >= 650) {
            star.classList.remove("fa-regular");
            star.classList.add('fa-solid');
        }
    });
    star.addEventListener('mouseleave', () => {
        if (!star.classList.contains("active") && window.innerWidth >= 650) {
            star.classList.remove('fa-solid');
            star.classList.add('fa-regular');
        }
    });
    star.addEventListener('click', () => {
        
        // Якщо кнопка увімкнена і нажмем
        if (star.classList.contains('active')) {
            star.classList.remove('active');
            // Оновлюємо дані на сервері
            setTaskImportant(task.id, false);
            task.important = false;
            if (!task.completed) {
                importantSpan.innerText = (importantSpan.innerText <= 1) ? "" : --importantSpan.innerText;
            }
            
            if (importantButton.classList.contains("active")) 
                container.remove();

            if (task.completed && importantButton.classList.contains("active"))
                completedSpan.innerText = (completedSpan.innerText <= 1) ? "" : --completedSpan.innerText;

            if (!completedSpace.hasChildNodes())
                completedButton.style.display = "none";

            if (window.innerWidth <= 650) {
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            }
                
        }
        else { // Якщо вимкнена
            star.classList.add('active');
            setTaskImportant(task.id, true);
            task.important = true;
            if (!task.completed)
                importantSpan.innerText++;

            if (window.innerWidth <= 650) {
                star.classList.remove("fa-regular");
                star.classList.add('fa-solid');
            }
        }
    });
    shortPanel.append(star);

    const angle = document.createElement('i');
    angle.classList.add("fa-solid", "fa-angle-right");
    angle.setAttribute("id", "angle");
    angle.addEventListener("click", () => {
        // Закриття всіх інших
        const taskContainers = document.querySelectorAll(".container");
        taskContainers.forEach(container1 => {
            const infoPanel1 = container1.querySelector('.info-panel');
            if (infoPanel1.classList.contains('active') && container1 !== container) {
                infoPanel1.style.maxHeight = "0px";
                infoPanel1.classList.remove('active');
                container1.querySelector(".short-panel #angle").style.transform = "rotate(0deg)";
            }
        });
        const infoPanel = container.querySelector('.info-panel');
        if (infoPanel.classList.contains('active')) {
            infoPanel.style.maxHeight = "0px";
            infoPanel.classList.remove('active');
            angle.style.transform = "rotate(0deg)";
            finishDate.classList.remove('active');
            if (calendar) calendar.remove();
        }
        else {
            angle.style.transform = "rotate(90deg)";
            infoPanel.style.maxHeight = infoPanel.scrollHeight + 'px';
            infoPanel.classList.add('active');
            if (completedButton.classList.contains("active"))
                completedSpace.style.maxHeight = completedSpace.scrollHeight + infoPanel.scrollHeight + "px";
        }
    });
    shortPanel.append(angle);

    container.append(shortPanel);
    // -----------

    // Info Panel
    const infoPanel = document.createElement('div');
    infoPanel.classList.add("info-panel");

    const note = document.createElement('p');
    note.classList.add("note");
    const stickyIcon = document.createElement('i');
    stickyIcon.classList.add("fa-regular", "fa-note-sticky");
    note.append(stickyIcon);
    const descriptionTextarea = document.createElement('textarea');
    descriptionTextarea.classList.add("description-input");
    descriptionTextarea.setAttribute('placeholder', 'Додати опис...');
    descriptionTextarea.setAttribute('name', 'description-textarea');
    if (task.description) {
        descriptionTextarea.value = task.description;
        setTimeout(() => {
            descriptionTextarea.style.height = 'auto';
            descriptionTextarea.style.height = (descriptionTextarea.scrollHeight) + 'px';
        }, 10);
    }
    descriptionTextarea.addEventListener('input', () => {
        descriptionTextarea.style.height = 'auto';
        descriptionTextarea.style.height = (descriptionTextarea.scrollHeight) + 'px';
        note.style.maxHeight = (note.scrollHeight + 16) + 'px';
        infoPanel.style.maxHeight = (infoPanel.scrollHeight + 16) + 'px';
    });

    let shouldTriggerBlur = true;

    descriptionTextarea.addEventListener('blur', () => {
        if (shouldTriggerBlur) {
            setTaskDescription(task.id, descriptionTextarea.value);
        }
    });
    descriptionTextarea.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            setTaskDescription(task.id, descriptionTextarea.value);
            shouldTriggerBlur = false; // Змінюємо змінну, щоб не викликати blur
            descriptionTextarea.blur();
        }
    });
    descriptionTextarea.addEventListener('focus', () => {
        shouldTriggerBlur = true; // Повертаємо змінну в початковий стан при фокусуванні
    });
    note.append(descriptionTextarea);
    infoPanel.append(note);

    const today = document.createElement('div');
    today.classList.add('today');
    const todayIcon = document.createElement('i');
    todayIcon.classList.add("fa-solid", "fa-list-check");
    today.append(todayIcon);
    if (task.today === true) {
        today.classList.add('active');
        today.append('Виконати сьогодні');
    }
    else {
        today.append('Додати на сьогодні');
    }

    const removeTodayButton = document.createElement('i');
    removeTodayButton.classList.add('remove', "fa-solid", "fa-xmark");
    today.append(removeTodayButton);

    today.addEventListener('click', () => {
        if (today.classList.contains('active')) {
            today.classList.remove('active');
            today.textContent = "";
            today.append(todayIcon);
            today.append('Додати на сьогодні');
            setTaskToday(task.id, false);
            task.today = false;
            if (!task.completed) todaySpan.innerText = (todaySpan.innerText <= 1) ? "" : --todaySpan.innerText;
            if (activeNavButtonSpan.parentElement.classList.contains('today')) {
                container.remove();
            }
        }
        else {
            today.classList.add('active');
            today.textContent = "";
            today.append(todayIcon);
            today.append('Виконати сьогодні');
            setTaskToday(task.id, true);
            task.today = true;
            if (!task.completed) todaySpan.innerText = ++todaySpan.innerText;
            today.append(removeTodayButton);
        }
    });
    infoPanel.append(today);


    const dates = document.createElement('div');
    dates.classList.add("dates");

    const finishDate = document.createElement('div');
    const calendarIcon = document.createElement('i');
    calendarIcon.classList.add("fa-regular", "fa-calendar");
    finishDate.append(calendarIcon);
    const finishDateSpan = document.createElement('span');
    finishDate.append(finishDateSpan);
    if (task.finishDate) {
        finishDateSpan.append(formatDate(new Date(task.finishDate)));
        finishDate.classList.add('choosed');
    }
    else {
        finishDateSpan.append("Додати дату виконання");
    }

    const removeFinishDateButton = document.createElement('i');
    removeFinishDateButton.classList.add('remove', "fa-solid", "fa-xmark");
    removeFinishDateButton.addEventListener('click', async () => {
        finishDateSpan.textContent = "Додати дату виконання";
        finishDate.classList.remove('choosed'); 
        finishDate.classList.add('active');
        setTimeout(() => { if (calendar) calendar.remove() }, 0);
        task.finishDate = null;
        taskAnnotation.textContent = '';
        taskName.style.padding = "10px 0 10px 0";
        if (!task.completed) planedSpan.innerText = (planedSpan.innerText <= 1) ? "" : --planedSpan.innerText;
        incRequests();
        const response = await fetch(`/tasks/set-finish-date/${task.id}`, {
            method: "PUT",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify("null")
        });
        if (response.ok) decRequests();
    });
    finishDate.append(removeFinishDateButton);

    var calendar;
    finishDate.addEventListener('click', () => {
        if (finishDate.classList.contains('active')) {
            finishDate.classList.remove('active');
            if (calendar) calendar.classList.add('hidden');
            setTimeout(() => { if (calendar) calendar.remove() }, 300);
        }
        else
        {
            finishDate.classList.add('active');
            calendar = createCalendar(finishDate, task, taskName, planedSpan);
            const rect = finishDate.getBoundingClientRect();
            calendar.style.top = rect.bottom + 'px';
            calendar.style.left = rect.left + 'px';
            main.append(calendar);
        }
    });
    dates.append(finishDate);

    const repeatDays = document.createElement('div');
    const repeatIcon = document.createElement('i');
    repeatIcon.classList.add("fa-solid", "fa-repeat");
    repeatDays.append(repeatIcon);
    if (task.daysToRepeat === null || task.daysToRepeat.length === 0) {
        repeatDays.append("Додати повторення");
    }
    else{
        task.daysToRepeat.forEach(day => repeatDays.append(day.name + " "));
    }
    dates.append(repeatDays);

    infoPanel.append(dates);

    if (task.listOfTasks) {
        const listOfTasksName = document.createElement('div');
        listOfTasksName.classList.add("list-of-tasks-name");
        listOfTasksName.append(task.listOfTasks.name);
        infoPanel.append(listOfTasksName);
    }

    const timeSpent = document.createElement('div');
    timeSpent.classList.add("time-spent");

    const timeSpentTitle = document.createElement('div');
    timeSpentTitle.innerHTML = `<i class="fa-regular fa-clock"></i>Витрачений час`;
    timeSpent.append(timeSpentTitle);

    const timeTable = document.createElement('table');
    if (task.wastedTimes) {
        task.wastedTimes.forEach(time => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${time.createDate}</td><td>${time.time}</td>`;
            timeTable.append(tr);
        });
    }
    timeSpent.append(timeTable);

    const addTime = document.createElement('p');
    addTime.innerHTML = `<i class="fa-solid fa-plus"></i>Додати час`;
    timeSpent.append(addTime);

    //infoPanel.append(timeSpent);/////////////////

    const footer = document.createElement('div');
    footer.classList.add("footer");

    const createDateTime = new Date(task.createDate);
    const day = createDateTime.getDate().toString().padStart(2, '0');
    const month = (createDateTime.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because months are zero-based
    const create = document.createElement('p');
    create.classList.add("create");
    create.textContent = `Cтворено ${day}.${month}`;
    footer.append(create);

    const trashCan = document.createElement('i');
    trashCan.classList.add("fa-regular", "fa-trash-can", "delete");
    const deleteMessage = document.createElement('div');
    deleteMessage.classList.add('delete-message');
    deleteMessage.append("Впевнені?");
    footer.append(deleteMessage);
    trashCan.addEventListener('click', async () => {
        if (!trashCan.classList.contains('active')) {
            trashCan.classList.add('active');
            trashCan.style.color = "red";
            deleteMessage.style.maxWidth = deleteMessage.scrollWidth + 'px';
            setTimeout(() => {
                trashCan.classList.remove('active');
                deleteMessage.style.maxWidth = '0px';
                trashCan.style.color = "var(--conteiner-footer-text)";
            }, 5000);
        }
        else {
            incRequests();
            container.remove();

            const response = await fetch(`/tasks/${task.id}`, {
                method: "DELETE",
                headers: { "Accept": "application/json" }
            });
            if (response.ok) decRequests();
            

            if (task.completed) {
                completedSpan.innerText = --completedSpan.innerText;
                if (completedSpan.innerText == 0) {
                    completedButton.style.display = "none";
                }
                return;
            }

            if (task.finishDate && !activeNavButtonSpan.parentElement.classList.contains("planed")) {
                planedSpan.innerText = (planedSpan.innerText <= 1) ? "" : --planedSpan.innerText;
            }

            if (task.today && !activeNavButtonSpan.parentElement.classList.contains("today")) {
                todaySpan.innerText = (todaySpan.innerText <= 1) ? "" : --todaySpan.innerText;
            }

            if (task.important && !activeNavButtonSpan.parentElement.classList.contains("important")) {
                importantSpan.innerText = (importantSpan.innerText <= 1) ? "" : --importantSpan.innerText;
            }

            activeNavButtonSpan.innerText = (activeNavButtonSpan.innerText <= 1) ? "" : --activeNavButtonSpan.innerText;

            if (task.listOfTasks && task.listOfTasks.id && activeNavButtonSpan.parentElement.classList.contains("important")) {
                const listButton = document.getElementById('list-' + task.listOfTasks.id);
                const listButtonSpan = listButton.querySelector('span');
                listButtonSpan.innerText = (listButtonSpan.innerText <= 1) ? "" : --listButtonSpan.innerText;
            } else if (activeNavButtonSpan.parentElement.classList.contains("important") || activeNavButtonSpan.parentElement.classList.contains("planed") || activeNavButtonSpan.parentElement.classList.contains("today")) {
                tasksSpan.innerText = (tasksSpan.innerText <= 1) ? "" : --tasksSpan.innerText;
            }
            
        }
    });
    footer.append(trashCan);

    infoPanel.append(footer);

    container.append(infoPanel);
    return container;
}

/**
 * Асинхронний метод, який робить PUT-запит на сервер, де встановлює важливість завдання.
 * @param {number} id Ідентифікатор завдання.
 * @param {boolean} importantBool Важливе завдання чи ні.
 */
async function setTaskImportant(id, importantBool) {
    incRequests();
    const response = await fetch(`/tasks/set-important`, {
        method: "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id,
            important: importantBool
        })
    });
    if (response.ok) {
        decRequests();
    }
}

/**
 * Метод, який робить PUT-запит на сервер, де встановлює властивість "Виконане" у завдання.
 * @param {number} id Ідентифікатор завдання.
 * @param {boolean} completedBool Чи завдання виконане.
 */
async function setTaskCompleted(id, completedBool) {
    incRequests();
    const response = await fetch("/tasks/set-completed", {
        method: "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id,
            completed: completedBool
        })
    });
    if (response.ok) {
        decRequests();
    }
}

async function setTaskDescription(id, text) {
    incRequests();
    const response = await fetch("/tasks/set-description", {
        method: "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id,
            description: text
        })
    });
    if (response.ok) {
        decRequests();
    }
}

async function setTaskName(id, text) {
    incRequests();
    const response = await fetch("/tasks/set-name", {
        method: "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id,
            name: text
        })
    });
    if (response.ok) {
        decRequests();
    }
}

async function setTaskToday(id, todayBool) {
    incRequests();
    const response = await fetch("/tasks/set-today", {
        method: "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id,
            today: todayBool
        })
    });
    if (response.ok) {
        decRequests();
    }
}

// Calendar //
function createCalendar(finishDate, task, taskName, planedSpan) {
    const calendar = document.createElement('div');
    calendar.classList.add('calendar');
    calendar.classList.add('calendar', 'hidden');

    setTimeout(() => {
        calendar.classList.remove('hidden');
    }, 0);
    // Header
    const header = document.createElement('div');
    header.classList.add('header');

    const leftButton = createCalendarButton('<i class="fa-solid fa-angle-left"></i>');
    const monthLabel = document.createElement('h3');
    monthLabel.classList.add('month');
    const rightButton = createCalendarButton('<i class="fa-solid fa-angle-right"></i>');

    header.append(leftButton, monthLabel, rightButton);
    calendar.append(header);

    // Body
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    tbody.classList.add('body');

    // Weekday names
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const weekdayRow = createTableRow(weekdays.map(createTableHeader));
    thead.appendChild(weekdayRow);
    table.append(thead, tbody);
    calendar.append(table);

    // Initial rendering
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    renderCalendar(calendar, monthLabel, tbody, currentMonth, currentYear, finishDate, task, taskName, planedSpan);

    // Event listeners
    leftButton.addEventListener('click', () => {
        currentMonth = (currentMonth - 1 + 12) % 12;
        if (currentMonth === 11) {
            currentYear--;
        }
        renderCalendar(calendar, monthLabel, tbody, currentMonth, currentYear, finishDate, task, taskName, planedSpan);
    });

    rightButton.addEventListener('click', () => {
        currentMonth = (currentMonth + 1) % 12;
        if (currentMonth === 0) {
            currentYear++;
        }
        renderCalendar(calendar, monthLabel, tbody, currentMonth, currentYear, finishDate, task, taskName, planedSpan);
    });

    return calendar;
}

function createCalendarButton(text) {
    const button = document.createElement('button');
    button.innerHTML = text;
    return button;
}

function createTableHeader(text) {
    const th = document.createElement('th');
    th.textContent = text;
    return th;
}

function createTableRow(cells) {
    const tr = document.createElement('tr');
    cells.forEach(cell => tr.appendChild(cell));
    return tr;
}

function renderCalendar(calendar, monthLabel, tbody, currentMonth, currentYear, finishDate, task, taskName, planedSpan) {
    const MONTHS = [
        "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
    ];

    const today = new Date();
    const currentMonthDate = new Date(currentYear, currentMonth, 1);
    const firstDay = currentMonthDate.getDay();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    monthLabel.innerText = `${MONTHS[currentMonth]}, ${currentYear}`;

    tbody.innerHTML = "";
    let date = 1;

    for (let i = 0; date <= lastDay; i++) {
        const row = document.createElement('tr');

        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');

            if ((i === 0 && j < (firstDay + 6) % 7) || date > lastDay) {
                cell.classList.add('empty');
            } else {
                const cellDate = new Date(currentYear, currentMonth, date);
                cellDate.setHours(23, 59, 59, 0);
                cell.textContent = date;

                // Check if the cell date is today
                if (
                    today.getFullYear() === currentYear &&
                    today.getMonth() === currentMonth &&
                    today.getDate() === date
                ) {
                    cell.classList.add('today');
                }

                if (task.finishDate) {
                    let finishDate = new Date(task.finishDate);
                    if (finishDate.getFullYear() === currentYear &&
                        finishDate.getMonth() === currentMonth &&
                        finishDate.getDate() === date)
                    {
                        cell.classList.add('choosed');
                    }
                }

                cell.addEventListener('click',async () => {
                    calendar.classList.add('hidden');
                    setTimeout(() => calendar.remove(), 300);
                    finishDate.classList.remove('active');
                    finishDate.querySelector('span').textContent = formatDate(cellDate);
                    finishDate.classList.add('choosed');
                    if (!task.finishDate && !task.completed) planedSpan.innerText = ++planedSpan.innerText;
                    task.finishDate = cellDate;
                    taskName.style.padding = "5px 0 0 0";
                    taskName.querySelector('.annotation').textContent = formatDate(cellDate);

                    incRequests();
                    const response = await fetch(`/tasks/set-finish-date/${task.id}`, {
                        method: "PUT", 
                        headers: { "Accept": "application/json", "Content-Type": "application/json" },
                        body: JSON.stringify(cellDate.getDate() + "." + (cellDate.getMonth() + 1) + "." + cellDate.getFullYear())
                    });
                    if (response.ok) {
                        decRequests();
                    }
                });

                date++;
            }

            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }
}

function formatDate(date) {
    const options = {
        weekday: 'long',
        //year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const formattedDate = date.toLocaleDateString('uk-UA', options);

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}