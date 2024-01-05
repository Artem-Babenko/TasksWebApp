import { doOnLoad } from "./index.js"
import { decRequests, incRequests } from "./index.js"

/** Перевірка, користувач авторизований чи ні.*/
export function isAuthenticated() {
    if (Cookies.get("AuthenticationCookie")) {
        return true;
    } else {
        return false;
    }
}

const loginLink = document.getElementById('loginLink');
loginLink.addEventListener("click", () => openLoginPanel());
const registrationLink = document.getElementById("registrationLink");
registrationLink.addEventListener("click", () => openRegistationPanel());

const blurBackground = document.querySelector('.blur-background');
const loginPanel = blurBackground.querySelector('.login-panel');
const registrationPanel = blurBackground.querySelector('.registration-panel');

const loginButton = loginPanel.querySelector('button');
loginButton.addEventListener('click', () => login());
const registrationButton = registrationPanel.querySelector('button');
registrationButton.addEventListener('click', () => registration());

/**Відриває панель входу.*/
export function openLoginPanel() {
    blurBackground.style.zIndex = 2;
    blurBackground.style.opacity = 1;

    loginPanel.style.display = "flex";
    registrationPanel.style.display = "none";

    loginPanel.querySelectorAll('input').forEach(input => {
        input.value = "";
        input.style.outline = "";
    });
    loginPanel.querySelector('.error').style.display = "none";
}

/** Відкриває панель реєстрації.*/
export function openRegistationPanel() {
    blurBackground.style.zIndex = 2;
    blurBackground.style.opacity = 1;

    loginPanel.style.display = "none";
    registrationPanel.style.display = "flex";

    registrationPanel.querySelectorAll('input').forEach(input => {
        input.value = "";
        input.style.outline = "";
    });
    registrationPanel.querySelector('.error').style.display = "none";
}

/** Запит на вхід та перевірка даних. */
async function login() {
    const loginInput = loginPanel.querySelector('.login');
    offOutLine(loginInput);
    const passwordInput = loginPanel.querySelector('.password');
    offOutLine(passwordInput);
    const error = loginPanel.querySelector('.error');
    const login = loginInput.value;
    const password = passwordInput.value;

    if (!login && !password) {
        error.style.display = "block";
        error.textContent = "Невведений логін та пароль!";
        loginInput.style.outline = "2px red solid";
        passwordInput.style.outline = "2px red solid";
        return;
    }
    else if (!login) {
        error.style.display = "block";
        error.textContent = "Невведений логін!";
        loginInput.style.outline = "2px red solid";
        passwordInput.style.outline = "none";
        return;
    }
    else if (!password) {
        error.style.display = "block";
        error.textContent = "Невведений пароль!";
        loginInput.style.outline = "none";
        passwordInput.style.outline = "2px red solid";
        return;
    }

    error.textContent = "";
    error.style.display = "none";

    incRequests();
    const response = await fetch('/user/login', {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            login: login.trim(),
            password: password.trim()
        })
    });
    
    const status = response.status;
    if (status == 404) {
        error.style.display = "block";
        error.textContent = "Невірний логін або пароль!";
        loginInput.style.outline = "2px red solid";
        passwordInput.style.outline = "2px red solid";
        passwordInput.value = "";
        decRequests();
    }
    else if (status == 200) {
        blurBackground.style.opacity = 0;
        loginInput.style.outline = "none";
        passwordInput.style.outline = "none";
        doOnLoad();
        setTimeout(() => {
            blurBackground.style.zIndex = -1;
            loginPanel.style = "none";
        }, 500);
        decRequests();
    }
}

/** Запит на реєстрацію та перевірка даних. */
async function registration() {
    const nameInput = registrationPanel.querySelector('.name');
    offOutLine(nameInput);
    const surnameInput = registrationPanel.querySelector('.surname');
    offOutLine(surnameInput);
    const loginInput = registrationPanel.querySelector('.login');
    offOutLine(loginInput);
    const passwordFirstInput = registrationPanel.querySelector('.password1');
    offOutLine(passwordFirstInput);
    const passwordSecondInput = registrationPanel.querySelector('.password2');
    offOutLine(passwordSecondInput);
    const error = registrationPanel.querySelector('.error');


    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const login = loginInput.value.trim();
    const passwordFirst = passwordFirstInput.value.trim();
    const passwordSecond = passwordSecondInput.value.trim();

    const inputs = [nameInput, surnameInput, loginInput, passwordFirstInput, passwordSecondInput];
    let isValid = true;
    for (const input of inputs) {
        // Скинути попередні стилі та повідомлення про помилку
        input.style.outline = "none";
    }

    // Перевірка для кожного поля
    for (const input of inputs) {
        if (!input.value) {
            input.style.outline = "2px solid red";
            isValid = false;
        }
    }
    if (!isValid) {
        error.style.display = "block";
        error.textContent = "Не всі дані введені!";
        return;
    }

    if (!isEnglishLetters(login)) {
        error.style.display = "block";
        error.textContent = "Логін має не дозволені символи!";
        loginInput.style.outline = "2px red solid";
        return;
    }

    if (login.length < 8) {
        error.style.display = "block";
        error.textContent = "Логін має менше 8 символів!";
        loginInput.style.outline = "2px red solid";
        return;
    }
    
    if (passwordFirst.length < 8) {
        error.style.display = "block";
        error.textContent = "Пароль має менше 8 символів!";
        passwordFirstInput.style.outline = "2px red solid";
        passwordSecondInput.style.outline = "2px red solid";
        return;
    }

    if (passwordFirst !== passwordSecond) {
        error.style.maxHeight = "block";
        error.textContent = "Паролі не співпали!";
        passwordFirstInput.style.outline = "2px red solid";
        passwordSecondInput.style.outline = "2px red solid";
        return;
    }

    error.style.display = "none";

    incRequests();
    const response = await fetch("/user/registration", {
        method: "POST", 
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            surname: surname,
            login: login,
            password: passwordSecond
        })
    })

    const status = response.status;
    if (status === 400) {
        decRequests();
    }
    else if (status === 200) {
        blurBackground.style.opacity = 0;
        for (const input of inputs) {
            input.style.outline = "none";
        }
        doOnLoad();
        setTimeout(() => {
            blurBackground.style.zIndex = -1;
            registrationPanel.style = "none";
        }, 500);
        decRequests();
    }
}

/** Повертає true, якщо використані тільки доступні символи. */
function isEnglishLetters(input) {
    const englishLettersRegex = /^[a-zA-Z0-9_.]+$/;
    return englishLettersRegex.test(input);
}

/** Вимкнення outline на елементі input. */
function offOutLine(inputElement) {
    inputElement.addEventListener('input', () => inputElement.style.outline = "none");
}