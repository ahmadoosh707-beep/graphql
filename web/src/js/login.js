import { createLoginMarkup } from "../static/templates/login.js";
import { initHome } from "./home.js";
import { starControl } from "../static/templates/stars.js";
import { blackHoleTransition } from "../static/helpers/starsHelper.js";
import { login } from "../../../server/login.js";
import { checkToken } from "../helpers/tokenValidation.js";

export function initLogin() {
    initializeLoginForm();
}

function initializeLoginForm() {
    const app = document.getElementById("app");
    if (!app) return Promise.reject(new Error("App element not found"));

    const isValid = checkToken();
    if (isValid == "ok") {
        initHome();
        return;
    }

    app.innerHTML = createLoginMarkup();
    starControl.start();
    const form = document.getElementById("login-form");
    const status = document.getElementById("login-status");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const identifier = document.getElementById("identifier").value.trim();
        const password = document.getElementById("password").value.trim();

        // 1. Always look up the element at the moment of submission
        const errorDiv = document.querySelector('.error-container');
        const status = document.getElementById("login-status");

        // 2. Clear old messages and hide the container immediately on re-submission
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.hidden = true;
        }
        if (status) {
            status.textContent = '';
        }

        try {
            const res = await login(identifier, password);

            // Handle bad credentials cleanly without throwing a hard error
            if (res === "Invalid credentials") {
                if (errorDiv) {
                    errorDiv.textContent = 'Email/Username or password are wrong. Please try again.';
                    errorDiv.hidden = false;
                }
                return;
            }

            // Handle unexpected server responses
            if (res !== "ok") {
                console.error('Login failed. Received:', res);
                throw new Error('Unexpected server response');
            }

            // Success path
            await blackHoleTransition();
            initHome();

        } catch (err) {
            console.error("Login process broken:", err);
            if (status) {
                status.textContent = "Login failed: " + err.message;
            }
        }
    });

}

