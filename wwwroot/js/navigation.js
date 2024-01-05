import { userListOfTasks } from "./listOfTasks.js"
import { openLoginPanel } from './authentication.js'
import { decRequests, incRequests } from "./index.js"

const navPanel = document.querySelector('nav');
const blurBackground = document.querySelector('.blur-background');
const logoutPanel = blurBackground.querySelector('.logout-panel');
const accountPropertiesButton = document.getElementById("accountPropertiesButton");
const accountPropertiesPanel = document.querySelector('nav .account-properties');
accountPropertiesButton.addEventListener("click", () => accoutPropertiesMenu());

const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => logout());

const addListButton = document.getElementById('addListButton');
addListButton.addEventListener('click', () => addList());
// Кнопки навігаційної панелі
document.querySelectorAll('nav ul li').forEach(button => button.addEventListener("click", function () {
    document.querySelectorAll('nav ul li').forEach(button1 => button1.classList.remove("active"));
    button.classList.add("active");
}));

const root = document.documentElement;
// Встановлення теми на основі кук.
if (root.classList.contains("dark-theme") && Cookies.get("theme") === "light-theme") {
    switchThemes();
}

/**
 * Створює клавішу для посилання на власний список.
 * @param {any} list Інформація про список завдань.
 * @returns Навігаційна клавіша власного списку.
 */
function listOfTasksButton(list) {
    const listButton = document.createElement("li");
    listButton.classList.add('user-list-button');
    listButton.setAttribute('id', "list-" + list.id);

    const name = document.createElement('p');
    name.append(list.name);
    listButton.append(name);

    listButton.addEventListener("click", () => {
        if (window.innerWidth <= 600) {
            navPanel.classList.remove('open');
        }
        document.querySelectorAll('nav ul li').forEach(button => {
            button.classList.remove('active');
        });
        listButton.classList.add("active");
        // Завантажуєм завдання з цього списку.
        userListOfTasks(list);
    });

    // для кількості завдань
    const span = document.createElement("span");
    listButton.append(span);
    return listButton;
}

/** Метод створення навігаційних клавіш для списків користувача. */
export async function setUserLists() {
    incRequests();
    const response = await fetch("/lists-of-tasks", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const listsOfTasks = await response.json();
        const listsContainer = document.getElementById('userLists');
        listsContainer.textContent = '';
        listsOfTasks.forEach(list => {
            listsContainer.append(listOfTasksButton(list));
            Cookies.set('list-' + list.id + 'PhotoPath', list.background);
        });
        decRequests(); 
        countsOfTasksForNav();
    }
}


/** Метод, який встановлює кількість завдань для навігаційних клавіш. */
export async function countsOfTasksForNav() {
    incRequests();
    const response = await fetch('/tasks/counts', {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok) {
        decRequests();
        const counts = await response.json();

        const todayButton = document.querySelector('nav ul .today');
        const planedButton = document.querySelector('nav ul .planed');
        const importantButton = document.querySelector('nav ul .important');
        const tasksButton = document.querySelector('nav ul .tasks');

        todayButton.querySelector("span").innerText = counts.today === 0 ? "" : counts.today;
        planedButton.querySelector("span").innerText = counts.planed === 0 ? "" : counts.planed;
        importantButton.querySelector('span').innerText = counts.important === 0 ? "" : counts.important;
        tasksButton.querySelector('span').innerText = counts.tasks === 0 ? "" : counts.tasks;

        counts.countsList.forEach(list => {
            const listButton = document.getElementById('list-' + list.id);
            listButton.querySelector('span').innerText = list.count === 0 ? "" : list.count;
        });
    }
}

/** Метод, який отримує та встановлює ім'я поточного користувача.*/
export async function setUser() {
    incRequests();
    const response = await fetch('/user', {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const user = await response.json();
        const nameElement = document.getElementById('userNameField');
        nameElement.innerText = user.name + " " + user.surname;
        Cookies.set('todayPhotoPath', user.todayBackground);
        Cookies.set('planedPhotoPath', user.planedBackground);
        Cookies.set('importantPhotoPath', user.importantBackground);
        Cookies.set('tasksPhotoPath', user.tasksBackground);
        const main = document.querySelector("main");
        main.style.backgroundImage = `url("/photos/${Cookies.get('todayPhotoPath')}"`;
        decRequests();
    }
}

/** Вихід з аккаунту. */
function logout() {
    blurBackground.style.zIndex = 2;
    blurBackground.style.opacity = 1;

    logoutPanel.style.display = "flex";
    logoutPanel.querySelector('.yes').addEventListener('click', async () => {
        incRequests();
        const response = await fetch('/user/logout');

        if (response.ok) {
            decRequests();
            logoutPanel.style.display = "none";
            openLoginPanel();
        }
    });
    logoutPanel.querySelector('.no').addEventListener('click', () => {
        blurBackground.style.opacity = 0;
        setTimeout(() => {
            blurBackground.style.zIndex = -1;
            logoutPanel.style = "none";
        }, 500);
    });

    accountPropertiesButton.classList.remove("active");
    accountPropertiesPanel.style.maxHeight = "0px";
}

function accoutPropertiesMenu() {
    if (accountPropertiesButton.classList.contains("active")) {
        accountPropertiesButton.classList.remove("active");
        accountPropertiesPanel.style.maxHeight = "0px";
    }
    else {
        accountPropertiesButton.classList.add("active");
        accountPropertiesPanel.style.maxHeight = accountPropertiesPanel.scrollHeight + "px";
    }
}

/** Додати список завдань користувача. */
async function addList() {
    incRequests();
    const response = await fetch('/lists-of-tasks', {
        method: "POST",
        headersL: {"Accept" : "application/json"}
    })
    if (!response.ok) return;

    decRequests();
    const list = await response.json();
    const listsContainer = document.getElementById('userLists');
    listsContainer.append(listOfTasksButton(list));
    Cookies.set('list-' + list.id + 'PhotoPath', list.background);
}

const themeButton = document.getElementById('theme-button');

/** Метод який переключає теми.*/
export function switchThemes() {
    root.classList.toggle('dark-theme');
    root.classList.toggle('light-theme');
    themeButton.classList.toggle('fa-sun');
    themeButton.classList.toggle('fa-moon');
    Cookies.set('theme', root.classList.contains("dark-theme") ? "dark-theme" : "light-theme");
}

// Натиснувши на клавішу тем, переключиться тема.
themeButton.addEventListener('click', () => {
    switchThemes();
});