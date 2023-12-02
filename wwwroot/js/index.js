
import { tasksPage } from "./tasksPage.js";
import { setUserLists, setUser } from "./navigation.js"
import { importantPage } from "./importantPage.js"
import { isAuthenticated, openLoginPanel } from "./authentication.js"
import { todayPage } from "./todayPage.js"
import { planedPage } from "./planedPage.js"

const navPanel = document.querySelector('nav');

/**Метод, який виконуватиметься при завантажені сторінки з авторизованим користувачем.*/
export function doOnLoad() {
    setUser();
    todayPage();
    setUserLists();
}

let activeRequests = 0;
/**Додає кількість запитів. Для відображення індикатора завантаження.*/
export function incRequests() {
    activeRequests++;
    updateLoadingIndicator();
}

/**Віднімає кількість запитів. Для відображення індикатора завантаження.*/
export function decRequests() {
    activeRequests--;
    updateLoadingIndicator();
}

function updateLoadingIndicator() {
    // Перевірте, чи є активні запити
    if (activeRequests > 0) {
        document.getElementById('loadIcon').style.display = 'block';
    } else {
        document.getElementById('loadIcon').style.display = 'none';
    }
}

// Обробка навігаційних клавіш
document.querySelector('.today').addEventListener('click', () => {
    todayPage();
    if (window.innerWidth <= 650) navPanel.classList.remove('open');
});

document.querySelector('.planed').addEventListener('click', () => {
    planedPage();
    if (window.innerWidth <= 650) navPanel.classList.remove('open');
});

document.querySelector('.important').addEventListener('click', () => {
    importantPage();
    if (window.innerWidth <= 650) navPanel.classList.remove('open');
});

document.querySelector('.tasks').addEventListener('click', () => {
    tasksPage();
    if (window.innerWidth <= 650) navPanel.classList.remove('open');
});
// ---------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Встановлення сторінки яка відображиться першою.
   
    if (isAuthenticated() === true) {
        doOnLoad();
    } else {
        openLoginPanel();
    }
});

